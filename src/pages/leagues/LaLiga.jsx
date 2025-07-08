import React, { useEffect, useState } from "react";
import { getTeamsByCompetition } from "../../services/teamService";
import Loading from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import { Link } from "react-router-dom";
import LaLigaMatchdaysWithSidebar from "./LaLigaMatches";

const LaLiga = () => {
  const COMPETITION_CODE = "ESP";
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
      <div className="container padding-top">
        <h2>La Liga Matches</h2>
       <LaLigaMatchdaysWithSidebar />


        <h2 className="mt-5">La Liga Teams</h2>
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
                        <a href={team.Website || "#"} target="_blank" rel="noopener noreferrer">+</a>
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

export default LaLiga;
