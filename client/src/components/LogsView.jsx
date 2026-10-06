import React, { useState } from 'react';
import { 
  Terminal, 
  Trash2, 
  Search, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle
} from 'lucide-react';

export default function LogsView({ logs, onClearLogs }) {
  const [levelFilter, setLevelFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.source?.toLowerCase().includes(search.toLowerCase());
    if (levelFilter === 'all') return matchesSearch;
    return matchesSearch && log.level === levelFilter;
  });

  const getLevelBadge = (level) => {
    switch (level) {
      case 'success':
        return (
          <span className="badge-ok px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" /> SUCCESS
          </span>
        );
      case 'warning':
        return (
          <span className="badge-warning px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3" /> WARN
          </span>
        );
      case 'error':
        return (
          <span className="badge-danger px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" /> ERROR
          </span>
        );
      default:
        return (
          <span className="badge-neutral px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">
            Audit Logs (Sistem ve Olay Günlükleri)
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
            {logs.length} Kayıt
          </span>
        </div>

        <button
          onClick={onClearLogs}
          className="btn-acronis-outline text-rose-600 hover:bg-rose-50 border-rose-200 px-3.5 py-1.5 text-xs flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Logları Temizle</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Mesaj veya kaynak ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0070e0]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {['all', 'info', 'success', 'warning', 'error'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg font-medium transition uppercase text-[11px] ${
                levelFilter === lvl ? 'bg-[#0070e0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="acronis-card bg-white overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
            <tr>
              <th className="p-3.5 w-28">Seviye</th>
              <th className="p-3.5 w-32">Kaynak</th>
              <th className="p-3.5">Olay Mesajı</th>
              <th className="p-3.5 text-right w-44">Zaman</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70 transition">
                <td className="p-3.5">{getLevelBadge(log.level)}</td>
                <td className="p-3.5 font-bold text-slate-700">{log.source}</td>
                <td className="p-3.5 text-slate-800">{log.message}</td>
                <td className="p-3.5 text-slate-400 text-right">
                  {new Date(log.timestamp).toLocaleString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
