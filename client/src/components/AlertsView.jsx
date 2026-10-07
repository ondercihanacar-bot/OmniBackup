import React, { useState } from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Trash2, 
  RefreshCw, 
  Server, 
  Database, 
  Clock, 
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

export default function AlertsView({ logs = [], jobs = [], onRefresh }) {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [resolvedIds, setResolvedIds] = useState([]);

  // Generate dynamic live alerts from real system logs and failed jobs
  const liveAlerts = [
    // 1. Failed backup jobs
    ...jobs.filter(j => j.status === 'failed').map(j => ({
      id: `job-fail-${j.id}`,
      severity: 'critical',
      machine: j.sourceType === 'sql' ? `SQL Server (${j.sqlDatabase || 'Veritabanı'})` : 'Yerel Sunucu',
      type: 'Yedekleme Görevi',
      title: `Yedekleme Hatası: ${j.name}`,
      description: j.lastError || 'Yedekleme görevi sırasında bir hata oluştu.',
      time: j.lastRun ? new Date(j.lastRun).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Son çalıştırma',
      resolved: resolvedIds.includes(`job-fail-${j.id}`)
    })),
    // 2. Real error/warning logs from database
    ...logs.filter(l => l.level === 'error' || l.level === 'warning').map(l => ({
      id: l.id || `log-${l.timestamp}`,
      severity: l.level === 'error' ? 'critical' : 'warning',
      machine: l.source || 'Sistem Çekirdeği',
      type: 'Olay Günlüğü',
      title: l.level === 'error' ? 'Sistem Kritik Olayı' : 'Sistem Uyarısı',
      description: l.message,
      time: l.timestamp ? new Date(l.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Az önce',
      resolved: resolvedIds.includes(l.id || `log-${l.timestamp}`)
    }))
  ];

  const handleResolve = (id) => {
    setResolvedIds(prev => [...prev, id]);
  };

  const handleResolveAll = () => {
    setResolvedIds(liveAlerts.map(a => a.id));
  };

  const filteredAlerts = liveAlerts.filter(a => {
    const matchesSearch = a.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'critical') return matchesSearch && a.severity === 'critical';
    if (filterType === 'warning') return matchesSearch && a.severity === 'warning';
    if (filterType === 'unresolved') return matchesSearch && !a.resolved;
    return matchesSearch;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="badge-danger px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> KRİTİK
          </span>
        );
      case 'warning':
        return (
          <span className="badge-warning px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> UYARI
          </span>
        );
      default:
        return (
          <span className="badge-neutral px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> BİLGİ
          </span>
        );
    }
  };

  const pendingCount = liveAlerts.filter(a => !a.resolved).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">
            Active Alerts (Sistem Uyarıları & Tehdit Bildirimleri)
          </h1>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
            pendingCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {pendingCount > 0 ? `${pendingCount} Bekleyen Uyarı` : 'Sistem Güvende'}
          </span>
        </div>

        {pendingCount > 0 && (
          <button
            onClick={handleResolveAll}
            className="btn-acronis-outline px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Tümünü Okundu İşaretle</span>
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Makine, uyarı başlığı veya açıklama ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0070e0]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'all' ? 'bg-[#0070e0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tümü ({liveAlerts.length})
          </button>
          <button
            onClick={() => setFilterType('critical')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'critical' ? 'bg-[#0070e0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kritik
          </button>
          <button
            onClick={() => setFilterType('warning')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'warning' ? 'bg-[#0070e0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Uyarılar
          </button>
          <button
            onClick={() => setFilterType('unresolved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'unresolved' ? 'bg-[#0070e0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Çözülmemiş
          </button>
        </div>
      </div>

      {/* Alerts List or Clean Empty State */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`acronis-card p-5 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition ${
                alert.resolved ? 'opacity-65' : 'hover:border-[#0070e0]/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="pt-0.5 shrink-0">
                  {getSeverityBadge(alert.severity)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                      {alert.title}
                    </h3>
                    {alert.resolved && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        Çözüldü
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-1">
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <Server className="w-3.5 h-3.5 text-[#0070e0]" />
                      {alert.machine}
                    </span>
                    <span>•</span>
                    <span>{alert.type}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {alert.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                {!alert.resolved && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="btn-acronis-primary px-3 py-1.5 text-xs font-semibold shadow-xs"
                  >
                    Onayla & Çözüldü
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="acronis-card p-12 bg-white text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200/60 shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Aktif Sistem Uyarısı veya Tehdit Bulunmuyor
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            OmniBackup Cyber Shield koruması aktif. Tüm sunucu servisleri, depolama havuzları ve yedekleme süreçleri normal parametrelerde çalışmaktadır.
          </p>
        </div>
      )}

    </div>
  );
}
