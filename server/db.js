const fs = require('fs-extra');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'omnibackup.json');

fs.ensureDirSync(DATA_DIR);

const initialData = {
  settings: {
    serverName: "OmniBackup Central Master",
    serverPort: 3060,
    encryptionEnabled: false,
    defaultEncryptionKey: "",
    defaultStoragePath: "C:\\OmniBackups",
    retentionDaysDefault: 30,
    compressionLevel: "high", // none, fast, high
    notifications: {
      telegram: { enabled: false, botToken: "", chatId: "" },
      discord: { enabled: false, webhookUrl: "" },
      email: { enabled: false, smtpHost: "", smtpPort: 587, smtpUser: "", smtpPass: "", toEmail: "" },
      notifyOnSuccess: true,
      notifyOnError: true
    }
  },
  jobs: [],
  agents: [],
  destinations: [
    {
      id: "dest-local",
      name: "Yerel Yedekleme Alanı",
      type: "local",
      path: "C:\\OmniBackups",
      isDefault: true,
      status: "active"
    }
  ],
  history: [],
  logs: [
    {
      id: "log-1",
      timestamp: new Date().toISOString(),
      level: "info",
      source: "Engine",
      message: "OmniBackup Enterprise Cyber Vault sistemi başarıyla kuruldu ve başlatıldı."
    }
  ]
};

class DB {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeJsonSync(DB_FILE, initialData, { spaces: 2 });
    }
    this.sanitizeDataFiles();
  }

  sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;
    let modified = false;

    // 1. Sanitize Agents (Remove fake demo host fixtures)
    if (Array.isArray(data.agents)) {
      const originalLen = data.agents.length;
      data.agents = data.agents.filter(a => {
        const h = (a.hostname || a.name || '').toUpperCase();
        const ip = (a.ip || '');
        const isMock = h.includes('SRV-APP-DB-01') || 
                       h.includes('PC-YONETIM-01') || 
                       h.includes('PC-MUHASEBE-03') ||
                       ip === '192.168.1.10' ||
                       ip === '192.168.1.55' ||
                       ip === '192.168.1.82';
        return !isMock;
      });
      if (data.agents.length !== originalLen) modified = true;
    }

    // 2. Sanitize Jobs (Remove hardcoded demo plans)
    if (Array.isArray(data.jobs)) {
      const originalLen = data.jobs.length;
      data.jobs = data.jobs.filter(j => {
        const name = (j.name || '');
        const id = (j.id || '');
        const isMock = /ERP & Muhasebe|Finans Ortak Klasör|Yönetim PC - Masaüstü|Yeni Koruma Planı \(1\)/i.test(name) ||
                       /^job-(1|2|3|4)$/.test(id);
        return !isMock;
      });
      if (data.jobs.length !== originalLen) modified = true;
    }

    // 3. Sanitize Destinations (Remove fake NAS / S3 buckets)
    if (Array.isArray(data.destinations)) {
      const originalLen = data.destinations.length;
      data.destinations = data.destinations.filter(d => {
        const name = (d.name || '');
        const pathStr = (d.path || '');
        const id = (d.id || '');
        const isMock = /Synology NAS|corp-backup-vault|s3:\/\/corp/i.test(name) ||
                       /Synology NAS|corp-backup-vault|s3:\/\/corp/i.test(pathStr) ||
                       id === 'dest-nas' || id === 'dest-s3';
        return !isMock;
      });
      if (data.destinations.length !== originalLen) modified = true;
      if (data.destinations.length === 0) {
        data.destinations = [
          {
            id: "dest-local",
            name: "Yerel Yedekleme Alanı",
            type: "local",
            path: "C:\\OmniBackups",
            isDefault: true,
            status: "active"
          }
        ];
        modified = true;
      }
    }

    // 4. Sanitize History (Remove demo history items)
    if (Array.isArray(data.history)) {
      const originalLen = data.history.length;
      data.history = data.history.filter(h => {
        const name = (h.jobName || '');
        const id = (h.jobId || h.id || '');
        const dest = (h.destination || '');
        const isMock = /ERP & Muhasebe|Finans Ortak Klasör|Yönetim PC|Yeni Koruma Planı/i.test(name) ||
                       /^job-(1|2|3|4)$/.test(id) ||
                       /Synology|corp-backup/i.test(dest);
        return !isMock;
      });
      if (data.history.length !== originalLen) modified = true;
    }

    // 5. Sanitize SaaS Tenants
    if (Array.isArray(data.saasTenants)) {
      const originalLen = data.saasTenants.length;
      data.saasTenants = data.saasTenants.filter(t => {
        const name = (t.name || '');
        const domain = (t.domain || '');
        return !/sirketiniz\.com|holding\.com\.tr|Kurumsal M365|Google Workspace/i.test(name) &&
               !/sirketiniz\.com|holding\.com\.tr/i.test(domain);
      });
      if (data.saasTenants.length !== originalLen) modified = true;
    }

    // 6. Sanitize VM Conversions
    if (Array.isArray(data.vmConversions)) {
      const originalLen = data.vmConversions.length;
      data.vmConversions = data.vmConversions.filter(v => {
        const src = (v.sourceVm || v.sourcePath || '');
        return !/SRV-MSSQL-PROD|SRV-APP-LINUX/i.test(src);
      });
      if (data.vmConversions.length !== originalLen) modified = true;
    }

    // 7. Sanitize MSP Tenants
    if (Array.isArray(data.mspTenants)) {
      const originalLen = data.mspTenants.length;
      data.mspTenants = data.mspTenants.filter(m => {
        const name = (m.name || '');
        return !/Anadolu Lojistik|Marmara Sağlık|Ege Resort/i.test(name);
      });
      if (data.mspTenants.length !== originalLen) modified = true;
    }

    // 8. Sanitize Key Vault
    if (Array.isArray(data.vaultKeys)) {
      const originalLen = data.vaultKeys.length;
      data.vaultKeys = data.vaultKeys.filter(k => {
        const name = (k.name || '');
        return !/MSSQL-PROD-ENCRYPT|MUHASEBE-DR-ENCRYPT|WORM-COMPLIANCE-VAULT/i.test(name);
      });
      if (data.vaultKeys.length !== originalLen) modified = true;
    }

    // 9. Sanitize 4-Eyes Requests
    if (Array.isArray(data.fourEyesRequests)) {
      const originalLen = data.fourEyesRequests.length;
      data.fourEyesRequests = data.fourEyesRequests.filter(r => {
        const act = (r.action || r.details || '');
        return !/MSSQL_PROD_DB_FULL|WORM Kilit/i.test(act);
      });
      if (data.fourEyesRequests.length !== originalLen) modified = true;
    }

    // 10. Sanitize Active Directory Cache
    if (data.adInventory && data.adInventory.domain === 'SIRKET.LOCAL') {
      data.adInventory = null;
      modified = true;
    }

    return { data, modified };
  }

  sanitizeDataFiles() {
    try {
      // Check omnibackup.json
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readJsonSync(DB_FILE);
        const { data, modified } = this.sanitizeData(raw);
        if (modified) {
          fs.writeJsonSync(DB_FILE, data, { spaces: 2 });
        }
      }

      // Check k8s_backups.json
      const k8sFile = path.join(DATA_DIR, 'k8s_backups.json');
      if (fs.existsSync(k8sFile)) {
        const k8sData = fs.readJsonSync(k8sFile);
        if (k8sData.clusters && k8sData.clusters.some(c => c.id === 'k8s-prod-cluster-01' || c.id === 'k8s-staging-cluster')) {
          fs.writeJsonSync(k8sFile, { clusters: [], snapshots: [] }, { spaces: 2 });
        }
      }

      // Check dr_runbooks.json
      const drFile = path.join(DATA_DIR, 'dr_runbooks.json');
      if (fs.existsSync(drFile)) {
        const drData = fs.readJsonSync(drFile);
        if (drData.runbooks && drData.runbooks.some(r => r.id === 'rb-datacenter-alpha')) {
          fs.writeJsonSync(drFile, { runbooks: [], executionHistory: [] }, { spaces: 2 });
        }
      }

      // Check honeypot_traps.json
      const honeyFile = path.join(DATA_DIR, 'honeypot_traps.json');
      if (fs.existsSync(honeyFile)) {
        const hData = fs.readJsonSync(honeyFile);
        if (hData.decoys && hData.decoys.some(d => d.id === 'decoy-01' || d.name === 'SQL-FINANS-KASA.bak')) {
          fs.writeJsonSync(honeyFile, {
            globalStatus: {
              sentryActive: true,
              protectionMode: "Auto-Isolate & Kill",
              totalTraps: 0,
              activeLures: 0,
              compromisedLures: 0,
              tamperLatencyMs: 0,
              lastHealthCheck: new Date().toISOString()
            },
            decoys: [],
            incidents: []
          }, { spaces: 2 });
        }
      }

      // Check geo_redundancy.json
      const geoFile = path.join(DATA_DIR, 'geo_redundancy.json');
      if (fs.existsSync(geoFile)) {
        const geoData = fs.readJsonSync(geoFile);
        if (geoData.nodes && geoData.nodes.some(n => n.id === 'node-ist-01')) {
          fs.writeJsonSync(geoFile, { radarScore: 100, ruleCompliance: {}, auditLogs: [] }, { spaces: 2 });
        }
      }
    } catch (e) {
      console.error('Error in sanitizeDataFiles:', e);
    }
  }

  read() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.init();
      }
      const raw = fs.readJsonSync(DB_FILE);
      const { data, modified } = this.sanitizeData(raw);
      if (modified) {
        this.write(data);
      }
      return data;
    } catch (e) {
      console.error('DB Read error:', e);
      return initialData;
    }
  }

  write(data) {
    try {
      fs.writeJsonSync(DB_FILE, data, { spaces: 2 });
      return true;
    } catch (e) {
      console.error('DB Write error:', e);
      return false;
    }
  }

  get(key) {
    const data = this.read();
    return data[key];
  }

  set(key, value) {
    const data = this.read();
    data[key] = value;
    this.write(data);
    return value;
  }

  addLog(level, source, message) {
    const data = this.read();
    const newLog = {
      id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      level, // info, success, warning, error
      source,
      message
    };
    data.logs.unshift(newLog);
    if (data.logs.length > 500) {
      data.logs = data.logs.slice(0, 500);
    }
    this.write(data);
    return newLog;
  }

  addHistory(historyEntry) {
    const data = this.read();
    data.history.unshift(historyEntry);
    if (data.history.length > 1000) {
      data.history = data.history.slice(0, 1000);
    }
    this.write(data);
    return historyEntry;
  }
}

module.exports = new DB();
