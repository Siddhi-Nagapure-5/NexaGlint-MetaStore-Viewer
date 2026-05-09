"""
Tables router — list, get, scan endpoints.
All endpoints require JWT auth.
"""
import time
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query

from models.schemas import TableOut, TableSummary, ScanRequest, ScanResponse, QueryRequest, QueryResponse, DashboardStats, WatchRequest, AlertOut
import duckdb
import uuid
from routers.auth import get_current_user, UserOut
from parsers.detector import discover_tables
from parsers.iceberg import parse_iceberg
from parsers.delta import parse_delta
from parsers.hudi import parse_hudi
from parsers.parquet import parse_parquet
from storage.s3_client import get_filesystem, list_s3_buckets, check_iam_health

router = APIRouter(prefix="/api", tags=["tables"])
logger = logging.getLogger(__name__)

# ─── In-memory table cache (per session) ─────────────────────────────────────
# In production: use Redis or a proper cache
_table_cache: dict[str, dict] = {}


def _parse_table(path: str, fmt: str, fs) -> dict:
    """Dispatch to the correct parser by format."""
    try:
        if fmt == "Iceberg":
            return parse_iceberg(path, fs)
        elif fmt == "Delta":
            return parse_delta(path, fs)
        elif fmt == "Hudi":
            return parse_hudi(path, fs)
        elif fmt == "Parquet":
            return parse_parquet(path, fs)
        elif fmt == "CSV":
            from parsers.csv_parser import parse_csv
            return parse_csv(path, fs)
        else:
            raise ValueError(f"Unknown format: {fmt}")
    except Exception as e:
        logger.error(f"Parse failed for {path} ({fmt}): {e}")
        raise


# ─── Routes ──────────────────────────────────────────────────────────────────
@router.post("/scan", response_model=ScanResponse)
def scan_path(body: ScanRequest, current_user: UserOut = Depends(get_current_user)):
    """
    Scan an object store path, discover tables, parse metadata,
    and cache results for subsequent GET /api/tables calls.
    """
    start = time.time()

    try:
        fs = get_filesystem(
            path=body.path,
            aws_access_key_id=body.aws_access_key_id,
            aws_secret_access_key=body.aws_secret_access_key,
            aws_region=body.aws_region,
            endpoint_url=body.endpoint_url,
        )
    except Exception as e:
        logger.error(f"S3 Connection failed: {e}")
        raise HTTPException(status_code=400, detail=f"S3 Connection failed: {str(e)}")

    try:
        found = discover_tables(body.path, fs)
    except Exception as e:
        logger.error(f"Discovery failed: {e}")
        found = []

    tables = []
    for entry in found:
        try:
            parsed = _parse_table(entry["path"], entry["format"], fs)
            
            # Check for updates/alerts
            tid = parsed["id"]
            if tid in _watched_tables and tid in _table_cache:
                old_t = _table_cache[tid]
                if len(parsed.get("snapshots", [])) > len(old_t.get("snapshots", [])):
                    _alerts.append({
                        "id": str(uuid.uuid4()),
                        "tableId": tid,
                        "tableName": parsed["name"],
                        "type": "new_snapshot",
                        "message": f"New snapshot detected for {parsed['name']}",
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "read": False
                    })
                if parsed.get("schema") != old_t.get("schema"):
                    _alerts.append({
                        "id": str(uuid.uuid4()),
                        "tableId": tid,
                        "tableName": parsed["name"],
                        "type": "schema_change",
                        "message": f"Schema changed for {parsed['name']}",
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "read": False
                    })

            _table_cache[parsed["id"]] = parsed
            tables.append(parsed)
        except Exception as e:
            logger.error(f"Failed to parse {entry['path']}: {e}")

    duration_ms = (time.time() - start) * 1000
    summaries = [_to_summary(t) for t in tables]
    return ScanResponse(
        tables=summaries,
        discovered=len(summaries),
        durationMs=round(duration_ms, 1),
        path=body.path,
    )


@router.get("/tables", response_model=List[TableSummary])
def list_tables(current_user: UserOut = Depends(get_current_user)):
    """Return all cached tables as summaries."""
    return [_to_summary(t) for t in _table_cache.values()]


@router.get("/tables/{table_id}", response_model=TableOut)
def get_table(table_id: str, current_user: UserOut = Depends(get_current_user)):
    """Return full table detail including schema, snapshots, metrics, sample."""
    if table_id not in _table_cache:
        raise HTTPException(status_code=404, detail=f"Table '{table_id}' not found")
    return _table_cache[table_id]


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(current_user: UserOut = Depends(get_current_user)):
    """
    Get real statistics aggregated from all discovered tables.
    """
    if not _table_cache:
        return DashboardStats(
            totalTables=0,
            totalRows=0,
            totalSize=0,
            formats=[],
            recentActivity=[]
        )
    
    total_rows = sum(t.get("rows", 0) for t in _table_cache.values())
    total_size = sum(t.get("sizeBytes", 0) for t in _table_cache.values())
    
    # Calculate format distribution
    format_list = sorted(list(set(t.get("format", "UNKNOWN") for t in _table_cache.values())))
        
    # Get recent activity (last 5 updated tables)
    recent = sorted(_table_cache.values(), key=lambda x: x.get("updatedAt", ""), reverse=True)[:5]
    activity = [
        {
            "id": t["id"],
            "name": t["name"],
            "type": "update",
            "timestamp": t["updatedAt"]
        }
        for t in recent
    ]

    return DashboardStats(
        totalTables=len(_table_cache),
        totalRows=total_rows,
        totalSize=total_size,
        formats=format_list,
        recentActivity=activity
    )


@router.get("/tables/{table_id}/schema")
def get_schema(table_id: str, current_user: UserOut = Depends(get_current_user)):
    t = _get_or_404(table_id)
    return t["schema"]


@router.get("/tables/{table_id}/snapshots")
def get_snapshots(table_id: str, current_user: UserOut = Depends(get_current_user)):
    t = _get_or_404(table_id)
    return t["snapshots"]


@router.get("/tables/{table_id}/partitions")
def get_partitions(table_id: str, current_user: UserOut = Depends(get_current_user)):
    t = _get_or_404(table_id)
    return {"partitions": t["partitions"]}


@router.get("/tables/{table_id}/metrics")
def get_metrics(table_id: str, current_user: UserOut = Depends(get_current_user)):
    t = _get_or_404(table_id)
    return t["metrics"]


@router.get("/tables/{table_id}/sample")
def get_sample(
    table_id: str,
    rows: int = Query(10, ge=1, le=100),
    current_user: UserOut = Depends(get_current_user),
):
    t = _get_or_404(table_id)
    return t["sample"][:rows]


@router.get("/tables/{table_id}/export")
def export_schema(
    table_id: str,
    format: str = Query("sql", pattern="^(sql|json|avro|dbt)$"),
    current_user: UserOut = Depends(get_current_user),
):
    t = _get_or_404(table_id)
    return {"table_id": table_id, "format": format, "schema": t["schema"], "name": t["name"]}


@router.post("/query", response_model=QueryResponse)
def run_query(body: QueryRequest, current_user: UserOut = Depends(get_current_user)):
    """
    Execute a real SQL query using DuckDB against S3 data.
    """
    start = time.time()
    try:
        # Create an in-memory DuckDB connection
        con = duckdb.connect(database=":memory:")
        con.execute("INSTALL httpfs;")
        con.execute("LOAD httpfs;")
        try:
            con.execute("INSTALL iceberg;")
            con.execute("LOAD iceberg;")
        except Exception as e:
            logger.warning(f"Failed to load iceberg extension: {e}")
            
        try:
            con.execute("INSTALL delta;")
            con.execute("LOAD delta;")
        except Exception as e:
            logger.warning(f"Failed to load delta extension: {e}")
        
        if body.aws_access_key_id:
            con.execute(f"SET s3_region='{body.aws_region or 'us-east-1'}';")
            con.execute(f"SET s3_access_key_id='{body.aws_access_key_id}';")
            con.execute(f"SET s3_secret_access_key='{body.aws_secret_access_key}';")
            # For Iceberg/Delta extensions
            con.execute(f"SET s3_url_style='vhost';") 
        
        if body.endpoint_url:
            # Handle MinIO / custom endpoints
            endpoint = body.endpoint_url.replace("http://", "").replace("https://", "")
            con.execute(f"SET s3_endpoint='{endpoint}';")
            if body.endpoint_url.startswith("http://"):
                con.execute("SET s3_use_ssl=false;")

        # Execute query
        # Note: In a real production app, you'd want to validate/sandbox the SQL
        rel = con.sql(body.sql)
        columns = rel.columns
        rows_data = rel.fetchall()
        
        # Convert rows to list of dicts
        rows = [dict(zip(columns, row)) for row in rows_data]
        
        return QueryResponse(
            columns=columns,
            rows=rows,
            durationMs=(time.time() - start) * 1000
        )
    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/tables/{table_id}/watch")
def watch_table(table_id: str, current_user: UserOut = Depends(get_current_user)):
    _watched_tables.add(table_id)
    return {"status": "watching"}


@router.delete("/tables/{table_id}/watch")
def unwatch_table(table_id: str, current_user: UserOut = Depends(get_current_user)):
    _watched_tables.discard(table_id)
    return {"status": "stopped"}


@router.get("/alerts", response_model=List[AlertOut])
def get_alerts_endpoint(current_user: UserOut = Depends(get_current_user)):
    return _alerts


@router.post("/alerts/{alert_id}/read")
def mark_alert_read(alert_id: str, current_user: UserOut = Depends(get_current_user)):
    for a in _alerts:
        if a["id"] == alert_id:
            a["read"] = True
            break
    return {"status": "ok"}


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _get_or_404(table_id: str) -> dict:
    t = _table_cache.get(table_id)
    if not t:
        raise HTTPException(status_code=404, detail=f"Table '{table_id}' not found")
    return t


@router.get("/aws/buckets", response_model=List[str])
def get_buckets(
    key: str,
    secret: str,
    region: str = "us-east-1",
    current_user: UserOut = Depends(get_current_user)
):
    """List all S3 buckets for the given IAM credentials."""
    try:
        return list_s3_buckets(key, secret, region)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/aws/iam-health")
def get_iam_health(
    key: str,
    secret: str,
    region: str = "us-east-1",
    current_user: UserOut = Depends(get_current_user)
):
    """Check IAM user status and permissions."""
    return check_iam_health(key, secret, region)


def _to_summary(t: dict) -> dict:
    return {
        "id": t["id"],
        "name": t["name"],
        "format": t["format"],
        "rows": t["rows"],
        "sizeBytes": t["sizeBytes"],
        "updatedAt": t["updatedAt"],
        "location": t["location"],
        "partitions": t["partitions"],
    }
