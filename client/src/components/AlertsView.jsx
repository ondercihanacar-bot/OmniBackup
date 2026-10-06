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
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function AlertsView({ logs = [], jobs = [], onRefresh }) {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample Acronis-style enterprise alerts
  const [alerts, setAlerts] = useState([
    {
      id: 'alt-1',
      severity: 'critical',
      machine: 'SRV-MSSQL-PROD (192.168.1.10)',
      type: 'Database',
      title: 'Validation & Database Consistency Warning',
      description: 'DBCC CHECKDB sonucunda MSSQL SERVER üzerinde 1 adet kilitli transaction tespit edildi. VSS Gölge Kopyası devrede.',
      time: '10 dakika önce',
      resolved: false
    },
    {
      id: 'alt-2',
      severity: 'warning',
      machine: 'Linux-Backup-Agent (Ubuntu 16.04)',
      type: 'Virtual Machine',
      title: 'Yedekleme Doğrulama Uyarısı (Validation Pending)',
      description: 'SureBackup bütünlük testi planlandı ancak ağ gecikmesi nedeniyle test kuyruğa alındı.',
      time: '35 dakika önce',
      resolved: false
    },
    {
      id: 'alt-3',
      severity: 'warning',
      machine: 'DESKTOP-FINANS (192.168.1.45)',
      type: 'Physical Machine',
      title: 'Korunmasız Cihaz Uyarısı (Unprotected Device)',
      description: 'Cihaza henüz zamanlanmış bir yedekleme planı atanmadı. Otomatik kalkan öneriliyor.',
      time: '1 saat önce',
      resolved: false
    },
    {
      id: 'alt-4',
      severity: 'info',
      machine: 'Google Drive Cloud Storage',
      type: 'Cloud Repository',
      title: 'Depolama Alanı Bildirimi (Quota Notice)',
      description: 'Bulut depolama alanının %47.4 kadarı (7.11 GB) kullanımdadır. Yeterli alan mevcut.',
      time: '3 saat önce',
      resolved: true
    },
    {
      id: 'alt-5',
      severity: 'critical',
      machine: 'Win10-Client-04',
      type: 'Physical Machine',
      title: 'Çevrimdışı Disk Uyarısı (Offline Disk)',
      description: 'Kaynak disk E:\\ sürücüsüne ulaşılamadı. Ajan bağlantısı bekleniyor.',
      time: 'Dün 16:45',
      resolved: false
    },
    {
      id: 'alt-6',
      severity: 'info',
      machine: 'Active Cyber Shield Engine',
      type: 'Security Shield',
      title: 'Shannon Entropi Taraması Tamamlandı',
      description: 'Tüm aktif görevler zero-day ve cryptolocker tehditlerine karşı tarandı. Sistem temiz.',
      time: 'Bugün 04:00',
      resolved: true
    }
  ]);

  const handleResolve = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const handleDelete = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const filteredAlerts = alerts.filter(a => {
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
            <XCircle className="w-3.5 h-3.5" /> CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="badge-warning px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> WARNING
          </span>
        );
      default:
        return (
          <span className="badge-neutral px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> INFO
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
            Active Alerts (Sistem Uyarıları & Tehdit Bildirimleri)
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
            {alerts.filter(a => !a.resolved).length} Bekleyen Uyarı
          </span>
        </div>

        <button
          onClick={() => setAlerts(prev => prev.map(a => ({ ...a, resolved: true })))}
          className="btn-acronis-outline px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Tümünü Okundu İşaretle</span>
        </button>
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
            Tümü ({alerts.length})
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

      {/* Alerts List (Acronis Style) */}
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

              <button
                onClick={() => handleDelete(alert.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                title="Uyarıyı Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
