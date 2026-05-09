"""
Auth router — JWT-based login/register/me
Users stored in a local JSON file (users.json) for persistence without a database.
"""
import json
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

import boto3
import random
from models.schemas import LoginRequest, RegisterRequest, AWSLoginRequest, TokenResponse, UserOut, SendOtpRequest
from utils.mailer import send_email

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ─── Config ───────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("JWT_SECRET", "nexaglint-super-secret-key-change-in-prod-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
USERS_FILE = os.path.join(os.path.dirname(__file__), "..", "users.json")

pwd_ctx = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

_otp_cache = {}

# ─── User store (JSON file) ───────────────────────────────────────────────────
def _load_users() -> dict:
    if not os.path.exists(USERS_FILE):
        # Seed a default demo user
        default = {
            "demo@nexaglint.io": {
                "id": str(uuid.uuid4()),
                "email": "demo@nexaglint.io",
                "name": "Demo User",
                "hashed_password": pwd_ctx.hash("nexaglint123"),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        }
        _save_users(default)
        return default
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def _save_users(users: dict) -> None:
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

# ─── JWT helpers ─────────────────────────────────────────────────────────────
def _create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ─── Dependency — get current user ───────────────────────────────────────────
def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    payload = _decode_token(token)
    email: str = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    users = _load_users()
    user = users.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return UserOut(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        created_at=user["created_at"],
    )

# ─── Routes ───────────────────────────────────────────────────────────────────
@router.post("/send-otp")
def send_otp(body: SendOtpRequest):
    otp_code = str(random.randint(100000, 999999))
    _otp_cache[body.email] = otp_code
    
    subject = "Verify your NexaGlint Account"
    message = (
        f"Welcome to NexaGlint!\n\n"
        f"Your 6-digit verification code is:\n\n"
        f"{otp_code}\n\n"
        f"Enter this code on the sign-up page to confirm your account.\n\n"
        f"This code expires in 10 minutes. If you didn't request this, ignore this email."
    )
    preview_url = send_email(body.email, subject, message)
    
    return {"status": "ok", "preview_url": preview_url}

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest):
    # Verify OTP
    stored_otp = _otp_cache.get(body.email)
    if not stored_otp or stored_otp != body.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
    users = _load_users()
    if body.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    users[body.email] = {
        "id": user_id,
        "email": body.email,
        "name": body.name or body.email.split("@")[0],
        "hashed_password": pwd_ctx.hash(body.password),
        "created_at": now,
    }
    _save_users(users)
    
    # Remove OTP from cache
    _otp_cache.pop(body.email, None)
    
    # Send Welcome Email
    send_email(body.email, "Welcome to NexaGlint!", f"Hi {users[body.email]['name']},\n\nYour account has been successfully created. You can now analyze your Lakehouse tables in real-time.")

    user_out = UserOut(id=user_id, email=body.email, name=users[body.email]["name"], created_at=now)
    token = _create_token({"sub": body.email})
    return TokenResponse(access_token=token, user=user_out)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    users = _load_users()
    user = users.get(body.email)
    if not user or not pwd_ctx.verify(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Send login alert
    send_email(body.email, "New Login to NexaGlint", f"Hi {user['name']},\n\nWe detected a new login to your NexaGlint account at {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}.\n\nIf this wasn't you, please reset your password immediately.")

    user_out = UserOut(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        created_at=user["created_at"],
    )
    token = _create_token({"sub": body.email})
    return TokenResponse(access_token=token, user=user_out)


@router.post("/aws-login", response_model=TokenResponse)
def aws_login(body: AWSLoginRequest):
    """
    Login using AWS credentials. Validates via STS and creates a 'Cloud User'.
    """
    try:
        sts = boto3.client(
            "sts",
            aws_access_key_id=body.aws_access_key_id,
            aws_secret_access_key=body.aws_secret_access_key,
            region_name=body.aws_region
        )
        identity = sts.get_caller_identity()
        arn = identity["Arn"]
        account = identity["Account"]
        user_id = identity["UserId"]
        
        # Create a virtual user based on AWS identity
        email = f"{user_id}@{account}.aws"
        name = arn.split("/")[-1]
        
        users = _load_users()
        if email not in users:
            users[email] = {
                "id": str(uuid.uuid4()),
                "email": email,
                "name": f"AWS: {name}",
                "hashed_password": "EXTERNAL_AUTH_NO_PASSWORD",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            _save_users(users)
        
        user = users[email]
        user_out = UserOut(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"],
        )
        token = _create_token({"sub": email})
        return TokenResponse(access_token=token, user=user_out)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"AWS Authentication failed: {str(e)}",
        )


@router.get("/me", response_model=UserOut)
def me(current_user: UserOut = Depends(get_current_user)):
    return current_user
