const https = require('https');
const http = require('http');
const nodemailer = require('nodemailer');
const db = require('../db');

class NotificationEngine {
  constructor() {
    this.initDefaults();
  }

  initDefaults() {
    const data = db.read();
    if (!data.settings) data.settings = {};
    if (!data.settings.notifications) {
      data.settings.notifications = {
        telegram: {
          enabled: false,
          botToken: '',
          chatId: ''
        },
        email: {
          enabled: false,
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPass: '',
          toEmail: '',
          fromName: 'OmniBackup Enterprise'
        },
        webhook: {
          enabled: false,
          url: '',
          provider: 'discord' // discord, slack, generic
        },
        whatsapp: {
          enabled: false,
          phone: '',
          apiKey: ''
        },
        rules: {
          notifyOnSuccess: true,
          notifyOnError: true,
          notifyOnRansomwareAlert: true,
          notifyDailyDigest: true,
          dailyDigestTime: '08:30'
        }
      };
      db.write(data);
    }
  }

  getSettings() {
    const data = db.read();
    return data.settings?.notifications || {};
  }

  // --- Telegram ---
  async sendTelegram(message, customConfig = null) {
    const cfg = customConfig || this.getSettings().telegram;
    if (!cfg?.botToken || !cfg?.chatId) {
      throw new Error('Telegram Bot Token veya Chat ID eksik.');
    }

    const payload = JSON.stringify({
      chat_id: cfg.chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.telegram.org',
        path: `/bot${cfg.botToken}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 10000
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode === 200 && parsed.ok) {
              resolve({ success: true, message: 'Telegram bildirimi başarıyla iletildi.' });
            } else {
              reject(new Error(parsed.description || `Telegram API Hatası (${res.statusCode})`));
            }
          } catch (e) {
            if (res.statusCode === 200) resolve({ success: true });
            else reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (err) => reject(new Error(`Bağlantı Hatası: ${err.message}`)));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Telegram sunucusuna bağlanırken zaman aşımı oluştu.'));
      });
      req.write(payload);
      req.end();
    });
  }

  // --- SMTP Email ---
  async sendEmail(subject, htmlBody, customConfig = null) {
    const cfg = customConfig || this.getSettings().email;
    if (!cfg?.smtpHost || !cfg?.toEmail) {
      throw new Error('SMTP Sunucu adresi veya Alıcı E-posta adresi belirtilmemiş.');
    }

    const transporter = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: parseInt(cfg.smtpPort) || 587,
      secure: parseInt(cfg.smtpPort) === 465,
      auth: cfg.smtpUser ? {
        user: cfg.smtpUser,
        pass: cfg.smtpPass
      } : undefined,
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000
    });

    const info = await transporter.sendMail({
      from: `"${cfg.fromName || 'OmniBackup Enterprise'}" <${cfg.smtpUser || 'noreply@omnibackup.local'}>`,
      to: cfg.toEmail,
      subject: `[OmniBackup] ${subject}`,
      html: htmlBody
    });

    return { success: true, messageId: info.messageId };
  }

  // --- Webhook (Discord / Slack / Generic) ---
  async sendWebhook(payloadData, customConfig = null) {
    const cfg = customConfig || this.getSettings().webhook;
    if (!cfg?.url) throw new Error('Webhook URL adresi tanımlı değil.');

    const url = new URL(cfg.url);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    let payloadString = '';
    if (cfg.provider === 'discord') {
      payloadString = JSON.stringify({
        username: 'OmniBackup Sentinel',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/906/906334.png',
        embeds: [{
          title: `🛡️ OmniBackup: ${payloadData.title}`,
          description: payloadData.message,
          color: payloadData.severity === 'error' ? 0xef4444 : payloadData.severity === 'warning' ? 0xf59e0b : 0x10b981,
          fields: payloadData.fields || [],
          footer: { text: 'OmniBackup Enterprise Disaster Recovery' },
          timestamp: new Date().toISOString()
        }]
      });
    } else {
      payloadString = JSON.stringify(payloadData);
    }

    return new Promise((resolve, reject) => {
      const req = client.request({
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payloadString)
        },
        timeout: 10000
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, statusCode: res.statusCode });
          } else {
            reject(new Error(`Webhook yanıt kodu: ${res.statusCode} - ${body}`));
          }
        });
      });

      req.on('error', err => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Webhook zaman aşımı.'));
      });
      req.write(payloadString);
      req.end();
    });
  }

  // --- Dispatch All Enabled Channels ---
  async dispatch({ title, message, severity = 'info', job = null, stats = null }) {
    const settings = this.getSettings();
    const results = {};

    // HTML email template
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: ${severity === 'error' ? '#ef4444' : severity === 'warning' ? '#f59e0b' : '#0070e0'}; padding: 20px 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 700;">🛡️ OmniBackup Enterprise Raporu</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">${new Date().toLocaleString('tr-TR')}</p>
        </div>
        <div style="padding: 24px;">
          <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">${title}</h3>
          <div style="background: #f8fafc; border-left: 4px solid ${severity === 'error' ? '#ef4444' : '#0070e0'}; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${message}</div>
          ${job ? `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Görev Adı:</td><td style="padding: 8px 0; font-weight: 600; color: #0f172a; text-align: right;">${job.name}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Yedekleme Türü:</td><td style="padding: 8px 0; text-align: right;">${(job.type || 'MSSQL').toUpperCase()}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Hedef Depo:</td><td style="padding: 8px 0; text-align: right;">${job.destinationName || 'Yerel / NAS'}</td></tr>
            </table>
          ` : ''}
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
            Bu mesaj OmniBackup Master Sunucusu tarafından otomatik olarak oluşturulmuştur.
          </div>
        </div>
      </div>
    `;

    // 1. Telegram
    if (settings.telegram?.enabled) {
      try {
        const tgText = `<b>🛡️ OmniBackup: ${title}</b>\n\n${message}\n\n<i>📅 ${new Date().toLocaleString('tr-TR')}</i>`;
        await this.sendTelegram(tgText);
        results.telegram = true;
      } catch (e) {
        results.telegram = false;
        console.error('[NotificationEngine] Telegram hatası:', e.message);
      }
    }

    // 2. Email
    if (settings.email?.enabled) {
      try {
        await this.sendEmail(title, emailHtml);
        results.email = true;
      } catch (e) {
        results.email = false;
        console.error('[NotificationEngine] E-posta hatası:', e.message);
      }
    }

    // 3. Webhook
    if (settings.webhook?.enabled) {
      try {
        await this.sendWebhook({
          title,
          message,
          severity,
          fields: job ? [
            { name: 'Görev', value: job.name, inline: true },
            { name: 'Tür', value: (job.type || '').toUpperCase(), inline: true }
          ] : []
        });
        results.webhook = true;
      } catch (e) {
        results.webhook = false;
        console.error('[NotificationEngine] Webhook hatası:', e.message);
      }
    }

    return results;
  }
}

module.exports = new NotificationEngine();
