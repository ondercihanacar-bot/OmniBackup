import React, { useState, useEffect } from 'react';
import { 
  Disc, 
  Usb, 
  HardDrive, 
  Server, 
  Download, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function BareMetalRescueView() {
  const { t } = useTranslation();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [targetType, setTargetType] = useState('iso');
  const [targetDrive, setTargetDrive] = useState('E:');
  const [includeDrivers, setIncludeDrivers] = useState(true);
  const [architecture, setArchitecture] = useState('x64');
  const [genResult, setGenResult] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getBareMetalStatus();
      if (res && res.success) {
        setStatusData(res);
      }
    } catch (e) {
      console.error('BMR status error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setGenResult(null);
      const res = await api.createRescueMedia({
        targetType,
        targetDrive,
        includeDrivers,
        architecture
      });
      setGenResult(res);
      fetchStatus();
    } catch (e) {
      alert('Medya oluşturma hatası: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-xl shadow-md">
            <Disc className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>Bare-Metal Disaster Recovery & WinPE Kurtarma Medyası</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                BMR Engine v2.4
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              İşletim sistemi çökmelerinde sıfır donanım üzerine tam sistem imajını dakikalar içinde geri yükleyen önyüklenebilir (Bootable) WinPE ISO/USB ortamı oluşturucu.
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-300 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* Grid: Creator & Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: WinPE Media Creator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Usb className="w-5 h-5 text-indigo-600" />
              <span>Kurtarma Medyası Yapılandır & Oluştur</span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Hedef Medya Tipi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType('iso')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold transition ${
                        targetType === 'iso' 
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Disc className="w-4 h-4" />
                      <span>Bootable ISO İmajı</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType('usb')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold transition ${
                        targetType === 'usb' 
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Usb className="w-4 h-4" />
                      <span>Doğrudan USB Bellek</span>
                    </button>
                  </div>
                </div>

                {targetType === 'usb' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Hedef USB Sürücüsü</label>
                    <input
                      type="text"
                      value={targetDrive}
                      onChange={(e) => setTargetDrive(e.target.value)}
                      placeholder="E: veya F:"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Hedef Mimari</label>
                    <select
                      value={architecture}
                      onChange={(e) => setArchitecture(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                    >
                      <option value="x64">UEFI x64 (Tüm Modern Sunucu ve PC'ler)</option>
                      <option value="x86">Legacy BIOS x86</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDrivers}
                    onChange={(e) => setIncludeDrivers(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>RAID / NVMe / 10GbE Ağ Sürücü Paketlerini Otomatik Enjekte Et (Önerilen)</span>
                </label>
                <p className="text-[11px] text-slate-500 pl-5">
                  MegaRAID, PERC, Intel VROC, Broadcom ve Intel 10G/25G ağ adaptörü sürücüleri WinPE kurtarma ortamına gömülür.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>WinPE Ortamı Hazırlanıyor...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Önyüklenebilir Medyayı Derle</span>
                    </>
                  )}
                </button>
              </div>

              {genResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{genResult.message}</span>
                  </div>
                  {genResult.isoPath && (
                    <div className="bg-white p-2.5 rounded border border-emerald-200 text-[11px] font-mono text-slate-700 break-all">
                      📁 İmaj Konumu: {genResult.isoPath}
                    </div>
                  )}
                  {genResult.scriptSnippet && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-600">Oluşturulan Otomatik Başlatma Betiği:</span>
                      <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded text-[10px] font-mono overflow-x-auto mt-1">
                        {genResult.scriptSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bare-metal Restore Step Wizard Guide */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Sıfır Donanıma Geri Yükleme Prosedürü (BMR Playbook)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-indigo-700 mb-1">1. USB / ISO ile Başlat</div>
                <p className="text-[11px] text-slate-600">Hedef sunucu/PC'yi oluşturulan WinPE medyası ile boot edin. Ağ kartları ve RAID otomatik tanınır.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-indigo-700 mb-1">2. OmniBackup Ajanı Açılır</div>
                <p className="text-[11px] text-slate-600">WinPE konsolu açılır ve merkezi sunucudaki WORM korumalı imajları listeler.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-bold text-indigo-700 mb-1">3. Diskleri Bölümle ve Aç</div>
                <p className="text-[11px] text-slate-600">EFI, MBR, C: ve veri diskleri orijinal sektör yapısıyla yeni disklere klonlanır.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Status & Snapshots */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>BMR Çevre Durumu</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">WinPE Çekirdeği:</span>
                <span className="font-bold text-slate-800">{statusData?.winPeEngine || 'WinPE 10.0 (x64)'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">NVMe/RAID Sürücüleri:</span>
                <span className="font-bold text-emerald-600">Entegre (24 Paket)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Son Derleme:</span>
                <span className="font-bold text-slate-700">
                  {statusData?.lastGenerated ? new Date(statusData.lastGenerated).toLocaleString('tr-TR') : 'Henüz Derlenmedi'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              <span>Kullanılabilir Sistem İmajları ({statusData?.bootableSnapshots?.length || 0})</span>
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {statusData?.bootableSnapshots?.map((snap) => (
                <div key={snap.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{snap.server}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                      {snap.size}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{snap.os}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Yedek: {new Date(snap.timestamp).toLocaleDateString('tr-TR')}</span>
                    <span className="text-emerald-600 font-semibold">{snap.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
