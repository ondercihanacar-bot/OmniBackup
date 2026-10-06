import React, { useState } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
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
  ArrowRight
} from 'lucide-react';

export default function ActivitiesView({ jobs = [], history = [], onRunJob }) {
  const [filter, setFilter] = useState('all');

  const sampleActivities = [
    {
      id: 'act-1',
      title: 'Incremental Backup • C:\\SirketBelgeleri',
      planName: 'Günlük Şirket Belgeleri Yedekleme',
      target: 'Google Drive Cloud (G:\\Drive\'ım\\OmniBackups)',
      status: 'running',
      progress: 68,
      speed: '54.2 MB/s',
      processedSize: '1.24 GB / 1.82 GB',
      startedAt: '2 dakika önce',
      elapsed: '00:02:14'
    },
    {
      id: 'act-2',
      title: 'Microsoft SQL DB • [ERP_PROD_DB] Full Backup',
      planName: 'ERP Veritabanı Gecelik Full Yedek',
      target: 'Google Drive Cloud Storage',
      status: 'completed',
      progress: 100,
      speed: '82.0 MB/s',
      processedSize: '3.45 GB',
      startedAt: 'Dün 23:00',
      elapsed: '00:04:12'
    },
    {
      id: 'act-3',
      title: 'SureBackup Checksum & Header Doğrulama',
      planName: 'Otomatik Sağlık & Verifikasyon Testi',
      target: 'Yerel Güvenli Sandbox',
      status: 'completed',
      progress: 100,
      speed: '120 MB/s',
      processedSize: '3.45 GB',
      startedAt: 'Dün 23:05',
      elapsed: '00:00:45'
    },
    {
      id: 'act-4',
      title: 'Active Cyber Shield • Shannon Entropi Taraması',
      planName: 'Zero-Day & Fidye Yazılımı Taraması',
      target: 'Tüm Kaynak Diskler',
      status: 'completed',
      progress: 100,
      speed: '210 MB/s',
      processedSize: '4,892 Dosya',
      startedAt: 'Bugün 04:00',
      elapsed: '00:01:20'
    },
    {
      id: 'act-5',
      title: 'Delta Restore Simülasyonu • Point-in-Time',
      planName: 'Acil Kurtarma Test Prosedürü',
      target: 'C:\\Restored_OmniBackup',
      status: 'failed',
      progress: 42,
      speed: '0 MB/s',
      processedSize: '512 MB (Disk dolu)',
      startedAt: '12 saat önce',
      elapsed: '00:00:30'
    }
  ];

  const filteredActivities = sampleActivities.filter(a => {
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
          <h1 className="text-xl font-bold text-slate-800">
            Activities (Canlı İşlemler & Görev Akışı)
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
            {sampleActivities.length} İşlem
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'all' ? 'bg-[#0070e0] text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'running' ? 'bg-[#0070e0] text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Çalışanlar (1)
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filter === 'completed' ? 'bg-[#0070e0] text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Tamamlananlar (3)
          </button>
        </div>
      </div>

      {/* Activities Cards */}
      <div className="space-y-4">
        {filteredActivities.map((act) => {
          const isRunning = act.status === 'running';
          const isCompleted = act.status === 'completed';
          const isFailed = act.status === 'failed';

          return (
            <div 
              key={act.id}
              className="acronis-card p-5 bg-white space-y-3 transition hover:border-[#0070e0]/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    isRunning ? 'bg-sky-50 text-[#0070e0] animate-pulse' :
                    isCompleted ? 'bg-emerald-50 text-emerald-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {isRunning ? <RefreshCw className="w-5 h-5 animate-spin" /> :
                     isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                     <XCircle className="w-5 h-5" />}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                      {act.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {act.planName} • <span className="text-[#0070e0]">{act.target}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                  <span>Hız: <strong className="text-slate-700">{act.speed}</strong></span>
                  <span>•</span>
                  <span>Süre: <strong className="text-slate-700">{act.elapsed}</strong></span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>İşlenen: {act.processedSize}</span>
                  <span className="font-bold text-slate-700 font-mono">%{act.progress}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    style={{ width: `${act.progress}%` }} 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isRunning ? 'bg-[#0070e0]' :
                      isCompleted ? 'bg-emerald-500' :
                      'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
