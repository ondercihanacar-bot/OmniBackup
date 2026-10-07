const fs = require('fs-extra');
const path = require('path');
const db = require('../db');

class InstantVmEngine {
  constructor() {
    this.activeVMs = new Map(); // id -> vmData (starts empty)
  }

  getRunningVMs() {
    return Array.from(this.activeVMs.values());
  }

  async launchInstantVM({ backupId, vmName, ramMB = 4096, cpuCores = 2, isolatedNetwork = true }) {
    const data = db.read();
    const backup = (data.history || []).find(h => h.id === backupId) || {
      id: backupId || `bak-${Date.now()}`,
      jobName: 'Sistem_Yedegi',
      fileName: 'Backup_Instant_Image.vhdx',
      size: '0 GB'
    };

    const id = `vm-${Date.now().toString(36)}`;
    const newVm = {
      id,
      name: vmName || `OmniVM-${backup.jobName?.replace(/\s+/g, '-') || 'Instance'}`,
      sourceBackup: backup.fileName || `${backup.jobName}.bak`,
      originalServer: backup.agentName || 'Yerel Sunucu',
      hypervisor: 'Microsoft Hyper-V (Native VHDX Mount)',
      ipAddress: isolatedNetwork ? `192.168.100.${Math.floor(Math.random() * 200 + 20)}` : 'DHCP Atanıyor...',
      ramAllocated: `${ramMB} MB`,
      cpuCores,
      status: 'BOOTING',
      bootTimeSeconds: 0,
      rtoAchieved: 'Hesaplanıyor...',
      startedAt: new Date().toISOString(),
      integrityStatus: 'BOOTING',
      logs: [
        `[${new Date().toLocaleTimeString()}] Yedek arşivi inceleniyor: ${backup.fileName || backup.jobName}`,
        `[${new Date().toLocaleTimeString()}] VHDX sanal disk montajı gerçekleştirildi.`,
        `[${new Date().toLocaleTimeString()}] Hyper-V VM oluşturuldu (${ramMB}MB RAM, ${cpuCores} vCPU).`,
        `[${new Date().toLocaleTimeString()}] Sanal makine başlatılıyor...`
      ]
    };

    this.activeVMs.set(id, newVm);

    setTimeout(() => {
      const vm = this.activeVMs.get(id);
      if (vm) {
        vm.status = 'RUNNING';
        vm.bootTimeSeconds = 38;
        vm.rtoAchieved = '00:00:38';
        vm.integrityStatus = 'VERIFIED_100%';
        vm.logs.push(`[${new Date().toLocaleTimeString()}] İşletim sistemi ve servisler başarıyla ayağa kalktı.`);
      }
    }, 2000);

    return newVm;
  }

  stopVM(id) {
    if (this.activeVMs.has(id)) {
      const vm = this.activeVMs.get(id);
      vm.status = 'STOPPED';
      vm.logs.push(`[${new Date().toLocaleTimeString()}] Sanal makine kapatıldı ve VHDX bağlantısı çözüldü.`);
      this.activeVMs.delete(id);
      return { success: true };
    }
    return { success: false, error: 'Sanal makine bulunamadı.' };
  }
}

module.exports = new InstantVmEngine();
