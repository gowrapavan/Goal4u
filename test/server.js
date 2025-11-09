// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const API_KEY = "18eaa48000cb4abc9db7dfea5e219828"; // your football-data.org key

// Dynamic scorers route for any competition (e.g., /api/scorers/PL)
app.get("/api/scorers/:competitionCode", async (req, res) => {
  const { competitionCode } = req.params;
  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${competitionCode}/scorers`,
      { headers: { "X-Auth-Token": API_KEY } }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch scorers" });
  }
});

app.listen(5000, () =>
  console.log("✅ Proxy server running on http://localhost:5000")
);
