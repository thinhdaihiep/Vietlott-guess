import React, { useState } from 'react';
import { X, Download, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [jsonText, setJsonText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleExportDownload = () => {
    window.open('/api/vietlott/export', '_blank');
  };

  const handleImportSubmit = async () => {
    setStatusMsg(null);
    if (!jsonText.trim()) {
      setStatusMsg({ type: 'error', message: 'Vui lòng dán chuỗi JSON dữ liệu cần nhập' });
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      setIsImporting(true);
      const res = await fetch('/api/vietlott/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMsg({ type: 'success', message: `Đã nhập thành công ${json.importedCount} bản ghi` });
        setJsonText('');
        onSuccess();
      } else {
        setStatusMsg({ type: 'error', message: json.error || 'Nhập dữ liệu thất bại' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', message: 'Định dạng JSON không hợp lệ' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 text-slate-900">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Quản Lý Nhập / Xuất Dữ Liệu</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5">
          {/* Export Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900">Tải tệp JSON dữ liệu đã thu thập</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Xuất bộ dữ liệu kết quả Vietlott hiện tại để lưu trữ hoặc chia sẻ</p>
            </div>
            <button
              onClick={handleExportDownload}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Tải JSON</span>
            </button>
          </div>

          <div className="border-t border-slate-100 my-2"></div>

          {/* Import Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Nhập Dữ liệu JSON</span>
              </label>

              <label className="cursor-pointer text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                <FileText className="w-3.5 h-3.5" />
                <span>Chọn file .json</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Dán nội dung JSON (mảng các đối tượng VietlottDrawResult)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            ></textarea>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{statusMsg.message}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium transition-all"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={isImporting || !jsonText.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>Thực hiện nhập</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
