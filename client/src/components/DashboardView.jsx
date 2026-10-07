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
  jobs = [], 
  agents = [], 
  destinations = [],
  history = [], 
  logs = [],
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
        // ignore
      }
    }
    loadForecast();
  }, []);

  const protectedCount = jobs.length;
  const okCount = jobs.filter(j => j.status !== 'failed').length;
  const warningCount = jobs.filter(j => j.status === 'warning').length;
  const errorCount = jobs.filter(j => j.status === 'failed').length;

  const primaryDest = destinations && destinations.length > 0 ? destinations[0] : { name: "Yerel Yedekleme Alanı (C:\\OmniBackups)", type: "local", path: "C:\\OmniBackups" };
  const totalBackupsFormatted = stats?.totalBackupsSize || "0 B";
  const diskFreeFormatted = stats?.diskFree || "Hazır";

  // Filter real active warning/error logs
  const realAlerts = logs.filter(l => l.level === 'error' || l.level === 'warning').slice(0, 3);

  // Filter real unprotected agents (agents with no backup job assigned)
  const unprotectedAgents = agents.filter(a => !jobs.some(j => j.agentId === a.id));

  // Compute actual weekly history bars
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'];
  const today = new Date();
  const pastDays = [3, 2, 1, 0].map(offset => {
    const d = new Date();
    d.setDate(today.getDate() - offset);
    const dayStr = dayNames[d.getDay()];
    const dayHistory = history.filter(h => {
      const hDate = new Date(h.startTime || h.timestamp);
      return hDate.toDateString() === d.toDateString();
    });
    const green = dayHistory.filter(h => h.status === 'success').length;
    const red = dayHistory.filter(h => h.status === 'failed').length;
    const yellow = dayHistory.filter(h => h.status === 'warning').length;
    return { day: dayStr, count: dayHistory.length, green, yellow, red };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
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

      {/* Visual Backup Flow Bar */}
      <div className="acronis-card p-5 bg-white space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
          {/* Source Graphic */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-24 h-16 rounded-xl bg-slate-100 border border-slate-300 flex flex-col items-center justify-center p-2 shadow-xs">
              <Server className="w-8 h-8 text-[#0070e0]" />
              <div className="w-16 h-1 bg-slate-300 rounded-full mt-1" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 block">Yerel Sunucu & İstemciler</span>
              <span className="text-xs text-slate-500">{jobs.length > 0 ? `${jobs.length} Aktif Koruma Planı` : "Plan Oluşturulmadı"}</span>
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

          {/* Target Graphic */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-24 h-16 rounded-xl bg-sky-50 border border-sky-200 flex flex-col items-center justify-center p-2 shadow-xs">
              {primaryDest.type === 'cloud' || primaryDest.type === 'gdrive' || primaryDest.type === 's3' ? (
                <Cloud className="w-8 h-8 text-[#0070e0]" />
              ) : (
                <HardDrive className="w-8 h-8 text-[#0070e0]" />
              )}
              <span className="text-[9px] font-bold text-[#0070e0] mt-0.5">VAULT</span>
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 block truncate max-w-[200px]">{primaryDest.name || "Yedek Deposu"}</span>
              <span className="text-xs text-slate-500">{totalBackupsFormatted} Yedek Verisi</span>
            </div>
          </div>
        </div>

        {/* Breakdown Storage Bar */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Yedeklenen Veri Türü Dağılımı</span>
            <span className="font-mono text-slate-700 font-bold">Toplam: {totalBackupsFormatted}</span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
            {protectedCount > 0 ? (
              <>
                <div style={{ width: '45%' }} className="bg-[#0070e0]" title="SQL Veritabanları" />
                <div style={{ width: '30%' }} className="bg-emerald-500" title="Belgeler & Dosyalar" />
                <div style={{ width: '25%' }} className="bg-amber-500" title="Sistem İmajı" />
              </>
            ) : (
              <div style={{ width: '100%' }} className="bg-slate-200" title="Veri Bekleniyor" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 pt-1">
            {protectedCount > 0 ? (
              <>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0070e0]" /> SQL DB</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Dosya & Klasör</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> İmaj & VSS</span>
              </>
            ) : (
              <span className="text-slate-400 italic">Henüz yedekleme görevi başlatılmadı. Yeni plan ekleyerek başlayabilirsiniz.</span>
            )}
          </div>
        </div>
      </div>

      {/* 6 Grid Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: PROTECTION STATUS */}
        <div className="acronis-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">PROTECTION STATUS</h3>
              <span className="text-[11px] text-slate-400">Grup: Tümü</span>
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
                {protectedCount > 0 && (
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={errorCount > 0 ? "#ef4444" : "#22c55e"}
                    strokeWidth="3.8"
                    strokeDasharray={`${Math.max(10, Math.round((okCount / (protectedCount || 1)) * 100))}, 100`}
                  />
                )}
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-extrabold text-slate-800 block leading-tight">{protectedCount}</span>
                <span className="text-[10px] text-slate-500 font-medium">Plan</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <div>
                  <span className="text-slate-500 text-[11px] block">Başarılı / Aktif</span>
                  <span className="font-bold text-slate-800">{okCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <div>
                  <span className="text-slate-500 text-[11px] block">Uyarı</span>
                  <span className="font-bold text-slate-800">{warningCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                <div>
                  <span className="text-slate-500 text-[11px] block">Hata</span>
                  <span className="font-bold text-slate-800">{errorCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: STORAGE */}
        <div className="acronis-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">DEPOLAMA ALANI</h3>
              <span className="text-[11px] text-[#0070e0] truncate block max-w-[180px]">{primaryDest.name || "Yerel Depo"}</span>
            </div>
          </div>

          <div className="flex items-center justify-around py-2">
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
                  strokeDasharray="25, 100"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-extrabold text-slate-800 block leading-tight">{totalBackupsFormatted}</span>
                <span className="text-[9px] text-slate-500">Yedekler</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-[#0070e0] rounded-full" />
                <div>
                  <span className="text-slate-500 text-[10px] block">Yedek Boyutu</span>
                  <span className="font-bold text-slate-800">{totalBackupsFormatted}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-slate-400 rounded-full" />
                <div>
                  <span className="text-slate-500 text-[10px] block">Disk Durumu</span>
                  <span className="font-bold text-slate-800">{diskFreeFormatted}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: ACTIVITIES (HAFTALIK) */}
        <div className="acronis-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">AKTİVİTELER (SON GÜNLER)</h3>
              <span className="text-[11px] text-slate-400">Tamamlanan Görevler</span>
            </div>
          </div>

          <div className="h-28 flex items-end justify-around gap-2 pt-4 px-2">
            {pastDays.map((col, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-full max-w-[20px] rounded flex flex-col justify-end overflow-hidden h-20 bg-slate-100">
                  {col.count > 0 ? (
                    <>
                      {col.red > 0 && <div style={{ height: `${(col.red / col.count) * 100}%` }} className="bg-rose-500 w-full" />}
                      {col.yellow > 0 && <div style={{ height: `${(col.yellow / col.count) * 100}%` }} className="bg-amber-500 w-full" />}
                      {col.green > 0 && <div style={{ height: `${(col.green / col.count) * 100}%` }} className="bg-emerald-500 w-full" />}
                    </>
                  ) : (
                    <div className="h-1 bg-slate-300 w-full" />
                  )}
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

        {/* Card 4: ACTIVE ALERTS */}
        <div className="acronis-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">AKTİF UYARILAR</h3>
            <span onClick={() => setActiveTab('alerts')} className="text-[11px] text-[#0070e0] font-medium cursor-pointer">
              Tüm Uyarılar ({realAlerts.length})
            </span>
          </div>

          {realAlerts.length > 0 ? (
            <div className="space-y-2 text-xs">
              {realAlerts.map(alert => (
                <div key={alert.id} className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                  <span className="font-medium text-slate-700 truncate max-w-[170px]">{alert.source || 'Sistem'}</span>
                  <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1 truncate max-w-[120px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {alert.message}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500 space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="font-medium text-slate-700">Aktif Sistem Uyarısı Yok</p>
              <p className="text-[11px] text-slate-400">Tüm sistemler güvenle çalışıyor.</p>
            </div>
          )}

          <div className="text-center pt-1">
            <button onClick={() => setActiveTab('logs')} className="text-xs text-[#0070e0] font-medium hover:underline">
              Tüm Olay Günlüklerini Gör →
            </button>
          </div>
        </div>

        {/* Card 5: MONTHLY STORAGE USAGE */}
        <div className="acronis-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">DEPOLAMA KULLANIMI</h3>
              <span className="text-[11px] text-[#0070e0]">Genel Durum</span>
            </div>
            <span className="text-xs font-bold text-slate-700 font-mono">{totalBackupsFormatted}</span>
          </div>

          <div className="h-28 w-full pt-2 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="acronisBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0070e0" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0070e0" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,35 Q30,30 50,25 T100,20 L100,40 L0,40 Z" fill="url(#acronisBlueGrad)" />
              <path d="M0,35 Q30,30 50,25 T100,20" fill="none" stroke="#0070e0" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>Yedekler</span>
            <span>İmajlar</span>
            <span>Veritabanları</span>
            <span>Güncel</span>
          </div>
        </div>

        {/* Card 6: KORUMASIZ CİHAZLAR */}
        <div className="acronis-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">KORUMASIZ CİHAZLAR ({unprotectedAgents.length})</h3>
            <span className="text-[11px] text-slate-400">Ajan Durumu</span>
          </div>

          {unprotectedAgents.length > 0 ? (
            <div className="space-y-2 text-xs">
              {unprotectedAgents.slice(0, 2).map(agent => (
                <div key={agent.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-700 block">{agent.hostname}</span>
                    <span className="text-[10px] text-slate-400">{agent.os || 'Windows'}</span>
                  </div>
                  <button 
                    onClick={onOpenNewJob}
                    className="text-[10px] btn-acronis-outline px-2 py-1"
                  >
                    Korumaya Al
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500 space-y-1">
              <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="font-medium text-slate-700">Korunmasız Cihaz Yok</p>
              <p className="text-[11px] text-slate-400">Tüm bağlı ajanlar ve cihazlar koruma altında.</p>
            </div>
          )}

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
                Yedekleme büyüme hızına göre otomatik depolama alanı ve optimizasyon analizi.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Tahmini Tükenme</span>
              <span className="text-sm font-black text-emerald-400">
                {aiForecast?.estimatedDaysUntilFull ? `${aiForecast.estimatedDaysUntilFull} Gün Sonra` : 'Yeterli Alan Mevcut'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Yedek Boyutu</span>
              <span className="text-sm font-black text-cyan-400">
                {totalBackupsFormatted}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-slate-300">
              <span>Depolama Alanı Durumu</span>
              <span className="font-mono font-bold text-white">{diskFreeFormatted}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(5, protectedCount * 15))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Yedek Verisi: {totalBackupsFormatted}</span>
              <span>Hedef: {primaryDest.name || "Yerel Depo"}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-slate-400 block font-medium">Büyüme Analizi</span>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{protectedCount > 0 ? `${protectedCount} Aktif Plan` : "0 Plan"}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Yedekleme planları periyodik olarak çalışarak otomatik arşivleme yapacaktır.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 space-y-1 text-[11px] text-indigo-200">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> AI Optimizasyon Tavsiyesi:
            </span>
            <p className="text-slate-300">
              Zstandard sıkıştırma ve WORM değiştirilemezlik koruması ile maksimum depolama tasarrufu ve fidye yazılımı güvenliği sağlanmaktadır.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
