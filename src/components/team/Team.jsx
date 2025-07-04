import React, { useEffect, useState } from "react";
import { getTeamsByCompetition } from "../../services/teamService";
import Loading from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";
import { Link } from "react-router-dom";

const COMPETITIONS = [
  { code: 'ALL', name: 'All Competitions', country: 'All' },
  { code: 'CWC', name: 'FIFA Club World Cup', country: 'International' },
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'ESP', name: 'La Liga', country: 'Spain' },
  { code: 'ITSA', name: 'Serie A', country: 'Italy' },
  { code: 'DEB', name: 'Bundesliga', country: 'Germany' },
  { code: 'FRL1', name: 'Ligue 1', country: 'France' },
  { code: 'UCL', name: 'UEFA Champions League', country: 'Europe' },
];

const Team = () => {
  const [teams, setTeams] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState("CWC");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTeams = async (competitionCode) => {
    setLoading(true);
    setError("");
    try {
      if (competitionCode === "ALL") {
        const responses = await Promise.all(
          COMPETITIONS.filter(c => c.code !== "ALL").map(c =>
            getTeamsByCompetition(c.code)
          )
        );
        const allTeams = responses.flat();
        setTeams(allTeams);
      } else {
        const data = await getTeamsByCompetition(competitionCode);
        setTeams(data);
      }
    } catch (err) {
      setError(err.message || "Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams(selectedCompetition);
  }, [selectedCompetition]);

  return (
    <section className="content-info">
      {/* Filter Navigation */}
      <div className="portfolioFilter">
        <div className="container">
          <h5>
            <i className="fa fa-filter" aria-hidden="true"></i> Filter By:
          </h5>
          {COMPETITIONS.map((comp) => (
            <a
              href="#"
              key={comp.code}
              className={selectedCompetition === comp.code ? "current" : ""}
              onClick={(e) => {
                e.preventDefault();
                setSelectedCompetition(comp.code);
              }}
            >
              {comp.name}
            </a>
          ))}
        </div>
      </div>

      <div className="container padding-top">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : teams.length === 0 ? (
          <EmptyState message="No teams found." />
        ) : (
          <div className="row portfolioContainer">
            {teams.map((team) => {
              const encodedQuery = btoa(`${selectedCompetition}_${team.TeamId}`);
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
                    <Link
                      to={`/club?q=${encodedQuery}`}
                      className="btn"
                    >
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

export default Team;
