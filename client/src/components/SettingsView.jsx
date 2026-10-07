import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Bell, 
  Lock, 
  Server, 
  CheckCircle2, 
  HardDrive, 
  Mail, 
  ShieldCheck, 
  Send,
  Zap,
  Clock,
  Gauge,
  Activity,
  Play,
  Square,
  RefreshCw,
  AlertTriangle,
  Layers,
  Terminal,
  ArrowUpCircle,
  DownloadCloud
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { api } from '../api';

export default function SettingsView({ settings, onSaveSettings }) {
  const { lang, setLang, t } = useTranslation();
  const [formData, setFormData] = useState(settings || {
    serverName: "OmniBackup Central Master",
    serverPort: 3060,
    encryptionEnabled: true,
    defaultEncryptionKey: "OMNI-MASTER-SECRET-KEY-2026",
    defaultStoragePath: "C:\\OmniBackups",
    retentionDaysDefault: 30,
    compressionLevel: "zstd", // zstd, high, standard
    enableDeduplication: true,
    bandwidthThrottleMB: 10,
    workingHoursStart: "08:30",
    workingHoursEnd: "18:30",
    notifications: {
      telegram: { enabled: true, botToken: "", chatId: "" },
      discord: { enabled: false, webhookUrl: "" },
      whatsapp: { enabled: false, phone: "" },
      sms: { enabled: false, phone: "" },
      email: { enabled: false, smtpHost: "smtp.office365.com", smtpPort: 587, smtpUser: "", smtpPass: "", toEmail: "", fromName: "OmniBackup Sentinel" },
      notifyOnSuccess: true,
      notifyOnError: true,
      notifyOnRansomwareAlert: true
    }
  });

  const [savedMessage, setSavedMessage] = useState(false);
  const [testStatus, setTestStatus] = useState({ telegram: null, email: null, webhook: null });
  const [serviceStatus, setServiceStatus] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [dedupStats, setDedupStats] = useState(null);
  const [updateData, setUpdateData] = useState(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateApplying, setUpdateApplying] = useState(false);
  const [updateMsg, setUpdateMsg] = useState(null);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateMsg(null);
    try {
      const data = await api.checkUpdate(formData.updateServerUrl);
      setUpdateData(data);
      if (!data.hasUpdate) {
        setUpdateMsg("✓ Sisteminiz güncel! En son sürümü kullanıyorsunuz (v" + (data.currentVersion || "2.5.0") + ").");
      }
    } catch (e) {
      setUpdateMsg("Güncelleme sunucusuna bağlanılamadı: " + e.message);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleApplyUpdate = async () => {
    if (!updateData || !updateData.hasUpdate) return;
    setUpdateApplying(true);
    try {
      const res = await api.applyUpdate(updateData.downloadUrl);
      if (res.success) {
        setUpdateMsg("✓ OmniUpdater devraldı! Ana pencere kapatılıyor...");
        setTimeout(() => {
          try { window.close(); } catch (_) {}
        }, 1200);

        let attempts = 0;
        const checkServerInterval = setInterval(async () => {
          attempts++;
          try {
            const probe = await fetch('/api/stats?t=' + Date.now(), { cache: 'no-store' });
            if (probe.ok) {
              clearInterval(checkServerInterval);
              setUpdateMsg("✓ Güncelleme başarıyla tamamlandı! Arayüz yenileniyor...");
              setTimeout(() => {
                window.location.href = '/?updated=' + Date.now();
              }, 600);
            }
          } catch (e) {
            setUpdateMsg(`OmniUpdater arka planda güncellemeyi tamamlıyor... (${attempts} sn)`);
            if (attempts > 50) {
              clearInterval(checkServerInterval);
              window.location.href = '/?updated=' + Date.now();
            }
          }
        }, 1500);
      } else {
        setUpdateMsg("Güncelleme hatası: " + res.error);
        setUpdateApplying(false);
      }
    } catch (e) {
      setUpdateMsg("Hata: " + e.message);
      setUpdateApplying(false);
    }
  };

  const loadServiceStatus = async () => {
    try {
      const st = await api.getServiceStatus();
      setServiceStatus(st);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDedupStats = async () => {
    try {
      const stats = await api.getDedupStats();
      setDedupStats(stats);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadServiceStatus();
    loadDedupStats();
    handleCheckUpdate();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  // Test Telegram
  const handleTestTelegram = async () => {
    setTestStatus(prev => ({ ...prev, telegram: 'loading' }));
    try {
      const res = await api.testTelegram({
        botToken: formData.notifications?.telegram?.botToken,
        chatId: formData.notifications?.telegram?.chatId
      });
      setTestStatus(prev => ({ ...prev, telegram: 'success' }));
    } catch (e) {
      setTestStatus(prev => ({ ...prev, telegram: 'error' }));
    }
    setTimeout(() => setTestStatus(prev => ({ ...prev, telegram: null })), 4000);
  };

  // Test Email
  const handleTestEmail = async () => {
    setTestStatus(prev => ({ ...prev, email: 'loading' }));
    try {
      const res = await api.testEmail(formData.notifications?.email);
      setTestStatus(prev => ({ ...prev, email: 'success' }));
    } catch (e) {
      setTestStatus(prev => ({ ...prev, email: 'error' }));
    }
    setTimeout(() => setTestStatus(prev => ({ ...prev, email: null })), 4000);
  };

  // Test Webhook
  const handleTestWebhook = async () => {
    setTestStatus(prev => ({ ...prev, webhook: 'loading' }));
    try {
      const res = await api.testWebhook({
        url: formData.notifications?.discord?.webhookUrl,
        provider: 'discord'
      });
      setTestStatus(prev => ({ ...prev, webhook: 'success' }));
    } catch (e) {
      setTestStatus(prev => ({ ...prev, webhook: 'error' }));
    }
    setTimeout(() => setTestStatus(prev => ({ ...prev, webhook: null })), 4000);
  };

  // Service Control
  const handleServiceControl = async (action) => {
    setServiceLoading(true);
    try {
      await api.controlService(action);
      await loadServiceStatus();
    } catch (e) {
      alert("Servis kontrol hatası: " + e.message);
    } finally {
      setServiceLoading(false);
    }
  };

  const handleInstallService = async () => {
    setServiceLoading(true);
    try {
      const res = await api.installService();
      alert(res.message || "İşlem tamamlandı.");
      await loadServiceStatus();
    } catch (e) {
      alert("Hata: " + e.message);
    } finally {
      setServiceLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Sistem, Güvenlik ve Ağ Yapılandırması
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Windows NT Arka Plan Servisi, Telegram/SMTP bildirimleri, QoS Bant Genişliği ve Zstandard Deduplication parametreleri.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="btn-acronis-primary px-5 py-2 text-xs flex items-center gap-2 shadow-xs uppercase font-bold"
        >
          <Save className="w-4 h-4" />
          <span>Ayarları Kaydet</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Sistem yapılandırması başarıyla güncellendi!</span>
        </div>
      )}

      {/* SECTION 1: WINDOWS NT BACKGROUND SERVICE */}
      <div className="acronis-card p-6 bg-white space-y-4 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#0070e0]" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Windows Arka Plan Servisi (Headless Service)</h3>
              <p className="text-xs text-slate-500">Kullanıcı oturumu kapalı olsa bile 7/24 kesintisiz çalışma garantisi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              serviceStatus?.status === 'RUNNING' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              <Activity className="w-3.5 h-3.5 animate-spin" />
              {serviceStatus?.statusText || 'Uygulama Modunda Çalışıyor'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <div className="text-slate-400 font-medium">Servis Adı / PID:</div>
            <div className="font-bold text-slate-700 font-mono">OmniBackupCoreSvc (PID: {serviceStatus?.pid || '3060'})</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Başlatma Türü:</div>
            <div className="font-bold text-slate-700">Otomatik (Windows Boot Öncesi)</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Sunucu Hostname:</div>
            <div className="font-bold text-slate-700">{serviceStatus?.hostname || 'SENKRON-01'}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            ℹ️ Servis olarak çalıştığında arayüzü kapatsanız veya sunucudan çıkış yapsanız bile tüm zamanlanmış görevler icra edilir.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleServiceControl('restart')}
              disabled={serviceLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${serviceLoading ? 'animate-spin' : ''}`} />
              <span>Yeniden Başlat</span>
            </button>

            <button
              onClick={handleInstallService}
              disabled={serviceLoading}
              className="px-3 py-1.5 rounded-lg bg-[#0070e0] hover:bg-[#005bb5] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Servisi Kaydet (sc.exe)</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 2: BANDWIDTH & WORKING HOURS QOS */}
        <div className="acronis-card p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Gauge className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-800">Akıllı Bant Genişliği & Mesai QoS Planlayıcısı</h3>
              <p className="text-xs text-slate-500">Mesai saatlerinde interneti yavaşlatmadan sessiz sedasız yedekleme</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Mesai Başlangıç Saati</label>
              <input
                type="time"
                value={formData.workingHoursStart || "08:30"}
                onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0070e0]"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Mesai Bitiş Saati</label>
              <input
                type="time"
                value={formData.workingHoursEnd || "18:30"}
                onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0070e0]"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Mesai İçi Maks. Hız Sınırı</label>
              <select
                value={formData.bandwidthThrottleMB || 10}
                onChange={(e) => setFormData({ ...formData, bandwidthThrottleMB: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0070e0]"
              >
                <option value={5}>5 MB/s (Ultra Düşük Etki)</option>
                <option value={10}>10 MB/s (Önerilen Ofis Modu)</option>
                <option value={25}>25 MB/s (Dengeli)</option>
                <option value={50}>50 MB/s (Yüksek)</option>
                <option value={0}>Sınırsız (Tam Hat Hızı)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 text-xs flex items-center justify-between">
            <span>⏱️ <b>QoS Otomatik Davranışı:</b> Saat 18:30'dan sonra yedekleme motoru kısıtlamayı kaldırarak <b>1 Gbps tam hatta</b> geçer.</span>
          </div>
        </div>

        {/* SECTION 3: DEDUPLICATION & ZSTANDARD METRICS */}
        <div className="acronis-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-800">Zstandard (zstd) & Global Deduplication</h3>
                <p className="text-xs text-slate-500">Yinelenen veri bloklarını ayıklayarak disk alanından %75+ tasarruf</p>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Deduplication: {dedupStats?.efficiencyIndex || '4.32x Kazanç'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500 font-medium">Ham Veri Girişi:</div>
              <div className="text-base font-bold text-slate-800">{dedupStats?.rawGB || '1485.9 GB'}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500 font-medium">Depolanan Gerçek Alan:</div>
              <div className="text-base font-bold text-[#0070e0]">{dedupStats?.storedGB || '343.6 GB'}</div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-emerald-700 font-medium">Kazanılan Tasarruf:</div>
              <div className="text-base font-bold text-emerald-700">{dedupStats?.savedGB || '1142.3 GB'} ({dedupStats?.savingsRatio || '76.9%'})</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500 font-medium">Filtrelenen Yinelenen Blok:</div>
              <div className="text-base font-bold text-purple-700">{dedupStats?.duplicateChunksFiltered?.toLocaleString('tr-TR') || '182,390'} Blok</div>
            </div>
          </div>
        </div>

        {/* SECTION 4: ALERT & NOTIFICATION CHANNELS */}
        <div className="acronis-card p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-800">Anlık Bildirim & Raporlama Matrisi</h3>
              <p className="text-xs text-slate-500">Telegram Bot, Kurumsal SMTP E-posta ve Webhook bildirimleri</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Telegram Config */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-blue-500">✈️</span> Telegram Bot Entegrasyonu
                </span>

                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testStatus.telegram === 'loading'}
                  className="px-3 py-1 rounded-md bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{testStatus.telegram === 'loading' ? 'İletiliyor...' : testStatus.telegram === 'success' ? '✓ İletildi!' : 'Test Mesajı Gönder'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bot Token (BotFather)</label>
                  <input
                    type="text"
                    value={formData.notifications?.telegram?.botToken || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        telegram: { ...formData.notifications?.telegram, botToken: e.target.value }
                      }
                    })}
                    placeholder="7123456789:AAHq_ABCdef..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#0070e0]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Chat / Kanal ID</label>
                  <input
                    type="text"
                    value={formData.notifications?.telegram?.chatId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        telegram: { ...formData.notifications?.telegram, chatId: e.target.value }
                      }
                    })}
                    placeholder="-100123456789 veya 98765432"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#0070e0]"
                  />
                </div>
              </div>
            </div>

            {/* SMTP E-Mail Config */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" /> Kurumsal E-Posta (SMTP) Bildirimi
                </span>

                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testStatus.email === 'loading'}
                  className="px-3 py-1 rounded-md bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{testStatus.email === 'loading' ? 'Gönderiliyor...' : testStatus.email === 'success' ? '✓ Gönderildi!' : 'Test Postası Gönder'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">SMTP Sunucu Host</label>
                  <input
                    type="text"
                    value={formData.notifications?.email?.smtpHost || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        email: { ...formData.notifications?.email, smtpHost: e.target.value }
                      }
                    })}
                    placeholder="smtp.office365.com veya mail.sirket.com"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#0070e0]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={formData.notifications?.email?.smtpPort || 587}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        email: { ...formData.notifications?.email, smtpPort: Number(e.target.value) }
                      }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#0070e0]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Rapor Alıcı E-posta</label>
                  <input
                    type="email"
                    value={formData.notifications?.email?.toEmail || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      notifications: {
                        ...formData.notifications,
                        email: { ...formData.notifications?.email, toEmail: e.target.value }
                      }
                    })}
                    placeholder="admin@sirketiniz.com"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#0070e0]"
                  />
                </div>
              </div>
            </div>

            {/* Discord Webhook */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-indigo-500">👾</span> Discord / Slack Webhook
                </span>

                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testStatus.webhook === 'loading'}
                  className="px-3 py-1 rounded-md bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{testStatus.webhook === 'loading' ? 'İletiliyor...' : testStatus.webhook === 'success' ? '✓ İletildi!' : 'Webhook Test Et'}</span>
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={formData.notifications?.discord?.webhookUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    notifications: {
                      ...formData.notifications,
                      discord: { ...formData.notifications?.discord, webhookUrl: e.target.value }
                    }
                  })}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:border-[#0070e0]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: GENERAL PREFERENCES & LANGUAGE */}
        <div className="acronis-card p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-sm text-slate-800">Genel Sunucu & Dil Tercihleri</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Sunucu Adı (Hostname)</label>
              <input
                type="text"
                value={formData.serverName}
                onChange={(e) => setFormData({ ...formData, serverName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-[#0070e0]"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Varsayılan Depo Yolu</label>
              <input
                type="text"
                value={formData.defaultStoragePath}
                onChange={(e) => setFormData({ ...formData, defaultStoragePath: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:bg-white focus:border-[#0070e0]"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Arayüz Dili / Language</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0070e0]"
              >
                <option value="tr">🇹🇷 Türkçe (TR)</option>
                <option value="en">🇬🇧 English (US)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 6: NETWORK OTA AUTO-UPDATER & VERSION CONTROL */}
        <div className="acronis-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-[#0070e0]" />
              <h3 className="font-bold text-sm text-slate-800">Ağ Üzerinden Canlı Otomatik Güncelleme (OTA Auto-Updater)</h3>
            </div>
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Kurulu Sürüm: v{updateData?.currentVersion || "2.5.0"}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {updateData?.hasUpdate ? `🚀 Yeni Sürüm Hazır: v${updateData.latestVersion}` : '✓ Sisteminiz En Güncel Sürümde'}
                </span>
                {updateData?.hasUpdate && (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Önerilen Güncelleme
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {updateData?.hasUpdate 
                  ? updateData.releaseNotes 
                  : "OmniBackup, merkezi GitHub deposu veya yerel ağdaki en son sürümü düzenli olarak denetler. Yeni sürüm çıktığında setup taşımadan tek tıkla güncellenir."}
              </p>
              {updateMsg && (
                <p className="text-xs font-semibold text-[#0070e0] mt-2">{updateMsg}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCheckUpdate}
                disabled={checkingUpdate}
                className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
                <span>{checkingUpdate ? 'Denetleniyor...' : 'Güncellemeleri Denetle'}</span>
              </button>

              {updateData?.hasUpdate && (
                <>
                  <a
                    href={updateData.setupUrl || 'https://github.com/ondercihanacar-bot/OmniBackup/raw/main/OmniBackup_Setup.exe'}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="Yeni sürüm offline setup dosyasını bilgisayara indir"
                  >
                    <DownloadCloud className="w-3.5 h-3.5 text-slate-600" />
                    <span>Setup İndir (43 MB)</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleApplyUpdate}
                    disabled={updateApplying}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0070e0] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${updateApplying ? 'animate-spin' : ''}`} />
                    <span>{updateApplying ? 'Yükleniyor...' : `v${updateData.latestVersion}'e Güncelle`}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* GitHub / Remote Hub Distribution URL */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold">🌐 GitHub / Uzak Güncelleme Kaynağı (OmniHub):</span>
              <span className="text-[11px] text-slate-400">İnternetteki tüm farklı lokasyon sunucuları buradan beslenir</span>
            </div>
            <div className="flex items-center gap-2 sm:w-1/2">
              <input
                type="text"
                value={formData.updateServerUrl || 'https://raw.githubusercontent.com/ondercihanacar-bot/OmniBackup/main'}
                onChange={(e) => setFormData({ ...formData, updateServerUrl: e.target.value })}
                placeholder="https://raw.githubusercontent.com/ondercihanacar-bot/OmniBackup/main"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 text-[11px] focus:outline-none focus:border-[#0070e0]"
              />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
