"""
Parquet table parser — reads footer metadata via pyarrow.
"""
import logging
from datetime import datetime, timezone
from typing import Any, Dict

logger = logging.getLogger(__name__)


def parse_parquet(path: str, fs) -> Dict[str, Any]:
    import pyarrow.parquet as pq

    clean = path.rstrip("/")
    table_name = clean.split("/")[-1]
    table_id = table_name.lower().replace("-", "_")

    schema_out = []
    total_rows = 0
    total_size = 0
    files_count = 0
    updated_at = datetime.now(timezone.utc).isoformat()

    parquet_files = _find_parquet_files(clean, fs, max_files=50)

    for pf_path in parquet_files:
        try:
            with fs.open(pf_path, "rb") as f:
                pf = pq.ParquetFile(f)

                # Schema from first file
                if not schema_out:
                    arrow_schema = pf.schema_arrow
                    for field in arrow_schema:
                        schema_out.append({
                            "name": field.name,
                            "type": str(field.type),
                            "nullable": field.nullable,
                            "partition": False,
                        })

                # Stats
                meta = pf.metadata
                total_rows += meta.num_rows
                total_size += sum(
                    meta.row_group(i).total_byte_size
                    for i in range(meta.num_row_groups)
                )
                files_count += 1

                # Last modified from file stat
                try:
                    info = fs.info(pf_path)
                    mtime = info.get("LastModified") or info.get("mtime")
                    if mtime:
                        if hasattr(mtime, "isoformat"):
                            updated_at = mtime.isoformat()
                        else:
                            updated_at = datetime.fromtimestamp(float(mtime), tz=timezone.utc).isoformat()
                except Exception:
                    pass
        except Exception as e:
            logger.warning(f"Could not read parquet file {pf_path}: {e}")
            continue

    return {
        "id": table_id,
        "name": table_name,
        "format": "Parquet",
        "rows": total_rows,
        "sizeBytes": total_size,
        "updatedAt": updated_at,
        "location": path,
        "partitions": [],
        "schema": schema_out,
        "properties": {"compression": "snappy", "files": files_count},
        "snapshots": [],
        "metrics": _build_metrics(total_rows, total_size, files_count),
        "sample": [],
    }


def _find_parquet_files(path: str, fs, max_files: int = 50) -> list:
    results = []
    try:
        items = fs.ls(path, detail=False)
        for item in items:
            if item.endswith(".parquet"):
                results.append(item)
                if len(results) >= max_files:
                    return results
            elif fs.isdir(item) and not item.split("/")[-1].startswith("_"):
                results.extend(_find_parquet_files(item, fs, max_files - len(results)))
                if len(results) >= max_files:
                    return results
    except Exception:
        pass
    return results


def _build_metrics(total_rows: int, total_size: int, files: int) -> list:
    """Generate synthetic monthly metrics from totals."""
    import random
    metrics = []
    for i in range(8):
        factor = (i + 1) / 8
        metrics.append({
            "date": f"M{i+1}",
            "rows": int(total_rows * factor * (0.9 + random.random() * 0.2)),
            "sizeMB": round(total_size / 1e6 * factor, 2),
            "files": max(1, int(files * factor)),
        })
    return metrics
