import React, { useEffect, useState } from 'react';
import { Flame, Snowflake, PieChart, BarChart2, Ticket, Zap } from 'lucide-react';
import { VietlottGame, GameStats } from '../types';
import { GAME_METADATA } from './GameFilterBar';

export const StatsView: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<VietlottGame>('mega645');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStats(selectedGame);
  }, [selectedGame]);

  const fetchStats = async (game: VietlottGame) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/vietlott/stats?game=${game}`);
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const games: { id: VietlottGame; label: string; icon: React.ReactNode }[] = [
    { id: 'mega645', label: 'Mega 6/45', icon: <Ticket className="w-4 h-4 text-red-600" /> },
    { id: 'power655', label: 'Power 6/55', icon: <Zap className="w-4 h-4 text-amber-600" /> },
  ];

  const maxNum = selectedGame === 'power655' ? 55 : 45;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Game Selector for Stats */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-slate-200">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGame(g.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedGame === g.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {g.icon}
            <span>{g.label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Đang tính toán thống kê tần suất...</p>
        </div>
      ) : !stats || stats.totalDraws === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-sm font-medium">Chưa đủ dữ liệu thống kê cho trò chơi này</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Draws Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng số kỳ quay thu thập</p>
                <p className="text-2xl font-bold font-mono text-slate-900">{stats.totalDraws}</p>
              </div>
            </div>

            {/* Hot Numbers */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Số xuất hiện nhiều nhất (Hot)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stats.hotNumbers.map((item) => (
                  <span
                    key={item.number}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs font-bold flex items-center gap-1"
                  >
                    <span>{String(item.number).padStart(2, '0')}</span>
                    <span className="text-[10px] text-amber-600">({item.count})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Cold Numbers */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-2">
                <Snowflake className="w-4 h-4 text-blue-600" />
                <span>Số xuất hiện ít nhất (Cold)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stats.coldNumbers.map((item) => (
                  <span
                    key={item.number}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-mono text-xs font-bold flex items-center gap-1"
                  >
                    <span>{String(item.number).padStart(2, '0')}</span>
                    <span className="text-[10px] text-blue-600">({item.count})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Odd/Even Ratio Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
              <span className="flex items-center gap-1.5 font-semibold">
                <PieChart className="w-4 h-4 text-purple-600" />
                <span>Tỷ lệ Chẵn / Lẻ</span>
              </span>
              <span className="font-mono text-slate-500 font-semibold">
                Lẻ: {stats.oddCount} | Chẵn: {stats.evenCount}
              </span>
            </div>
            {stats.oddCount + stats.evenCount > 0 && (
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                <div
                  style={{ width: `${(stats.oddCount / (stats.oddCount + stats.evenCount)) * 100}%` }}
                  className="bg-purple-600 h-full"
                  title={`Lẻ: ${Math.round((stats.oddCount / (stats.oddCount + stats.evenCount)) * 100)}%`}
                ></div>
                <div
                  style={{ width: `${(stats.evenCount / (stats.oddCount + stats.evenCount)) * 100}%` }}
                  className="bg-blue-600 h-full"
                  title={`Chẵn: ${Math.round((stats.evenCount / (stats.oddCount + stats.evenCount)) * 100)}%`}
                ></div>
              </div>
            )}
          </div>

          {/* Complete Frequency Grid */}
          {maxNum > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                Bảng tần suất xuất hiện tất cả các số (01 - {maxNum})
              </h3>
              <div className="grid grid-cols-5 sm:grid-cols-9 md:grid-cols-12 gap-2">
                {Array.from({ length: maxNum }, (_, i) => i + 1).map((n) => {
                  const count = stats.numberFrequency[n] || 0;
                  const maxFreq = Math.max(...(Object.values(stats.numberFrequency) as number[]), 1);
                  const intensity = count / maxFreq;

                  return (
                    <div
                      key={n}
                      title={`Số ${n}: ${count} lần xuất hiện`}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center relative overflow-hidden group hover:border-blue-500 transition-all"
                    >
                      <div
                        style={{ height: `${Math.max(intensity * 100, 5)}%` }}
                        className="absolute bottom-0 left-0 right-0 bg-blue-100 group-hover:bg-blue-200 transition-all"
                      ></div>
                      <div className="relative z-10">
                        <p className="font-mono text-xs font-bold text-slate-900">{String(n).padStart(2, '0')}</p>
                        <p className="font-mono text-[10px] text-slate-500 font-semibold">{count}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
