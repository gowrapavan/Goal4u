import axios from 'axios'; 

export const PREFERRED_COMPETITIONS = [
  'EPL', 'DEB', 'ITSA', 'FRL1', 'NLC', 'PTC', 'MLS', 'SPL', 'SKC','ESP',
  'CWC', 'UCL',
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
  'FC Porto', 'SL Benfica', 'Sporting CP','New England Revolution',
  'Celtic FC', 'Rangers FC',
  'Al Hilal', 'Al Ahly', 'Palmeiras', 'Club León', 'Seattle Sounders FC',
  'Shabab Al Ahli', 'Flamengo', 'Club América', 'Galatasaray', 'Besiktas',
  'Dinamo Zagreb', 'Shakhtar Donetsk', 'Red Bull Salzburg', 'Copenhagen',
  'Young Boys', 'Anderlecht', 'Club Brugge', 'Sparta Prague', 'NK Olimpija Ljubljana', 'FC Kairat'
];

// Base URL pointing to raw GitHub JSON files
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/gowrapavan/shortsdata/main/matches';

const fetchMatches = async (): Promise<any[]> => {
  let allMatches: any[] = [];

  for (const comp of PREFERRED_COMPETITIONS) {
    try {
      const url = `${GITHUB_BASE_URL}/${comp.toUpperCase()}.json`;
      const response = await axios.get(url);
      const data = response.data;

      const filtered = data.filter((match: any) => {
        const home = match.HomeTeamName ?? match.HomeTeam;
        const away = match.AwayTeamName ?? match.AwayTeam;

        const isPreferredTeam =
          PREFERRED_CLUBS.includes(home) ||
          PREFERRED_CLUBS.includes(away);

        const isInternational = INTERNATIONAL_COMPS.includes(comp.toUpperCase());

        return isPreferredTeam || isInternational;
      });

      allMatches.push(
        ...filtered.map((match: any) => ({
          Competition: comp,
          GameId: match.GameId,
          Date: match.Date ?? null,
          DateTime: match.DateTime ?? match.Date ?? null,
          Status: match.Status ?? 'Scheduled',
          Round: match.RoundName ?? match.Round ?? null,
          HomeTeam: match.HomeTeamName ?? match.HomeTeam,
          AwayTeam: match.AwayTeamName ?? match.AwayTeam,
          HomeTeamLogo: match.HomeTeamLogo ?? null,
          AwayTeamLogo: match.AwayTeamLogo ?? null,
          HomeTeamScore: match.HomeTeamScore ?? null,
          AwayTeamScore: match.AwayTeamScore ?? null,
          Result: match.Result ?? null,
          Points: match.Points ?? {},
          Goals: match.Goals ?? []
        }))
      );
    } catch (err: any) {
      console.error(`❌ Failed to load GitHub JSON for ${comp}:`, err.message || err);
    }
  }

  // Sort matches by DateTime (earliest → latest)
  allMatches.sort(
    (a, b) =>
      new Date(a.DateTime ?? a.Date).getTime() - new Date(b.DateTime ?? b.Date).getTime()
  );

  return allMatches;
};

export const FixtureService = {
  fetchMatches,
};
