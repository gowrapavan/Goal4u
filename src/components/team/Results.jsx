import React, { useEffect, useState } from "react";
import { fetchTeamLastMatches } from "../../services/teamResultsService";
import { getTeamLogoByKey } from "../../services/teamlogo";
import ModernSpinner from '../common/ModernSpinner';
import ErrorMessage from "../common/ErrorMessage";

const Results = ({ teamData, comp, teamId }) => {
  const [matches, setMatches] = useState([]);
  const [logos, setLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!comp || !teamId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchTeamLastMatches(comp, parseInt(teamId));

        // Filter last 6 relevant results
        const teamKey = teamData?.Key || "";
        const filtered = data
          .filter(
            (m) =>
              (m.HomeTeamKey === teamKey || m.AwayTeamKey === teamKey) &&
              (m.Status === "Final" || m.IsClosed)
          )
          .slice(0, 6);

        const logoMap = {};
        for (const match of filtered) {
          const keys = [match.HomeTeamKey, match.AwayTeamKey];
          for (const key of keys) {
            if (!logoMap[key]) {
              logoMap[key] =
                (await getTeamLogoByKey(match.Competition, key)) ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  key
                )}&background=222&color=fff&size=30`;
            }
          }
        }

        setMatches(filtered);
        setLogos(logoMap);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch results.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [comp, teamId, teamData]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <ModernSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!matches.length) return <p className="text-muted text-center">No recent matches found.</p>;

  return (
    <div className="tab-pane active" id="results">
      <div className="recent-results results-page">
        <div className="info-results">
          <ul>
            {matches.map((match) => (
              <li key={match.GameId}>
                <span className="head">
                  {match.HomeTeamName} vs {match.AwayTeamName}
                  <span className="date">{formatDate(match.DateTime)}</span>
                </span>
                <div className="goals-result">
                  <a href="#">
                    <img src={logos[match.HomeTeamKey]} alt={match.HomeTeamKey} style={{  border: "none",outline: "none" }}/>
                    {match.HomeTeamKey}
                  </a>
                  <span className="goals">
                    <b>{match.HomeScore}</b> - <b>{match.AwayScore}</b>
                    <a href="#" className="btn theme">View More</a>
                  </span>
                  <a href="#">
                    <img src={logos[match.AwayTeamKey]} alt={match.AwayTeamKey} style={{  border: "none",outline: "none" }} />
                    {match.AwayTeamKey}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Results;
