import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPlayersByTeam } from "../../services/teamProfileService";
import ModernSpinner from "../common/ModernSpinner";
import ErrorMessage from "../common/ErrorMessage";

// Country flag emoji mapping
const countryFlags = {
  Austria: "🇦🇹",
  Argentina: "🇦🇷",
  Brazil: "🇧🇷",
  Colombia: "🇨🇴",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Spain: "🇪🇸",
  England: "🏴",
  Italy: "🇮🇹",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  "United States": "🇺🇸",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  "Saudi Arabia": "🇸🇦",
  Wales: "🏴",
  Croatia: "🇭🇷",
  Uruguay: "🇺🇾",
  Belgium: "🇧🇪",
  Nigeria: "🇳🇬",
  Ghana: "🇬🇭",
  Cameroon: "🇨🇲",
  Morocco: "🇲🇦",
  Senegal: "🇸🇳",
  Poland: "🇵🇱",
  "Czech Republic": "🇨🇿",
  Unknown: "🏳️"
};

const Squad = () => {
  const [players, setPlayers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const encoded = params.get("q");

    if (!encoded) {
      setError("Missing team query.");
      setLoading(false);
      return;
    }

    try {
      const decoded = atob(encoded); // e.g., "ESP_605"
      const [comp, teamId] = decoded.split("_");
      fetchPlayers(comp, teamId);
    } catch {
      setError("Invalid team query.");
      setLoading(false);
    }
  }, [location.search]);

  const fetchPlayers = async (comp, teamId) => {
    try {
      const data = await getPlayersByTeam(comp, Number(teamId));
      const sorted = data.sort((a, b) => {
        const aJ = parseInt(a.Jersey) || 9999;
        const bJ = parseInt(b.Jersey) || 9999;
        return aJ - bJ;
      });
      setPlayers(sorted);
    } catch (err) {
      setError("Failed to load player data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => setVisibleCount((prev) => prev + 20);

  if (loading) return <ModernSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!players.length) return <p className="text-center text-muted">No players available.</p>;

  return (
    <div className="tab-pane active" id="squad">
      <div className="row">
        {players.slice(0, visibleCount).map((player, index) => {
          const nationality = player.Nationality || "Unknown";
          const flag = countryFlags[nationality] || countryFlags["Unknown"];

          const birthDate = player.BirthDate ? new Date(player.BirthDate) : null;
          const age = birthDate
            ? Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000))
            : "-";

          return (
            <div className="col-xl-4 col-lg-6 col-md-6" key={index}>
              <div className="item-player">
                <div className="head-player">
                  <img src={player.PhotoUrl || "img/players/default.jpg"} alt="player" />
                  <div className="overlay">
                    <a href="#">+</a>
                  </div>
                </div>
                <div className="info-player">
                  <span className="number-player">{player.Jersey || "-"}</span>
                  <h4>
                    {player.CommonName || player.Name}
                    <span>{player.Position || "-"}</span>
                  </h4>
                  <ul>
                    <li>
                      <strong>NATIONALITY</strong>{" "}
                      <span>{flag} {nationality}</span>
                    </li>
                    <li><strong>HEIGHT:</strong> <span>{player.Height ? `${player.Height} cm` : "-"}</span></li>
                    <li><strong>WEIGHT:</strong> <span>{player.Weight ? `${player.Weight} kg` : "-"}</span></li>
                    <li><strong>AGE:</strong> <span>{age}</span></li>
                  </ul>
                </div>
                <a href="#" className="btn">
                  View Player <i className="fa fa-angle-right" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {visibleCount < players.length && (
        <div className="text-center mt-4">
          <button className="btn btn-primary" onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Squad;
