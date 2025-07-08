import requests
import json
import os
import time

API_KEY = "2373ef4249704a7d836b0d02e1bb0bc9"
COMPETITIONS = [   "cwc"]
YEAR = "2025"
SAVE_DIR = f"./{YEAR}"

os.makedirs(SAVE_DIR, exist_ok=True)

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

        games_data = []
        already_fetched_ids = set()
        file_path = os.path.join(SAVE_DIR, f"{comp}.json")

        # 🔁 Load old matches (to update only new ones)
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                try:
                    old_data = json.load(f)
                    games_data = old_data
                    already_fetched_ids = {g["GameId"] for g in old_data if "GameId" in g}
                    print(f"🔄 Resuming from {len(already_fetched_ids)} existing matches")
                except Exception as e:
                    print(f"⚠️ Could not load existing file: {e}")

        for season in seasons:
            round_id = season.get("RoundId")
            round_name = season.get("Name")

            if "Games" not in season:
                continue

            for game in season["Games"]:
                game_id = game.get("GameId")
                if not game_id:
                    continue

                home_id = game.get("HomeTeamId")
                away_id = game.get("AwayTeamId")

                # Base match info from Schedule API
                match = {
                    "GameId": game_id,
                    "RoundId": round_id,
                    "RoundName": round_name,
                    "Date": game.get("Day"),
                    "DateTime": game.get("DateTime"),
                    "Status": game.get("Status"),
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

                # Fetch BoxScoreFinal only if match is Final and not already saved
                if game_id not in already_fetched_ids and game.get("Status") == "Final":
                    print(f"⚽ BoxScore for Game ID: {game_id}")

                    box_url = f"https://api.sportsdata.io/v4/soccer/stats/json/BoxScoreFinal/{comp}/{game_id}?key={API_KEY}"
                    box_res = requests.get(box_url)

                    if box_res.status_code != 200:
                        print(f"❌ Skipping Game ID {game_id} — Status {box_res.status_code}")
                    else:
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

                    time.sleep(1)

                games_data = [g for g in games_data if g["GameId"] != game_id]  # Remove if existing (to update)
                games_data.append(match)

        # 📝 Save final sorted JSON
        games_data = sorted(games_data, key=lambda x: x["GameId"])
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(games_data, f, indent=2, ensure_ascii=False)

        print(f"✅ Saved {len(games_data)} matches to {file_path}")

    except Exception as e:
        print(f"❌ Unexpected error for {comp.upper()}: {e}")
