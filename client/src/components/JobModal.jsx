import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Cloud, 
  Database, 
  Calendar, 
  Lock, 
  Info, 
  Server, 
  X, 
  FolderOpen, 
  Check, 
  HelpCircle, 
  Clock, 
  Layers, 
  Sparkles, 
  CalendarDays, 
  Repeat, 
  Sliders, 
  Plus, 
  HardDrive, 
  Monitor, 
  Cpu, 
  ListTree, 
  Network,
  RefreshCw,
  Key,
  User,
  Globe,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import FolderPickerModal from './FolderPickerModal';
import { api } from '../api';

export default function JobModal({ isOpen, onClose, onSave, job, destinations, agents }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: job ? job.name : '', // User creates their own plan name freely
    type: job?.type || 'folder', // 'image', 'sql', 'folder'
    imageSubType: job?.imageSubType || 'windows_client', // 'windows_client', 'windows_server', 'hyperv'
    sourceDisk: job?.sourceDisk || 'C:',
    vmName: job?.vmName || 'HyperV_VM01',
    sqlType: job?.sqlType || 'mssql',
    serverAddress: job?.serverAddress || '127.0.0.1',
    instanceName: job?.instanceName || 'MSSQLSERVER',
    authType: job?.authType || 'windows',
    username: job?.username || 'sa',
    password: job?.password || '',
    databaseName: job?.databaseName || 'ERP_PROD_DB',
    backupType: job?.backupType || 'full',
    sourcePath: job?.sourcePath || '',
    selectedItems: job?.selectedItems || [],
    excludedPaths: job?.excludedPaths || [],
    destinationId: job?.destinationId || destinations[0]?.id || 'dest-local',
    destCategory: job?.destCategory || 'local', // 'local', 'nas', 'cloud'
    customDestinationPath: job?.customDestinationPath || job?.destinationPath || '',
    destinationPath: job?.destinationPath || job?.customDestinationPath || '',
    // NAS Config
    nasHost: job?.nasHost || '',
    nasShare: job?.nasShare || '',
    nasSubFolder: job?.nasSubFolder || '',
    nasUsername: job?.nasUsername || '',
    nasPassword: job?.nasPassword || '',
    // Cloud Config
    cloudProvider: job?.cloudProvider || 's3', // 's3', 'gdrive', 'azure'
    cloudEndpoint: job?.cloudEndpoint || '',
    cloudBucket: job?.cloudBucket || '',
    cloudRegion: job?.cloudRegion || 'eu-central-1',
    cloudAccessKey: job?.cloudAccessKey || '',
    cloudSecretKey: job?.cloudSecretKey || '',
    cloudGdriveFolderId: job?.cloudGdriveFolderId || '',
    cloudAzureAccount: job?.cloudAzureAccount || '',
    cloudAzureKey: job?.cloudAzureKey || '',
    // Schedule
    scheduleType: job?.scheduleType || 'daily', // hourly, daily, weekly, monthly, continuous
    scheduleHour: job?.scheduleHour || '22',
    scheduleMinute: job?.scheduleMinute || '00',
    scheduleHourlyInterval: job?.scheduleHourlyInterval || '4', // every 4 hours
    scheduleDays: job?.scheduleDays || [1, 2, 3, 4, 5], // Monday - Friday
    scheduleMonthDay: job?.scheduleMonthDay || '1',
    schedule: job?.schedule || '0 22 * * *',
    scheduleHuman: job?.scheduleHuman || 'Her gün saat 22:00\'de',
    retentionDays: job?.retentionDays || 90,
    compress: job?.compress !== false,
    encrypt: !!job?.encrypt,
    encryptionPassword: job?.encryptionPassword || '',
    useVss: job?.useVss !== false,
    enabled: job?.enabled !== false,
    agentId: job?.agentId || agents[0]?.id || 'agent-srv-01',
    isImmutable: job?.isImmutable !== false,
    immutableDays: job?.immutableDays || 30,
    scanRansomware: job?.scanRansomware !== false
  });

  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('source'); // 'source' or 'destination'
  const [localDestinations, setLocalDestinations] = useState(destinations || []);
  const [scheduleMode, setScheduleMode] = useState(job?.scheduleType || 'daily');
  const [selectedDays, setSelectedDays] = useState(job?.scheduleDays || [1, 2, 3, 4, 5]);
  const [execTime, setExecTime] = useState(
    job?.scheduleHour && job?.scheduleMinute 
      ? `${String(job.scheduleHour).padStart(2, '0')}:${String(job.scheduleMinute).padStart(2, '0')}`
      : '22:00'
  );
  const [hourlyInterval, setHourlyInterval] = useState(job?.scheduleHourlyInterval || '4');
  const [monthDay, setMonthDay] = useState(job?.scheduleMonthDay || '1');
  const [showPassword, setShowPassword] = useState(false);

  // Connection Testing States
  const [sourceTestStatus, setSourceTestStatus] = useState(null);
  const [localTestStatus, setLocalTestStatus] = useState(null);
  const [nasTestStatus, setNasTestStatus] = useState(null);
  const [cloudTestStatus, setCloudTestStatus] = useState(null);

  useEffect(() => {
    setLocalDestinations(destinations || []);
  }, [destinations]);

  useEffect(() => {
    if (job) {
      setFormData(job);
      if (job.scheduleType) setScheduleMode(job.scheduleType);
      if (job.scheduleDays) setSelectedDays(job.scheduleDays);
      if (job.scheduleHour && job.scheduleMinute) {
        setExecTime(`${String(job.scheduleHour).padStart(2, '0')}:${String(job.scheduleMinute).padStart(2, '0')}`);
      }
    }
  }, [job]);

  // Sync cron expression and human readable text whenever schedule options change
  useEffect(() => {
    const [hh, mm] = execTime.split(':');
    const cleanMin = parseInt(mm || '0', 10).toString();
    const cleanHour = parseInt(hh || '22', 10).toString();
    let cron = '0 22 * * *';
    let human = 'Her gün saat 22:00\'de';

    if (scheduleMode === 'hourly') {
      cron = `0 */${hourlyInterval} * * *`;
      human = `Her ${hourlyInterval} saatte bir kesintisiz`;
    } else if (scheduleMode === 'daily') {
      cron = `${cleanMin} ${cleanHour} * * *`;
      human = `Her gün saat ${execTime}'de`;
    } else if (scheduleMode === 'weekly') {
      const daysStr = selectedDays.length > 0 ? selectedDays.join(',') : '*';
      const dayNames = {
        1: 'Pzt', 2: 'Sal', 3: 'Çar', 4: 'Per', 5: 'Cum', 6: 'Cmt', 0: 'Paz'
      };
      const names = selectedDays.map(d => dayNames[d]).join(', ');
      cron = `${cleanMin} ${cleanHour} * * ${daysStr}`;
      human = `Haftalık (${names}) saat ${execTime}'de`;
    } else if (scheduleMode === 'monthly') {
      cron = `${cleanMin} ${cleanHour} ${monthDay} * *`;
      human = `Her ayın ${monthDay}. günü saat ${execTime}'de`;
    } else if (scheduleMode === 'continuous') {
      cron = '*/15 * * * *';
      human = 'Sürekli Veri Koruma (CDP - Her 15 dakikada)';
    }

    setFormData(prev => ({
      ...prev,
      scheduleType: scheduleMode,
      scheduleHour: cleanHour,
      scheduleMinute: cleanMin,
      scheduleDays: selectedDays,
      scheduleHourlyInterval: hourlyInterval,
      scheduleMonthDay: monthDay,
      schedule: cron,
      scheduleHuman: human
    }));
  }, [scheduleMode, selectedDays, execTime, hourlyInterval, monthDay]);

  const toggleDay = (dayNum) => {
    setSelectedDays(prev => {
      if (prev.includes(dayNum)) {
        if (prev.length === 1) return prev; // keep at least 1 day
        return prev.filter(d => d !== dayNum);
      } else {
        return [...prev, dayNum].sort();
      }
    });
  };

  // Folder Picker Callback
  const handleSelectFolder = async (selectedPath, selectedArray = [], excludedArray = []) => {
    if (!selectedPath) return;
    if (pickerTarget === 'source') {
      setFormData(prev => ({ 
        ...prev, 
        sourcePath: selectedPath,
        selectedItems: selectedArray && selectedArray.length > 0 ? selectedArray : [selectedPath],
        excludedPaths: excludedArray || []
      }));
      setSourceTestStatus(null);
    } else {
      // Destination mode
      const isNas = selectedPath.startsWith('\\\\');
      const destName = isNas ? `NAS Paylaşımı (${selectedPath})` : `Yerel Yedekleme Diski (${selectedPath})`;
      
      setFormData(prev => ({
        ...prev,
        customDestinationPath: selectedPath,
        destinationPath: selectedPath,
        destCategory: isNas ? 'nas' : 'local'
      }));
      setLocalTestStatus(null);

      // Create or select destination for this target folder
      try {
        const res = await api.createDestination({
          name: destName,
          type: isNas ? 'nas' : 'local',
          path: selectedPath,
          totalSpace: '1000 GB'
        });
        if (res && res.destination) {
          setLocalDestinations(prev => {
            const exists = prev.some(d => d.id === res.destination.id || d.path === selectedPath);
            return exists ? prev : [...prev, res.destination];
          });
          setFormData(prev => ({ 
            ...prev, 
            destinationId: res.destination.id,
            customDestinationPath: selectedPath,
            destinationPath: selectedPath
          }));
        }
      } catch (err) {
        console.error("Auto create destination error:", err);
      }
    }
    setFolderPickerOpen(false);
  };

  // --------------------------------------------------------------------------
  // TEST CONNECTION HANDLERS
  // --------------------------------------------------------------------------
  const handleTestSource = async () => {
    if (!formData.sourcePath || !formData.sourcePath.trim()) {
      setSourceTestStatus({ success: false, message: 'Lütfen önce ağaçtan bir kaynak klasör seçin.' });
      return;
    }
    setSourceTestStatus({ loading: true });
    try {
      const res = await api.testLocalConnection(formData.sourcePath);
      setSourceTestStatus({
        loading: false,
        success: res.success,
        message: res.success ? `Kaynak Klasör Doğrulandı: ${res.path} erişilebilir.` : res.error
      });
    } catch (err) {
      setSourceTestStatus({ loading: false, success: false, message: 'Doğrulama hatası: ' + err.message });
    }
  };

  const handleTestLocal = async () => {
    const p = formData.customDestinationPath || formData.destinationPath;
    if (!p || !p.trim()) {
      setLocalTestStatus({ success: false, message: 'Lütfen bir hedef klasör yolu girin veya ağaçtan seçin.' });
      return;
    }
    setLocalTestStatus({ loading: true });
    try {
      const res = await api.testLocalConnection(p);
      setLocalTestStatus({
        loading: false,
        success: res.success,
        message: res.success ? `Klasör erişilebilir ve yazma izinleri doğrulandı: ${res.path}` : res.error
      });
    } catch (err) {
      setLocalTestStatus({ loading: false, success: false, message: 'Bağlantı hatası: ' + err.message });
    }
  };

  const handleTestNas = async () => {
    const host = formData.nasHost?.trim();
    if (!host) {
      setNasTestStatus({ success: false, message: 'Lütfen NAS sunucu IP adresini veya adını girin.' });
      return;
    }
    setNasTestStatus({ loading: true });
    try {
      const res = await api.testNasConnection({
        host,
        share: formData.nasShare,
        username: formData.nasUsername,
        password: formData.nasPassword,
        path: formData.customDestinationPath
      });
      setNasTestStatus({
        loading: false,
        success: res.success,
        message: res.success ? res.message : res.error
      });
    } catch (err) {
      setNasTestStatus({ loading: false, success: false, message: 'NAS bağlantı testi hatası: ' + err.message });
    }
  };

  const handleTestCloud = async () => {
    setCloudTestStatus({ loading: true });
    try {
      const res = await api.testCloudConnection({
        provider: formData.cloudProvider || 's3',
        endpoint: formData.cloudEndpoint,
        bucket: formData.cloudBucket,
        accessKey: formData.cloudAccessKey,
        secretKey: formData.cloudSecretKey,
        region: formData.cloudRegion,
        gdriveFolderId: formData.cloudGdriveFolderId
      });
      setCloudTestStatus({
        loading: false,
        success: res.success,
        message: res.success ? res.message : res.error
      });
    } catch (err) {
      setCloudTestStatus({ loading: false, success: false, message: 'Bulut bağlantı hatası: ' + err.message });
    }
  };

  // Form Submit
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!formData.name || !formData.name.trim()) {
      alert("Lütfen koruma planınız için bir isim belirleyin.");
      return;
    }

    if (formData.type === 'folder' && (!formData.sourcePath || !formData.sourcePath.trim())) {
      alert("Lütfen yedeklenecek en az bir kaynak klasör seçin.");
      return;
    }

    // Auto-sync destination path based on category
    let finalData = { ...formData };
    if (formData.destCategory === 'nas') {
      const host = formData.nasHost?.trim();
      const share = formData.nasShare?.trim() || 'Backups';
      const sub = formData.nasSubFolder?.trim() ? `\\${formData.nasSubFolder.trim()}` : '';
      if (host) {
        const unc = `\\\\${host}\\${share}${sub}`;
        finalData.customDestinationPath = unc;
        finalData.destinationPath = unc;
      }
    } else if (formData.destCategory === 'cloud') {
      if (formData.cloudProvider === 'gdrive') {
        const p = `GoogleDrive://${formData.cloudGdriveFolderId?.trim() || 'Root'}`;
        finalData.customDestinationPath = p;
        finalData.destinationPath = p;
      } else {
        const p = `S3://${formData.cloudBucket?.trim() || 'DefaultBucket'}`;
        finalData.customDestinationPath = p;
        finalData.destinationPath = p;
      }
    }

    onSave(finalData);
  };

  // Filter destinations based on selected destination category
  const filteredDestinations = localDestinations.filter(d => {
    if (formData.destCategory === 'nas') return d.type === 'nas' || d.path?.startsWith('\\\\');
    if (formData.destCategory === 'cloud') return d.type === 'gdrive' || d.type === 's3' || d.type === 'cloud';
    return d.type === 'local' || (!d.path?.startsWith('\\\\') && d.type !== 'gdrive' && d.type !== 's3');
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      
      {/* Responsive Auto-Fit Modal Box */}
      <div className="w-full max-w-4xl max-h-[94vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Pinned Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <button 
              type="button" 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-800">
                {formData.name?.trim() ? formData.name : (job ? 'Planı Düzenle' : 'Yeni Koruma Planı')}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                formData.enabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {formData.enabled ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-acronis-outline px-3.5 py-1.5 text-xs font-semibold"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-acronis-primary px-4 py-1.5 text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{job ? 'Değişiklikleri Kaydet' : 'Planı Oluştur'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs text-slate-700">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5">
            
            {/* ============================================================== */}
            {/* LEFT COLUMN: PLAN NAME, SOURCE, DESTINATION & TESTS            */}
            {/* ============================================================== */}
            <div className="space-y-4">
              
              {/* Card 0: Custom Plan Name (User Defines Name) */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0070e0]" />
                    <span>Koruma Planı Adı <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[10px] text-blue-700 font-semibold">Özel İsimlendirme</span>
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Koruma planınız için bir isim belirleyin (Örn: Muhasebe Dosyaları, Sunucu İmajı...)"
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 bg-white font-bold text-slate-800 text-xs focus:outline-none focus:border-[#0070e0] focus:ring-2 focus:ring-blue-100 transition placeholder:font-normal placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Card 1: Backup State & Active Toggle */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 text-xs block">Yedekleme Canlı Koruması</span>
                  <span className="text-[11px] text-slate-500 font-medium">{formData.scheduleHuman}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#0070e0]"></div>
                </label>
              </div>

              {/* Card 2: Source Type (3-Way: Image Backup, Database, Folder/File Tree) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Yedeklenecek Veri Türü (Source Type)</span>
                  <span className="text-[10px] text-slate-400 font-medium">3 Enterprise Modu</span>
                </div>

                {/* 3 Main Mode Buttons */}
                <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200 text-center font-bold text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'image' })}
                    className={`py-1.5 px-1 rounded transition flex items-center justify-center gap-1 ${
                      formData.type === 'image' 
                        ? 'bg-[#0070e0] text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>İmaj Backup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'sql' })}
                    className={`py-1.5 px-1 rounded transition flex items-center justify-center gap-1 ${
                      formData.type === 'sql' 
                        ? 'bg-[#0070e0] text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Veritabanı</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'folder' })}
                    className={`py-1.5 px-1 rounded transition flex items-center justify-center gap-1 ${
                      formData.type === 'folder' 
                        ? 'bg-[#0070e0] text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Klasör / Dosya</span>
                  </button>
                </div>

                {/* --- Sub-Options: Image Backup (Windows OS, Server, Hyper-V) --- */}
                {formData.type === 'image' && (
                  <div className="p-3 bg-white rounded-lg border border-blue-200/80 space-y-3 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        İmaj Türü (Bare-Metal / OS / Hypervisor):
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-semibold text-center">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageSubType: 'windows_client' })}
                          className={`p-1.5 rounded border transition ${
                            formData.imageSubType === 'windows_client'
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          🪟 Win 10/11 OS
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageSubType: 'windows_server' })}
                          className={`p-1.5 rounded border transition ${
                            formData.imageSubType === 'windows_server'
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          🏢 Windows Server
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageSubType: 'hyperv' })}
                          className={`p-1.5 rounded border transition ${
                            formData.imageSubType === 'hyperv'
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          ⚡ Hyper-V VM
                        </button>
                      </div>
                    </div>

                    {formData.imageSubType === 'hyperv' ? (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hyper-V Sanal Makine Adı</label>
                        <input
                          type="text"
                          value={formData.vmName || 'PROD-SRV-VM01'}
                          onChange={(e) => setFormData({ ...formData, vmName: e.target.value })}
                          placeholder="PROD-SRV-VM01"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono font-medium text-slate-800 focus:outline-none focus:border-[#0070e0]"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kaynak Sistem Sürücüsü</label>
                        <select
                          value={formData.sourceDisk || 'C:'}
                          onChange={(e) => setFormData({ ...formData, sourceDisk: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#0070e0]"
                        >
                          <option value="C:">C: (Sistem + EFI Bootloader + Kurtarma Bölümü)</option>
                          <option value="ALL">Tüm Fiziksel Diskler (Bare-Metal Tam Sistem)</option>
                        </select>
                      </div>
                    )}

                    <div className="p-2 rounded bg-blue-50/70 border border-blue-100 text-[10.5px] text-blue-800 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>VSS Canlı Snapshot ile çalışan işletim sistemi kilitlenmeden bit-by-bit VHDX formatında alınır.</span>
                    </div>
                  </div>
                )}

                {/* --- Sub-Options: Database (SQL) --- */}
                {formData.type === 'sql' && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Veritabanı Türü</label>
                        <select
                          value={formData.sqlType || 'mssql'}
                          onChange={(e) => setFormData({ ...formData, sqlType: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 font-medium text-slate-800 focus:outline-none"
                        >
                          <option value="mssql">MS SQL Server</option>
                          <option value="mysql">MySQL / MariaDB</option>
                          <option value="postgres">PostgreSQL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sunucu / Port</label>
                        <input
                          type="text"
                          value={formData.serverAddress}
                          onChange={(e) => setFormData({ ...formData, serverAddress: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 font-medium text-slate-800 focus:outline-none"
                          placeholder="127.0.0.1:1433"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Veritabanı Adı</label>
                        <input
                          type="text"
                          value={formData.databaseName}
                          onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 font-medium text-slate-800 focus:outline-none"
                          placeholder="ERP_PROD_DB"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kullanıcı (Auth)</label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-2 py-1 rounded border border-slate-300 font-medium text-slate-800 focus:outline-none"
                          placeholder="sa / root"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- Sub-Options: Folder / File Tree --- */}
                {formData.type === 'folder' && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={formData.sourcePath}
                        onChange={(e) => {
                          setFormData({ 
                            ...formData, 
                            sourcePath: e.target.value,
                            selectedItems: [e.target.value]
                          });
                          setSourceTestStatus(null);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-medium text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                        placeholder="Yedeklenecek klasörü ağaçtan seçin (Örn: C:\Test)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPickerTarget('source');
                          setFolderPickerOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 text-xs shadow-2xs shrink-0 transition"
                      >
                        <ListTree className="w-3.5 h-3.5" />
                        <span>Ağaçtan Seç</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleTestSource}
                        disabled={sourceTestStatus?.loading}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 text-xs shrink-0 border border-slate-300 transition"
                        title="Seçilen kaynak klasörün varlığını doğrula"
                      >
                        <RefreshCw className={`w-3 h-3 ${sourceTestStatus?.loading ? 'animate-spin' : ''}`} />
                        <span>Doğrula</span>
                      </button>
                    </div>

                    {/* Source Test Status Feedback Banner */}
                    {sourceTestStatus && (
                      <div className={`p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                        sourceTestStatus.loading 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : sourceTestStatus.success 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {sourceTestStatus.loading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : sourceTestStatus.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>{sourceTestStatus.message}</span>
                      </div>
                    )}

                    {/* Selected Summary Badge */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Klasör başlığıyla arşivlenir (Kök korunur)</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {formData.selectedItems && formData.selectedItems.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold font-mono">
                            {formData.selectedItems.length} Öğe İşaretli
                          </span>
                        )}
                        {formData.excludedPaths && formData.excludedPaths.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold font-mono">
                            {formData.excludedPaths.length} Hariç
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Storage Destination (Local, NAS, Cloud) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Hedef Depolama Konumu</span>
                  <span className="text-[10px] text-slate-400 font-medium">Nereye Yedeklensin?</span>
                </div>

                {/* Destination Category Filter Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200 text-center font-bold text-[10.5px]">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, destCategory: 'local' })}
                    className={`py-1.5 rounded transition flex items-center justify-center gap-1.5 ${
                      formData.destCategory === 'local' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Yerel / Harici Disk</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, destCategory: 'nas' })}
                    className={`py-1.5 rounded transition flex items-center justify-center gap-1.5 ${
                      formData.destCategory === 'nas' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>NAS / Ağ (SMB)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, destCategory: 'cloud' })}
                    className={`py-1.5 rounded transition flex items-center justify-center gap-1.5 ${
                      formData.destCategory === 'cloud' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Bulut (S3 / Drive)</span>
                  </button>
                </div>

                {/* --- MODE A: LOCAL / EXTERNAL DISK --- */}
                {formData.destCategory === 'local' && (
                  <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200 animate-in fade-in">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={formData.customDestinationPath || formData.destinationPath || ''}
                        onChange={(e) => {
                          setFormData({ 
                            ...formData, 
                            customDestinationPath: e.target.value,
                            destinationPath: e.target.value
                          });
                          setLocalTestStatus(null);
                        }}
                        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-medium text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                        placeholder="Yedeklerin saklanacağı hedef klasörü seçin (Örn: D:\OmniBackups)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPickerTarget('destination');
                          setFolderPickerOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 text-xs shadow-2xs shrink-0 transition"
                        title="Hedef klasör seç veya yeni klasör oluştur"
                      >
                        <ListTree className="w-3.5 h-3.5" />
                        <span>Ağaçtan Seç</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleTestLocal}
                        disabled={localTestStatus?.loading}
                        className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 text-xs shrink-0 border border-emerald-300 transition"
                        title="Klasör erişim ve yazma iznini test et"
                      >
                        <RefreshCw className={`w-3 h-3 ${localTestStatus?.loading ? 'animate-spin' : ''}`} />
                        <span>Yazma Testi</span>
                      </button>
                    </div>

                    {/* Local Write Test Status Feedback */}
                    {localTestStatus && (
                      <div className={`p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                        localTestStatus.loading 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : localTestStatus.success 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {localTestStatus.loading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : localTestStatus.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                        <span>{localTestStatus.message}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500 gap-2">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold truncate">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {formData.customDestinationPath || formData.destinationPath 
                            ? `Hedef: ${formData.customDestinationPath || formData.destinationPath}` 
                            : 'Hedef henüz seçilmedi'}
                        </span>
                      </span>

                      {filteredDestinations.length > 0 && (
                        <select
                          value={formData.destinationId}
                          onChange={(e) => {
                            const chosen = filteredDestinations.find(d => d.id === e.target.value);
                            setFormData({ 
                              ...formData, 
                              destinationId: e.target.value,
                              customDestinationPath: chosen?.path || formData.customDestinationPath,
                              destinationPath: chosen?.path || formData.destinationPath
                            });
                            setLocalTestStatus(null);
                          }}
                          className="text-[10.5px] px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none shrink-0"
                        >
                          <option value="">Kayıtlı Hazır Hedefler...</option>
                          {filteredDestinations.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                )}

                {/* --- MODE B: NAS / NETWORK SMB SHARE --- */}
                {formData.destCategory === 'nas' && (
                  <div className="space-y-3 p-3 bg-white rounded-lg border border-slate-200 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          NAS IP / Sunucu Adı <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.nasHost || ''}
                          onChange={(e) => setFormData({ ...formData, nasHost: e.target.value })}
                          placeholder="192.168.1.100 veya nas.local"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Paylaşım Klasörü (Share Name) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.nasShare || ''}
                          onChange={(e) => setFormData({ ...formData, nasShare: e.target.value })}
                          placeholder="Backups veya Yedekler"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Alt Dizin (Opsiyonel)</label>
                        <input
                          type="text"
                          value={formData.nasSubFolder || ''}
                          onChange={(e) => setFormData({ ...formData, nasSubFolder: e.target.value })}
                          placeholder="OmniBackup"
                          className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">SMB Kullanıcı Adı</label>
                        <input
                          type="text"
                          value={formData.nasUsername || ''}
                          onChange={(e) => setFormData({ ...formData, nasUsername: e.target.value })}
                          placeholder="admin / nasuser"
                          className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">SMB Parolası</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.nasPassword || ''}
                            onChange={(e) => setFormData({ ...formData, nasPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none pr-7"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Computed UNC Path Preview & Action Buttons */}
                    <div className="p-2 rounded bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="font-mono text-[11px] text-slate-700 flex items-center gap-1 truncate max-w-[260px]">
                        <span className="text-slate-400 font-semibold">Hedef UNC:</span>
                        <span className="font-bold text-emerald-700 truncate">
                          \\{formData.nasHost || '192.168.1.100'}\{formData.nasShare || 'Backups'}{formData.nasSubFolder ? `\\${formData.nasSubFolder}` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPickerTarget('destination');
                            setFolderPickerOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <ListTree className="w-3 h-3" />
                          <span>Ağaçtan Seç</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleTestNas}
                          disabled={nasTestStatus?.loading}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${nasTestStatus?.loading ? 'animate-spin' : ''}`} />
                          <span>NAS Bağlantısını Test Et</span>
                        </button>
                      </div>
                    </div>

                    {/* NAS Test Status Feedback */}
                    {nasTestStatus && (
                      <div className={`p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                        nasTestStatus.loading 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : nasTestStatus.success 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {nasTestStatus.loading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : nasTestStatus.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                        <span>{nasTestStatus.message}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* --- MODE C: CLOUD STORAGE (S3, GOOGLE DRIVE, AZURE) --- */}
                {formData.destCategory === 'cloud' && (
                  <div className="space-y-3 p-3 bg-white rounded-lg border border-slate-200 animate-in fade-in">
                    
                    {/* Provider Select Tabs */}
                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cloudProvider: 's3' })}
                        className={`px-3 py-1 rounded-md transition ${
                          formData.cloudProvider === 's3' 
                            ? 'bg-sky-600 text-white font-bold' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Amazon S3 & S3 Uyumlu (MinIO/Wasabi)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cloudProvider: 'gdrive' })}
                        className={`px-3 py-1 rounded-md transition ${
                          formData.cloudProvider === 'gdrive' 
                            ? 'bg-sky-600 text-white font-bold' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Google Drive
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cloudProvider: 'azure' })}
                        className={`px-3 py-1 rounded-md transition ${
                          formData.cloudProvider === 'azure' 
                            ? 'bg-sky-600 text-white font-bold' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Microsoft Azure Blob
                      </button>
                    </div>

                    {/* S3 Configuration Fields */}
                    {formData.cloudProvider === 's3' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">S3 Endpoint URL (İsteğe Bağlı)</label>
                            <input
                              type="text"
                              value={formData.cloudEndpoint || ''}
                              onChange={(e) => setFormData({ ...formData, cloudEndpoint: e.target.value })}
                              placeholder="https://s3.eu-central-1.amazonaws.com veya http://192.168.1.50:9000"
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                              S3 Bucket (Kova) Adı <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.cloudBucket || ''}
                              onChange={(e) => setFormData({ ...formData, cloudBucket: e.target.value })}
                              placeholder="sirket-yedekleri-2026"
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Bölge (Region)</label>
                            <input
                              type="text"
                              value={formData.cloudRegion || 'eu-central-1'}
                              onChange={(e) => setFormData({ ...formData, cloudRegion: e.target.value })}
                              placeholder="eu-central-1"
                              className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Access Key ID</label>
                            <input
                              type="text"
                              value={formData.cloudAccessKey || ''}
                              onChange={(e) => setFormData({ ...formData, cloudAccessKey: e.target.value })}
                              placeholder="AKIAIOSFODNN7EXAMPLE"
                              className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Secret Access Key</label>
                            <input
                              type="password"
                              value={formData.cloudSecretKey || ''}
                              onChange={(e) => setFormData({ ...formData, cloudSecretKey: e.target.value })}
                              placeholder="••••••••••••••••••••"
                              className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Google Drive Configuration */}
                    {formData.cloudProvider === 'gdrive' && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Google Drive Hedef Klasör ID (Folder ID)</label>
                          <input
                            type="text"
                            value={formData.cloudGdriveFolderId || ''}
                            onChange={(e) => setFormData({ ...formData, cloudGdriveFolderId: e.target.value })}
                            placeholder="1aBcDeFgHiJkLmNoPqRsTuVwXyZ..."
                            className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:outline-none"
                          />
                        </div>
                        <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5">
                          <Info className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>Google Drive API bağlantısı Service Account ve OAuth 2.0 üzerinden güvenle şifrelenir.</span>
                        </div>
                      </div>
                    )}

                    {/* Azure Blob Configuration */}
                    {formData.cloudProvider === 'azure' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Storage Account Name</label>
                            <input
                              type="text"
                              value={formData.cloudAzureAccount || ''}
                              onChange={(e) => setFormData({ ...formData, cloudAzureAccount: e.target.value })}
                              placeholder="mystorageaccount"
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Container Adı</label>
                            <input
                              type="text"
                              value={formData.cloudBucket || ''}
                              onChange={(e) => setFormData({ ...formData, cloudBucket: e.target.value })}
                              placeholder="backups"
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cloud Test Button & Status */}
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {formData.cloudProvider === 's3' ? 'S3 & Uyumlu Depolama' : formData.cloudProvider === 'gdrive' ? 'Google Drive Cloud' : 'Azure Blob'}
                      </span>
                      <button
                        type="button"
                        onClick={handleTestCloud}
                        disabled={cloudTestStatus?.loading}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${cloudTestStatus?.loading ? 'animate-spin' : ''}`} />
                        <span>Bulut Bağlantısını Test Et</span>
                      </button>
                    </div>

                    {/* Cloud Test Feedback */}
                    {cloudTestStatus && (
                      <div className={`p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                        cloudTestStatus.loading 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : cloudTestStatus.success 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {cloudTestStatus.loading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : cloudTestStatus.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                        <span>{cloudTestStatus.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* ============================================================== */}
            {/* RIGHT COLUMN: SCHEDULE, RETENTION, CYBER SECURITY & ENCRYPTION */}
            {/* ============================================================== */}
            <div className="space-y-4">
              
              {/* Card 4: Schedule Engine */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0070e0]" />
                    <span className="font-bold text-slate-800 text-xs">Otomatik Zamanlama (Schedule)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[#0070e0] font-mono font-bold">
                    {formData.schedule}
                  </span>
                </div>

                {/* Mode Tabs */}
                <div className="grid grid-cols-5 gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[10.5px] font-semibold text-center">
                  {['hourly', 'daily', 'weekly', 'monthly', 'continuous'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setScheduleMode(mode)}
                      className={`py-1 rounded transition capitalize ${
                        scheduleMode === mode ? 'bg-[#0070e0] text-white shadow-xs font-bold' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {mode === 'hourly' ? 'Saatlik' : mode === 'daily' ? 'Günlük' : mode === 'weekly' ? 'Haftalık' : mode === 'monthly' ? 'Aylık' : 'CDP'}
                    </button>
                  ))}
                </div>

                {/* --- Tab Content: HOURLY --- */}
                {scheduleMode === 'hourly' && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 animate-in fade-in">
                    <label className="block text-[11px] font-semibold text-slate-600">Tekrarlama Aralığı:</label>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-medium">
                      {['1', '2', '4', '8'].map(hrs => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => setHourlyInterval(hrs)}
                          className={`py-1.5 rounded border transition ${
                            hourlyInterval === hrs 
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' 
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {hrs} Saatte Bir
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- Tab Content: DAILY --- */}
                {scheduleMode === 'daily' && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-600">Çalışma saati:</label>
                      <input
                        type="time"
                        value={execTime}
                        onChange={(e) => setExecTime(e.target.value)}
                        className="px-2.5 py-1 rounded border border-slate-300 font-mono text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0070e0]"
                      />
                    </div>
                  </div>
                )}

                {/* --- Tab Content: WEEKLY --- */}
                {scheduleMode === 'weekly' && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600">Başlangıç saati:</span>
                      <input
                        type="time"
                        value={execTime}
                        onChange={(e) => setExecTime(e.target.value)}
                        className="px-2.5 py-1 rounded border border-slate-300 font-mono text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0070e0]"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-600 mb-1">Yedekleme Günleri:</span>
                      <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10.5px]">
                        {[
                          { id: 1, label: 'Pzt' },
                          { id: 2, label: 'Sal' },
                          { id: 3, label: 'Çar' },
                          { id: 4, label: 'Per' },
                          { id: 5, label: 'Cum' },
                          { id: 6, label: 'Cmt' },
                          { id: 0, label: 'Paz' }
                        ].map(day => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className={`py-1.5 rounded transition ${
                              selectedDays.includes(day.id)
                                ? 'bg-[#0070e0] text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- Tab Content: MONTHLY --- */}
                {scheduleMode === 'monthly' && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Ayın Günü:</label>
                        <select
                          value={monthDay}
                          onChange={(e) => setMonthDay(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                            <option key={d} value={d}>{d}. Günü</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Saat:</label>
                        <input
                          type="time"
                          value={execTime}
                          onChange={(e) => setExecTime(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-300 font-mono text-xs font-bold text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- Tab Content: CONTINUOUS (CDP) --- */}
                {scheduleMode === 'continuous' && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-600 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span>Sürekli Veri Koruma (CDP) Aktif</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Kaynak klasördeki tüm değişiklikler Windows FileSystemWatcher tarafından gerçek zamanlı dinlenir ve her 15 dakikada bir otomatik senkronize edilir.
                    </p>
                  </div>
                )}

                {/* Retention Period (GFS) */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">Saklama Süresi (Retention GFS):</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={formData.retentionDays}
                      onChange={(e) => setFormData({ ...formData, retentionDays: parseInt(e.target.value, 10) || 30 })}
                      className="w-16 px-2 py-0.5 rounded border border-slate-300 text-center font-bold text-slate-800 text-xs focus:outline-none focus:border-[#0070e0]"
                      min="1"
                      max="3650"
                    />
                    <span className="text-slate-500 font-medium">gün</span>
                  </div>
                </div>
              </div>

              {/* Card 5: Cyber Defense & Shields */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 text-xs block">Siber Savunma & Kalkanlar</span>

                <div className="space-y-2">
                  {/* AES-256 */}
                  <label className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">Askeri AES-256 Şifreleme</span>
                        <span className="text-[10px] text-slate-500">Veri bloklarını anahtarla kilitler</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.encrypt}
                      onChange={(e) => setFormData({ ...formData, encrypt: e.target.checked })}
                      className="w-4 h-4 text-[#0070e0] rounded border-slate-300 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  {formData.encrypt && (
                    <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200/80 animate-in fade-in">
                      <label className="block text-[11px] font-semibold text-amber-900 mb-1">Şifreleme Parolası (Opsiyonel):</label>
                      <input
                        type="password"
                        value={formData.encryptionPassword || ''}
                        onChange={(e) => setFormData({ ...formData, encryptionPassword: e.target.value })}
                        placeholder="Özel parola girilmezse sistem anahtarı kullanılır"
                        className="w-full px-2.5 py-1 rounded border border-amber-300 bg-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Active Cyber Shield */}
                  <label className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">Active Cyber Shield</span>
                        <span className="text-[10px] text-slate-500">Shannon entropi & fidye taraması</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.scanRansomware}
                      onChange={(e) => setFormData({ ...formData, scanRansomware: e.target.checked })}
                      className="w-4 h-4 text-[#0070e0] rounded border-slate-300 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  {/* VSS Snapshot */}
                  <label className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">VSS Snapshot Desteği</span>
                        <span className="text-[10px] text-slate-500">Canlı kilitli dosyaları yakalar</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.useVss}
                      onChange={(e) => setFormData({ ...formData, useVss: e.target.checked })}
                      className="w-4 h-4 text-[#0070e0] rounded border-slate-300 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  {/* WORM */}
                  <label className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">WORM / Değiştirilemez Kilit</span>
                        <span className="text-[10px] text-slate-500">Ransomware ve admin dahil silinemez</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isImmutable}
                      onChange={(e) => setFormData({ ...formData, isImmutable: e.target.checked })}
                      className="w-4 h-4 text-[#0070e0] rounded border-slate-300 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  {/* Zstandard & Deduplication */}
                  <label className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-violet-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">Zstandard & Tekilleştirme</span>
                        <span className="text-[10px] text-slate-500">%75+ disk tasarrufu sağlar</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.compress}
                      onChange={(e) => setFormData({ ...formData, compress: e.target.checked })}
                      className="w-4 h-4 text-[#0070e0] rounded border-slate-300 focus:ring-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

            </div>

          </div>

        </form>

        {/* Pinned Bottom Summary Bar */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2 truncate max-w-[50vw]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="font-semibold text-slate-700 shrink-0">
              {formData.type === 'image' ? '🖥️ Sistem İmajı' : formData.type === 'sql' ? '🗄️ Veritabanı' : '📁 Klasör Ağacı'}
            </span>
            <span className="text-slate-400">|</span>
            <span className="font-mono text-slate-600 truncate">
              {formData.type === 'image' ? `Disk: ${formData.sourceDisk}` : (formData.sourcePath || 'Kaynak seçilmedi')}
            </span>
          </div>

          <div className="flex items-center gap-2 font-semibold shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition text-xs"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-acronis-primary px-4 py-1.5 text-xs shadow-xs"
            >
              {job ? 'Değişiklikleri Kaydet' : 'Planı Oluştur & Başlat'}
            </button>
          </div>
        </div>

      </div>

      {/* Folder Picker Modal */}
      <FolderPickerModal
        isOpen={folderPickerOpen}
        onClose={() => setFolderPickerOpen(false)}
        initialPath={pickerTarget === 'source' ? formData.sourcePath : (formData.customDestinationPath || formData.destinationPath || '')}
        currentSelectedPath={pickerTarget === 'source' ? formData.sourcePath : (formData.customDestinationPath || formData.destinationPath || '')}
        isDestination={pickerTarget === 'destination'}
        initialExcludedPaths={pickerTarget === 'source' ? (formData.excludedPaths || []) : []}
        onSelect={handleSelectFolder}
        onSelectPath={handleSelectFolder}
      />
    </div>
  );
}
