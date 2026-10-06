import React, { useState } from 'react';
import { 
  Server, 
  X, 
  Copy, 
  Check, 
  Terminal, 
  ShieldCheck, 
  Layers,
  Settings,
  Radar,
  RefreshCw,
  Zap,
  Globe,
  Monitor
} from 'lucide-react';
import { api } from '../api';

export default function AgentDeployModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [copiedService, setCopiedService] = useState(false);
  const [copiedDeploy, setCopiedDeploy] = useState(false);
  const [activeTab, setActiveTab] = useState('fleetScan'); // 'fleetScan', 'quick', or 'service'

  // Fleet Scanner State
  const [subnetPrefix, setSubnetPrefix] = useState('192.168.1');
  const [startIp, setStartIp] = useState(1);
  const [endIp, setEndIp] = useState(25);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [selectedMachineScript, setSelectedMachineScript] = useState(null);

  const serverUrl = window.location.origin.replace('5176', '3060');
  const powershellCommand = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-Expression (Invoke-RestMethod '${serverUrl}/agent/OmniBackup-Agent.ps1') -ServerUrl '${serverUrl}'"`;

  const serviceCommand = `powershell -ExecutionPolicy Bypass -File .\\agent\\Install-Agent-Service.ps1 -ServerUrl "${serverUrl}"`;

  const handleCopy = (text, setFn) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 3000);
  };

  const handleScanFleet = async () => {
    setScanning(true);
    try {
      const res = await api.scanFleet({
        subnet: subnetPrefix,
        start: startIp,
        end: endIp
      });
      setScanResults(res);
    } catch (e) {
      alert("Ağ tarama hatası: " + e.message);
    } finally {
      setScanning(false);
    }
  };

  const handleGetDeployScript = async (ip) => {
    try {
      const res = await api.getDeployScript(ip);
      setSelectedMachineScript(res.script);
    } catch (e) {
      alert("Script oluşturma hatası: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="enterprise-card w-full max-w-3xl p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Merkezi Ajan Dağıtım & Ağ Keşif Sihirbazı</h2>
              <p className="text-xs text-slate-400">Ağdaki bilgisayarları otomatik keşfetme ve uzaktan ajan yükleme</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('fleetScan')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'fleetScan'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Ağ Taraması & Otomatik Keşif</span>
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'quick'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hızlı Çalıştırma (1-Liner)
          </button>
          <button
            onClick={() => setActiveTab('service')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'service'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kalıcı Windows Servisi
          </button>
        </div>

        {/* Tab 1: Fleet Discovery */}
        {activeTab === 'fleetScan' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-semibold">IP Bloğu (Subnet):</span>
                  <input
                    type="text"
                    value={subnetPrefix}
                    onChange={(e) => setSubnetPrefix(e.target.value)}
                    className="w-28 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="192.168.1"
                  />
                  <span className="text-slate-500 font-mono">.x</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-300 font-semibold">Aralık:</span>
                  <input
                    type="number"
                    value={startIp}
                    onChange={(e) => setStartIp(Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-center text-xs"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    value={endIp}
                    onChange={(e) => setEndIp(Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white font-mono text-center text-xs"
                  />
                </div>

                <button
                  onClick={handleScanFleet}
                  disabled={scanning}
                  className="px-4 py-1.5 rounded-lg bg-[#0070e0] hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Radar className={`w-3.5 h-3.5 ${scanning ? 'animate-spin text-cyan-200' : ''}`} />
                  <span>{scanning ? 'Ağ Taranıyor...' : 'Ağı Şimdi Tara'}</span>
                </button>
              </div>
            </div>

            {/* Discovered Machines Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">IP Adresi</th>
                    <th className="px-3 py-2">Makine Adı & Model</th>
                    <th className="px-3 py-2">İşletim Sistemi</th>
                    <th className="px-3 py-2">Ajan Durumu</th>
                    <th className="px-3 py-2 text-right">Uzak Kurulum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {(scanResults?.machines || [
                    { ip: '127.0.0.1', hostname: 'SRV-BACKUP-MASTER', os: 'Windows Server 2022 (Bu Makine)', agentInstalled: true, agentVersion: 'v1.4.0 Live' },
                    { ip: '192.168.1.10', hostname: 'SRV-HYPERV-01', os: 'Windows Server 2022 Datacenter', agentInstalled: true, agentVersion: 'v1.4.0' },
                    { ip: '192.168.1.15', hostname: 'SRV-SQL-PROD', os: 'Windows Server 2019', agentInstalled: true, agentVersion: 'v1.4.0' },
                    { ip: '192.168.1.22', hostname: 'SRV-FILE-NAS', os: 'Windows Server 2016 (SMB Share)', agentInstalled: false, agentVersion: 'Yok' },
                    { ip: '192.168.1.45', hostname: 'MUHASEBE-PC-04', os: 'Windows 11 Pro', agentInstalled: false, agentVersion: 'Yok' }
                  ]).map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition">
                      <td className="px-3 py-2 text-cyan-400 font-bold">{m.ip}</td>
                      <td className="px-3 py-2 text-white flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.hostname}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-400">{m.os}</td>
                      <td className="px-3 py-2">
                        {m.agentInstalled ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                            ✓ Kurulu ({m.agentVersion})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold">
                            ● Ajan Yok
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => handleGetDeployScript(m.ip)}
                          className="px-2.5 py-1 rounded bg-sky-950 text-sky-300 hover:bg-sky-900 border border-sky-800 text-[11px] font-semibold transition"
                        >
                          Uzak Kur Scripti
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedMachineScript && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 text-xs">Uzak PowerShell Kurulum Scripti (WinRM / PsExec):</span>
                  <button
                    onClick={() => handleCopy(selectedMachineScript, setCopiedDeploy)}
                    className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1"
                  >
                    {copiedDeploy ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDeploy ? 'Kopyalandı!' : 'Komutu Kopyala'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded bg-black text-emerald-400 text-[10px] font-mono overflow-x-auto max-h-32">
                  {selectedMachineScript}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Quick Command */}
        {activeTab === 'quick' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Tek Satır PowerShell Komutu:</span>
                </span>
                <button
                  onClick={() => handleCopy(powershellCommand, setCopied)}
                  className="px-3 py-1.5 rounded-lg bg-[#0070e0] hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 transition text-xs shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 break-all select-all leading-relaxed">
                {powershellCommand}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2 text-slate-400">
              <h4 className="font-semibold text-slate-300">Komutun Gerçekleştirdiği İşlemler:</h4>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Hedef makinede Windows PowerShell ortamını başlatır.</li>
                <li>Merkezi sunucudan (<span className="text-sky-400">{serverUrl}</span>) ajan betiğini indirir.</li>
                <li>Ajan servisini başlatır, sistem donanım durumunu (CPU, RAM, Disk) merkeze bildirir.</li>
                <li>VSS Snapshot motoru ve şifreleme modüllerini devreye sokar.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Permanent Service */}
        {activeTab === 'service' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Windows Service Yükleme Komutu:</span>
                </span>
                <button
                  onClick={() => handleCopy(serviceCommand, setCopiedService)}
                  className="px-3 py-1.5 rounded-lg bg-[#0070e0] hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 transition text-xs shadow-xs"
                >
                  {copiedService ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedService ? 'Kopyalandı!' : 'Kopyala'}</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-sky-400 break-all select-all leading-relaxed">
                {serviceCommand}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2 text-slate-400">
              <h4 className="font-semibold text-slate-300">Windows Servis Modunun Avantajları:</h4>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Kullanıcı oturumu kapalı olsa dahi arka planda kesintisiz çalışır.</li>
                <li>Sistem yeniden başladığında otomatik olarak <span className="text-emerald-400">Automatic (Delayed Start)</span> olarak açılır.</li>
                <li>Windows VSS API'lerine tam yönetici yetkileriyle erişim sağlar.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-500">OmniBackup Enterprise Fleet v1.4.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
