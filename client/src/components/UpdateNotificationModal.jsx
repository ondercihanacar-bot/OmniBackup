import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowUpCircle, 
  DownloadCloud, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Terminal, 
  Clock, 
  HardDrive, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../api';

export default function UpdateNotificationModal({ isOpen, onClose, updateInfo, onUpdateStarted }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen || !updateInfo) return null;

  const handleStartUpdate = async () => {
    setIsUpdating(true);
    setStatusMessage('Güncelleme paketi indiriliyor ve OmniUpdater başlatılıyor...');
    setError(null);

    try {
      const res = await api.applyUpdate(updateInfo.downloadUrl);
      if (res.success) {
        setStatusMessage(res.message || 'Güncelleme başladı. Dosyalar yenileniyor, sistem yeniden başlatılıyor...');
        if (onUpdateStarted) onUpdateStarted();

        // Count down and reload interface
        let countdown = 6;
        const interval = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            setStatusMessage(`Güncelleme uygulandı! Arayüz ${countdown} saniye içinde yenilenecek...`);
          } else {
            clearInterval(interval);
            window.location.reload();
          }
        }, 1000);
      } else {
        setError(res.error || 'Güncelleme başlatılamadı.');
        setIsUpdating(false);
      }
    } catch (err) {
      setError(err.message || 'Sunucu ile iletişim kurulamadı.');
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-5 text-white relative">
          {!updateInfo.mandatory && !isUpdating && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900/60 rounded-[10px] flex items-center justify-center text-cyan-300">
                <ArrowUpCircle className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-400/30 uppercase tracking-wider">
                  Network OTA Update
                </span>
                <span className="text-slate-400 text-xs">v{updateInfo.currentVersion} ➔ <strong className="text-emerald-400 font-mono">v{updateInfo.latestVersion}</strong></span>
              </div>
              <h2 className="text-base font-extrabold text-white mt-0.5">
                Yeni OmniBackup Sürümü Mevcut!
              </h2>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          
          {/* Version Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Paket Boyutu</span>
              <span className="text-slate-800 font-extrabold font-mono text-sm mt-0.5 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#0070e0]" />
                {updateInfo.packageSize || '4.8 MB'}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">Hafif Ağ Yaması</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Veri Güvenliği</span>
              <span className="text-emerald-700 font-extrabold text-sm mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Sıfır Kayıp
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">db.json & Görevler Korunur</span>
            </div>
          </div>

          {/* Release Notes */}
          <div>
            <label className="block text-slate-700 text-xs font-bold mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Sürüm Yenilikleri & İyileştirmeler:
            </label>
            <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-sans max-h-36 overflow-y-auto whitespace-pre-line border border-slate-800 shadow-inner leading-relaxed">
              {updateInfo.releaseNotes}
            </div>
          </div>

          {/* Status Message or Error */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {isUpdating && (
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
                <RefreshCw className="w-3.5 h-3.5 text-[#0070e0] animate-spin" />
                <span>{statusMessage}</span>
              </div>
              <div className="w-full bg-sky-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0070e0] h-full w-2/3 animate-pulse rounded-full" />
              </div>
              <p className="text-[10px] text-sky-700 font-medium">
                Uygulama otomatik olarak kapanıp güncellenmiş sürümle tekrar açılacaktır. Lütfen bekleyin...
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Mevcut: v{updateInfo.currentVersion} • Yeni: v{updateInfo.latestVersion}
          </span>

          <div className="flex items-center gap-2">
            {!updateInfo.mandatory && !isUpdating && (
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Daha Sonra
              </button>
            )}

            {/* Direct Setup Installer Download Option */}
            <a
              href={updateInfo.setupUrl || 'https://github.com/ondercihanacar-bot/OmniBackup/raw/main/OmniBackup_Setup.exe'}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Yeni sürüm setup dosyasını bilgisayara indirip elle kurmak için tıklayın"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>Setup İndir (43 MB)</span>
            </a>

            <button
              onClick={handleStartUpdate}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition cursor-pointer ${
                isUpdating 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#0070e0] to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-98'
              }`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Güncelleniyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Otomatik Güncelle (2.9 MB)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
