import React, { useEffect, useState } from "react";
import Loading from "./common/LoadingSpinner";
import ErrorMessage from "./common/ErrorMessage";
import { formatMatchTime } from "../services/matchService";
import { getTeamLogoByKey } from "../services/teamlogo";

const LEAGUE_URLS = {
  EPL: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/matches/EPL.json",
  ESP: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/matches/ESP.json",
  ITA: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/matches/ITA.json",
  GER: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/matches/GER.json",
  FRA: "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/matches/FRA.json",
};

// 🧩 Utility: trim team names to max 4 letters (uppercase, safe fallback)
const trimTeam = (name = "") =>
  name.length > 4 ? name.slice(0, 4).toUpperCase() : name.toUpperCase();

const RecentMatches = () => {
  const [recentMatches, setRecentMatches] = useState([]);
  const [teamLogos, setTeamLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTeamLogos = async (matches) => {
    const logos = {};
    for (const match of matches) {
      const homeKey = match.HomeTeamKey;
      const awayKey = match.AwayTeamKey;

      if (!logos[homeKey]) {
        logos[homeKey] =
          (await getTeamLogoByKey(match.Competition, homeKey)) ||
          match.HomeTeamLogo ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(homeKey)}&background=007bff&color=fff&size=30`;
      }

      if (!logos[awayKey]) {
        logos[awayKey] =
          (await getTeamLogoByKey(match.Competition, awayKey)) ||
          match.AwayTeamLogo ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(awayKey)}&background=dc3545&color=fff&size=30`;
      }
    }
    setTeamLogos(logos);
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const allMatches = [];

      for (const [league, url] of Object.entries(LEAGUE_URLS)) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed ${league}`);
          const data = await res.json();
          data.forEach((m) => (m.Competition = league));
          allMatches.push(...data);
        } catch (err) {
          console.warn(`⚠️ Skipped ${league}: ${err.message}`);
        }
      }

      const pastMatches = allMatches.filter(
        (m) => new Date(m.DateTime).getTime() < Date.now()
      );
      pastMatches.sort(
        (a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime()
      );

      const sliced = pastMatches.slice(0, 4);
      setRecentMatches(sliced);
      await loadTeamLogos(sliced);
    } catch (err) {
      console.error(err);
      setError("Failed to load recent matches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="col-lg-4">
      <div className="recent-results">
        <h5>
          <a href="group-list.html">Recent Results (Top 50 Clubs)</a>
        </h5>
        <div className="info-results">
          {loading ? (
            <div className="text-center py-4">
              <Loading />
            </div>
          ) : error ? (
            <div className="p-3">
              <ErrorMessage message={error} onRetry={fetchMatches} />
            </div>
          ) : (
            <ul>
              {recentMatches && recentMatches.length > 0 ? (
                recentMatches.map((match, index) => (
                  <li key={match.GameId || index}>
                    <span className="head">
                      {match.Competition} -{" "}
                      {trimTeam(match.HomeTeamKey)} vs {trimTeam(match.AwayTeamKey)}
                      <span className="date">
                        {formatMatchTime(match.DateTime)}
                      </span>
                    </span>

                    <div className="goals-result">
                      <a href="single-team.html">
                        <img
                          src={teamLogos[match.HomeTeamKey]}
                          alt={match.HomeTeamKey}
                        />
                        {trimTeam(match.HomeTeamKey)}
                      </a>
                      <span className="goals">
                        {match.HomeTeamScore != null &&
                        match.AwayTeamScore != null ? (
                          <>
                            <b>{match.HomeTeamScore}</b> -{" "}
                            <b>{match.AwayTeamScore}</b>
                          </>
                        ) : (
                          <>
                            <b>{trimTeam(match.HomeTeamKey)}</b> -{" "}
                            <b>{trimTeam(match.AwayTeamKey)}</b>
                          </>
                        )}
                      </span>
                      <a href="single-team.html">
                        <img
                          src={teamLogos[match.AwayTeamKey]}
                          alt={match.AwayTeamKey}
                        />
                        {trimTeam(match.AwayTeamKey)}
                      </a>
                    </div>
                  </li>
                ))
              ) : (
                <li>
                  <div className="text-center text-muted p-3">
                    <p>No recent matches from top 50 clubs available</p>
                    <button
                      onClick={fetchMatches}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Try Again
                    </button>
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <style jsx>{`
        .goals-result img {
          width: 30px;
          height: 30px;
          object-fit: contain;
          border-radius: 4px;
          margin-right: 6px;
          background-color: rgb(36, 32, 31);
        }

        @media (max-width: 768px) {
          .goals-result img {
            width: 26px;
            height: 26px;
          }
        }

        .goals-result a {
          font-size: 0.875rem;
          display: flex;
          align-items: center;
        }

        .goals-result .goals {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0 8px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default RecentMatches;
