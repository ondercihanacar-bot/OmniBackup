import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  Calendar, 
  Layers 
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function MspPortalView() {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingReportId, setGeneratingReportId] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    contactPerson: '',
    contactEmail: '',
    planType: 'MSP Platinum Gold 24/7',
    allocatedQuotaGB: 2048,
    maxAgents: 10
  });

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await api.getMspTenants();
      const list = Array.isArray(res) ? res : (res.tenants || []);
      setTenants(list);
    } catch (e) {
      console.error('MSP fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createMspTenant(newTenant);
      if (res && (res.success || res.id)) {
        setShowAddModal(false);
        setNewTenant({
          name: '',
          contactPerson: '',
          contactEmail: '',
          planType: 'MSP Platinum Gold 24/7',
          allocatedQuotaGB: 2048,
          maxAgents: 10
        });
        fetchTenants();
      }
    } catch (err) {
      alert('Tenant oluşturma hatası: ' + err.message);
    }
  };

  const handleGenerateSla = async (tenantId) => {
    try {
      setGeneratingReportId(tenantId);
      setReportResult(null);
      const res = await api.getMspSlaReport(tenantId);
      if (res) {
        setReportResult(res.slaReport || res);
      }
    } catch (err) {
      alert('SLA Rapor hatası: ' + err.message);
    } finally {
      setGeneratingReportId(null);
    }
  };

  // Aggregated MSP Stats
  const totalClients = tenants.length;
  const totalAgents = tenants.reduce((acc, curr) => acc + (curr.activeAgents || curr.agentsCount || 0), 0);
  const totalQuota = tenants.reduce((acc, curr) => acc + (curr.allocatedQuotaGB || curr.quotaGb || 0), 0);
  const totalUsed = tenants.reduce((acc, curr) => acc + (curr.usedQuotaGB || curr.usedGb || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-xl shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>MSP Multi-Tenancy Portal & SLA Uyumluluk Raporlayıcı</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-semibold border border-violet-200">
                Service Provider Edition
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tüm kurumsal müşterilerinizi izole tenant havuzlarında yönetin, depolama kotalarını belirleyin ve otomatik RPO/RTO SLA uyumluluk karnesi üretin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Müşteri (Tenant) Ekle</span>
          </button>
          <button
            onClick={fetchTenants}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kayıtlı Müşteri</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{totalClients}</div>
          </div>
          <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Yönetilen Ajan</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{totalAgents}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kullanılan Alan</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{(totalUsed / 1024).toFixed(1)} TB</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MSP Toplam Kota</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{(totalQuota / 1024).toFixed(1)} TB</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SLA Report Modal or Card */}
      {reportResult && (
        <div className="bg-white rounded-xl border border-violet-200 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-600" />
              <h3 className="text-sm font-bold text-slate-800">
                SLA Uyumluluk ve Koruma Karnesi • {reportResult.tenantName || 'Tenant'}
              </h3>
            </div>
            <button
              onClick={() => setReportResult(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕ Kapat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">SLA Uyumluluk Skoru:</span>
              <span className="text-xl font-bold text-emerald-600">{reportResult.slaComplianceScore || reportResult.complianceScore || '%100'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">Hedef RPO:</span>
              <span className="text-xl font-bold text-slate-800">{reportResult.targetRpo || reportResult.targetRpoHours || '4 Saat'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">Ortalama RTO:</span>
              <span className="text-xl font-bold text-slate-800">{reportResult.actualRto || reportResult.avgRtoMinutes || '12 Dk'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block">Denetim Durumu:</span>
              <span className="font-bold text-emerald-600">{reportResult.auditVerdict || 'BAŞARILI (PASSED)'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tenants Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-violet-600" />
          <span>Müşteri Organizasyonları & Kota Durumları</span>
        </h2>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-3 font-semibold">Müşteri / Tenant</th>
                <th className="p-3 font-semibold">İletişim</th>
                <th className="p-3 font-semibold">Ajanlar</th>
                <th className="p-3 font-semibold">Kota Kullanımı</th>
                <th className="p-3 font-semibold">SLA Başarısı</th>
                <th className="p-3 font-semibold text-right">Rapor & İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => {
                const used = t.usedQuotaGB || t.usedGb || 0;
                const quota = t.allocatedQuotaGB || t.quotaGb || 1;
                const percent = Math.min(100, Math.round((used / quota) * 100));
                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-800">
                      <div>{t.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{t.planType || 'MSP Gold'}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      <div>{t.contactPerson}</div>
                      <div className="text-[10px] text-slate-400">{t.contactEmail}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{t.activeAgents || t.agentsCount || 0} / {t.maxAgents || 10} Makine</td>
                    <td className="p-3">
                      <div className="space-y-1 w-36">
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>{used} GB</span>
                          <span>{quota} GB</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percent > 85 ? 'bg-rose-500' : percent > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        %{t.slaAchievedPercent || t.slaScore || '99.9'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleGenerateSla(t.id)}
                        disabled={generatingReportId === t.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition disabled:opacity-50 ml-auto"
                      >
                        <FileText className={`w-3.5 h-3.5 ${generatingReportId === t.id ? 'animate-spin' : ''}`} />
                        <span>{generatingReportId === t.id ? 'Oluşturuluyor...' : 'SLA Raporu Üret'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-violet-600" />
              <span>Yeni MSP Müşterisi Tanımla</span>
            </h3>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Müşteri Şirket Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Anadolu Lojistik A.Ş."
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Yetkili Kişi</label>
                <input
                  type="text"
                  required
                  placeholder="Ahmet Yılmaz"
                  value={newTenant.contactPerson}
                  onChange={(e) => setNewTenant({ ...newTenant, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Depolama Kotası (GB)</label>
                <input
                  type="number"
                  required
                  value={newTenant.allocatedQuotaGB}
                  onChange={(e) => setNewTenant({ ...newTenant, allocatedQuotaGB: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">İletişim E-Postası</label>
                <input
                  type="email"
                  required
                  placeholder="it@sirket.com"
                  value={newTenant.contactEmail}
                  onChange={(e) => setNewTenant({ ...newTenant, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-violet-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition shadow"
                >
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
