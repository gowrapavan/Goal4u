import requests
import json
import os
import unicodedata
import re
import time
from datetime import datetime, timedelta
from difflib import SequenceMatcher  # fuzzy string matching

# ---------------- CONFIG ---------------- #
API_KEY = "7120426d0dc6a0486626407834572f25"
BASE_URL = "https://v3.football.api-sports.io/fixtures"
HEADERS = {"x-apisports-key": API_KEY}

LEAGUES = {
    "DEB": 78,
    "EPL": 39,
    "ESP": 140,
    "FRL1": 61,
    "ITSA": 135
}

TIMEZONE = "Europe/London"
OUTPUT_DIR = "stats"
SCHEDULE_DIR = "2026"
FUZZY_THRESHOLD = 0.6
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------- HELPERS ---------------- #
def format_date(date):
    return date.strftime("%Y-%m-%d")

def fetch_json(url, params=None):
    """Fetch API JSON safely and handle errors + rate limits."""
    while True:
        try:
            res = requests.get(url, headers=HEADERS, params=params)
            data = res.json()

            # Handle plan limits or API-specific errors
            if "errors" in data and data["errors"]:
                print(f"⚠️ API Limit or Error: {data['errors']}")
                print("⏳ Waiting 60 seconds before retry...")
                time.sleep(60)
                continue

            res.raise_for_status()
            return data
        except requests.exceptions.RequestException as e:
            print(f"❌ Network/API Error: {e}")
            print("⏳ Retrying in 30 seconds...")
            time.sleep(30)

def fetch_matches_by_date(date_str):
    """Get fixtures for a given date."""
    url = f"{BASE_URL}?date={date_str}&timezone={TIMEZONE}"
    data = fetch_json(url)
    return data.get("response", [])

def fetch_fixture_data(fixture_id, data_type):
    """Fetch a specific fixture’s events/lineups/stats/players with rate limit handling."""
    url = f"https://v3.football.api-sports.io/fixtures/{data_type}?fixture={fixture_id}"
    while True:
        data = fetch_json(url)
        if isinstance(data, dict) and "rateLimit" in data:
            print(f"⚠️ Rate limit reached. Waiting 60s before retrying {data_type} for {fixture_id}...")
            time.sleep(60)
            continue
        return data.get("response", [])

def normalize_name(name: str) -> str:
    """Normalize team names for fuzzy matching."""
    if not name:
        return ""
    name = name.lower()
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("utf-8")
    name = re.sub(r"\b(fc|cf|real|deportivo|club|atletico|athletic|ud|cd)\b", "", name)
    name = re.sub(r"[^a-z0-9]+", " ", name)
    return name.strip()

def string_similarity(a, b):
    return SequenceMatcher(None, normalize_name(a), normalize_name(b)).ratio()

def find_game_id(league_name, match_date, home_team, away_team):
    """Find the GameId from the schedule JSON using fuzzy matching."""
    schedule_file = os.path.join(SCHEDULE_DIR, f"{league_name}.json")
    if not os.path.exists(schedule_file):
        return None

    with open(schedule_file, "r", encoding="utf-8") as f:
        schedule_data = json.load(f)

    best_match = None
    best_score = 0.0

    for match in schedule_data:
        sched_date = match.get("Date", "")[:10]
        if sched_date != match_date:
            continue

        sched_home_names = [
            match.get("HomeTeamName", ""),
            match.get("HomeTeamKey", ""),
            match.get("HomeTeam", "")
        ]
        sched_away_names = [
            match.get("AwayTeamName", ""),
            match.get("AwayTeamKey", ""),
            match.get("AwayTeam", "")
        ]

        home_sim = max(string_similarity(home_team, n) for n in sched_home_names if n)
        away_sim = max(string_similarity(away_team, n) for n in sched_away_names if n)
        score = (home_sim + away_sim) / 2

        if score > best_score:
            best_score = score
            best_match = match

    if best_match and best_score >= FUZZY_THRESHOLD:
        return best_match.get("GameId")
    return None

# ---------------- MAIN ---------------- #
def main():
    for delta_days in [1, 0, -1]:  # Yesterday, today, tomorrow
        target_date = datetime.utcnow() - timedelta(days=delta_days)
        date_str = format_date(target_date)
        print(f"\n📅 Fetching matches for {date_str}...")

        all_fixtures = fetch_matches_by_date(date_str)

        for league_name, league_id in LEAGUES.items():
            fixtures = [f for f in all_fixtures if f["league"]["id"] == league_id]
            if not fixtures:
                print(f"No matches found for {league_name} on {date_str}.")
                continue

            output_file = os.path.join(OUTPUT_DIR, f"{league_name}.json")

            # Load existing data if present
            if os.path.exists(output_file):
                with open(output_file, "r", encoding="utf-8") as f:
                    existing_data_dict = {m["StatsId"]: m for m in json.load(f)}
            else:
                existing_data_dict = {}

            for f in fixtures:
                fixture_id = f["fixture"]["id"]
                match_date = f["fixture"]["date"][:10]
                home_team = f["teams"]["home"]["name"]
                away_team = f["teams"]["away"]["name"]
                status = f["fixture"]["status"]["short"]

                game_id = find_game_id(league_name, match_date, home_team, away_team)
                if not game_id:
                    print(f"⚠️ No GameId found for {home_team} vs {away_team} on {match_date}, skipping...")
                    continue

                # Load existing entry (if any)
                existing = existing_data_dict.get(fixture_id, {})

                match_obj = {
                    "StatsId": fixture_id,
                    "GameId": game_id,
                    "Date": f["fixture"]["date"],
                    "Status": status,
                    "Round": f["league"].get("round"),
                    "HomeTeam": home_team,
                    "AwayTeam": away_team,
                    "Score": {
                        "Home": f["goals"]["home"],
                        "Away": f["goals"]["away"]
                    },
                    "Events": existing.get("Events", []),
                    "Lineups": existing.get("Lineups", []),
                    "Statistics": existing.get("Statistics", []),
                    "Players": existing.get("Players", [])
                }

                try:
                    # Only fetch missing fields
                    if not match_obj["Events"]:
                        match_obj["Events"] = fetch_fixture_data(fixture_id, "events")
                    if not match_obj["Lineups"]:
                        match_obj["Lineups"] = fetch_fixture_data(fixture_id, "lineups")
                    if not match_obj["Statistics"]:
                        match_obj["Statistics"] = fetch_fixture_data(fixture_id, "statistics")
                    if not match_obj["Players"]:
                        match_obj["Players"] = fetch_fixture_data(fixture_id, "players")

                    # Delay between each fixture to avoid rate limit
                    time.sleep(6)

                except requests.HTTPError as e:
                    print(f"❌ Error fetching details for fixture {fixture_id}: {e}")
                    continue

                existing_data_dict[fixture_id] = match_obj

            # Save updated stats
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(list(existing_data_dict.values()), f, ensure_ascii=False, indent=2)

            print(f"💾 Saved {len(existing_data_dict)} total matches to {output_file}")

if __name__ == "__main__":
    main()
