import React, { useEffect, useState } from "react";
import { getTeamsByCompetition } from "../../services/teamService";
import Loading from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import EmptyState from "../common/EmptyState";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";


const COMPETITIONS = [
  { code: 'ALL', name: 'All Competitions', country: 'All' },
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'UCL', name: 'Champion League', country: 'Europe' },
  { code: 'CWC', name: 'FiFA Club World Cup', country: 'World' },
  { code: 'FIFA', name: 'FiFA World Cup', country: 'World' },
  { code: 'ESP', name: 'La Liga', country: 'Spain' },
  { code: 'ITSA', name: 'Serie A', country: 'Italy' },
  { code: 'DEB', name: 'Bundesliga', country: 'Germany' },
  { code: 'FRL1', name: 'Ligue 1', country: 'France' },
  { code: 'UCL', name: 'UEFA Champions League', country: 'Europe' },
];

const Team = () => {
  const [teams, setTeams] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTeams = async (competitionCode) => {
    setLoading(true);
    setError("");

    try {
      if (competitionCode === "ALL") {
        const results = await Promise.allSettled(
          COMPETITIONS.filter(c => c.code !== "ALL").map(async (c) => {
            const data = await getTeamsByCompetition(c.code);
            return data.map(team => ({
              ...team,
              __compCode: c.code, // attach actual comp code
            }));
          })
        );

        const allTeams = results
          .filter(r => r.status === "fulfilled")
          .flatMap(r => r.value);

        if (allTeams.length === 0) {
          throw new Error("No teams loaded from any competition.");
        }

        setTeams(allTeams);
      } else {
        const data = await getTeamsByCompetition(competitionCode);
        setTeams(data.map(team => ({
          ...team,
          __compCode: competitionCode, // also attach it in single-comp fetch
        })));
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
    <>
    <Helmet>
        <title>Football Teams by Competition | Goal4U</title>
        <meta
          name="description"
          content="Discover football clubs from various global competitions like Premier League, UEFA Champions League, FIFA World Cup, and more. Powered by Goal4U."
        />
        <meta property="og:title" content="Explore Football Teams by League - Goal4U" />
        <meta
          property="og:description"
          content="Search and filter clubs across leagues like La Liga, Serie A, Bundesliga, and more. Detailed team profiles, locations, and info."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://goal4u.netlify.app/teams" />
        <meta property="og:image" content="https://goal4u.netlify.app/assets/img/og-teams.jpg" />
        <link rel="canonical" href="https://goal4u.netlify.app/teams" />
      </Helmet>

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
              const compCode = team.__compCode || selectedCompetition;
              const encodedQuery = btoa(`${compCode}_${team.TeamId}`);

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
                      Team Profile{" "}
                      <i className="fa fa-angle-right" aria-hidden="true"></i>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  </>

  );
};

export default Team;
