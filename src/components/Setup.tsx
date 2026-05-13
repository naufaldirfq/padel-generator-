import React, { useState } from 'react';
import { Player } from '../types';
import { Plus, X, Users, Trophy } from 'lucide-react';

export default function Setup({ onStart }: { onStart: (players: Player[], courts: number, format: 'americano' | 'mexicano', points: number) => void }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [courts, setCourts] = useState(2);
  const [format, setFormat] = useState<'americano' | 'mexicano'>('mexicano');
  const [points, setPoints] = useState(24);

  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    
    setPlayers([
      ...players,
      {
        id: crypto.randomUUID(),
        name: newPlayerName.trim(),
        matchesPlayed: 0,
        points: 0,
        scoreDiff: 0,
      },
    ]);
    setNewPlayerName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const quickFill = () => {
    const defaultNames = ['Alex', 'Ben', 'Charlie', 'David', 'Emma', 'Finn', 'George', 'Harry'];
    const newPs = defaultNames.map((name) => ({
      id: crypto.randomUUID(),
      name,
      matchesPlayed: 0,
      points: 0,
      scoreDiff: 0,
    }));
    setPlayers(newPs);
  };

  const handleStart = () => {
    if (players.length < 4) {
      alert('Need at least 4 players.');
      return;
    }
    onStart(players, courts, format, points);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Left Column: Settings */}
      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--line-color)] pb-4">
            <div className="bg-[var(--neon-green)] p-2 text-black">
              <Trophy size={20} />
            </div>
            <h2 className="text-xl font-display uppercase tracking-widest">Format Rules</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Format</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormat('mexicano')}
                  className={`border p-4 text-center text-sm font-semibold uppercase tracking-widest transition-colors ${
                    format === 'mexicano' 
                      ? 'border-[var(--neon-green)] bg-[var(--neon-green)] text-black' 
                      : 'border-[var(--line-color)] text-gray-400 hover:border-gray-500'
                  }`}
                >
                  Mexicano
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('americano')}
                  className={`border p-4 text-center text-sm font-semibold uppercase tracking-widest transition-colors ${
                    format === 'americano' 
                      ? 'border-[var(--neon-green)] bg-[var(--neon-green)] text-black' 
                      : 'border-[var(--line-color)] text-gray-400 hover:border-gray-500'
                  }`}
                >
                  Americano
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {format === 'mexicano' 
                  ? 'Matches are based on current standings. Play with those close to your rank.' 
                  : 'Play a round-robin schedule. Random partners and opponents every round.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Number of Courts</label>
                <div className="flex items-center brutal-border">
                  <button 
                    className="p-4 hover:bg-[var(--line-color)] transition-colors disabled:opacity-50"
                    onClick={() => setCourts(Math.max(1, courts - 1))}
                    disabled={courts <= 1}
                  >-</button>
                  <div className="flex-1 text-center font-display text-2xl">{courts}</div>
                  <button 
                    className="p-4 hover:bg-[var(--line-color)] transition-colors"
                    onClick={() => setCourts(courts + 1)}
                  >+</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Points Per Match</label>
                <div className="flex items-center brutal-border">
                  <button 
                    className="p-4 hover:bg-[var(--line-color)] transition-colors disabled:opacity-50"
                    onClick={() => setPoints(Math.max(1, points - 1))}
                    disabled={points <= 1}
                  >-</button>
                  <div className="flex-1 text-center font-display text-2xl">{points}</div>
                  <button 
                    className="p-4 hover:bg-[var(--line-color)] transition-colors"
                    onClick={() => setPoints(points + 1)}
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {players.length >= 4 && (
          <button
            onClick={handleStart}
            className="action-btn w-full py-5 text-lg flex items-center justify-center gap-2"
          >
            Start Tournament <Trophy size={20} />
          </button>
        )}
      </div>

      {/* Right Column: Players */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--line-color)] pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 text-black">
              <Users size={20} />
            </div>
            <h2 className="text-xl font-display uppercase tracking-widest">Roster <span className="text-[var(--neon-green)] ml-2">{players.length}</span></h2>
          </div>
          {players.length === 0 && (
            <button onClick={quickFill} className="text-xs uppercase tracking-wider text-gray-400 hover:text-white underline">
              Quick Fill 8 Players
            </button>
          )}
        </div>

        <form onSubmit={addPlayer} className="flex gap-4">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="ADD PLAYER NAME..."
            className="flex-1 input-brutal p-4 text-lg placeholder-gray-600 focus:outline-none"
          />
          <button type="submit" className="action-btn-outline px-6 flex items-center justify-center disabled:opacity-50" disabled={!newPlayerName.trim()}>
            <Plus size={24} />
          </button>
        </form>

        {players.length === 0 ? (
          <div className="border border-dashed border-[var(--line-color)] p-12 text-center text-gray-500 uppercase tracking-widest text-sm">
            No players added yet
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {players.map((p, index) => (
              <li key={p.id} className="brutal-border p-4 flex items-center justify-between group hover:border-gray-500 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-600 w-4">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="font-semibold">{p.name}</span>
                </div>
                <button
                  onClick={() => removePlayer(p.id)}
                  className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove player"
                >
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
