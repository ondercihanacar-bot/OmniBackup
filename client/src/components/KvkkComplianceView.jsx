import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  RefreshCw,
  Lock,
  Flame,
  Award
} from 'lucide-react';
import { api } from '../api';
import { useTranslation } from '../i18n';

export default function KvkkComplianceView() {
  const { t } = useTranslation();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [erasing, setErasing] = useState(false);
  const [subjectQuery, setSubjectQuery] = useState('');
  const [legalBasis, setLegalBasis] = useState('KVKK Madde 7 (Unutulma Hakkı Başvurusu)');
  const [actionNotice, setActionNotice] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getKvkkOverview();
      if (res && res.success) {
        setOverview(res);
      }
    } catch (e) {
      console.error('KVKK fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleScan = async () => {
    try {
      setScanning(true);
      setActionNotice(null);
      const res = await api.runKvkkScan('ALL');
      if (res && res.success) {
        setActionNotice({ type: 'success', text: res.message });
        fetchOverview();
      }
    } catch (e) {
      alert('Tarama hatası: ' + e.message);
    } finally {
      setScanning(false);
    }
  };

  const handleExecuteErasure = async (e) => {
    e.preventDefault();
    if (!subjectQuery) return;
    if (!window.confirm(`"${subjectQuery}" kimliği için tüm yedek arşivlerinde "Unutulma Hakkı & Kriptografik İmha" işlemi başlatılacak. Onaylıyor musunuz?`)) return;

    try {
      setErasing(true);
      setActionNotice(null);
      const res = await api.executeKvkkErasure({
        subjectQuery,
        legalBasis
      });
      if (res && res.success) {
        setActionNotice({
          type: 'certificate',
          text: res.message,
          cert: res.certificate
        });
        setSubjectQuery('');
        fetchOverview();
      }
    } catch (err) {
      alert('İmha hatası: ' + err.message);
    } finally {
      setErasing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl shadow-md">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>KVKK & GDPR Uyum Suiti — "Unutulma Hakkı" ve PII Maskeleme</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Cryptographic Erasure (Zero Disruption)
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Yedek arşivlerindeki TCKN, kredi kartı ve sağlık verilerini otomatik keşfedin; yasal başvurularda arşivleri bozmadan ilgili kişiye ait verileri kriptografik olarak imha edin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm disabled:opacity-50"
          >
            <Search className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Taranıyor...' : 'Tüm Arşivleri PII Tara'}</span>
          </button>
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice.text}</span>
          </div>
          {actionNotice.cert && (
            <div className="bg-white p-3 rounded-lg border border-emerald-200 font-mono text-[11px] space-y-1 text-slate-700">
              <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Yasal İcra & Uyum Sertifikası: {actionNotice.cert.id}</span>
              </div>
              <div>Kişi: <b>{actionNotice.cert.subjectIdentifier}</b></div>
              <div>Dayanak: <b>{actionNotice.cert.legalBasis}</b></div>
              <div className="text-[10px] text-slate-400 break-all">{actionNotice.cert.certificateSha256}</div>
            </div>
          )}
        </div>
      )}

      {/* Grid: PII Scanner Findings & Cryptographic Erasure Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Cryptographic Erasure Tool */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Kriptografik İmha (Unutulma Hakkı)</span>
          </h2>

          <form onSubmit={handleExecuteErasure} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Silinecek Kimlik / TCKN / E-Posta</label>
              <input
                type="text"
                required
                placeholder="Örn: TCKN 29845019281 veya isim"
                value={subjectQuery}
                onChange={(e) => setSubjectQuery(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Yasal Dayanak & Talep No</label>
              <input
                type="text"
                required
                value={legalBasis}
                onChange={(e) => setLegalBasis(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800">Nasıl Çalışır?</div>
              <p>Yedeklerin tamamını silmek yerine, yalnızca bu kişiye ait alt blokların şifreleme anahtarları kalıcı imha edilir (Cryptographic Shredding).</p>
            </div>

            <button
              type="submit"
              disabled={erasing}
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-bold rounded-lg shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{erasing ? 'İmha Ediliyor...' : 'Kriptografik Olarak İmha Et'}</span>
            </button>
          </form>
        </div>

        {/* Right 2 Cols: PII Items Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Yedek Arşivlerinde Tespit Edilen Hassas PII Verileri ({overview?.totalPiiMatches?.toLocaleString() || 0})</span>
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 font-semibold">Arşiv / Tablo</th>
                  <th className="p-3 font-semibold">Hassas Veri Türü</th>
                  <th className="p-3 font-semibold">Eşleşen Kayıt</th>
                  <th className="p-3 font-semibold">Risk Seviyesi</th>
                  <th className="p-3 font-semibold">Uyum Durumu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview?.piiItems?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-bold text-slate-800">
                      <div>{item.tableName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.resourceName}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-700">{item.piiType}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{item.matchCount?.toLocaleString()} Kayıt</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-600">{item.complianceStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
