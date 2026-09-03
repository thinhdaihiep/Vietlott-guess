import React, { useEffect, useState, useCallback } from 'react';
import { VietlottDrawResult, VietlottGame } from './types';
import { Navbar } from './components/Navbar';
import { GameFilterBar } from './components/GameFilterBar';
import { ResultsTable } from './components/ResultsTable';
import { StatsView } from './components/StatsView';
import { PredictionView } from './components/PredictionView';
import { LogsView } from './components/LogsView';
import { ManualEntryModal } from './components/ManualEntryModal';
import { ImportExportModal } from './components/ImportExportModal';
import { Check, Info, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'results' | 'stats' | 'prediction' | 'logs'>('results');
  const [selectedGame, setSelectedGame] = useState<VietlottGame | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<VietlottDrawResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  // Toast Banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/vietlott/collect', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'Đã đồng bộ dữ liệu mới nhất!', 'success');
        fetchResults();
      } else {
        showToast('Đồng bộ dữ liệu thất bại', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối khi đồng bộ dữ liệu', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const gameParam = selectedGame !== 'all' ? `game=${selectedGame}` : '';
      const searchParam = searchQuery ? `search=${encodeURIComponent(searchQuery)}` : '';
      const query = [gameParam, searchParam].filter(Boolean).join('&');

      const res = await fetch(`/api/vietlott/results?${query}`);
      const json = await res.json();

      if (json.success) {
        setResults(json.data);
        setTotalCount(json.total);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedGame, searchQuery]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleDeleteResult = async (id: string) => {
    try {
      const res = await fetch(`/api/vietlott/results/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        showToast('Đã xóa bản ghi thành công', 'success');
        fetchResults();
      }
    } catch (err) {
      showToast('Xóa bản ghi thất bại', 'error');
    }
  };

  const handleResetData = async () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục dữ liệu thu thập về trạng thái ban đầu?')) {
      try {
        const res = await fetch('/api/vietlott/reset', { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          showToast('Đã khôi phục dữ liệu ban đầu', 'success');
          fetchResults();
        }
      } catch (err) {
        showToast('Khôi phục dữ liệu thất bại', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Top Notification Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2.5 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-red-900 text-red-100 border-red-700'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            {toast.type === 'success' && <Check className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        totalCollected={totalCount}
        onSyncData={handleSyncData}
        isSyncing={isSyncing}
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onOpenImportExportModal={() => setIsImportExportModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* View Content */}
      <main className="flex-1">
        {activeView === 'results' && (
          <>
            <GameFilterBar
              selectedGame={selectedGame}
              setSelectedGame={setSelectedGame}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <ResultsTable
              results={results}
              onDeleteResult={handleDeleteResult}
              isLoading={isLoading}
            />
          </>
        )}

        {activeView === 'stats' && <StatsView />}

        {activeView === 'prediction' && (
          <PredictionView results={results} showToast={showToast} />
        )}

        {activeView === 'logs' && <LogsView />}
      </main>

      {/* Footer Status Bar */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-3 px-4 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>Hệ thống Thu thập Vietlott v1.0 • Node Express API & Local JSON Engine</span>
          <span className="font-mono text-slate-400">{totalCount} bản ghi đã lưu</span>
        </div>
      </footer>

      {/* Modals */}
      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => {
          showToast('Đã thêm bản ghi thủ công', 'success');
          fetchResults();
        }}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onSuccess={() => {
          showToast('Đã nhập dữ liệu thành công', 'success');
          fetchResults();
        }}
      />
    </div>
  );
}

