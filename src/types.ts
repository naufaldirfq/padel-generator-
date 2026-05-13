export type Player = {
  id: string;
  name: string;
  matchesPlayed: number;
  points: number;
  scoreDiff: number;
};

export type PlayerStats = {
  playerId: string;
  matchesPlayed: number;
  points: number;
  scoreDiff: number;
};

export type Match = {
  id: string;
  round: number;
  court: number;
  teamA: string[]; // Player IDs
  teamB: string[]; // Player IDs
  scoreA: number | null;
  scoreB: number | null;
};

export type TournamentState = {
  players: Player[];
  courts: number;
  format: 'americano' | 'mexicano';
  pointsPerMatch: number;
  matches: Match[];
  currentRound: number;
  status: 'setup' | 'playing' | 'finished';
};
