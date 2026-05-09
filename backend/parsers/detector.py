"""
Format detector — scans an S3/object-store path and detects table format.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)

FORMATS = {
    "Iceberg": ["metadata/", "metadata.json"],
    "Delta":   ["_delta_log/"],
    "Hudi":    [".hoodie/"],
    "Parquet": [".parquet"],
}

def detect_format(path: str, fs) -> Optional[str]:
    """
    Returns 'Iceberg', 'Delta', 'Hudi', 'Parquet', or None.
    """
    try:
        # Clean path
        clean = path.rstrip("/")
        try:
            items = fs.ls(clean, detail=False)
        except Exception:
            return None

        names = {item.split("/")[-1] for item in items}
        subdirs = {item for item in names}

        # Check Iceberg: has a metadata/ directory
        if "metadata" in subdirs:
            try:
                meta_items = fs.ls(f"{clean}/metadata", detail=False)
                if any(i.endswith(".json") for i in meta_items):
                    return "Iceberg"
            except Exception:
                pass

        # Check Delta: has _delta_log/ directory
        if "_delta_log" in subdirs:
            return "Delta"

        # Check Hudi: has .hoodie/ directory
        if ".hoodie" in subdirs:
            return "Hudi"

        # Check Parquet: any .parquet files at root or one level deep
        if any(n.endswith(".parquet") for n in names):
            return "Parquet"

        # Check CSV: any .csv files
        if any(n.endswith(".csv") for n in names):
            return "CSV"

        # Check one level deeper for parquet/csv files
        for item in items:
            if fs.isdir(item):
                try:
                    sub = fs.ls(item, detail=False)
                    if any(s.endswith(".parquet") for s in sub):
                        return "Parquet"
                    if any(s.endswith(".csv") for s in sub):
                        return "CSV"
                except Exception:
                    continue

        return None
    except Exception as e:
        logger.warning(f"Format detection failed for {path}: {e}")
        return None


def discover_tables(base_path: str, fs, depth: int = 0, max_depth: int = 3) -> list[dict]:
    """
    Recursively scan base_path and return list of {path, format} dicts.
    Stops recursion once a table format is found or max_depth is reached.
    """
    if depth > max_depth:
        return []

    results = []
    
    # Check if the current directory is itself a table
    fmt = detect_format(base_path, fs)
    if fmt and depth > 0:
        return [{"path": base_path, "format": fmt}]

    try:
        items = fs.ls(base_path.rstrip("/"), detail=False)
    except Exception as e:
        logger.warning(f"Cannot list {base_path}: {e}")
        return results

    # If it's a flat format at root (like CSV/Parquet), add it
    if depth == 0 and fmt:
        results.append({"path": base_path, "format": fmt})

    for item in items:
        try:
            if not fs.isdir(item):
                continue
            
            sub_fmt = detect_format(item, fs)
            if sub_fmt:
                results.append({"path": item, "format": sub_fmt})
            else:
                # Recurse one level deeper
                results.extend(discover_tables(item, fs, depth + 1, max_depth))
        except Exception:
            continue

    # Deduplicate results based on path
    unique = []
    seen = set()
    for r in results:
        if r["path"] not in seen:
            seen.add(r["path"])
            unique.append(r)

    return unique
