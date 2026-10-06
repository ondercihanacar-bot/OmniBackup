import React, { useState, useEffect } from 'react';
import { 
  Flame, Play, CheckCircle2, AlertTriangle, ShieldCheck, 
  Layers, RefreshCw, Server, ArrowRight, Activity, Clock, FileText, Check
} from 'lucide-react';
import { api } from '../api';

export default function DrRunbookView({ onOpenHelp }) {
  const [data, setData] = useState({ runbooks: [], executionHistory: [] });
  const [loading, setLoading] = useState(false);
  const [activeExec, setActiveExec] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.getDrRunbooks();
      setData(res || { runbooks: [], executionHistory: [] });
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecute = async (runbookId, mode) => {
    setLoading(true);
    try {
      const res = await api.executeDrRunbook({ runbookId, mode });
      if (res.success) {
        setActiveExec(res.execution);
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-wide">1-Click DR Runbook & Site Failover</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                Zero-Downtime Orchestrator
              </span>
            </div>
            <p className="text-sm text-slate-400">Boot Dependency (AD -&gt; DB -&gt; App), DNS re-IP orkestrasyonu ve tatbikat denetimleri</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHelp && (
            <button
              onClick={() => onOpenHelp('drRunbook')}
              className="px-3 py-2 text-xs font-medium text-cyan-400 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800/60 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Sekme Kılavuzu
            </button>
          )}
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeExec && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold">Çalıştırma Başarılı: </span>
              {activeExec.runbookName} ({activeExec.mode}) - RTO Süresi: {activeExec.rto}
            </div>
          </div>
          <button 
            onClick={() => setActiveExec(null)}
            className="text-xs text-emerald-400 underline hover:text-emerald-200"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Runbooks Cards */}
      <div className="grid grid-cols-1 gap-6">
        {data.runbooks?.map(rb => (
          <div key={rb.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{rb.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Hedef: {rb.targetSite}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{rb.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled={loading}
                  onClick={() => handleExecute(rb.id, 'drill')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Tatbikat Çalıştır (Drill)
                </button>
                <button
                  disabled={loading}
                  onClick={() => {
                    if (confirm(`DİKKAT: '${rb.name}' için CANLI FAILOVER başlatılsın mı? Üretim trafiği DR sahasına aktarılacaktır.`)) {
                      handleExecute(rb.id, 'live');
                    }
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  1-Click Live Failover
                </button>
              </div>
            </div>

            {/* Boot Dependency Sequence Steps */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Sıralı Boot & Servis Başlatma Adımları (Boot Dependency)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {rb.steps?.map((step, idx) => (
                  <div key={step.id} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">{step.tier}</span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {step.duration}
                      </span>
                    </div>
                    <div className="font-medium text-slate-200">{step.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 pt-1">
                      <Check className="w-3 h-3" /> Doğrulandı & Hazır
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drill Metrics Bar */}
            <div className="mt-5 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span>Son Tatbikat: <strong className="text-slate-200">{new Date(rb.lastDrill).toLocaleDateString('tr-TR')}</strong></span>
                <span>Durum: <strong className="text-emerald-400">{rb.lastDrillStatus}</strong></span>
              </div>
              <div>
                Tahmini Toplam RTO: <strong className="font-mono text-cyan-400">{Math.floor(rb.estimatedRtoSeconds / 60)}m {rb.estimatedRtoSeconds % 60}s</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Execution History */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Geçmiş Failover & Tatbikat Denetim Kayıtları
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 bg-slate-950/60 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Runbook</th>
                <th className="p-3">Mod</th>
                <th className="p-3">Başlangıç</th>
                <th className="p-3">Erişilen RTO</th>
                <th className="p-3">Operatör</th>
                <th className="p-3">Sonuç</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.executionHistory?.map(ex => (
                <tr key={ex.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-semibold text-white">{ex.runbookName || ex.runbookId}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ex.mode.includes('CANLI') ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}>
                      {ex.mode}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 font-mono">{new Date(ex.startedAt).toLocaleString('tr-TR')}</td>
                  <td className="p-3 font-mono font-bold text-cyan-300">{ex.rto}</td>
                  <td className="p-3 text-slate-400">{ex.operator}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {ex.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
