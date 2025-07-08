import axios from 'axios';

export const PREFERRED_COMPETITIONS = [
  'EPL', 'DEB', 'ITSA', 'FRL1', 'NLC', 'PTC', 'MLS', 'SPL', 'SKC',
  'CWC', 'UCL', 'ELC', 'UEL',
  'UNL', 'UEQ', 'EFAC', 'SAWQ', 'ASWQ', 'AFWQ', 'NAWQ', 'OWQ'
];

const INTERNATIONAL_COMPS = ['CWC', 'WC']; // Add more if needed

const PREFERRED_CLUBS = [
  // La Liga
  'Real Madrid CF', 'FC Barcelona', 'Atlético de Madrid', 'Sevilla FC', 'Real Sociedad',
  'Real Betis', 'Villarreal CF', 'Athletic Club',

  // Premier League
  'Manchester City FC', 'Arsenal FC', 'Liverpool FC', 'Manchester United FC', 'Chelsea FC',
  'Tottenham Hotspur FC', 'Newcastle United FC', 'West Ham United FC', 'Aston Villa FC',

  // Serie A
  'AC Milan', 'FC Internazionale Milano', 'Juventus FC', 'AS Roma', 'SSC Napoli',
  'Atalanta BC', 'Fiorentina', 'Lazio',

  // Bundesliga
  'FC Bayern München', 'Borussia Dortmund', 'RB Leipzig', 'Bayer 04 Leverkusen',
  'Eintracht Frankfurt', 'SC Freiburg', 'VfL Wolfsburg',

  // Ligue 1
  'Paris Saint-Germain FC', 'Olympique de Marseille', 'AS Monaco FC', 'Olympique Lyonnais',
  'LOSC Lille', 'RC Lens', 'Stade Rennais FC',

  // Dutch Eredivisie
  'AFC Ajax', 'PSV Eindhoven', 'Feyenoord Rotterdam',

  // Portuguese Liga
  'FC Porto', 'SL Benfica', 'Sporting CP',

  // Scottish Premiership
  'Celtic FC', 'Rangers FC',

  // Others (CWC + UCL regulars)
  'Al Hilal', 'Al Ahly', 'Palmeiras', 'Club León', 'Seattle Sounders FC',
  'Shabab Al Ahli', 'Flamengo', 'Club América', 'Galatasaray', 'Besiktas', 'Dinamo Zagreb', 'Shakhtar Donetsk',
  'Red Bull Salzburg', 'Copenhagen', 'Young Boys', 'Anderlecht', 'Club Brugge', 'Sparta Prague',

  // Add more...
];

// 👇 Set correct base path
const LOCAL_BASE_URL = '/data/2026';

const getToday = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

const fetchMatches = async (): Promise<any[]> => {
  const todayStr = getToday();
  let allMatches: any[] = [];

  for (const comp of PREFERRED_COMPETITIONS) {
    try {
      const url = `${LOCAL_BASE_URL}/${comp.toUpperCase()}.json`;
      const response = await axios.get(url);
      const data = response.data;

      const filtered = data.filter((match: any) => {
        const dateStr = match.Date?.split('T')[0] ?? '';
        const status = match.Status ?? 'Scheduled';
        const isToday = dateStr === todayStr;
        const isFuture = new Date(match.Date ?? '') > new Date();

        const isValidToday = isToday && ['Scheduled', 'InProgress', 'Final'].includes(status);
        const isValidFuture = !isToday && isFuture && status === 'Scheduled';

        const isPreferredTeam =
          PREFERRED_CLUBS.includes(match.HomeTeamName) ||
          PREFERRED_CLUBS.includes(match.AwayTeamName);

        const isInternational = INTERNATIONAL_COMPS.includes(comp.toUpperCase());

        return (isInternational || isPreferredTeam) && (isValidToday || isValidFuture);
      });

      allMatches.push(
        ...filtered.map((match: any) => ({
          ...match,
          Competition: comp
        }))
      );
    } catch (err: any) {
      console.error(`❌ Failed to load local JSON for ${comp}:`, err.message || err);
    }
  }

  allMatches.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
  return allMatches.slice(0, 10);
};

export const FixtureService = {
  fetchMatches,
};
