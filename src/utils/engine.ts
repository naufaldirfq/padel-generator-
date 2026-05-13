import { Match, Player } from '../types';

export function generateNextRound(
  players: Player[],
  courts: number,
  format: 'americano' | 'mexicano',
  currentRound: number,
  pastMatches: Match[] = []
): Match[] {
  // Determine how many players can play. Max is courts * 4.
  const maxPlayers = courts * 4;
  const playableCount = Math.floor(players.length / 4) * 4;
  const activeCount = Math.min(maxPlayers, playableCount);

  if (activeCount === 0) return [];

  // Sort players to decide who plays
  // Primary: matchesPlayed (asc) -> ensures everyone plays roughly equal matches
  // Secondary: points (desc) -> for Mexicano ranking
  // Tertiary: scoreDiff (desc) -> tie breaker for ranking
  // Quaternary: random -> shuffling ties or first round
  let sortedPlayers = [...players].sort((a, b) => {
    if (a.matchesPlayed !== b.matchesPlayed) {
      return a.matchesPlayed - b.matchesPlayed;
    }
    if (format === 'mexicano' || currentRound > 0) {
      if (a.points !== b.points) {
        return b.points - a.points;
      }
      if (a.scoreDiff !== b.scoreDiff) {
        return b.scoreDiff - a.scoreDiff;
      }
    }
    return Math.random() - 0.5;
  });

  const selectedPlayers = sortedPlayers.slice(0, activeCount);
  const matches: Match[] = [];

  if (format === 'americano' && currentRound > 1) {
    // Round Robin Americano heuristic: minimize repeated partners and opponents
    const partnerCount: Record<string, Record<string, number>> = {};
    const opponentCount: Record<string, Record<string, number>> = {};
    
    for (const p of players) {
      partnerCount[p.id] = {};
      opponentCount[p.id] = {};
      for (const p2 of players) {
        partnerCount[p.id][p2.id] = 0;
        opponentCount[p.id][p2.id] = 0;
      }
    }

    for (const m of pastMatches) {
      // Partners
      partnerCount[m.teamA[0]][m.teamA[1]]++;
      partnerCount[m.teamA[1]][m.teamA[0]]++;
      partnerCount[m.teamB[0]][m.teamB[1]]++;
      partnerCount[m.teamB[1]][m.teamB[0]]++;
      
      // Opponents
      for (const pA of m.teamA) {
        for (const pB of m.teamB) {
          opponentCount[pA][pB]++;
          opponentCount[pB][pA]++;
        }
      }
    }

    let bestConfig = [...selectedPlayers];
    let minPenalty = Infinity;

    // Try multiple random shuffles to find the best grouping
    for (let attempts = 0; attempts < 500; attempts++) {
      const currentConfig = [...selectedPlayers].sort(() => Math.random() - 0.5);
      let penalty = 0;
      
      for (let i = 0; i < activeCount; i += 4) {
        const p0 = currentConfig[i].id;
        const p1 = currentConfig[i+1].id;
        const p2 = currentConfig[i+2].id;
        const p3 = currentConfig[i+3].id;
        
        penalty += partnerCount[p0][p1] * 10; // heavier penalty for same partner
        penalty += partnerCount[p2][p3] * 10;
        
        penalty += opponentCount[p0][p2];
        penalty += opponentCount[p0][p3];
        penalty += opponentCount[p1][p2];
        penalty += opponentCount[p1][p3];
      }
      
      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestConfig = currentConfig;
      }
    }
    
    for (let i = 0; i < activeCount / 4; i++) {
        matches.push({
          id: crypto.randomUUID(),
          round: currentRound,
          court: i + 1,
          teamA: [bestConfig[i * 4].id, bestConfig[i * 4 + 1].id],
          teamB: [bestConfig[i * 4 + 2].id, bestConfig[i * 4 + 3].id],
          scoreA: null,
          scoreB: null,
        });
    }
  } else {
    // First round or Mexicano
    if (currentRound === 1 || format === 'americano') {
      selectedPlayers.sort(() => Math.random() - 0.5);
    }
    
    // Create matches by chunking into groups of 4
    for (let i = 0; i < activeCount / 4; i++) {
      const group = selectedPlayers.slice(i * 4, i * 4 + 4);

      // Mexicano: pair 1&4 vs 2&3. If Americano first round, random.
      let teamA = [group[0].id, group[3].id];
      let teamB = [group[1].id, group[2].id];

      if (format === 'americano') {
        teamA = [group[0].id, group[1].id];
        teamB = [group[2].id, group[3].id];
      }

      matches.push({
        id: crypto.randomUUID(),
        round: currentRound,
        court: i + 1,
        teamA,
        teamB,
        scoreA: null,
        scoreB: null,
      });
    }
  }

  return matches;
}

export function recalculateStats(players: Player[], matches: Match[]): Player[] {
  // Reset stats
  const statsMap: Record<string, { mp: number; pts: number; diff: number }> = {};
  for (const p of players) {
    statsMap[p.id] = { mp: 0, pts: 0, diff: 0 };
  }

  // Calculate based on finished matches
  for (const m of matches) {
    if (m.scoreA !== null && m.scoreB !== null) {
      for (const pId of m.teamA) {
        statsMap[pId].mp += 1;
        statsMap[pId].pts += m.scoreA;
        statsMap[pId].diff += (m.scoreA - m.scoreB);
      }
      for (const pId of m.teamB) {
        statsMap[pId].mp += 1;
        statsMap[pId].pts += m.scoreB;
        statsMap[pId].diff += (m.scoreB - m.scoreA);
      }
    }
  }

  return players.map((p) => ({
    ...p,
    matchesPlayed: statsMap[p.id].mp,
    points: statsMap[p.id].pts,
    scoreDiff: statsMap[p.id].diff,
  }));
}
