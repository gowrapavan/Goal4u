import requests
import json

# ---------------- CONFIGURATION ---------------- #
API_TOKEN = "ZFC8uzXaWgYANnDwFAR0LcQzN6eF5612tV63qSzY34D9U5eCSqIh2h5OGyFg"   # 🔑 Make sure this is pasted correctly!
BASE_URL = "https://api.sportmonks.com/v3/football/leagues"

def list_my_leagues():
    print("🔎 Fetching all leagues available in your plan...")

    params = {
        "api_token": API_TOKEN,
        "include": "country" # Include country name so we know where the league is
    }

    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if 'data' in data:
            leagues = data['data']
            print(f"\n✅ You have access to {len(leagues)} league(s):")
            print("=" * 50)
            print(f"{'ID':<10} | {'League Name':<30} | {'Country'}")
            print("-" * 50)
            
            for league in leagues:
                l_id = league.get('id')
                l_name = league.get('name')
                
                # Get country name safely
                c_name = "Unknown"
                if league.get('country'):
                    c_name = league['country'].get('name')
                
                print(f"{l_id:<10} | {l_name:<30} | {c_name}")
            print("=" * 50)
        else:
            print("⚠️ Request worked, but returned no data.")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    list_my_leagues()