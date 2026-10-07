import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  Trash2, 
  Database, 
  FileText, 
  Search, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  RefreshCw,
  Server,
  Cloud,
  Check,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api';

export default function HistoryView({ history, onDeleteHistory, onOpenRestoreModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);
  const [verifyReport, setVerifyReport] = useState(null);

  const handleVerify = async (histId) => {
    setVerifyingId(histId);
    setVerifyReport(null);
    try {
      const res = await api.verifyBackup(histId);
      if (res.success) {
        setVerifyReport(res.report);
      }
    } catch (e) {
      alert("Doğrulama hatası: " + e.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredHistory = history.filter(item => 
    item.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.agentName && item.agentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">
            Backups & Recovery Points (Arşiv)
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
            {history.length} Arşiv Kaydı
          </span>
        </div>
      </div>

      {/* Verify Report Banner */}
      {verifyReport && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>SureBackup Doğrulama Başarılı: %100 Sağlam & Geri Yüklenebilir</span>
            </span>
            <button onClick={() => setVerifyReport(null)} className="text-slate-500 hover:text-slate-800">✕</button>
          </div>
          <p className="text-[11px] text-emerald-800">{verifyReport.message}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Arşiv dosyası, görev veya cihaz ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0070e0]"
          />
        </div>
      </div>

      {/* Backups Table (Acronis Style) */}
      <div className="acronis-card bg-white overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
            <tr>
              <th className="p-3.5">Plan / Görev</th>
              <th className="p-3.5">Arşiv Dosyası</th>
              <th className="p-3.5">Boyut</th>
              <th className="p-3.5">Zaman (Timestamp)</th>
              <th className="p-3.5">Doğrulama</th>
              <th className="p-3.5 text-right">Kurtarma (Restore)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-bold text-slate-800 flex items-center gap-2">
                    {item.type === 'sql' ? (
                      <Database className="w-4 h-4 text-[#0070e0]" />
                    ) : (
                      <FileText className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>{item.jobName || 'Yedekleme Görevi'}</span>
                  </td>

                  <td className="p-3.5 font-mono text-[11px] text-slate-600">
                    {item.fileName || 'Arşiv Dosyası'}
                  </td>

                  <td className="p-3.5 font-mono text-slate-700 font-medium">
                    {item.size || '0 B'}
                  </td>

                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {item.timestamp && !isNaN(new Date(item.timestamp).getTime()) ? new Date(item.timestamp).toLocaleString('tr-TR') : (item.timestamp || 'Yeni')}
                  </td>

                  <td className="p-3.5">
                    <div className="flex flex-col gap-1">
                      {item.isVerified ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified 100%
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerify(item.id)}
                          disabled={verifyingId === item.id}
                          className="text-[10px] text-[#0070e0] font-semibold hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${verifyingId === item.id ? 'animate-spin' : ''}`} />
                          <span>Test Et</span>
                        </button>
                      )}

                      {item.isImmutable && (
                        <span 
                          className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1 w-fit"
                          title={item.immutableUntil ? `WORM Değiştirilemez Kilit: ${new Date(item.immutableUntil).toLocaleDateString('tr-TR')} tarihine kadar silinemez` : 'WORM Korumalı'}
                        >
                          <Lock className="w-3 h-3 text-amber-600" /> WORM Kilitli
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenRestoreModal(item)}
                        className="btn-acronis-primary px-3 py-1 text-xs flex items-center gap-1 shadow-xs"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>RECOVER</span>
                      </button>

                      <button
                        onClick={() => {
                          if (item.isImmutable && item.immutableUntil && new Date(item.immutableUntil) > new Date()) {
                            alert(`🛑 BU YEDEK SİLİNEMEZ!\nWORM (Değiştirilemez) koruması devrededir.\nKilit Bitiş: ${new Date(item.immutableUntil).toLocaleDateString('tr-TR')}`);
                            return;
                          }
                          onDeleteHistory(item.id);
                        }}
                        className={`p-1.5 rounded transition ${
                          item.isImmutable 
                            ? 'text-amber-400 hover:text-amber-600 cursor-not-allowed' 
                            : 'text-slate-400 hover:text-rose-600'
                        }`}
                        title={item.isImmutable ? "WORM Koruması Altında - Silinemez" : "Sil"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400">
                  <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600 text-xs">Kayıtlı Yedekleme Noktası Bulunmuyor</p>
                  <p className="text-[11px] text-slate-400 mt-1">Bir yedekleme görevi çalıştırıldığında kurtarma noktaları burada listelenecektir.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
