import os
import json
import requests
from datetime import datetime, timedelta

# === CONFIG ===
API_KEY = 'AIzaSyAYSP0UZpL85f5l17tqFtxHlr_yClEk7cc'  # Replace with your actual API key
#API_KEY = 'AIzaSyAsr9lyCtfa3xizgzs3x4LqYsKHhZuOpzY'  ,'AIzaSyCNqe4uWVgti_ZHBSI8_kKero_I6xf7qYk'

OUTPUT_DIR = 'shorts_data'
OUTPUT_FILE = 'shorts.json'

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
DAYS_BACK = 30

# === FUNCTIONS ===
def get_recent_date(days_back):
    date = datetime.utcnow() - timedelta(days=days_back)
    return date.isoformat("T") + "Z"

def fetch_shorts(channel_id):
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        'key': API_KEY,
        'channelId': channel_id,
        'part': 'snippet',
        'type': 'video',
        'maxResults': MAX_RESULTS,
        'videoDuration': 'short',
        'publishedAfter': get_recent_date(DAYS_BACK),
        'q': SEARCH_QUERY,
        'order': 'date'
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        print(f"❌ Error for channel {channel_id}: {response.status_code}")
        return []

    items = response.json().get('items', [])
    return [{
        'videoId': item['id']['videoId'],
        'title': item['snippet']['title'],
        'uploadDate': item['snippet']['publishedAt'],
        'channelName': item['snippet']['channelTitle'],  # ✅ Added channel name here
        'embedUrl': f"https://www.youtube.com/embed/{item['id']['videoId']}?enablejsapi=1&controls=1&modestbranding=1&autoplay=0"
    } for item in items]

def save_to_json(data, folder, filename):
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)  # <--- key change here
    print(f"✅ Saved {len(data)} shorts to {path}")

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
    print(f"❌ Failed to fetch channel name for {channel_id}")

# === MAIN ===
def main():
    all_shorts = []
    for channel_id in CHANNEL_IDS:
        shorts = fetch_shorts(channel_id)
        
        # Try to get channel name from video snippet if available
        channel_name = get_channel_name(channel_id)

        print(f"📡 Fetching from channel: {channel_id} : {channel_name} — {len(shorts)} shorts were fetched")

        all_shorts.extend(shorts)

    save_to_json(all_shorts, OUTPUT_DIR, OUTPUT_FILE)


if __name__ == "__main__":
    main()
