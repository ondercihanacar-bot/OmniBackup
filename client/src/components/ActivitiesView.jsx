import React, { useState } from 'react';
import { 
  Activity, 
  Play, 
  Square, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HardDrive, 
  Database, 
  RefreshCw, 
  Server, 
  Cloud,
  Layers,
  Zap,
  ArrowRight,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';

export default function ActivitiesView({ 
  jobs = [], 
  history = [], 
  activeJobId = null, 
  progressData = null, 
  onRunJob, 
  onStopJob, 
  onOpenNewJob, 
  setActiveTab 
}) {
  const [filter, setFilter] = useState('all');

  // Build live dynamic activities from current running job + real backup history
  const liveActivities = [];

  // 1. If there is an active job running right now
  if (activeJobId && progressData && !progressData.isFinished) {
    const activeJob = jobs.find(j => j.id === activeJobId) || {};
    liveActivities.push({
      id: `live-${activeJobId}`,
      title: `${activeJob.type ? activeJob.type.toUpperCase() : 'BACKUP'} • ${activeJob.sourcePath || activeJob.databaseName || activeJob.name || 'Canlı Yedekleme'}`,
      planName: activeJob.name || 'Yedekleme Görevi',
      target: activeJob.destination || 'Yerel / Bulut Depolama',
      status: progressData.isFailed ? 'failed' : 'running',
      progress: progressData.percent || 0,
      speed: progressData.speed || 'Hesaplanıyor...',
      processedSize: progressData.processedFormatted || `${progressData.percent || 0}%`,
      startedAt: 'Şimdi çalışıyor',
      elapsed: progressData.elapsedFormatted || '00:00:00',
      jobId: activeJobId,
      canStop: true
    });
  }

  // 2. Real backup history records
  if (Array.isArray(history)) {
    history.forEach(h => {
      // Avoid duplicate if it's currently the running job
      if (activeJobId && h.jobId === activeJobId && !progressData?.isFinished) return;

      const isSuccess = h.status === 'success';
      const dateStr = h.timestamp ? new Date(h.timestamp).toLocaleString('tr-TR') : 'Tamamlandı';
      const durationStr = h.duration ? (h.duration < 60 ? `${h.duration} sn` : `${Math.floor(h.duration / 60)} dk ${h.duration % 60} sn`) : '00:01:00';

      liveActivities.push({
        id: h.id || `hist-${Math.random()}`,
        title: `${(h.type || 'BACKUP').toUpperCase()} • ${h.jobName || 'Yedekleme Görevi'}`,
        planName: h.jobName || 'Yedekleme Planı',
        target: h.destination || 'Depolama Alanı',
        status: isSuccess ? 'completed' : 'failed',
        progress: isSuccess ? 100 : (h.percent || 0),
        speed: h.speed || (isSuccess ? 'Tamamlandı' : '0 MB/s'),
        processedSize: h.sizeFormatted || `${h.fileCount || 0} Dosya`,
        startedAt: dateStr,
        elapsed: durationStr,
        jobId: h.jobId,
        errorMessage: h.error
      });
    });
  }

  const runningCount = liveActivities.filter(a => a.status === 'running').length;
  const completedCount = liveActivities.filter(a => a.status === 'completed').length;
  const failedCount = liveActivities.filter(a => a.status === 'failed').length;

  const filteredActivities = liveActivities.filter(a => {
    if (filter === 'running') return a.status === 'running';
    if (filter === 'completed') return a.status === 'completed';
    if (filter === 'failed') return a.status === 'failed';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#0070e0] border border-blue-100">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Activities (Canlı İşlemler & Görev Akışı)
            </h1>
            <p className="text-xs text-slate-500">
              Yedekleme görevlerinin anlık çalışma durumu, transfer hızları ve işlem geçmişi
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold ml-1">
            {liveActivities.length} İşlem
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'all' ? 'bg-[#0070e0] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tümü ({liveActivities.length})
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'running' ? 'bg-[#0070e0] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Çalışanlar ({runningCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'completed' ? 'bg-[#0070e0] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tamamlananlar ({completedCount})
          </button>
          {failedCount > 0 && (
            <button
              onClick={() => setFilter('failed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === 'failed' ? 'bg-rose-600 text-white shadow-sm' : 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50'
              }`}
            >
              Hatalılar ({failedCount})
            </button>
          )}
        </div>
      </div>

      {/* Activities List or Empty State */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {filter === 'running' ? 'Şu Anda Çalışan Aktif Görev Bulunmuyor' :
               filter === 'failed' ? 'Herhangi Bir Hatalı İşlem Kaydı Yok' :
               filter === 'completed' ? 'Henüz Tamamlanmış İşlem Kaydı Bulunmuyor' :
               'Aktif veya Geçmiş İşlem Kaydı Bulunmuyor'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yedekleme planlarınız çalıştığında gerçek zamanlı işlem akışı, transfer hızları ve ilerleme durumları burada anlık olarak listelenecektir.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            {jobs.length > 0 && onRunJob ? (
              <button
                onClick={() => onRunJob(jobs[0].id)}
                className="px-4 py-2 bg-[#0070e0] hover:bg-[#005bb5] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>İlk Planı Başlat ({jobs[0].name})</span>
              </button>
            ) : onOpenNewJob ? (
              <button
                onClick={onOpenNewJob}
                className="px-4 py-2 bg-[#0070e0] hover:bg-[#005bb5] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Yeni Yedekleme Planı Oluştur</span>
              </button>
            ) : null}

            {setActiveTab && (
              <button
                onClick={() => setActiveTab('jobs')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
              >
                Planları Görüntüle
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((act) => {
            const isRunning = act.status === 'running';
            const isCompleted = act.status === 'completed';
            const isFailed = act.status === 'failed';

            return (
              <div 
                key={act.id}
                className="acronis-card p-5 bg-white space-y-3 transition hover:border-[#0070e0]/50 border border-slate-200 rounded-2xl shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl ${
                      isRunning ? 'bg-sky-50 text-[#0070e0] animate-pulse border border-sky-200' :
                      isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                      {isRunning ? <RefreshCw className="w-5 h-5 animate-spin" /> :
                       isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                       <XCircle className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                          {act.title}
                        </h3>
                        {isRunning && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0070e0] animate-pulse">
                            Çalışıyor
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Başarılı
                          </span>
                        )}
                        {isFailed && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            Hata
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {act.planName} • <span className="text-[#0070e0] font-mono">{act.target}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                    <span>Hız: <strong className="text-slate-700">{act.speed}</strong></span>
                    <span>•</span>
                    <span>Süre: <strong className="text-slate-700">{act.elapsed}</strong></span>
                    <span>•</span>
                    <span>{act.startedAt}</span>

                    {isRunning && act.canStop && onStopJob && (
                      <button
                        onClick={() => onStopJob(act.jobId)}
                        className="ml-2 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-sans font-medium transition flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5 fill-rose-600" />
                        <span>Durdur</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>İşlenen: <strong className="text-slate-700 font-mono">{act.processedSize}</strong></span>
                    <span className="font-bold text-slate-700 font-mono">%{act.progress}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      style={{ width: `${Math.max(0, Math.min(100, act.progress))}%` }} 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isRunning ? 'bg-[#0070e0]' :
                        isCompleted ? 'bg-emerald-500' :
                        'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>

                {act.errorMessage && (
                  <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-2.5 font-mono">
                    Hata detayı: {act.errorMessage}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
