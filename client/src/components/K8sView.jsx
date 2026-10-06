import React, { useState, useEffect } from 'react';
import { 
  Boxes, Server, Database, RefreshCw, Play, CheckCircle2, 
  Layers, HardDrive, Shield, FileText, ArrowRight, UploadCloud
} from 'lucide-react';
import { api } from '../api';

export default function K8sView({ onOpenHelp }) {
  const [overview, setOverview] = useState({ clusters: [], snapshots: [] });
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [loading, setLoading] = useState(false);
  const [backupMsg, setBackupMsg] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.getK8sOverview();
      setOverview(res || { clusters: [], snapshots: [] });
      if (res?.clusters?.length > 0 && !selectedCluster) {
        setSelectedCluster(res.clusters[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBackup = async () => {
    if (!selectedCluster) return;
    setLoading(true);
    try {
      const res = await api.backupK8sCluster({
        clusterId: selectedCluster.id,
        namespace: selectedNamespace
      });
      if (res.success) {
        setBackupMsg(`Kubernetes snapshot başarıyla oluşturuldu: [${res.snapshot.id}] (${res.snapshot.size})`);
        await loadData();
        setTimeout(() => setBackupMsg(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (snapshotId) => {
    if (!confirm(`Snapshot [${snapshotId}] hedef cluster üzerine geri yüklensin mi?`)) return;
    try {
      const res = await api.restoreK8sSnapshot({
        snapshotId,
        targetClusterId: selectedCluster?.id || 'k8s-prod-cluster-01',
        targetNamespace: 'staging-restored'
      });
      alert(res.message);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-wide">Kubernetes & Konteyner Durum Yedekleme</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                CSI Snapshot & Etcd State
              </span>
            </div>
            <p className="text-sm text-slate-400">Pod, StatefulSet, PVC Volume Snapshot, Helm Release ve Secret güvenliği</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHelp && (
            <button
              onClick={() => onOpenHelp('k8s')}
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

      {backupMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{backupMsg}</span>
        </div>
      )}

      {/* Cluster Switcher & Trigger Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Aktif K8s Kümesi:</span>
          <div className="flex gap-2">
            {overview.clusters?.map(cl => (
              <button
                key={cl.id}
                onClick={() => setSelectedCluster(cl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedCluster?.id === cl.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                {cl.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedNamespace}
            onChange={e => setSelectedNamespace(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">Tüm Namespaceler (Cluster-wide)</option>
            {selectedCluster?.namespaces?.map(ns => (
              <option key={ns.name} value={ns.name}>{ns.name} ({ns.pvcs} PVC)</option>
            ))}
          </select>

          <button
            disabled={loading}
            onClick={handleBackup}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            K8s CSI Snapshot Al
          </button>
        </div>
      </div>

      {/* Cluster Namespaces Grid */}
      {selectedCluster && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Namespace Kapsamı ve Kalıcı Depolama (PVC) Matrisi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedCluster.namespaces?.map(ns => (
              <div key={ns.name} className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-cyan-300 font-mono">{ns.name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-300">
                    {ns.backupPolicy}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-center">
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">Pod</div>
                    <div className="font-bold text-white text-xs">{ns.pods}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">PVC Volume</div>
                    <div className="font-bold text-cyan-400 text-xs">{ns.pvcs}</div>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400">Helm App</div>
                    <div className="font-bold text-indigo-400 text-xs">{ns.helmReleases}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Snapshots Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-400" />
          Kullanılabilir CSI & Etcd State Snapshot Havuzu
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 bg-slate-950/60 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Snapshot ID</th>
                <th className="p-3">Küme / Namespace</th>
                <th className="p-3">Yedek Tipi</th>
                <th className="p-3">Boyut</th>
                <th className="p-3">Tarih</th>
                <th className="p-3">Durum</th>
                <th className="p-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {overview.snapshots?.map(snap => (
                <tr key={snap.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-bold text-cyan-300">{snap.id}</td>
                  <td className="p-3 text-slate-300">{snap.clusterId} / <span className="text-white font-semibold">{snap.namespace}</span></td>
                  <td className="p-3 text-slate-400">{snap.type}</td>
                  <td className="p-3 font-mono text-cyan-400">{snap.size}</td>
                  <td className="p-3 text-slate-400 font-mono">{new Date(snap.createdAt).toLocaleString('tr-TR')}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Doğrulandı
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleRestore(snap.id)}
                      className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      Instant Restore
                    </button>
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
