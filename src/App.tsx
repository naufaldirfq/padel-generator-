import React, { useState, useEffect } from 'react';
import { Player, TournamentState } from './types';
import Setup from './components/Setup';
import Tournament from './components/Tournament';

const initialState: TournamentState = {
  players: [],
  courts: 1,
  format: 'mexicano',
  pointsPerMatch: 24,
  matches: [],
  currentRound: 0,
  status: 'setup',
};

export default function App() {
  const [state, setState] = useState<TournamentState>(() => {
    try {
      const saved = localStorage.getItem('padelTournamentState');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved tournament state', e);
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('padelTournamentState', JSON.stringify(state));
  }, [state]);

  const startTournament = (players: Player[], courts: number, format: 'americano' | 'mexicano', pointsPerMatch: number) => {
    setState({
      ...state,
      players,
      courts,
      format,
      pointsPerMatch,
      status: 'playing',
      currentRound: 0,
      matches: [],
    });
  };

  const endTournament = () => {
    if (window.confirm('Are you sure you want to end this event? You will return to the setup screen and match data will remain until a new event is started.')) {
      setState({ ...state, status: 'setup' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brutal-black)] font-sans antialiased selection:bg-[var(--neon-green)] selection:text-black">
      {/* Header */}
      <header className="border-b border-[var(--line-color)] p-4 sm:p-6 bg-[var(--brutal-black)] sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-[var(--gallery-white)]">
            Padel<span className="text-[var(--neon-green)]">Generator</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-widest mt-1">
            {state.status === 'setup' ? 'Tournament Configuration' : `${state.format} Format`}
          </p>
        </div>
        
        {state.status === 'playing' && (
          <button
            onClick={endTournament}
            className="action-btn-outline px-4 py-2 text-xs"
          >
            End Event
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 pb-24">
        {state.status === 'setup' ? (
          <Setup onStart={startTournament} />
        ) : (
          <Tournament state={state} setState={setState} />
        )}
      </main>
    </div>
  );
}
