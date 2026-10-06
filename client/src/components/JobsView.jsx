import React, { useState } from 'react';
import { 
  Plus, 
  Play, 
  RotateCcw, 
  Settings, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle2, 
  Clock, 
  Server, 
  Database, 
  HardDrive,
  FolderOpen,
  Cpu,
  Monitor,
  MoreVertical,
  ShieldCheck,
  AlertCircle,
  Square,
  Check,
  X,
  FileCheck2,
  Zap,
  ArrowRight
} from 'lucide-react';
import FolderPickerModal from './FolderPickerModal';
import { api } from '../api';

export default function JobsView({ 
  jobs = [], 
  history = [], 
  activeJobId = null, 
  progressData = null, 
  onRunJob, 
  onStopJob, 
  onOpenNewJob, 
  onEditJob, 
  onDeleteJob,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Fast Recover Modal State
  const [recoveringJob, setRecoveringJob] = useState(null);
  const [restoreTargetPath, setRestoreTargetPath] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState(null);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.databaseName && job.databaseName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.sourcePath && job.sourcePath.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'sql') return matchesSearch && job.type === 'sql';
    if (filterType === 'image') return matchesSearch && job.type === 'image';
    if (filterType === 'files') return matchesSearch && (job.type === 'files' || job.type === 'folder');
    return matchesSearch;
  });

  // Open fast recover modal for a specific job
  const handleOpenRecover = (job) => {
    setRecoveringJob(job);
    setRestoreTargetPath(job.sourcePath || 'C:\\Restored_OmniBackup');
    setRestoreResult(null);
    setIsRestoring(false);
  };

  // Execute fast physical recovery
  const handleExecuteRestore = async (e) => {
    if (e) e.preventDefault();
    if (!recoveringJob) return;

    setIsRestoring(true);
    setRestoreResult(null);

    try {
      const res = await api.restoreBackup({
        jobId: recoveringJob.id,
        targetRestorePath: restoreTargetPath,
        restoreToOriginal: true
      });

      if (res && res.success) {
        setRestoreResult({
          success: true,
          message: res.result?.message || `Yedeklenen dosyalar başarıyla '${restoreTargetPath}' konumuna açılmış klasör halinde geri yüklendi.`,
          filesCount: res.result?.restoredFilesCount || 1,
          targetPath: res.result?.targetPath || restoreTargetPath
        });
        if (typeof onRefresh === 'function') onRefresh();
      } else {
        setRestoreResult({
          success: false,
          error: res?.error || "Geri yükleme sırasında bir hata oluştu."
        });
      }
    } catch (err) {
      setRestoreResult({
        success: false,
        error: err.message
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // Render distinctive monitor icon graphic based on backup type
  const renderMonitorGraphic = (job) => {
    if (job.type === 'folder' || job.type === 'files') {
      return (
        <div className="relative w-16 h-14 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 border border-sky-400 flex flex-col items-center justify-center text-white shadow-xs shrink-0 group">
          <FolderOpen className="w-5 h-5 text-white drop-shadow-xs" />
          <span className="font-extrabold text-[8.5px] tracking-wider text-sky-100 uppercase">
            KLASÖR
          </span>
          <div className="absolute -bottom-1.5 w-6 h-1.5 bg-slate-400 rounded-b" />
        </div>
      );
    }

    if (job.type === 'image' && job.imageSubType === 'hyperv') {
      return (
        <div className="relative w-16 h-14 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 border border-teal-400 flex flex-col items-center justify-center text-white shadow-xs shrink-0">
          <Cpu className="w-5 h-5 text-white drop-shadow-xs" />
          <span className="font-extrabold text-[8.5px] tracking-wider text-teal-100 uppercase">
            HYPER-V
          </span>
          <div className="absolute -bottom-1.5 w-6 h-1.5 bg-slate-400 rounded-b" />
        </div>
      );
    }

    if (job.type === 'image') {
      return (
        <div className="relative w-16 h-14 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400 flex flex-col items-center justify-center text-white shadow-xs shrink-0">
          <HardDrive className="w-5 h-5 text-white drop-shadow-xs" />
          <span className="font-extrabold text-[8.5px] tracking-wider text-indigo-100 uppercase">
            İMAJ OS
          </span>
          <div className="absolute -bottom-1.5 w-6 h-1.5 bg-slate-400 rounded-b" />
        </div>
      );
    }

    // Default to SQL
    return (
      <div className="relative w-16 h-14 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400 flex flex-col items-center justify-center text-white shadow-xs shrink-0">
        <Database className="w-5 h-5 text-white drop-shadow-xs" />
        <span className="font-extrabold text-[8.5px] tracking-wider text-amber-100 uppercase">
          {job.sqlType ? job.sqlType.toUpperCase() : 'MSSQL'}
        </span>
        <div className="absolute -bottom-1.5 w-6 h-1.5 bg-slate-400 rounded-b" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">
            All machines & Protection Plans
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
            {jobs.length} Total
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewJob}
            className="btn-acronis-primary px-4 py-2 flex items-center gap-2 text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD (YENİ PLAN)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Makine veya plan ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0070e0]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'all' ? 'bg-[#0070e0] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tümü ({jobs.length})
          </button>
          <button
            onClick={() => setFilterType('files')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'files' ? 'bg-[#0070e0] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dosya & Klasör
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'image' ? 'bg-[#0070e0] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            İmaj & Hyper-V
          </button>
          <button
            onClick={() => setFilterType('sql')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'sql' ? 'bg-[#0070e0] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Veritabanı (SQL)
          </button>
        </div>
      </div>

      {/* Machine / Plan Cards List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const isSql = job.type === 'sql';
          const isImage = job.type === 'image';
          const isRunning = job.status === 'running' || activeJobId === job.id;
          const liveProg = (activeJobId === job.id && progressData) ? progressData : null;

          return (
            <div 
              key={job.id} 
              className={`acronis-card p-5 bg-white flex flex-col gap-4 transition border ${
                isRunning 
                  ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
                  : 'border-slate-200 hover:border-[#0070e0]/40'
              }`}
            >
              {/* Main Job Card Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Left Column: Red Box Area with Custom Type Graphic */}
                <div className="flex items-center gap-4">
                  {renderMonitorGraphic(job)}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-800 tracking-tight">
                        {job.name}
                      </h3>
                      {job.encrypt && (
                        <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          AES-256
                        </span>
                      )}
                      {isImage && (
                        <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {job.imageSubType === 'hyperv' ? 'Hyper-V VHDX' : 'Bare-Metal OS'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      {isImage 
                        ? `Sistem İmajı • ${job.imageSubType === 'hyperv' ? `Hyper-V (${job.vmName || 'VM'})` : (job.sourceDisk || 'C: Sistem OS')}`
                        : isSql ? `MSSQL • ${job.databaseName || 'DB_PROD'}` : `${job.sourcePath || 'C:\\Data'}`}
                    </p>
                  </div>
                </div>

                {/* Center Column: Status, Last Backup, Next Backup */}
                <div className="grid grid-cols-3 gap-6 text-xs text-slate-600 font-medium">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Status</span>
                    {isRunning ? (
                      <span className="text-[#0070e0] font-bold flex items-center gap-1 animate-pulse">
                        <Zap className="w-3.5 h-3.5" /> Canlı Yedekleniyor
                      </span>
                    ) : job.lastStatus === 'failed' ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Error
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> OK
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Last backup</span>
                    <span className="text-slate-700 font-medium font-mono text-[11px]">
                      {job.lastRun ? new Date(job.lastRun).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Hazır'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Next backup</span>
                    <span className="text-slate-700 font-medium font-mono text-[11px]">
                      {job.scheduleHuman || 'Bugün 22:00'}
                    </span>
                  </div>
                </div>

                {/* Right Column: Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onRunJob(job.id)}
                    disabled={isRunning}
                    className="btn-acronis-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 uppercase tracking-wide font-bold"
                  >
                    <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? 'Çalışıyor...' : 'BACK UP NOW'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenRecover(job)}
                    className="btn-acronis-outline px-4 py-2 text-xs flex items-center gap-1.5 uppercase font-bold text-slate-700 hover:text-[#0070e0] hover:border-[#0070e0] transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>RECOVER</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditJob(job)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title="Planı Düzenle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteJob(job.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Planı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* LIVE INLINE PROGRESS PANEL (Green Framed Area Active Backup Engine) */}
              {isRunning && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-slate-100 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="font-bold text-white">
                        {liveProg?.stage || 'Canlı Yedekleme İlerlemesi: Veri Blokları İşleniyor...'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-emerald-400 font-bold">
                        {liveProg?.speed || '114.5 MB/s'}
                      </span>
                      <span className="font-mono text-slate-300 font-bold">
                        %{liveProg?.percent || 35}
                      </span>
                      {typeof onStopJob === 'function' && (
                        <button
                          type="button"
                          onClick={() => onStopJob(job.id)}
                          className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                        >
                          <X className="w-3 h-3" />
                          <span>Durdur</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
                    <div 
                      className="bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-300 relative shadow-sm"
                      style={{ width: `${Math.min(100, Math.max(8, liveProg?.percent || 35))}%` }}
                    />
                  </div>

                  {/* Details sub-row */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="truncate max-w-[480px]">
                      Kaynak: {liveProg?.currentFile || job.sourcePath || 'C:\\Data'}
                    </span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span>Geçen: {liveProg?.elapsedFormatted || '00:03 sn'}</span>
                      <span>Kalan: {liveProg?.remainingFormatted || '00:02 sn'}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* FAST RECOVERY MODAL (Direct Restore to Original Place) */}
      {recoveringJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4 text-slate-800 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0070e0] border border-blue-200">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Yedekten Orijinal Konuma Geri Yükle (Recover)
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Plan: {recoveringJob.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRecoveringJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation Note */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-800">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>Otomatik Klasör Kurtarma & Yeniden Oluşturma:</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-blue-900">
                Yedek aldığınız dosya veya klasör silinmiş olsa bile; depolanan arşiv doğrudan hedef konumda 
                açılır ve <b>orijinal açılmış klasör haliyle</b> eksiksiz olarak yerine geri kopyalanır.
              </p>
            </div>

            {/* Target Folder Form */}
            <form onSubmit={handleExecuteRestore} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Kurtarılacak Hedef Konum (Orijinal Konum):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={restoreTargetPath}
                    onChange={(e) => setRestoreTargetPath(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-[#0070e0]"
                    placeholder="C:\OmniSpot"
                  />
                  <button
                    type="button"
                    onClick={() => setFolderPickerOpen(true)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 flex items-center gap-1 text-xs shrink-0 transition"
                  >
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                    <span>Gözat</span>
                  </button>
                </div>
              </div>

              {/* Status / Result Banner */}
              {restoreResult && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  restoreResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  {restoreResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {restoreResult.success ? 'Kurtarma Başarılı!' : 'Kurtarma Hatası!'}
                    </span>
                    <span className="text-[11.5px]">
                      {restoreResult.message || restoreResult.error}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRecoveringJob(null)}
                  className="btn-acronis-outline px-4 py-2 text-xs font-semibold"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  disabled={isRestoring}
                  className="btn-acronis-primary px-5 py-2 text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                  <span>{isRestoring ? 'Geri Yükleniyor...' : 'Geri Yüklemeyi Başlat'}</span>
                </button>
              </div>
            </form>

            {/* Folder Picker Modal for restore destination */}
            <FolderPickerModal
              isOpen={folderPickerOpen}
              onClose={() => setFolderPickerOpen(false)}
              onSelect={(selectedPath) => setRestoreTargetPath(selectedPath)}
              onSelectPath={(selectedPath) => setRestoreTargetPath(selectedPath)}
              currentSelectedPath={restoreTargetPath}
              isDestination={true}
            />

          </div>
        </div>
      )}

    </div>
  );
}
