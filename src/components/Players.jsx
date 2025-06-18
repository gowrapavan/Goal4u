import React, { useEffect, useState } from "react";
import {
  getTopScorersFromMultipleCompetitions,
  COMPETITIONS
} from "../services/playerstats";
import LoadingSpinner from "./common/LoadingSpinner";
import ErrorMessage from "./common/ErrorMessage";
import EmptyState from "./common/EmptyState";

const TopScorers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCompetitions] = useState(["ESP", "EPL", "ITA", "GER", "FRA"]);

  useEffect(() => {
    const fetchTopScorers = async (competitions) => {
      setLoading(true);
      setError("");
      try {
        const data = await getTopScorersFromMultipleCompetitions(competitions, "2025");
        setPlayers(data.slice(0, 10));
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      }
      setLoading(false);
    };

    fetchTopScorers(selectedCompetitions);
  }, [selectedCompetitions]);

  const getPlayerImage = (player) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      player.Name
    )}&background=007bff&color=fff&size=150`;

  const getCompetitionFlag = (competition) => {
    const flags = {
      ESP: "🇪🇸",
      EPL: "🇬🇧",
      ITA: "🇮🇹",
      GER: "🇩🇪",
      FRA: "🇫🇷"
    };
    return flags[competition] || "⚽";
  };

  if (loading) {
    return (
      <div className="panel-box">
        <div className="titles">
          <h4>Global Top Scorers</h4>
        </div>
        <LoadingSpinner message="Loading top scorers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-box">
        <div className="titles">
          <h4>Global Top Scorers</h4>
        </div>
        <ErrorMessage
          message={error}
          showConfigHelp={error.includes("not configured")}
        />
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="panel-box">
        <div className="titles">
          <h4>Global Top Scorers</h4>
        </div>
        <EmptyState
          icon="fa-futbol-o"
          title="No top scorers available"
          description="Data is not available at the moment."
        />
      </div>
    );
  }

  return (
    <div className="panel-box">
      <div className="titles">
        <h4>Global Top Scorers</h4>
        <p className="team-info">Across Major European Leagues 2025</p>
      </div>

      <div className="row">
        {players.map((player, index) => (
          <div
            key={player.PlayerId || index}
            className="col-xs-6 col-sm-4 col-md-4 col-lg-4 mb-4"
          >
            <div className="box-info shadow-sm border rounded p-3 position-relative bg-white">
              <div className="ranking-badge badge badge-primary">#{index + 1}</div>
              <div className="competition-badge small text-muted mb-2 position-absolute end-0 top-0 m-2">
                {getCompetitionFlag(player.Competition)}
              </div>

              <div className="player-image-container position-relative mb-2">
                <img
                  src={getPlayerImage(player)}
                  alt={player.Name}
                  className="img-fluid rounded-circle player-image"
                />
                <div className="player-overlay">
                  <div className="player-stats d-flex justify-content-between text-white px-2">
                    <span className="position">{player.Position}</span>
                    <span className="jersey">⚽ {player.Goals}</span>
                  </div>
                </div>
              </div>

              <h6 className="entry-title text-center font-weight-bold mb-1">
                <span className="player-name">{player.Name}</span>
              </h6>

              <div className="player-team text-center text-muted small d-flex justify-content-center align-items-center gap-1">
                {player.TeamLogo && (
                  <img
                    src={player.TeamLogo}
                    alt={player.Team}
                    className="team-logo me-1"
                  />
                )}
                <span>{player.Team}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-3">
        <button className="btn btn-outline-primary btn-sm">View All Players</button>
      </div>

      <style>{`
        .panel-box {
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        .titles h4 {
          font-size: 20px;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .team-info {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 15px;
          text-align: center;

        }

        .box-info {
          transition: transform 0.2s ease;
        }

        .box-info:hover {
          transform: scale(1.03);
        }

        .ranking-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 12px;
          padding: 4px 8px;
        }

        .competition-badge {
          font-size: 14px;
        }

        .player-image-container {
          position: relative;
          text-align: center;
        }

        .player-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border: 2px solid #dee2e6;
        }

        .player-overlay {
          position: absolute;
          bottom: 0;
          width: 100%;
          background: rgba(0,0,0,0.4);
          border-radius: 50%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          opacity: 0;
          transition: 0.3s ease;
        }

        .player-image-container:hover .player-overlay {
          opacity: 1;
        }

        .player-stats {
          font-size: 12px;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 0 0 50% 50%;
          padding: 4px 8px;
          width: 100%;
          justify-content: space-between;
        }

        .entry-title {
          font-size: 14px;
        }

        .player-team {
          font-size: 13px;
        }

        .team-logo {
          width: 18px;
          height: 18px;
          object-fit: contain;
          margin-right: 4px;
        }
      `}</style>
    </div>
  );
};

export default TopScorers;
