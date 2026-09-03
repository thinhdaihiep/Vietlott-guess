export type VietlottGame = 'mega645' | 'power655';

export interface VietlottDrawResult {
  id: string;
  game: VietlottGame;
  period: string; // Kỳ quay (e.g., "#01245")
  drawDate: string; // Ngày quay (YYYY-MM-DD)
  numbers: number[]; // Bộ số trúng thưởng
  specialNumber?: number; // Số đặc biệt / cầu may mắn (cho Power 6/55)
  additionalData?: {
    jackpot1Amount?: number;
    jackpot2Amount?: number;
    jackpotAmount?: number;
    jackpot1Winners?: number;
    jackpot2Winners?: number;
    jackpotWinners?: number;
  };
  source: 'auto_collector' | 'manual' | 'imported' | 'github_vietlott_data';
  createdAt: string;
}

export interface GameStats {
  game: VietlottGame;
  totalDraws: number;
  numberFrequency: Record<number, number>;
  hotNumbers: { number: number; count: number }[];
  coldNumbers: { number: number; count: number }[];
  oddCount: number;
  evenCount: number;
  latestDraw: VietlottDrawResult | null;
}

export interface CollectorLog {
  id: string;
  timestamp: string;
  game: VietlottGame;
  status: 'success' | 'error' | 'info';
  message: string;
  itemsAdded: number;
}

export interface CollectorConfig {
  autoFetchIntervalMinutes: number; // 0 = disabled
  selectedGames: VietlottGame[];
}

export interface PredictionOption {
  id: number;
  strategyName: string;
  numbers: number[];
  specialNumber?: number;
  confidenceScore: number; // 0 - 100%
  reasons: string[];
  metrics: {
    hotRatio: number;
    gapScore: number;
    sumValue: number;
    oddEvenRatio: string;
  };
}

export interface GamePrediction {
  game: VietlottGame;
  targetPeriod: string;
  lastUpdatedDraw: string;
  totalDrawsAnalyzed: number;
  options: PredictionOption[];
  backtestAccuracy: {
    testedDrawsCount: number;
    avgHitsPerDraw: number;
    modelAdaptationProgress: number; // Percentage 0 - 100% learning rate
    accuracyTrend: number[];
  };
}

