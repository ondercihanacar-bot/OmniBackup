import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  AlertCircle, 
  HardDrive, 
  Server, 
  Cloud, 
  ArrowRight, 
  ShieldCheck, 
  Plus, 
  Play, 
  Download, 
  Send,
  MoreVertical,
  Activity,
  Database,
  Sparkles,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { api } from '../api';

export default function DashboardView({ 
  stats, 
  jobs, 
  agents, 
  history, 
  onRunJob, 
  onOpenNewJob, 
  onOpenDeployAgent,
  setActiveTab 
}) {
  const [aiForecast, setAiForecast] = useState(null);

  useEffect(() => {
    async function loadForecast() {
      try {
        const res = await api.getAiForecastMetrics();
        if (res && res.success) {
          setAiForecast(res.forecast);
        }
      } catch (e) {
        // fallback
      }
    }
    loadForecast();
  }, []);
  const protectedCount = jobs?.length || 9;
  const okCount = jobs?.filter(j => j.status !== 'failed')?.length || 8;
  const errorCount = jobs?.filter(j => j.status === 'failed')?.length || 1;

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar (from Image 1: Send, Download, + Add widget) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Genel Sistem Durumu</span>
          <span>•</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Tüm Servisler Çalışıyor
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button 
            onClick={() => setActiveTab('cyberShield')}
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium px-2.5 py-1 rounded hover:bg-slate-200/60 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Siber Kalkan</span>
          </button>
          
          <button 
            onClick={onOpenNewJob}
            className="btn-acronis-primary px-3 py-1.5 flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Plan Ekle</span>
          </button>
        </div>
      </div>

      {/* Visual Backup Flow Bar (from Image 5: Source ➔ Arrow ➔ Cloud) */}
      <div className="acronis-card p-5 bg-white space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
          {/* Source Graphic */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-24 h-16 rounded-xl bg-slate-100 border border-slate-300 flex flex-col items-center justify-center p-2 shadow-xs">
              <Server className="w-8 h-8 text-[#0070e0]" />
              <div className="w-16 h-1 bg-slate-300 rounded-full mt-1" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 block">Yerel Sunucu & SQL</span>
              <span className="text-xs text-slate-500">C:\Data & MSSQLSERVER</span>
            </div>
          </div>

          {/* Connected Green Check Arrow */}
          <div className="flex flex-col items-center space-y-1">
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-12 border-t-2 border-dashed border-emerald-500" />
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="w-12 border-t-2 border-dashed border-emerald-500" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">Sürekli Koruma (Active)</span>
          </div>

          {/* Cloud Target Graphic */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-24 h-16 rounded-xl bg-sky-50 border border-sky-200 flex flex-col items-center justify-center p-2 shadow-xs">
              <Cloud className="w-8 h-8 text-[#0070e0]" />
              <span className="text-[9px] font-bold text-[#0070e0] mt-0.5">CLOUD</span>
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 block">Google Drive & NAS</span>
              <span className="text-xs text-slate-500">7.11 GB / 15 GB Boş</span>
            </div>
          </div>
        </div>

        {/* Breakdown Storage Bar (from Image 5) */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Yedeklenen Veri Türü Dağılımı</span>
            <span className="font-mono text-slate-700 font-bold">Toplam: {stats?.totalProtectedSize || "7.11 GB"}</span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
            <div style={{ width: '45%' }} className="bg-[#0070e0]" title="SQL Veritabanları (45%)" />
            <div style={{ width: '25%' }} className="bg-emerald-500" title="Belgeler & Dosyalar (25%)" />
            <div style={{ width: '18%' }} className="bg-amber-500" title="Sistem İmajı (18%)" />
            <div style={{ width: '12%' }} className="bg-purple-500" title="Diğer (12%)" />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0070e0]" /> SQL DB (3.2 GB)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Belgeler (1.8 GB)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Sistem (1.3 GB)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> Diğer (810 MB)</span>
          </div>
        </div>
      </div>

      {/* 6 Grid Widget Cards (Exact Replica of Acronis Image 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: PROTECTION STATUS (Image 1 - Top Left) */}
        <div className="acronis-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">PROTECTION STATUS</h3>
              <span className="text-[11px] text-slate-400">Group: All</span>
            </div>
          </div>

          <div className="flex items-center justify-around py-2">
            {/* Donut Chart */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3.8"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.8"
                  strokeDasharray="92, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.8"
                  strokeDasharray="8, 100"
                  strokeDashoffset="-92"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-extrabold text-slate-800 block leading-tight">{protectedCount}</span>
                <span className="text-[10px] text-slate-500 font-medium">Protected</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <div>
                  <span className="text-slate-500 text-[11px] block">OK</span>
                  <span className="font-bold text-slate-800">{okCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <div>
                  <span className="text-slate-500 text-[11px] block">Warning</span>
                  <span className="font-bold text-slate-800">1</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                <div>
                  <span className="text-slate-500 text-[11px] block">Critical</span>
                  <span className="font-bold text-slate-800">{errorCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: STORAGE (Image 1 - Top Center) */}
        <div className="acronis-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">STORAGE</h3>
              <span className="text-[11px] text-[#0070e0]">Location: Google Drive Cloud</span>
            </div>
          </div>

          <div className="flex items-center justify-around py-2">
            {/* Donut Chart */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3.8"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#0070e0"
                  strokeWidth="3.8"
                  strokeDasharray="60, 100"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-extrabold text-slate-800 block leading-tight">15.0 GB</span>
                <span className="text-[9px] text-slate-500">Total space</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-[#0070e0] rounded-full" />
                <div>
                  <span className="text-slate-500 text-[10px] block">Backups</span>
                  <span className="font-bold text-slate-800">7.11 GB</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-sky-300 rounded-full" />
                <div>
                  <span className="text-slate-500 text-[10px] block">Other files</span>
                  <span className="font-bold text-slate-800">2.10 GB</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-slate-300 rounded-full" />
                <div>
                  <span className="text-slate-500 text-[10px] block">Free space</span>
                  <span className="font-bold text-slate-800">5.79 GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: ACTIVITIES (Image 1 - Top Right) */}
        <div className="acronis-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">ACTIVITIES (HAFTALIK)</h3>
              <span className="text-[11px] text-slate-400">Group: All</span>
            </div>
          </div>

          {/* Bar Chart Simulation */}
          <div className="h-28 flex items-end justify-around gap-2 pt-4 px-2">
            {[
              { day: 'Cts', green: 80, yellow: 10, red: 10 },
              { day: 'Pzt', green: 90, yellow: 5, red: 5 },
              { day: 'Çar', green: 85, yellow: 15, red: 0 },
              { day: 'Cum', green: 95, yellow: 0, red: 5 }
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-full max-w-[20px] rounded flex flex-col justify-end overflow-hidden h-20 bg-slate-100">
                  <div style={{ height: `${col.red}%` }} className="bg-rose-500 w-full" />
                  <div style={{ height: `${col.yellow}%` }} className="bg-amber-500 w-full" />
                  <div style={{ height: `${col.green}%` }} className="bg-emerald-500 w-full" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{col.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-medium pt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Başarılı</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Uyarı</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Hata</span>
          </div>
        </div>

        {/* Card 4: ACTIVE ALERTS (Image 1 - Bottom Left) */}
        <div className="acronis-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">ACTIVE ALERTS</h3>
            <span className="text-[11px] text-[#0070e0] font-medium cursor-pointer">Tüm Uyarılar (5)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
              <span className="font-medium text-slate-700 truncate max-w-[170px]">SRV-MSSQL-PROD</span>
              <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Validation Pending
              </span>
            </div>

            <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
              <span className="font-medium text-slate-700 truncate max-w-[170px]">Linux-Backup-Agent</span>
              <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Validation Warning
              </span>
            </div>

            <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-200/80 flex items-center justify-between">
              <span className="font-medium text-slate-700 truncate max-w-[170px]">Win10-Client-04</span>
              <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Offline Disk
              </span>
            </div>
          </div>

          <div className="text-center pt-1">
            <button onClick={() => setActiveTab('logs')} className="text-xs text-[#0070e0] font-medium hover:underline">
              Tüm Olay Günlüklerini Gör →
            </button>
          </div>
        </div>

        {/* Card 5: MONTHLY STORAGE USAGE (Image 1 - Bottom Center) */}
        <div className="acronis-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">AYLIK DEPOLAMA ARTIŞI</h3>
              <span className="text-[11px] text-[#0070e0]">Konum: Toplam Bulut</span>
            </div>
            <span className="text-xs font-bold text-slate-700 font-mono">7.11 GB</span>
          </div>

          {/* Area Chart SVG */}
          <div className="h-28 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="acronisBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0070e0" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0070e0" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,35 Q30,30 50,22 T100,8 L100,40 L0,40 Z" fill="url(#acronisBlueGrad)" />
              <path d="M0,35 Q30,30 50,22 T100,8" fill="none" stroke="#0070e0" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>1 Nis</span>
            <span>15 Nis</span>
            <span>1 May</span>
            <span>Bugün</span>
          </div>
        </div>

        {/* Card 6: NOT PROTECTED MACHINES (Image 1 - Bottom Right) */}
        <div className="acronis-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">KORUMASIZ CİHAZLAR (2)</h3>
            <span className="text-[11px] text-slate-400">Group: All</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-700 block">DESKTOP-FINANS</span>
                <span className="text-[10px] text-slate-400">Fiziksel Windows 11</span>
              </div>
              <button 
                onClick={onOpenNewJob}
                className="text-[10px] btn-acronis-outline px-2 py-1"
              >
                Korumaya Al
              </button>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-700 block">SRV-BRANCH-02</span>
                <span className="text-[10px] text-slate-400">Hyper-V VM</span>
              </div>
              <button 
                onClick={onOpenNewJob}
                className="text-[10px] btn-acronis-outline px-2 py-1"
              >
                Korumaya Al
              </button>
            </div>
          </div>

          <div className="text-center pt-1">
            <button onClick={() => setActiveTab('agents')} className="text-xs text-[#0070e0] font-medium hover:underline">
              Tüm Ajan Cihazlarını Listele →
            </button>
          </div>
        </div>

      </div>

      {/* AI Predictive Capacity & Disk Exhaustion Radar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl border border-indigo-500/30 p-5 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI Tabanlı Kapasite & Disk Tükenme Tahmini (Predictive AI)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-300 font-mono border border-indigo-700">
                  Linear Regression + Delta Smoothing
                </span>
              </h3>
              <span className="text-xs text-indigo-200/70">
                Son 30 günlük yedek büyüme hızına göre otomatik depolama tükenme ve darboğaz analizi.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Tahmini Tükenme</span>
              <span className="text-sm font-black text-amber-400">
                {aiForecast?.estimatedDaysUntilFull ? `${aiForecast.estimatedDaysUntilFull} Gün Sonra` : '94 Gün Sonra'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Aylık Büyüme</span>
              <span className="text-sm font-black text-cyan-400">
                {aiForecast?.monthlyGrowthRate || '+1.42 GB/Ay'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-slate-300">
              <span>Depolama Doluluk Oranı</span>
              <span className="font-mono font-bold text-white">{aiForecast?.storageUtilizationPercent || '%47.4'}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                style={{ width: `${aiForecast?.storageUtilizationPercent?.replace('%', '') || 47.4}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Kullanılan: {aiForecast?.currentUsedGb || 7.11} GB</span>
              <span>Toplam: {aiForecast?.totalCapacityGb || 15} GB</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-slate-400 block font-medium">90 Günlük Tahmini İhtiyaç</span>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{aiForecast?.predicted90DayUsageGb || 11.37} GB (+4.26 GB)</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Mevcut büyüme trendi ile 3 ay sonra toplam alanın %75.8'i dolmuş olacak.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 space-y-1 text-[11px] text-indigo-200">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> AI Optimizasyon Tavsiyesi:
            </span>
            <p className="text-slate-300">
              {aiForecast?.recommendation || 'MSSQL log arşivlerini WORM deduplication havuzuna taşıyarak %28 alan tasarrufu sağlayabilirsiniz.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
