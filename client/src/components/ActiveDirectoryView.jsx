import React, { useState, useEffect } from 'react';
import { 
  Network, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  Server, 
  User, 
  Users, 
  FolderTree, 
  RefreshCw, 
  Search, 
  Lock 
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function ActiveDirectoryView() {
  const { t } = useTranslation();
  const [adData, setAdData] = useState(null);
  const [deletedObjectsList, setDeletedObjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [restoreMessage, setRestoreMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const [statusRes, delRes] = await Promise.all([
        api.getAdStatus(),
        api.getAdDeletedObjects()
      ]);
      setAdData(statusRes || {});
      setDeletedObjectsList(Array.isArray(delRes) ? delRes : (delRes.deletedObjects || []));
    } catch (e) {
      console.error('AD fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRestoreObject = async (obj) => {
    try {
      const id = obj.id || obj.objectGuid || obj.guid;
      setRestoringId(id);
      setRestoreMessage(null);
      const res = await api.restoreAdObject(id);
      if (res && res.success) {
        setRestoreMessage({
          type: 'success',
          text: `"${obj.name || obj.cn}" nesnesi 0 Domain Controller yeniden başlatması ile başarıyla canlandırıldı (Tombstone Reanimated).`
        });
        fetchStatus();
      }
    } catch (e) {
      alert('Geri yükleme hatası: ' + e.message);
    } finally {
      setRestoringId(null);
    }
  };

  const filteredObjects = deletedObjectsList.filter(o => 
    (o.name || o.cn || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (o.type || o.objectClass || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.id || o.guid || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl shadow-md">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>Active Directory & Domain Controller Granular Kurtarma</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                0 DC Reboot Tombstone Reanimation
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Silinen kullanıcıları, güvenlik gruplarını ve OU'ları Domain Controller sunucusunu yeniden başlatmadan (0 Reboot) SID, parola ve grup üyelikleriyle anında geri canlandırın.
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-300 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {restoreMessage && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{restoreMessage.text}</span>
        </div>
      )}

      {/* Grid: AD Telemetry & Tombstone Bin */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 1 Col: AD Telemetry */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Domain Controller Durumu</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Domain:</span>
                <span className="font-bold text-slate-800">{adData?.domainName || 'SIRKET.LOCAL'}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Forest Level:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[130px]">{adData?.forestMode || 'Server 2022'}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Recycle Bin:</span>
                <span className="font-bold text-emerald-700">{adData?.activeDirectoryRecycleBin || 'ENABLED'}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Tombstone Ömrü:</span>
                <span className="font-bold text-emerald-700">{adData?.tombstoneLifetimeDays || 180} Gün</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Aktif Kullanıcı:</span>
                <span className="font-semibold text-slate-700">{adData?.totalActiveUsers || 342} User</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Geri Yükleme Garantisi</span>
            </h3>
            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Orijinal SID ve GUID korunur, ACL izinleri bozulmaz.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Kullanıcı şifre karmaları (Password Hash) sıfırlanmadan geri döner.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Üyesi olunan tüm Global/Universal gruplar otomatik restore edilir.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 3 Cols: Tombstone Object Bin */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Silinen Nesneler Çöp Kutusu ({filteredObjects.length})</span>
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Silinen kullanıcı, grup veya GUID ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 font-semibold">Tür</th>
                  <th className="p-3 font-semibold">Nesne Adı</th>
                  <th className="p-3 font-semibold">Orijinal OU</th>
                  <th className="p-3 font-semibold">Silinme Tarihi</th>
                  <th className="p-3 font-semibold">Kalan Gün</th>
                  <th className="p-3 font-semibold text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredObjects.map((obj) => {
                  const id = obj.id || obj.objectGuid || obj.guid;
                  const type = obj.type || obj.objectClass || 'user';
                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {type === 'user' && <User className="w-3 h-3 text-blue-600" />}
                          {type === 'group' && <Users className="w-3 h-3 text-purple-600" />}
                          {type === 'organizationalUnit' && <FolderTree className="w-3 h-3 text-amber-600" />}
                          {type}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        <div>{obj.name || obj.cn}</div>
                        <div className="text-[10px] font-mono text-slate-400">{id}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">{obj.originalPath || obj.lastKnownParent || 'OU=Users,DC=sirket,DC=local'}</td>
                      <td className="p-3 text-slate-500">{new Date(obj.deletedDate || obj.deletedWhen || Date.now()).toLocaleString('tr-TR')}</td>
                      <td className="p-3 font-bold text-amber-600">{obj.remainingDays || obj.tombstoneExpiresInDays || 178} Gün</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleRestoreObject(obj)}
                          disabled={restoringId === id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition disabled:opacity-50 ml-auto"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${restoringId === id ? 'animate-spin' : ''}`} />
                          <span>{restoringId === id ? 'Kurtarılıyor...' : '0 DC Reboot Geri Yükle'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredObjects.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400">
                      Silinmiş veya geri yüklenecek Active Directory nesnesi bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
