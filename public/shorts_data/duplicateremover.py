import json
import sys
from pathlib import Path

def remove_duplicates_by_video_id(json_path):
    json_path = Path(json_path)

    if not json_path.exists():
        print(f"❌ File not found: {json_path}")
        return

    # Load JSON data
    with open(json_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON format: {e}")
            return

    if not isinstance(data, list):
        print("❌ JSON must be a list of objects.")
        return

    # Deduplicate
    seen_ids = set()
    unique_data = []
    for entry in data:
        video_id = entry.get("videoId")
        if video_id and video_id not in seen_ids:
            seen_ids.add(video_id)
            unique_data.append(entry)

    # Save cleaned data back
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(unique_data, f, ensure_ascii=False, indent=2)

    print(f"✅ Removed duplicates. {len(data) - len(unique_data)} duplicates found.")
    print(f"✅ Cleaned data saved to: {json_path.resolve()}")

# Example usage
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python remove_dupes.py path/to/your.json")
    else:
        remove_duplicates_by_video_id(sys.argv[1])
