"""
Hudi table parser — reads .hoodie/hoodie.properties and parquet schema.
"""
import logging
from datetime import datetime, timezone
from typing import Any, Dict

logger = logging.getLogger(__name__)


def parse_hudi(path: str, fs) -> Dict[str, Any]:
    clean = path.rstrip("/")
    table_name = clean.split("/")[-1]
    table_id = table_name.lower().replace("-", "_")

    properties = {}
    schema_out = []
    snapshots = []
    partition_cols = []
    total_rows = 0
    total_size = 0
    updated_at = datetime.now(timezone.utc).isoformat()

    # Read hoodie.properties
    props_path = f"{clean}/.hoodie/hoodie.properties"
    try:
        with fs.open(props_path, "r") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, _, v = line.partition("=")
                    properties[k.strip()] = v.strip()
        partition_cols_str = properties.get("hoodie.table.partition.fields", "")
        partition_cols = [p.strip() for p in partition_cols_str.split(",") if p.strip()]
    except Exception as e:
        logger.warning(f"Could not read hoodie.properties: {e}")

    # Read schema from first parquet file found
    try:
        import pyarrow.parquet as pq
        parquet_files = _find_parquet_files(clean, fs, max_files=1)
        if parquet_files:
            with fs.open(parquet_files[0], "rb") as f:
                pf = pq.ParquetFile(f)
                arrow_schema = pf.schema_arrow
                for field in arrow_schema:
                    schema_out.append({
                        "name": field.name,
                        "type": str(field.type),
                        "nullable": field.nullable,
                        "partition": field.name in partition_cols,
                    })
    except Exception as e:
        logger.warning(f"Could not read Hudi schema from parquet: {e}")

    # Parse commit timeline from .hoodie/
    try:
        hoodie_files = fs.ls(f"{clean}/.hoodie", detail=False)
        commit_files = sorted(
            [f for f in hoodie_files if f.endswith(".commit") or f.endswith(".deltacommit")],
        )
        for cf in commit_files[-20:]:
            import json
            try:
                with fs.open(cf, "r") as f:
                    data = json.load(f)
                ts_str = cf.split("/")[-1].split(".")[0]  # e.g. 20260507120000
                ts_iso = _hudi_ts_to_iso(ts_str)
                rows = int(data.get("totalRecordsWritten", 0))
                size = int(data.get("totalBytesWritten", 0))
                total_rows = max(total_rows, int(data.get("totalRecords", rows)))
                total_size += size
                updated_at = ts_iso
                snapshots.append({
                    "id": f"commit-{ts_str}",
                    "ts": ts_iso,
                    "op": "append",
                    "rows": rows,
                    "sizeBytes": size,
                    "summary": data.get("operationType", "upsert commit"),
                })
            except Exception:
                continue
    except Exception as e:
        logger.warning(f"Could not parse Hudi commits: {e}")

    return {
        "id": table_id,
        "name": table_name,
        "format": "Hudi",
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


def _find_parquet_files(path: str, fs, max_files: int = 5) -> list:
    results = []
    try:
        items = fs.ls(path, detail=False)
        for item in items:
            if item.endswith(".parquet"):
                results.append(item)
                if len(results) >= max_files:
                    return results
            elif fs.isdir(item) and not item.split("/")[-1].startswith("."):
                results.extend(_find_parquet_files(item, fs, max_files - len(results)))
                if len(results) >= max_files:
                    return results
    except Exception:
        pass
    return results


def _hudi_ts_to_iso(ts_str: str) -> str:
    try:
        dt = datetime.strptime(ts_str[:14], "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)
        return dt.isoformat()
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
