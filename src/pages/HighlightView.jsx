import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// ==========================================
// 1. CONFIG & HELPERS
// ==========================================

const GITHUB_MATCHES_URL = 'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/matches';
const GITHUB_STANDINGS_URL = 'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/standing';

const COMPETITIONS = [
  { code: 'EPL', name: 'Premier League' },
  { code: 'ESP', name: 'La Liga' },
  { code: 'ITSA', name: 'Serie A' },
  { code: 'DEB', name: 'Bundesliga' },
  { code: 'DED', name: 'Eredivisie' },
  { code: 'FRL1', name: 'Ligue 1' },
  { code: 'UCL', name: 'Champions League' },
  { code: 'MLS', name: 'Major League Soccer' },
  { code: 'WC', name: 'World Cup' },
];

const normalizeStandings = (json) => {
  if (json.standings && json.standings[0] && Array.isArray(json.standings[0].table)) {
    return json.standings[0].table.map(entry => ({
      Position: entry.position,
      TeamName: entry.team.name,  
      ShortName: entry.team.shortName,
      Played: entry.playedGames,
      Points: entry.points,
      Won: entry.won,
      Draw: entry.draw,
      Lost: entry.lost,
      Crest: entry.team.crest,
      Form: [] 
    }));
  }
  return [];
};

const getLeagueInfo = (code) => {
  const map = {
    EPL: { name: "Premier League", logo: "https://crests.football-data.org/PL.png" },
    ESP: { name: "La Liga", logo: "https://crests.football-data.org/PD.png" },
    ITSA: { name: "Serie A", logo: "https://crests.football-data.org/SA.png" },
    DEB: { name: "Bundesliga", logo: "https://crests.football-data.org/BL1.png" },
    DED: { name: "Eredivisie", logo: "https://crests.football-data.org/ED.png" },
    FRL1: { name: "Ligue 1", logo: "https://crests.football-data.org/FL1.png" },
    UCL: { name: "UCL", logo: "https://crests.football-data.org/CL.png" },
    MLS: { name: "MLS", logo: null },
    WC: { name: "World Cup", logo: null },
  };
  return map[code] || { name: code, logo: null };
};

const calculateForm = (teamName, allMatches, currentMatchDate) => {
  const targetDate = new Date(currentMatchDate);
  const history = allMatches.filter(m => {
    const mDate = new Date(m.Date || m.DateTime);
    const status = m.Status;
    const isFinished = status === 'Final' || status === 'FT';
    const isTeam = (m.HomeTeam === teamName || m.AwayTeam === teamName || m.HomeTeamName === teamName || m.AwayTeamName === teamName);
    return isFinished && isTeam && mDate < targetDate;
  }).sort((a, b) => new Date(b.Date || b.DateTime) - new Date(a.Date || a.DateTime));

  return history.slice(0, 5).map(m => {
    const isHome = m.HomeTeam === teamName || m.HomeTeamName === teamName;
    const scoreH = m.HomeTeamScore;
    const scoreA = m.AwayTeamScore;
    if (scoreH === scoreA) return 'D';
    if (isHome) return scoreH > scoreA ? 'W' : 'L';
    return scoreA > scoreH ? 'W' : 'L';
  });
};

// ==========================================
// 2. COMPONENTS
// ==========================================

const FormGuide = ({ form }) => {
  if (!form || form.length === 0) return <span style={{color:'#bdc1c6'}}>-</span>;
  return (
    <div className="form-guide">
      {form.map((result, idx) => (
        <span key={idx} className={`form-badge ${result}`}>
          {result === 'W' ? '✔' : result === 'L' ? '✖' : '—'}
        </span>
      ))}
    </div>
  );
};

const MatchCard = ({ match, onClick }) => {
  const league = getLeagueInfo(match.league);
  return (
    <div className="mc-card" onClick={onClick}>
      <div className="mc-league-header">
        {league.logo && <img src={league.logo} alt={league.name} />}
        <span>{league.name}</span>
      </div>
      <div className="mc-teams">
        <div className="mc-team">
          <img src={match.home_team.logo} alt={match.home_team.name} />
          <span>{match.home_team.name}</span>
        </div>
        <div className="mc-vs">
          <strong>{match.home_team.score} - {match.away_team.score}</strong>
          <span>VS</span>
        </div>
        <div className="mc-team">
          <img src={match.away_team.logo} alt={match.away_team.name} />
          <span>{match.away_team.name}</span>
        </div>
      </div>
      <div className="mc-footer">
        <span>{match.date}</span>
        <button>Watch ▶</button>
      </div>
    </div>
  );
};

export default function HighlightView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [match, setMatch] = useState(null);
  const [standings, setStandings] = useState([]); 
  const [loadingTable, setLoadingTable] = useState(false);
  const [page, setPage] = useState(1);

  const DATA_URL = "https://raw.githubusercontent.com/gowrapavan/shortsdata/main/Highlights/Highlight.json";
  const PER_PAGE = 20;

  useEffect(() => {
    fetch(DATA_URL)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMatches(sorted);
        const foundMatch = sorted.find((m) => m.highlight_id === id);
        setMatch(foundMatch);

        if (foundMatch && foundMatch.game_id) {
          fetchTableData(foundMatch.game_id, foundMatch);
        } else {
          setStandings([]); 
        }
      });
  }, [id]);

  const fetchTableData = async (gameId, currentMatch) => {
    setLoadingTable(true);
    let competitionCode = null;
    let allLeagueMatches = [];

    try {
      for (const comp of COMPETITIONS) {
        try {
          const response = await fetch(`${GITHUB_MATCHES_URL}/${comp.code}.json`);
          if (!response.ok) continue;
          const data = await response.json();
          if (!Array.isArray(data)) continue;

          const found = data.find(m => String(m.GameId) === String(gameId));
          if (found) {
            competitionCode = comp.code;
            allLeagueMatches = data; 
            break; 
          }
        } catch (e) { continue; }
      }

      if (!competitionCode) throw new Error("League not found");

      const stdResponse = await fetch(`${GITHUB_STANDINGS_URL}/${competitionCode}.json`);
      if (stdResponse.ok) {
        const json = await stdResponse.json();
        const fullStandings = normalizeStandings(json);
        const hName = currentMatch.home_team.name.toLowerCase();
        const aName = currentMatch.away_team.name.toLowerCase();

        const relevant = fullStandings.filter(s => {
            const tName = s.TeamName.toLowerCase();
            const sName = (s.ShortName || "").toLowerCase();
            return tName.includes(hName) || hName.includes(tName) || 
                   tName.includes(aName) || aName.includes(tName) ||
                   sName === hName || sName === aName;
        }).map(team => {
            team.Form = calculateForm(team.TeamName, allLeagueMatches, currentMatch.datetime || currentMatch.date);
            return team;
        });

        relevant.sort((a, b) => a.Position - b.Position);
        setStandings(relevant.length > 0 ? relevant : fullStandings.slice(0, 5));
      }
    } catch (err) {
      setStandings([]);
    } finally {
      setLoadingTable(false);
    }
  };

  if (!match) return <div style={{ padding: "40px" }}>Loading...</div>;

  const otherMatches = matches.filter((m) => m.highlight_id !== id);
  const start = (page - 1) * PER_PAGE;
  const paginated = otherMatches.slice(start, start + PER_PAGE);
  const totalPages = Math.ceil(otherMatches.length / PER_PAGE);
  const currentLeague = getLeagueInfo(match.league);

  return (
    <div className="hl-page">
      {/* HEADER CARD */}
      <div className="hl-header-card">
        <div className="hl-header-top">
            <div className="hl-meta-text">
              {currentLeague.name} • {match.date}
            </div>
            <div className="hl-status">Full-time</div>
        </div>

        <div className="hl-match-row">
          <div className="hl-team-col">
            <div className="hl-logo-wrapper">
              <img src={match.home_team.logo} alt={match.home_team.name} />
            </div>
            <span>{match.home_team.name}</span>
          </div>
          
          <div className="hl-score-box">
            <span>{match.home_team.score}</span>
            <span className="hl-dash">-</span>
            <span>{match.away_team.score}</span>
          </div>

          <div className="hl-team-col">
            <div className="hl-logo-wrapper">
              <img src={match.away_team.logo} alt={match.away_team.name} />
            </div>
            <span>{match.away_team.name}</span>
          </div>
        </div>
      </div>

      {/* VIDEO */}
      <div className="hl-video-box">
        <iframe src={match.embed_url} title={match.title} allowFullScreen />
      </div>

      {/* INFO */}
      <div className="hl-info">
        <h1>{match.title}</h1>
        <div className="hl-meta">
          <span>{currentLeague.name}</span>
          <span>•</span>
          <span>{match.date}</span>
        </div>
      </div>

      {/* ✅ STANDINGS TABLE - FIXED STYLES */}
      {(loadingTable || standings.length > 0) && (
        <div className="hl-table-section">
          <h3 className="hl-table-title">Current Standings</h3>
          
          <div className="hl-table-wrapper">
            <table className="hl-standings-table">
              <thead>
                <tr>
                  <th className="th-pos">POS</th>
                  <th className="th-team">TEAM</th>
                  <th>MP</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>PTS</th>
                  <th className="th-last5">LAST 5</th>
                </tr>
              </thead>
              <tbody>
                {loadingTable ? (
                  <tr><td colSpan="8" style={{padding: '30px', textAlign: 'center', background: 'white'}}>Loading table...</td></tr>
                ) : (
                  standings.map((row, index) => (
                    <tr key={row.TeamName} className={index === 0 ? "row-mint" : "row-white"}>
                      <td className="td-pos">{row.Position < 10 ? `0${row.Position}` : row.Position}</td>
                      <td className="td-team">
                        <div className="td-team-content">
                          {row.Crest && <img src={row.Crest} alt="" />}
                          <span>{row.TeamName}</span>
                        </div>
                      </td>
                      <td>{row.Played}</td>
                      <td>{row.Won}</td>
                      <td>{row.Draw}</td>
                      <td>{row.Lost}</td>
                      <td className="td-pts">{row.Points}</td>
                      <td className="td-last5">
                        <div className="td-last5-content">
                          <FormGuide form={row.Form} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <hr className="hl-divider" />

      {/* MORE HIGHLIGHTS */}
      <div className="hl-more">
        <h2>More Highlights</h2>
        <div className="hl-grid">
          {paginated.map((m) => (
            <MatchCard
              key={m.highlight_id}
              match={m}
              onClick={() => {
                navigate(`/highlight/${m.highlight_id}`);
                window.scrollTo(0, 0);
              }}
            />
          ))}
        </div>

        <div className="hl-pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>

      <style>{`
        .hl-page {
          background: #f8f9fa;
          min-height: 100vh;
          padding: 30px 20px;
          color: #202124;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        }

        /* HEADER CARD */
        .hl-header-card {
          max-width: 900px; margin: 0 auto 24px;
          background: white; border-radius: 12px; border: 1px solid #dadce0;
          padding: 24px 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .hl-header-top {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 14px; color: #5f6368; margin-bottom: 24px; font-weight: 500;
        }
        .hl-match-row {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 0 20px;
        }
        .hl-team-col {
          display: flex; flex-direction: column; align-items: center;
          justify-content: flex-start; width: 30%; text-align: center;
        }
        .hl-logo-wrapper {
          height: 64px; display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
        }
        .hl-logo-wrapper img { width: 64px; height: 64px; object-fit: contain; }
        .hl-team-col span { font-size: 16px; font-weight: 500; color: #202124; line-height: 1.3; }
        .hl-score-box {
          height: 64px; display: flex; align-items: center; justify-content: center;
          gap: 20px; font-size: 56px; font-weight: 600; color: #16a34a; line-height: 1;
        }
        .hl-dash { color: #dadce0; }

        /* VIDEO & INFO */
        .hl-video-box {
          max-width: 900px; margin: 0 auto; border-radius: 12px; overflow: hidden; background: black; 
        }
        .hl-video-box iframe { width: 100%; height: 56.25vw; max-height: 506px; border: none; display: block; }

        .hl-info { max-width: 900px; margin: 24px auto; }
        .hl-info h1 { font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #202124; }
        .hl-meta { font-size: 14px; color: #5f6368; display: flex; gap: 8px; }

        /* ✅ TABLE STYLES - FIXED FOR SEAMLESS BACKGROUNDS */
        .hl-table-section { max-width: 900px; margin: 40px auto; }
        .hl-table-title {
          font-size: 18px; font-weight: 700; color: #0f172a;
          margin-bottom: 16px; display: flex; align-items: center; 
          border-left: 4px solid #16a34a;
          padding-left: 12px; height: 24px;
        }

        .hl-table-wrapper {
          border-radius: 8px; overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .hl-standings-table { 
          width: 100%; border-collapse: collapse; font-size: 13px;
          table-layout: auto;
        }
        
        .hl-standings-table th {
          text-align: center; font-weight: 700; color: #ffffff;
          text-transform: uppercase; padding: 18px 12px;
          background-color: #2e094e; border: none;
          font-size: 11px; letter-spacing: 0.5px;
        }
        .hl-standings-table th.th-team { text-align: left; padding-left: 20px; }
        .hl-standings-table th.th-pos { text-align: left; padding-left: 20px; width: 60px; }
        .hl-standings-table th.th-last5 { text-align: right; padding-right: 20px; }

        .hl-standings-table td {
          padding: 16px 12px; color: #202124; text-align: center; border: none;
        }

        /* Fix: Row Backgrounds */
        .hl-standings-table tr.row-mint td { background-color: #e0f7fa; font-weight: 600; }
        .hl-standings-table tr.row-white td { background-color: #ffffff; }
        
        .hl-standings-table .td-pos { text-align: left; padding-left: 20px; font-weight: 700; }
        
        /* Fix: Team Alignment without breaking TD flow */
        .td-team-content {
          display: flex; align-items: center; gap: 12px; text-align: left; padding-left: 8px;
        }
        .td-team-content img { width: 24px; height: 24px; object-fit: contain; flex-shrink: 0; }
        .td-team-content span { font-weight: 600; white-space: nowrap; }

        .hl-standings-table .td-pts { font-weight: 800; }
        
        /* Fix: Form Alignment */
        .td-last5-content { display: flex; justify-content: flex-end; padding-right: 8px; }

        .form-guide { display: flex; gap: 6px; align-items: center; }
        .form-badge {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 10px; font-weight: 800;
        }
        .form-badge.W { background-color: #16a34a; }
        .form-badge.L { background-color: #dc2626; }
        .form-badge.D { background-color: #9ca3af; }

        .hl-divider { max-width: 900px; margin: 40px auto; border: none; border-top: 1px solid #dadce0; }
        .hl-more { max-width: 900px; margin: 0 auto; }
        .hl-more h2 { font-size: 20px; margin-bottom: 20px; color: #202124; }
        .hl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; margin-bottom: 30px; }

        /* PAGINATION */
        .hl-pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 40px; padding-bottom: 40px; }
        .hl-pagination button { padding: 8px 20px; border-radius: 8px; border: 1px solid #e5e7eb; background: white; cursor: pointer; color: #374151; font-weight: 500; font-size: 14px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .hl-pagination button:hover:not(:disabled) { border-color: #d1d5db; background: #f9fafb; color: #111827; }
        .hl-pagination button:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
        .hl-pagination span { font-size: 14px; color: #6b7280; font-weight: 500; }

        /* Card Styles */
        .mc-card {
          background: white; border-radius: 12px; padding: 12px 16px;
          border: 1px solid #e5e7eb; cursor: pointer; height: 175px; 
          display: flex; flex-direction: column; transition: .2s;
        }
        .mc-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-color: #16a34a; }
        .mc-league-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 11px; font-weight: 700; color: #16a34a; text-transform: uppercase; }
        .mc-league-header img { width: 16px; height: 16px; }
        .mc-teams { display: flex; justify-content: space-between; align-items: flex-start; flex-grow: 1; }
        .mc-team { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 80px; text-align: center; }
        .mc-team img { width: 36px; height: 36px; object-fit: contain; }
        .mc-team span {
          font-size: 12px; font-weight: 600; color: #3c4043; line-height: 1.2;
          min-height: 29px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .mc-vs { display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 5px; }
        .mc-vs strong { font-size: 18px; color: #16a34a; display: block; }
        .mc-vs span { font-size: 10px; color: #70757a; margin-top: 2px; }
        .mc-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3f4f6; padding-top: 10px; font-size: 11px; color: #70757a; margin-top: auto; }
        .mc-footer button { background: #16a34a; color: white; border: none; padding: 5px 12px; border-radius: 100px; font-weight: 600; cursor: pointer; }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
          .hl-page { padding: 0; background: white; }
          .hl-header-card { border: none; border-bottom: 1px solid #f1f3f4; border-radius: 0; padding: 20px 16px; margin-bottom: 0; box-shadow: none; }
          .hl-score-box { font-size: 42px; gap: 10px; height: 48px; }
          .hl-logo-wrapper { height: 48px; margin-bottom: 8px; }
          .hl-logo-wrapper img { width: 48px; height: 48px; }
          .hl-team-col span { font-size: 14px; }
          .hl-video-box { border-radius: 0; margin-bottom: 20px; }
          .hl-info, .hl-more, .hl-table-section { padding: 0 16px; }
          .hl-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}