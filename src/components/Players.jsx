import React, { useEffect, useState } from "react";
import {
  getTopScorersFromMultipleCompetitions,
  COMPETITIONS,
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
    player.PhotoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      player.Name
    )}&background=007bff&color=fff&size=150`;

  const getCompetitionFlag = (competition) => {
    const flags = {
      ESP: "🇪🇸",
      EPL: "🇬🇧",
      ITA: "🇮🇹",
      GER: "🇩🇪",
      FRA: "🇫🇷",
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
            <div className="ts-box shadow-sm border rounded p-3 position-relative bg-white">
              <div className="ts-rank badge bg-primary text-white">
                #{index + 1}
              </div>
              <div className="ts-flag small text-muted position-absolute end-0 top-0 m-2">
                {getCompetitionFlag(player.Competition)}
              </div>

              <div className="ts-image-wrapper position-relative mb-2">
                <img
                  src={getPlayerImage(player)}
                  alt={player.Name}
                  className="img-fluid ts-image"
                />
                <div className="ts-overlay">
                  <div className="ts-stats d-flex justify-content-between text-white px-2">
                    <span>{player.Position}</span>
                    <span>⚽ {player.Goals}</span>
                  </div>
                </div>
              </div>

              <h6 className="ts-name text-center fw-bold mb-1">
                {player.Name}
              </h6>

              <div className="ts-team text-center text-muted small d-flex justify-content-center align-items-center gap-1">
                {player.TeamLogo && (
                  <img
                    src={player.TeamLogo}
                    alt={player.Team}
                    className="ts-team-logo me-1"
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
        .ts-box {
          transition: transform 0.2s ease;
          text-align: center;
        }

        .ts-box:hover {
          transform: scale(1.03);
        }

        .ts-rank {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 12px;
          padding: 4px 8px;
        }

        .ts-flag {
          font-size: 14px;
        }

        .ts-image-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/assets/img/demonews.png'); /* example */
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
}


        .ts-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ts-overlay {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          opacity: 0;
          transition: 0.3s ease;
        }

        .ts-image-wrapper:hover .ts-overlay {
          opacity: 1;
        }

        .ts-stats {
          font-size: 12px;
          background-color: rgba(0, 0, 0, 0.6);
          padding: 4px 8px;
          width: 100%;
          justify-content: space-between;
        }

        .ts-name {
          font-size: 14px;
        }

        .ts-team {
          font-size: 13px;
        }

        .ts-team-logo {
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
