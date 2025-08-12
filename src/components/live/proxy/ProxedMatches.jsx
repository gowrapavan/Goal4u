import React, { useEffect, useState } from "react";
import ModernSpinner from "../../common/ModernSpinner";
import ErrorMessage from "../../common/ErrorMessage";
import { fetchTotalsportekMatches } from "./services/TotalsportekMatchList";
const ProxedMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchedMatches = await fetchTotalsportekMatches();

        setMatches(fetchedMatches);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const formatMatchDate = (dateStr) =>
    new Date(dateStr).toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleMatchClick = (url) => {
    window.open(url, "_blank");
  };

  const handleHighlightsClick = (e, elixxUrl) => {
    e.stopPropagation();
    if (elixxUrl) {
      window.open(elixxUrl, "_blank");
    } else {
      alert("Highlights URL not available");
    }
  };

  const handleKeyDown = (e, url) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleMatchClick(url);
    }
  };

  // Sort matches: highlighted first, then by time ascending
  const sortedMatches = [...matches].sort((a, b) => {
    if (a.hasHighlight && !b.hasHighlight) return -1;
    if (!a.hasHighlight && b.hasHighlight) return 1;
    return new Date(a.time) - new Date(b.time);
  });

  return (
    <div className="live-match-list container" style={{ marginTop: "2rem" }}>
      <h3 style={{ color: "#212529" }}>Full GoalU Matches</h3>

      {loading ? (
        <ModernSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : sortedMatches.length > 0 ? (
        <ul className="match-list list-unstyled">
          {sortedMatches.map((match) => (
            <li
              key={match.id || `${match.home}-${match.away}-${match.time}`}
              className={`mb-3 p-3 border rounded text-center position-relative ${
                match.hasHighlight ? "highlight-match" : "bg-white"
              }`}
              style={{ cursor: "pointer", transition: "background-color 0.3s ease" }}
              onClick={() => handleMatchClick(match.url)}
              onKeyDown={(e) => handleKeyDown(e, match.url)}
              tabIndex={0}
              role="button"
              aria-label={`${match.home} vs ${match.away}, ${formatMatchDate(
                match.time
              )} ${match.hasHighlight ? ", Also on Elixx with highlights" : ""}`}
            >
              {match.hasHighlight && (
                <div
                  className="elixx-badge d-flex align-items-center justify-content-center"
                  title="Also available on Elixx"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-lightning-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.3 1L1 9h5l-1 6 10-8h-5l1-6z" />
                  </svg>
                </div>
              )}
              <div className="match-header d-flex justify-content-between align-items-center mb-2 flex-wrap">
                <span className="text-muted small fw-medium text-start">Match4U</span>
                <span
                  className="fw-bold match-center-text text-truncate px-2"
                  style={{ flexGrow: 1 }}
                >
                  {match.home} vs {match.away}
                </span>
                <span className="date small text-muted text-end" style={{ minWidth: "90px" }}>
                  {formatMatchDate(match.time)}
                </span>
              </div>
              <div className="goals-result d-flex align-items-center justify-content-between flex-wrap">
                <span className="d-flex align-items-center text-dark" style={{ minWidth: "40%" }}>
                  <img
                    src={
                      match.homeLogo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(match.home)}&background=007bff&color=fff`
                    }
                    alt={match.home}
                    width="30"
                    height="30"
                    style={{ objectFit: "contain", borderRadius: "4px" }}
                    onError={(e) =>
                      (e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        match.home
                      )}&background=007bff&color=fff`)
                    }
                  />
                 <span className="ms-2 team-name">{match.home}</span>

                </span>
                <span className="goals mx-2" style={{ fontWeight: "bold", color: "#666" }}>
                  - : -
                </span>
                <span
                  className="d-flex align-items-center text-dark justify-content-end"
                  style={{ minWidth: "40%" }}
                >
                 <span className="me-2 team-name">{match.away}</span>

                  <img
                    src={
                      match.awayLogo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(match.away)}&background=28a745&color=fff`
                    }
                    alt={match.away}
                    width="30"
                    height="30"
                    style={{ objectFit: "contain", borderRadius: "4px" }}
                    onError={(e) =>
                      (e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        match.away
                      )}&background=28a745&color=fff`)
                    }
                  />
                </span>
              </div>

           

              <div className="text-center mt-2">
                <div className="status scheduled">Scheduled</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-matches-placeholder text-center py-5">
          <h5 style={{ fontWeight: 600 }}>No matches found ⚽</h5>
          <p>Check back later for upcoming matches</p>
        </div>
      )}

      <style>{`
.highlight-match {
  background: #64a74f65; /* keep plain white to match cards */
  border: 1px solid #e0e0e0; /* subtle gray border */
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05); /* subtle shadow for card feel */
  position: relative;
  padding: 10px 15px;
  margin-bottom: 10px;
  transition: background-color 1.7s ease;
}

.highlight-match:hover {
  background-color: #f5f8ff; /* very light blue on hover */
}

.elixx-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: #ffcc00; /* a gold-ish badge color */
  color: #212529;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
  user-select: none;
  pointer-events: none;
}

.match-list li:hover {
  background-color: #f0f0f0; /* light gray on hover */
}

.team-name {
  font-size: 1rem;
}

@media (max-width: 576px) {
  .team-name {
    font-size: 0.75rem !important;
  }
}



        

      `}</style>
    </div>
  );
};

export default ProxedMatches;
