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

  const [showConfirm, setShowConfirm] = useState(false);

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
    setShowConfirm(true);
  };

  const confirmEndTournament = () => {
    setState({ ...state, status: 'setup' });
    setShowConfirm(false);
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

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--brutal-black)] border border-[var(--line-color)] max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-xl font-display uppercase tracking-widest text-white mb-4">End Event?</h3>
            <p className="text-sm text-gray-400 mb-8">
              Are you sure you want to end this event? You will return to the setup screen. Tournament config and players will remain.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="flex-1 action-btn-outline py-3 text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={confirmEndTournament} 
                className="flex-1 brutal-border bg-red-500 text-white font-semibold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
              >
                End It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
