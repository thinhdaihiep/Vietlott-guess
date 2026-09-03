import React from 'react';
import { Database, RefreshCw, CheckCircle2, Download, Plus, RotateCcw, BarChart3, History, ListFilter, Sparkles } from 'lucide-react';
import { VietlottGame } from '../types';

interface NavbarProps {
  activeView: 'results' | 'stats' | 'prediction' | 'logs';
  setActiveView: (view: 'results' | 'stats' | 'prediction' | 'logs') => void;
  totalCollected: number;
  onSyncData: () => void;
  isSyncing?: boolean;
  onOpenManualModal: () => void;
  onOpenImportExportModal: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  totalCollected,
  onSyncData,
  isSyncing = false,
  onOpenManualModal,
  onOpenImportExportModal,
  onResetData,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Logo & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg text-white tracking-tight leading-none">
                Vietlott Data Collector
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {totalCollected.toLocaleString('vi-VN')} bản ghi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Hệ thống thu thập & phân tích dữ liệu xổ số tự động
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
          <button
            onClick={() => setActiveView('results')}
            title="Danh sách kết quả"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeView === 'results'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span className="hidden md:inline">Kết quả</span>
          </button>

          <button
            onClick={() => setActiveView('stats')}
            title="Thống kê Tần suất & Cặp số"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeView === 'stats'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden md:inline">Thống kê</span>
          </button>

          <button
            onClick={() => setActiveView('prediction')}
            title="Dự đoán toán học 3 Lựa chọn tối ưu"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeView === 'prediction'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Dự đoán</span>
          </button>

          <button
            onClick={() => setActiveView('logs')}
            title="Nhật ký Thu thập"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeView === 'logs'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">Nhật ký</span>
          </button>
        </div>

        {/* Action Icon Buttons */}
        <div className="flex items-center gap-2">
          {/* Manual Collection & Sync Button */}
          <button
            onClick={onSyncData}
            disabled={isSyncing}
            title="Thu thập & Đồng bộ dữ liệu mới nhất từ GitHub"
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-sm transition-all flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

          {/* Automatic Sync Indicator Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tự động kiểm tra 2 link GitHub khi truy cập</span>
          </div>

          <button
            onClick={onOpenManualModal}
            title="Thêm kết quả thủ công"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenImportExportModal}
            title="Nhập / Xuất dữ liệu JSON"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onResetData}
            title="Khôi phục dữ liệu ban đầu"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-amber-400 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
