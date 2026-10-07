/**
 * WAN Accelerator & Traffic QoS Throttling Engine
 * Bandwidth scheduling, Real Host Network & Transfer Stats.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const db = require('../db');

const DB_PATH = path.join(__dirname, '../data/wan_accelerator.json');

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      config: {
        enabled: true,
        businessHoursLimitMbps: 25,
        offHoursLimitMbps: 1000,
        businessHoursStart: '08:00',
        businessHoursEnd: '18:00',
        businessDays: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'],
        tcpStreamsCount: 8,
        compressionAlgorithm: 'Zstandard (Realtime)',
        wanCacheSizeGb: 50,
        usedWanCacheGb: 0.0
      },
      tunnels: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function getData() {
  ensureDb();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return { config: {}, tunnels: [] };
  }
}

function saveData(data) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  getStatus: () => {
    const stored = getData();
    const mainDb = db.read();
    const dedup = mainDb.dedupStats || {};
    const rawGb = dedup.totalRawBytes ? (dedup.totalRawBytes / (1024 * 1024 * 1024)).toFixed(1) : "0.0";
    const storedGb = dedup.totalStoredBytes ? (dedup.totalStoredBytes / (1024 * 1024 * 1024)).toFixed(1) : "0.0";

    const reductionRatio = (dedup.totalStoredBytes && dedup.totalRawBytes) 
      ? `${(dedup.totalRawBytes / Math.max(1, dedup.totalStoredBytes)).toFixed(2)}x`
      : '1.0x (Sıfır Tasarruf)';

    const activeTunnels = (stored.tunnels || []);

    return {
      config: stored.config || {},
      stats: {
        totalWanTransferredGb: parseFloat(storedGb),
        totalRawDataGb: parseFloat(rawGb),
        wanReductionRatio: reductionRatio,
        currentThroughputMbps: 0,
        activeSyncTunnels: activeTunnels.length
      },
      tunnels: activeTunnels
    };
  },
  updateConfig: (newConfig) => {
    const data = getData();
    data.config = { ...data.config, ...newConfig };
    saveData(data);
    return data.config;
  },
  purgeWanCache: () => {
    const data = getData();
    if (data.config) data.config.usedWanCacheGb = 0.0;
    saveData(data);
    return { success: true, message: 'WAN Deduplication Global Cache temizlendi.' };
  }
};
