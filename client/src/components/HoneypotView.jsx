import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Bug, Zap, RefreshCw, AlertTriangle, 
  FileText, CheckCircle2, Crosshair, Lock, ShieldX, Play
} from 'lucide-react';
import { api } from '../api';

export default function HoneypotView({ onOpenHelp }) {
  const [data, setData] = useState({ globalStatus: {}, decoys: [], incidents: [] });
  const [loading, setLoading] = useState(false);
  const [newDecoyPath, setNewDecoyPath] = useState('');
  const [simAlert, setSimAlert] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.getHoneypotStatus();
      setData(res || { globalStatus: {}, decoys: [], incidents: [] });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async () => {
    try {
      const res = await api.toggleHoneypotSentry(!data.globalStatus.sentryActive);
      if (res.success) {
        setData(prev => ({ ...prev, globalStatus: res.globalStatus }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!newDecoyPath.trim()) return;
    try {
      const res = await api.deployHoneypotDecoy({
        decoyPath: newDecoyPath,
        type: 'Custom SMB Enterprise Lure'
      });
      if (res.success) {
        setNewDecoyPath('');
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateAttack = async () => {
    setLoading(true);
    try {
      const res = await api.simulateHoneypotAttack();
      if (res.success) {
        setSimAlert(res.alertMessage);
        await loadData();
        setTimeout(() => setSimAlert(null), 8000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const status = data.globalStatus || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Crosshair className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-wide">Fidye Yazılımı Yem Tuzağı (Honeypot)</h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                status.sentryActive 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                  : 'bg-rose-950 text-rose-400 border-rose-800'
              }`}>
                {status.sentryActive ? 'Sentry Aktif (11ms Response)' : 'Devre Dışı'}
              </span>
            </div>
            <p className="text-sm text-slate-400">Zero-day dosya yemleri, anlık şifreleme tespiti ve milisaniyelik ağ izolasyonu</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHelp && (
            <button
              onClick={() => onOpenHelp('honeypot')}
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

      {simAlert && (
        <div className="p-4 bg-rose-950/70 border border-rose-500/50 rounded-2xl text-rose-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Fidye Saldırı Simülasyonu Yakalandı: </span>
              {simAlert}
            </div>
          </div>
          <button 
            onClick={() => setSimAlert(null)}
            className="text-xs text-rose-400 underline hover:text-rose-200"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Toplam Yem Tuzağı</span>
            <Crosshair className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{status.totalTraps || 24} Dosya</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> %100 Kurulu & İzleniyor
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Müdahale Gecikmesi</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">{status.tamperLatencyMs || 11.4} ms</div>
          <div className="text-[11px] text-slate-400 mt-1">Sürücü Filtresi Düzeyinde</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Koruma Aksiyonu</span>
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-indigo-300">{status.protectionMode || 'Auto-Isolate & Kill'}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Otomatik Karantina</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Sentry Durumu</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                status.sentryActive
                  ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {status.sentryActive ? 'Sentry Durdur' : 'Sentry Başlat'}
            </button>
          </div>
        </div>
      </div>

      {/* Attack Simulator & Deploy Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deploy Decoy */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-amber-400" />
            Ağ Paylaşımına veya Diske Yeni Yem (Lure) Dosyası Yerleştir
          </h3>
          <form onSubmit={handleDeploy} className="flex gap-2">
            <input
              type="text"
              value={newDecoyPath}
              onChange={e => setNewDecoyPath(e.target.value)}
              placeholder="Örn: C:\Shares\Finans\~$2026_Mizan_Raporu.xlsx"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Yem Oluştur
            </button>
          </form>

          {/* Active Decoys List */}
          <div className="mt-5 space-y-2">
            <div className="text-xs font-semibold text-slate-400">Aktif Nöbetçi Yem Dosyaları:</div>
            {data.decoys?.map(d => (
              <div key={d.id} className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-mono text-slate-200 truncate">{d.path}</span>
                  <span className="text-[10px] text-slate-500">({d.type})</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                  ARMED
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Attack Simulator Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-rose-400 mb-2 flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-400" />
              Saldırı Simülasyon Testi
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Zararlı yazılımın yem dosyasına dokunduğu anda sistemin 12 ms içinde süreci durdurma ve ağ kartını izole etme yeteneğini test edin.
            </p>
          </div>

          <button
            disabled={loading}
            onClick={handleSimulateAttack}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Simülasyon Çalışıyor...' : 'Fidye Saldırısı Simüle Et'}
          </button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Engellenen Tehdit ve Kurcalama (Tamper) Kayıtları
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 bg-slate-950/60 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Tarih</th>
                <th className="p-3">Hedef Yem</th>
                <th className="p-3">Zararlı Süreç (Process)</th>
                <th className="p-3">Alınan Önlem</th>
                <th className="p-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.incidents?.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-800/30">
                  <td className="p-3 text-slate-400 font-mono">{new Date(inc.timestamp).toLocaleString('tr-TR')}</td>
                  <td className="p-3 font-mono text-amber-300 truncate max-w-xs">{inc.decoyPath}</td>
                  <td className="p-3 font-mono text-rose-300 font-bold">{inc.processName}</td>
                  <td className="p-3 text-slate-300">{inc.actionTaken}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {inc.status}
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
