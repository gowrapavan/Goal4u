import json
import requests


# === CONFIGURATION ===
channel_ids = [
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
API_KEY = "AIzaSyDGNNJg1aQQ2owQ6FIQcoBNmaQzYiMokPY"  # <-- REPLACE THIS
BASE_URL = "https://www.googleapis.com/youtube/v3/channels"
channel_logos = {}

# STEP 3: Fetch logo for each channel
for channel_id in channel_ids:
    params = {
        "part": "snippet",
        "id": channel_id,
        "key": API_KEY
    }
    response = requests.get(BASE_URL, params=params)
    data = response.json()
    
    if "items" in data and data["items"]:
        snippet = data["items"][0]["snippet"]
        name = snippet["title"]
        logo_url = snippet["thumbnails"]["default"]["url"]
        channel_logos[name] = logo_url
        print(f"✅ Logo fetched for '{name}'")
    else:
        print(f"❌ Failed to fetch data for ID: {channel_id}")

# STEP 4: Save to youtube_logos.json
with open("youtube_logos.json", "w", encoding="utf-8") as f:
    json.dump(channel_logos, f, indent=2,ensure_ascii=False)
    print("✅ Saved channel logos to youtube_logos.json")

# STEP 5: Update videos_data/videos.json
video_file_path = "shorts_data/shorts.json"

with open(video_file_path, "r", encoding="utf-8") as f:
    video_data = json.load(f)

for video in video_data:
    channel_name = video.get("channelName")
    video["channelLogo"] = channel_logos.get(channel_name, "")

# STEP 6: Save updated videos.json
with open(video_file_path, "w", encoding="utf-8") as f:
    json.dump(video_data, f, indent=2,ensure_ascii=False)
    print(f"✅ Updated {video_file_path} with channel logos")
