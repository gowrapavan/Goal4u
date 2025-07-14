import os
import json
import requests
from datetime import datetime, timedelta

# === CONFIG ===
API_KEY = 'AIzaSyCNqe4uWVgti_ZHBSI8_kKero_I6xf7qYk'  # Replace with your actual API key
OUTPUT_DIR = 'shorts_data'
OUTPUT_FILE = 'shorts.json'

CHANNEL_IDS = [
 #Top Clubs
  'UC14UlmYlSNiQCBe9Eookf_A',  # FC Barcelona
  'UC8pLs2iN_c9iKOjKZpzb7kQ',  # Real Madrid
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

 #Popular Leagues & Competitions
  'UCTv-XvfzLX3i4IGWAm4sbmA', #LaLiga
  'UCG5qGWdu8nIRZqJ_GgDwQ-w', #Premier League
  'UCU2PacFf99vhb3hNiYDmxww', #Champions League (UEFA)

 #Other Clubs & Channels
  'UCuzKFwdh7z2GHcIOX_tXgxA', #Atlético Madrid
  'UC3Ad7MMhJ1NHAkYbtgbVJ1Q', #Hamid TV (shorts/highlights content)
  'UCyGa1YEx9ST66rYrJTGIKOw', #UEFA (⚠️ allows embedding, but avoid FIFA content)

 #Additional Safe Channels
  'UCcclZ7Nbh0U383eP0N-nV0g', #433 (works well)
  'UCBTy8j2cPy6zw68godcE7MQ', #AFTV
  'UCaBCtORHF5R7GZJ-LUiRxiQ', #Celtic FC
  'UCMZ_fSGkdkOzqi_MTLhU2kA', #Borussia Dortmund
  'UCYo7yOTANHumC7XhvnwBQmA', #Inter Milan (alt)
  'UCemavGDC7r4G4kMra5WmX-g', #Beşiktaş JK
  'UCLSG2HDiE65l2Fl4jSl6eta', #Al Ahly SC
]


SEARCH_QUERY = 'highlights'
MAX_RESULTS = 10
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
        'uploadDate': item['snippet']['publishedAt'],  # ✅ Add this line
        'embedUrl': f"https://www.youtube.com/embed/{item['id']['videoId']}?enablejsapi=1&controls=1&modestbranding=1&autoplay=0"
    } for item in items]

def save_to_json(data, folder, filename):
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)  # <--- key change here
    print(f"✅ Saved {len(data)} shorts to {path}")

# === MAIN ===
def main():
    all_shorts = []
    for channel_id in CHANNEL_IDS:
        print(f"📡 Fetching from channel: {channel_id}")
        shorts = fetch_shorts(channel_id)
        all_shorts.extend(shorts)

    save_to_json(all_shorts, OUTPUT_DIR, OUTPUT_FILE)

if __name__ == "__main__":
    main()
