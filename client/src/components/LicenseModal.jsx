import React, { useState } from 'react';
import { 
  Key, 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap, 
  Server, 
  Clock, 
  Award, 
  Building, 
  User, 
  RefreshCw,
  Sparkles,
  Link,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api';

export default function LicenseModal({ isOpen, onClose, license, onLicenseUpdated }) {
  if (!isOpen) return null;

  const [copiedHwid, setCopiedHwid] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [licensedToInput, setLicensedToInput] = useState('Önder Cihan ACAR');
  const [companyInput, setCompanyInput] = useState('Kurumsal Müşteri A.Ş.');
  const [omniHubUrl, setOmniHubUrl] = useState('http://127.0.0.1:3000');
  
  const [activating, setActivating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleCopyHwid = () => {
    if (license?.hardwareId) {
      navigator.clipboard.writeText(license.hardwareId);
      setCopiedHwid(true);
      setTimeout(() => setCopiedHwid(false), 3000);
    }
  };

  const handleManualActivate = async (e) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) {
      setErrorMsg("Lütfen geçerli bir OmniHub lisans anahtarı giriniz.");
      return;
    }

    setActivating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.activateLicense({
        licenseKey: licenseKeyInput,
        licensedTo: licensedToInput,
        company: companyInput
      });

      if (res.success) {
        setSuccessMsg(`✓ Lisans başarıyla etkinleştirildi: ${res.license.tierName}`);
        if (onLicenseUpdated) onLicenseUpdated(res.license);
      } else {
        setErrorMsg(res.error || "Etkinleştirme başarısız.");
      }
    } catch (err) {
      setErrorMsg("Lisans doğrulama hatası: " + err.message);
    } finally {
      setActivating(false);
    }
  };

  const handleSyncOmniHub = async () => {
    setSyncing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.syncOmniHub({ omniHubUrl });
      if (res.success) {
        setSuccessMsg(`✓ OmniHub Merkezi ile senkronize edildi: ${res.license.tierName}`);
        if (onLicenseUpdated) onLicenseUpdated(res.license);
      } else {
        setErrorMsg(res.error || "OmniHub bağlantısı kurulamadı.");
      }
    } catch (err) {
      setErrorMsg("OmniHub senkronizasyon hatası: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">OmniHub Lisanslama & Aktivasyon</h2>
              <p className="text-xs text-slate-300 font-mono">Merkezi Lisans Yöneticisi & Demo Takibi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            license?.status === 'ACTIVE' || license?.status === 'ACTIVE_PERPETUAL'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldCheck className={`w-5 h-5 ${
                  license?.status === 'ACTIVE' || license?.status === 'ACTIVE_PERPETUAL' ? 'text-emerald-600' : 'text-amber-600'
                }`} />
                <span>{license?.tierName || '15 Günlük Kurumsal Deneme Sürümü'}</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Lisans Sahibi: <strong className="text-slate-800">{license?.licensedTo || 'Sistem Yöneticisi'}</strong> ({license?.company || 'Kurumsal Kurulum'})
              </p>
            </div>

            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                license?.status === 'ACTIVE' || license?.status === 'ACTIVE_PERPETUAL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}>
                {license?.status === 'ACTIVE' || license?.status === 'ACTIVE_PERPETUAL' ? '✓ LİSANSLI' : `⏳ ${license?.daysRemaining || 15} GÜN KALDI`}
              </span>
              <span className="block text-[10px] text-slate-500 mt-1 font-mono">
                Bitiş: {license?.expiresAt ? new Date(license.expiresAt).toLocaleDateString('tr-TR') : '15 Gün Sonra'}
              </span>
            </div>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Machine Hardware ID (HWID) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#0070e0]" />
                <span>Sunucu Donanım Parmak İzi (Hardware ID):</span>
              </span>
              <button
                onClick={handleCopyHwid}
                className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1 transition shadow-2xs"
              >
                {copiedHwid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHwid ? 'Kopyalandı!' : 'HWID Kopyala'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 text-cyan-300 font-mono text-xs select-all">
              {license?.hardwareId || 'OMNI-HWID-XXXX-XXXX-XXXX'}
            </div>
            <p className="text-[10px] text-slate-500">
              * Bu donanım kimliğini OmniHub Yönetim Paneline kaydederek özel lisans anahtarı üretebilirsiniz.
            </p>
          </div>

          {/* Activation Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Option 1: OmniHub Online Sync */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Link className="w-4 h-4 text-indigo-600" />
                  <span>OmniHub Çevrimiçi Senkronizasyon</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Yerel ağda veya bulutta çalışan OmniHub Master sunucusuna bağlanarak lisansı otomatik doğrular.
                </p>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">OmniHub Sunucu URL</label>
                  <input
                    type="text"
                    value={omniHubUrl}
                    onChange={(e) => setOmniHubUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#0070e0]"
                    placeholder="http://127.0.0.1:3000"
                  />
                </div>
              </div>

              <button
                onClick={handleSyncOmniHub}
                disabled={syncing}
                className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Bağlanıyor...' : 'OmniHub ile Doğrula'}</span>
              </button>
            </div>

            {/* Option 2: Manual License Key */}
            <form onSubmit={handleManualActivate} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>Lisans Anahtarı ile Etkinleştir</span>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Lisans Anahtarı</label>
                  <input
                    type="text"
                    value={licenseKeyInput}
                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-mono text-xs uppercase focus:outline-none focus:border-[#0070e0]"
                    placeholder="OMNI-BK-XXXX-XXXX-XXXX"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Lisans Sahibi</label>
                    <input
                      type="text"
                      value={licensedToInput}
                      onChange={(e) => setLicensedToInput(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Şirket</label>
                    <input
                      type="text"
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={activating}
                className="w-full btn-acronis-primary py-2 text-xs flex items-center justify-center gap-1.5 shadow-xs font-bold"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>{activating ? 'Etkinleştiriliyor...' : 'Lisansı Etkinleştir'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">OmniHub Licensing Framework v2.4</span>
          <button
            onClick={onClose}
            className="btn-acronis-outline px-4 py-1.5"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
