const fs = require('fs-extra');
const path = require('path');
const db = require('../db');
const notifier = require('./notifier');

class RansomwareShield {
  constructor() {
    // Known Ransomware Extensions
    this.knownRansomwareExtensions = new Set([
      '.locky', '.crypt', '.crypto', '.wnry', '.locked', '.crypted', '.ransom',
      '.mallox', '.phobos', '.stop', '.djvu', '.makop', '.blackcat', '.lockbit',
      '.akira', '.rhysida', '.play', '.royal', '.blackbasta', '.hive', '.cuba',
      '.qilin', '.medusa', '.bianlian', '.babuk', '.ragnar', '.conti'
    ]);

    // Known Ransom Note Filenames
    this.ransomNotePatterns = [
      /read_me/i, /how_to_recover/i, /how_to_decrypt/i, /restore_files/i,
      /decrypt_instruction/i, /help_decrypt/i, /recovery_instructions/i,
      /!_readme/i, /readme_to_decrypt/i
    ];
  }

  // Calculate Shannon Entropy of a buffer (0.0 to 8.0)
  // Encrypted / Ransomware files have entropy close to 8.0 (e.g. > 7.92)
  calculateEntropy(buffer) {
    if (!buffer || buffer.length === 0) return 0;
    const frequencies = new Array(256).fill(0);
    for (let i = 0; i < buffer.length; i++) {
      frequencies[buffer[i]]++;
    }

    let entropy = 0;
    for (let i = 0; i < 256; i++) {
      if (frequencies[i] > 0) {
        const p = frequencies[i] / buffer.length;
        entropy -= p * Math.log2(p);
      }
    }
    return entropy;
  }

  // Scan directory / files for Ransomware signs before starting backup
  async inspectSourcePath(sourcePath) {
    if (!sourcePath || !fs.existsSync(sourcePath)) {
      return { safe: true };
    }

    console.log(`[RansomwareShield] '${sourcePath}' CryptoLocker ve fidye yazılımı tehditlerine karşı taranıyor...`);

    const findings = [];
    let highEntropyCount = 0;
    let totalScanned = 0;

    try {
      const files = fs.readdirSync(sourcePath, { withFileTypes: true });

      for (const ent of files) {
        if (ent.isFile()) {
          totalScanned++;
          const fullPath = path.join(sourcePath, ent.name);
          const ext = path.extname(ent.name).toLowerCase();

          // 1. Check known ransomware extensions
          if (this.knownRansomwareExtensions.has(ext)) {
            findings.push({
              type: 'KNOWN_EXTENSION',
              file: ent.name,
              reason: `Bilinen fidye yazılımı uzantısı tespit edildi: ${ext}`
            });
          }

          // 2. Check ransom note patterns
          if (this.ransomNotePatterns.some(pat => pat.test(ent.name))) {
            findings.push({
              type: 'RANSOM_NOTE',
              file: ent.name,
              reason: `Fidye talep notu tespit edildi: ${ent.name}`
            });
          }

          // 3. Check Entropy for Office/Document/SQL files that shouldn't normally be raw high-entropy
          const docExtensions = ['.docx', '.xlsx', '.pdf', '.txt', '.sql', '.csv'];
          if (docExtensions.includes(ext)) {
            try {
              const sampleBuffer = Buffer.alloc(16384); // Sample 16KB
              const fd = fs.openSync(fullPath, 'r');
              const bytesRead = fs.readSync(fd, sampleBuffer, 0, 16384, 0);
              fs.closeSync(fd);

              if (bytesRead > 1024) {
                const entropy = this.calculateEntropy(sampleBuffer.slice(0, bytesRead));
                // Plain docx or sql usually entropy 6.0 - 7.2. If > 7.95, it is encrypted!
                if (entropy > 7.94) {
                  highEntropyCount++;
                  if (highEntropyCount >= 3) {
                    findings.push({
                      type: 'HIGH_ENTROPY_ENCRYPTION',
                      file: ent.name,
                      reason: `Dosyada anormal yüksek şifreleme entropisi tespit edildi (Entropy: ${entropy.toFixed(3)} / 8.0)`
                    });
                  }
                }
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }
    } catch (e) {
      console.error('[RansomwareShield] Scan error:', e.message);
    }

    if (findings.length > 0) {
      return {
        safe: false,
        threatLevel: 'CRITICAL',
        threatCount: findings.length,
        findings,
        message: `🚨 DİKKAT! Kaynak klasörde (${sourcePath}) CryptoLocker / Ransomware izleri tespit edildi!`
      };
    }

    return { safe: true, message: "CryptoLocker tehdidi bulunamadı. Veriler temiz." };
  }

  // Handle emergency killswitch when ransomware is detected
  async triggerEmergencyLockdown(job, threatResult) {
    const alertMessage = `🚨 KRİTİK GÜVENLİK UYARISI: CRYPTOLOCKER / RANSOMWARE TESPİT EDİLDİ!\n\n` +
      `Görev: ${job.name}\n` +
      `Kaynak: ${job.sourcePath}\n` +
      `Ajan/Makine: ${job.agentId || 'Yerel Sunucu'}\n` +
      `Tehdit Sayısı: ${threatResult.threatCount}\n` +
      `Örnek Şüpheli: ${threatResult.findings[0]?.file} (${threatResult.findings[0]?.reason})\n\n` +
      `🛑 EYLEM: Yedekleme DERHAL DURDURULDU! Temiz geçmiş yedeklerin bozulmaması için hedef depolamaya (Google Drive / NAS) yazma işlemi BLOKE EDİLDİ.`;

    console.error(alertMessage);

    // Add Red Alert Log to system
    db.addLog("error", "AntiRansomware", `[CRYPTOLOCKER BLOKLANDI] '${job.name}' yedeği durduruldu: ${threatResult.findings[0]?.reason}`);

    // Send Instant Telegram, Discord & Email Alerts
    await notifier.sendTelegram(`<b>🚨 KRİTİK ALARM: CRYPTOLOCKER TESPİT EDİLDİ!</b>\n\n` +
      `<b>Görev:</b> ${job.name}\n` +
      `<b>Kaynak:</b> <code>${job.sourcePath}</code>\n` +
      `<b>Tespit:</b> ${threatResult.findings[0]?.reason}\n\n` +
      `🛑 <i>Yedekleme durduruldu. Hedef depolama kilitlendi.</i>`);

    await notifier.sendDiscord(
      "🚨 KRİTİK: CRYPTOLOCKER TESPİT EDİLDİ!",
      alertMessage,
      0xf43f5e // Red
    );

    await notifier.sendEmail(
      "🚨 ACİL: CryptoLocker Tespiti & Yedekleme Durduruldu!",
      `<div style="font-family: sans-serif; padding: 20px; background: #030d07; color: #fff; border: 2px solid #ef4444; border-radius: 12px;">
        <h2 style="color: #ef4444; margin-top: 0;">🚨 ACİL GÜVENLİK UYARISI: Fidye Yazılımı (CryptoLocker) Tespiti!</h2>
        <p>OmniBackup Shield Motoru, <b>${job.name}</b> görevinde şifrelenmiş şüpheli dosyalar tespit etti.</p>
        <div style="background: #1e1014; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <b>Kaynak Dizin:</b> ${job.sourcePath}<br/>
          <b>Tespit Edilen Tehdit:</b> ${threatResult.findings[0]?.reason}<br/>
          <b>Zaman:</b> ${new Date().toLocaleString('tr-TR')}
        </div>
        <p style="color: #22c55e; margin-top: 15px;"><b>✓ ALINAN ÖNLEM:</b> Yedekleme derhal durduruldu. Google Drive ve NAS üzerindeki temiz eski yedeklerinizin üzerine yazılması engellendi.</p>
      </div>`
    );
  }
}

module.exports = new RansomwareShield();
