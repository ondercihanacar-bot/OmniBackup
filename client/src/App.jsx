import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import JobsView from './components/JobsView';
import SqlStudioView from './components/SqlStudioView';
import AgentsView from './components/AgentsView';
import DestinationsView from './components/DestinationsView';
import HistoryView from './components/HistoryView';
import LogsView from './components/LogsView';
import SettingsView from './components/SettingsView';
import JobModal from './components/JobModal';
import RestoreModal from './components/RestoreModal';
import AgentDeployModal from './components/AgentDeployModal';
import LiveProgressModal from './components/LiveProgressModal';
import LoginView from './components/LoginView';
import CyberShieldView from './components/CyberShieldView';
import AlertsView from './components/AlertsView';
import ActivitiesView from './components/ActivitiesView';
import ReportsView from './components/ReportsView';
import LicenseModal from './components/LicenseModal';
import NetworkDiscoveryView from './components/NetworkDiscoveryView';
import InstantVmView from './components/InstantVmView';
import BareMetalRescueView from './components/BareMetalRescueView';
import SaasCloudView from './components/SaasCloudView';
import ActiveDirectoryView from './components/ActiveDirectoryView';
import MspPortalView from './components/MspPortalView';
import KeyVaultView from './components/KeyVaultView';
import CdpTimelineView from './components/CdpTimelineView';
import VmConverterView from './components/VmConverterView';
import FourEyesSecurityView from './components/FourEyesSecurityView';
import KvkkComplianceView from './components/KvkkComplianceView';
import SelfHealingView from './components/SelfHealingView';
import AirGapComplianceView from './components/AirGapComplianceView';
import AiAssistantView from './components/AiAssistantView';
import DrRunbookView from './components/DrRunbookView';
import K8sView from './components/K8sView';
import HoneypotView from './components/HoneypotView';
import SyntheticCloneView from './components/SyntheticCloneView';
import WanAcceleratorView from './components/WanAcceleratorView';
import GeoRedundancyView from './components/GeoRedundancyView';
import HelpModal from './components/HelpModal';
import UpdateNotificationModal from './components/UpdateNotificationModal';
import ErrorBoundary from './components/ErrorBoundary';
import { api } from './api';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('omnibackup_auth') === 'true' || sessionStorage.getItem('omnibackup_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('omnibackup_user') || sessionStorage.getItem('omnibackup_user') || 'null');
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (user, rememberMe) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    if (rememberMe) {
      localStorage.setItem('omnibackup_auth', 'true');
      localStorage.setItem('omnibackup_user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('omnibackup_auth', 'true');
      sessionStorage.setItem('omnibackup_user', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('omnibackup_auth');
    localStorage.removeItem('omnibackup_user');
    sessionStorage.removeItem('omnibackup_auth');
    sessionStorage.removeItem('omnibackup_user');
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [license, setLicense] = useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedRestoreItem, setSelectedRestoreItem] = useState(null);
  const [agentDeployOpen, setAgentDeployOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpActiveTab, setHelpActiveTab] = useState('dashboard');

  // Network OTA Auto-Updater State
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const checkForUpdates = useCallback(async (isManual = false) => {
    try {
      const data = await api.checkUpdate();
      if (data && data.hasUpdate) {
        setUpdateInfo(data);
        // If manual click on refresh or mandatory, open modal directly; otherwise notify via navbar badge
        if (isManual || !sessionStorage.getItem('omnibackup_update_dismissed') || data.mandatory) {
          setUpdateModalOpen(true);
        }
      } else {
        setUpdateInfo(null);
      }
      return data;
    } catch (e) {
      console.warn('Update check failed:', e.message);
      return null;
    }
  }, []);

  const handleOpenHelp = (tab) => {
    setHelpActiveTab(tab || activeTab);
    setHelpModalOpen(true);
  };

  // Real-time live progress tracking
  const [liveProgressOpen, setLiveProgressOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [activeJobName, setActiveJobName] = useState('');
  const [progressData, setProgressData] = useState(null);

  // Fetch all system data
  const fetchData = useCallback(async (isManual = false) => {
    if (!isAuthenticated) return;
    setIsRefreshing(true);
    try {
      const [statsData, jobsData, agentsData, destData, histData, logsData, settingsData, licData] = await Promise.all([
        api.getStats(),
        api.getJobs(),
        api.getAgents(),
        api.getDestinations(),
        api.getHistory(),
        api.getLogs(),
        api.getSettings(),
        api.getLicense()
      ]);

      setStats(statsData);
      setJobs(jobsData);
      setAgents(agentsData);
      setDestinations(destData);
      setHistory(histData);
      setLogs(logsData);
      setSettings(settingsData);
      setLicense(licData);

      // Yenile butonuna basıldığında veya veri çekildiğinde hemen sürüm denetimi yap
      await checkForUpdates(isManual);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated, checkForUpdates]);

  useEffect(() => {
    fetchData(false);
    // 10 saniyede bir telemetri, 60 saniyede bir otomatik GitHub sürüm kontrolü
    const intervalData = setInterval(() => fetchData(false), 10000);
    const intervalUpdate = setInterval(() => checkForUpdates(false), 60000);
    return () => {
      clearInterval(intervalData);
      clearInterval(intervalUpdate);
    };
  }, [fetchData, checkForUpdates]);

  // WebSocket live listeners
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    let ws;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === 'job_started') {
            const currentJob = jobs.find(j => j.id === parsed.data?.jobId);
            setActiveJobId(parsed.data?.jobId);
            setActiveJobName(currentJob ? currentJob.name : 'Yedekleme Görevi');
            setLiveProgressOpen(true);
          } else if (parsed.event === 'job_progress') {
            setProgressData(parsed.data?.progress);
          } else if (parsed.event === 'job_finished') {
            setProgressData(prev => ({
              ...prev,
              step: 6,
              percent: 100,
              isFinished: true,
              stage: 'Aşama 6/6: Bütünlük Doğrulaması (SHA-256) Sağlandı - %100 Başarılı',
              integrityStatus: 'verified',
              remainingFormatted: '0 sn (Tamamlandı)'
            }));
            fetchData();
          } else if (parsed.event === 'job_failed') {
            setProgressData(prev => ({
              ...prev,
              isFailed: true,
              stage: `Durduruldu: ${parsed.data?.error || 'Yedekleme sonlandırıldı.'}`
            }));
            fetchData();
          } else if (['agent_heartbeat', 'job_created', 'job_updated', 'job_deleted'].includes(parsed.event)) {
            fetchData();
          }
        } catch (e) {
          // ignore
        }
      };
    } catch (e) {
      // ignore
    }

    return () => {
      if (ws) ws.close();
    };
  }, [fetchData, jobs]);

  // Active Job Polling fallback for 100% guarantee
  useEffect(() => {
    if (!liveProgressOpen || !activeJobId) return;
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.getJobProgress(activeJobId);
        if (res && res.progress) {
          setProgressData(res.progress);
        }
      } catch (e) {
        // ignore
      }
    }, 600);

    return () => clearInterval(pollInterval);
  }, [liveProgressOpen, activeJobId]);

  // Handlers for Jobs
  const handleRunJob = async (jobId) => {
    const currentJob = jobs.find(j => j.id === jobId);
    setActiveJobId(jobId);
    setActiveJobName(currentJob ? currentJob.name : 'Yedekleme Görevi');
    setProgressData({
      step: 1,
      totalSteps: 6,
      stage: 'Aşama 1/6: Kalkan - Anti-Ransomware & Entropi Taraması Yapılıyor...',
      percent: 8,
      elapsedFormatted: '00:01 sn',
      remainingFormatted: '00:35 sn',
      speed: '124.5 MB/s',
      transferredFormatted: '180 MB',
      remainingBytesFormatted: '4.62 GB',
      totalBytesFormatted: '4.80 GB',
      processedFiles: 240,
      totalFiles: 4850,
      compressionRatio: '%48 (2.4x)',
      checksumHash: 'SHA256: Rolling Digest Başlatıldı...',
      integrityStatus: 'verifying'
    });
    setLiveProgressOpen(true);

    try {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'running' } : j));
      await api.runJob(jobId);
      await fetchData();
    } catch (e) {
      alert("Görev çalıştırma hatası: " + e.message);
      fetchData();
    }
  };

  const handleStopJob = async () => {
    if (!activeJobId) return;
    try {
      await api.stopJob(activeJobId);
      setProgressData(prev => ({
        ...prev,
        isFailed: true,
        stage: 'Yedekleme kullanıcı tarafından durduruldu.'
      }));
      fetchData();
    } catch (e) {
      alert("Durdurma hatası: " + e.message);
    }
  };

  const handleSaveJob = async (jobData) => {
    try {
      if (editingJob) {
        await api.updateJob(editingJob.id, jobData);
      } else {
        await api.createJob(jobData);
      }
      setJobModalOpen(false);
      setEditingJob(null);
      fetchData();
    } catch (e) {
      alert("Görev kaydetme hatası: " + e.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Bu yedekleme görevini silmek istediğinize emin misiniz?")) return;
    try {
      await api.deleteJob(jobId);
      fetchData();
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  const handleOpenEditJob = (job) => {
    setEditingJob(job);
    setJobModalOpen(true);
  };

  // Handlers for Agents
  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm("Bu ajanın bağlantısını kesip listeden kaldırmak istiyor musunuz?")) return;
    try {
      await api.deleteAgent(agentId);
      fetchData();
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  // Handlers for Destinations
  const handleCreateDestination = async (destData) => {
    try {
      await api.createDestination(destData);
      fetchData();
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  const handleDeleteDestination = async (destId) => {
    if (!window.confirm("Bu depolama hedefini silmek istediğinize emin misiniz?")) return;
    try {
      await api.deleteDestination(destId);
      fetchData();
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  // Handlers for History & Restore
  const handleDeleteHistory = async (histId) => {
    if (!window.confirm("Bu arşiv kaydını silmek istediğinize emin misiniz?")) return;
    try {
      await api.deleteHistory(histId);
      fetchData();
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  const handleOpenRestoreModal = (historyItem) => {
    setSelectedRestoreItem(historyItem);
    setRestoreModalOpen(true);
  };

  // Handlers for Logs & Settings
  const handleClearLogs = async (type) => {
    const confirmMsg = type === 'errors'
      ? "Sistemdeki tüm hata ve uyarı günlük kayıtlarını temizlemek istiyor musunuz?"
      : "Tüm sistem günlüklerini temizlemek istiyor musunuz?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.clearLogs(type);
      fetchData();
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  const handleSaveSettings = async (newSettings) => {
    try {
      await api.saveSettings(newSettings);
      fetchData();
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f0f4f8] text-slate-800 font-sans selection:bg-[#0070e0]/20 selection:text-[#0070e0]">
      {/* Top Navbar */}
      <Navbar 
        onRefresh={() => fetchData(true)} 
        isRefreshing={isRefreshing} 
        stats={stats} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenNewJob={() => { setEditingJob(null); setJobModalOpen(true); }}
        license={license}
        onOpenLicenseModal={() => setLicenseModalOpen(true)}
        onOpenHelp={handleOpenHelp}
        updateInfo={updateInfo}
        onOpenUpdate={() => setUpdateModalOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          stats={stats} 
          license={license}
          onOpenLicenseModal={() => setLicenseModalOpen(true)}
          onOpenHelp={handleOpenHelp}
          updateInfo={updateInfo}
          onOpenUpdate={() => setUpdateModalOpen(true)}
        />

        {/* Content View */}
        <main className="flex-1 overflow-y-auto min-h-0 p-6">
          <ErrorBoundary key={activeTab} onNavigateDashboard={() => setActiveTab('dashboard')} onReset={fetchData}>
            <div className="max-w-7xl mx-auto space-y-6">
              {activeTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                jobs={jobs}
                agents={agents}
                history={history}
                onRunJob={handleRunJob}
                onOpenNewJob={() => { setEditingJob(null); setJobModalOpen(true); }}
                onOpenDeployAgent={() => setAgentDeployOpen(true)}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'aiAssistant' && (
              <AiAssistantView onOpenHelp={handleOpenHelp} />
            )}

            {activeTab === 'alerts' && (
              <AlertsView 
                logs={logs}
                jobs={jobs}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'activities' && (
              <ActivitiesView 
                jobs={jobs}
                history={history}
                activeJobId={activeJobId}
                progressData={progressData}
                onRunJob={handleRunJob}
                onStopJob={handleStopJob}
                onOpenNewJob={() => { setEditingJob(null); setJobModalOpen(true); }}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView 
                stats={stats}
                jobs={jobs}
                history={history}
                agents={agents}
                destinations={destinations}
              />
            )}

            {activeTab === 'jobs' && (
              <JobsView
                jobs={jobs}
                history={history}
                activeJobId={activeJobId}
                progressData={progressData}
                onRunJob={handleRunJob}
                onStopJob={handleStopJob}
                onOpenNewJob={() => { setEditingJob(null); setJobModalOpen(true); }}
                onEditJob={handleOpenEditJob}
                onDeleteJob={handleDeleteJob}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'drRunbook' && (
              <DrRunbookView onOpenHelp={handleOpenHelp} />
            )}

            {activeTab === 'k8s' && (
              <K8sView onOpenHelp={handleOpenHelp} />
            )}

            {activeTab === 'honeypot' && (
              <HoneypotView onOpenHelp={handleOpenHelp} />
            )}

            {activeTab === 'syntheticClone' && (
              <SyntheticCloneView onOpenHelp={handleOpenHelp} />
            )}

            {activeTab === 'wanAccelerator' && (
              <WanAcceleratorView onOpenHelp={handleOpenHelp} />
            )}

            {activeTab === 'geoRedundancy' && (
              <GeoRedundancyView onOpenHelp={handleOpenHelp} />
            )}

            {activeTab === 'sql' && (
              <SqlStudioView
                onJobCreated={fetchData}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'converter' && (
              <VmConverterView />
            )}

            {activeTab === 'saas' && (
              <SaasCloudView />
            )}

            {activeTab === 'ad' && (
              <ActiveDirectoryView />
            )}

            {activeTab === 'cdp' && (
              <CdpTimelineView />
            )}

            {activeTab === 'selfHealing' && (
              <SelfHealingView />
            )}

            {activeTab === 'fourEyes' && (
              <FourEyesSecurityView />
            )}

            {activeTab === 'kvkk' && (
              <KvkkComplianceView />
            )}

            {activeTab === 'airGap' && (
              <AirGapComplianceView />
            )}

            {activeTab === 'agents' && (
              <AgentsView
                agents={agents}
                jobs={jobs}
                history={history}
                onRunJob={handleRunJob}
                onOpenRestoreModal={handleOpenRestoreModal}
                onDeleteAgent={handleDeleteAgent}
                onOpenDeployAgent={() => setAgentDeployOpen(true)}
              />
            )}

            {activeTab === 'networkRadar' && (
              <NetworkDiscoveryView
                onOpenDeployAgent={() => setAgentDeployOpen(true)}
                onOpenNewJob={() => { setEditingJob(null); setJobModalOpen(true); }}
              />
            )}

            {activeTab === 'baremetal' && (
              <BareMetalRescueView />
            )}

            {activeTab === 'keyvault' && (
              <KeyVaultView />
            )}

            {activeTab === 'msp' && (
              <MspPortalView />
            )}

            {activeTab === 'destinations' && (
              <DestinationsView
                destinations={destinations}
                onCreateDestination={handleCreateDestination}
                onDeleteDestination={handleDeleteDestination}
              />
            )}

            {activeTab === 'cyberShield' && (
              <CyberShieldView />
            )}

            {activeTab === 'instantVm' && (
              <InstantVmView
                history={history}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                history={history}
                onDeleteHistory={handleDeleteHistory}
                onOpenRestoreModal={handleOpenRestoreModal}
              />
            )}

            {activeTab === 'logs' && (
              <LogsView
                logs={logs}
                onClearLogs={handleClearLogs}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onSaveSettings={handleSaveSettings}
              />
            )}
          </div>
        </ErrorBoundary>
      </main>
      </div>

      {/* Modals */}
      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        activeTab={helpActiveTab}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setHelpActiveTab(tab);
        }}
      />

      <JobModal
        isOpen={jobModalOpen}
        onClose={() => { setJobModalOpen(false); setEditingJob(null); }}
        onSave={handleSaveJob}
        job={editingJob}
        destinations={destinations}
        agents={agents}
      />

      <RestoreModal
        isOpen={restoreModalOpen}
        onClose={() => { setRestoreModalOpen(false); setSelectedRestoreItem(null); }}
        historyItem={selectedRestoreItem}
        onRestoreComplete={fetchData}
      />

      <AgentDeployModal
        isOpen={agentDeployOpen}
        onClose={() => setAgentDeployOpen(false)}
      />

      <LiveProgressModal
        isOpen={liveProgressOpen}
        jobName={activeJobName}
        progressData={progressData}
        onStop={handleStopJob}
        onClose={() => {
          setLiveProgressOpen(false);
          setActiveJobId(null);
          setProgressData(null);
        }}
      />

      <LicenseModal
        isOpen={licenseModalOpen}
        onClose={() => setLicenseModalOpen(false)}
        license={license}
        onLicenseUpdated={(lic) => {
          setLicense(lic);
          fetchData();
        }}
      />

      <UpdateNotificationModal
        isOpen={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          sessionStorage.setItem('omnibackup_update_dismissed', 'true');
        }}
        updateInfo={updateInfo}
        onUpdateStarted={() => {
          // Keep modal open displaying updating state
        }}
      />
    </div>
  );
}
