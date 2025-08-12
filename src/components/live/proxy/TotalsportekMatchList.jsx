// components/live/TotalsportekMatchList.js
import React, { useEffect, useState } from "react";
import ModernSpinner from "../../common/ModernSpinner";
import ErrorMessage from "../../common/ErrorMessage";

export const fetchTotalsportekMatches = async () => {
  // Prioritize your own self-hosted proxy first for security & reliability.
  // Replace with your own if available.
  const CORS_PROXIES = [
    // Example self-hosted proxy (replace with your own)
"https://tv-stream-proxy.onrender.com/proxy?url=",
    // Public proxies with known reliability issues but fallback
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://thingproxy.freeboard.io/fetch/",
    "https://cors-anywhere.herokuapp.com/", // may require manual activation
    "https://yacdn.org/proxy/",
    "https://cors.bridged.cc/",
  ];

  const baseUrl = "https://www.totalsportek.to/soccerstreams";
  const parser = new DOMParser();

  // Fetch with timeout and optional retries per URL
  const fetchWithTimeout = async (url, ms = 12000, retries = 2) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ms);
      try {
        // Note: client fetch can't set User-Agent headers due to browser limits
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        return await res.text();
      } catch (err) {
        clearTimeout(timeout);
        console.warn(
          `[Attempt ${attempt}] Fetch failed for ${url}: ${err.message}`
        );

        // small backoff delay before retrying
        if (attempt < retries) await new Promise((r) => setTimeout(r, 500));
      }
    }
    return null; // after retries
  };

  let html = null;

  // Try proxies in order with retries per proxy, break on success
  for (const proxy of CORS_PROXIES) {
    try {
      console.log(`Trying proxy: ${proxy}`);
      const fetchUrl =
        proxy.endsWith("=") || proxy.endsWith("?")
          ? proxy + encodeURIComponent(baseUrl)
          : proxy + encodeURIComponent(baseUrl);

      html = await fetchWithTimeout(fetchUrl, 12000, 3);

      if (html) break;
    } catch (e) {
      console.warn(`Proxy ${proxy} failed: ${e.message}`);
    }
  }

  if (!html) throw new Error("Unable to fetch Totalsportek matches via all proxies");

  const doc = parser.parseFromString(html, "text/html");
  const listItems = Array.from(doc.querySelectorAll("ul.competitions li a"));

  if (listItems.length === 0) {
    throw new Error("Totalsportek page structure has changed or no matches found");
  }

  const matches = [];
  const concurrency = 6; // concurrency control

  const tasks = listItems.map((a) => async () => {
    const homeName =
      a.querySelector(".col-8 .row:nth-child(1) .col-10")?.textContent.trim() ||
      "Unknown";
    const awayName =
      a.querySelector(".col-8 .row:nth-child(2) .col-10")?.textContent.trim() ||
      "Unknown";

    const match = {
      url: a.href,
      home: homeName,
      away: awayName,
      homeLogo: "",
      awayLogo: "",
      isoTime: new Date().toISOString(),
    };

    // Fetch match details with proxies and retries
    for (const proxy of CORS_PROXIES) {
      try {
        const detailFetchUrl =
          proxy.endsWith("=") || proxy.endsWith("?")
            ? proxy + encodeURIComponent(match.url)
            : proxy + encodeURIComponent(match.url);

        const detailHtml = await fetchWithTimeout(detailFetchUrl, 10000, 2);
        if (detailHtml) {
          const detailDoc = parser.parseFromString(detailHtml, "text/html");

          match.homeLogo =
            [...detailDoc.querySelectorAll("img[alt]")]
              .find(
                (img) =>
                  img.alt.trim().toLowerCase() === match.home.trim().toLowerCase()
              )
              ?.src ||
            detailDoc.querySelector(".match-view-head-side1 img")?.src ||
            "";

          match.awayLogo =
            [...detailDoc.querySelectorAll("img[alt]")]
              .find(
                (img) =>
                  img.alt.trim().toLowerCase() === match.away.trim().toLowerCase()
              )
              ?.src ||
            detailDoc.querySelector(".match-view-head-side2 img")?.src ||
            "";

          const dateText =
            detailDoc.querySelector(".header h2.title small span")?.textContent ||
            "";
          const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
          if (dateMatch) {
            match.isoTime = new Date(dateMatch[1] + " UTC").toISOString();
          }
          break; // success for this match detail, stop trying proxies
        }
      } catch (e) {
        console.warn(`Detail fetch failed for ${match.url} on proxy ${proxy}: ${e.message}`);
        // continue to next proxy
      }
    }

    matches.push({
      id: `totalsportek-${match.home}-${match.away}`,
      competition: "TOTALSPORTEK",
      home: match.home,
      away: match.away,
      status: "Scheduled",
      time: match.isoTime,
      url: match.url,
      homeLogo:
        match.homeLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.home)}`,
      awayLogo:
        match.awayLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.away)}`,
    });
  });

  // Process tasks in batches for concurrency control
  for (let i = 0; i < tasks.length; i += concurrency) {
    await Promise.all(tasks.slice(i, i + concurrency).map((fn) => fn()));
  }

  return matches;
};

const TotalsportekMatchList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatMatchDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTotalsportekMatches();
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
    <div className="live-match-list container" style={{ marginTop: "2rem" }}>
      <h3 style={{ color: "#212529" }}>Extra Streams (Totalsportek)</h3>

      {loading ? (
        <ModernSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      ) : matches.length > 0 ? (
        <ul className="match-list list-unstyled">
          {matches.map((match) => (
            <li
              key={match.id}
              className="mb-3 p-2 border rounded text-center"
              style={{ cursor: "pointer" }}
              onClick={() => window.open(match.url, "_blank")}
            >
              <div className="match-header d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-medium text-start">{match.competition}</span>
                <span className="fw-bold match-center-text d-none d-md-inline">
                  {match.home} vs {match.away}
                </span>
                <span className="date small text-muted text-end">{formatMatchDate(match.time)}</span>
              </div>

              <div className="goals-result d-flex align-items-center justify-content-between">
                <span className="d-flex align-items-center text-dark">
                  <img src={match.homeLogo} alt={match.home} width="30" />
                  {match.home}
                </span>
                <span className="goals">
                  <b>-</b> - <b>-</b>
                </span>
                <span className="d-flex align-items-center text-dark justify-content-end">
                  {match.away}
                  <img src={match.awayLogo} alt={match.away} width="30" className="ms-1" />
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
          <h5 style={{ fontWeight: 600 }}>No Totalsportek matches found ⚽</h5>
        </div>
      )}
    </div>
  );
};

export default TotalsportekMatchList;
