const cron = require('node-cron');
const db = require('../db');
const backupEngine = require('./backupEngine');

class Scheduler {
  constructor() {
    this.tasks = new Map(); // jobId -> cronTask
  }

  init() {
    this.reload();
    console.log('[Scheduler] OmniBackup Cron Scheduler initialized.');
  }

  reload() {
    // Stop all current running cron tasks
    for (const [jobId, task] of this.tasks.entries()) {
      task.stop();
    }
    this.tasks.clear();

    const jobs = db.get('jobs') || [];
    jobs.forEach(job => {
      if (job.enabled && job.schedule) {
        this.scheduleJob(job);
      }
    });
  }

  scheduleJob(job) {
    // Validate cron expression
    if (!cron.validate(job.schedule)) {
      console.warn(`[Scheduler] Geçersiz Cron ifadesi '${job.schedule}' (Job: ${job.name})`);
      return;
    }

    const task = cron.schedule(job.schedule, async () => {
      console.log(`[Scheduler] Zamanlanmış görev tetiklendi: ${job.name} (${job.id})`);
      db.addLog("info", "Scheduler", `Zamanlanmış görev tetiklendi: '${job.name}'`);
      try {
        await backupEngine.runJob(job.id);
      } catch (e) {
        console.error(`[Scheduler] Görev çalıştırma hatası (${job.id}):`, e.message);
      }
    });

    this.tasks.set(job.id, task);
  }

  removeJob(jobId) {
    if (this.tasks.has(jobId)) {
      this.tasks.get(jobId).stop();
      this.tasks.delete(jobId);
    }
  }
}

module.exports = new Scheduler();
