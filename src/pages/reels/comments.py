import os
import json
import requests

# === CONFIG ===
API_KEY = 'YOUR_API_KEY'  # Replace with your real API key
INPUT_FILE = 'shorts_data/shorts.json'
OUTPUT_FILE = 'shorts_data/shorts_with_comments.json'
MAX_COMMENTS = 5

# === FUNCTIONS ===
def load_videos_from_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def fetch_comments(video_id):
    url = 'https://www.googleapis.com/youtube/v3/commentThreads'
    params = {
        'part': 'snippet',
        'videoId': video_id,
        'key': API_KEY,
        'maxResults': MAX_COMMENTS,
        'textFormat': 'plainText'
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        print(f"⚠️ Failed to fetch comments for video {video_id}")
        return []

    items = response.json().get('items', [])
    comments = []
    for item in items:
        snippet = item['snippet']['topLevelComment']['snippet']
        comments.append({
            'author': snippet.get('authorDisplayName', 'Anonymous'),
            'text': snippet.get('textDisplay', ''),
            'likeCount': snippet.get('likeCount', 0)
        })

    return comments

def add_comments_to_videos(videos):
    enriched = []
    for video in videos:
        video_id = video['videoId']
        print(f"💬 Fetching comments for video: {video_id}")
        video['comments'] = fetch_comments(video_id)
        enriched.append(video)
    return enriched

def save_to_json(data, file_path):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved video+comments to {file_path}")

# === MAIN ===
def main():
    print("📂 Loading shorts data...")
    videos = load_videos_from_json(INPUT_FILE)
    
    print("💻 Fetching comments for each video...")
    videos_with_comments = add_comments_to_videos(videos)

    print("💾 Saving enriched data...")
    save_to_json(videos_with_comments, OUTPUT_FILE)

if __name__ == "__main__":
    main()
