import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Youtube from './Hightlight';
import MatchNews from './MatchNews';
import ErrorMessage from '../common/ErrorMessage';
import Stats from './stats';
import Lineup from './Lineup';
import Images from './Images';
import Table from './Table'; // Updated: Import the new Table component

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
    if (!propMatchData) {
      const matchId = searchParams.get('matchId');
      const comp = searchParams.get('competition');
      setCompetition(comp);
      
      if (matchId) {
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
      case 'Stats':
        return <Stats matchId={Number(matchData.GameId)} competition={matchData.Competition} />;
      case 'Line-ups':
        return <Lineup matchId={Number(matchData.GameId)} competition={matchData.Competition} />;
      case 'Table': // Updated: Add case for Table
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
              <Youtube query={`${matchData.HomeTeamName} vs ${matchData.AwayTeamName} highlights`} />
              <MatchNews matchTitle={`${matchData.HomeTeamName} vs ${matchData.AwayTeamName} ${competition ?? ''}`} />
            </div>
          </section>
        );
    }
  };

  return (
    <>
      <div className="lc-top-section">
        <div className="lc-competition-header">
           <div className="lc-competition-details">
                <span className="lc-competition-name">{competitionInfo?.name ?? competition}</span>
                <span className="lc-competition-country">{competitionInfo?.country}</span>
            </div>
        </div>
        
        <div className="lc-score-panel">
          <div className="lc-team lc-home">
            {renderTeamLogo(matchData.HomeTeamKey, matchData.HomeTeamName, matchData.HomeTeamLogo)}
            <span className="lc-team-name">{matchData.HomeTeamName}</span>
          </div>
          <div className="lc-score-center">
            <div className="lc-score">
              {matchData.HomeTeamScore ?? '-'} : {matchData.AwayTeamScore ?? '-'}
            </div>
            <p className="lc-status">{matchData.Status}</p>
          </div>
          <div className="lc-team lc-away">
            {renderTeamLogo(matchData.AwayTeamKey, matchData.AwayTeamName, matchData.AwayTeamLogo)}
            <span className="lc-team-name">{matchData.AwayTeamName}</span>
          </div>
        </div>
        
        <nav className="lc-tabs">
          {/* Updated: Added 'Table' to the array of tabs */}
          {['Info', 'Stats', 'Line-ups', 'Table', 'H2H'].map(tab => (
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

      <div className="lc-content-area">
        {renderContent()}
      </div>

      <style jsx>{`
        body {
          background: linear-gradient(180deg, #0b0b0b, #1f1f1f);
          color: #f5f5f5;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }
        .lc-top-section {
          width: 100%;
          background: #181818;
          padding: 1.5rem 1.5rem 0;
          box-shadow: 0 8px 28px rgba(0,0,0,0.7);
        }
        .lc-competition-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto 1.5rem;
            padding: 0 0.5rem;
        }
        .lc-competition-details {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        .lc-competition-name {
            font-size: 1.2rem;
            font-weight: 700;
            color: #fff;
        }
        .lc-competition-country {
            font-size: 0.9rem;
            color: #ccc;
        }
        .lc-score-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          max-width: 1200px;
          margin: auto;
        }
        .lc-team {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
        }
        .lc-team-logo { width: 80px; height: 80px; }
        .lc-team-name { font-weight: 600; font-size: 1.1rem; color: #fff; }
        .lc-score-center { flex: 1; }
        .lc-score { font-size: 3rem; font-weight: 700; color: #fff; }
        .lc-status {
          font-size: 0.9rem;
          color: #ccc;
          margin-top: 0.3rem;
          font-weight: 500;
          text-transform: capitalize;
        }
        .lc-tabs {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 1.5rem;
          border-bottom: 1px solid #333;
        }
        .lc-tab-button {
          background: none;
          border: none;
          color: #aaa;
          padding: 0.8rem 1rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: color 0.2s ease-in-out, border-color 0.2s ease-in-out;
        }
        .lc-tab-button:hover { color: #fff; }
        .lc-tab-button.active {
          color: #FF6B00;
          border-bottom-color: #FF6B00;
        }
        .lc-content-area { max-width: 1600px; margin: 0 auto; }
        .lc-summary-section { width: 100%; }
        .lc-summary-content { padding: 2rem; }
        .lc-summary-text { color: #ddd; font-size: 1.15rem; line-height: 1.8; }
        
        @media(max-width: 768px) {
          .lc-score { font-size: 2rem; }
          .lc-team-logo { width: 60px; height: 60px; }
          .lc-team-name { font-size: 0.9rem; }
          .lc-tabs { gap: 0.5rem; justify-content: space-around; }
          .lc-tab-button { padding: 0.8rem 0.5rem; font-size: 0.9rem; }
        }
      `}</style>
    </>
  );
};

export default LiveContent;