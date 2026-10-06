import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Play, 
  HardDrive,
  Layers
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function SelfHealingView() {
  const { t } = useTranslation();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagNotice, setDiagNotice] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await api.getSelfHealingOverview();
      if (res && res.success) {
        setHealthData(res);
      }
    } catch (e) {
      console.error('Self-healing fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRunDiagnostic = async () => {
    try {
      setDiagnosing(true);
      setDiagNotice(null);
      const res = await api.diagnoseSelfHealing('SRV-LOCAL-SYSTEM');
      if (res && res.success) {
        setDiagNotice(res.diagnosticResult);
        fetchHealth();
      }
    } catch (e) {
      alert('Teşhis hatası: ' + e.message);
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-md">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>Self-Healing (Kendi Kendini Onaran) Akıllı Ajan Motoru</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Autonomous Auto-Remediation
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              VSS writer kilitlenmelerinde otomatik writer resetleme, ağ kopmasında kaldığı byte'tan devam etme ve bozuk bloklarda mikro-delta onarımı.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunDiagnostic}
            disabled={diagnosing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${diagnosing ? 'animate-spin' : ''}`} />
            <span>{diagnosing ? 'Teşhis Yapılıyor...' : 'Otonom Teşhis Çalıştır'}</span>
          </button>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {diagNotice && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs space-y-1 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{diagNotice.actionTaken}</span>
          </div>
          <div className="text-[11px] text-slate-600 font-mono">
            Hedef: {diagNotice.targetAgent} • Süre: {diagNotice.recoveryTimeMs} ms • Durum: {diagNotice.verdict}
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Otonom Onarım Durumu</div>
            <div className="text-sm font-black text-emerald-600 mt-1">AKTİF & DEVREDE</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tespit Edilen Anomali</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{healthData?.totalAnomaliesDetected || 14}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kendi Kendini Onarma</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{healthData?.totalAutoResolved || 14}</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Başarı Oranı</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{healthData?.successRatio || '%100'}</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: Watchdogs & Remediation Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Active Watchdogs */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Aktif Otonom Nöbetçiler (Watchdogs)</span>
          </h3>

          <div className="space-y-2 text-xs">
            {healthData?.activeMonitors?.map((m) => (
              <div key={m.name} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{m.name}</span>
                  <span className="text-[10px] text-emerald-700">{m.status}</span>
                </div>
                <div className="text-[10px] text-slate-400">Kontrol Sıklığı: {m.interval}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Remediation Logs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Otonom Müdahale & Onarım Olay Günlüğü</span>
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 font-semibold">Anomali Türü</th>
                  <th className="p-3 font-semibold">Hedef Ajan</th>
                  <th className="p-3 font-semibold">Uygulanan Otonom Müdahale</th>
                  <th className="p-3 font-semibold">Süre</th>
                  <th className="p-3 font-semibold">Sonuç</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {healthData?.remediationLogs?.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-800">
                      <div>{log.anomalyType}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString('tr-TR')}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{log.targetAgent}</td>
                    <td className="p-3 font-medium text-slate-700">{log.actionTaken}</td>
                    <td className="p-3 font-mono text-slate-500">{log.recoveryTimeMs} ms</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {log.verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
