import React, { useState, useEffect } from 'react';
import { 
  Zap, HardDrive, RefreshCw, Layers, CheckCircle2, 
  TrendingUp, FileText, ArrowRight, Gauge, Database
} from 'lucide-react';
import { api } from '../api';

export default function SyntheticCloneView({ onOpenHelp }) {
  const [data, setData] = useState({ volumes: [], recentSyntheticJobs: [] });
  const [loading, setLoading] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [selectedVolId, setSelectedVolId] = useState('vol-refs-d');
  const [testVmSize, setTestVmSize] = useState(500);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.getSyntheticOverview();
      setData(res || { volumes: [], recentSyntheticJobs: [] });
    } catch (e) {
      console.error(e);
    }
  };

  const handleBenchmark = async () => {
    setLoading(true);
    try {
      const res = await api.benchmarkSyntheticClone({
        volumeId: selectedVolId,
        vmSizeGb: testVmSize
      });
      if (res.success) {
        setBenchmarkResult(res);
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-wide">ReFS / Btrfs Sentetik Hızlı Klonlama (Fast-Clone)</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                FSCTL_DUPLICATE_EXTENTS Ready
              </span>
            </div>
            <p className="text-sm text-slate-400">Pointer tabanlı 3 saniyede tam sentetik yedek oluşturma ve %0 ek disk alanı tüketimi</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHelp && (
            <button
              onClick={() => onOpenHelp('syntheticClone')}
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

      {benchmarkResult && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold">Fast-Clone Sentetik Test Tamamlandı: </span>
              {benchmarkResult.job.logicalBackupSize} veri {benchmarkResult.job.durationSeconds} saniyede klonlandı ({benchmarkResult.speedupFactor}).
            </div>
          </div>
          <button 
            onClick={() => setBenchmarkResult(null)}
            className="text-xs text-emerald-400 underline hover:text-emerald-200"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Volumes Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.volumes?.map(v => (
          <div 
            key={v.id} 
            className={`p-5 rounded-2xl border transition-all ${
              v.blockCloningSupport 
                ? 'bg-slate-900/70 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                : 'bg-slate-900/40 border-slate-800 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HardDrive className={`w-5 h-5 ${v.blockCloningSupport ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="font-bold text-base text-white">{v.driveLetter}</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                v.blockCloningSupport 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {v.blockCloningSupport ? 'Fast-Clone Aktif' : 'Standart Kopyalama'}
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-300 mb-3">{v.filesystem}</div>

            <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <div className="flex justify-between">
                <span>Fiziksel Kullanım:</span>
                <span className="font-mono text-slate-200">{v.usedPhysical} / {v.totalCapacity}</span>
              </div>
              <div className="flex justify-between">
                <span>Mantıksal Yedek Verisi:</span>
                <span className="font-mono text-cyan-300 font-bold">{v.logicalBackupVolume}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasarruf Oranı (Dedupe/Reflink):</span>
                <span className="font-mono text-emerald-400 font-bold">{v.savedSpaceRatio}</span>
              </div>
              <div className="flex justify-between">
                <span>Ortalama Sentetik Birleştirme:</span>
                <span className="font-mono text-amber-300 font-bold">{v.avgCloneDurationSec} sn</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Benchmark Control Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-emerald-400" />
          Sentetik Hızlı Klonlama Performans Testi (Benchmark)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          FSCTL_DUPLICATE_EXTENTS_TO_FILE API çağrısıyla diskten diske fiziksel veri kopyalamadan, yalnızca pointer eşlemesi yaparak tam sentetik yedek oluşturma hızını ölçün.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Hedef Depo Havuzu:</label>
            <select
              value={selectedVolId}
              onChange={e => setSelectedVolId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              {data.volumes?.map(v => (
                <option key={v.id} value={v.id}>{v.driveLetter} - {v.filesystem}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Simüle Edilen VM Boyutu:</label>
            <select
              value={testVmSize}
              onChange={e => setTestVmSize(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value={100}>100 GB Sanal Makine</option>
              <option value={500}>500 GB Sanal Makine</option>
              <option value={2000}>2.0 TB Sanal Makine</option>
              <option value={5000}>5.0 TB Sanal Makine</option>
            </select>
          </div>

          <div className="self-end">
            <button
              disabled={loading}
              onClick={handleBenchmark}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Sentetik Klon Testi Başlat (3 Saniye)
            </button>
          </div>
        </div>
      </div>

      {/* Jobs History Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Son Sentetik Fast-Clone Görev Kayıtları
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 bg-slate-950/60 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Görev ID</th>
                <th className="p-3">Hedef Depo</th>
                <th className="p-3">Kaynak İş Yükü</th>
                <th className="p-3">Sentetik Boyut</th>
                <th className="p-3">Diske Yazılan Fiziksel</th>
                <th className="p-3">Tamamlanma Süresi</th>
                <th className="p-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.recentSyntheticJobs?.map(job => (
                <tr key={job.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-bold text-cyan-300">{job.id}</td>
                  <td className="p-3 text-slate-300">{job.volume}</td>
                  <td className="p-3 font-semibold text-white">{job.sourceVm}</td>
                  <td className="p-3 font-mono text-cyan-400 font-bold">{job.logicalBackupSize}</td>
                  <td className="p-3 font-mono text-emerald-400">{job.physicalBytesWritten}</td>
                  <td className="p-3 font-mono font-bold text-amber-300">{job.durationSeconds} sn</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {job.status}
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
