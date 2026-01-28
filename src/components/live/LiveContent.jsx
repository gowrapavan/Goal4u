import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// Sub-components
import Hightlight from './match-content/Hightlight';
import MatchNews from './match-content/MatchNews';
import Stats from './match-content/stats';
import Lineup from './match-content/Lineup';
import Images from './match-content/Images';
import Table from './match-content/Table';
import StreamTab from './match-content/stream'; // Import the StreamTab
import ErrorMessage from '../common/ErrorMessage'; // Ensure this path is correct for your project

const COMPETITIONS_DATA = [
  { code: 'EPL', name: 'Premier League', country: 'England' },
  { code: 'ESP', name: 'La Liga', country: 'Spain' },
  { code: 'ITSA', name: 'Serie A', country: 'Italy' },
  { code: 'DEB', name: 'Bundesliga', country: 'Germany' },
  { code: 'MLS', name: 'Major League Soccer', country: 'USA' },
  { code: 'FRL1', name: 'Ligue 1', country: 'France' },
  { code: 'CWC', name: 'FIFA Club World Cup', country: 'International' },
  { code: 'UCL', name: 'UEFA Champions League', country: 'Europe' },
];

const generateMatchSummary = (match) => {
  const lines = [];
  lines.push(`${match.HomeTeamName} faced off against ${match.AwayTeamName}.`);
  if (match.HomeTeamScore != null && match.AwayTeamScore != null) {
    lines.push(`The final score was ${match.HomeTeamScore} - ${match.AwayTeamScore}.`);
  } else {
    lines.push(`The match is ${match.Status ? match.Status.toLowerCase() : 'scheduled'}.`);
  }
  return lines;
};

const LiveContent = ({ matchData: propMatchData, competition: propCompetition }) => {
  const [searchParams] = useSearchParams();
  const [matchData, setMatchData] = useState(propMatchData);
  const [competition, setCompetition] = useState(propCompetition);
  const [activeTab, setActiveTab] = useState('Info');

  useEffect(() => {
    // If props aren't provided, try fetching from URL params
    if (!propMatchData) {
      const matchId = searchParams.get('matchId');
      const comp = searchParams.get('competition');
      setCompetition(comp);
      
      if (matchId) {
        // Dynamic import to avoid circular dependencies or heavy initial load
        import('../../services/live-match').then(({ LiveMatch }) => {
          LiveMatch.fetchMatchById(Number(matchId)).then((data) => {
            setMatchData(data);
          }).catch(() => setMatchData(null));
        });
      }
    }
  }, [propMatchData, searchParams]);

  if (!matchData) return <ErrorMessage message="Match data not found" onRetry={() => {}} />;

  const autoSummary = generateMatchSummary(matchData);
  const competitionInfo = COMPETITIONS_DATA.find(c => c.code === competition);

  const renderTeamLogo = (key, name, url) => (
    <img
      src={url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6c757d&color=fff&size=80`}
      alt={name}
      className="lc-team-logo"
    />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Stream': 
        return <StreamTab active={activeTab === 'Stream'} />;
      case 'Stats':
        return <Stats matchId={Number(matchData.GameId)} competition={matchData.Competition} />;
      case 'Line-ups':
        return <Lineup matchId={Number(matchData.GameId)} competition={matchData.Competition} />;
      case 'Table':
        return <Table competition={matchData.Competition} />;
      case 'H2H':
        return <Images matchId={matchData.GameId} competition={matchData.Competition} />;
      case 'Info':
      default:
        return (
          <section className="lc-summary-section">
            <div className="lc-summary-content">
              {autoSummary.map((p, i) => (
                <p key={i} className="lc-summary-text">{p}</p>
              ))}
              <MatchNews matchTitle={`${matchData.HomeTeamName} vs ${matchData.AwayTeamName} ${competition ?? ''}`} />
            </div>
          </section>
        );
    }
  };

  return (
    <>
      <div className="lc-top-section">
        <div className="lc-header-inner">
            <div className="lc-competition-header">
                <span className="lc-competition-country">{competitionInfo?.country || 'World'}</span>
                <span className="lc-separator">•</span>
                <span className="lc-competition-name">{competitionInfo?.name ?? competition}</span>
            </div>
            
            <div className="lc-score-panel">
            <div className="lc-team lc-home">
                {renderTeamLogo(matchData.HomeTeamKey, matchData.HomeTeamName, matchData.HomeTeamLogo)}
                <span className="lc-team-name">{matchData.HomeTeamName}</span>
            </div>
            <div className="lc-score-center">
                <div className="lc-score-box">
                    <span className="lc-score-digit">{matchData.HomeTeamScore ?? 0}</span>
                    <span className="lc-score-divider">:</span>
                    <span className="lc-score-digit">{matchData.AwayTeamScore ?? 0}</span>
                </div>
                <div className={`lc-status-badge ${matchData.Status === 'Live' ? 'is-live' : ''}`}>
                    {matchData.Status === 'Live' && <span className="lc-live-dot"></span>}
                    {matchData.Status}
                </div>
            </div>
            <div className="lc-team lc-away">
                {renderTeamLogo(matchData.AwayTeamKey, matchData.AwayTeamName, matchData.AwayTeamLogo)}
                <span className="lc-team-name">{matchData.AwayTeamName}</span>
            </div>
            </div>
        </div>
        
        <div className="lc-tabs-wrapper">
            <nav className="lc-tabs">
            {['Info', 'Stream', 'Stats', 'Line-ups', 'Table', 'H2H'].map(tab => (
                <button
                key={tab}
                className={`lc-tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                >
                {tab}
                </button>
            ))}
            </nav>
        </div>
      </div>

      <div className="lc-content-area">
        {renderContent()}
      </div>

      <style jsx>{`
        body {
          background-color: #121212;
          color: #f5f5f5;
          margin: 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        /* --- Top Section --- */
        .lc-top-section {
          background: linear-gradient(180deg, #1e1e1e 0%, #121212 100%);
          border-bottom: 1px solid #333;
          padding-top: 2rem;
        }
        
        .lc-header-inner {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        .lc-competition-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 2rem;
            color: #aaa;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        .lc-competition-name { color: #fff; }
        .lc-separator { color: #555; }

        /* --- Score Panel --- */
        .lc-score-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }
        
        .lc-team {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .lc-team-logo { 
            width: 90px; 
            height: 90px; 
            object-fit: contain;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
        }
        .lc-team-name { 
            font-weight: 700; 
            font-size: 1.2rem; 
            color: #fff;
            max-width: 180px;
            line-height: 1.3;
        }

        .lc-score-center { 
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin: 0 20px;
        }
        
        .lc-score-box {
            background: #2a2a2a;
            padding: 10px 24px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Roboto Mono', monospace;
            border: 1px solid #333;
        }
        .lc-score-digit { font-size: 2.5rem; font-weight: 700; color: #fff; }
        .lc-score-divider { font-size: 2rem; color: #666; position: relative; top: -2px; }

        .lc-status-badge {
            font-size: 0.85rem;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 20px;
            background: #333;
            color: #ccc;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .lc-status-badge.is-live {
            background: rgba(220, 53, 69, 0.2);
            color: #ff4d4d;
            border: 1px solid rgba(220, 53, 69, 0.3);
        }
        .lc-live-dot {
            width: 6px; height: 6px; background: #ff4d4d; border-radius: 50%;
            animation: pulse 1.5s infinite;
        }

        /* --- Tabs --- */
        .lc-tabs-wrapper {
            background: #181818;
            border-top: 1px solid #2a2a2a;
        }
        .lc-tabs {
          display: flex;
          justify-content: center;
          max-width: 1000px;
          margin: 0 auto;
        }
        .lc-tab-button {
          background: none;
          border: none;
          color: #888;
          padding: 1rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }
        .lc-tab-button:hover { color: #fff; background: #222; }
        .lc-tab-button.active { color: #ff6b00; }
        .lc-tab-button.active::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 3px;
            background: #ff6b00;
        }

        /* --- Content --- */
        .lc-content-area { 
            max-width: 1200px; 
            margin: 2rem auto; 
            padding: 0 1rem;
        }
        .lc-summary-section { width: 100%; max-width: 800px; margin: 0 auto; }
        .lc-summary-text { color: #ccc; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1rem; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        
        @media(max-width: 768px) {
          .lc-score-digit { font-size: 1.8rem; }
          .lc-team-logo { width: 50px; height: 50px; }
          .lc-team-name { font-size: 0.9rem; display: none; }
          .lc-tabs { overflow-x: auto; justify-content: flex-start; }
          .lc-tab-button { padding: 1rem; white-space: nowrap; }
          .lc-score-box { padding: 8px 16px; }
          .lc-team { flex-direction: column; }
        }
      `}</style>
    </>
  );
};

export default LiveContent;