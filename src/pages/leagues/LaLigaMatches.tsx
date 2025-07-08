import React, { useEffect, useState } from "react";
import { fetchLaLigaMatchesByWeek } from "../../services/Leagues/laLigaService";
import { getTeamLogoByKey } from "../../services/teamlogo";

const mockStandings = [
  { team: "Real Madrid", MP: 2, W: 2, D: 0, L: 0, PT: 6 },
  { team: "Barcelona", MP: 2, W: 2, D: 0, L: 0, PT: 6 },
  { team: "Atletico Madrid", MP: 2, W: 1, D: 1, L: 0, PT: 4 },
  { team: "Real Sociedad", MP: 2, W: 1, D: 1, L: 0, PT: 4 },
  { team: "Sevilla", MP: 2, W: 1, D: 0, L: 1, PT: 3 },
];

const LaLigaMatchdaysWithSidebar = () => {
  const [matchdays, setMatchdays] = useState({});
  const [activeWeek, setActiveWeek] = useState(1);
  const [logos, setLogos] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const load = async () => {
      const grouped = await fetchLaLigaMatchesByWeek();
      setMatchdays(grouped);

      const allMatches = Object.values(grouped).flat();
      const keys = new Set<string>();
      allMatches.forEach((match: any) => {
        keys.add(match.HomeTeamKey);
        keys.add(match.AwayTeamKey);
      });

      const logoEntries = await Promise.all(
        Array.from(keys).map(async (key) => {
          const logo = await getTeamLogoByKey("ESP", key);
          return [key, logo] as const;
        })
      );

      setLogos(Object.fromEntries(logoEntries));
    };

    load();
  }, []);

  const weeks = Object.keys(matchdays).map(Number).sort((a, b) => a - b);
  const matches = matchdays[activeWeek] || [];

  return (
    <div className="laliga-layout container-fluid">
      <div className="row gx-4">
        {/* Matchdays Section */}
        <div className="col-lg-8 order-2 order-lg-1">
          <div className="mobile-scroll-tabs mb-3 d-lg-none">
            <div className="scroll-wrapper">
              {weeks.map((week) => (
                <button
                  key={week}
                  className={`tab-button ${week === activeWeek ? "active" : ""}`}
                  onClick={() => setActiveWeek(week)}
                >
                  MD {week}
                </button>
              ))}
            </div>
          </div>

          <div className="desktop-flex-layout d-flex gap-3">
            <div className="desktop-tabs d-none d-lg-flex flex-column">
              {weeks.map((week) => (
                <button
                  key={week}
                  className={`tab-button ${week === activeWeek ? "active" : ""}`}
                  onClick={() => setActiveWeek(week)}
                >
                  {week}
                </button>
              ))}
            </div>

            <div className="match-grid-wrapper flex-grow-1">
              <h5 className="fw-bold mb-3">Matchday {activeWeek} of 38</h5>
              <div className="match-grid">
                {matches.map((match, idx) => {
                  const dateObj = new Date((match.DateTime || match.Date) + "Z");
                  const displayDate = dateObj.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  });
                  const displayTime = match.DateTime
                    ? dateObj.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Kolkata",
                      })
                    : "TBD";
                  const homeLogo = logos[match.HomeTeamKey];
                  const awayLogo = logos[match.AwayTeamKey];
                  const scoreAvailable =
                    match.HomeTeamScore !== null &&
                    match.AwayTeamScore !== null &&
                    match.Status.toLowerCase() !== "scheduled";
                  const scoreDisplay = scoreAvailable
                    ? `${match.HomeTeamScore} - ${match.AwayTeamScore}`
                    : "vs";

                  return (
                    <div className="match-box" key={idx}>
                      <div className="match-header d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          {displayDate} | {displayTime}
                        </small>
                        <span className="badge bg-secondary">{match.Status}</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={homeLogo || "/placeholder-logo.png"}
                            alt={match.HomeTeamName}
                            className="team-logo"
                          />
                          <strong>{match.HomeTeamKey}</strong>
                        </div>
                        <div className="match-score text-muted">
                          <strong>{scoreDisplay}</strong>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <strong>{match.AwayTeamKey}</strong>
                          <img
                            src={awayLogo || "/placeholder-logo.png"}
                            alt={match.AwayTeamName}
                            className="team-logo"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Table */}
        <div className="col-lg-4 order-1 order-lg-2">
          <div className="table-sidebar">
            <h5 className="fw-bold mb-3">La Liga Standings</h5>
            <table className="standings-table">
              <thead>
                <tr>
                  <th className="text-start">Team</th>
                  <th className="text-center">MP</th>
                  <th className="text-center">W</th>
                  <th className="text-center">D</th>
                  <th className="text-center">L</th>
                  <th className="text-end">Pts</th>
                </tr>
              </thead>
              <tbody>
                {mockStandings.map((team, idx) => (
                  <tr key={idx}>
                    <td className="text-start">{team.team}</td>
                    <td className="text-center">{team.MP}</td>
                    <td className="text-center">{team.W}</td>
                    <td className="text-center">{team.D}</td>
                    <td className="text-center">{team.L}</td>
                    <td className="text-end">{team.PT}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .laliga-layout {
          padding-top: 20px;
        }

        .table-sidebar {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 16px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        }

        .standings-table {
          width: 100%;
          font-size: 0.88rem;
          border-collapse: collapse;
          background-color: #ffffff;
        }

        .standings-table thead th {
          background-color: #f1f3f5;
          font-weight: 600;
          padding: 6px 8px;
          text-align: center;
          font-size: 0.85rem;
          border-bottom: 1px solid #dee2e6;
        }

        .standings-table thead th.text-start {
          text-align: left;
        }

        .standings-table thead th.text-end {
          text-align: right;
        }

        .standings-table tbody td {
          padding: 6px 8px;
          vertical-align: middle;
          text-align: center;
          font-size: 0.85rem;
          color: #333;
        }

        .standings-table tbody td.text-start {
          text-align: left;
        }

        .standings-table tbody td.text-end {
          text-align: right;
          font-weight: 600;
        }

        .standings-table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .mobile-scroll-tabs {
          overflow-x: auto;
        }

        .scroll-wrapper {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .tab-button {
          border: none;
          background: #e9ecef;
          padding: 6px 12px;
          cursor: pointer;
          border-radius: 4px;
          white-space: nowrap;
        }

        .tab-button.active {
          background: rgb(24, 214, 11);
          color: white;
        }

        .desktop-flex-layout {
          display: flex;
          align-items: flex-start;
        }

        .desktop-tabs {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 500px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .match-grid-wrapper {
          width: 100%;
          max-width: 700px;
        }

        .match-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .match-box {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .match-header {
          font-size: 0.85rem;
        }

        .match-score {
          font-size: 1rem;
          font-weight: 500;
          min-width: 50px;
          text-align: center;
        }

        .team-logo {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        @media (max-width: 768px) {
          .match-grid {
            grid-template-columns: 1fr;
          }

          .desktop-tabs {
            display: none !important;
          }

          .team-logo {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default LaLigaMatchdaysWithSidebar;
