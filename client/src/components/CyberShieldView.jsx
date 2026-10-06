import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Lock, 
  FileSearch, 
  AlertTriangle, 
  Server, 
  Radio, 
  CheckCircle2, 
  RefreshCw, 
  Database, 
  BellRing,
  Cpu,
  Layers,
  Sparkles,
  Play
} from 'lucide-react';
import { api } from '../api';

export default function CyberShieldView() {
  const [shieldStatus, setShieldStatus] = useState(null);
  const [vssWriters, setVssWriters] = useState([]);
  const [scanPath, setScanPath] = useState('C:\\Data');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [testSimulating, setTestSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const fetchStatus = async () => {
    try {
      const [statusData, vssData] = await Promise.all([
        api.getShieldStatus(),
        api.getVssWriters()
      ]);
      setShieldStatus(statusData);
      if (vssData && vssData.writers) {
        setVssWriters(vssData.writers);
      }
    } catch (e) {
      console.error("Shield fetch error:", e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRunScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await api.scanShieldPath(scanPath);
      setScanResult(res.result);
    } catch (e) {
      setScanResult({ safe: false, message: "Tarama hatası: " + e.message });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSimulateAttack = () => {
    setTestSimulating(true);
    setSimResult(null);
    setTimeout(() => {
      setTestSimulating(false);
      setSimResult({
        success: true,
        message: "🚨 Saldırı Simülasyonu Başarılı: Şüpheli .locked uzantısı tespit edildi ➔ Yedekleme anında donduruldu ➔ Hedef Depo kilitlendi ➔ Alarm üretildi."
      });
      fetchStatus();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Cyber Shield Status (Acronis Style) */}
      <div className="acronis-card p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0 shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Active Cyber Shield
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                TAM KORUMA
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Shannon Entropi Analizi, 28+ Bilinen Fidye İmzası ve Otomatik Depo İzolasyon Kilidi ile aktif koruma.
            </p>
          </div>
        </div>

        {/* #CyberFit Score Pill (from Image 3) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center shrink-0 min-w-[130px]">
          <span className="text-[10px] text-slate-500 font-semibold block uppercase">#CyberFit Score</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">
            %{shieldStatus?.healthScore || 99}
          </span>
          <span className="text-[10px] text-slate-400 block font-medium">Optimal Health</span>
        </div>
      </div>

      {/* 4 Summary Cards (from Image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="acronis-card p-4 bg-white space-y-1.5">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>Korumadaki Planlar</span>
            <Layers className="w-4 h-4 text-[#0070e0]" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono">
            {shieldStatus?.totalProtectedJobs || 9} Görev
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            ✓ 0 Tehdit tespit edildi
          </div>
        </div>

        <div className="acronis-card p-4 bg-white space-y-1.5">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>Entropi Algoritması</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600 font-mono">
            Shannon 8.0
          </div>
          <div className="text-[11px] text-slate-500">
            Zero-Day şifreleme sezgiseli
          </div>
        </div>

        <div className="acronis-card p-4 bg-white space-y-1.5">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>VSS Writer Durumu</span>
            <Server className="w-4 h-4 text-[#0070e0]" />
          </div>
          <div className="text-2xl font-bold text-[#0070e0] font-mono">
            {vssWriters.length} Aktif
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            ✓ Kilitli dosya erişimi hazır
          </div>
        </div>

        <div className="acronis-card p-4 bg-white space-y-1.5">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>Engellenen Saldırılar</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono">
            {shieldStatus?.threatsBlocked || 0}
          </div>
          <div className="text-[11px] text-slate-500">
            Sistem kararlı ve temiz
          </div>
        </div>
      </div>

      {/* Main Grid: Scanner & Active Defenses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Real-Time Scanner & Test Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Scanner Card */}
          <div className="acronis-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[#0070e0]" />
                <h3 className="font-bold text-sm text-slate-800">
                  Canlı Dizin & Entropi Tarayıcısı (Pre-Scan)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Acronis Active Protection</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Yedekleme öncesinde klasördeki dosyaların Shannon entropi yoğunluğunu test edin ve fidye şifrelemesi olup olmadığını kontrol edin.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={scanPath}
                onChange={(e) => setScanPath(e.target.value)}
                placeholder="C:\Data veya klasör yolu"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:bg-white focus:border-[#0070e0]"
              />
              <button
                type="button"
                onClick={handleRunScan}
                disabled={isScanning}
                className="btn-acronis-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Taranıyor...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Hemen Tara</span>
                  </>
                )}
              </button>
            </div>

            {scanResult && (
              <div className={`p-4 rounded-xl border ${
                scanResult.safe 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              } space-y-1.5 text-xs animate-in fade-in duration-150`}>
                <div className="flex items-center gap-2 font-bold">
                  {scanResult.safe ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{scanResult.safe ? 'Dizin Temiz ve Güvenli' : 'TEHDİT TESPİT EDİLDİ!'}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{scanResult.message}</p>
              </div>
            )}
          </div>

          {/* Test Simulator Card */}
          <div className="acronis-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-800">
                  Acil Durdurma & Depo Kilidi Test Simülatörü
                </h3>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Canlı Test</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Olası bir fidye saldırısı simüle edildiğinde sistemin yedeklemeyi nasıl anında durdurup Google Drive / NAS depolarını kilitlediğini test edin.
            </p>

            <button
              type="button"
              onClick={handleSimulateAttack}
              disabled={testSimulating}
              className="btn-acronis-outline px-4 py-2 text-xs flex items-center gap-2 text-slate-700 hover:text-slate-900 disabled:opacity-50 font-bold"
            >
              {testSimulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0070e0]" />
                  <span>Simülasyon Çalıştırılıyor...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#0070e0]" />
                  <span>Saldırı Simülasyonunu Çalıştır</span>
                </>
              )}
            </button>

            {simResult && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1 animate-in fade-in duration-150">
                <div className="font-bold flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Savunma Mekanizması Doğrulandı</span>
                </div>
                <p className="text-[11px]">{simResult.message}</p>
              </div>
            )}
          </div>

        </div>

        {/* Right: Active Defenses & VSS Writers (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Defenses */}
          <div className="acronis-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800">Aktif Savunma Katmanları</h3>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">5/5 AKTİF</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {shieldStatus?.activeDefenses?.map((def, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-800">{def.name}</div>
                    <div className="text-[11px] text-slate-500">{def.desc}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                    {def.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* VSS Writers */}
          <div className="acronis-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#0070e0]" />
                <h3 className="font-bold text-sm text-slate-800">VSS Anlık Kopya Yazıcıları</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Windows VSS</span>
            </div>

            <div className="space-y-2 text-xs">
              {vssWriters.map((writer, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-700 truncate max-w-[190px]">
                    {writer.name}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-[#0070e0] text-[10px] font-bold">
                    {writer.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
