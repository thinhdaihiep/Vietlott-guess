import React, { useState } from 'react';
import { Trash2, Calendar, Hash, Trophy, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { VietlottDrawResult } from '../types';
import { GAME_METADATA } from './GameFilterBar';

interface ResultsTableProps {
  results: VietlottDrawResult[];
  onDeleteResult: (id: string) => void;
  isLoading: boolean;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results, onDeleteResult, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 42;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [results]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Đang tải dữ liệu thu thập...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-300">Chưa có kết quả nào</p>
        <p className="text-xs text-slate-500 mt-1">
          Nhấn nút "Thu thập" để tự động cào kết quả mới hoặc thêm thủ công
        </p>
      </div>
    );
  }

  const formatVND = (num?: number) => {
    if (!num) return null;
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toLocaleString('vi-VN')} tỷđ`;
    }
    return `${num.toLocaleString('vi-VN')}đ`;
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedResults.map((item) => {
          const gameMeta = GAME_METADATA[item.game] || GAME_METADATA.mega645;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-4.5 transition-all hover:shadow-md flex flex-col justify-between group relative"
            >
              <div>
                {/* Header: Game Badge & Period */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${gameMeta.badgeBg}`}>
                      {gameMeta.title}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-slate-400" />
                      {item.period}
                    </span>
                  </div>

                  {/* Date & Action */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.drawDate}
                    </span>
                    <button
                      onClick={() => onDeleteResult(item.id)}
                      title="Xóa bản ghi này"
                      className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Drawn Ball Numbers */}
                <div className="my-3">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {item.numbers.map((num, idx) => (
                      <span
                        key={idx}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono ${gameMeta.ballBg}`}
                      >
                        {String(num).padStart(2, '0')}
                      </span>
                    ))}

                    {/* Special Number for Power 6/55 */}
                    {item.specialNumber !== undefined && (
                      <span
                        title="Số đặc biệt / Cầu may mắn"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono bg-gradient-to-br from-red-600 to-amber-500 text-white shadow-sm ring-2 ring-amber-300"
                      >
                        {String(item.specialNumber).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional Info: Jackpots / Keno Stats */}
                {item.additionalData && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3 text-xs text-slate-600">
                    {item.additionalData.jackpotAmount && (
                      <div className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        <span>Jackpot: {formatVND(item.additionalData.jackpotAmount)}</span>
                      </div>
                    )}

                    {item.additionalData.jackpot1Amount && (
                      <div className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        <span>JP1: {formatVND(item.additionalData.jackpot1Amount)}</span>
                      </div>
                    )}

                    {item.additionalData.jackpot2Amount && (
                      <div className="flex items-center gap-1 text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>JP2: {formatVND(item.additionalData.jackpot2Amount)}</span>
                      </div>
                    )}

                    {item.additionalData.kenoOddEven && (
                      <div className="bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200 font-medium text-slate-700">
                        Chẵn/Lẻ: {item.additionalData.kenoOddEven}
                      </div>
                    )}

                    {item.additionalData.kenoBigSmall && (
                      <div className="bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200 font-medium text-slate-700">
                        Tài/Xỉu: {item.additionalData.kenoBigSmall}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer source indicator */}
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Nguồn: {item.source === 'auto_collector' ? 'Cào tự động' : item.source === 'manual' ? 'Thủ công' : 'Nhập JSON'}</span>
                <span>{new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, results.length)} trong tổng số {results.length} bản ghi
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-slate-700 px-2">
              Trang {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
