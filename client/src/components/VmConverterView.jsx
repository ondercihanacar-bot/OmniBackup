import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Server, 
  Play, 
  Download, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Cloud, 
  Cpu, 
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function VmConverterView() {
  const { t } = useTranslation();
  const [formats, setFormats] = useState([]);
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('VHDX (Microsoft Hyper-V)');
  const [selectedSource, setSelectedSource] = useState('SRV-MSSQL-PROD');
  const [injectDrivers, setInjectDrivers] = useState(true);
  const [compression, setCompression] = useState(true);
  const [lastResult, setLastResult] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fmtRes, listRes] = await Promise.all([
        api.getVmConverterFormats(),
        api.getVmConversions()
      ]);
      if (fmtRes && fmtRes.formats) setFormats(fmtRes.formats);
      if (listRes && listRes.conversions) setConversions(listRes.conversions);
    } catch (e) {
      console.error('VM Converter fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartConversion = async () => {
    try {
      setConverting(true);
      setLastResult(null);
      const res = await api.startVmConversion({
        sourceBackupId: selectedSource,
        targetFormat: selectedFormat,
        injectCloudDrivers: injectDrivers,
        compression
      });
      if (res && res.success) {
        setLastResult(res.conversion);
        fetchData();
      }
    } catch (e) {
      alert('Dönüştürme hatası: ' + e.message);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl shadow-md">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>Cross-Platform Sanallaştırma & Bulut Dönüştürücü (P2V / V2V / V2C)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                Universal Hypervisor Bridge
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fiziksel veya sanal yedekleri tek tıkla VMware ESXi (VMDK), Hyper-V (VHDX), Proxmox VE (QCOW2) ve AWS EC2 AMI bulut formatına dönüştürün.
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-300 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {lastResult && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs space-y-1 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sanal Makine İmajı Başarıyla Oluşturuldu! ({lastResult.targetFormat})</span>
          </div>
          <div className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-emerald-200 break-all">
            📁 Çıktı Dosyası: {lastResult.outputFile}
          </div>
        </div>
      )}

      {/* Grid: Conversion Wizard & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Conversion Wizard */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>Yeni Format Dönüştürme Görevi</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Kaynak Yedek İmajı</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-semibold"
              >
                <option value="SRV-MSSQL-PROD">🖥️ SRV-MSSQL-PROD (Windows Server 2022 Disk)</option>
                <option value="SRV-APP-LINUX">🐧 SRV-APP-LINUX (Ubuntu 22.04 LTS Disk)</option>
                <option value="DESKTOP-FINANS">💻 DESKTOP-FINANS (Windows 11 Pro C:\)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Hedef Hipervizör / Bulut Formatı</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-bold text-purple-900"
              >
                <option value="VHDX (Microsoft Hyper-V)">Microsoft Hyper-V Gen2 (.vhdx)</option>
                <option value="VMDK (VMware ESXi 8.0)">VMware ESXi / vSphere 8.0 (.vmdk)</option>
                <option value="QCOW2 (Proxmox VE / KVM)">Proxmox VE / KVM / OpenStack (.qcow2)</option>
                <option value="AWS EC2 AMI Cloud">Amazon AWS EC2 AMI Cloud Bundle (.json + .raw)</option>
                <option value="RAW Sector Image">Ham Sektör İmajı (.raw)</option>
              </select>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
              <label className="flex items-center gap-2 font-semibold text-purple-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={injectDrivers}
                  onChange={(e) => setInjectDrivers(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>VirtIO & Hypervisor Sürücülerini Otomatik Enjekte Et</span>
              </label>
              <label className="flex items-center gap-2 font-semibold text-purple-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={compression}
                  onChange={(e) => setCompression(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Zstandard (ZSTD) Thin-Provisioned Sıkıştırma</span>
              </label>
            </div>

            <button
              onClick={handleStartConversion}
              disabled={converting}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold rounded-lg shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${converting ? 'animate-spin' : ''}`} />
              <span>{converting ? 'Dönüştürülüyor...' : 'Format Dönüşümünü Başlat'}</span>
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Conversion Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Oluşturulan Sanal Makine İmajları & Dışa Aktarımlar</span>
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 font-semibold">Kaynak Sunucu</th>
                  <th className="p-3 font-semibold">Hedef Format</th>
                  <th className="p-3 font-semibold">Boyut</th>
                  <th className="p-3 font-semibold">Durum</th>
                  <th className="p-3 font-semibold">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {conversions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-800">
                      <div>{c.sourceBackup}</div>
                      <div className="text-[10px] font-mono text-slate-400">{c.outputFile}</div>
                    </td>
                    <td className="p-3 font-bold text-purple-700">{c.targetFormat}</td>
                    <td className="p-3 font-semibold text-slate-700">{c.diskSizeGB} GB</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(c.createdDate).toLocaleDateString('tr-TR')}</td>
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
