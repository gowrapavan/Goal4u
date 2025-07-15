import { useEffect, useState ,useRef  } from "react";
import { fetchLaLigaMatchesByWeek } from "../../services/Leagues/laLigaService";
import { getTeamLogoByKey } from "../../services/teamlogo";
import { fetchFinalScoresIfMissing } from "./fetchFinalScoresIfMissing";
import { useNavigate } from "react-router-dom";



const LaLigaMatchdaysWithSidebar = () => {
  const navigate = useNavigate();
  const tabRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);
  const [matchdays, setMatchdays] = useState({});
  const [activeWeek, setActiveWeek] = useState(1);
  const [logos, setLogos] = useState<Record<string, string | null>>({});
  const [standings, setStandings] = useState([]);
  const mobileTabRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const desktopTabRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const mobileScrollWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const activeTab = mobileTabRefs.current[activeWeek];
    const wrapper = mobileScrollWrapperRef.current;
    const isMobile = window.innerWidth < 992;

    if (!isMobile || !activeTab || !wrapper) return;

    const tabOffsetLeft = activeTab.offsetLeft;
    const tabWidth = activeTab.offsetWidth;
    const wrapperWidth = wrapper.offsetWidth;

    const scrollTo = tabOffsetLeft - (wrapperWidth - tabWidth) / 2;

    wrapper.scrollTo({
      left: scrollTo,
      behavior: "smooth",
    });
  }, [activeWeek]);

  useEffect(() => {
  const activeTab = desktopTabRefs.current[activeWeek];
  const isDesktop = window.innerWidth >= 992;

  if (!isDesktop || !activeTab) return;

 const scrollParent = activeTab.parentElement; // assumes parent scrolls
  const padding = 16;

  if (scrollParent) {
    const top = activeTab.offsetTop - scrollParent.offsetTop - padding;
    scrollParent.scrollTo({
      top: top < 0 ? 0 : top,
      behavior: "smooth",
    });
  }

  }, [activeWeek]);





  useEffect(() => {
    const load = async () => {
      // ✅ Fetch static JSON files from public folder
      const [matchRes, teamRes] = await Promise.all([
        fetch("/data/2026/esp.json"),
        fetch("/data/teams/esp.json"),
      ]);

      const matchData = await matchRes.json();
      const teamData = await teamRes.json();

      // ✅ Move your generateStandings function inside this block
      const generateStandings = () => {
        const teamIdsSet = new Set<number>();
        matchData.forEach((match: any) => {
          teamIdsSet.add(match.HomeTeamId);
          teamIdsSet.add(match.AwayTeamId);
        });

        const participatingTeams = teamData.filter((team: any) =>
          teamIdsSet.has(team.TeamId)
        );

        const standingsMap: Record<number, any> = {};
        participatingTeams.forEach((team) => {
          standingsMap[team.TeamId] = {
            teamId: team.TeamId,
            MP: 0,
            W: 0,
            D: 0,
            L: 0,
            PT: 0,
          };
        });

        matchData.forEach((match: any) => {
          if (match.Status !== "Final") return;
          const { HomeTeamId, AwayTeamId, Points } = match;

          standingsMap[HomeTeamId].MP += 1;
          standingsMap[AwayTeamId].MP += 1;

          const homePts = Points?.[HomeTeamId.toString()] || 0;
          const awayPts = Points?.[AwayTeamId.toString()] || 0;

          standingsMap[HomeTeamId].PT += homePts;
          standingsMap[AwayTeamId].PT += awayPts;

          if (homePts === 3) {
            standingsMap[HomeTeamId].W += 1;
            standingsMap[AwayTeamId].L += 1;
          } else if (awayPts === 3) {
            standingsMap[AwayTeamId].W += 1;
            standingsMap[HomeTeamId].L += 1;
          } else if (homePts === 1 && awayPts === 1) {
            standingsMap[HomeTeamId].D += 1;
            standingsMap[AwayTeamId].D += 1;
          }
        });

        const sorted = Object.values(standingsMap).sort((a: any, b: any) => {
          if (b.PT !== a.PT) return b.PT - a.PT;
          if (b.W !== a.W) return b.W - a.W;
          return a.teamId - b.teamId;
        });

        return sorted.map((team: any) => ({
          ...team,
          logo:
            teamData.find((t: any) => t.TeamId === team.teamId)?.WikipediaLogoUrl ||
            "/placeholder-logo.png",
          name:
            teamData.find((t: any) => t.TeamId === team.teamId)?.Key || "Unknown",
        }));
      };

      const grouped = await fetchLaLigaMatchesByWeek();

      for (const [week, matches] of Object.entries(grouped)) {
        const patched = await fetchFinalScoresIfMissing(matches);
        grouped[week] = patched;
      }

      setMatchdays(grouped);
      setStandings(generateStandings());

      const today = new Date();
      let closestWeek = 1;
      let smallestDiff = Infinity;

      for (const [weekStr, matches] of Object.entries(grouped)) {
        const week = Number(weekStr);
        for (const match of matches) {
          const matchDate = new Date((match.DateTime || match.Date) + "Z");
          const matchDay = new Date(matchDate.toDateString());
          const todayDay = new Date(today.toDateString());

          if (matchDay.getTime() === todayDay.getTime()) {
            closestWeek = week;
            smallestDiff = 0;
            break;
          }

          const diff = Math.abs(matchDay.getTime() - todayDay.getTime());
          if (diff < smallestDiff) {
            smallestDiff = diff;
            closestWeek = week;
          }
        }

        if (smallestDiff === 0) break;
      }

      setActiveWeek(closestWeek);

      const allMatches = Object.values(grouped).flat();
      const keys = new Set<string>();
      allMatches.forEach((match: any) => {
        keys.add(match.HomeTeamKey);
        keys.add(match.AwayTeamKey);
      });

      const logoEntries = await Promise.all(
        Array.from(keys).map(async (key) => {
          const logo = await getTeamLogoByKey("esp", key);
          return [key, logo] as const;
        })
      );

      setLogos(Object.fromEntries(logoEntries));
    };

    load();
  }, []);


  const weeks = Object.keys(matchdays).map(Number).sort((a, b) => a - b);
  // ✅ 1. Place the function BEFORE usage
  const getDynamicStatus = (match: any) => {
    if (match.Status === "Final") return "Final";
    const matchTime = new Date((match.DateTime || match.Date) + "Z");
    const now = new Date();
    const timeDiff = now.getTime() - matchTime.getTime();

    if (timeDiff < 0) return "Scheduled";
    else if (timeDiff <= 2 * 60 * 60 * 1000) return "Live";
    else return "Final";
  };

  // ✅ 2. Now this works safely
  const matches = (matchdays[activeWeek] || []).slice().sort((a: any, b: any) => {
    const isLiveA = getDynamicStatus(a) === "Live";
    const isLiveB = getDynamicStatus(b) === "Live";

    if (isLiveA && !isLiveB) return -1;
    if (!isLiveA && isLiveB) return 1;
    return 0;
  });

  return (
    <div className="LaLiga-layout container-fluid">
  <div className="content-wrapper d-flex flex-column flex-lg-row gap-4">
    {/* Left: Matchdays */}
    <div className="matchdays-section flex-grow-1">
      <div className="mobile-scroll-tabs mb-3 d-lg-none">
        <div className="scroll-wrapper" ref={mobileScrollWrapperRef}>
          {weeks.map((week) => (
            <button
              key={week}
              ref={(el) => (mobileTabRefs.current[week] = el)}
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
            ref={(el) => (desktopTabRefs.current[week] = el)}
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
            {matches.map((match: any, idx: number) => {
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
                <div
                  className="match-box"
                  key={idx}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(
                      `/livematch?matchId=${match.GameId}&competition=ESP`
                    )
                  }
                >
                  <div className="match-header d-flex justify-content-between align-items-center mb-3">
                    <small className="text-muted">
                      {displayDate} | {displayTime}
                    </small>
                  <span
                    className={`badge ${
                      getDynamicStatus(match) === "Live"
                        ? "bg-danger"
                        : getDynamicStatus(match) === "Final"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {getDynamicStatus(match)}
                  </span>
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

    {/* Right: Standings */}
    <div className="standings-section d-flex flex-column">
      <div className="table-sidebar flex-grow-1 d-flex flex-column">
        <h5 className="fw-bold mb-3">LaLiga Standings</h5>
        <div className="standings-scroll flex-grow-1 overflow-auto">
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
              {standings.map((team: any, idx: number) => (
                <tr key={idx}>
                  <td className="text-start d-flex align-items-center gap-2">
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="team-logo"
                    />
                    {team.name}
                  </td>
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
  </div>

  {/* Styles */}
  <style jsx>{`
    .LaLiga-layout {
      padding-top: 20px;
    }

    .content-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    @media (min-width: 992px) {
      .content-wrapper {
        flex-direction: row;
      }
    }

    .matchdays-section {
      flex: 2;
      display: flex;
      flex-direction: column;
    }

    .standings-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 300px;
    }

    .table-sidebar {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 16px;
      box-shadow: 0 1px 4px rgba(217, 63, 25, 0.71);
      height: 100%;
    }
      .scroll-wrapper {
  padding: 0 8px; /* horizontal scroll padding */
}

.desktop-tabs {
  padding-top: 8px; /* vertical scroll padding */
}


    .standings-scroll {
      overflow-y: auto;
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
      text-align: left;

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
      text-align: left;
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
      background: rgba(255, 0, 0, 0.73);
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
    max-height: calc(100vh - 120px); /* Makes it scrollable vertically */
    overflow-y: auto;
    padding-right: 8px;
    scroll-behavior: smooth;
  }


    .match-grid-wrapper {
      max-width: 600px;
    }

    .match-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);

      gap: 16px;
    }

    .match-box {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 12px;
      box-shadow: 0 1px 2px rgba(204, 60, 16, 0.88);
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
    border: none;
    box-shadow: none;
    background: none;
  }
      @media (max-width: 858px) {
      .match-header {
        font-size: 0.75rem;
      }

    }
      .match-box {
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.match-box:hover {
  box-shadow: 0 2px 8px rgba(218, 86, 41, 0.5);
}


    @media (max-width: 768px) {
      .match-grid {
      grid-template-columns: repeat(2, 1fr);
      }
      strong {
  font-size: 0.75rem; /* or 0.75rem or whatever you prefer */
  font-weight: 600; /* optional: reduce boldness */
}

      
      .match-box {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 12px;
      box-shadow: 0 1px 2px rgba(194, 37, 28, 0.88);
      }

      .match-header {
        font-size: 0.65rem;
      }

      .match-score {
        font-size: 0.75rem;
        font-weight: 700;
        min-width: 50px;
        text-align: center;
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
