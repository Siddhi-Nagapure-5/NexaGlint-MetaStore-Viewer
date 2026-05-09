import logging
from datetime import datetime, timezone
from typing import Any, Dict

logger = logging.getLogger(__name__)

def parse_csv(path: str, fs) -> Dict[str, Any]:
    import pyarrow.csv as pacsv

    clean = path.rstrip("/")
    table_name = clean.split("/")[-1]
    table_id = table_name.lower().replace("-", "_")

    schema_out = []
    total_size = 0
    files_count = 0
    updated_at = datetime.now(timezone.utc).isoformat()

    csv_files = _find_csv_files(clean, fs, max_files=50)

    for csv_path in csv_files:
        try:
            # File stat for size and modified time
            info = fs.info(csv_path)
            total_size += info.get("size", 0)
            
            mtime = info.get("LastModified") or info.get("mtime")
            if mtime:
                if hasattr(mtime, "isoformat"):
                    updated_at = mtime.isoformat()
                else:
                    updated_at = datetime.fromtimestamp(float(mtime), tz=timezone.utc).isoformat()
            
            # Read schema from first file
            if not schema_out and files_count == 0:
                with fs.open(csv_path, "rb") as f:
                    # Read just enough to get the header
                    reader = pacsv.open_csv(f, read_options=pacsv.ReadOptions(block_size=1024 * 1024))
                    arrow_schema = reader.schema
                    for field in arrow_schema:
                        schema_out.append({
                            "name": field.name,
                            "type": str(field.type),
                            "nullable": field.nullable,
                            "partition": False,
                        })
                    
            files_count += 1
        except Exception as e:
            logger.warning(f"Could not read CSV file {csv_path}: {e}")
            files_count += 1
            continue

    # If schema still empty, provide a dummy one
    if not schema_out:
        schema_out = [{"name": "col1", "type": "string", "nullable": True, "partition": False}]

    return {
        "id": table_id,
        "name": table_name,
        "format": "CSV",
        "rows": 0, # Cannot easily determine rows without full scan
        "sizeBytes": total_size,
        "updatedAt": updated_at,
        "location": path,
        "partitions": [],
        "schema": schema_out,
        "properties": {"files": files_count},
        "snapshots": [],
        "metrics": [],
        "sample": [],
    }

def _find_csv_files(path: str, fs, max_files: int = 50) -> list:
    results = []
    try:
        items = fs.ls(path, detail=False)
        for item in items:
            if item.endswith(".csv"):
                results.append(item)
                if len(results) >= max_files:
                    return results
            elif fs.isdir(item) and not item.split("/")[-1].startswith("_"):
                results.extend(_find_csv_files(item, fs, max_files - len(results)))
                if len(results) >= max_files:
                    return results
    except Exception:
        pass
    return results
