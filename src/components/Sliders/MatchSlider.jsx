import React, { useState, useEffect } from "react";

// --- CONFIG ---
const GITHUB_MATCHES_URL =
  "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/matches/";

const LEAGUE_FILES = [
  "ESP", "EPL", "DEB", "BSA", "DED", "EC", "ELC",
  "FRL1", "ITSA", "POR", "UCL", "WC"
];

// --- UNIQUE CSS STYLES ---
const MatchSliderStyles = () => (
  <style>{`
    /* --- Animation --- */
    @keyframes g4uScrollMatches {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* ===== CONTAINER ===== */
    .g4u-slider-container {
      width: 100%;
      background: #ffffff;
      border-top: 1px solid #eaeaea;
      border-bottom: 1px solid #eaeaea;
      padding: 15px 0;
      overflow: hidden;
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    /* ===== TRACK ===== */
    .g4u-slider-track {
      display: flex;
      width: max-content;
      animation: g4uScrollMatches 80s linear infinite; /* Slower, smoother speed */
    }

    .g4u-slider-container:hover .g4u-slider-track {
      animation-play-state: paused;
    }

    /* ===== CARD DESIGN ===== */
    .g4u-match-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 12px;
      padding: 10px 20px;
      background: #ffffff;
      border: 1px solid #f0f0f0;
      border-radius: 8px; /* Soft rounded corners */
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      min-width: 280px; /* Fixed width for consistency */
      transition: all 0.2s ease;
      cursor: default;
      position: relative;
    }

    .g4u-match-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border-color: #e0e0e0;
    }

    /* ===== MATCH CONTENT ROW ===== */
    .g4u-match-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 10px;
    }

    /* ===== TEAM SECTION ===== */
    .g4u-team-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 40%; /* Balance the space */
    }

    .g4u-team-wrapper.home {
      justify-content: flex-end;
      text-align: right;
    }

    .g4u-team-wrapper.away {
      justify-content: flex-start;
      text-align: left;
    }

    /* ===== LOGOS (Strict Sizing) ===== */
    .g4u-team-logo {
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      object-fit: contain;
      display: block;
    }

    /* ===== TEXT TYPOGRAPHY ===== */
    .g4u-team-name {
      font-size: 14px;
      font-weight: 700;
      color: #2d3748;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100px;
    }

    /* ===== VS BADGE ===== */
    .g4u-vs-badge {
      font-size: 10px;
      font-weight: 800;
      color: #718096;
      background: #edf2f7;
      padding: 4px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ===== TIME / STATUS (Top of card) ===== */
    .g4u-match-time {
      font-size: 11px;
      color: #a0aec0;
      font-weight: 600;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ===== DARK MODE ===== */
    @media (prefers-color-scheme: #7777830) {
      .g4u-slider-container {
        background: #111;
        border-color: #222;
      }
      .g4u-match-card {
        background: #1a202c;
        border-color: #2d3748;
        box-shadow: none;
      }
      .g4u-match-card:hover {
        background: #2d3748;
      }
      .g4u-team-name {
        color: #f7fafc;
      }
      .g4u-vs-badge {
        background: #2d3748;
        color: #a0aec0;
      }
      .g4u-match-time {
        color: #718096;
      }
    }
  `}</style>
);


// --- COMPONENT ---
const MatchSlider = () => {
  const [todayMatches, setTodayMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchTodayMatches = async () => {
      setLoading(true);
      const today = getTodayDate();

      try {
        const fetchPromises = LEAGUE_FILES.map(league =>
          fetch(`${GITHUB_MATCHES_URL}${league}.json`)
            .then(res => (res.ok ? res.json() : []))
            .catch(() => [])
        );

        const results = await Promise.all(fetchPromises);
        const allMatches = results.flat();

        const filtered = allMatches.filter(
          match => match.Date === today
        );

        // Duplicate list for seamless infinite loop
        if (filtered.length > 0) {
            setTodayMatches([...filtered, ...filtered]);
        } else {
            setTodayMatches([]);
        }

      } catch (err) {
        console.error("Error loading matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayMatches();
  }, []);

  if (loading) {
    return <div className="g4u-slider-container" style={{ textAlign: "center", color: "#888", fontSize: "12px" }}>Loading Fixtures...</div>;
  }

  if (todayMatches.length === 0) {
    return (
      <div className="g4u-slider-container" style={{ textAlign: "center", color: "#888", fontSize: "14px" }}>
        No matches scheduled today
      </div>
    );
  }

  return (
    <>
      <MatchSliderStyles />
      <div className="g4u-slider-container">
        <div className="g4u-slider-track">
          {todayMatches.map((m, index) => (
            <div className="g4u-match-card" key={index}>
              
              {/* Optional: Time Display (If match.Time exists, else show 'TODAY') */}
              <div className="g4u-match-time">
                {m.Time ? m.Time : "Today"}
              </div>

              <div className="g4u-match-row">
                {/* Home Team */}
                <div className="g4u-team-wrapper home">
                  <span className="g4u-team-name" title={m.HomeTeamKey}>{m.HomeTeamKey}</span>
                  <img 
                    className="g4u-team-logo" 
                    src={m.HomeTeamLogo} 
                    alt={m.HomeTeamName} 
                  />
                </div>

                {/* VS Badge */}
                <div className="g4u-vs-badge">VS</div>

                {/* Away Team */}
                <div className="g4u-team-wrapper away">
                  <img 
                    className="g4u-team-logo" 
                    src={m.AwayTeamLogo} 
                    alt={m.AwayTeamName} 
                  />
                  <span className="g4u-team-name" title={m.AwayTeamKey}>{m.AwayTeamKey}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MatchSlider;