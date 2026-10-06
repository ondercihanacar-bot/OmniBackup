import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  HardDrive, 
  Cloud, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  Layers,
  Power
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function AirGapComplianceView() {
  const { t } = useTranslation();
  const [airGapState, setAirGapState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingDrive, setTogglingDrive] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchState = async () => {
    try {
      setLoading(true);
      const res = await api.getAirGapStatus();
      if (res && res.success) {
        setAirGapState(res);
      }
    } catch (e) {
      console.error('AirGap fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleToggleIsolation = async (drive) => {
    const isIsolated = drive.status.includes('OFFLINE') || drive.status.includes('ISOLATED');
    const newAction = isIsolated ? 'mount' : 'dismount';

    try {
      setTogglingDrive(drive.driveLetter);
      setActionNotice(null);
      const res = await api.toggleAirGapDrive({
        driveLetter: drive.driveLetter,
        action: newAction
      });
      if (res && res.success) {
        setActionNotice({ type: 'success', text: res.message });
        fetchState();
      }
    } catch (e) {
      alert('İzolasyon değiştirme hatası: ' + e.message);
    } finally {
      setTogglingDrive(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-xl shadow-md">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>Fiziksel Air-Gap İzolasyonu & S3 Yasal Kilit (Object Lock)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                True Immutable Vault
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Yedekleme bittiğinde USB/Teyp sürücülerini fiziksel/yazılımsal olarak ağdan izole edin (Air-Gap) ve AWS/Wasabi S3 depolarına yasal uyum kilidi (Compliance Lock) uygulayın.
            </p>
          </div>
        </div>

        <button
          onClick={fetchState}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-300 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Grid: Offline Air-Gap Drives & S3 Object Lock Vaults */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Physical / USB Air-Gap Rotation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-600" />
              <span>Fiziksel USB / Teyp / NAS Air-Gap Sürücüleri</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              Otomatik Dismount Aktif
            </span>
          </div>

          <div className="space-y-3">
            {airGapState?.offlineDrives?.map((d) => {
              const isIsolated = d.status.includes('OFFLINE') || d.status.includes('ISOLATED');
              return (
                <div key={d.driveLetter} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="font-mono text-amber-700">{d.driveLetter}</span>
                      <span>{d.volumeName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Son Eşitleme: {d.lastSync}</div>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold border ${
                      isIsolated 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleIsolation(d)}
                    disabled={togglingDrive === d.driveLetter}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shrink-0 ${
                      isIsolated 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isIsolated ? 'Yedekleme İçin Bağla' : 'Hemen İzole Et (Air-Gap)'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: S3 Object Lock Compliance Vaults */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-600" />
              <span>AWS S3 / Wasabi Compliance Modu (Object Lock)</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Legal Hold & WORM
            </span>
          </div>

          <div className="space-y-3">
            {airGapState?.s3ComplianceVaults?.map((v) => (
              <div key={v.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 font-mono">{v.bucketName}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-100 text-purple-800">
                    {v.mode}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-2">
                  <div>Sağlayıcı: <b>{v.provider}</b></div>
                  <div>Saklama Süresi: <b>{v.retentionPeriodYears} Yıl</b></div>
                  <div>Korunan Alan: <b>{v.totalProtectedGB} GB</b></div>
                  <div>Kilit Bitiş: <b>{new Date(v.retentionUntil).toLocaleDateString('tr-TR')}</b></div>
                </div>

                <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-[10px] text-emerald-800 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{v.lockStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
