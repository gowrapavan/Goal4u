// components/live/ElixxMatchList.js
import React, { useEffect, useState } from 'react';
import ModernSpinner from '../../common/ModernSpinner';
import ErrorMessage from '../../common/ErrorMessage';

// ✅ Exported so ProxedMatches can import it
export const fetchElixxMatches = async () => {
  const CORS_PROXIES = [
    "https://tv-stream-proxy.onrender.com/proxy?url=",

    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  const targetUrl = 'https://elixx.cc/schedule.html';
  let html;

  // Try proxies until one works
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(targetUrl));
      if (!res.ok) continue;
      html = await res.text();
      break;
    } catch {
      /* ignore */
    }
  }

  if (!html) throw new Error('Unable to fetch elixx.cc matches');

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const matches = [];

  // Extract date from header
  const dateHeader = doc.querySelector('h4[style*="BDA24E"]');
  let scheduleDate = null;
  if (dateHeader) {
    const dateMatch = dateHeader.textContent.match(/(\d{2}\.\d{2}\.\d{4})/);
    if (dateMatch) {
      const [day, month, year] = dateMatch[1].split('.');
      scheduleDate = `${year}-${month}-${day}`;
    }
  }

  // Find schedule buttons
  const scheduleButtons = [];
  let nextEl = dateHeader?.nextElementSibling;
  while (nextEl) {
    if (nextEl.tagName === 'BUTTON' && nextEl.classList.contains('accordion')) {
      scheduleButtons.push(nextEl);
    }
    nextEl = nextEl.nextElementSibling;
  }

  scheduleButtons.forEach(button => {
    const buttonText = button.textContent.trim();
    const [timePart, matchName] = buttonText.split(/\s+(.*)/).slice(0, 2);
    let [home, away] = (matchName || '').split(' vs ');
    if (!away) away = 'Unknown';

    // Panel is next sibling
    const panel = button.nextElementSibling;
    const firstStreamLink = panel?.querySelector('a[href$=".html"]');
    if (!firstStreamLink) return;

    // Convert .html → .php
    const href = firstStreamLink.getAttribute('href');
    const fileName = href.replace('.html', '.php').split('/').pop();
    const phpUrl = `https://elixx.cc/aw/${fileName}`;

    // Build full ISO datetime
    let fullDateTime = new Date().toISOString();
    if (scheduleDate && timePart) {
      fullDateTime = `${scheduleDate}T${timePart}:00`;
    }

    matches.push({
      id: `elixx-${home}-${away}-${timePart}`,
      competition: 'ELIXX',
      home,
      away,
      status: 'Scheduled',
      time: fullDateTime,
      url: phpUrl
    });
  });

  return matches;
};

const ElixxMatchList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatMatchDate = dateStr =>
    new Date(dateStr).toLocaleString('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchElixxMatches();
        setMatches(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="live-match-list container" style={{ marginTop: '2rem' }}>
      <h3 style={{ color: '#212529' }}>Extra Streams</h3>

      {loading ? (
        <ModernSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      ) : matches.length > 0 ? (
        <ul className="match-list list-unstyled">
          {matches.map(match => (
            <li
              key={match.id}
              className="mb-3 p-2 border rounded text-center"
              style={{ cursor: 'pointer' }}
              onClick={() => window.open(match.url, '_blank')}
            >
              <div className="match-header d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-medium text-start">Extra Stream</span>
                <span className="fw-bold match-center-text d-none d-md-inline">
                  {match.home} vs {match.away}
                </span>
                <span className="date small text-muted text-end">
                  {formatMatchDate(match.time)}
                </span>
              </div>

              <div className="goals-result d-flex align-items-center justify-content-between">
                <span className="d-flex align-items-center text-dark">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(match.home)}&background=6c757d&color=fff&size=30`}
                    alt={match.home}
                  />
                  {match.home}
                </span>
                <span className="goals">
                  <b>-</b> - <b>-</b>
                </span>
                <span className="d-flex align-items-center text-dark justify-content-end">
                  {match.away}
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(match.away)}&background=6c757d&color=fff&size=30`}
                    alt={match.away}
                    className="ms-1"
                  />
                </span>
              </div>

              <div className="text-center mt-2">
                <div className="status scheduled">Scheduled</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-matches-placeholder">
          <h5 style={{ fontWeight: 600 }}>No extra streams found ⚽</h5>
        </div>
      )}
    </div>
  );
};

export default ElixxMatchList;
