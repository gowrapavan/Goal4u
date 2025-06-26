import React, { useState, useEffect } from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import EmptyState from './common/EmptyState';
import { getLiveMatches, getNextPreferredClubMatch } from '../services/RTab-Live'; // ⬅️ updated import
import { getTeamLogoByKey } from '../services/teamlogo';

const PREFERRED_CLUBS = [
  'Real Madrid CF', 'FC Barcelona', 'FC Bayern München', 'Arsenal FC',
  'Manchester United FC', 'Liverpool FC', 'Chelsea FC', 'Paris Saint-Germain FC',
  'AC Milan  ', 'FC Internazionale Milano', 'Tottenham Hotspur FC'
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
  const [teamLogos, setTeamLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTeamLogos = async (match) => {
    const compCode = COMPETITION_CODE_MAP[match.Competition] || match.Competition;
    const logos = {};
    for (const key of [match.HomeTeamKey, match.AwayTeamKey]) {
      if (!logos[key]) {
        logos[key] =
          (await getTeamLogoByKey(compCode, key)) ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            key
          )}&background=007bff&color=fff&size=50`;
      }
    }
    setTeamLogos(logos);
  };

  useEffect(() => {
    const loadMatch = async () => {
      try {
        const live = await getLiveMatches();
        if (live.length > 0) {
          setMatch(live[0]);
          await loadTeamLogos(live[0]);
        } else {
          const upcoming = await getNextPreferredClubMatch(PREFERRED_CLUBS); // ⬅️ changed logic
          if (upcoming) {
            setMatch(upcoming);
            await loadTeamLogos(upcoming);
          } else {
            setMatch(null);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Could not load match data.');
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, []);

  useEffect(() => {
    if (!match || match.Status === 'InProgress') return;

    const timer = setInterval(() => {
      const now = Date.now();
      const start = Date.parse(match.DateTime + 'Z');
      const diff = start - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [match]);

  if (loading) {
    return (
      <div className="counter-home-wraper">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="counter-home-wraper">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="counter-home-wraper">
        <EmptyState
          icon="fa-calendar"
          title="No Upcoming Matches"
          description="There are no live or upcoming matches for your preferred clubs."
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
          {match.Status === 'InProgress' ? 'Live Score' : 'Countdown Till Start'}
        </p>

        <div id="event-one" className="counter">
          {match.Status === 'InProgress' ? (
            <div className="text-center">
              <h5 className="text-danger">LIVE 🔴</h5>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                {match.HomeTeamScore ?? '-'} - {match.AwayTeamScore ?? '-'}
              </p>
            </div>
          ) : (
            <div className="countdown-display text-center">
              {timeLeft.days > 0 && (
                <span className="time-unit">
                  <strong>{timeLeft.days}D </strong>
                </span>
              )}
              {timeLeft.hours > 0 && (
                <span className="time-unit">
                  <strong>{timeLeft.hours}H </strong>
                </span>
              )}
              {timeLeft.minutes !== undefined && (
                <span className="time-unit">
                  <strong>
                    {timeLeft.days === 0 && timeLeft.hours === 0
                      ? `${timeLeft.minutes} Minutes`
                      : `${timeLeft.minutes}M`}{' '}
                  </strong>
                </span>
              )}
              {timeLeft.seconds !== undefined && (
                <span className="time-unit">
                  <strong>
                    {timeLeft.days === 0 && timeLeft.hours === 0
                      ? `${timeLeft.seconds} Seconds`
                      : `${timeLeft.seconds}S`}
                  </strong>
                </span>
              )}
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
            {match.Status === 'InProgress' ? 'Started at' : 'Starts at'}{' '}
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
              <p>
                {match.Competition}, {match.VenueType || 'Stadium'}
              </p>
            </div>

            <div className="col-md-5">
              <img
                src={teamLogos[match.HomeTeamKey]}
                alt={match.HomeTeamName}
                style={{ width: '50px', height: '50px', objectFit: 'contain' }}
              />
              <span>
                {match.HomeTeamName} ({match.HomeTeamScore ?? '-'})
              </span>
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
              <span>
                {match.AwayTeamName} ({match.AwayTeamScore ?? '-'})
              </span>
            </div>
          </div>
        </div>

        <a
          className="btn btn-primary"
          href={`/livematch?matchId=${match.GameId}&competition=${match.Competition}`}
        >
          VIEW DETAILS <i className="fa fa-trophy"></i>
        </a>
      </div>
    </div>
  );
};

export default RightTab;
