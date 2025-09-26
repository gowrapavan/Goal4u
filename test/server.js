import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const API_TOKEN = "18eaa48000cb4abc9db7dfea5e219828";
const LEAGUE = "PD"; 
const SEASON = 2025;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// API: get all matches
app.get("/api/matches", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${LEAGUE}/matches?season=${SEASON}`,
      { headers: { "X-Auth-Token": API_TOKEN } }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: get match by id
app.get("/api/match/:id", async (req, res) => {
  const matchId = req.params.id;
  try {
    const response = await fetch(
      `https://api.football-data.org/v4/matches/${matchId}`,
      { headers: { "X-Auth-Token": API_TOKEN } }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve match.html for front-end routing
app.get("/match.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "match.html"));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
