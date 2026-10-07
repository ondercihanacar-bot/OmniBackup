import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, HardDrive, Server, CalendarClock, Database, 
  FileText, History, Terminal, Settings, ShieldAlert, AlertTriangle, 
  Activity, BarChart2, FolderLock, Layers, Cloud, ChevronDown, ChevronRight, 
  Award, Key, Radar, Zap, Disc, Mail, Network, Building2, Clock, 
  Boxes, Users, Scale, HeartPulse, Radio, Bot, Flame, Crosshair, 
  TrendingUp, Globe, ShieldCheck, Sparkles, HelpCircle
} from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';
import { useTranslation } from '../i18n';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  stats, 
  license, 
  onOpenLicenseModal,
  onOpenHelp,
  updateInfo,
  onOpenUpdate
}) {
  const { t } = useTranslation();

  const navSections = [
    {
      id: 'sec_overview',
      title: 'Genel Bakış & Telemetri',
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard, badge: null },
        { id: 'aiAssistant', label: 'OmniAI Asistan', icon: Bot, badge: 'AI DR', badgeColor: 'bg-cyan-950 text-cyan-300 border border-cyan-800' },
        { id: 'alerts', label: t('nav_alerts'), icon: AlertTriangle, badge: stats?.activeAlerts ? `${stats.activeAlerts}` : '6' },
        { id: 'activities', label: t('nav_activities'), icon: Activity, badge: null },
        { id: 'reports', label: t('nav_reports'), icon: BarChart2, badge: null },
      ]
    },
    {
      id: 'sec_devices',
      title: 'Cihazlar, DB & Konteyner',
      icon: Server,
      items: [
        { id: 'agents', label: t('nav_all_machines'), icon: Server, badge: stats?.onlineAgents ? `${stats.onlineAgents}` : '4' },
        { id: 'networkRadar', label: t('nav_network_radar') || 'Ağ Radarı & Keşif', icon: Radar, badge: 'Auto' },
        { id: 'sql', label: t('nav_sql_studio') || 'Kurumsal SQL & RMAN', icon: Database, badge: 'Live' },
        { id: 'k8s', label: 'Kubernetes & Docker', icon: Boxes, badge: 'CSI/K8s', badgeColor: 'bg-blue-950 text-blue-300 border border-blue-800' },
        { id: 'converter', label: t('nav_converter') || 'VM & Bulut Dönüştürücü', icon: Layers, badge: 'P2V/V2V' },
        { id: 'saas', label: t('nav_saas') || 'M365 & Google SaaS', icon: Mail, badge: 'Cloud' },
        { id: 'ad', label: t('nav_ad') || 'Active Directory & DC', icon: Network, badge: '0 Reboot' },
      ]
    },
    {
      id: 'sec_protection',
      title: 'Koruma, DR & Siber Savunma',
      icon: ShieldAlert,
      items: [
        { id: 'jobs', label: t('nav_plans'), icon: CalendarClock, badge: stats?.activeJobs ? `${stats.activeJobs}` : null },
        { id: 'drRunbook', label: '1-Click Site Failover', icon: Flame, badge: 'DR Run', badgeColor: 'bg-rose-950 text-rose-300 border border-rose-800' },
        { id: 'cdp', label: t('nav_cdp') || 'Canlı Zaman Tüneli (CDP)', icon: Clock, badge: '0 RPO' },
        { id: 'honeypot', label: 'Honeypot Yem Tuzağı', icon: Crosshair, badge: '11ms', badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800' },
        { id: 'cyberShield', label: t('nav_cyber_shield'), icon: ShieldAlert, badge: 'Shield ON' },
        { id: 'baremetal', label: t('nav_baremetal') || 'Bare-Metal & WinPE', icon: Disc, badge: 'BMR' },
        { id: 'selfHealing', label: t('nav_self_healing') || 'Self-Healing Ajan', icon: HeartPulse, badge: 'Auto-Heal' },
        { id: 'fourEyes', label: t('nav_four_eyes') || 'Dört Göz Onayı', icon: Users, badge: 'Dual 2FA' },
        { id: 'kvkk', label: t('nav_kvkk') || 'KVKK & Hassas Veri', icon: Scale, badge: 'PII' },
      ]
    },
    {
      id: 'sec_storage',
      title: 'Depolama, Hız & Replikasyon',
      icon: Cloud,
      items: [
        { id: 'syntheticClone', label: 'ReFS Fast-Clone (3s)', icon: Zap, badge: '0 Disk IO', badgeColor: 'bg-emerald-950 text-emerald-300 border border-emerald-800' },
        { id: 'wanAccelerator', label: 'WAN Hızlandırıcı & QoS', icon: TrendingUp, badge: '4.8x Dedup', badgeColor: 'bg-cyan-950 text-cyan-300 border border-cyan-800' },
        { id: 'geoRedundancy', label: '3-2-1-1-0 Radar & Multi-Cloud', icon: Globe, badge: 'Radar 100%', badgeColor: 'bg-sky-950 text-sky-300 border border-sky-800' },
        { id: 'airGap', label: t('nav_air_gap') || 'Air-Gap & WORM Lock', icon: Radio, badge: 'WORM' },
        { id: 'instantVm', label: t('nav_instant_vm') || 'Anında Sanallaştırma', icon: Zap, badge: 'Instant' },
        { id: 'history', label: t('nav_backups_recovery'), icon: History, badge: stats?.totalBackups ? `${stats.totalBackups}` : null },
        { id: 'keyvault', label: t('nav_keyvault') || 'Anahtar & Parola Kasası', icon: Key, badge: 'AES-256' },
        { id: 'destinations', label: t('nav_storage_locations'), icon: Cloud, badge: stats?.destinationsCount ? `${stats.destinationsCount}` : null },
      ]
    },
    {
      id: 'sec_msp',
      title: 'MSP & Multi-Tenant',
      icon: Building2,
      items: [
        { id: 'msp', label: t('nav_msp_portal') || 'MSP Müşteri Portalı', icon: Building2, badge: 'SLA %99' },
      ]
    },
    {
      id: 'sec_system',
      title: 'Sistem & Denetim',
      icon: Settings,
      items: [
        { id: 'logs', label: t('nav_audit_logs'), icon: Terminal, badge: null },
        { id: 'settings', label: t('nav_settings'), icon: Settings, badge: null },
      ]
    }
  ];

  // Accordion state: keep open the section containing the activeTab
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    navSections.forEach(sec => {
      const hasActive = sec.items.some(i => i.id === activeTab);
      initial[sec.id] = hasActive || sec.id === 'sec_overview' || sec.id === 'sec_protection';
    });
    return initial;
  });

  useEffect(() => {
    // When activeTab changes, auto-expand its section
    navSections.forEach(sec => {
      if (sec.items.some(i => i.id === activeTab)) {
        setOpenSections(prev => ({ ...prev, [sec.id]: true }));
      }
    });
  }, [activeTab]);

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <aside className="w-64 acronis-sidebar flex flex-col justify-between shrink-0 select-none border-r border-[#08182b] bg-[#070e1b] h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Top Logo Brand */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <AnimatedLogo size="sm" variant="round-light" showSoundToggle={true} />
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1">
                <span>Omni</span><span className="font-light text-cyan-300">Backup</span>
              </h1>
              <span className="text-[9px] text-cyan-400 font-mono tracking-wider block">
                {t('edition')}
              </span>
            </div>
          </div>

          {onOpenHelp && (
            <button
              onClick={() => onOpenHelp(activeTab)}
              title="Kılavuz & Yardım"
              className="p-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-400 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Accordion Navigation Groups */}
        <nav className="flex-1 p-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navSections.map((sec) => {
            const isOpen = !!openSections[sec.id];
            const hasActiveChild = sec.items.some(item => item.id === activeTab);
            const SecIcon = sec.icon;

            return (
              <div key={sec.id} className="rounded-xl overflow-hidden bg-slate-900/30 border border-slate-800/60">
                {/* Accordion Header Button */}
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                    hasActiveChild 
                      ? 'bg-slate-800/80 text-cyan-300 font-bold' 
                      : 'hover:bg-slate-800/40 text-slate-400 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <SecIcon className={`w-3.5 h-3.5 ${hasActiveChild ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="text-[11px] tracking-wide truncate">{sec.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {hasActiveChild && !isOpen && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                    )}
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Accordion Submenu Items */}
                {isOpen && (
                  <div className="p-1 space-y-0.5 bg-[#050b14]/60 border-t border-slate-800/40 animate-in fade-in duration-150">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md shadow-cyan-950' 
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate pr-1">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                              item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0">
        {/* OmniHub License Card Widget */}
        <div className="px-2 py-2">
          <div 
            onClick={onOpenLicenseModal}
            className="p-3 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/80 border border-indigo-800/40 text-white cursor-pointer hover:border-cyan-400/50 transition group space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>OmniHub Lisansı</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                license?.status === 'ACTIVE' || license?.status === 'ACTIVE_PERPETUAL'
                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}>
                {license?.status === 'ACTIVE' || license?.status === 'ACTIVE_PERPETUAL' ? 'LİSANSLI' : `${license?.daysRemaining || 15}G DEMO`}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {license?.licensedTo || 'Deneme Kullanıcısı'}
            </div>
            <div className="text-[10px] text-cyan-400 font-semibold group-hover:underline flex items-center gap-1">
              <Key className="w-3 h-3" />
              <span>Lisansı Yönet / Etkinleştir</span>
            </div>
          </div>
        </div>

        {/* Dynamic Update Notification in Sidebar */}
        {updateInfo?.hasUpdate && (
          <div 
            onClick={onOpenUpdate}
            className="mx-3 my-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-600/30 border border-amber-400/50 text-amber-200 cursor-pointer hover:border-amber-300 transition flex items-center justify-between group shadow-lg animate-pulse"
            title="Yeni sürüm hazır! Tıklayarak güncelleyin."
          >
            <div className="flex items-center gap-2">
              <span className="text-base animate-bounce">🚀</span>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-black text-white uppercase tracking-wider">YENİ SÜRÜM</span>
                <span className="text-[9px] text-amber-300 font-mono font-bold">v{updateInfo.latestVersion} Hazır</span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-xs group-hover:scale-105 transition">
              Güncelle
            </span>
          </div>
        )}

        {/* Bottom Engine Watermark */}
        <div className="p-3 border-t border-white/10 text-[10px] text-slate-400 font-mono flex items-center justify-between bg-[#050b14]">
          <span className="text-cyan-300 font-bold">OmniEngine v2.8.7</span>
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live (v2.8.7)
          </span>
        </div>
      </div>
    </aside>
  );
}
