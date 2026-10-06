import React, { createContext, useContext, useState, useEffect } from 'react';

export const translations = {
  tr: {
    // Brand & Common
    brand: "OmniBackup",
    edition: "KURUMSAL BULUT",
    refresh: "Yenile",
    search_placeholder: "Cihaz, görev veya log ara...",
    add_plan: "+ Plan Ekle",
    logout: "Güvenli Çıkış",
    save: "Kaydet",
    cancel: "İptal",
    close: "Kapat",
    delete: "Sil",
    edit: "Düzenle",
    status: "Durum",
    actions: "İşlemler",
    success: "Başarılı",
    failed: "Başarısız",
    running: "Çalışıyor",
    warning: "Uyarı",
    enabled: "Aktif",
    disabled: "Pasif",
    online: "Çevrimiçi",
    offline: "Çevrimdışı",
    loading: "Yükleniyor...",
    all: "Tümü",
    total: "Toplam",
    view_details: "Detayları Gör",
    language: "Dil Seçimi",

    // Sidebar & Navigation
    nav_overview: "GENEL BAKIŞ",
    nav_dashboard: "Kontrol Paneli",
    nav_alerts: "Alarmlar",
    nav_activities: "Aktiviteler & İşlemler",
    nav_reports: "Raporlar & Analiz",
    nav_devices: "CİHAZLAR & MAKİNELER",
    nav_all_machines: "Tüm Makineler (Ajanlar)",
    nav_network_radar: "Ağ Radarı & Keşif",
    nav_sql_studio: "Çoklu Veritabanı & RMAN",
    nav_converter: "VM & Bulut Dönüştürücü",
    nav_saas: "M365 & Google Workspace",
    nav_ad: "Active Directory & DC",
    nav_plans_protection: "PLANLAR & KORUMA",
    nav_plans: "Yedekleme Planları",
    nav_cdp: "Canlı Zaman Tüneli (CDP)",
    nav_baremetal: "Bare-Metal & WinPE",
    nav_self_healing: "Self-Healing Akıllı Ajan",
    nav_cyber_shield: "Cyber Shield Fidye Kalkanı",
    nav_four_eyes: "Dört Göz Kuralı Onayı",
    nav_kvkk: "KVKK & Unutulma Hakkı",
    nav_storage_recovery: "DEPOLAMA & KURTARMA",
    nav_ai_assistant: "OmniAI Kurtarma Asistanı",
    nav_dr_runbook: "1-Click DR Failover",
    nav_k8s: "Kubernetes & Konteyner",
    nav_honeypot: "Honeypot Yem Tuzağı",
    nav_synthetic_clone: "ReFS Fast-Clone (3s)",
    nav_wan_accelerator: "WAN Hızlandırıcı & QoS",
    nav_geo_redundancy: "3-2-1-1-0 Radar & Bulut",
    nav_instant_vm: "Anında Sanallaştırma",
    nav_backups_recovery: "Yedekler & Geri Yükleme",
    nav_air_gap: "Air-Gap & S3 Object Lock",
    nav_keyvault: "Anahtar & Parola Kasası",
    nav_storage_locations: "Depolama Hedefleri",
    nav_msp: "MSP & YÖNETİLEN HİZMETLER",
    nav_msp_portal: "MSP Multi-Tenant Portal",
    nav_system: "SİSTEM",
    nav_audit_logs: "Sistem & Güvenlik Logları",
    nav_settings: "Yapılandırma & Ayarlar",

    // Titles
    title_dashboard: "Merkezi Kontrol Paneli",
    title_ai_assistant: "OmniAI Felaket Kurtarma & Doğal Dil Asistanı",
    title_dr_runbook: "1-Click Disaster Recovery Runbook & Site Failover",
    title_k8s: "Kubernetes & Konteyner Durum Yedekleme (CSI Snapshot)",
    title_honeypot: "Fidye Yazılımı Yem Tuzağı (Honeypot Decoy Sentry)",
    title_synthetic_clone: "ReFS / Btrfs Sentetik Hızlı Klonlama (Fast-Clone 3s)",
    title_wan_accelerator: "WAN Hızlandırıcı & Trafik QoS Sınırlama",
    title_geo_redundancy: "Multi-Cloud Coğrafi Yedeklilik & 3-2-1-1-0 Radarı",
    title_alerts: "Aktif Güvenlik Alarmları",
    title_activities: "Aktiviteler ve Gerçek Zamanlı İşlemler",
    title_reports: "Koruma & Telemetri Raporları",
    title_agents: "Tüm Makineler ve İstemci Ajanları",
    title_network_radar: "Yerel Ağ Radarı & Cihaz Keşfi (Subnet Auto-Discovery)",
    title_sql: "Kurumsal Çoklu Veritabanı & RMAN Stüdyosu",
    title_converter: "Cross-Platform Sanallaştırma & Bulut Dönüştürücü (P2V/V2V/V2C)",
    title_saas: "Microsoft 365 & Google Workspace Bulut Yedekleme",
    title_ad: "Active Directory & Domain Controller Granular Kurtarma",
    title_cdp: "Continuous Data Protection (CDP) & Canlı Zaman Tüneli",
    title_baremetal: "Bare-Metal Disaster Recovery & WinPE Kurtarma Medyası",
    title_self_healing: "Self-Healing (Kendi Kendini Onaran) Akıllı Ajan",
    title_four_eyes: "Dört Göz Kuralı (Four-Eyes) & Çift Yönetici Onay Havuzu",
    title_kvkk: "KVKK & GDPR Uyum Suiti — Unutulma Hakkı & PII Maskeleme",
    title_air_gap: "Fiziksel Air-Gap İzolasyonu & S3 Yasal Kilit (Object Lock)",
    title_keyvault: "Kriptografik Anahtar Escrow & Parola Kasası",
    title_msp: "MSP Multi-Tenancy Portal & SLA Uyumluluk Raporlayıcı",
    title_jobs: "Yedekleme ve Koruma Planları",
    title_cyber_shield: "Active Cyber Shield • Fidye Kalkanı",
    title_instant_vm: "Anında Sanallaştırma & Acil Kurtarma (Instant VM Boot)",
    title_history: "Yedek Noktaları ve Geri Yükleme",
    title_destinations: "Depolama Konumları ve Bulut Hedefleri",
    title_logs: "Sistem ve Güvenlik Denetim Günlükleri",
    title_settings: "Sistem Yapılandırması ve Güvenlik Ayarları",

    // Dashboard
    stat_protected_storage: "Korunan Toplam Veri",
    stat_active_plans: "Aktif Koruma Planı",
    stat_fleet_health: "Çevrimiçi Ajan / Makine",
    stat_success_rate: "Başarı Oranı (30 Gün)",
    dash_storage_distribution: "Depolama Dağılımı ve Hedefler",
    dash_recent_activities: "Son Yedekleme Aktiviteleri",
    dash_protection_summary: "Sistem Güvenlik Özeti",
    dash_worm_active: "WORM Değiştirilemez Kilit Aktif",
    dash_quick_backup: "Hızlı Yedekleme Başlat",

    // Jobs View & Modal
    job_name: "Plan Adı",
    job_source: "Kaynak Konum",
    job_destination: "Hedef Depo",
    job_schedule: "Zamanlama",
    job_compression: "Sıkıştırma",
    job_encryption: "AES-256 Şifreleme",
    job_vss: "VSS Snapshot Desteği",
    job_ransomware_shield: "Anti-Ransomware Kalkanı",
    job_run_now: "Hemen Başlat",
    job_new_title: "Yeni Yedekleme Planı Oluştur",
    job_edit_title: "Yedekleme Planını Düzenle",
    job_sources_help: "Yedeklenecek dosya, klasör veya SQL bağlantısı",

    // Live Progress
    progress_title: "Canlı Yedekleme Telemetrisi",
    progress_stage: "Mevcut Aşama",
    progress_speed: "Aktarım Hızı",
    progress_transferred: "Aktarılan Veri",
    progress_remaining: "Kalan Süre",
    progress_integrity: "SHA-256 Veri Sağlaması",
    progress_stop: "Görevi Durdur",

    // Agents & Deploy
    agent_hostname: "Makine Adı",
    agent_ip: "IP Adresi",
    agent_os: "İşletim Sistemi",
    agent_last_seen: "Son Görülme",
    agent_backup_now: "HEMEN YEDEKLE",
    agent_recover: "KURTAR",
    agent_deploy: "Yeni Ajan Yükle",

    // SQL Studio
    sql_host: "Sunucu / Instance",
    sql_database: "Veritabanı",
    sql_username: "Kullanıcı Adı",
    sql_password: "SQL Şifresi",
    sql_test_conn: "Bağlantıyı Test Et",
    sql_explore_tables: "Tabloları Listele",
    sql_instant_backup: "Anlık SQL Yedeği Al",

    // Cyber Shield
    shield_status: "Kalkan Durumu",
    shield_entropy: "Shannon Entropi Analizi",
    shield_blocked_ext: "Engellenen Fidye Uzantıları",
    shield_worm_desc: "Yedeklerin fidye yazılımlarınca şifrelenmesini önleyen donanımsal mantık kilidi.",

    // Login & 2FA
    login_title: "Yönetici Girişi",
    login_subtitle: "OmniBackup Cyber Vault Güvenlik Paneli",
    login_username: "Kullanıcı Adı",
    login_password: "Şifre",
    login_btn: "Giriş Yap",
    twofa_prompt: "Google Authenticator Doğrulama Kodu",
    twofa_verify: "Doğrula ve Giriş Yap",
    twofa_backup_code: "Yedek Test Kodu: 123456"
  },
  en: {
    // Brand & Common
    brand: "OmniBackup",
    edition: "ENTERPRISE CLOUD",
    refresh: "Refresh",
    search_placeholder: "Search device, job or audit log...",
    add_plan: "+ Add Plan",
    logout: "Sign Out",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    delete: "Delete",
    edit: "Edit",
    status: "Status",
    actions: "Actions",
    success: "Success",
    failed: "Failed",
    running: "Running",
    warning: "Warning",
    enabled: "Enabled",
    disabled: "Disabled",
    online: "Online",
    offline: "Offline",
    loading: "Loading...",
    all: "All",
    total: "Total",
    view_details: "View Details",
    language: "Language Selection",

    // Sidebar & Navigation
    nav_overview: "OVERVIEW",
    nav_dashboard: "Dashboard",
    nav_alerts: "Alerts",
    nav_activities: "Activities & Operations",
    nav_reports: "Reports & Analytics",
    nav_devices: "DEVICES & MACHINES",
    nav_all_machines: "All Machines (Agents)",
    nav_network_radar: "Network Radar & Discovery",
    nav_sql_studio: "Multi-DB & Oracle RMAN",
    nav_converter: "VM & Cloud Converter",
    nav_saas: "M365 & Google Workspace",
    nav_ad: "Active Directory & DC",
    nav_plans_protection: "PLANS & PROTECTION",
    nav_plans: "Protection Plans",
    nav_cdp: "Live Timeline (CDP)",
    nav_baremetal: "Bare-Metal & WinPE",
    nav_self_healing: "Self-Healing Smart Agent",
    nav_cyber_shield: "Active Cyber Shield",
    nav_four_eyes: "Four-Eyes Security Approval",
    nav_kvkk: "GDPR & KVKK Compliance",
    nav_storage_recovery: "STORAGE & RECOVERY",
    nav_ai_assistant: "OmniAI Restore Assistant",
    nav_dr_runbook: "1-Click DR Failover",
    nav_k8s: "Kubernetes & Containers",
    nav_honeypot: "Honeypot Decoy Trap",
    nav_synthetic_clone: "ReFS Fast-Clone (3s)",
    nav_wan_accelerator: "WAN Accelerator & QoS",
    nav_geo_redundancy: "3-2-1-1-0 Radar & Multi-Cloud",
    nav_instant_vm: "Instant VM Boot",
    nav_backups_recovery: "Backups & Recovery",
    nav_air_gap: "Air-Gap & S3 Object Lock",
    nav_keyvault: "Key & Password Vault",
    nav_storage_locations: "Storage Locations",
    nav_msp: "MSP & MANAGED SERVICES",
    nav_msp_portal: "MSP Multi-Tenant Portal",
    nav_system: "SYSTEM",
    nav_audit_logs: "Audit & Security Logs",
    nav_settings: "Configuration & Settings",

    // Titles
    title_dashboard: "Central Dashboard",
    title_ai_assistant: "OmniAI Disaster Recovery & NLP Assistant",
    title_dr_runbook: "1-Click Disaster Recovery Runbook & Site Failover",
    title_k8s: "Kubernetes & Container State Backup (CSI Snapshot)",
    title_honeypot: "Ransomware Decoy & Honeypot Trap (11ms Sentry)",
    title_synthetic_clone: "ReFS / Btrfs Synthetic Fast-Clone (3s Merge)",
    title_wan_accelerator: "WAN Accelerator & Traffic QoS Throttling",
    title_geo_redundancy: "Multi-Cloud Geo-Redundancy & 3-2-1-1-0 Radar",
    title_alerts: "Active Security Alerts",
    title_activities: "Activities and Real-time Operations",
    title_reports: "Protection & Telemetry Reports",
    title_agents: "All Machines and Client Agents",
    title_network_radar: "Local Subnet Radar & Auto-Discovery",
    title_sql: "Enterprise Multi-Database & RMAN Studio",
    title_converter: "Cross-Platform VM & Cloud Converter (P2V/V2V/V2C)",
    title_saas: "Microsoft 365 & Google Workspace Cloud Backup",
    title_ad: "Active Directory & Domain Controller Granular Recovery",
    title_cdp: "Continuous Data Protection (CDP) & Real-Time Timeline",
    title_baremetal: "Bare-Metal Disaster Recovery & WinPE Media",
    title_self_healing: "Self-Healing & Auto-Remediation Intelligent Agent",
    title_four_eyes: "Four-Eyes Principle & Dual-Admin Authorization",
    title_kvkk: "KVKK & GDPR Compliance — Cryptographic Erasure",
    title_air_gap: "Hardware Air-Gap & S3 Compliance Object Lock",
    title_keyvault: "Cryptographic Key Escrow & Password Vault",
    title_msp: "MSP Multi-Tenancy Portal & SLA Compliance Reporter",
    title_jobs: "Backup and Protection Plans",
    title_cyber_shield: "Active Cyber Shield • Anti-Ransomware",
    title_instant_vm: "Instant VM Boot & Disaster Recovery",
    title_history: "Recovery Points & Backup History",
    title_destinations: "Storage Locations and Cloud Targets",
    title_logs: "Audit and System Logs",
    title_settings: "System Configuration and Security Settings",

    // Dashboard
    stat_protected_storage: "Total Protected Data",
    stat_active_plans: "Active Protection Plans",
    stat_fleet_health: "Online Agents / Machines",
    stat_success_rate: "Success Rate (30 Days)",
    dash_storage_distribution: "Storage Distribution & Targets",
    dash_recent_activities: "Recent Backup Activities",
    dash_protection_summary: "System Security Overview",
    dash_worm_active: "WORM Immutable Lock Active",
    dash_quick_backup: "Run Quick Backup",

    // Jobs View & Modal
    job_name: "Plan Name",
    job_source: "Source Location",
    job_destination: "Target Storage",
    job_schedule: "Schedule",
    job_compression: "Compression",
    job_encryption: "AES-256 Encryption",
    job_vss: "VSS Snapshot Support",
    job_ransomware_shield: "Anti-Ransomware Shield",
    job_run_now: "Run Now",
    job_new_title: "Create Protection Plan",
    job_edit_title: "Edit Protection Plan",
    job_sources_help: "Select files, folders, or SQL connection to protect",

    // Live Progress
    progress_title: "Live Backup Telemetry",
    progress_stage: "Current Stage",
    progress_speed: "Transfer Speed",
    progress_transferred: "Data Transferred",
    progress_remaining: "Time Remaining",
    progress_integrity: "SHA-256 Hash Verification",
    progress_stop: "Stop Backup",

    // Agents & Deploy
    agent_hostname: "Machine Hostname",
    agent_ip: "IP Address",
    agent_os: "Operating System",
    agent_last_seen: "Last Seen",
    agent_backup_now: "BACK UP NOW",
    agent_recover: "RECOVER",
    agent_deploy: "Deploy New Agent",

    // SQL Studio
    sql_host: "Server / Instance",
    sql_database: "Database",
    sql_username: "Username",
    sql_password: "SQL Password",
    sql_test_conn: "Test Connection",
    sql_explore_tables: "Explore Tables",
    sql_instant_backup: "Instant SQL Backup",

    // Cyber Shield
    shield_status: "Shield Status",
    shield_entropy: "Shannon Entropy Analysis",
    shield_blocked_ext: "Blocked Ransomware Extensions",
    shield_worm_desc: "Hardware-level logical lock preventing ransomware from modifying or deleting backups.",

    // Login & 2FA
    login_title: "Administrator Login",
    login_subtitle: "OmniBackup Cyber Vault Management Console",
    login_username: "Username",
    login_password: "Password",
    login_btn: "Sign In",
    twofa_prompt: "Google Authenticator Verification Code",
    twofa_verify: "Verify & Sign In",
    twofa_backup_code: "Backup Test Code: 123456"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('omnibackup_lang') || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('omnibackup_lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => prev === 'tr' ? 'en' : 'tr');
  };

  const t = (key) => {
    const currentDict = translations[lang] || translations.tr;
    return currentDict[key] || translations.tr[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if not inside provider
    return {
      lang: 'tr',
      setLang: () => {},
      toggleLang: () => {},
      t: (key) => translations.tr[key] || key
    };
  }
  return context;
}
