from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any, Dict, Literal

# ─── Auth ─────────────────────────────────────────────────────────────────────
class SendOtpRequest(BaseModel):
    email: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AWSLoginRequest(BaseModel):
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: Optional[str] = "us-east-1"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

# ─── Table Schema ─────────────────────────────────────────────────────────────
class ColumnSchema(BaseModel):
    name: str
    type: str
    nullable: bool
    partition: Optional[bool] = False

class SnapshotOut(BaseModel):
    id: str
    ts: str
    op: Literal["append", "overwrite", "delete"]
    rows: int
    sizeBytes: int
    summary: str

class MetricPoint(BaseModel):
    date: str
    rows: int
    sizeMB: float
    files: int

class TableOut(BaseModel):
    id: str
    name: str
    format: Literal["Iceberg", "Delta", "Hudi", "Parquet"]
    rows: int
    sizeBytes: int
    updatedAt: str
    location: str
    partitions: List[str]
    schema: List[ColumnSchema]
    properties: Dict[str, Any]
    snapshots: List[SnapshotOut]
    metrics: List[MetricPoint]
    sample: List[Dict[str, Any]]

class TableSummary(BaseModel):
    id: str
    name: str
    format: Literal["Iceberg", "Delta", "Hudi", "Parquet"]
    rows: int
    sizeBytes: int
    updatedAt: str
    location: str
    partitions: List[str]

# ─── Scan ─────────────────────────────────────────────────────────────────────
class ScanRequest(BaseModel):
    path: str
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: Optional[str] = "us-east-1"
    endpoint_url: Optional[str] = None   # for MinIO
    account_name: Optional[str] = None   # for Azure
    sas_token: Optional[str] = None      # for Azure

class ScanResponse(BaseModel):
    tables: List[TableSummary]
    discovered: int
    durationMs: float
    path: str

# ─── Query ───────────────────────────────────────────────────────────────────
class QueryRequest(BaseModel):
    sql: str
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: Optional[str] = "us-east-1"
    endpoint_url: Optional[str] = None

class QueryResponse(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    durationMs: float

# ─── Watch ────────────────────────────────────────────────────────────────────
class WatchRequest(BaseModel):
    table_id: str

class AlertOut(BaseModel):
    id: str
    tableId: str
    tableName: str
    type: Literal["schema_change", "new_snapshot", "row_drop", "new_table"]
    message: str
    timestamp: str
    read: bool

# ─── Stats ────────────────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    totalTables: int
    totalRows: int
    totalSize: int
    formats: List[str]
    recentActivity: List[Dict[str, Any]] = []
