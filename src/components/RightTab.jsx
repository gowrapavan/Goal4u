import React, { useState, useEffect } from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import EmptyState from './common/EmptyState';
import { getLiveMatches } from '../services/live';
import { getTeamLogoByKey } from '../services/teamlogo';

const COMPETITION_CODE_MAP = {
  'Premier League': 'EPL',
  'La Liga': 'ESP',
  'Serie A': 'ITA',
  'Bundesliga': 'GER',
  'Ligue 1': 'FRA',
  'FIFA Club World Cup': 'CWC',
  'UEFA Champions League': 'UCL',
};

const RightTab = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [match, setMatch] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [teamLogos, setTeamLogos] = useState({});

  // Load matches
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const data = await getLiveMatches();
        const sorted = data.sort(
          (a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime()
        );
        setLiveMatches(sorted);
        if (sorted.length > 0) {
          setMatch(sorted[0]);
          await loadTeamLogos([sorted[0]]);
        }
      } catch (err) {
        setError('Live matches could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchLive();
  }, []);

  // Countdown (or live)
  useEffect(() => {
    if (!match || match.Status === 'InProgress') return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const startTime = new Date(match.DateTime).getTime();
      const distance = startTime - now;

      if (distance > 0) {
        setTimeLeft({
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [match]);

  // Load logos
  const loadTeamLogos = async (matches) => {
    const logos = {};
    for (const match of matches) {
      const compCode = COMPETITION_CODE_MAP[match.Competition] || match.Competition;
      const homeKey = match.HomeTeamKey;
      const awayKey = match.AwayTeamKey;

      if (!logos[homeKey]) {
        logos[homeKey] =
          (await getTeamLogoByKey(compCode, homeKey)) ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(homeKey)}&background=007bff&color=fff&size=50`;
      }

      if (!logos[awayKey]) {
        logos[awayKey] =
          (await getTeamLogoByKey(compCode, awayKey)) ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(awayKey)}&background=dc3545&color=fff&size=50`;
      }
    }
    setTeamLogos(logos);
  };

  if (loading) {
    return (
      <div className="counter-home-wraper">
        <LoadingSpinner message="Loading live matches..." />
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
          title="No live matches"
          description="No live matches at the moment."
        />
      </div>
    );
  }

  return (
    <div className="counter-home-wraper">
      <div className="title-color text-center">
        <h4>{match.Competition || 'Live Match'}</h4>
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
            <div className="countdown-display">
              <div className="time-unit">
                <span className="number">{timeLeft.minutes || 0}</span>
                <span className="label">Minutes</span>
              </div>
              <div className="time-unit">
                <span className="number">{timeLeft.seconds || 0}</span>
                <span className="label">Seconds</span>
              </div>
            </div>
          )}
        </div>

        <ul className="post-options">
          <li>
            <i className="fa fa-calendar"></i>{' '}
            {new Date(match.DateTime).toLocaleDateString()}
          </li>
          <li>
            <i className="fa fa-clock-o"></i>{' '}
            Started at{' '}
            {new Date(match.DateTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
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

        <a className="btn btn-primary" href="#" onClick={(e) => e.preventDefault()}>
          VIEW DETAILS <i className="fa fa-trophy"></i>
        </a>
      </div>
    </div>
  );
};

export default RightTab;
