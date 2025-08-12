export const fetchElixxMatches = async () => {
  const CORS_PROXIES = [
      "https://tv-stream-proxy.onrender.com/proxy?url=",
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://thingproxy.freeboard.io/fetch/",
    "https://cors-anywhere.herokuapp.com/",
    "https://yacdn.org/proxy/",
    "https://cors.bridged.cc/",
  ];

  const baseUrl = "https://elixx.cc/schedule.html";
  const parser = new DOMParser();

  const fetchWithTimeout = async (url, ms = 10000, retries = 2) => {
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
        console.warn(`[Attempt ${attempt}] Elixx fetch failed for ${url}: ${err.message}`);
        if (attempt < retries) await new Promise((r) => setTimeout(r, 500));
      }
    }
    return null;
  };

  // Try to fetch Elixx schedule page
  let html = null;
  for (const proxy of CORS_PROXIES) {
    try {
      const fetchUrl =
        proxy.endsWith("=") || proxy.endsWith("?")
          ? proxy + encodeURIComponent(baseUrl)
          : proxy + encodeURIComponent(baseUrl);

      html = await fetchWithTimeout(fetchUrl, 10000, 2);
      if (html) {
        console.log("Successfully fetched Elixx schedule");
        break;
      }
    } catch (e) {
      console.warn(`Elixx proxy ${proxy} failed: ${e.message}`);
    }
  }

  if (!html) {
    console.warn("Could not fetch Elixx schedule, returning empty array");
    return [];
  }

  try {
    const doc = parser.parseFromString(html, "text/html");
    const matches = [];

    // Look for common selectors that might contain match information
    const possibleSelectors = [
      '.match-item',
      '.schedule-item', 
      '.game-item',
      '.fixture',
      'tr',
      '.match',
      '.event',
      '[data-match]',
      '.list-group-item'
    ];

    let matchElements = [];
    
    // Try different selectors to find match elements
    for (const selector of possibleSelectors) {
      const elements = doc.querySelectorAll(selector);
      if (elements.length > 0) {
        matchElements = Array.from(elements);
        console.log(`Found ${elements.length} potential matches using selector: ${selector}`);
        break;
      }
    }

    // If no structured elements found, look for text patterns
    if (matchElements.length === 0) {
      const bodyText = doc.body?.textContent || '';
      const lines = bodyText.split('\n').filter(line => line.trim());
      
      // Look for lines that might contain "vs" or team names
      const matchLines = lines.filter(line => {
        const text = line.trim().toLowerCase();
        return text.includes(' vs ') || 
               text.includes(' v ') ||
               (text.includes('arsenal') || text.includes('chelsea') || 
                text.includes('liverpool') || text.includes('manchester') ||
                text.includes('tottenham') || text.includes('barcelona') ||
                text.includes('real madrid') || text.includes('bayern'));
      });

      console.log(`Found ${matchLines.length} potential match lines from text parsing`);
      
      // Convert text lines to match objects
      matchLines.forEach((line, index) => {
        const vsMatch = line.match(/(.+?)\s+(?:vs?\.?|v)\s+(.+)/i);
        if (vsMatch) {
          const home = vsMatch[1].trim();
          const away = vsMatch[2].trim();
          
          matches.push({
            id: `elixx-text-${index}`,
            home: home,
            away: away,
            url: baseUrl,
            time: new Date().toISOString(),
            source: 'elixx'
          });
        }
      });
    } else {
      // Parse structured elements
      matchElements.forEach((element, index) => {
        const text = element.textContent || '';
        const vsMatch = text.match(/(.+?)\s+(?:vs?\.?|v)\s+(.+)/i);
        
        if (vsMatch) {
          const home = vsMatch[1].trim();
          const away = vsMatch[2].trim();
          
          // Skip if team names are too short or generic
          if (home.length > 2 && away.length > 2 && 
              !home.toLowerCase().includes('time') && 
              !away.toLowerCase().includes('time')) {
            
            matches.push({
              id: `elixx-${index}`,
              home: home,
              away: away,
              url: element.querySelector('a')?.href || baseUrl,
              time: new Date().toISOString(),
              source: 'elixx'
            });
          }
        }
      });
    }

    console.log(`Parsed ${matches.length} matches from Elixx`);
    return matches;

  } catch (error) {
    console.error("Error parsing Elixx schedule:", error);
    return [];
  }
};

// Helper function to normalize team names for matching
export const normalizeTeamName = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/fc|cf|united|city|real|atletico/gi, '')
    .trim();
};

// Helper function to check if two team names might be the same
export const teamsMatch = (team1, team2) => {
  const norm1 = normalizeTeamName(team1);
  const norm2 = normalizeTeamName(team2);
  
  // Exact match
  if (norm1 === norm2) return true;
  
  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
  // Check for common abbreviations
  const abbreviations = {
    'man utd': 'manchester united',
    'man city': 'manchester city',
    'spurs': 'tottenham',
    'arsenal': 'arsenal',
    'chelsea': 'chelsea',
    'liverpool': 'liverpool',
    'barca': 'barcelona',
    'madrid': 'real madrid'
  };
  
  for (const [abbr, full] of Object.entries(abbreviations)) {
    if ((norm1.includes(abbr) && norm2.includes(full)) ||
        (norm2.includes(abbr) && norm1.includes(full))) {
      return true;
    }
  }
  
  return false;
};