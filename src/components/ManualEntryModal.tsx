import React, { useState } from 'react';
import { X, Check, Ticket, Hash, Calendar, ListOrdered, Trophy } from 'lucide-react';
import { VietlottGame } from '../types';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [game, setGame] = useState<VietlottGame>('mega645');
  const [period, setPeriod] = useState('');
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split('T')[0]);
  const [numbersStr, setNumbersStr] = useState('');
  const [specialNumberStr, setSpecialNumberStr] = useState('');
  const [jackpotAmount, setJackpotAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!period || !drawDate || !numbersStr) {
      setErrorMsg('Vui lòng nhập đầy đủ kỳ quay, ngày quay và bộ số');
      return;
    }

    const numbersArr = numbersStr
      .split(/[\s,;-]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    if (numbersArr.length === 0) {
      setErrorMsg('Bộ số trúng thưởng không hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vietlott/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game,
          period,
          drawDate,
          numbers: numbersArr,
          specialNumber: specialNumberStr ? parseInt(specialNumberStr, 10) : undefined,
          additionalData: jackpotAmount ? { jackpotAmount: parseInt(jackpotAmount, 10) } : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSuccess();
        onClose();
        // Reset form
        setPeriod('');
        setNumbersStr('');
        setSpecialNumberStr('');
        setJackpotAmount('');
      } else {
        setErrorMsg(json.error || 'Đã xảy ra lỗi khi lưu');
      }
    } catch (err: any) {
      setErrorMsg('Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 text-slate-900">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Thêm Kết Quả Kỳ Quay Thủ Công</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Game Select */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-slate-400" />
              Trò chơi Vietlott
            </label>
            <select
              value={game}
              onChange={(e) => setGame(e.target.value as VietlottGame)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="mega645">Mega 6/45</option>
              <option value="power655">Power 6/55</option>
            </select>
          </div>

          {/* Period & Draw Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Mã Kỳ quay
              </label>
              <input
                type="text"
                placeholder="#01246"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Ngày quay
              </label>
              <input
                type="date"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Numbers list */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-slate-400" />
              Bộ số trúng thưởng (phân cách bằng dấu cách hoặc phẩy)
            </label>
            <input
              type="text"
              placeholder="05 12 18 23 34 42"
              value={numbersStr}
              onChange={(e) => setNumbersStr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
            />
          </div>

          {/* Special Number for Power 6/55 */}
          {game === 'power655' && (
            <div>
              <label className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-600" />
                Số đặc biệt / Cầu may mắn
              </label>
              <input
                type="number"
                placeholder="12"
                value={specialNumberStr}
                onChange={(e) => setSpecialNumberStr(e.target.value)}
                className="w-full bg-amber-50/50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-amber-400 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          )}

          {/* Jackpot Amount */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Giá trị Jackpot (VNĐ)
            </label>
            <input
              type="number"
              placeholder="38500000000"
              value={jackpotAmount}
              onChange={(e) => setJackpotAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Lưu bản ghi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
