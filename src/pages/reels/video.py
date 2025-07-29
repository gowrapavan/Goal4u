import os
import json
import requests
import re
from datetime import datetime, timedelta

# === CONFIG ===
API_KEY = 'AIzaSyDuXasL2olDdV5w8n65zQSq5FmxknofYww'  # Replace with your actual API key

OUTPUT_DIR = 'videos_data'
OUTPUT_FILE = 'videos.json'

CHANNEL_IDS = [
 #Top Clubs
  'UC14UlmYlSNiQCBe9Eookf_A',  # FC Barcelona
  'UCWV3obpZVGgJ3j9FVhEjF2Q',  # Real Madrid
  'UCkzCjdRMrW2vXLx8mvPVLdQ',  # Manchester City
  'UC9LQwHZoucFT94I2h6JOcjw',  # Liverpool FCd
  'UCt9a_qP9CqHCNwilf-iULag',  # PSG
  'UCLzKhsxrExAC6yAdtZ-BOWw', #Juventus
  'UCKcx1uK38H4AOkmfv4ywlrg', #AC Milan
  'UCvXzEblUa0cfny4HAJ_ZOWw', #Inter Milan
  'UCSZ21xyG8w_33KriMM69IxQ',
  'UCooTLkxcpnTNx6vfOovfBFA',
  'UCd09ztChTkJ9dlY6RLawSog',
  'UC2bW_AY9BlbYLGJSXAbjS4Q',
  'UCWsDFcIhY2DBi3GB5uykGXA',
  'UCQBxzdEPXjy05MtpfbdtMxQ',
  'UCSZbXT5TLLW_i-5W8FZpFsg',
  'UCE97AW7eR8VVbVPBy4cCLKg',
  'UCKvn9VBLAiLiYL4FFJHri6g',


  'UCI4hFxNmsvfkus2-XC9MOng',

 #Popular Leagues & Competitions
  #'UCTv-XvfzLX3i4IGWAm4sbmA', #LaLiga not alowed
  'UCG5qGWdu8nIRZqJ_GgDwQ-w', #Premier League
  'UCU2PacFf99vhb3hNiYDmxww', #Champions League (UEFA)

 #Other Clubs & Channels
  'UCuzKFwdh7z2GHcIOX_tXgxA', #Atlético Madrid
  'UC3Ad7MMhJ1NHAkYbtgbVJ1Q', #Hamid TV (shorts/highlights content)
  'UCyGa1YEx9ST66rYrJTGIKOw', #UEFA (⚠️ allows embedding, but avoid FIFA content)

 #Additional Safe Channels
  'UCcclZ7Nbh0U383eP0N-nV0g', #433 (works well)
  'UCBTy8j2cPy6zw68godcE7MQ', #AFTV
  'UCK8rTVgp3-MebXkmeJcQb1Q', #Borussia Dortmund
  'UCvXzEblUa0cfny4HAJ_ZOWw', #Inter Milan (alt)
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

def get_channel_name(channel_id):
    url = "https://www.googleapis.com/youtube/v3/channels"
    params = {
        'key': API_KEY,
        'id': channel_id,
        'part': 'snippet'
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        items = response.json().get('items', [])
        if items:
            return items[0]['snippet']['title']
    return "Unknown Channel"



# === MAIN ===
def main():
    all_videos = []
    for channel_id in CHANNEL_IDS:
        videos = fetch_videos(channel_id)
        channel_name = get_channel_name(channel_id)
        print(f"📡 Fetching from channel: {channel_id} : {channel_name} — {len(videos)} videos were fetched")

        all_videos.extend(videos)

    save_to_json(all_videos, OUTPUT_DIR, OUTPUT_FILE)

if __name__ == "__main__":
    main()
