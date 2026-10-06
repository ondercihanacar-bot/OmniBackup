const notificationEngine = require('./notificationEngine');

class Notifier {
  async sendTelegram(message, config) {
    return notificationEngine.sendTelegram(message, config);
  }

  async sendEmail(subject, htmlBody, config) {
    return notificationEngine.sendEmail(subject, htmlBody, config);
  }

  async sendDiscord(title, description, color = 0x22c55e) {
    return notificationEngine.sendWebhook({
      title,
      message: description,
      severity: color === 0xef4444 ? 'error' : color === 0xf59e0b ? 'warning' : 'info'
    });
  }

  async notifyJobResult(job, result, success = true, error = null) {
    const title = success 
      ? `✅ Yedekleme Başarılı: ${job.name}` 
      : `❌ Yedekleme Başarısız: ${job.name}`;

    const text = success
      ? `<b>🛡️ OmniBackup Görev Raporu</b>\n\n` +
        `<b>Görev:</b> ${job.name}\n` +
        `<b>Tür:</b> ${(job.type || 'MSSQL').toUpperCase()}\n` +
        `<b>Boyut:</b> ${result?.size || '-'}\n` +
        `<b>Süre:</b> ${result?.duration || '-'}\n` +
        `<b>Hedef:</b> ${result?.destination || '-'}\n` +
        `<b>Dosya:</b> <code>${result?.fileName || '-'}</code>\n` +
        `<b>Tarih:</b> ${new Date().toLocaleString('tr-TR')}`
      : `<b>⚠️ OmniBackup Hata Bildirimi</b>\n\n` +
        `<b>Görev:</b> ${job.name}\n` +
        `<b>Hata:</b> ${error || 'Bilinmeyen hata'}\n` +
        `<b>Tarih:</b> ${new Date().toLocaleString('tr-TR')}`;

    return notificationEngine.dispatch({
      title,
      message: text,
      severity: success ? 'info' : 'error',
      job
    });
  }
}

module.exports = new Notifier();
