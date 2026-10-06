import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  RefreshCw, 
  AlertTriangle,
  FileText,
  Key
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function FourEyesSecurityView() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [pinCode, setPinCode] = useState('123456');
  const [actionNotice, setActionNotice] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getFourEyesRequests();
      if (res && res.requests) {
        setRequests(res.requests);
      }
    } catch (e) {
      console.error('Four-Eyes fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (reqId) => {
    try {
      setApprovingId(reqId);
      setActionNotice(null);
      const res = await api.approveFourEyesRequest({
        requestId: reqId,
        approverUser: 'superadmin.guvenlik@sirket.com (2FA Onaylandı)',
        pinCode
      });
      if (res && res.success) {
        setActionNotice({ type: 'success', text: res.message });
        fetchRequests();
      }
    } catch (e) {
      alert('Onaylama hatası: ' + e.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (reqId) => {
    const reason = window.prompt('Lütfen reddetme gerekçesini belirtin:', 'Güvenlik politikalarına aykırı işlem reddedildi.');
    if (reason === null) return;

    try {
      setRejectingId(reqId);
      setActionNotice(null);
      const res = await api.rejectFourEyesRequest({
        requestId: reqId,
        approverUser: 'ciso.denetim@sirket.com',
        reason
      });
      if (res && res.success) {
        setActionNotice({ type: 'warning', text: res.message });
        fetchRequests();
      }
    } catch (e) {
      alert('Reddetme hatası: ' + e.message);
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-rose-600 to-amber-600 text-white rounded-xl shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>Dört Göz Kuralı (Four-Eyes Principle) & Çift Yönetici Onay Havuzu</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                Zero-Trust Dual-Control
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              WORM kilitlerini kaldırma, yedek arşivlerini kalıcı silme veya şifreleme anahtarlarını sıfırlama gibi yıkıcı işlemler en az 2 farklı yöneticinin eş zamanlı 2FA onayı olmadan icra edilemez.
            </p>
          </div>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-300 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {actionNotice && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 font-medium ${
          actionNotice.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
            : 'bg-amber-50 border-amber-300 text-amber-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Grid: 2FA PIN Input & Request Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 1 Col: Approver Credentials */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600" />
              <span>2. Yönetici Yetki PIN'i</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Master 2FA / Güvenlik Kodu</label>
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Master PIN (123456)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-rose-600 font-mono tracking-widest text-center"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Yedek Güvenlik PIN: 123456</span>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200 text-[11px] text-rose-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                  <span>Dual-Control Koruması Aktif</span>
                </div>
                <p>İç tehdit veya ransomware bulaşması durumunda tek bir ele geçirilmiş admin hesabı yedekleri silemez.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 3 Cols: Pending Approval Table */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Kritik İşlem Onay Kuyruğu</span>
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 font-semibold">İşlem & Kaynak</th>
                  <th className="p-3 font-semibold">Talep Eden (1. Admin)</th>
                  <th className="p-3 font-semibold">Tarih</th>
                  <th className="p-3 font-semibold">Durum</th>
                  <th className="p-3 font-semibold text-right">2. Yönetici Kararı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => {
                  const isPending = r.status === 'PENDING_SECOND_APPROVAL';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-800">
                        <div>{r.actionLabel}</div>
                        <div className="text-[10px] font-mono text-slate-400">{r.targetResource}</div>
                        {r.notes && <div className="text-[10px] text-slate-500 font-normal italic mt-0.5">Not: {r.notes}</div>}
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        <div>{r.initiator}</div>
                        <div className="text-[10px] text-slate-400">IP: {r.initiatorIp}</div>
                      </td>
                      <td className="p-3 text-slate-500">{new Date(r.requestDate).toLocaleDateString('tr-TR')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isPending 
                            ? 'bg-amber-50 text-amber-700 border-amber-300' 
                            : r.status === 'APPROVED' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}>
                          {isPending ? '2. ONAY BEKLİYOR' : r.status === 'APPROVED' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(r.id)}
                              disabled={approvingId === r.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{approvingId === r.id ? 'Onaylanıyor...' : 'Onayla (2FA)'}</span>
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              disabled={rejectingId === r.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Reddet</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500 font-mono text-right">
                            {r.secondApprover}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
