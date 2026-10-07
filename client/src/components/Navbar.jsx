import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Download, 
  Mail, 
  HelpCircle, 
  User, 
  LogOut, 
  RefreshCw,
  Search,
  Globe,
  ShieldCheck,
  Settings,
  ShieldAlert,
  Server,
  Key,
  CheckCircle2,
  ArrowUpCircle
} from 'lucide-react';
import { useTranslation } from '../i18n';

export default function Navbar({ onRefresh, isRefreshing, stats, activeTab, setActiveTab, onOpenNewJob, onLogout, license, onOpenLicenseModal, onOpenHelp, updateInfo, onOpenUpdate }) {
  const { lang, setLang, t } = useTranslation();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showRefreshToast, setShowRefreshToast] = useState(false);
  const dropdownRef = useRef(null);

  // Title map based on active tab
  const titles = {
    dashboard: t('title_dashboard'),
    aiAssistant: 'OmniAI Felaket Kurtarma & Doğal Dil Asistanı',
    alerts: t('title_alerts'),
    activities: t('title_activities'),
    reports: t('title_reports'),
    agents: t('title_agents'),
    networkRadar: t('title_network_radar') || 'Yerel Ağ Radarı & Cihaz Keşfi',
    sql: t('title_sql') || 'Kurumsal SQL, Oracle RMAN & PostgreSQL Studio',
    k8s: 'Kubernetes & Konteyner Durum Yedekleme (CSI Snapshot)',
    converter: t('title_converter') || 'VM, P2V/V2V & Bulut Dönüştürücü',
    saas: t('title_saas') || 'M365 & Google Workspace Bulut Yedekleme',
    ad: t('title_ad') || 'Active Directory & Domain Controller Kurtarma',
    jobs: t('title_jobs'),
    drRunbook: '1-Click Disaster Recovery Runbook & Site Failover',
    cdp: t('title_cdp') || 'Canlı Zaman Tüneli (CDP - Sürekli Veri Koruma)',
    honeypot: 'Fidye Yazılımı Yem Tuzağı (Honeypot Decoy Sentry)',
    cyberShield: t('title_cyber_shield'),
    baremetal: t('title_baremetal') || 'Bare-Metal & WinPE Universal Restore',
    selfHealing: t('title_self_healing') || 'Self-Healing Otomatik İyileştirme Ajanı',
    fourEyes: t('title_four_eyes') || 'Dört Göz Kuralı (Four-Eyes) Yetki Doğrulama',
    kvkk: t('title_kvkk') || 'KVKK / GDPR Uyumluluk & Unutulma Hakkı',
    syntheticClone: 'ReFS / Btrfs Sentetik Hızlı Klonlama (Fast-Clone 3s)',
    wanAccelerator: 'WAN Hızlandırıcı & Trafik QoS Sınırlama',
    geoRedundancy: 'Multi-Cloud Coğrafi Yedeklilik & 3-2-1-1-0 Radarı',
    airGap: t('title_air_gap') || 'Air-Gap İzolasyon & S3 WORM Object Lock',
    instantVm: t('title_instant_vm') || 'Anında Sanallaştırma & Acil Kurtarma',
    history: t('title_history'),
    keyvault: t('title_keyvault') || 'Merkezi Anahtar & Parola Kasası (KMS)',
    destinations: t('title_destinations'),
    msp: t('title_msp') || 'MSP Multi-Tenant Yönetilen Hizmetler Portalı',
    logs: t('title_logs'),
    settings: t('title_settings')
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefreshClick = async () => {
    if (onRefresh) {
      await onRefresh();
      setShowRefreshToast(true);
      setTimeout(() => setShowRefreshToast(false), 3500);
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20 shadow-2xs select-none relative">
      
      {/* Toast Notification on Refresh */}
      {showRefreshToast && (
        <div className="absolute top-16 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-top-2 z-50">
          {updateInfo?.hasUpdate ? (
            <>
              <ArrowUpCircle className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>🚀 Yeni Sürüm v{updateInfo.latestVersion} Hazır! Araç çubuğundan hemen güncelleyebilirsiniz.</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>✓ Tüm veriler ve telemetri yenilendi! En güncel sürümdesiniz.</span>
            </>
          )}
        </div>
      )}

      {/* Page Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
          {titles[activeTab] || t('brand')}
        </h2>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center relative w-72">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input 
          type="text" 
          placeholder={t('search_placeholder')} 
          className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0070e0]"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 text-xs">
        {/* Language Switcher Pill */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
          <button
            onClick={() => setLang('tr')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
              lang === 'tr'
                ? 'bg-white text-[#0066FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Türkçe"
          >
            <span>🇹🇷</span>
            <span>TR</span>
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
              lang === 'en'
                ? 'bg-white text-[#0066FF] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="English"
          >
            <span>🇬🇧</span>
            <span>EN</span>
          </button>
        </div>

        {/* OmniHub License Badge */}
        <button
          onClick={onOpenLicenseModal}
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer ${
            license?.status === 'ACTIVE' || license?.status === 'ACTIVE_PERPETUAL'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
          }`}
          title="OmniHub Lisans Durumu & Aktivasyon"
        >
          <span>{license?.status === 'ACTIVE' || license?.status === 'ACTIVE_PERPETUAL' ? '🛡️' : '⏳'}</span>
          <span>{license?.status === 'ACTIVE' || license?.status === 'ACTIVE_PERPETUAL' ? 'Lisanslı' : `${license?.daysRemaining || 15} Gün Demo`}</span>
        </button>

        {/* Network OTA Update Available Badge Button */}
        {updateInfo?.hasUpdate && (
          <button
            onClick={onOpenUpdate}
            className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white flex items-center gap-2 font-bold px-3 py-1.5 rounded-lg transition active:scale-95 shadow-md cursor-pointer animate-pulse border border-white/40 ring-2 ring-rose-400/40"
            title={`Yeni OmniBackup v${updateInfo.latestVersion} güncellemesi hazır! Tıklayarak yükleyin veya kurulum dosyasını indirin.`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] uppercase tracking-wider text-amber-100 font-extrabold">YENİ SÜRÜM</span>
              <span className="text-xs font-black text-white">v{updateInfo.latestVersion} Güncelle</span>
            </div>
          </button>
        )}

        {/* Refresh Button */}
        <button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg transition active:scale-95 shadow-2xs cursor-pointer"
          title="Verileri ve Ajanları Yenile"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#0070e0] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Yenileniyor...' : 'Yenile'}</span>
        </button>

        {/* Add Plan Button */}
        <button
          onClick={onOpenNewJob}
          className="btn-acronis-primary px-3 py-1.5 flex items-center gap-1.5 text-xs shadow-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('add_plan')}</span>
        </button>

        {/* Global Help & Tab Guide Button */}
        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp(activeTab)}
            className="w-8 h-8 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
            title="Sekme ve Modül Yardım Rehberi (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        <div className="h-4 w-[1px] bg-slate-200" />

        {/* User Account Interactive Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer shadow-2xs ${
              userDropdownOpen 
                ? 'bg-[#0070e0] text-white border-[#0070e0] ring-2 ring-blue-200' 
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title="Yönetici Profili & Güvenlik"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Floating User Profile Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
              
              {/* Profile Header */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold">
                      A
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">admin</h4>
                      <span className="text-[10px] text-cyan-300 font-mono">SuperAdmin (Root)</span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20"></span>
                </div>
              </div>

              {/* Security & 2FA Status */}
              <div className="p-3 bg-slate-50 border-b border-slate-100 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2FA Koruması:</span>
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                    Google Auth AKTİF
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    <Server className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sunucu Portu:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-700">3060 (Central Master)</span>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="p-2 space-y-1 text-xs">
                <button
                  onClick={() => {
                    if (setActiveTab) setActiveTab('settings');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2.5 transition text-left"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Sistem Yapılandırması & Ayarlar</span>
                </button>

                <button
                  onClick={() => {
                    if (setActiveTab) setActiveTab('cyberShield');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2.5 transition text-left"
                >
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>Cyber Shield Güvenlik Kalkanı</span>
                </button>

                <div className="h-[1px] bg-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2.5 transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')} (Güvenli Çıkış)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Direct Logout Icon Button */}
        <button
          onClick={onLogout}
          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
          title={t('logout')}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
