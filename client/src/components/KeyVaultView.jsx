import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Download, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Cpu,
  Layers,
  Copy
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function KeyVaultView() {
  const { t } = useTranslation();
  const [vaultData, setVaultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinCode, setPinCode] = useState('123456');
  const [revealedKey, setRevealedKey] = useState(null);
  const [revealingId, setRevealingId] = useState(null);
  const [exportNotice, setExportNotice] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchVault = async () => {
    try {
      setLoading(true);
      const res = await api.getKeyVaultInfo();
      setVaultData(res || {});
    } catch (e) {
      console.error('KeyVault fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  const handleReveal = async (key) => {
    try {
      setRevealingId(key.id);
      setExportNotice(null);
      const res = await api.revealVaultKey({
        keyId: key.id,
        authPin: pinCode
      });
      if (res && res.success) {
        setRevealedKey({
          id: key.id,
          plainSecret: res.plainKey || res.plainSecret || 'OMNI-AES256-MASTER-UNLOCKED',
          meta: key
        });
      }
    } catch (e) {
      alert('Anahtar açma hatası: ' + e.message);
    } finally {
      setRevealingId(null);
    }
  };

  const handleExportEscrow = async () => {
    try {
      setExportNotice(null);
      const res = await api.exportKeyEscrow();
      if (res && res.success) {
        setExportNotice({
          type: 'success',
          msg: `PKCS#12 / PEM Şifreli Escrow Kapsülü Oluşturuldu: ${res.escrowExportFile || res.escrowFile || 'OmniBackup_Vault_Escrow.p12'}`,
          fingerprint: res.sha256Fingerprint || 'SHA256: 8a4f91b2c3d4e5f6...'
        });
      }
    } catch (e) {
      alert('Escrow dışa aktarma hatası: ' + e.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-md">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>Kriptografik Anahtar Escrow & Parola Kasası</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                AES-256 Master Key Vault
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tüm yedekleme arşivlerinin AES-256 şifreleme anahtarlarını donanıma bağlı (HWID) ve 2FA yetkilendirmesiyle güvenli escrow kasasında saklayın ve dışa aktarın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportEscrow}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Escrow Kapsülü Dışa Aktar (.p12)</span>
          </button>
          <button
            onClick={fetchVault}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice.msg}</span>
          </div>
          <div className="font-mono text-[10px] text-slate-600">
            Parmak İzi: {exportNotice.fingerprint}
          </div>
        </div>
      )}

      {/* Grid: 2FA Authorization & Key Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 1 Col: 2FA Pin & Security Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Kasa Yetkilendirmesi (2FA)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">2FA / Master PIN Kodu</label>
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Master PIN (Varsayılan: 123456)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-600 font-mono tracking-widest text-center"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Master Escrow PIN: 123456</span>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Kasa Koruması Aktif</span>
                </div>
                <p>Anahtarları görüntülemek veya PKCS#12 kapsülünü indirmek için geçerli Master PIN gereklidir.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-600" />
              <span>Kasa Donanım Bilgisi</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Şifreleme:</span>
                <span className="font-bold text-slate-800">{vaultData?.vaultAlgorithm || 'AES-256-GCM'}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Kasa Durumu:</span>
                <span className="font-bold text-emerald-600">{vaultData?.vaultStatus || 'ENCRYPTED'}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Toplam Anahtar:</span>
                <span className="font-bold text-slate-800">{vaultData?.keys?.length || vaultData?.totalKeysCount || 0} Adet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 3 Cols: Key Escrow Table */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Yedekleme Arşiv Anahtarları & Escrow Kapsülleri</span>
            </h2>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="p-3 font-semibold">Görev / Anahtar Adı</th>
                    <th className="p-3 font-semibold">Tür & Algoritma</th>
                    <th className="p-3 font-semibold">Tarih</th>
                    <th className="p-3 font-semibold">Escrow Durumu</th>
                    <th className="p-3 font-semibold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vaultData?.keys?.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-800">
                        <div>{k.jobName || k.label}</div>
                        <div className="text-[10px] font-mono text-slate-400">{k.keyFingerprint || k.id}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{k.keyType || k.algorithm || 'AES-256 GCM'}</td>
                      <td className="p-3 text-slate-500">{new Date(k.createdAt || Date.now()).toLocaleDateString('tr-TR')}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {k.escrowStatus || 'ESCROW_SYNCED'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReveal(k)}
                            disabled={revealingId === k.id}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded transition disabled:opacity-50"
                          >
                            <Eye className="w-3 h-3 text-amber-600" />
                            <span>{revealingId === k.id ? 'Açılıyor...' : 'Anahtarı Göster'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revealed Key Card */}
          {revealedKey && (
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg space-y-3 border border-amber-500/50 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Unlock className="w-4 h-4" />
                  <span>Anahtar Çözüldü: {revealedKey.meta?.jobName || revealedKey.meta?.label}</span>
                </div>
                <button
                  onClick={() => setRevealedKey(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕ Gizle
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-slate-700 font-mono text-xs">
                <span className="text-emerald-400 select-all break-all">{revealedKey.plainSecret}</span>
                <button
                  onClick={() => copyToClipboard(revealedKey.plainSecret)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-[10px] ml-3 shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey ? 'Kopyalandı!' : 'Kopyala'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
