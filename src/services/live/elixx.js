// services/elixx-matches.js
export async function fetchElixxMatches() {
  const CORS_PROXIES = [
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://thingproxy.freeboard.io/fetch/",
  ];

  const targetUrl = "https://elixx.cc/schedule.html";
  let html;

  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(targetUrl));
      if (!response.ok) continue;
      html = await response.text();
      break;
    } catch (e) {
      // try next proxy
    }
  }

  if (!html) throw new Error("Unable to fetch elixx.cc matches");

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const matches = [];
  const anchors = doc.querySelectorAll("a[href]");

  anchors.forEach(a => {
    let href = a.getAttribute("href");

    // Only process .html links
    if (href && href.endsWith(".html")) {
      // Convert to https://elixx.cc/aw/xxxx.php
      const fileName = href.replace(".html", ".php").split("/").pop();
      href = `https://elixx.cc/aw/${fileName}`;

      // Try to guess team names from link text
      const title = a.textContent.trim();
      let [home, away] = title.split(" vs ");
      if (!away) {
        home = title;
        away = "Unknown";
      }

      matches.push({
        GameId: `elixx-${home}-${away}`,
        Competition: "ELIXX",
        HomeTeamKey: home,
        AwayTeamKey: away,
        HomeTeamScore: null,
        AwayTeamScore: null,
        DateTime: new Date().toISOString(), // You could parse if available
        Status: "Scheduled",
        StreamUrl: href,
      });
    }
  });

  return matches;
}
