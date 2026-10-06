import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Search, 
  Server, 
  Database, 
  HardDrive, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Plus, 
  Play,
  ArrowRight,
  Wifi,
  Cpu
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function NetworkDiscoveryView({ onOpenDeployAgent, onOpenNewJob }) {
  const { t } = useTranslation();
  const [networkInfo, setNetworkInfo] = useState(null);
  const [hosts, setHosts] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, database, unprotected
  const [selectedSubnet, setSelectedSubnet] = useState('192.168.1');
  const [scanMessage, setScanMessage] = useState('');

  const loadNetworkInfo = async () => {
    try {
      const data = await api.getNetworkInfo();
      setNetworkInfo(data);
      if (data?.hosts) setHosts(data.hosts);
      if (data?.subnetInfo?.subnetPrefix) setSelectedSubnet(data.subnetInfo.subnetPrefix);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNetworkInfo();
  }, []);

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanMessage('Yerel ağ segmenti taranıyor (MSSQL 1433, MySQL 3306, SMB 445 portları dinleniyor)...');
    try {
      const res = await api.scanNetwork({ subnetPrefix: selectedSubnet, start: 1, end: 40 });
      if (res.hosts) {
        setHosts(res.hosts);
        setScanMessage(`Tarama tamamlandı: ${res.discoveredCount} cihaz tespit edildi.`);
      }
    } catch (e) {
      setScanMessage('Tarama hatası: ' + e.message);
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanMessage(''), 5000);
    }
  };

  const filteredHosts = hosts.filter(h => {
    if (filterType === 'database') return h.hasDatabase;
    if (filterType === 'unprotected') return !h.hasAgent;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              Yerel Ağ Radarı & Cihaz Keşfi (Subnet Auto-Discovery)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Yerel ağınızdaki (CIDR) tüm Windows/Linux sunucuları, MSSQL, MySQL veritabanlarını ve SMB paylaşımlarını otomatik keşfedin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 mr-2">Alt Ağ:</span>
            <input 
              type="text" 
              value={selectedSubnet}
              onChange={(e) => setSelectedSubnet(e.target.value)}
              className="w-24 text-xs font-mono font-bold text-slate-800 focus:outline-none"
              placeholder="192.168.1"
            />
            <span className="text-xs text-slate-400">.0/24</span>
          </div>

          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className={`btn-acronis-primary px-4 py-2 text-xs flex items-center gap-2 shadow-xs font-bold uppercase ${
              isScanning ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Ağ Taranıyor...' : 'Ağımı Şimdi Tara'}</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <Wifi className="w-4 h-4 text-blue-600 animate-bounce" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="acronis-card p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0070e0] flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Tespit Edilen Cihazlar</div>
            <div className="text-xl font-bold text-slate-800">{hosts.length} Adet</div>
          </div>
        </div>

        <div className="acronis-card p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">SQL Veritabanı Sunucusu</div>
            <div className="text-xl font-bold text-emerald-600">
              {hosts.filter(h => h.hasDatabase).length} Aktif
            </div>
          </div>
        </div>

        <div className="acronis-card p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Ajan Kurulu & Korumada</div>
            <div className="text-xl font-bold text-purple-600">
              {hosts.filter(h => h.hasAgent).length} Cihaz
            </div>
          </div>
        </div>

        <div className="acronis-card p-4 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Korumasız / Ajan Yok</div>
            <div className="text-xl font-bold text-amber-600">
              {hosts.filter(h => !h.hasAgent).length} Hedef
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'all' 
              ? 'bg-[#0070e0] text-white shadow-2xs' 
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tüm Cihazlar ({hosts.length})
        </button>

        <button
          onClick={() => setFilterType('database')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'database' 
              ? 'bg-[#0070e0] text-white shadow-2xs' 
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Veritabanı Sunucuları ({hosts.filter(h => h.hasDatabase).length})
        </button>

        <button
          onClick={() => setFilterType('unprotected')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'unprotected' 
              ? 'bg-amber-600 text-white shadow-2xs' 
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚠️ Korumasız Cihazlar ({hosts.filter(h => !h.hasAgent).length})
        </button>
      </div>

      {/* Host Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHosts.map((host, idx) => (
          <div 
            key={idx} 
            className="acronis-card p-5 bg-white border border-slate-200/80 hover:border-[#0070e0]/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    host.hasDatabase 
                      ? 'bg-blue-50 text-[#0070e0]' 
                      : host.isLocal 
                        ? 'bg-purple-50 text-purple-600' 
                        : 'bg-slate-100 text-slate-600'
                  }`}>
                    {host.hasDatabase ? <Database className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      {host.hostname}
                      {host.isLocal && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">
                          Local Host
                        </span>
                      )}
                    </h3>
                    <div className="text-xs font-mono text-slate-500">{host.ip}</div>
                  </div>
                </div>

                {host.hasAgent ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Korumada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-800 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    Ajan Yok
                  </span>
                )}
              </div>

              {/* Specs & OS */}
              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">İşletim Sistemi:</span>
                  <span className="font-semibold text-slate-800">{host.os}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Önerilen Yedek:</span>
                  <span className="font-bold text-[#0070e0]">{host.recommendedBackup}</span>
                </div>

                {/* Open Services / Ports */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-500 font-semibold block mb-1">Açık Servisler & Portlar:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {host.openServices?.map((srv, sIdx) => (
                      <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              {!host.hasAgent ? (
                <button
                  onClick={() => onOpenDeployAgent && onOpenDeployAgent(host)}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#0070e0] hover:bg-[#005bb5] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajan Dağıt & Korumaya Al</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenNewJob && onOpenNewJob()}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-blue-600" />
                  <span>Yedekleme Planı Tanımla</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
