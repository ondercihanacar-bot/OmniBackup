import React, { useState } from 'react';
import { 
  HardDrive, 
  Trash2, 
  CheckCircle2, 
  Cloud, 
  Share2, 
  Plus, 
  FolderOpen, 
  X,
  Server,
  Zap,
  Lock
} from 'lucide-react';
import FolderPickerModal from './FolderPickerModal';

export default function DestinationsView({ destinations, onCreateDestination, onDeleteDestination }) {
  const [showModal, setShowModal] = useState(false);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('local');
  const [path, setPath] = useState('D:\\OmniBackups');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totalSpace, setTotalSpace] = useState('1000 GB');

  const handleFolderSelected = (selectedPath) => {
    if (!selectedPath) return;
    setPath(selectedPath);
    if (selectedPath.startsWith('\\\\')) {
      setType('nas');
    } else {
      setType('local');
    }
    if (!name.trim()) {
      setName(`Depolama (${selectedPath})`);
    }
    setFolderPickerOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!path.trim()) {
      alert("Lütfen geçerli bir hedef klasör yolu belirtiniz.");
      return;
    }
    const finalName = name.trim() || `Yedek Deposu (${path.trim()})`;
    onCreateDestination({
      name: finalName,
      type,
      path: path.trim(),
      username,
      totalSpace,
      isDefault: destinations.length === 0
    });
    setName('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">
            Storage Locations (Depolama Havuzları)
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
            {destinations.length} Depo
          </span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-acronis-primary px-4 py-2 flex items-center gap-2 text-xs shadow-xs uppercase font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>+ YENİ DEPO EKLE</span>
        </button>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest) => {
          const isCloud = dest.type === 'gdrive' || dest.type === 'cloud';
          const isNas = dest.type === 'nas' || dest.type === 'network';

          return (
            <div 
              key={dest.id} 
              className="acronis-card p-6 bg-white space-y-4 hover:border-[#0070e0]/40 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isCloud ? 'bg-sky-50 text-[#0070e0]' : isNas ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-700'}`}>
                    {isCloud ? <Cloud className="w-6 h-6" /> : isNas ? <Share2 className="w-6 h-6" /> : <HardDrive className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 tracking-tight">{dest.name}</h3>
                    <span className="text-[11px] text-slate-400 capitalize">{dest.type} Deposu</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteDestination(dest.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition"
                  title="Depoyu Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hedef Yolu:</span>
                  <span className="font-mono font-medium text-slate-800 text-[11px] truncate max-w-[170px]" title={dest.path}>
                    {dest.path}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Durum:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bağlı & Hazır
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">WORM Koruması:</span>
                  <span className="text-slate-700 font-semibold font-mono text-[10px]">
                    ● Immutable WORM Kilitli
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Destination Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800">Yeni Depolama Konumu Ekle</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Depo Başlığı</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Google Drive veya Yerel Yedek Deposu"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:bg-white focus:border-[#0070e0]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Depolama Türü</label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    if (e.target.value === 'gdrive') setPath('G:\\Drive\'ım\\OmniBackups');
                    else setPath('C:\\OmniBackups');
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:bg-white focus:border-[#0070e0]"
                >
                  <option value="gdrive">Google Drive Doğrudan Bulut Yayını</option>
                  <option value="local">Yerel Disk (Local Drive)</option>
                  <option value="nas">Ağ Paylaşımı / NAS (SMB / CIFS)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-semibold">Hedef Klasör Yolu</label>
                  <button
                    type="button"
                    onClick={() => setFolderPickerOpen(true)}
                    className="text-[#0070e0] font-semibold hover:underline"
                  >
                    Gözat
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono focus:outline-none focus:bg-white focus:border-[#0070e0]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-acronis-outline w-1/2 py-2 text-xs"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn-acronis-primary w-1/2 py-2 text-xs font-bold"
                >
                  Depoyu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {folderPickerOpen && (
        <FolderPickerModal
          isOpen={folderPickerOpen}
          onClose={() => setFolderPickerOpen(false)}
          onSelect={handleFolderSelected}
          onSelectPath={handleFolderSelected}
          initialPath={path}
          currentSelectedPath={path}
        />
      )}
    </div>
  );
}
