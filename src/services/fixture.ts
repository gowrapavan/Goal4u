import axios from 'axios';

export const PREFERRED_COMPETITIONS = [
  'EPL', 'DEB', 'ITSA', 'FRL1', 'NLC', 'PTC', 'MLS', 'SPL', 'SKC',
  'CWC', 'UCL', 'ELC', 'UEL',
  'UNL', 'UEQ', 'EFAC', 'SAWQ', 'ASWQ', 'AFWQ', 'NAWQ', 'OWQ'
];

const INTERNATIONAL_COMPS = ['CWC', 'WC'];

const PREFERRED_CLUBS = [
  'Real Madrid CF', 'FC Barcelona', 'Atlético de Madrid', 'Sevilla FC', 'Real Sociedad',
  'Real Betis', 'Villarreal CF', 'Athletic Club',
  'Manchester City FC', 'Arsenal FC', 'Liverpool FC', 'Manchester United FC', 'Chelsea FC',
  'Tottenham Hotspur FC', 'Newcastle United FC', 'West Ham United FC', 'Aston Villa FC',
  'AC Milan', 'FC Internazionale Milano', 'Juventus FC', 'AS Roma', 'SSC Napoli',
  'Atalanta BC', 'Fiorentina', 'Lazio',
  'FC Bayern München', 'Borussia Dortmund', 'RB Leipzig', 'Bayer 04 Leverkusen',
  'Eintracht Frankfurt', 'SC Freiburg', 'VfL Wolfsburg',
  'Paris Saint-Germain FC', 'Olympique de Marseille', 'AS Monaco FC', 'Olympique Lyonnais',
  'LOSC Lille', 'RC Lens', 'Stade Rennais FC',
  'AFC Ajax', 'PSV Eindhoven', 'Feyenoord Rotterdam',
  'FC Porto', 'SL Benfica', 'Sporting CP',
  'Celtic FC', 'Rangers FC',
  'Al Hilal', 'Al Ahly', 'Palmeiras', 'Club León', 'Seattle Sounders FC',
  'Shabab Al Ahli', 'Flamengo', 'Club América', 'Galatasaray', 'Besiktas',
  'Dinamo Zagreb', 'Shakhtar Donetsk', 'Red Bull Salzburg', 'Copenhagen',
  'Young Boys', 'Anderlecht', 'Club Brugge', 'Sparta Prague', 'NK Olimpija Ljubljana', 'FC Kairat'
];

const LOCAL_BASE_URL = '/data/2026';

const fetchMatches = async (): Promise<any[]> => {
  let allMatches: any[] = [];

  for (const comp of PREFERRED_COMPETITIONS) {
    try {
      const url = `${LOCAL_BASE_URL}/${comp.toUpperCase()}.json`;
      const response = await axios.get(url);
      const data = response.data;

      const filtered = data.filter((match: any) => {
        const matchTime = new Date(match.DateTime ?? match.Date ?? '');

        const isPreferredTeam =
          PREFERRED_CLUBS.includes(match.HomeTeamName) ||
          PREFERRED_CLUBS.includes(match.AwayTeamName);

        const isInternational = INTERNATIONAL_COMPS.includes(comp.toUpperCase());

        return isPreferredTeam || isInternational;
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

  // Sort by datetime ascending (earliest to latest)
  allMatches.sort(
    (a, b) =>
      new Date(a.DateTime ?? a.Date).getTime() - new Date(b.DateTime ?? b.Date).getTime()
  );

  return allMatches; // Return full list (filter/slice in component)
};

export const FixtureService = {
  fetchMatches,
};
