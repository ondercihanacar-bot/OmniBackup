const cron = require('node-cron');
const db = require('../db');
const backupEngine = require('./backupEngine');

class Scheduler {
  constructor() {
    this.tasks = new Map(); // jobId -> cronTask
    this.activeWatcher = null;
    this.lastTriggered = new Map(); // jobId -> timestamp
  }

  init() {
    this.reload();
    this.startActiveWatcher();
    console.log('[Scheduler] OmniBackup Cron & Active Catchup Scheduler initialized.');
  }

  // Normalize cron string like '00 22 * * *' to standard '0 22 * * *'
  normalizeCron(scheduleStr) {
    if (!scheduleStr || typeof scheduleStr !== 'string') return null;
    const parts = scheduleStr.trim().split(/\s+/);
    if (parts.length === 5) {
      return parts.map(p => {
        if (/^0\d+$/.test(p)) return parseInt(p, 10).toString();
        return p;
      }).join(' ');
    }
    return scheduleStr.trim();
  }

  reload() {
    // Stop all current running cron tasks
    for (const [jobId, task] of this.tasks.entries()) {
      try {
        task.stop();
      } catch (e) {}
    }
    this.tasks.clear();

    const jobs = db.get('jobs') || [];
    let scheduledCount = 0;
    jobs.forEach(job => {
      if (job.enabled !== false && job.schedule) {
        this.scheduleJob(job);
        scheduledCount++;
      }
    });
    console.log(`[Scheduler] ${scheduledCount} aktif yedekleme görevi zamanlayıcıya yüklendi.`);
  }

  scheduleJob(job) {
    const norm = this.normalizeCron(job.schedule);
    if (!norm || !cron.validate(norm)) {
      console.warn(`[Scheduler] Geçersiz Cron ifadesi '${job.schedule}' (Job: ${job.name})`);
      return;
    }

    try {
      const task = cron.schedule(norm, async () => {
        console.log(`[Scheduler] Cron tetiklendi: ${job.name} (${job.id})`);
        await this.triggerJob(job.id, `Zamanlanmış cron tetiklendi: '${job.name}'`);
      });

      this.tasks.set(job.id, task);
      console.log(`[Scheduler] Görev kaydedildi: '${job.name}' (${norm})`);
    } catch (err) {
      console.error(`[Scheduler] Görev zamanlama hatası (${job.id}):`, err.message);
    }
  }

  async triggerJob(jobId, logReason) {
    const lastRunTime = this.lastTriggered.get(jobId) || 0;
    // Don't re-trigger if triggered in the last 45 seconds
    if (Date.now() - lastRunTime < 45000) return;

    if (backupEngine.activeJobs && backupEngine.activeJobs.has(jobId)) {
      console.log(`[Scheduler] Görev zaten çalışıyor, atlandı: ${jobId}`);
      return;
    }

    this.lastTriggered.set(jobId, Date.now());
    db.addLog("info", "Scheduler", logReason);
    try {
      await backupEngine.runJob(jobId);
    } catch (e) {
      console.error(`[Scheduler] Görev çalıştırma hatası (${jobId}):`, e.message);
    }
  }

  // Active Watcher: Runs every 20 seconds to catch missed backups (hourly, daily, weekly, CDP)
  startActiveWatcher() {
    if (this.activeWatcher) clearInterval(this.activeWatcher);

    this.activeWatcher = setInterval(async () => {
      try {
        const jobs = db.get('jobs') || [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        for (const job of jobs) {
          if (job.enabled === false) continue;
          if (backupEngine.activeJobs && backupEngine.activeJobs.has(job.id)) continue;

          const lastRunDate = job.lastRun ? new Date(job.lastRun) : null;
          const lastRunDayStr = lastRunDate 
            ? `${lastRunDate.getFullYear()}-${String(lastRunDate.getMonth() + 1).padStart(2, '0')}-${String(lastRunDate.getDate()).padStart(2, '0')}`
            : null;
          const msSinceLastRun = lastRunDate ? (Date.now() - lastRunDate.getTime()) : Infinity;

          // 1. Hourly Schedule Check
          if (job.scheduleType === 'hourly') {
            const intervalHours = parseInt(job.scheduleHourlyInterval, 10) || 1;
            const thresholdMs = intervalHours * 60 * 60 * 1000;
            if (msSinceLastRun >= thresholdMs) {
              console.log(`[Scheduler] Saatlik görev zamanı geldi (${intervalHours} saat doldu): ${job.name}`);
              await this.triggerJob(job.id, `Saatlik otomatik yedekleme başlatıldı (${intervalHours} saat periyot): '${job.name}'`);
            }
          }

          // 2. Continuous (CDP) Schedule Check (every 15 mins)
          else if (job.scheduleType === 'continuous') {
            const thresholdMs = 15 * 60 * 1000;
            if (msSinceLastRun >= thresholdMs) {
              console.log(`[Scheduler] CDP Sürekli Veri Koruma tetiklendi: ${job.name}`);
              await this.triggerJob(job.id, `CDP Sürekli Veri Koruma tetiklendi (15dk): '${job.name}'`);
            }
          }

          // 3. Daily Schedule Check
          else if (job.scheduleType === 'daily') {
            const jobHour = parseInt(job.scheduleHour, 10) || 22;
            const jobMinute = parseInt(job.scheduleMinute, 10) || 0;
            const isPastTime = (currentHour > jobHour) || (currentHour === jobHour && currentMinute >= jobMinute);

            if (isPastTime && lastRunDayStr !== todayStr) {
              console.log(`[Scheduler] Günlük yedekleme zamanı geldi: ${job.name} (Saat: ${jobHour}:${jobMinute})`);
              await this.triggerJob(job.id, `Günlük otomatik yedekleme başlatıldı: '${job.name}'`);
            }
          }

          // 4. Weekly Schedule Check
          else if (job.scheduleType === 'weekly') {
            const jobHour = parseInt(job.scheduleHour, 10) || 22;
            const jobMinute = parseInt(job.scheduleMinute, 10) || 0;
            const days = Array.isArray(job.scheduleDays) ? job.scheduleDays : [1, 2, 3, 4, 5];
            const isTodayScheduledDay = days.includes(currentDayOfWeek);
            const isPastTime = (currentHour > jobHour) || (currentHour === jobHour && currentMinute >= jobMinute);

            if (isTodayScheduledDay && isPastTime && lastRunDayStr !== todayStr) {
              console.log(`[Scheduler] Haftalık yedekleme zamanı geldi: ${job.name}`);
              await this.triggerJob(job.id, `Haftalık otomatik yedekleme başlatıldı: '${job.name}'`);
            }
          }
        }
      } catch (err) {
        console.error('[Scheduler] Active watcher error:', err.message);
      }
    }, 20000); // 20s active check interval
  }

  removeJob(jobId) {
    if (this.tasks.has(jobId)) {
      try {
        this.tasks.get(jobId).stop();
      } catch (e) {}
      this.tasks.delete(jobId);
    }
    this.lastTriggered.delete(jobId);
  }
}

module.exports = new Scheduler();
