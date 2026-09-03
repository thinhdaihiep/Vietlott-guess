import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { VietlottDrawResult, VietlottGame, GameStats, CollectorLog } from './src/types.js';
import { INITIAL_VIETLOTT_RESULTS } from './src/data/initialData.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// File storage path for persistent local data
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'vietlott_results.json');
const LOGS_FILE = path.join(DATA_DIR, 'collector_logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize results
function loadResults(): VietlottDrawResult[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading data file:', err);
  }
  // Fallback to initial seed
  saveResults(INITIAL_VIETLOTT_RESULTS);
  return INITIAL_VIETLOTT_RESULTS;
}

function saveResults(results: VietlottDrawResult[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(results, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data file:', err);
  }
}

// Load or initialize logs
function loadLogs(): CollectorLog[] {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      const content = fs.readFileSync(LOGS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading logs file:', err);
  }
  return [
    {
      id: 'log-init',
      timestamp: new Date().toISOString(),
      game: 'mega645',
      status: 'info',
      message: 'Khởi tạo hệ thống thu thập dữ liệu Vietlott',
      itemsAdded: INITIAL_VIETLOTT_RESULTS.length,
    },
  ];
}

function saveLogs(logs: CollectorLog[]) {
  try {
    // Keep max 100 recent logs
    const trimmed = logs.slice(0, 100);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving logs file:', err);
  }
}

let currentResults = loadResults().filter((r) => r.game === 'mega645' || r.game === 'power655');
saveResults(currentResults);
let currentLogs = loadLogs();

function addLog(game: VietlottGame, status: 'success' | 'error' | 'info', message: string, itemsAdded: number = 0) {
  const newLog: CollectorLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    game,
    status,
    message,
    itemsAdded,
  };
  currentLogs.unshift(newLog);
  saveLogs(currentLogs);
}

// Auto sync real data from github.com/vietvudanh/vietlott-data repository
async function syncGitHubVietlottData(): Promise<{ added: number; updated: number; total: number }> {
  let addedCount = 0;
  let updatedCount = 0;

  try {
    const megaUrl = 'https://raw.githubusercontent.com/vietvudanh/vietlott-data/main/data/power645.jsonl';
    const powerUrl = 'https://raw.githubusercontent.com/vietvudanh/vietlott-data/main/data/power655.jsonl';

    const [megaText, powerText] = await Promise.all([
      fetch(megaUrl).then((r) => (r.ok ? r.text() : '')).catch(() => ''),
      fetch(powerUrl).then((r) => (r.ok ? r.text() : '')).catch(() => ''),
    ]);

    const resultMap = new Map<string, VietlottDrawResult>();
    currentResults.forEach((r) => {
      resultMap.set(`${r.game}:${r.period}`, r);
    });

    if (megaText) {
      const lines = megaText.trim().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          const period = `#${item.id}`;
          const key = `mega645:${period}`;
          const numbers = Array.isArray(item.result) ? item.result.slice(0, 6) : [];

          const record: VietlottDrawResult = {
            id: `mega-${parseInt(item.id, 10)}`,
            game: 'mega645',
            period,
            drawDate: item.date,
            numbers,
            source: 'github_vietlott_data',
            createdAt: item.process_time || `${item.date}T18:30:00Z`,
          };

          const existing = resultMap.get(key);
          if (!existing) {
            resultMap.set(key, record);
            addedCount++;
          } else if (
            existing.source !== 'github_vietlott_data' ||
            JSON.stringify(existing.numbers) !== JSON.stringify(numbers)
          ) {
            resultMap.set(key, { ...existing, ...record });
            updatedCount++;
          }
        } catch (e) {}
      }
    }

    if (powerText) {
      const lines = powerText.trim().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          const period = `#${item.id}`;
          const key = `power655:${period}`;
          const numbers = Array.isArray(item.result) ? item.result.slice(0, 6) : [];
          const specialNumber = Array.isArray(item.result) && item.result.length >= 7 ? item.result[6] : undefined;

          const record: VietlottDrawResult = {
            id: `power-${parseInt(item.id, 10)}`,
            game: 'power655',
            period,
            drawDate: item.date,
            numbers,
            specialNumber,
            source: 'github_vietlott_data',
            createdAt: item.process_time || `${item.date}T18:30:00Z`,
          };

          const existing = resultMap.get(key);
          if (!existing) {
            resultMap.set(key, record);
            addedCount++;
          } else if (
            existing.source !== 'github_vietlott_data' ||
            JSON.stringify(existing.numbers) !== JSON.stringify(numbers) ||
            existing.specialNumber !== specialNumber
          ) {
            resultMap.set(key, { ...existing, ...record });
            updatedCount++;
          }
        } catch (e) {}
      }
    }

    currentResults = Array.from(resultMap.values());
    currentResults.sort((a, b) => {
      if (b.drawDate !== a.drawDate) {
        return b.drawDate.localeCompare(a.drawDate);
      }
      return b.period.localeCompare(a.period);
    });

    saveResults(currentResults);

    if (addedCount > 0 || updatedCount > 0) {
      addLog(
        'mega645',
        'success',
        `Đã đồng bộ dữ liệu thực tế từ vietvudanh/vietlott-data (+${addedCount} mới, ${updatedCount} cập nhật)`,
        addedCount
      );
    }
  } catch (err: any) {
    console.error('Error syncing github vietlott data:', err);
    addLog('mega645', 'error', `Lỗi khi đồng bộ GitHub Vietlott Data: ${err.message}`, 0);
  }

  return { added: addedCount, updated: updatedCount, total: currentResults.length };
}

// Perform initial sync on server launch
syncGitHubVietlottData();

// API Routes
app.get('/api/vietlott/results', async (req, res) => {
  await syncGitHubVietlottData();

  const game = req.query.game as VietlottGame | undefined;
  const search = (req.query.search as string || '').toLowerCase();
  
  let filtered = currentResults;
  if (game) {
    filtered = filtered.filter((r) => r.game === game);
  }
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.period.toLowerCase().includes(search) ||
        r.drawDate.includes(search) ||
        r.numbers.join(' ').includes(search)
    );
  }

  // Sort by drawDate descending, period descending
  filtered.sort((a, b) => {
    if (b.drawDate !== a.drawDate) {
      return b.drawDate.localeCompare(a.drawDate);
    }
    return b.period.localeCompare(a.period);
  });

  res.json({
    success: true,
    total: filtered.length,
    data: filtered,
  });
});

app.post('/api/vietlott/manual', (req, res) => {
  const { game, period, drawDate, numbers, specialNumber, additionalData } = req.body;

  if (!game || !period || !drawDate || !Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin bắt buộc (game, period, drawDate, numbers)' });
  }

  const existingIndex = currentResults.findIndex((r) => r.game === game && r.period === period);
  const newRecord: VietlottDrawResult = {
    id: existingIndex >= 0 ? currentResults[existingIndex].id : `${game}-${Date.now()}`,
    game,
    period: period.startsWith('#') ? period : `#${period}`,
    drawDate,
    numbers: numbers.map(Number),
    specialNumber: specialNumber ? Number(specialNumber) : undefined,
    additionalData,
    source: 'manual',
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    currentResults[existingIndex] = newRecord;
  } else {
    currentResults.unshift(newRecord);
  }

  saveResults(currentResults);
  addLog(game, 'success', `Đã thêm/cập nhật kỳ quay ${newRecord.period} (${game}) thủ công`, 1);

  res.json({ success: true, data: newRecord });
});

app.delete('/api/vietlott/results/:id', (req, res) => {
  const { id } = req.params;
  const target = currentResults.find((r) => r.id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: 'Không tìm thấy bản ghi' });
  }

  currentResults = currentResults.filter((r) => r.id !== id);
  saveResults(currentResults);
  addLog(target.game, 'info', `Đã xóa bản ghi kỳ quay ${target.period}`, 0);

  res.json({ success: true, message: 'Đã xóa bản ghi thành công' });
});

// Auto-collector YTD (Sync full dataset from vietvudanh/vietlott-data)
app.post('/api/vietlott/collect-ytd', async (req, res) => {
  const result = await syncGitHubVietlottData();
  res.json({
    success: true,
    message: `Đã thu thập & đồng bộ toàn bộ dữ liệu lịch sử từ kho vietvudanh/vietlott-data (${result.total} kỳ quay)`,
    totalItemsAdded: result.added,
    currentTotal: result.total,
  });
});

// Auto-collector trigger (Sync latest draws from vietvudanh/vietlott-data)
app.post('/api/vietlott/collect', async (req, res) => {
  const result = await syncGitHubVietlottData();
  res.json({
    success: true,
    message: `Đã thu thập & đồng bộ thành công kết quả mới nhất từ vietvudanh/vietlott-data (${result.total} kỳ quay)`,
    itemsAdded: result.added,
    total: result.total,
  });
});

// Statistics
app.get('/api/vietlott/stats', (req, res) => {
  const game = (req.query.game as VietlottGame) || 'mega645';
  const gameResults = currentResults.filter((r) => r.game === game);

  const freqMap: Record<number, number> = {};
  let oddCount = 0;
  let evenCount = 0;

  gameResults.forEach((r) => {
    r.numbers.forEach((num) => {
      freqMap[num] = (freqMap[num] || 0) + 1;
      if (num % 2 === 0) {
        evenCount++;
      } else {
        oddCount++;
      }
    });
    if (r.specialNumber !== undefined) {
      freqMap[r.specialNumber] = (freqMap[r.specialNumber] || 0) + 1;
      if (r.specialNumber % 2 === 0) evenCount++;
      else oddCount++;
    }
  });

  const sortedFreq = Object.entries(freqMap)
    .map(([numStr, count]) => ({ number: parseInt(numStr, 10), count }))
    .sort((a, b) => b.count - a.count);

  const hotNumbers = sortedFreq.slice(0, 6);
  const coldNumbers = [...sortedFreq].reverse().slice(0, 6);

  const stats: GameStats = {
    game,
    totalDraws: gameResults.length,
    numberFrequency: freqMap,
    hotNumbers,
    coldNumbers,
    oddCount,
    evenCount,
    latestDraw: gameResults.length > 0 ? gameResults[0] : null,
  };

  res.json({ success: true, data: stats });
});

// Logs
app.get('/api/vietlott/logs', (req, res) => {
  res.json({ success: true, data: currentLogs });
});

// Import dataset
app.post('/api/vietlott/import', (req, res) => {
  const { items } = req.body as { items: VietlottDrawResult[] };
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Dữ liệu nhập vào không hợp lệ' });
  }

  let count = 0;
  items.forEach((item) => {
    if (item.game && item.period && item.drawDate && Array.isArray(item.numbers)) {
      const exists = currentResults.some((r) => r.game === item.game && r.period === item.period);
      if (!exists) {
        currentResults.push({
          ...item,
          id: item.id || `${item.game}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          source: 'imported',
          createdAt: item.createdAt || new Date().toISOString(),
        });
        count++;
      }
    }
  });

  saveResults(currentResults);
  addLog('mega645', 'success', `Đã nhập thành công ${count} bản ghi dữ liệu`, count);

  res.json({ success: true, importedCount: count, total: currentResults.length });
});

// Export dataset
app.get('/api/vietlott/export', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="vietlott_collected_results.json"');
  res.send(JSON.stringify(currentResults, null, 2));
});

// Reset dataset
app.post('/api/vietlott/reset', (req, res) => {
  currentResults = [...INITIAL_VIETLOTT_RESULTS];
  saveResults(currentResults);
  addLog('mega645', 'info', 'Đã khôi phục dữ liệu thu thập về trạng thái ban đầu', INITIAL_VIETLOTT_RESULTS.length);
  res.json({ success: true, total: currentResults.length });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Vietlott Collector running on http://localhost:${PORT}`);
  });
}

startServer();
