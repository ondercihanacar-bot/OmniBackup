import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Mail, 
  Download, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  RefreshCw,
  Search,
  HardDrive,
  Clock,
  Layers
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function SaasCloudView() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [backingUpEmail, setBackingUpEmail] = useState(null);
  const [exportingEmail, setExportingEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await api.getSaasTenants();
      const list = Array.isArray(res) ? res : (res.tenants || []);
      setTenants(list);
      if (list.length > 0) {
        if (!selectedTenant) {
          setSelectedTenant(list[0]);
        } else {
          const updated = list.find(t => t.id === selectedTenant.id);
          setSelectedTenant(updated || list[0]);
        }
      }
    } catch (e) {
      console.error('SaaS fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleBackupMailbox = async (mailbox) => {
    if (!selectedTenant) return;
    try {
      setBackingUpEmail(mailbox.email);
      setActionNotice(null);
      const res = await api.backupMailbox({
        tenantId: selectedTenant.id,
        mailboxId: mailbox.id || mailbox.email
      });
      if (res && res.success) {
        setActionNotice({
          type: 'success',
          msg: `${mailbox.email} posta kutusu ve bulut verisi başarıyla yedeklendi (${res.mailbox?.itemsCount || 0} öğe, ${res.mailbox?.size || '0 MB'}).`
        });
        fetchTenants();
      }
    } catch (e) {
      alert('Yedekleme hatası: ' + e.message);
    } finally {
      setBackingUpEmail(null);
    }
  };

  const handleExportPst = async (email) => {
    try {
      setExportingEmail(email);
      setActionNotice(null);
      const res = await api.exportPst({ email });
      if (res && res.success) {
        setActionNotice({
          type: 'download',
          msg: `${email} için PST/MBOX arşiv paketi oluşturuldu: ${res.exportFile || res.filePath || 'PST Arşivi Hazır'}`,
          path: res.exportFile || res.filePath
        });
      }
    } catch (e) {
      alert('Dışa aktarma hatası: ' + e.message);
    } finally {
      setExportingEmail(null);
    }
  };

  const filteredMailboxes = selectedTenant?.mailboxes?.filter(m => 
    (m.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-xl shadow-md">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>Microsoft 365 & Google Workspace Bulut Yedekleme</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                SaaS Cloud-to-Cloud
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Exchange Online, OneDrive, SharePoint, Teams ve Gmail kurumsal hesaplarını yerel ya da WORM depolamaya yedekleyin ve tek tıkla PST / MBOX olarak indirin.
            </p>
          </div>
        </div>

        <button
          onClick={fetchTenants}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-300 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {actionNotice && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
          actionNotice.type === 'download' 
            ? 'bg-blue-50 border-blue-300 text-blue-800' 
            : 'bg-emerald-50 border-emerald-300 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice.msg}</span>
          </div>
          {actionNotice.path && (
            <span className="font-mono text-[10px] bg-white px-2 py-1 rounded border border-blue-200 text-slate-600">
              {actionNotice.path}
            </span>
          )}
        </div>
      )}

      {/* Tenant selector tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {tenants.map(t => {
          const isSelected = selectedTenant?.id === t.id;
          const isM365 = t.provider === 'microsoft365' || t.provider === 'Microsoft 365';
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTenant(t)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all shrink-0 ${
                isSelected 
                  ? 'bg-sky-50 border-sky-600 shadow-sm text-sky-900' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${isM365 ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`}>
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">{t.name}</div>
                <div className="text-[10px] text-slate-500">{isM365 ? 'Microsoft 365' : 'Google Workspace'}</div>
              </div>
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {t.status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Tenant Details & Mailbox Grid */}
      {selectedTenant ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left 1 Col: Tenant Telemetry */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Tenant Bilgileri</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Tenant ID:</span>
                  <span className="font-mono text-[10px] text-slate-800 truncate max-w-[140px]">{selectedTenant.tenantId || selectedTenant.serviceAccountEmail || 'Connected'}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Sağlayıcı:</span>
                  <span className="font-semibold text-slate-800">{selectedTenant.provider}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">OneDrive / Drive:</span>
                  <span className="font-bold text-sky-600">{selectedTenant.totalOneDriveGB || '1.4 TB'}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">SharePoint / Docs:</span>
                  <span className="font-bold text-sky-600">{selectedTenant.totalSharePointGB || '890 GB'}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Korumadaki Hesap:</span>
                  <span className="font-bold text-emerald-600">{selectedTenant.mailboxes?.length || selectedTenant.totalMailboxes || 0} Kullanıcı</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>Kapsanan SaaS Servisleri</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Exchange Mailbox & Archive</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>OneDrive for Business</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>SharePoint Document Libraries</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Microsoft Teams Chats & Channels</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 3 Cols: Mailbox Table */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Kullanıcı Hesapları ve Posta Kutuları</span>
              </h2>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Kullanıcı veya e-posta ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="p-3 font-semibold">Kullanıcı</th>
                    <th className="p-3 font-semibold">E-Posta</th>
                    <th className="p-3 font-semibold">Boyut</th>
                    <th className="p-3 font-semibold">Öğe Sayısı</th>
                    <th className="p-3 font-semibold">Durum</th>
                    <th className="p-3 font-semibold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMailboxes.map((mb) => (
                    <tr key={mb.email} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-800">{mb.displayName}</td>
                      <td className="p-3 font-mono text-slate-600">{mb.email}</td>
                      <td className="p-3 font-semibold text-slate-700">{mb.size}</td>
                      <td className="p-3 text-slate-600">{(mb.itemsCount || mb.itemCount || 0)?.toLocaleString('tr-TR')} öğe</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {mb.lastStatus || 'SUCCESS'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleBackupMailbox(mb)}
                            disabled={backingUpEmail === mb.email}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition disabled:opacity-50"
                          >
                            <Play className={`w-3 h-3 ${backingUpEmail === mb.email ? 'animate-spin' : ''}`} />
                            <span>{backingUpEmail === mb.email ? 'Yedekleniyor...' : 'Yedekle'}</span>
                          </button>
                          <button
                            onClick={() => handleExportPst(mb.email)}
                            disabled={exportingEmail === mb.email}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition disabled:opacity-50"
                          >
                            <Download className="w-3 h-3 text-slate-600" />
                            <span>{exportingEmail === mb.email ? 'Oluşturuluyor...' : 'PST İndir'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMailboxes.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400">
                        Arama kriterlerine uygun hesap bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
          Bağlı SaaS Tenant bulunamadı.
        </div>
      )}
    </div>
  );
}
