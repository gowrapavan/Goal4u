import axios from 'axios';

const API_KEY = import.meta.env.VITE_SPORTS_API_KEY;
const BASE_URL = 'https://api.sportsdata.io/v4/soccer/scores/json';

const PREFERRED_COMPETITIONS = ['EPL', 'ESP', 'ITSA', 'DEB', 'FRL1', 'CWC', 'UCL'];
const INTERNATIONAL_COMPS = ['CWC', 'WC']; // Add more international keys as needed

const PREFERRED_CLUBS = [
      // La Liga
  'Real Madrid CF',
  'FC Barcelona',
  'Atlético de Madrid',
  'Sevilla FC',
  'Real Sociedad',

  
  // Premier League
  'Manchester City FC',
  'Arsenal FC',
  'Liverpool FC',
  'Manchester United FC',
  'Chelsea FC',
  'Tottenham Hotspur FC',
  'Newcastle United FC',



  // Serie A
  'AC Milan',
  'FC Internazionale Milano',
  'Juventus FC',
  'AS Roma',
  'SSC Napoli',
  'Atalanta BC',

  // Bundesliga
  'FC Bayern München',
  'Borussia Dortmund',
  'RB Leipzig',
  'Bayer 04 Leverkusen',
  'Eintracht Frankfurt',

  // Ligue 1
  'Paris Saint-Germain FC',
  'Olympique de Marseille',
  'AS Monaco FC',
  'Olympique Lyonnais',
  'LOSC Lille'
];


const getToday = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getSeason = (): string => new Date().getFullYear().toString();

const fetchMatches = async (): Promise<any[]> => {
  const season = getSeason();
  const todayStr = getToday();
  let allMatches: any[] = [];

  for (const comp of PREFERRED_COMPETITIONS) {
    try {
      const url = `${BASE_URL}/SchedulesBasic/${comp}/${season}?key=${API_KEY}`;
      const response = await axios.get(url);
      const data = response.data;

      const filtered = data.filter((match: any) => {
        const dateStr = match.DateTime?.split('T')[0];
        const status = match.Status || 'Scheduled';
        const isToday = dateStr === todayStr;
        const isFuture = new Date(match.DateTime) > new Date();

        const isValidToday = isToday && ['Scheduled', 'InProgress', 'Final'].includes(status);
        const isValidFuture = !isToday && isFuture && status === 'Scheduled';

        const isPreferredTeam =
          PREFERRED_CLUBS.includes(match.HomeTeamName) ||
          PREFERRED_CLUBS.includes(match.AwayTeamName);

        const isInternational = INTERNATIONAL_COMPS.includes(comp);

        // Skip preferred club check for international matches
        return (isInternational || isPreferredTeam) && (isValidToday || isValidFuture);
      });

      allMatches.push(...filtered.map((match: any) => ({
        ...match,
        Competition: comp
      })));
    } catch (err: any) {
      console.error(`❌ Error fetching ${comp} matches:`, err.message || err);
      // Optional: if desired, you could return early or set a flag to notify UI
    }
  }

  allMatches.sort((a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime());
  return allMatches.slice(0, 10);
};

export const FixtureService = {
  fetchMatches,
};
