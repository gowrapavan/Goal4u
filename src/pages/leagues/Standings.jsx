import React, { useEffect, useState } from "react";
import Loading from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

const API_KEY = "abed26650f654de291dd42cd8dd91ac1";
const STATS_API = `https://api.sportsdata.io/v4/soccer/scores/json/TeamSeasonStats/esp/2025?key=${API_KEY}`;

const Standings = () => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(STATS_API);
        const json = await res.json();
        const data = json[0]?.TeamSeasons || [];

        const formatted = data.map((team) => ({
          TeamId: team.TeamId,
          TeamName: team.Name,
          TeamKey: team.Team,
          GP: team.Games,
          GF: Math.round(team.Goals),
          GA: Math.round(team.OpponentScore),
          GD: Math.round(team.Goals - team.OpponentScore),
          PTS: Math.round(team.Score),
        }));

        const sorted = formatted.sort((a, b) =>
          b.PTS !== a.PTS
            ? b.PTS - a.PTS
            : b.GD !== a.GD
            ? b.GD - a.GD
            : b.GF - a.GF
        );

        setStandings(sorted);
      } catch (err) {
        setError("Failed to load standings: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="content-info">
      <div className="container padding-top">
        <h2>La Liga 2024–25 Standings</h2>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>GP</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>GD</th>
                  <th>PTS</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((t, i) => (
                  <tr key={t.TeamId}>
                    <td>{i + 1}</td>
                    <td style={{ textAlign: "left" }}>
                      <img
                        src={`https://assets.sportsdata.io/images/soccer/teams/64/${t.TeamKey}.png`}
                        alt={t.TeamName}
                        width="24"
                        height="24"
                        style={{ marginRight: 8, verticalAlign: "middle" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/img/go1.png";
                        }}
                      />
                      {t.TeamName}
                    </td>
                    <td>{t.GP}</td>
                    <td>{t.GF}</td>
                    <td>{t.GA}</td>
                    <td>{t.GD}</td>
                    <td><strong>{t.PTS}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Standings;
