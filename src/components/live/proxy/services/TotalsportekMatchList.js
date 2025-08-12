import { fetchElixxMatches, teamsMatch } from './ElixxMatchList.js';

export const fetchTotalsportekMatches = async () => {
  const CORS_PROXIES = [
    "https://tv-stream-proxy.onrender.com/proxy?url=",
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://thingproxy.freeboard.io/fetch/",
    "https://cors-anywhere.herokuapp.com/",
    "https://yacdn.org/proxy/",
    "https://cors.bridged.cc/",
  ];

  const baseUrl = "https://www.totalsportek.to/soccerstreams";
  const parser = new DOMParser();

  const fetchWithTimeout = async (url, ms = 12000, retries = 2) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return await res.text();
      } catch (err) {
        clearTimeout(timeout);
        console.warn(`[Attempt ${attempt}] Fetch failed for ${url}: ${err.message}`);
        if (attempt < retries) await new Promise((r) => setTimeout(r, 500));
      }
    }
    return null;
  };

  // Function to integrate Elixx data with Totalsportek matches
  const integrateElixxData = (totalsportekMatches, elixxMatches) => {
    console.log(`Integrating ${totalsportekMatches.length} Totalsportek matches with ${elixxMatches.length} Elixx matches`);
    
    return totalsportekMatches.map(match => {
      // Try to find a matching Elixx match
      const elixxMatch = elixxMatches.find(elixx => {
        return (teamsMatch(match.home, elixx.home) && teamsMatch(match.away, elixx.away)) ||
               (teamsMatch(match.home, elixx.away) && teamsMatch(match.away, elixx.home));
      });
      
      if (elixxMatch) {
        console.log(`Found Elixx match for: ${match.home} vs ${match.away}`);
        return {
          ...match,
          hasHighlight: true,
          elixxUrl: elixxMatch.url
        };
      }
      
      return {
        ...match,
        hasHighlight: false,
        elixxUrl: null
      };
    });
  };

  // Fetch Elixx matches first
  let elixxMatches = [];
  try {
    elixxMatches = await fetchElixxMatches();
    console.log(`Fetched ${elixxMatches.length} matches from Elixx`);
  } catch (error) {
    console.warn("Failed to fetch Elixx matches:", error);
  }

  // Fetch Totalsportek page HTML using proxies
  let html = null;
  for (const proxy of CORS_PROXIES) {
    try {
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

  if (!html) {
    console.warn("Could not fetch Totalsportek, returning mock data");
    // Return mock data when proxies fail
    const mockMatches = [
      {
        id: "totalsportek-arsenal-chelsea",
        competition: "TOTALSPORTEK",
        home: "Arsenal",
        away: "Chelsea",
        status: "Scheduled",
        time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        url: "https://www.totalsportek.to/match/arsenal-vs-chelsea",
        homeLogo: "https://ui-avatars.com/api/?name=Arsenal&background=dc143c&color=fff",
        awayLogo: "https://ui-avatars.com/api/?name=Chelsea&background=034694&color=fff",
        hasHighlight: false,
        elixxUrl: null,
      },
      {
        id: "totalsportek-liverpool-manchester-united",
        competition: "TOTALSPORTEK",
        home: "Liverpool",
        away: "Manchester United",
        status: "Scheduled",
        time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        url: "https://www.totalsportek.to/match/liverpool-vs-manchester-united",
        homeLogo: "https://ui-avatars.com/api/?name=Liverpool&background=c8102e&color=fff",
        awayLogo: "https://ui-avatars.com/api/?name=Manchester+United&background=da020e&color=fff",
        hasHighlight: false,
        elixxUrl: null,
      },
      {
        id: "totalsportek-manchester-city-tottenham",
        competition: "TOTALSPORTEK",
        home: "Manchester City",
        away: "Tottenham",
        status: "Scheduled",
        time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        url: "https://www.totalsportek.to/match/manchester-city-vs-tottenham",
        homeLogo: "https://ui-avatars.com/api/?name=Manchester+City&background=6cabdd&color=fff",
        awayLogo: "https://ui-avatars.com/api/?name=Tottenham&background=132257&color=fff",
        hasHighlight: false,
        elixxUrl: null,
      },
      {
        id: "totalsportek-real-madrid-barcelona",
        competition: "TOTALSPORTEK",
        home: "Real Madrid",
        away: "Barcelona",
        status: "Scheduled",
        time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
        url: "https://www.totalsportek.to/match/real-madrid-vs-barcelona",
        homeLogo: "https://ui-avatars.com/api/?name=Real+Madrid&background=ffffff&color=000",
        awayLogo: "https://ui-avatars.com/api/?name=Barcelona&background=a50044&color=fff",
        hasHighlight: false,
        elixxUrl: null,
      },
    ];
    
    // Integrate Elixx data with mock matches
    const integratedMockMatches = integrateElixxData(mockMatches, elixxMatches);
    
    return integratedMockMatches.sort((a, b) => {
      if (a.hasHighlight && !b.hasHighlight) return -1;
      if (!a.hasHighlight && b.hasHighlight) return 1;
      return new Date(a.time) - new Date(b.time);
    });
  }

  const doc = parser.parseFromString(html, "text/html");
  const listItems = Array.from(doc.querySelectorAll("ul.competitions li a"));

  if (listItems.length === 0) {
    throw new Error("Totalsportek page structure has changed or no matches found");
  }

  const matches = [];
  const concurrency = 6;

  const tasks = listItems.map((a) => async () => {
    const homeName =
      a.querySelector(".col-8 .row:nth-child(1) .col-10")?.textContent.trim() || "Unknown";
    const awayName =
      a.querySelector(".col-8 .row:nth-child(2) .col-10")?.textContent.trim() || "Unknown";

    const match = {
      url: a.href,
      home: homeName,
      away: awayName,
      homeLogo: "",
      awayLogo: "",
      isoTime: new Date().toISOString(),
    };

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
              .find((img) => img.alt.trim().toLowerCase() === match.home.trim().toLowerCase())
              ?.src || detailDoc.querySelector(".match-view-head-side1 img")?.src || "";

          match.awayLogo =
            [...detailDoc.querySelectorAll("img[alt]")]
              .find((img) => img.alt.trim().toLowerCase() === match.away.trim().toLowerCase())
              ?.src || detailDoc.querySelector(".match-view-head-side2 img")?.src || "";

          const dateText =
            detailDoc.querySelector(".header h2.title small span")?.textContent || "";
          const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
          if (dateMatch) {
            match.isoTime = new Date(dateMatch[1] + " UTC").toISOString();
          }
          break;
        }
      } catch (e) {
        console.warn(`Detail fetch failed for ${match.url} on proxy ${proxy}: ${e.message}`);
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

  for (let i = 0; i < tasks.length; i += concurrency) {
    await Promise.all(tasks.slice(i, i + concurrency).map((fn) => fn()));
  }

  // Integrate real Elixx data
  const matchesWithHighlights = integrateElixxData(matches, elixxMatches);
  
  matchesWithHighlights.sort((a, b) => {
    if (a.hasHighlight && !b.hasHighlight) return -1;
    if (!a.hasHighlight && b.hasHighlight) return 1;
    return new Date(a.time) - new Date(b.time);
  });

  return matchesWithHighlights;
};