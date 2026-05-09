"""
Delta Lake table parser using deltalake library.
"""
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


def parse_delta(path: str, fs=None) -> Dict[str, Any]:
    try:
        return _parse_via_deltalake(path)
    except Exception as e:
        logger.warning(f"deltalake parse failed ({e}), falling back to log scanner")
        return _parse_direct_log(path, fs)


def _parse_via_deltalake(path: str) -> Dict[str, Any]:
    from deltalake import DeltaTable

    table_name = path.rstrip("/").split("/")[-1]
    table_id = table_name.lower().replace("-", "_")

    dt = DeltaTable(path)
    schema = dt.schema()
    history = dt.history(limit=20)
    files = dt.files()

    # Schema
    schema_out = []
    partition_cols = set(dt.metadata().partition_columns)
    for field in schema.fields:
        schema_out.append({
            "name": field.name,
            "type": str(field.type),
            "nullable": field.nullable,
            "partition": field.name in partition_cols,
        })

    # Snapshots from history
    snapshots = []
    for entry in reversed(history):
        op_raw = entry.get("operation", "WRITE").upper()
        op_map = {"WRITE": "append", "DELETE": "delete", "MERGE": "overwrite",
                  "UPDATE": "overwrite", "REPLACE TABLE": "overwrite"}
        op = op_map.get(op_raw, "append")
        ts = entry.get("timestamp", 0)
        metrics = entry.get("operationMetrics", {})
        snapshots.append({
            "id": f"v{entry.get('version', 0)}",
            "ts": _ms_to_iso(ts),
            "op": op,
            "rows": int(metrics.get("numOutputRows", 0)),
            "sizeBytes": int(metrics.get("numOutputBytes", 0)),
            "summary": entry.get("operation", "data change"),
        })

    # Stats
    meta = dt.metadata()
    total_size = sum(dt.get_add_actions()["size_bytes"].to_pylist())
    latest_history = history[0] if history else {}
    latest_metrics = latest_history.get("operationMetrics", {})
    total_rows = int(latest_metrics.get("numOutputRows", 0))

    properties = dict(meta.configuration) if meta.configuration else {}
    properties["delta.minReaderVersion"] = dt.protocol().min_reader_version
    properties["delta.minWriterVersion"] = dt.protocol().min_writer_version

    return {
        "id": table_id,
        "name": table_name,
        "format": "Delta",
        "rows": total_rows,
        "sizeBytes": total_size,
        "updatedAt": _ms_to_iso(latest_history.get("timestamp", 0)),
        "location": path,
        "partitions": list(partition_cols),
        "schema": schema_out,
        "properties": properties,
        "snapshots": snapshots,
        "metrics": _build_metrics(snapshots),
        "sample": [],
    }


def _parse_direct_log(path: str, fs) -> Dict[str, Any]:
    """Fallback: parse _delta_log JSON files directly."""
    import json

    table_name = path.rstrip("/").split("/")[-1]
    table_id = table_name.lower().replace("-", "_")

    if fs is None:
        return _empty_table(table_id, table_name, path)

    log_path = f"{path.rstrip('/')}/_delta_log"
    schema_out = []
    snapshots = []
    total_rows = 0
    total_size = 0
    partition_cols = []
    properties = {}
    updated_at = datetime.now(timezone.utc).isoformat()

    try:
        log_files = sorted(
            [f for f in fs.ls(log_path, detail=False) if f.endswith(".json")],
        )
        for log_file in log_files[-20:]:
            with fs.open(log_file, "r") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        entry = json.loads(line)
                    except Exception:
                        continue

                    if "metaData" in entry:
                        meta = entry["metaData"]
                        partition_cols = meta.get("partitionColumns", [])
                        properties = meta.get("configuration", {})
                        # Parse schema from schemaString
                        try:
                            schema_json = json.loads(meta.get("schemaString", "{}"))
                            for field in schema_json.get("fields", []):
                                type_val = field.get("type", "string")
                                schema_out.append({
                                    "name": field["name"],
                                    "type": type_val if isinstance(type_val, str) else str(type_val),
                                    "nullable": field.get("nullable", True),
                                    "partition": field["name"] in partition_cols,
                                })
                        except Exception:
                            pass

                    if "commitInfo" in entry:
                        info = entry["commitInfo"]
                        ts = info.get("timestamp", 0)
                        updated_at = _ms_to_iso(ts)
                        op_raw = info.get("operation", "WRITE").upper()
                        op = {"WRITE": "append", "DELETE": "delete", "MERGE": "overwrite"}.get(op_raw, "append")
                        metrics = info.get("operationMetrics", {})
                        version = info.get("version", len(snapshots))
                        rows = int(metrics.get("numOutputRows", 0))
                        size = int(metrics.get("numOutputBytes", 0))
                        total_rows += rows
                        total_size += size
                        snapshots.append({
                            "id": f"v{version}",
                            "ts": _ms_to_iso(ts),
                            "op": op,
                            "rows": rows,
                            "sizeBytes": size,
                            "summary": info.get("operation", "data change"),
                        })
    except Exception as e:
        logger.warning(f"Direct log parse failed: {e}")

    return {
        "id": table_id,
        "name": table_name,
        "format": "Delta",
        "rows": total_rows,
        "sizeBytes": total_size,
        "updatedAt": updated_at,
        "location": path,
        "partitions": partition_cols,
        "schema": schema_out,
        "properties": properties,
        "snapshots": snapshots,
        "metrics": _build_metrics(snapshots),
        "sample": [],
    }


def _ms_to_iso(ms: int) -> str:
    try:
        return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()


def _build_metrics(snapshots: list) -> list:
    return [
        {
            "date": f"M{i+1}",
            "rows": s["rows"],
            "sizeMB": round(s["sizeBytes"] / 1e6, 2),
            "files": max(1, s["sizeBytes"] // 134_217_728),
        }
        for i, s in enumerate(snapshots[-12:])
    ]


def _empty_table(tid, name, path):
    return {
        "id": tid, "name": name, "format": "Delta",
        "rows": 0, "sizeBytes": 0,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "location": path, "partitions": [],
        "schema": [], "properties": {}, "snapshots": [], "metrics": [], "sample": [],
    }
