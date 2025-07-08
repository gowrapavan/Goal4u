import React, { useState, useEffect } from 'react';
import ErrorMessage from './common/ErrorMessage';
import EmptyState from './common/EmptyState';
import { getNextPreferredClubMatch } from '../services/RTab-Live';
import { getTeamLogoByKey } from '../services/teamlogo';

const PREFERRED_CLUBS = [
  'Real Madrid CF', 'FC Barcelona', 'FC Bayern München', 'Arsenal FC',
  'Manchester United FC', 'Liverpool FC', 'Chelsea FC', 'Paris Saint-Germain FC',
  'AC Milan', 'FC Internazionale Milano', 'Tottenham Hotspur FC'
];

const COMPETITION_CODE_MAP = {
  'Premier League': 'EPL',
  'La Liga': 'ESP',
  'Serie A': 'ITSA',
  'Bundesliga': 'DEB',
  'Ligue 1': 'FRL1',
  'FIFA Club World Cup': 'CWC',
  'UEFA Champions League': 'UCL',
};

const RightTab = () => {
  const [match, setMatch] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [matchIsLive, setMatchIsLive] = useState(false);
  const [teamLogos, setTeamLogos] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMatch = async () => {
      try {
        const upcoming = await getNextPreferredClubMatch(PREFERRED_CLUBS);
        if (upcoming) {
          setMatch(upcoming);

          const compCode = COMPETITION_CODE_MAP[upcoming.Competition] || upcoming.Competition;
          const [homeLogo, awayLogo] = await Promise.all([
            getTeamLogoByKey(compCode, upcoming.HomeTeamKey),
            getTeamLogoByKey(compCode, upcoming.AwayTeamKey)
          ]);

          setTeamLogos({
            [upcoming.HomeTeamKey]: homeLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(upcoming.HomeTeamKey)}&background=007bff&color=fff&size=50`,
            [upcoming.AwayTeamKey]: awayLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(upcoming.AwayTeamKey)}&background=007bff&color=fff&size=50`,
          });
        }
      } catch (err) {
        console.error(err);
        setError('Could not load match data.');
      }
    };

    loadMatch();
  }, []);

  useEffect(() => {
    if (!match) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const matchTime = Date.parse(match.DateTime + 'Z');
      const diff = matchTime - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
        setMatchIsLive(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setMatchIsLive(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [match]);

  // === UI Starts Here ===

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!match) {
    return (
      <div className="counter-home-wraper">
        <EmptyState
          icon="fa-calendar"
          title="Searching Matches..."
          description="Please wait while we fetch upcoming matches for your clubs."
        />
      </div>
    );
  }

  return (
    <div className="counter-home-wraper">
      <div className="title-color text-center">
        <h4>{match.Competition || 'Upcoming Match'}</h4>
      </div>

      <div className="content-counter content-counter-home">
        <p className="text-center">
          <i className="fa fa-clock-o"></i>{' '}
          {matchIsLive ? 'Match is Live' : 'Countdown Till Start'}
        </p>

        <div id="event-one" className="counter">
          {matchIsLive ? (
            <div className="text-center">
              <h5 className="text-danger">LIVE 🔴</h5>
            </div>
          ) : (
            <div className="countdown-display text-center">
              {timeLeft.days > 0 && <span className="time-unit"><strong>{timeLeft.days}D </strong></span>}
              {timeLeft.hours > 0 && <span className="time-unit"><strong>{timeLeft.hours}H </strong></span>}
              <span className="time-unit"><strong>{timeLeft.minutes}M </strong></span>
              <span className="time-unit"><strong>{timeLeft.seconds}S</strong></span>
            </div>
          )}
        </div>

        <ul className="post-options">
          <li>
            <i className="fa fa-calendar"></i>{' '}
            {new Date(match.DateTime + 'Z').toLocaleDateString('en-IN', {
              timeZone: 'Asia/Kolkata',
            })}
          </li>
          <li>
            <i className="fa fa-clock-o"></i>{' '}
            Starts at{' '}
            {new Date(match.DateTime + 'Z').toLocaleTimeString('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </li>
        </ul>

        <div className="list-groups">
          <div className="row align-items-center">
            <div className="col-md-12">
              <p>{match.Competition}, {match.VenueType || 'Stadium'}</p>
            </div>

            <div className="col-md-5">
              <img
                src={teamLogos[match.HomeTeamKey]}
                alt={match.HomeTeamName}
                style={{ width: '50px', height: '50px', objectFit: 'contain' }}
              />
              <span>{match.HomeTeamName}</span>
            </div>

            <div className="col-md-2 text-center">
              <div className="vs">Vs</div>
            </div>

            <div className="col-md-5">
              <img
                src={teamLogos[match.AwayTeamKey]}
                alt={match.AwayTeamName}
                style={{ width: '50px', height: '50px', objectFit: 'contain' }}
              />
              <span>{match.AwayTeamName}</span>
            </div>
          </div>
        </div>

        <a
          className="btn btn-primary"
          href={
            matchIsLive
              ? `/livematch?matchId=${match.GameId}&competition=${match.Competition}`
              : '#'
          }
          style={{
            pointerEvents: matchIsLive ? 'auto' : 'none',
            opacity: matchIsLive ? 1 : 0.5,
          }}
        >
          {matchIsLive ? 'VIEW LIVE 🔴' : 'WAITING...'} <i className="fa fa-trophy"></i>
        </a>
      </div>
    </div>
  );
};

export default RightTab;
