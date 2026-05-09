"""
S3 / object store filesystem factory.
Returns an fsspec-compatible filesystem for the given credentials.
"""
import logging
from typing import Optional
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def get_filesystem(
    path: str,
    aws_access_key_id: Optional[str] = None,
    aws_secret_access_key: Optional[str] = None,
    aws_region: Optional[str] = "us-east-1",
    endpoint_url: Optional[str] = None,
):
    """
    Returns an fsspec filesystem appropriate for the given path.
    Raises on connection failure so callers can fall back to mock data.
    """
    import fsspec

    if path.startswith("s3://") or path.startswith("s3a://"):
        kwargs = {
            "key": aws_access_key_id,
            "secret": aws_secret_access_key,
            "client_kwargs": {"region_name": aws_region},
        }
        if endpoint_url:
            kwargs["client_kwargs"]["endpoint_url"] = endpoint_url
        if not aws_access_key_id:
            # Try anonymous / instance profile
            kwargs["anon"] = False
        fs = fsspec.filesystem("s3", **{k: v for k, v in kwargs.items() if v is not None})
        # Test connectivity
        fs.ls(path.rstrip("/"))
        return fs

    elif path.startswith("abfs://") or path.startswith("abfss://"):
        import adlfs
        fs = adlfs.AzureBlobFileSystem(
            account_name=aws_access_key_id,
            sas_token=aws_secret_access_key,
        )
        fs.ls(path.rstrip("/"))
        return fs

    elif path.startswith("gs://"):
        import gcsfs
        fs = gcsfs.GCSFileSystem()
        fs.ls(path.rstrip("/"))
        return fs

    elif path.startswith("http://") or path.startswith("https://"):
        # MinIO via s3 protocol
        import s3fs
        fs = s3fs.S3FileSystem(
            key=aws_access_key_id or "minioadmin",
            secret=aws_secret_access_key or "minioadmin",
            client_kwargs={"endpoint_url": endpoint_url or path.rsplit("/", 2)[0]},
        )
        fs.ls("/")
        return fs

    else:
        # Local filesystem for testing
        return fsspec.filesystem("file")


def list_s3_buckets(
    key: str,
    secret: str,
    region: str = "us-east-1",
) -> list[str]:
    """List all S3 buckets available to the given IAM credentials."""
    import boto3
    s3 = boto3.client(
        "s3",
        aws_access_key_id=key,
        aws_secret_access_key=secret,
        region_name=region
    )
    res = s3.list_buckets()
    return [b["Name"] for b in res.get("Buckets", [])]


def check_iam_health(
    key: str,
    secret: str,
    region: str = "us-east-1",
) -> dict:
    """Validate IAM user status and common permissions."""
    import boto3
    from botocore.exceptions import ClientError

    iam = boto3.client(
        "iam",
        aws_access_key_id=key,
        aws_secret_access_key=secret,
        region_name=region
    )
    sts = boto3.client(
        "sts",
        aws_access_key_id=key,
        aws_secret_access_key=secret,
        region_name=region
    )
    
    try:
        identity = sts.get_caller_identity()
        user_info = iam.get_user()
        return {
            "status": "healthy",
            "arn": identity["Arn"],
            "userId": identity["UserId"],
            "userName": user_info["User"]["UserName"],
            "createdAt": user_info["User"]["CreateDate"].isoformat(),
        }
    except ClientError as e:
        # Fallback if iam:GetUser is not allowed
        if "identity" in locals():
            return {
                "status": "partial",
                "arn": identity["Arn"],
                "userId": identity["UserId"],
                "note": "Limited IAM visibility (iam:GetUser denied)"
            }
        return {"status": "error", "error": str(e)}


