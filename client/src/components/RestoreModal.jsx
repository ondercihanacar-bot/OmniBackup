import React, { useState } from 'react';
import { 
  RotateCcw, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FolderOpen
} from 'lucide-react';
import { api } from '../api';
import FolderPickerModal from './FolderPickerModal';

export default function RestoreModal({ isOpen, onClose, historyItem, onRestoreComplete }) {
  if (!isOpen || !historyItem) return null;

  const [targetPath, setTargetPath] = useState('C:\\Restored_OmniBackup');
  const [restoring, setRestoring] = useState(false);
  const [result, setResult] = useState(null);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);

  const handleRestore = async (e) => {
    e.preventDefault();
    setRestoring(true);
    setResult(null);

    try {
      const res = await api.restoreBackup(historyItem.id, targetPath);
      setResult({ success: true, data: res.result });
      if (onRestoreComplete) onRestoreComplete();
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="enterprise-card w-full max-w-lg p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Yedekten Geri Yükle</h2>
              <p className="text-xs text-slate-400 font-mono">{historyItem.fileName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Archive Summary */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Görev:</span>
            <span className="text-slate-200 font-medium">{historyItem.jobName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Boyut / Tarih:</span>
            <span className="text-emerald-400 font-semibold">{historyItem.size} • {new Date(historyItem.startTime).toLocaleString('tr-TR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Depolama Kaynağı:</span>
            <span className="text-slate-300 truncate max-w-[260px]">{historyItem.destination}</span>
          </div>
        </div>

        {/* Restore Form */}
        <form onSubmit={handleRestore} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Geri Yüklenecek Hedef Dizin (Target Path)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl input-enterprise text-xs font-mono"
                placeholder="C:\Restored_OmniBackup veya orijinal yol"
              />
              <button
                type="button"
                onClick={() => setFolderPickerOpen(true)}
                className="btn-secondary px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0 text-xs font-medium"
              >
                <FolderOpen className="w-4 h-4 text-emerald-400" />
                <span>Gözat</span>
              </button>
            </div>
          </div>

          {result && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              result.success 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}>
              {result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>
                {result.success 
                  ? `Kurtarma başarıyla tamamlandı! ${result.data?.restoredSize || ''} veri '${targetPath}' konumuna çıkarıldı.` 
                  : `Hata: ${result.error}`}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
            >
              Kapat
            </button>
            <button
              type="submit"
              disabled={restoring}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${restoring ? 'animate-spin' : ''}`} />
              <span>{restoring ? 'Geri Yükleniyor...' : 'Geri Yüklemeyi Başlat'}</span>
            </button>
          </div>
        </form>

        <FolderPickerModal
          isOpen={folderPickerOpen}
          onClose={() => setFolderPickerOpen(false)}
          onSelect={(selectedPath) => setTargetPath(selectedPath)}
          currentSelectedPath={targetPath}
        />
      </div>
    </div>
  );
}
