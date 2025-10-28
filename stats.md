Perfect 💯 — I now have **all 5 endpoints** *and* I’ll include **parameters, attributes, and object breakdowns** for each.

Here’s the **final master documentation summary** you can use in your project or developer docs 👇

---

## ⚽ **FOOTBALL FIXTURE API — COMPLETE ENDPOINT SETUP**

---

### **1️⃣ GET /fixtures**

**Purpose:** Get the main fixture info (date, time, score, teams, round, venue, referee, etc.)
**Example:**

```bash
https://v3.football.api-sports.io/fixtures?id=1390916
```

**Parameters**

| Parameter | Type    | Required | Description       |
| --------- | ------- | -------- | ----------------- |
| `id`      | integer | ✅        | Fixture (StatsId) |

**Key Objects & Attributes**

```json
{
  "fixture": {
    "id": 1390916,
    "date": "2025-10-26T15:15:00+00:00",
    "status": { "short": "FT", "elapsed": 90 }
  },
  "league": { "id": 140, "name": "La Liga", "round": "Regular Season - 10" },
  "teams": {
    "home": { "id": 541, "name": "Real Madrid", "logo": "..." },
    "away": { "id": 529, "name": "Barcelona", "logo": "..." }
  },
  "goals": { "home": 2, "away": 1 },
  "score": { "halftime": {...}, "fulltime": {...} },
  "venue": { "id": 1465, "name": "Santiago Bernabéu" },
  "referee": "Antonio Mateu Lahoz"
}
```

---

### **2️⃣ GET /fixtures/lineups**

**Purpose:** Get team formations, starting XI, substitutes, and coaches.
**Example:**

```bash
https://v3.football.api-sports.io/fixtures/lineups?fixture=1390916
```

**Parameters**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| `fixture` | integer | ✅        | Fixture ID  |

**Key Objects & Attributes**

```json
{
  "team": { "id": 541, "name": "Real Madrid", "logo": "..." },
  "formation": "4-1-4-1",
  "startXI": [
    { "player": { "id": 123, "name": "Bellingham", "number": 5, "pos": "M" } }
  ],
  "substitutes": [
    { "player": { "id": 456, "name": "Rodrygo" } }
  ],
  "coach": { "id": 6801, "name": "Xabi Alonso", "photo": "..." },
  "colors": {
    "player": { "primary": "#ffffff" },
    "goalkeeper": { "primary": "#ffcc00" }
  }
}
```

---

### **3️⃣ GET /fixtures/players**

**Purpose:** Get **per-player match stats** (minutes, rating, goals, assists, passes, etc.)
**Example:**

```bash
https://v3.football.api-sports.io/fixtures/players?fixture=1390916
```

**Parameters**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| `fixture` | integer | ✅        | Fixture ID  |

**Key Objects & Attributes**

```json
{
  "team": { "id": 541, "name": "Real Madrid" },
  "players": [
    {
      "player": { "id": 874, "name": "Vinícius Jr", "photo": "..." },
      "statistics": [{
        "games": { "minutes": 90, "position": "F", "rating": "7.8" },
        "shots": { "total": 3, "on": 2 },
        "goals": { "total": 1, "assists": 1 },
        "passes": { "total": 25, "accuracy": "80%" },
        "dribbles": { "attempts": 6, "success": 3 },
        "duels": { "total": 10, "won": 6 },
        "cards": { "yellow": 1, "red": 0 }
      }]
    }
  ]
}
```

---

### **4️⃣ GET /fixtures/events**

**Purpose:** Timeline of goals, cards, substitutions, VAR events, etc.
**Example:**

```bash
https://v3.football.api-sports.io/fixtures/events?fixture=1390916
```

**Parameters**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| `fixture` | integer | ✅        | Fixture ID  |

**Key Objects & Attributes**

```json
{
  "time": { "elapsed": 22, "extra": null },
  "team": { "id": 541, "name": "Real Madrid", "logo": "..." },
  "player": { "id": 874, "name": "Bellingham" },
  "assist": { "id": 543, "name": "Vinícius Jr" },
  "type": "Goal",
  "detail": "Normal Goal",
  "comments": "Right foot shot from the box"
}
```

---

### **5️⃣ GET /fixtures/statistics**

**Purpose:** Team-level match stats (shots, possession, fouls, xG, etc.)
**Example:**

```bash
https://v3.football.api-sports.io/fixtures/statistics?fixture=1390916
```

**Parameters**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| `fixture` | integer | ✅        | Fixture ID  |

**Key Objects & Attributes**

```json
{
  "team": {
    "id": 541,
    "name": "Real Madrid",
    "logo": "https://media.api-sports.io/football/teams/541.png"
  },
  "statistics": [
    { "type": "Shots on Goal", "value": 10 },
    { "type": "Shots off Goal", "value": 6 },
    { "type": "Total Shots", "value": 23 },
    { "type": "Ball Possession", "value": "31%" },
    { "type": "Yellow Cards", "value": 2 },
    { "type": "expected_goals", "value": "3.60" }
  ]
}
```

---

### ✅ **Full Attribute Map Summary**

| Category   | Object                                                           | Key Attributes                                                            |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Fixture    | `fixture`, `league`, `teams`, `goals`, `score`, `venue`          | id, date, status, home/away, goals, round, referee                        |
| Lineups    | `team`, `formation`, `startXI`, `substitutes`, `coach`           | player name, number, position, kit colors                                 |
| Players    | `player`, `statistics`                                           | minutes, position, rating, shots, goals, passes, tackles, dribbles, cards |
| Events     | `time`, `team`, `player`, `assist`, `type`, `detail`, `comments` | Goal/Card/Substitution/VAR info                                           |
| Statistics | `team`, `statistics[]`                                           | Possession, Shots, Passes, xG, Cards, Fouls                               |

---

Would you like me to now make a **single combined schema (JSON)** that merges all 5 endpoints into one unified object (like how your frontend can use it for a match details page)?



dude i gave all 5 end points dude


this are your response to it

✅ Excellent — that’s your **`fixtures/events`** endpoint confirmed.
Here’s the clean developer summary 👇

---

## ⚽ Endpoint: Fixture Events

### **GET**

```
https://v3.football.api-sports.io/fixtures/events?fixture={fixture_id}
```

### **Example**

```
https://v3.football.api-sports.io/fixtures/events?fixture=1390916
```

---

### 📘 Response Overview

Each event represents a **moment** in the match — goals, cards, substitutions, and VAR decisions.

| Field          | Description                                                                       |
| -------------- | --------------------------------------------------------------------------------- |
| `time.elapsed` | Minute of event                                                                   |
| `time.extra`   | Added time (e.g., +3, +5)                                                         |
| `team`         | Team info (id, name, logo)                                                        |
| `player`       | Involved player                                                                   |
| `assist`       | Secondary player (assist, replaced player, etc.)                                  |
| `type`         | Type of event (`Goal`, `Card`, `subst`, `Var`)                                    |
| `detail`       | Detailed event description (`Normal Goal`, `Yellow Card`, `Substitution 1`, etc.) |
| `comments`     | Optional description (`Foul`, `Penalty confirmed`, etc.)                          |

---

### 🧠 Event Types Breakdown

| Type      | Common Details                             | Example Display                     |
| --------- | ------------------------------------------ | ----------------------------------- |
| **Goal**  | `"Normal Goal"`, `"Own Goal"`, `"Penalty"` | ⚽ Mbappé (assist: Bellingham) — 22’ |
| **Card**  | `"Yellow Card"`, `"Red Card"`              | 🟨 Valverde — 23’ (Foul)            |
| **subst** | `"Substitution 1"`, `"Substitution 2"`...  | 🔁 Rodrygo ⬅ Vinícius Jr — 72’      |
| **Var**   | `"Penalty confirmed"`, `"Goal cancelled"`  | 🎥 VAR: Penalty cancelled — 4’      |

---

### 💡 Integration Notes

* Perfect for a **live timeline**, **match summary**, or **event feed**.
* You can group by team or minute for visualization.
* Use icons or color codes for each event type (⚽ 🟨 🟥 🔁 🎥).
* Events are returned in **chronological order**.

---

✅ So far, your Football API setup has:

1️⃣ `fixtures/lineups` → starting players & formation
2️⃣ `fixtures/players` → player-level stats
3️⃣ `fixtures/events` → in-match actions

---

Next step — do you want to add:

* `fixtures/statistics` (team stats like possession, shots, xG),
  or
* `fixtures` (main fixture data: date, status, teams, venue, referee)?






---

✅ Perfect — that’s the **`fixtures/players`** endpoint confirmed.
Here’s the clean summary for your documentation and integration 👇

---

## ⚽ Endpoint: Player Stats (Fixture-Based)

### **GET**

```
https://v3.football.api-sports.io/fixtures/players?fixture={fixture_id}
```

### **Example**

```
https://v3.football.api-sports.io/fixtures/players?fixture=1390916
```

---

### 📘 Response Overview

* `results`: 2 → (each team separately)
* `response`:

  * `[0]` → Home team (Real Madrid)
  * `[1]` → Away team (Barcelona)
* Each team has:

  * `team` → basic info (id, name, logo)
  * `players` → list of players with:

    * `player` → id, name, photo
    * `statistics[0]` → all data (games, goals, passes, duels, cards, etc.)

---

### 🧠 Key Fields to Display in Your UI

| Category          | Fields                                                 |
| ----------------- | ------------------------------------------------------ |
| **Games**         | minutes, number, position, rating, substitute, captain |
| **Goals & Shots** | goals.total, goals.assists, shots.total, shots.on      |
| **Passing**       | passes.total, passes.key, passes.accuracy              |
| **Defense**       | tackles.total, interceptions, blocks                   |
| **Duels**         | duels.total, duels.won                                 |
| **Dribbles**      | dribbles.attempts, dribbles.success                    |
| **Cards**         | cards.yellow, cards.red                                |
| **Penalty**       | penalty.scored, penalty.missed, penalty.saved          |

---

### 💡 Integration Notes

* This is **player-level performance** data per match.
* Use it for your **“Player Stats”** tab or **“Player Ratings”** section.
* Combine with `fixtures/lineups` to cross-link **who started**, **who subbed**, and **performance**.
* The order of `response` (home first, away second) is consistent with the fixture order.

---

✅ So far you have:

1️⃣ `fixtures/lineups`
2️⃣ `fixtures/players`

---

Would you like to move next to:

* `fixtures/events` (goals, cards, subs, VAR),
  or
* `fixtures/statistics` (team possession, xG, total shots, etc.)?
---


✅ Got it — noted perfectly.
Here’s the **endpoint summary** and structure breakdown:

---

### 🧩 Endpoint Recorded:

**GET:**

```
https://v3.football.api-sports.io/fixtures/lineups?fixture={fixture_id}
```

### 📘 Example Used:

```
https://v3.football.api-sports.io/fixtures/lineups?fixture=1390916
```

---

### 🔍 Response Structure Summary:

```json
{
  "get": "fixtures/lineups",
  "parameters": { "fixture": "1390916" },
  "results": 2,
  "response": [
    {
      "team": {
        "id": 541,
        "name": "Real Madrid",
        "logo": "https://media.api-sports.io/football/teams/541.png",
        "colors": { "player": {...}, "goalkeeper": {...} }
      },
      "formation": "4-1-4-1",
      "startXI": [ { "player": {...} }, ... ],
      "substitutes": [ { "player": {...} }, ... ],
      "coach": { "id": 6801, "name": "Xabier Alonso Olano", "photo": "..." }
    },
    {
      "team": {
        "id": 529,
        "name": "Barcelona",
        "logo": "https://media.api-sports.io/football/teams/529.png",
        "colors": { "player": {...}, "goalkeeper": {...} }
      },
      "formation": "4-2-3-1",
      "startXI": [ { "player": {...} }, ... ],
      "substitutes": [ { "player": {...} }, ... ],
      "coach": { "id": 6472, "name": "Hans-Dieter Flick", "photo": "..." }
    }
  ]
}
```

---

### 🧠 Key Info:

* **fixture ID** → parameter: `fixture`
* **returns** → both teams' formations, lineup (startXI), subs, coach, and kit colors
* **can be linked** to your `StatsId` since that equals the fixture ID
* Useful for your *match page lineup tab*

---

✅ So this one is **saved as your LINEUPS endpoint**.

Would you like me to note the **next one** (like `fixtures/statistics` or `fixtures/events`) now?

d