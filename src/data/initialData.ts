import { VietlottDrawResult } from '../types';

export const INITIAL_VIETLOTT_RESULTS: VietlottDrawResult[] = [
  // Mega 6/45
  {
    id: 'mega-1547',
    game: 'mega645',
    period: '#01547',
    drawDate: '2026-08-09',
    numbers: [3, 17, 20, 27, 31, 35],
    additionalData: {
      jackpotAmount: 38500000000,
      jackpotWinners: 1,
    },
    source: 'github_vietlott_data',
    createdAt: '2026-08-10T00:01:46.281551',
  },
  {
    id: 'mega-1546',
    game: 'mega645',
    period: '#01546',
    drawDate: '2026-08-07',
    numbers: [2, 8, 19, 30, 36, 43],
    additionalData: {
      jackpotAmount: 32100000000,
      jackpotWinners: 0,
    },
    source: 'github_vietlott_data',
    createdAt: '2026-08-08T00:01:41.590619',
  },
  {
    id: 'mega-1545',
    game: 'mega645',
    period: '#01545',
    drawDate: '2026-08-05',
    numbers: [2, 6, 11, 16, 28, 39],
    additionalData: {
      jackpotAmount: 24800000000,
      jackpotWinners: 0,
    },
    source: 'github_vietlott_data',
    createdAt: '2026-08-06T00:02:52.016423',
  },
  {
    id: 'mega-1544',
    game: 'mega645',
    period: '#01544',
    drawDate: '2026-08-02',
    numbers: [3, 12, 20, 25, 27, 37],
    additionalData: {
      jackpotAmount: 18200000000,
      jackpotWinners: 0,
    },
    source: 'github_vietlott_data',
    createdAt: '2026-08-03T00:01:54.805201',
  },

  // Power 6/55
  {
    id: 'power-1382',
    game: 'power655',
    period: '#01382',
    drawDate: '2026-08-08',
    numbers: [5, 29, 33, 38, 40, 45],
    specialNumber: 37,
    additionalData: {
      jackpot1Amount: 125000000000,
      jackpot2Amount: 6800000000,
      jackpot1Winners: 0,
      jackpot2Winners: 1,
    },
    source: 'github_vietlott_data',
    createdAt: '2026-08-09T00:01:07.514841',
  },
  {
    id: 'power-1381',
    game: 'power655',
    period: '#01381',
    drawDate: '2026-08-06',
    numbers: [14, 18, 23, 35, 51, 55],
    specialNumber: 1,
    additionalData: {
      jackpot1Amount: 118000000000,
      jackpot2Amount: 4200000000,
      jackpot1Winners: 0,
      jackpot2Winners: 0,
    },
    source: 'github_vietlott_data',
    createdAt: '2026-08-07T00:01:13.032397',
  },
  {
    id: 'power-1380',
    game: 'power655',
    period: '#01380',
    drawDate: '2026-08-04',
    numbers: [14, 39, 40, 42, 47, 54],
    specialNumber: 31,
    additionalData: {
      jackpot1Amount: 109000000000,
      jackpot2Amount: 3800000000,
      jackpot1Winners: 0,
      jackpot2Winners: 0,
    },
    source: 'github_vietlott_data',
    createdAt: '2026-08-06T00:02:27.504833',
  },
];
