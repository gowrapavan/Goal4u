import os
import json
import requests
import re
from datetime import datetime, timedelta

# === CONFIG ===
API_KEY = 'AIzaSyAsr9lyCtfa3xizgzs3x4LqYsKHhZuOpzY'  # Replace with your actual API key

OUTPUT_DIR = 'videos_data'
OUTPUT_FILE = 'videos.json'

CHANNEL_IDS = [
    # Top Clubs
    'UC14UlmYlSNiQCBe9Eookf_A',  # FC Barcelona
    'UC8pLs2iN_c9iKOjKZpzb7kQ',  # Real Madrid
    'UCkzCjdRMrW2vXLx8mvPVLdQ',  # Manchester City
    'UC9LQwHZoucFT94I2h6JOcjw',  # Liverpool FC
    'UCt9a_qP9CqHCNwilf-iULag',  # PSG
    'UCLzKhsxrExAC6yAdtZ-BOWw',  # Juventus
    'UCKcx1uK38H4AOkmfv4ywlrg',  # AC Milan
    'UCvXzEblUa0cfny4HAJ_ZOWw',  # Inter Milan
    'UCSZ21xyG8w_33KriMM69IxQ',
    'UCooTLkxcpnTNx6vfOovfBFA',
    'UCd09ztChTkJ9dlY6RLawSog',
    'UC2bW_AY9BlbYLGJSXAbjS4Q',
    'UCWsDFcIhY2DBi3GB5uykGXA',
    'UCQBxzdEPXjy05MtpfbdtMxQ',
    'UCSZbXT5TLLW_i-5W8FZpFsg',
    'UCI4hFxNmsvfkus2-XC9MOng',

    # Popular Leagues
    'UCG5qGWdu8nIRZqJ_GgDwQ-w',  # Premier League
    'UCU2PacFf99vhb3hNiYDmxww',  # UEFA Champions League

    # Other Clubs
    'UCuzKFwdh7z2GHcIOX_tXgxA',  # Atlético Madrid
    'UC3Ad7MMhJ1NHAkYbtgbVJ1Q',  # Hamid TV
    'UCyGa1YEx9ST66rYrJTGIKOw',  # UEFA
    'UCcclZ7Nbh0U383eP0N-nV0g',  # 433
    'UCBTy8j2cPy6zw68godcE7MQ',  # AFTV
    'UCaBCtORHF5R7GZJ-LUiRxiQ',  # Celtic FC
    'UCMZ_fSGkdkOzqi_MTLhU2kA',  # Borussia Dortmund
    'UCYo7yOTANHumC7XhvnwBQmA',  # Inter Milan (alt)
    'UCemavGDC7r4G4kMra5WmX-g',  # Beşiktaş JK
    'UCLSG2HDiE65l2Fl4jSl6eta',  # Al Ahly SC
    'UCnpdLn1-k-DcyWi0bNezRig',
    'UCUGj4_2zT8gY_O_xaiCsR6A',
    'UCL6KKxaCCnOJFaxV53Clp1A',
    'UC_apha4piyJCHSuYZbSi8uA',
    'UCeBYAZ84AQA2WVHGjpKRy7A',
]

SEARCH_QUERY = 'highlights'
MAX_RESULTS = 30
DAYS_BACK = 60

# === HELPERS ===
def get_recent_date(days_back):
    date = datetime.utcnow() - timedelta(days=days_back)
    return date.isoformat("T") + "Z"

def parse_duration_to_seconds(duration):
    match = re.match(r'PT((\d+)H)?((\d+)M)?((\d+)S)?', duration)
    if not match:
        return 0
    hours = int(match.group(2) or 0)
    minutes = int(match.group(4) or 0)
    seconds = int(match.group(6) or 0)
    return hours * 3600 + minutes * 60 + seconds

# === FETCHING ===
def fetch_videos(channel_id):
    search_url = "https://www.googleapis.com/youtube/v3/search"
    search_params = {
        'key': API_KEY,
        'channelId': channel_id,
        'part': 'snippet',
        'type': 'video',
        'maxResults': MAX_RESULTS,
        'publishedAfter': get_recent_date(DAYS_BACK),
        'q': SEARCH_QUERY,
        'order': 'date'
    }

    search_response = requests.get(search_url, params=search_params)
    if search_response.status_code != 200:
        print(f"❌ Error searching channel {channel_id}: {search_response.status_code}")
        return []

    items = search_response.json().get('items', [])
    video_ids = [item['id']['videoId'] for item in items]

    if not video_ids:
        return []

    details_url = "https://www.googleapis.com/youtube/v3/videos"
    details_params = {
        'key': API_KEY,
        'part': 'contentDetails,snippet',
        'id': ','.join(video_ids)
    }

    details_response = requests.get(details_url, params=details_params)
    if details_response.status_code != 200:
        print(f"❌ Error getting video details: {details_response.status_code}")
        return []

    valid_videos = []
    for item in details_response.json().get('items', []):
        duration = item['contentDetails']['duration']
        seconds = parse_duration_to_seconds(duration)
        if seconds >= 60:
           thumbnails = item['snippet']['thumbnails']
           thumbnail_url = thumbnails.get('high', thumbnails.get('medium', thumbnails.get('default', {}))).get('url', '')

           valid_videos.append({
                'videoId': item['id'],
                'title': item['snippet']['title'],
                'uploadDate': item['snippet']['publishedAt'],
                'channelName': item['snippet']['channelTitle'],
                'embedUrl': f"https://www.youtube.com/embed/{item['id']}?enablejsapi=1&controls=1&modestbranding=1&autoplay=0",
                'thumbnail': thumbnail_url
           })


    return valid_videos

# === SAVE ===
def save_to_json(data, folder, filename):
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved {len(data)} videos to {path}")

# === MAIN ===
def main():
    all_videos = []
    for channel_id in CHANNEL_IDS:
        print(f"📡 Fetching from channel: {channel_id}")
        videos = fetch_videos(channel_id)
        all_videos.extend(videos)

    save_to_json(all_videos, OUTPUT_DIR, OUTPUT_FILE)

if __name__ == "__main__":
    main()
