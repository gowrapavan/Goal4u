import json
import sys
from pathlib import Path

def remove_duplicates_by_video_id(input_path, output_path=None):
    input_path = Path(input_path)

    if not input_path.exists():
        print(f"❌ File not found: {input_path}")
        return

    try:
        with open(input_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return

    if not isinstance(data, list):
        print("❌ JSON must be a list of objects.")
        return

    seen_ids = set()
    unique_data = []
    for entry in data:
        vid = entry.get("videoId")
        if vid and vid not in seen_ids:
            seen_ids.add(vid)
            unique_data.append(entry)

    output_path = Path(output_path) if output_path else input_path

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(unique_data, f, ensure_ascii=False, indent=2)

    print(f"✅ Removed {len(data) - len(unique_data)} duplicates.")
    print(f"✅ Cleaned file saved to: {output_path.resolve()}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python remove_dupes.py input.json [output.json]")
    else:
        remove_duplicates_by_video_id(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
