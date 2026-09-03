import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, RefreshCw, History, ShieldAlert } from 'lucide-react';
import { CollectorLog } from '../types';

export const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<CollectorLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vietlott/logs');
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Nhật ký hoạt động thu thập Dữ liệu</h2>
        </div>
        <button
          onClick={fetchLogs}
          title="Làm mới nhật ký"
          className="p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {isLoading && logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Đang tải nhật ký...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-sm">Chưa có nhật ký nào</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-all">
                {/* Status Icon */}
                <div className="mt-0.5">
                  {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {log.status === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                  {log.status === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900">{log.message}</p>
                    <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                      Trò chơi: {log.game}
                    </span>
                    {log.itemsAdded > 0 && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +{log.itemsAdded} bản ghi mới
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
