import React from 'react';
import { LayoutGrid, Ticket, Zap, Search, X } from 'lucide-react';
import { VietlottGame } from '../types';

interface GameFilterBarProps {
  selectedGame: VietlottGame | 'all';
  setSelectedGame: (game: VietlottGame | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const GAME_METADATA: Record<VietlottGame, { title: string; color: string; badgeBg: string; ballBg: string }> = {
  mega645: {
    title: 'Mega 6/45',
    color: 'text-red-600',
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
    ballBg: 'bg-red-600 text-white shadow-sm font-semibold',
  },
  power655: {
    title: 'Power 6/55',
    color: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    ballBg: 'bg-amber-500 text-slate-950 shadow-sm font-bold',
  },
};

export const GameFilterBar: React.FC<GameFilterBarProps> = ({
  selectedGame,
  setSelectedGame,
  searchQuery,
  setSearchQuery,
}) => {
  const gamesList: { id: VietlottGame | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tất cả', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'mega645', label: 'Mega 6/45', icon: <Ticket className="w-4 h-4 text-red-600" /> },
    { id: 'power655', label: 'Power 6/55', icon: <Zap className="w-4 h-4 text-amber-600" /> },
  ];

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sticky top-16 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Game Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {gamesList.map((g) => {
            const isActive = selectedGame === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGame(g.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                {g.icon}
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo kỳ quay (#01245), ngày..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
