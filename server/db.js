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
  jobs: [
    {
      id: "job-sql-prod",
      name: "MSSQL - ERP & Muhasebe Veritabanı Yedeği",
      type: "sql",
      sqlType: "mssql",
      serverAddress: "127.0.0.1",
      instanceName: "MSSQLSERVER",
      authType: "windows", // 'windows' or 'sql'
      username: "sa",
      password: "",
      databaseName: "ERP_PROD_DB",
      backupType: "full", // full, diff, log
      sourcePath: "",
      destinationId: "dest-local",
      schedule: "0 23 * * *", // Every night at 23:00
      scheduleHuman: "Her gün 23:00'da",
      retentionDays: 14,
      compress: true,
      encrypt: false,
      useVss: false,
      status: "idle", // idle, running, success, failed
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      lastStatus: "success",
      lastSize: "1.42 GB",
      lastDuration: "34 sn",
      enabled: true,
      agentId: "agent-srv-01"
    },
    {
      id: "job-user-docs",
      name: "Muhasebe & Finans Ortak Klasör Yedeği",
      type: "files",
      sourcePath: "C:\\SirketBelgeleri\\Muhasebe",
      destinationId: "dest-nas",
      schedule: "0 22 * * *",
      scheduleHuman: "Her gün 22:00'da",
      retentionDays: 30,
      compress: true,
      encrypt: true,
      useVss: true,
      status: "idle",
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
      lastStatus: "success",
      lastSize: "4.85 GB",
      lastDuration: "2 dk 15 sn",
      enabled: true,
      agentId: "agent-srv-01"
    },
    {
      id: "job-ceo-laptop",
      name: "Yönetim PC - Masaüstü & Belgeler",
      type: "files",
      sourcePath: "C:\\Users\\Yonetim\\Documents",
      destinationId: "dest-local",
      schedule: "0 18 * * 1-5",
      scheduleHuman: "Hafta içi her gün 18:00'da",
      retentionDays: 7,
      compress: true,
      encrypt: false,
      useVss: true,
      status: "idle",
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
      lastStatus: "success",
      lastSize: "840 MB",
      lastDuration: "42 sn",
      enabled: true,
      agentId: "agent-pc-02"
    }
  ],
  agents: [
    {
      id: "agent-srv-01",
      hostname: "SRV-APP-DB-01",
      ipAddress: "192.168.1.10",
      os: "Windows Server 2022 Datacenter",
      version: "v1.4.0",
      status: "online", // online, offline, busy
      lastSeen: new Date().toISOString(),
      cpuUsage: "12%",
      ramUsage: "6.4 GB / 32 GB",
      diskFree: "420 GB / 1 TB",
      role: "Database & File Server",
      tags: ["Sunucu", "MSSQL", "VSS Active"]
    },
    {
      id: "agent-pc-02",
      hostname: "PC-YONETIM-01",
      ipAddress: "192.168.1.55",
      os: "Windows 11 Pro 64-bit",
      version: "v1.4.0",
      status: "online",
      lastSeen: new Date().toISOString(),
      cpuUsage: "4%",
      ramUsage: "5.1 GB / 16 GB",
      diskFree: "185 GB / 512 GB",
      role: "Client PC (Yönetim)",
      tags: ["İstemci", "VSS Active"]
    },
    {
      id: "agent-pc-03",
      hostname: "PC-MUHASEBE-03",
      ipAddress: "192.168.1.82",
      os: "Windows 10 Pro 64-bit",
      version: "v1.3.8",
      status: "online",
      lastSeen: new Date().toISOString(),
      cpuUsage: "9%",
      ramUsage: "4.8 GB / 16 GB",
      diskFree: "92 GB / 256 GB",
      role: "Client PC (Muhasebe)",
      tags: ["İstemci", "Outlook PST"]
    }
  ],
  destinations: [
    {
      id: "dest-local",
      name: "Yerel Yedekleme Diski (D:\\Backups)",
      type: "local",
      path: "D:\\OmniBackups",
      isDefault: true,
      totalSpace: "2000 GB",
      usedSpace: "420 GB",
      freeSpace: "1580 GB",
      status: "active"
    },
    {
      id: "dest-nas",
      name: "Synology NAS Ağ Paylaşımı (SMB)",
      type: "smb",
      path: "\\\\192.168.1.250\\BackupVault\\OmniBackup",
      username: "backup_admin",
      isDefault: false,
      totalSpace: "8000 GB",
      usedSpace: "2450 GB",
      freeSpace: "5550 GB",
      status: "active"
    },
    {
      id: "dest-s3",
      name: "Amazon S3 / MinIO Cloud Bucket",
      type: "s3",
      path: "s3://corp-backup-vault-2026/production",
      endpoint: "https://s3.eu-central-1.amazonaws.com",
      bucket: "corp-backup-vault-2026",
      isDefault: false,
      status: "ready"
    }
  ],
  history: [
    {
      id: "hist-001",
      jobId: "job-sql-prod",
      jobName: "MSSQL - ERP & Muhasebe Veritabanı Yedeği",
      agentName: "SRV-APP-DB-01",
      type: "sql",
      status: "success",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 14 + 34000).toISOString(),
      duration: "34 sn",
      size: "1.42 GB",
      fileName: "MSSQL_ERP_PROD_DB_FULL_20261002_090000.bak.zip",
      destination: "Yerel Yedekleme Diski (D:\\Backups)",
      targetFilePath: "D:\\OmniBackups\\MSSQL_ERP_PROD_DB_FULL_20261002_090000.bak.zip",
      encrypted: false,
      compressed: true,
      vssUsed: false,
      logMessage: "MSSQL Full backup başarıyla tamamlandı. 1.42 GB arşiv oluşturuldu."
    },
    {
      id: "hist-002",
      jobId: "job-user-docs",
      jobName: "Muhasebe & Finans Ortak Klasör Yedeği",
      agentName: "SRV-APP-DB-01",
      type: "files",
      status: "success",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 15 + 135000).toISOString(),
      duration: "2 dk 15 sn",
      size: "4.85 GB",
      fileName: "Muhasebe_Files_20261002_080000.enc.zip",
      destination: "Synology NAS Ağ Paylaşımı (SMB)",
      targetFilePath: "\\\\192.168.1.250\\BackupVault\\OmniBackup\\Muhasebe_Files_20261002_080000.enc.zip",
      encrypted: true,
      compressed: true,
      vssUsed: true,
      logMessage: "VSS Gölge Kopyası (Shadow Copy) alındı. 8,420 dosya AES-256 ile şifrelenerek yedeklendi."
    },
    {
      id: "hist-003",
      jobId: "job-ceo-laptop",
      jobName: "Yönetim PC - Masaüstü & Belgeler",
      agentName: "PC-YONETIM-01",
      type: "files",
      status: "success",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 19 + 42000).toISOString(),
      duration: "42 sn",
      size: "840 MB",
      fileName: "Yonetim_PC_Docs_20261002_040000.zip",
      destination: "Yerel Yedekleme Diski (D:\\Backups)",
      targetFilePath: "D:\\OmniBackups\\Yonetim_PC_Docs_20261002_040000.zip",
      encrypted: false,
      compressed: true,
      vssUsed: true,
      logMessage: "Açık Outlook .pst ve Excel dosyaları VSS ile kilitlenmeden yedeklendi."
    }
  ],
  logs: [
    {
      id: "log-1",
      timestamp: new Date().toISOString(),
      level: "info",
      source: "Engine",
      message: "OmniBackup Master Engine başlatıldı. Zamanlayıcı aktif (3 aktif görev)."
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      level: "success",
      source: "Agent-Server",
      message: "Ajan 'SRV-APP-DB-01' (192.168.1.10) periyodik durum bildirimini gönderdi. Durum: Normal."
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      level: "info",
      source: "Storage",
      message: "Depolama alanı '\\\\192.168.1.250\\BackupVault' erişim kontrolü yapıldı: OK (5.55 TB boş)."
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
