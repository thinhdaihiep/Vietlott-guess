import React, { useState, useMemo } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Copy,
  Check,
  Zap,
  Ticket,
  TrendingUp,
  Cpu,
  ShieldCheck,
  BarChart2,
  PieChart,
  Activity,
  Flame,
  Award,
} from 'lucide-react';
import { VietlottDrawResult, VietlottGame } from '../types';
import { GAME_METADATA } from './GameFilterBar';
import { generateGamePrediction, backtestLastDraw, GAME_CONFIGS } from '../utils/predictionEngine';

interface PredictionViewProps {
  results: VietlottDrawResult[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PredictionView: React.FC<PredictionViewProps> = ({ results, showToast }) => {
  const [selectedGame, setSelectedGame] = useState<VietlottGame>('mega645');
  const [copiedOptionId, setCopiedOptionId] = useState<number | null>(null);

  const gamesList: { id: VietlottGame; label: string; icon: React.ReactNode }[] = [
    { id: 'mega645', label: 'Mega 6/45', icon: <Ticket className="w-4 h-4 text-red-600" /> },
    { id: 'power655', label: 'Power 6/55', icon: <Zap className="w-4 h-4 text-amber-600" /> },
  ];

  // Calculate algorithmic prediction for the active game
  const [isCalculating, setIsCalculating] = useState(true);
  const [prediction, setPrediction] = useState<any>(null);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  React.useEffect(() => {
    setIsCalculating(true);
    // Yield to the browser render cycle so the UI responds instantly
    const timer = setTimeout(() => {
      setPrediction(generateGamePrediction(selectedGame, results));
      setBacktestResult(backtestLastDraw(selectedGame, results));
      setIsCalculating(false);
    }, 10);
    return () => clearTimeout(timer);
  }, [selectedGame, results]);

  const handleCopyNumbers = (optionId: number, numbers: number[], specialNumber?: number) => {
    const gamePrefix = selectedGame === 'power655' ? '655' : '645';
    const numStr = numbers.map((n) => String(n).padStart(2, '0')).join(' ');
    const formatted = `${gamePrefix} K1 S ${numStr}`;

    navigator.clipboard.writeText(formatted);
    setCopiedOptionId(optionId);
    showToast(`Đã sao chép: ${formatted}`, 'success');

    setTimeout(() => {
      setCopiedOptionId(null);
    }, 2000);
  };

  const gameMeta = GAME_METADATA[selectedGame];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Game Selection Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {gamesList.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGame(g.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedGame === g.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {g.icon}
            <span>{g.label}</span>
          </button>
        ))}
      </div>

      {isCalculating || !prediction || !backtestResult ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-semibold">Đang xử lý thuật toán phân tích...</p>
        </div>
      ) : (
        <>
          {/* Model Overview & Self-Learning Dashboard Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-700/60 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  Mô Hình Thuật Toán Dự Đoán Tối Ưu — {gameMeta.title}
                </h2>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  Kỳ tiếp theo: {prediction.targetPeriod}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Áp dụng thuật toán thống kê xác suất ma trận chu kỳ, tần suất tích tụ & phân bổ chẵn lẻ. Tự động điều chỉnh trọng số liên tục theo kết quả từng kỳ quay thực tế.
              </p>
            </div>
          </div>

          {/* Machine Learning Adaptation Meter */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 min-w-[240px] text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-400" />
                Độ thích ứng mô hình:
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {prediction.backtestAccuracy.modelAdaptationProgress}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/80 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${prediction.backtestAccuracy.modelAdaptationProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Đã phân tích: {prediction.totalDrawsAnalyzed} kỳ</span>
              <span className="text-blue-300">Hoàn thiện liên tục</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Optimal Options Display */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              3 Lựa Chọn Tối Ưu Cho Kỳ Quay Tiếp Theo ({prediction.targetPeriod})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Cập nhật từ dữ liệu ngày {prediction.lastUpdatedDraw}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {prediction.options.map((opt) => (
            <div
              key={opt.id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              {/* Option Title Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      #{opt.id}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{opt.strategyName}</h4>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    {opt.confidenceScore}% Tối ưu
                  </span>
                </div>

                {/* Generated Lottery Balls */}
                <div className="my-4 bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex flex-wrap items-center justify-center gap-2">
                  {opt.numbers.map((num, idx) => (
                    <span
                      key={idx}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-mono shadow-sm ${gameMeta.ballBg}`}
                    >
                      {String(num).padStart(2, '0')}
                    </span>
                  ))}

                  {opt.specialNumber !== undefined && (
                    <span
                      title="Cầu may mắn / Số đặc biệt dự kiến"
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-mono bg-gradient-to-br from-red-600 to-amber-500 text-white ring-2 ring-amber-300 shadow-sm"
                    >
                      {String(opt.specialNumber).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Metrics Badges */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-[11px] text-slate-600 font-medium">
                  <div className="bg-slate-100/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between border border-slate-200/60">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Tần suất Hot:
                    </span>
                    <span className="font-mono font-bold text-slate-900">{opt.metrics.hotRatio}%</span>
                  </div>
                  <div className="bg-slate-100/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between border border-slate-200/60">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-blue-500" />
                      Điểm trễ Gap:
                    </span>
                    <span className="font-mono font-bold text-slate-900">{opt.metrics.gapScore}</span>
                  </div>
                  <div className="bg-slate-100/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between border border-slate-200/60">
                    <span className="text-slate-500 flex items-center gap-1">
                      <PieChart className="w-3.5 h-3.5 text-purple-500" />
                      Chẵn / Lẻ:
                    </span>
                    <span className="font-mono font-bold text-slate-900">{opt.metrics.oddEvenRatio}</span>
                  </div>
                  <div className="bg-slate-100/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between border border-slate-200/60">
                    <span className="text-slate-500 flex items-center gap-1">
                      <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
                      Tổng điểm:
                    </span>
                    <span className="font-mono font-bold text-slate-900">{opt.metrics.sumValue}</span>
                  </div>
                </div>

                {/* Algorithm Selection Reasons */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Lý do chọn thuật toán:
                  </p>
                  {opt.reasons.map((r, rIdx) => (
                    <p key={rIdx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{r}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Copy Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleCopyNumbers(opt.id, opt.numbers, opt.specialNumber)}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow transition-all"
                  title="Sao chép bộ số này"
                >
                  {copiedOptionId === opt.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao chép Lựa chọn {opt.id}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accuracy & Backtesting Model Self-Improvement Analytics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Kiểm Chứng Học Máy & Tiến Trình Hoàn Thiện Phép Toán
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-slate-500 font-medium">Số kỳ kiểm thử Backtest gần nhất</p>
            <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {prediction.backtestAccuracy.testedDrawsCount} kỳ quay
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-slate-500 font-medium">Số điểm trúng trung bình / kỳ</p>
            <p className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
              {prediction.backtestAccuracy.avgHitsPerDraw} / {GAME_CONFIGS[selectedGame].pickCount} số
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-slate-500 font-medium">Xu hướng độ chính xác tự học</p>
            <div className="flex items-center gap-1.5 mt-1">
              {prediction.backtestAccuracy.accuracyTrend.map((score, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[11px]"
                >
                  {score}%
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Backtest Algorithm Options vs Last Draw */}
        {backtestResult.actualResult && (
          <div className="bg-slate-900 rounded-xl p-5 text-white shadow-inner">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold">
                Kiểm thử 3 Thuật Toán Tối Ưu vs Thực tế Kỳ {backtestResult.predictedTargetPeriod}
              </h3>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Hệ thống đã sử dụng dữ liệu lịch sử (bỏ qua kỳ quay mới nhất) để giả lập sinh ra 3 phương án dự đoán cho kỳ {backtestResult.predictedTargetPeriod}, sau đó đối chiếu trực tiếp với kết quả thực tế.
            </p>

            <div className="mb-6">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Kết quả thực tế kỳ {backtestResult.predictedTargetPeriod}:</p>
              <div className="flex flex-wrap items-center gap-2">
                {backtestResult.actualResult.numbers.map((n) => (
                  <span
                    key={`act-${n}`}
                    className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm bg-red-500 text-white ring-2 ring-red-300/50 shadow-lg"
                  >
                    {String(n).padStart(2, '0')}
                  </span>
                ))}
                {backtestResult.actualResult.specialNumber !== undefined && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mx-1"></span>
                    <span className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm bg-amber-500 text-white ring-2 ring-amber-300/50 shadow-lg" title="Số đặc biệt">
                      {String(backtestResult.actualResult.specialNumber).padStart(2, '0')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {backtestResult.predictions.map((pred, i) => (
                <div key={i} className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-2">{pred.name}</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {pred.numbers.map(n => {
                        const isHit = backtestResult.actualResult?.numbers.includes(n);
                        return (
                          <span
                            key={`pred-${i}-${n}`}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                              isHit ? 'bg-emerald-500 text-white ring-2 ring-emerald-300' : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {String(n).padStart(2, '0')}
                          </span>
                        )
                      })}
                      {pred.specialNumber !== undefined && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mx-1"></span>
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                              pred.specialHit ? 'bg-amber-500 text-white ring-2 ring-amber-300' : 'bg-slate-700 border border-amber-600/50 text-amber-500/70'
                            }`}
                            title="Số đặc biệt"
                          >
                            {String(pred.specialNumber).padStart(2, '0')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-sm font-bold bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg border border-emerald-500/30">
                      Trúng {pred.hits} / {GAME_CONFIGS[selectedGame].pickCount} {pred.specialNumber !== undefined && pred.specialHit ? '+ Đặc biệt' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};
