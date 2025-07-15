import React, { useEffect, useState } from "react";
import { getTeamsByCompetition } from "../../services/teamService";
import Loading from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import { Link } from "react-router-dom";
import EPLMatchdaysWithSidebar from "./EPLMatches";

const EPL = () => {
  const COMPETITION_CODE = "EPL";
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getTeamsByCompetition(COMPETITION_CODE);
        setTeams(data);
      } catch (err) {
        setError(err.message || "Failed to load teams.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  return (
    <section className="content-info">
      <div className="container">
        {/* Header Section */}
        <div className="epl-header d-flex align-items-center justify-content-between flex-wrap mb-4">
          {/* Logo & Divider */}
          <div className="d-flex align-items-center gap-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/420px-Premier_League_Logo.svg.png"
              alt="Premier League Logo"
              className="epl-logo"
            />
            <div className="epl-divider d-none d-md-block"></div>
          </div>

          {/* Title + Subtitle */}
          <div className="flex-grow-1 ms-3">
            <h2 className="fw-bold mb-1">Premier League Matches & Standings</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
              Stay updated with real-time fixtures, scores and team rankings.
            </p>

            {/* Mobile League Switch (below subtitle) */}
            <div className="d-md-none mt-3 d-flex gap-3">
              <Link to="/league/laliga" className="styled-arrow-btn w-50 text-center">
                ◀ La Liga
              </Link>
              <Link to="/league/bundesliga" className="styled-arrow-btn w-50 text-center">
                Bundesliga ▶
              </Link>
            </div>
          </div>

          {/* Desktop League Switch (right side) */}
          <div className="league-switch-buttons d-none d-md-flex gap-3">
            <Link to="/league/laliga" className="styled-arrow-btn">
              ◀ La Liga
            </Link>
            <Link to="/league/bundesliga" className="styled-arrow-btn">
              Bundesliga ▶
            </Link>
          </div>

          {/* Styles */}
          <style jsx>{`
            .epl-header {
              padding-left: 35px;
              padding-top: 35px;
            }

            .epl-logo {
              width: 210px;
              height: auto;
              object-fit: contain;
              flex-shrink: 0;
            }

            .epl-divider {
              width: 5px;
              height: 80px;
              background-color: #2e005bdf;
              border-radius: 15px;
            }

            .styled-arrow-btn {
              background-color: #fff;
              color: #2e005b;
              border: 2px solid #2e005b;
              padding: 6px 16px;
              font-weight: 600;
              font-size: 0.95rem;
              border-radius: 8px;
              transition: all 0.25s ease;
              text-decoration: none;
            }

            .styled-arrow-btn:hover {
              background-color: #2e005b;
              color: #fff;
              transform: translateY(-1px);
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            }

            @media (max-width: 576px) {
              .epl-header {
                padding-left: 12px;
                padding-top: 25px;
                    

              }

              .epl-logo {
                width: 70%;
                height: auto;
                padding-bottom:10px;
              }

              .epl-header h2 {
                font-size: 1.25rem;
              }

              .epl-header p {
                font-size: 0.85rem;
              }
            }
          `}</style>
        </div>

        {/* Matchdays & Standings */}
        <EPLMatchdaysWithSidebar />

        {/* Teams Section */}
        <h2 className="mt-5">Premier League Teams</h2>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : teams.length === 0 ? (
          <EmptyState message="No teams found." />
        ) : (
          <div className="row portfolioContainer">
            {teams.map((team) => {
              const encodedQuery = btoa(`${COMPETITION_CODE}_${team.TeamId}`);
              return (
                <div key={team.TeamId} className="col-md-6 col-lg-4 col-xl-3">
                  <div className="item-team">
                    <div className="head-team">
                      <img
                        src={"/assets/img/yt-banner-mb.png"}
                        alt={team.Name}
                        style={{ backgroundColor: team.ClubColor3 || "#fff" }}
                      />
                      <div className="overlay">
                        <a
                          href={team.Website || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          +
                        </a>
                      </div>
                    </div>
                    <div className="info-team">
                      <span className="logo-team">
                        <img
                          src={team.WikipediaLogoUrl || "placeholder-logo.png"}
                          alt={team.Name}
                        />
                      </span>
                      <h4>{team.Name}</h4>
                      <span className="location-team">
                        <i className="fa fa-map-marker" aria-hidden="true"></i>
                        {team.VenueName || "Unknown Venue"}
                      </span>
                      <span className="group-team">
                        <i className="fa fa-trophy" aria-hidden="true"></i>
                        {team.AreaName || "Unknown Country"}
                      </span>
                    </div>
                    <Link to={`/club?q=${encodedQuery}`} className="btn">
                      Team Profile <i className="fa fa-angle-right" aria-hidden="true"></i>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default EPL;
