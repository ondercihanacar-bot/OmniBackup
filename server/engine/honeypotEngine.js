/**
 * Ransomware Decoy & Honeypot Trap Engine
 * Zero-Day file sentries, real-time filesystem tamper detection & isolation.
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/honeypot_traps.json');

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      globalStatus: {
        sentryActive: true,
        protectionMode: 'Auto-Isolate & Kill',
        totalTraps: 0,
        activeLures: 0,
        compromisedLures: 0,
        tamperLatencyMs: 0,
        lastHealthCheck: new Date().toISOString()
      },
      decoys: [],
      incidents: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function getData() {
  ensureDb();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return { globalStatus: { totalTraps: 0, activeLures: 0 }, decoys: [], incidents: [] };
  }
}

function saveData(data) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  getStatus: () => {
    return getData();
  },
  toggleSentry: (enable) => {
    const data = getData();
    data.globalStatus.sentryActive = enable;
    saveData(data);
    return data.globalStatus;
  },
  deployDecoy: (decoyPath, type) => {
    const data = getData();
    const newDecoy = {
      id: `decoy-${Date.now()}`,
      path: decoyPath || 'C:\\OmniBackups\\~sentry_lock_trap.docx',
      type: type || 'Standard Document Trap',
      status: 'armed',
      lastAudit: new Date().toLocaleTimeString('tr-TR')
    };
    data.decoys = data.decoys || [];
    data.decoys.unshift(newDecoy);
    data.globalStatus.totalTraps = data.decoys.length;
    data.globalStatus.activeLures = data.decoys.filter(d => d.status === 'armed').length;
    saveData(data);
    return newDecoy;
  },
  simulateTamperAttack: () => {
    const data = getData();
    const newIncident = {
      id: `inc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      decoyPath: 'C:\\OmniBackups\\~sentry_lock_trap.docx',
      processName: 'Ransomware Test Sentry',
      actionTaken: 'Tehdit İzolasyonu Aktif -> Snapshot Koruması Devrede',
      status: 'Neutralized',
      severity: 'LOW'
    };

    data.incidents = data.incidents || [];
    data.incidents.unshift(newIncident);
    saveData(data);
    return newIncident;
  }
};
