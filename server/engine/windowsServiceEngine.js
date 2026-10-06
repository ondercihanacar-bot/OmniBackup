const { exec } = require('child_process');
const path = require('path');
const os = require('os');

class WindowsServiceEngine {
  constructor() {
    this.serviceName = 'OmniBackupCoreSvc';
    this.displayName = 'OmniBackup Enterprise Core Service';
  }

  // Query service status via sc.exe
  async getStatus() {
    return new Promise((resolve) => {
      exec(`sc.exe query ${this.serviceName}`, (err, stdout) => {
        if (err || !stdout) {
          return resolve({
            isInstalled: false,
            status: 'NOT_INSTALLED',
            statusText: 'Servis Kurulu Değil (Uygulama Modunda Çalışıyor)',
            startupType: 'Manuel',
            serviceName: this.serviceName,
            isHeadless: false,
            pid: process.pid,
            processUptime: Math.round(process.uptime()),
            hostname: os.hostname(),
            platform: os.platform()
          });
        }

        const isRunning = stdout.includes('RUNNING');
        const isStopped = stdout.includes('STOPPED');
        const isPaused = stdout.includes('PAUSED');

        resolve({
          isInstalled: true,
          status: isRunning ? 'RUNNING' : isStopped ? 'STOPPED' : isPaused ? 'PAUSED' : 'PENDING',
          statusText: isRunning ? '🟢 7/24 Arka Planda Aktif (Windows Service)' : '🟡 Servis Durduruldu',
          startupType: 'Otomatik (Automatic)',
          serviceName: this.serviceName,
          displayName: this.displayName,
          isHeadless: true,
          pid: process.pid,
          processUptime: Math.round(process.uptime()),
          hostname: os.hostname(),
          platform: os.platform()
        });
      });
    });
  }

  // Install / Register Service via sc.exe or scheduled task
  async installService() {
    const nodePath = process.execPath;
    const serverPath = path.resolve(__dirname, '../index.js');

    // Create service or register background daemon
    const cmd = `sc.exe create ${this.serviceName} binPath= "\\"${nodePath}\\" \\"${serverPath}\\"" start= auto DisplayName= "${this.displayName}"`;

    return new Promise((resolve) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          // If permission needed, return instructions
          resolve({
            success: false,
            output: stdout || stderr,
            message: 'Yönetici (Administrator) yetkisi gereklidir. Lütfen PowerShell\'i Yönetici olarak çalıştırın.'
          });
        } else {
          resolve({
            success: true,
            output: stdout,
            message: 'OmniBackup Windows Servisi başarıyla kaydedildi ve otomatik başlatmaya ayarlandı.'
          });
        }
      });
    });
  }

  // Control Service: start, stop, restart
  async controlService(action) {
    let cmd = '';
    if (action === 'start') cmd = `sc.exe start ${this.serviceName}`;
    else if (action === 'stop') cmd = `sc.exe stop ${this.serviceName}`;
    else if (action === 'restart') cmd = `sc.exe stop ${this.serviceName} && timeout /t 2 && sc.exe start ${this.serviceName}`;
    else return { success: false, error: 'Geçersiz servis eylemi.' };

    return new Promise((resolve) => {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          resolve({ success: false, error: stderr || err.message });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });
  }
}

module.exports = new WindowsServiceEngine();
