import requests
import json
import time
import unicodedata

API_KEYS = [
    "e093681e754ae386defe551730b97a0a",
    "0ff3c5a4f3b3b47d2828c3e7b423d0ac"
]

BASE_URL = "https://v3.football.api-sports.io/"
current_key_index = 0

# Cache to avoid repeated API calls
cache = {}


def get_headers():
    global current_key_index
    return {"x-apisports-key": API_KEYS[current_key_index]}


def switch_key():
    """Rotate API key when rate-limited."""
    global current_key_index
    current_key_index = (current_key_index + 1) % len(API_KEYS)
    print(f"\n🔄 Switching API key → KEY {current_key_index + 1}\n")
    time.sleep(1)


def normalize(text):
    return ''.join(
        c for c in unicodedata.normalize('NFKD', text)
        if not unicodedata.combining(c)
    )


def api_request(url):
    """Handles automatic retries, rate limit, and key rotation."""
    while True:
        response = requests.get(url, headers=get_headers())
        data = response.json()

        # RATE LIMIT
        if "errors" in data and "rateLimit" in data["errors"]:
            print("⚠️  Rate limit hit → switching key...")
            switch_key()
            continue

        return data


def search_api_football(name):
    """Search API using profiles + fallback name versions."""
    norm = normalize(name)

    # Return cached result if exists
    if norm in cache:
        return cache[norm]

    attempts = [name, norm]

    # Add surname fallback
    split_name = norm.split(" ")
    if len(split_name) >= 2:
        attempts.append(split_name[-1])

    for q in attempts:
        if len(q) < 3:
            continue

        url = BASE_URL + f"players/profiles?search={q}"
        data = api_request(url)

        # Found player
        if data.get("results", 0) > 0:
            photo = data["response"][0]["player"].get("photo", None)
            cache[norm] = photo
            return photo

        # Avoid rapid same-key calls
        time.sleep(0.4)

    # Truly not found
    cache[norm] = None
    return None


def add_images(data):
    for club in data:
        for p in club["squad"]:
            name = p["name"]

            img = search_api_football(name)
            p["image"] = img if img else "not_found"

            print(f"{name} → {p['image']}")
            time.sleep(0.4)

    return data


# Load your JSON
with open("teams.json", "r", encoding="utf-8") as f:
    teams = json.load(f)

updated = add_images(teams)

with open("teams_with_images.json", "w", encoding="utf-8") as f:
    json.dump(updated, f, indent=2, ensure_ascii=False)

print("\n🎉 DONE — All players processed successfully!\n")
