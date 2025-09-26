import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Youtube from './Hightlight';
import MatchNews from './MatchNews';
import ErrorMessage from '../common/ErrorMessage';
import Stats from './Stats';

const COMPETITION_NAMES = {
  EPL: 'Premier League',
  ESP: 'La Liga',
  ITA: 'Serie A',
  GER: 'Bundesliga',
  FRA: 'Ligue 1',
  CWC: 'FIFA Club World Cup',
  UCL: 'Champions League',
  MLS: 'Major League Soccer',
};

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

  // If matchData not passed as prop, try to get from URL
  useEffect(() => {
    if (!propMatchData) {
      const matchId = searchParams.get('matchId');
      const comp = searchParams.get('competition');
      setCompetition(comp);
      
      if (matchId) {
        // Fetch matchData from your API/service using matchId
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

  const renderTeamLogo = (key, name, url) => (
    <img
      src={url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6c757d&color=fff&size=80`}
      alt={name}
      className="lc-team-logo"
    />
  );

  return (
    <>
      {/* Scoreboard */}
      <div className="lc-top-section">
        <div className="lc-score-panel">
          <div className="lc-team lc-home">
            {renderTeamLogo(matchData.HomeTeamKey, matchData.HomeTeamName, matchData.HomeTeamLogo)}
            <span className="lc-team-name">{matchData.HomeTeamName}</span>
            <div className="lc-goal">{matchData.HomeTeamScore ?? '-'}</div>
          </div>

          <div className="lc-score-center">
            <div className="lc-score">
              {matchData.HomeTeamScore ?? '-'} : {matchData.AwayTeamScore ?? '-'}
            </div>
            <p className="lc-competition">{COMPETITION_NAMES[competition] ?? competition}</p>
          </div>

          <div className="lc-team lc-away">
            {renderTeamLogo(matchData.AwayTeamKey, matchData.AwayTeamName, matchData.AwayTeamLogo)}
            <span className="lc-team-name">{matchData.AwayTeamName}</span>
            <div className="lc-goal">{matchData.AwayTeamScore ?? '-'}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <Stats matchId={matchData.GameId ? Number(matchData.GameId) : null} competition={matchData.Competition} />

      {/* Summary */}
      <section className="lc-summary-section">
        <div className="lc-summary-content">
          {autoSummary.map((p, i) => (
            <p key={i} className="lc-summary-text">{p}</p>
          ))}
          <Youtube query={`${matchData.HomeTeamName} vs ${matchData.AwayTeamName} highlights`} />
          <MatchNews matchTitle={`${matchData.HomeTeamName} vs ${matchData.AwayTeamName} ${competition ?? ''}`} />
        </div>
      </section>


      <style jsx>{`
        body {
          background: linear-gradient(180deg, #0b0b0b, #1f1f1f);
          color: #f5f5f5;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        /* Scoreboard */
        .lc-top-section {
          width: 100%;
          background: rgba(30, 30, 30, 0.9);
          padding: 1.5rem;
          box-shadow: 0 8px 28px rgba(0,0,0,0.7);
        }

        .lc-score-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          max-width: 1200px;
          margin: auto;
          flex-wrap: nowrap; /* Always horizontal */
        }

        .lc-team {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 80px;
        }

        .lc-team-logo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #222;
          box-shadow: 0 6px 18px rgba(0,0,0,0.6);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .lc-team-logo:hover {
          transform: scale(1.1);
          box-shadow: 0 10px 25px rgba(0,0,0,0.8);
        }

        .lc-team-name {
          font-weight: 700;
          font-size: 1.1rem;
          margin-top: 0.6rem;
          color: #fff;
          text-shadow: 0 0 4px rgba(0,0,0,0.6);
        }

        .lc-goal {
          font-size: 1.6rem;
          font-weight: 800;
          margin-top: 0.5rem;
          color: #0cb154ff;
          text-shadow: 0 0 8px rgba(12,177,84,0.7);
        }

        .lc-score-center {
          flex: 1;
        }

        .lc-score {
          font-size: 3rem;
          font-weight: 900;
          color: #0cb154ff;
          text-shadow: 0 0 12px rgba(12,177,84,0.7);
        }

        .lc-competition {
          font-size: 0.9rem;
          color: #ccc;
          margin-top: 0.3rem;
          font-weight: 500;
        }

        /* Summary Section */
        .lc-summary-section {
          width: 98%;
          margin: 0 auto; /* No vertical gap */
        }

        .lc-summary-content {
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.6);
        }

        .lc-summary-text {
          color: #ddd;
          font-size: 1.15rem;
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        /* Mobile adjustments */
        @media(max-width: 768px) {
          .lc-score-panel {
            flex-direction: row; /* Keep horizontal */
            justify-content: space-around;
            gap: 0; /* Remove extra gap */
          }
          .lc-score {
            font-size: 2rem;
          }
          .lc-team-logo {
            width: 60px;
            height: 60px;
          }
          .lc-goal {
            font-size: 1.3rem;
          }
          .lc-team-name {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </>
  );
};

export default LiveContent;
