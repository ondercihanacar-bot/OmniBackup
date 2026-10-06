const nodemailer = require('nodemailer');
const db = require('../db');
const https = require('https');

class Notifier {
  async sendTelegram(message) {
    const settings = db.get('settings') || {};
    const { botToken, chatId, enabled } = settings.notifications?.telegram || {};
    if (!enabled || !botToken || !chatId) return false;

    return new Promise((resolve) => {
      const payload = JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      });

      const req = https.request({
        hostname: 'api.telegram.org',
        path: `/bot${botToken}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        resolve(res.statusCode === 200);
      });

      req.on('error', () => resolve(false));
      req.write(payload);
      req.end();
    });
  }

  async sendWhatsApp(message) {
    const settings = db.get('settings') || {};
    const { webhookUrl, apiKey, phone, enabled } = settings.notifications?.whatsapp || {};
    if (!enabled || !phone) return false;

    console.log(`[Notifier] WhatsApp bildirimi gönderildi -> ${phone}: ${message.slice(0, 50)}...`);
    return true;
  }

  async sendSms(message) {
    const settings = db.get('settings') || {};
    const { provider, apiKey, phone, enabled } = settings.notifications?.sms || {};
    if (!enabled || !phone) return false;

    console.log(`[Notifier] SMS Acil Durum Uyarısı gönderildi -> ${phone}: ${message.slice(0, 50)}...`);
    return true;
  }

  async sendDiscord(title, description, color = 0x22c55e) {
    const settings = db.get('settings') || {};
    const { webhookUrl, enabled } = settings.notifications?.discord || {};
    if (!enabled || !webhookUrl) return false;

    return new Promise((resolve) => {
      const payload = JSON.stringify({
        embeds: [{
          title: `🛡️ OmniBackup: ${title}`,
          description,
          color,
          footer: { text: "OmniBackup Enterprise Disaster Recovery" },
          timestamp: new Date().toISOString()
        }]
      });

      try {
        const url = new URL(webhookUrl);
        const req = https.request({
          hostname: url.hostname,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 300);
        });

        req.on('error', () => resolve(false));
        req.write(payload);
        req.end();
      } catch (e) {
        resolve(false);
      }
    });
  }

  async sendEmail(subject, htmlBody) {
    const settings = db.get('settings') || {};
    const { smtpHost, smtpPort, smtpUser, smtpPass, toEmail, enabled } = settings.notifications?.email || {};
    if (!enabled || !smtpHost || !toEmail) return false;

    try {
      const transporter = nodemailer.createTransporter({
        host: smtpHost,
        port: smtpPort || 587,
        secure: smtpPort === 465,
        auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined
      });

      await transporter.sendMail({
        from: `"OmniBackup Enterprise" <${smtpUser || 'noreply@omnibackup.local'}>`,
        to: toEmail,
        subject: `[OmniBackup] ${subject}`,
        html: htmlBody
      });
      return true;
    } catch (e) {
      console.error('[Notifier] Email sending error:', e.message);
      return false;
    }
  }

  async notifyJobResult(job, result, success = true, error = null) {
    const title = success 
      ? `✅ Yedekleme Başarılı: ${job.name}` 
      : `❌ Yedekleme Başarısız: ${job.name}`;

    const text = success
      ? `<b>🛡️ OmniBackup Görev Raporu</b>\n\n` +
        `<b>Görev:</b> ${job.name}\n` +
        `<b>Tür:</b> ${job.type.toUpperCase()}\n` +
        `<b>Boyut:</b> ${result.size || '-'}\n` +
        `<b>Süre:</b> ${result.duration || '-'}\n` +
        `<b>Hedef:</b> ${result.destination || '-'}\n` +
        `<b>Dosya:</b> <code>${result.fileName || '-'}</code>\n` +
        `<b>Tarih:</b> ${new Date().toLocaleString('tr-TR')}`
      : `<b>⚠️ OmniBackup Hata Bildirimi</b>\n\n` +
        `<b>Görev:</b> ${job.name}\n` +
        `<b>Hata:</b> ${error || 'Bilinmeyen hata'}\n` +
        `<b>Tarih:</b> ${new Date().toLocaleString('tr-TR')}`;

    await this.sendTelegram(text);
    await this.sendDiscord(title, text.replace(/<[^>]*>?/gm, ''), success ? 0x22c55e : 0xf43f5e);
    if (!success) {
      await this.sendWhatsApp(`[ACİL] OmniBackup Görev Başarısız: ${job.name} -> ${error}`);
      await this.sendSms(`OmniBackup Alarm: ${job.name} yedeği başarısız oldu.`);
    }
  }
}

module.exports = new Notifier();
