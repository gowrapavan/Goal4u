#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime

# ======================
# ⚙️ CONFIGURATION
# ======================
API_KEY = "18eaa48000cb4abc9db7dfea5e219828"   # Your Football-Data.org API key
BASE_URL = "https://api.football-data.org/v4/competitions"

# Competitions to fetch
COMPETITIONS = {
    "PL": "Premier League",
    "PD": "La Liga",
    "SA": "Serie A",
    "BL1": "Bundesliga",
    "FL1": "Ligue 1",
    "DED": "Eredivisie",
    "CL": "Champions League"
}

HEADERS = {"X-Auth-Token": API_KEY}

# Output folder
OUTPUT_DIR = "teams"


# ======================
# 🏃 FETCH FUNCTION
# ======================
def fetch_teams(competition_code):
    """Fetch all teams for a given competition code."""
    url = f"{BASE_URL}/{competition_code}/teams"
    try:
        res = requests.get(url, headers=HEADERS)
        res.raise_for_status()
        data = res.json()

        teams = []
        for team in data.get("teams", []):
            teams.append({
                "id": team.get("id"),
                "name": team.get("name"),
                "shortName": team.get("shortName"),
                "tla": team.get("tla"),
                "crest": team.get("crest"),
                "address": team.get("address"),
                "website": team.get("website"),
                "founded": team.get("founded"),
                "venue": team.get("venue"),
                "clubColors": team.get("clubColors"),
                "area": team.get("area", {}).get("name")
            })

        # Save JSON per league
        filename = f"{OUTPUT_DIR}/{competition_code}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(teams, f, indent=4, ensure_ascii=False)

        print(f"✅ Saved {len(teams)} teams for {competition_code}")
        return teams

    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching {competition_code}: {e}")
        return []


# ======================
# 💾 MAIN EXECUTION
# ======================
def main():
    import os
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for code, name in COMPETITIONS.items():
        print(f"⚽ Fetching {name} ({code}) teams...")
        fetch_teams(code)
        time.sleep(6)  # Avoid rate limit (10 requests/min)

    print(f"\n✅ All league team data saved in '{OUTPUT_DIR}/' folder.")


if __name__ == "__main__":
    main()
