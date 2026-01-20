import React, { useEffect, useState } from "react";

const leagueLogos = {
  PL: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/420px-Premier_League_Logo.svg.png",
  PD: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/LaLiga_EA_Sports_2023_Vertical_Logo.svg/500px-LaLiga_EA_Sports_2023_Vertical_Logo.svg.png",
  SA: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ab/Serie_A_ENILIVE_logo.svg/210px-Serie_A_ENILIVE_logo.svg.png",
  BL1: "https://crests.football-data.org/BL1.png",
  FL1: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Logo_Ligue_1_2024.jpg/640px-Logo_Ligue_1_2024.jpg",
  DED: "data:image/png;base64,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",
  CL: "https://crests.football-data.org/CL.png",
};

const TopScorers = () => {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/top_scorers.json"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.leagues) {
          const all = Object.values(data.leagues)
            .flatMap((league) =>
              league.scorers.map((p) => ({
                ...p,
                leagueName: league.competition,
                leagueCode: league.code,
              }))
            )
            .sort((a, b) => b.goals - a.goals);
          setScorers(all);
        }
      })
      .catch((err) => console.error("Failed to load top scorers:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="col-lg-4">
      <div className="player-ranking">
        <h5>
          <a href="group-list.html">Top Scorers (Across All Leagues)</a>
        </h5>
        <div className="info-player">
          {loading ? (
            <p>Loading scorers...</p>
          ) : (
            <ul>
              {scorers.slice(0, 10).map((player, index) => (
                <li key={`${player.player_name}-${index}`}>
                  <span className="position">{index + 1}</span>
                  <a href="player.html" className="flex items-center gap-2">
                    <img
                      src={
                        player.team_crest ||
                        `https://ui-avatars.com/api/?name=${player.player_name}&background=007bff&color=fff&size=30`
                      }
                      alt={player.team_name}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        marginRight: "8px",
                      }}
                    />
                    <span>{player.player_name}</span>
                    {player.leagueCode && leagueLogos[player.leagueCode] && (
                      <img
                        src={leagueLogos[player.leagueCode]}
                        alt={player.leagueName}
                        style={{
                          width: "20px",
                          height: "20px",
                          marginLeft: "8px",
                        }}
                      />
                    )}
                  </a>
                  <span className="points">{player.goals} ⚽</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopScorers;
