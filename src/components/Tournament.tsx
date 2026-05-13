import React, { useState, useEffect } from 'react';
import { Player, TournamentState, Match } from '../types';
import { generateNextRound, recalculateStats } from '../utils/engine';
import { Activity, Trophy, Swords, ChevronRight, Download } from 'lucide-react';

export default function Tournament({
  state,
  setState,
}: {
  state: TournamentState;
  setState: React.Dispatch<React.SetStateAction<TournamentState>>;
}) {
  const [activeTab, setActiveTab] = useState<'matches' | 'leaderboard'>('matches');

  // Generate first round if matches is empty
  useEffect(() => {
    if (state.matches.length === 0 && state.currentRound === 0) {
      handleNextRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextRound = () => {
    const nextRoundNumber = state.currentRound + 1;
    const newMatches = generateNextRound(state.players, state.courts, state.format, nextRoundNumber, state.matches);
    setState({
      ...state,
      currentRound: nextRoundNumber,
      matches: [...state.matches, ...newMatches],
    });
  };

  const handleScoreChange = (matchId: string, team: 'A' | 'B', scoreStr: string) => {
    const score = scoreStr === '' ? null : parseInt(scoreStr, 10);
    if (score !== null && isNaN(score)) return;

    const newMatches = state.matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          [team === 'A' ? 'scoreA' : 'scoreB']: score,
        };
      }
      return m;
    });

    const newPlayers = recalculateStats(state.players, newMatches);

    setState({
      ...state,
      matches: newMatches,
      players: newPlayers,
    });
  };

  const currentRoundMatches = state.matches.filter((m) => m.round === state.currentRound);
  const allMatchesFinished = currentRoundMatches.every((m) => m.scoreA !== null && m.scoreB !== null);

  const sortedLeaderboard = [...state.players].sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.scoreDiff !== b.scoreDiff) return b.scoreDiff - a.scoreDiff;
    return a.name.localeCompare(b.name);
  });

  const getPlayerName = (id: string) => state.players.find((p) => p.id === id)?.name || 'Unknown';

  const exportToCSV = () => {
    let csv = 'Leaderboard\n';
    csv += 'Rank,Player,Matches Played,Points,Score Diff\n';
    sortedLeaderboard.forEach((p, i) => {
      csv += `${i + 1},"${p.name}",${p.matchesPlayed},${p.points},${p.scoreDiff}\n`;
    });
    
    csv += '\nMatches\n';
    csv += 'Round,Court,Team A (P1),Team A (P2),Team B (P1),Team B (P2),Score A,Score B\n';
    state.matches.forEach(m => {
      const ta0 = `"${getPlayerName(m.teamA[0])}"`;
      const ta1 = `"${getPlayerName(m.teamA[1])}"`;
      const tb0 = `"${getPlayerName(m.teamB[0])}"`;
      const tb1 = `"${getPlayerName(m.teamB[1])}"`;
      csv += `${m.round},${m.court},${ta0},${ta1},${tb0},${tb1},${m.scoreA ?? ''},${m.scoreB ?? ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `padel-tournament-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b border-[var(--line-color)] mb-4">
        <button
          className={`flex-1 py-4 text-sm font-semibold uppercase tracking-widest ${
            activeTab === 'matches' ? 'border-b-2 border-[var(--neon-green)] text-white' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
        <button
          className={`flex-1 py-4 text-sm font-semibold uppercase tracking-widest ${
            activeTab === 'leaderboard' ? 'border-b-2 border-[var(--neon-green)] text-white' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      {/* Main Content: Matches */}
      <div className={`col-span-1 lg:col-span-8 space-y-8 ${activeTab === 'matches' ? 'block' : 'hidden lg:block'}`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--line-color)] pb-4 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 text-black">
                <Activity size={20} />
              </div>
              <h2 className="text-xl font-display uppercase tracking-widest">
                Round <span className="text-[var(--neon-green)]">{state.currentRound}</span>
              </h2>
            </div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mt-2">
              All matches must be finished to unlock next round.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="action-btn-outline px-4 py-3 flex items-center justify-center gap-2 text-xs"
              title="Export to CSV"
            >
              <Download size={18} /> Export
            </button>
            <button
              onClick={handleNextRound}
              disabled={!allMatchesFinished}
              className="action-btn px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Round <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentRoundMatches.map((match) => (
            <div key={match.id} className="brutal-border flex flex-col">
              <div className="border-b border-[var(--line-color)] p-3 flex justify-between items-center bg-[var(--faded-black)]">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Court {match.court}
                </span>
                <span className="text-xs font-semibold tracking-widest bg-[var(--neon-green)] text-black px-2 py-0.5">
                  TARGET: {state.pointsPerMatch}
                </span>
              </div>
              
              <div className="p-4 flex-1">
                {/* Team A */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{getPlayerName(match.teamA[0])}</p>
                    <p className="font-semibold text-lg">{getPlayerName(match.teamA[1])}</p>
                  </div>
                  <div className="w-24 border-l border-[var(--line-color)] pl-4">
                    <input
                      type="number"
                      min={0}
                      max={state.pointsPerMatch}
                      value={match.scoreA === null ? '' : match.scoreA}
                      onChange={(e) => handleScoreChange(match.id, 'A', e.target.value)}
                      placeholder="0"
                      className="w-full bg-[var(--faded-black)] border border-[var(--line-color)] p-2 text-center text-xl font-display focus:outline-none focus:border-[var(--neon-green)] transition-colors"
                    />
                  </div>
                </div>
                
                <div className="relative border-t border-dashed border-[var(--line-color)] mb-6">
                  <div className="absolute left-1/2 -top-3 -translate-x-1/2 bg-[var(--brutal-black)] px-2 text-gray-600">
                    <Swords size={18} />
                  </div>
                </div>
                
                {/* Team B */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{getPlayerName(match.teamB[0])}</p>
                    <p className="font-semibold text-lg">{getPlayerName(match.teamB[1])}</p>
                  </div>
                  <div className="w-24 border-l border-[var(--line-color)] pl-4">
                    <input
                      type="number"
                      min={0}
                      max={state.pointsPerMatch}
                      value={match.scoreB === null ? '' : match.scoreB}
                      onChange={(e) => handleScoreChange(match.id, 'B', e.target.value)}
                      placeholder="0"
                      className="w-full bg-[var(--faded-black)] border border-[var(--line-color)] p-2 text-center text-xl font-display focus:outline-none focus:border-[var(--neon-green)] transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              {/* Validation helper visually */}
              {match.scoreA !== null && match.scoreB !== null && (match.scoreA + match.scoreB !== state.pointsPerMatch) && (
                <div className="bg-red-500/10 border-t border-red-500/50 p-2 text-center">
                  <p className="text-xs text-red-400 font-semibold uppercase tracking-widest">
                    Score total is {match.scoreA + match.scoreB}, expected {state.pointsPerMatch}
                  </p>
                </div>
              )}
            </div>
          ))}
          {currentRoundMatches.length === 0 && (
            <div className="col-span-full border border-dashed border-[var(--line-color)] p-12 text-center text-gray-500 uppercase tracking-widest text-sm">
              Press "Next Round" to begin
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Content: Leaderboard */}
      <div className={`col-span-1 lg:col-span-4 ${activeTab === 'leaderboard' ? 'block' : 'hidden lg:block'}`}>
        <div className="brutal-border sticky top-24">
          <div className="border-b border-[var(--line-color)] p-4 flex items-center gap-3 bg-[var(--neon-green)]">
            <Trophy size={20} className="text-black" />
            <h2 className="text-xl font-display text-black uppercase tracking-widest">Standings</h2>
          </div>
          
          <div className="bg-[var(--faded-black)] p-3 grid grid-cols-[30px_1fr_40px_40px] gap-2 text-[10px] uppercase font-semibold text-gray-400 border-b border-[var(--line-color)]">
            <div>#</div>
            <div>Player</div>
            <div className="text-center" title="Matches Played">MP</div>
            <div className="text-right" title="Points">PTS</div>
          </div>
          
          <ul className="max-h-[600px] overflow-y-auto custom-scrollbar">
            {sortedLeaderboard.map((player, index) => (
              <li 
                key={player.id} 
                className="p-3 grid grid-cols-[30px_1fr_40px_40px] gap-2 items-center border-b border-[var(--line-color)] hover:bg-[var(--faded-black)] transition-colors"
              >
                <div className={`font-mono text-xs ${index < 3 ? 'text-[var(--neon-green)] font-bold' : 'text-gray-500'}`}>
                  {index + 1}
                </div>
                <div className="font-semibold truncate pr-2" title={player.name}>
                  {player.name}
                </div>
                <div className="text-center text-xs text-gray-400 font-mono">
                  {player.matchesPlayed}
                </div>
                <div className="text-right font-display text-lg">
                  {player.points}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
