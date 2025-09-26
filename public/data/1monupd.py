import requests
import json
import os
import time
from datetime import datetime, timedelta

API_KEY = "9578f3077e264f6f8ef67fb61998f6d8"
#8218229833c24ae3b74cdbbcda076b9d

COMPETITIONS = ["DEB","ELC","EPL","ESP","FRL1","ITSA","MLS","UCL","UEL"]
YEAR = "2026"
SAVE_DIR = f"./2026"

os.makedirs(SAVE_DIR, exist_ok=True)

today = datetime.utcnow()

for comp in COMPETITIONS:
    print(f"\n📦 Fetching schedule for {comp.upper()}...")

    schedule_url = f"https://api.sportsdata.io/v4/soccer/scores/json/Schedule/{comp}/{YEAR}?key={API_KEY}"
    try:
        schedule_response = requests.get(schedule_url)
        if schedule_response.status_code != 200:
            print(f"❌ Failed to fetch schedule for {comp.upper()} — Status {schedule_response.status_code}")
            continue

        try:
            seasons = schedule_response.json()
        except json.JSONDecodeError:
            print(f"❌ Malformed JSON for {comp.upper()}")
            continue

        file_path = os.path.join(SAVE_DIR, f"{comp}.json")
        games_data = []
        updated_game_ids = set()

        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                try:
                    games_data = json.load(f)
                except Exception as e:
                    print(f"⚠️ Could not load existing file: {e}")

        game_map = {g["GameId"]: g for g in games_data}

        for season in seasons:
            round_id = season.get("RoundId")
            round_name = season.get("Name")

            if "Games" not in season:
                continue

            for game in season["Games"]:
                game_id = game.get("GameId")
                HomeKey = game.get("HomeTeamKey")
                AwayKey = game.get("AwayTeamKey")

                if not game_id:
                    continue

                date_str = game.get("Day")
                try:
                    match_date = datetime.fromisoformat(date_str)
                except:
                    continue  # skip if date is bad

                # ⛔️ Skip future matches
                if match_date > today:
                    continue

                status = game.get("Status")
                existing = game_map.get(game_id)
                already_final = existing and existing.get("Status") == "Final"

                # ⛔️ Skip matches already marked as final in existing JSON
                if already_final:
                    continue

                print(f"🔄 Updating match: {game_id} - {HomeKey} vs {AwayKey} (Status: {status})")

                home_id = game.get("HomeTeamId")
                away_id = game.get("AwayTeamId")

                match = {
                    "GameId": game_id,
                    "RoundId": round_id,
                    "RoundName": round_name,
                    "Date": date_str,
                    "DateTime": game.get("DateTime"),
                    "Status": status,
                    "Week": game.get("Week"),
                    "VenueType": game.get("VenueType"),
                    "HomeTeamId": home_id,
                    "AwayTeamId": away_id,
                    "HomeTeamKey": game.get("HomeTeamKey"),
                    "AwayTeamKey": game.get("AwayTeamKey"),
                    "HomeTeamName": game.get("HomeTeamName"),
                    "AwayTeamName": game.get("AwayTeamName"),
                    "HomeTeamScore": None,
                    "AwayTeamScore": None,
                    "Result": None,
                    "Points": {},
                    "Goals": []
                }

                if status == "Final":
                    print(f"⚽ Fetching BoxScore for Game ID: {game_id}")
                    box_url = f"https://api.sportsdata.io/v4/soccer/stats/json/BoxScoreFinal/{comp}/{game_id}?key={API_KEY}"
                    box_res = requests.get(box_url)

                    if box_res.status_code == 200:
                        try:
                            box_data = box_res.json()
                            if isinstance(box_data, list) and box_data:
                                box = box_data[0]
                                goals = [g for g in box.get("Goals", []) if g["Type"] in ["Goal", "PenaltyGoal", "OwnGoal"]]

                                home_score = sum(
                                    1 for g in goals if
                                    (g["Type"] in ["Goal", "PenaltyGoal"] and g["TeamId"] == home_id) or
                                    (g["Type"] == "OwnGoal" and g["TeamId"] == away_id)
                                )
                                away_score = sum(
                                    1 for g in goals if
                                    (g["Type"] in ["Goal", "PenaltyGoal"] and g["TeamId"] == away_id) or
                                    (g["Type"] == "OwnGoal" and g["TeamId"] == home_id)
                                )

                                points = {str(home_id): 0, str(away_id): 0}
                                result = None
                                if home_score > away_score:
                                    points[str(home_id)] = 3
                                    result = home_id
                                elif away_score > home_score:
                                    points[str(away_id)] = 3
                                    result = away_id
                                else:
                                    points[str(home_id)] = 1
                                    points[str(away_id)] = 1

                                match.update({
                                    "HomeTeamScore": home_score,
                                    "AwayTeamScore": away_score,
                                    "Result": result,
                                    "Points": points,
                                    "Goals": goals
                                })
                        except Exception as e:
                            print(f"⚠️ Error processing BoxScore: {e}")
                    else:
                        print(f"❌ Skipping Game ID {game_id} — Status {box_res.status_code}")

                    time.sleep(1)

                game_map[game_id] = match
                updated_game_ids.add(game_id)

        final_games = list(game_map.values())
        final_games = sorted(final_games, key=lambda x: x["GameId"])
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(final_games, f, indent=2, ensure_ascii=False)

        print(f"✅ Updated {len(updated_game_ids)} matches in {file_path}")

    except Exception as e:
        print(f"❌ Unexpected error for {comp.upper()}: {e}")
