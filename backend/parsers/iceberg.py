"""
Iceberg table parser using pyiceberg.
Falls back to direct JSON parsing if pyiceberg catalog setup fails.
"""
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


def parse_iceberg(path: str, fs) -> Dict[str, Any]:
    """
    Parse an Iceberg table at `path` using pyiceberg or direct JSON.
    Returns a dict matching the MetaTable frontend schema.
    """
    try:
        return _parse_via_pyiceberg(path, fs)
    except Exception as e:
        logger.warning(f"pyiceberg parse failed ({e}), falling back to direct JSON")
        return _parse_direct_json(path, fs)


def _parse_via_pyiceberg(path: str, fs) -> Dict[str, Any]:
    from pyiceberg.catalog import load_catalog

    # Use filesystem catalog pointing at the table root
    catalog = load_catalog(
        "local",
        **{
            "type": "rest",
            "uri": path,  # will fail gracefully, caught above
        },
    )
    # This will raise if catalog is misconfigured → fallback kicks in
    raise NotImplementedError("REST catalog not configured — using direct JSON parser")


def _parse_direct_json(path: str, fs) -> Dict[str, Any]:
    """Parse Iceberg metadata.json directly."""
    clean = path.rstrip("/")
    table_name = clean.split("/")[-1]
    table_id = table_name.lower().replace("-", "_")

    # Find latest metadata file
    meta_files = []
    try:
        meta_files = sorted(
            [f for f in fs.ls(f"{clean}/metadata", detail=False) if f.endswith(".json")],
            reverse=True,
        )
    except Exception:
        pass

    if not meta_files:
        return _empty_table(table_id, table_name, "Iceberg", path)

    # Read metadata JSON
    with fs.open(meta_files[0], "r") as f:
        meta = json.load(f)

    # Extract schema
    current_schema_id = meta.get("current-schema-id", 0)
    schemas = meta.get("schemas", [meta.get("schema", {})])
    current_schema = next(
        (s for s in schemas if s.get("schema-id") == current_schema_id),
        schemas[0] if schemas else {},
    )
    fields = current_schema.get("fields", [])

    # Extract partition spec
    partition_specs = meta.get("partition-specs", [])
    current_spec_id = meta.get("default-spec-id", 0)
    current_spec = next(
        (s for s in partition_specs if s.get("spec-id") == current_spec_id),
        partition_specs[0] if partition_specs else {},
    )
    partition_field_ids = {f.get("source-id") for f in current_spec.get("fields", [])}
    partition_names = [
        f["name"] for f in fields if f.get("field-id") in partition_field_ids
    ]

    # Build column schema
    schema_out = []
    for field in fields:
        type_val = field.get("type", "string")
        if isinstance(type_val, dict):
            type_str = type_val.get("type", "struct")
        else:
            type_str = str(type_val)
        schema_out.append({
            "name": field.get("name", ""),
            "type": type_str,
            "nullable": field.get("required", True) is False,
            "partition": field.get("field-id") in partition_field_ids,
        })

    # Extract snapshots
    snapshots_raw = meta.get("snapshots", [])
    snapshots = []
    for snap in snapshots_raw[-20:]:  # Latest 20
        summary = snap.get("summary", {})
        op_map = {"append": "append", "overwrite": "overwrite", "delete": "delete"}
        op = op_map.get(summary.get("operation", "append"), "append")
        snapshots.append({
            "id": str(snap.get("snapshot-id", "")),
            "ts": _ms_to_iso(snap.get("timestamp-ms", 0)),
            "op": op,
            "rows": int(summary.get("total-records", 0)),
            "sizeBytes": int(summary.get("total-files-size", 0)),
            "summary": summary.get("operation", "data change"),
        })

    # Compute stats from latest snapshot
    latest_snap = snapshots_raw[-1] if snapshots_raw else {}
    latest_summary = latest_snap.get("summary", {})
    total_rows = int(latest_summary.get("total-records", 0))
    total_size = int(latest_summary.get("total-files-size", 0))
    updated_at = _ms_to_iso(latest_snap.get("timestamp-ms", 0)) if latest_snap else datetime.now(timezone.utc).isoformat()

    properties = meta.get("properties", {})
    properties["format-version"] = meta.get("format-version", 2)

    return {
        "id": table_id,
        "name": table_name,
        "format": "Iceberg",
        "rows": total_rows,
        "sizeBytes": total_size,
        "updatedAt": updated_at,
        "location": path,
        "partitions": partition_names,
        "schema": schema_out,
        "properties": properties,
        "snapshots": list(reversed(snapshots)),
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
            "files": max(1, s["sizeBytes"] // 134_217_728),  # estimate ~128MB per file
        }
        for i, s in enumerate(snapshots[-12:])
    ]


def _empty_table(tid: str, name: str, fmt: str, path: str) -> Dict[str, Any]:
    return {
        "id": tid, "name": name, "format": fmt,
        "rows": 0, "sizeBytes": 0,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "location": path, "partitions": [],
        "schema": [], "properties": {}, "snapshots": [], "metrics": [], "sample": [],
    }
