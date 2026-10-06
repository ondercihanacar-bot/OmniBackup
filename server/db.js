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
  }

  read() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.init();
      }
      return fs.readJsonSync(DB_FILE);
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
