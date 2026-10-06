import React, { useState, useEffect } from 'react';
import { 
  Network, Wifi, Gauge, RefreshCw, CheckCircle2, Sliders, 
  Trash2, ShieldCheck, ArrowRight, FileText, Zap, Globe, TrendingUp, Database
} from 'lucide-react';
import { api } from '../api';

export default function WanAcceleratorView({ onOpenHelp }) {
  const [data, setData] = useState({ config: {}, stats: {}, tunnels: [] });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [configForm, setConfigForm] = useState({
    businessHoursLimitMbps: 25,
    offHoursLimitMbps: 1000,
    tcpStreamsCount: 8,
    enabled: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.getWanStatus();
      setData(res || { config: {}, stats: {}, tunnels: [] });
      if (res?.config) {
        setConfigForm(res.config);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.updateWanConfig(configForm);
      if (res.success) {
        setSaveSuccess(true);
        await loadData();
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeCache = async () => {
    if (!confirm('WAN Global Deduplication Cache temizlensin mi?')) return;
    try {
      const res = await api.purgeWanCache();
      alert(res.message);
      await loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  const stats = data.stats || {};
  const config = data.config || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-wide">WAN Hızlandırıcı & Trafik QoS Sınırlama</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Multi-Stream TCP & WAN Dedupe
              </span>
            </div>
            <p className="text-sm text-slate-400">Mesai saatleri bant genişliği sınırlama, TCP window scaling ve paket sıkıştırma</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHelp && (
            <button
              onClick={() => onOpenHelp('wanAccelerator')}
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

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>WAN Hızlandırıcı ve QoS kuralları başarıyla güncellendi!</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>WAN Trafik Tasarrufu</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.wanReductionRatio || '4.82x'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Deduplikasyon & Zstandard</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Anlık WAN Hızı</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">{stats.currentThroughputMbps || 18.4} Mbps</div>
          <div className="text-[11px] text-emerald-400 mt-1">Mesai İçi Kotası Altında</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Aktif Senkron Tünelleri</span>
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.activeSyncTunnels || 4} Tünel</div>
          <div className="text-[11px] text-indigo-300 mt-1">8 Multi-Stream TCP</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>WAN Parmak İzi Önbelleği</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{config.usedWanCacheGb || 34.2} / {config.wanCacheSizeGb || 100} GB</div>
          <div className="text-[11px] text-slate-400 mt-1">Global Fingerprint Cache</div>
        </div>
      </div>

      {/* QoS Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Mesai Saatleri & QoS Bant Genişliği Politikası
          </h3>
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Mesai İçi Maks. Hız (08:00 - 18:00):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={configForm.businessHoursLimitMbps || 25}
                    onChange={e => setConfigForm({ ...configForm, businessHoursLimitMbps: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-xs text-slate-400 font-mono">Mbps</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Mesai Dışı Maks. Hız (18:00 - 08:00):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={configForm.offHoursLimitMbps || 1000}
                    onChange={e => setConfigForm({ ...configForm, offHoursLimitMbps: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-xs text-slate-400 font-mono">Mbps</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Eşzamanlı TCP Akış Sayısı (Multi-Stream):</label>
                <select
                  value={configForm.tcpStreamsCount || 8}
                  onChange={e => setConfigForm({ ...configForm, tcpStreamsCount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value={4}>4 Paralel TCP Akışı</option>
                  <option value={8}>8 Paralel TCP Akışı (Önerilen)</option>
                  <option value={16}>16 Paralel TCP Akışı (Yüksek Bant)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.enabled !== false}
                    onChange={e => setConfigForm({ ...configForm, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-cyan-600 bg-slate-950 border-slate-700"
                  />
                  <span>WAN Hızlandırma & QoS Sınırlayıcı Aktif</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Politikayı Kaydet & Uygula
              </button>
            </div>
          </form>
        </div>

        {/* Cache Maintenance */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              WAN Global Önbellek Yönetimi
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Uzak ofisler ve bulut hedefleri arasındaki veri blok parmak izlerini depolar. Bu sayede aynı dosya bloğu WAN hattından bir kez geçer.
            </p>
          </div>

          <button
            onClick={handlePurgeCache}
            className="w-full py-2.5 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            WAN Önbelleğini Sıfırla
          </button>
        </div>
      </div>

      {/* Tunnels Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          Aktif WAN Hızlandırılmış Replikasyon Tünelleri
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 bg-slate-950/60 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Tünel Adı</th>
                <th className="p-3">Kaynak / Hedef IP</th>
                <th className="p-3">Gecikme (RTT)</th>
                <th className="p-3">Anlık Hız</th>
                <th className="p-3">TCP Akışları</th>
                <th className="p-3">Sıkıştırma Oranı</th>
                <th className="p-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.tunnels?.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-semibold text-white">{t.name}</td>
                  <td className="p-3 font-mono text-slate-400">{t.sourceIp} &rarr; {t.destIp}</td>
                  <td className="p-3 font-mono text-cyan-300">{t.latencyMs} ms</td>
                  <td className="p-3 font-mono text-emerald-400 font-bold">{t.currentSpeed}</td>
                  <td className="p-3 font-mono text-slate-300">{t.streams} Streams</td>
                  <td className="p-3 font-mono text-indigo-300 font-bold">{t.compressionRatio}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {t.status}
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
