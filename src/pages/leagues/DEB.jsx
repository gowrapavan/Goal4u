import React, { useEffect, useState } from "react";
import { getTeamsByCompetition } from "../../services/teamService";
import Loading from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import { Link } from "react-router-dom";
import BundesligaMatchdaysWithSidebar from "./BundesligaMatches";

const Bundesliga = () => {
  const COMPETITION_CODE = "DEB";
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
        <div className="deb-header d-flex align-items-center justify-content-between flex-wrap mb-4">
          {/* Logo & Divider */}
          <div className="d-flex align-items-center gap-3">
            <img
              src=" https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/270px-Bundesliga_logo_%282017%29.svg.png"
              alt="Bundesliga Logo"
              className="deb-logo"
            />
            <div className="deb-divider d-none d-md-block"></div>
          </div>

          {/* Title + Subtitle */}
          <div className="flex-grow-1 ms-3">
            <h2 className="fw-bold mb-1">Bundesliga Matches & Standings</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
              Stay updated with real-time fixtures, scores and team rankings.
            </p>

            {/* Mobile League Switch */}
            <div className="d-md-none mt-3 d-flex gap-3">
              <Link to="/league/EPL" className="styled-arrow-btn w-50 text-center">
                ◀ Premier League
              </Link>
              <Link to="/league/laliga" className="styled-arrow-btn w-50 text-center">
                La Liga ▶
              </Link>
            </div>
          </div>

          {/* Desktop League Switch */}
          <div className="league-switch-buttons d-none d-md-flex gap-3">
            <Link to="/league/EPL" className="styled-arrow-btn">
              ◀ Premier League
            </Link>
            <Link to="/league/laliga" className="styled-arrow-btn">
              La Liga ▶
            </Link>
          </div>

          {/* Styles */}
          <style jsx>{`
            .deb-header {
              padding-left: 35px;
              padding-top: 35px;
            }

            .deb-logo {
              width: 100px;
              height: auto;
              object-fit: contain;
              flex-shrink: 0;
            }

            .deb-divider {
              width: 5px;
              height: 80px;
              background-color: #df1717ff;
              border-radius: 15px;
            }

            .styled-arrow-btn {
              background-color: #fff;
              color: #e71a1aff;
              border: 2px solid #d60000;
              padding: 6px 16px;
              font-weight: 600;
              font-size: 0.95rem;
              border-radius: 8px;
              transition: all 0.25s ease;
              text-decoration: none;
            }

            .styled-arrow-btn:hover {
              background-color: #d60000;
              color: #fff;
              transform: translateY(-1px);
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            }

            @media (max-width: 576px) {
              .deb-header {
                padding-left: 12px;
                padding-top: 25px;
              }

              .deb-logo {
                width: 80%;
                height: auto;
                padding-bottom: 10px;
                padding-left: 40%;

              }
                .styled-arrow-btn {
              background-color: #fff;
              color: #e71a1aff;
              border: 2px solid #d60000;
              padding: 6px 16px;
              font-weight: 600;
              font-size: 0.85rem;
              border-radius: 8px;
              transition: all 0.25s ease;
              text-decoration: none;
            }

              .deb-header h2 {
                font-size: 1.25rem;
              }

              .deb-header p {
                font-size: 0.85rem;
              }
            }
          `}</style>
        </div>

        {/* Matchdays & Standings */}
        <BundesligaMatchdaysWithSidebar />

        {/* Teams Section */}
        <h2 className="mt-5">Bundesliga Teams</h2>
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

export default Bundesliga;
