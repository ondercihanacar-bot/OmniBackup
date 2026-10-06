import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Server, 
  Play, 
  Square, 
  Terminal, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  RefreshCw, 
  Activity,
  Layers,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function InstantVmView({ history = [] }) {
  const { t } = useTranslation();
  const [runningVMs, setRunningVMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState('');
  const [vmName, setVmName] = useState('OmniVM-DR-Sandbox');
  const [ramMB, setRamMB] = useState(4096);
  const [cpuCores, setCpuCores] = useState(2);
  const [modalOpen, setModalOpen] = useState(false);

  const loadVMs = async () => {
    try {
      const vms = await api.getInstantVms();
      setRunningVMs(vms || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadVMs();
    const interval = setInterval(loadVMs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunch = async (e) => {
    e.preventDefault();
    setIsLaunching(true);
    try {
      await api.launchInstantVm({
        backupId: selectedBackup,
        vmName,
        ramMB,
        cpuCores,
        isolatedNetwork: true
      });
      setModalOpen(false);
      await loadVMs();
    } catch (err) {
      alert("Hata: " + err.message);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleStop = async (id) => {
    if (!window.confirm("Bu anlık kurtarma sanal makinesini durdurup kapatmak istiyor musunuz?")) return;
    try {
      await api.stopInstantVm(id);
      await loadVMs();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              Anında Sanallaştırma & Acil Kurtarma (Instant VM Boot)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Yedek arşivini saatlerce geri yüklemeden doğrudan VHDX sanal diski olarak bağlayıp Hyper-V üzerinde dakikalar içinde ayağa kaldırın (Zero-Restore RTO).
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-acronis-primary px-4 py-2 text-xs flex items-center gap-2 shadow-xs font-bold uppercase bg-amber-600 hover:bg-amber-700"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Yeni Anlık VM Başlat</span>
        </button>
      </div>

      {/* Highlights Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="acronis-card p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Ortalama RTO Başlatma</div>
            <div className="text-xl font-bold text-emerald-600">38 Saniye</div>
          </div>
        </div>

        <div className="acronis-card p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0070e0] flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Aktif Çalışan VM'ler</div>
            <div className="text-xl font-bold text-slate-800">{runningVMs.length} Sanal Makine</div>
          </div>
        </div>

        <div className="acronis-card p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Sanallaştırma Platformu</div>
            <div className="text-sm font-bold text-purple-600">Hyper-V Native VHDX</div>
          </div>
        </div>

        <div className="acronis-card p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Ağ İzolasyonu</div>
            <div className="text-sm font-bold text-amber-600">İzole Sandbox (VLAN)</div>
          </div>
        </div>
      </div>

      {/* Running Instant VMs */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>Canlı Çalışan Acil Durum Sanal Makineleri</span>
        </h2>

        {runningVMs.length === 0 ? (
          <div className="acronis-card p-8 bg-white text-center space-y-3">
            <Server className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">Şu anda çalışan anlık sanal makine bulunmuyor.</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Bir sunucunuz çöktüğünde veya yedeği test etmek istediğinizde "Yeni Anlık VM Başlat" butonuyla saniyeler içinde sanal makineyi ayağa kaldırabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {runningVMs.map((vm) => (
              <div key={vm.id} className="acronis-card p-5 bg-white border border-slate-200/80 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{vm.name}</h3>
                      <div className="text-xs text-slate-500 font-mono">Kaynak: {vm.sourceBackup}</div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md ${
                    vm.status === 'RUNNING' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}>
                    {vm.status === 'RUNNING' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {vm.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <div className="text-slate-400 font-medium">RAM / vCPU:</div>
                    <div className="font-bold text-slate-700">{vm.ramAllocated} / {vm.cpuCores} Çekirdek</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Sandbox IP:</div>
                    <div className="font-bold text-slate-700 font-mono">{vm.ipAddress}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">Kazanılan RTO:</div>
                    <div className="font-bold text-emerald-600">{vm.rtoAchieved}</div>
                  </div>
                </div>

                {/* Console Log Drawer */}
                <div className="bg-slate-900 rounded-lg p-3 text-[11px] font-mono text-emerald-400 space-y-1 max-h-28 overflow-y-auto">
                  {vm.logs?.map((log, lIdx) => (
                    <div key={lIdx} className="leading-relaxed">
                      <span className="text-slate-500">&gt;</span> {log}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Çalışma Zamanı: {vm.bootTimeSeconds ? `${vm.bootTimeSeconds} sn` : 'Hesaplanıyor...'}
                  </div>

                  <button
                    onClick={() => handleStop(vm.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                    <span>VM'i Kapat & Bağlantıyı Çöz</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Launch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-800">Anında Sanallaştırma Başlatıcı</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <form onSubmit={handleLaunch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kaynak Yedek Noktası</label>
                <select
                  value={selectedBackup}
                  onChange={(e) => setSelectedBackup(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#0070e0]"
                >
                  <option value="">-- En Son Alınan Tam Sistem / SQL Yedeği --</option>
                  {history.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.jobName} ({h.size}) - {new Date(h.startTime).toLocaleDateString('tr-TR')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Sanal Makine Adı</label>
                <input
                  type="text"
                  value={vmName}
                  onChange={(e) => setVmName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#0070e0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Ayrılacak RAM (MB)</label>
                  <select
                    value={ramMB}
                    onChange={(e) => setRamMB(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#0070e0]"
                  >
                    <option value={2048}>2048 MB (2 GB)</option>
                    <option value={4096}>4096 MB (4 GB - Önerilen)</option>
                    <option value={8192}>8192 MB (8 GB)</option>
                    <option value={16384}>16384 MB (16 GB)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">vCPU Çekirdek Sayısı</label>
                  <select
                    value={cpuCores}
                    onChange={(e) => setCpuCores(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#0070e0]"
                  >
                    <option value={1}>1 vCPU</option>
                    <option value={2}>2 vCPU (Önerilen)</option>
                    <option value={4}>4 vCPU</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                ⚡ <b>Zero-Restore Teknolojisi:</b> Yedek dosyası açılmadan, anında VHDX sürücüsü olarak Windows Hyper-V katmanına bağlanır. Üretim ortamından tamamen izole sandbox VLAN ağında çalıştırılır.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLaunching}
                  className="btn-acronis-primary px-5 py-2 font-bold uppercase flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isLaunching ? 'Boot Ediliyor...' : 'Sanal Makineyi Başlat'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
