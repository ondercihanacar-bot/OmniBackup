const BASE_URL = '/api';

export const api = {
  // Dashboard
  getStats: async () => {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    return res.json();
  },

  // Jobs
  getJobs: async () => {
    const res = await fetch(`${BASE_URL}/jobs`);
    return res.json();
  },
  createJob: async (jobData) => {
    const res = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return res.json();
  },
  updateJob: async (id, jobData) => {
    const res = await fetch(`${BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return res.json();
  },
  deleteJob: async (id) => {
    const res = await fetch(`${BASE_URL}/jobs/${id}`, { method: 'DELETE' });
    return res.json();
  },
  runJob: async (id) => {
    const res = await fetch(`${BASE_URL}/jobs/${id}/run`, { method: 'POST' });
    return res.json();
  },
  stopJob: async (id) => {
    const res = await fetch(`${BASE_URL}/jobs/${id}/stop`, { method: 'POST' });
    return res.json();
  },
  getJobProgress: async (id) => {
    const res = await fetch(`${BASE_URL}/jobs/${id}/progress`);
    return res.json();
  },

  // SQL Studio & Explorer
  testSql: async (sqlConfig) => {
    const res = await fetch(`${BASE_URL}/sql/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sqlConfig)
    });
    return res.json();
  },
  testMysql: async (mysqlConfig) => {
    const res = await fetch(`${BASE_URL}/mysql/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mysqlConfig)
    });
    return res.json();
  },
  getSqlTables: async (config) => {
    const res = await fetch(`${BASE_URL}/sql/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },
  previewSqlTable: async (config) => {
    const res = await fetch(`${BASE_URL}/sql/preview-table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },
  restoreSqlTable: async (config) => {
    const res = await fetch(`${BASE_URL}/sql/restore-table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },
  scanFleet: async (scanConfig) => {
    const res = await fetch(`${BASE_URL}/fleet/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scanConfig || {})
    });
    return res.json();
  },
  getDeployScript: async (targetIp) => {
    const res = await fetch(`${BASE_URL}/fleet/deploy-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetIp })
    });
    return res.json();
  },
  runSureBackupDrill: async () => {
    const res = await fetch(`${BASE_URL}/surebackup/run-drill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },
  getDrives: async () => {
    const res = await fetch(`${BASE_URL}/explorer/drives`);
    return res.json();
  },
  listDir: async (path) => {
    const res = await fetch(`${BASE_URL}/explorer/list?path=${encodeURIComponent(path)}`);
    return res.json();
  },
  createDir: async (folderPath) => {
    const res = await fetch(`${BASE_URL}/explorer/mkdir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderPath })
    });
    return res.json();
  },
  testLocalConnection: async (path) => {
    const res = await fetch(`${BASE_URL}/test-connection/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    return res.json();
  },
  testNasConnection: async (nasConfig) => {
    const res = await fetch(`${BASE_URL}/test-connection/nas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nasConfig)
    });
    return res.json();
  },
  testCloudConnection: async (cloudConfig) => {
    const res = await fetch(`${BASE_URL}/test-connection/cloud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cloudConfig)
    });
    return res.json();
  },

  // Agents
  getAgents: async () => {
    const res = await fetch(`${BASE_URL}/agents`);
    return res.json();
  },
  deleteAgent: async (id) => {
    const res = await fetch(`${BASE_URL}/agents/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Destinations
  getDestinations: async () => {
    const res = await fetch(`${BASE_URL}/destinations`);
    return res.json();
  },
  createDestination: async (destData) => {
    const res = await fetch(`${BASE_URL}/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(destData)
    });
    return res.json();
  },
  deleteDestination: async (id) => {
    const res = await fetch(`${BASE_URL}/destinations/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // History, Restore & SureBackup
  getHistory: async () => {
    const res = await fetch(`${BASE_URL}/history`);
    return res.json();
  },
  deleteHistory: async (id) => {
    const res = await fetch(`${BASE_URL}/history/${id}`, { method: 'DELETE' });
    return res.json();
  },
  verifyBackup: async (id) => {
    const res = await fetch(`${BASE_URL}/history/${id}/verify`, { method: 'POST' });
    return res.json();
  },
  restoreBackup: async (historyIdOrOptions, targetRestorePath, jobId) => {
    let payload = {};
    if (typeof historyIdOrOptions === 'object' && historyIdOrOptions !== null) {
      payload = historyIdOrOptions;
    } else {
      payload = { historyId: historyIdOrOptions, targetRestorePath, jobId };
    }
    const res = await fetch(`${BASE_URL}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Authentication & 2FA
  login: async (credentials) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },
  verify2Fa: async (data) => {
    const res = await fetch(`${BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // OmniHub Licensing
  getLicense: async () => {
    const res = await fetch(`${BASE_URL}/license`);
    return res.json();
  },
  activateLicense: async (data) => {
    const res = await fetch(`${BASE_URL}/license/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  syncOmniHub: async (data) => {
    const res = await fetch(`${BASE_URL}/license/sync-omnihub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    });
    return res.json();
  },
  get2FaInfo: async () => {
    const res = await fetch(`${BASE_URL}/auth/2fa-info`);
    return res.json();
  },

  // Cyber Shield & VSS (Acronis + Veeam Hybrid)
  getShieldStatus: async () => {
    const res = await fetch(`${BASE_URL}/shield/status`);
    return res.json();
  },
  scanShieldPath: async (path) => {
    const res = await fetch(`${BASE_URL}/shield/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    return res.json();
  },
  getVssWriters: async () => {
    const res = await fetch(`${BASE_URL}/vss/writers`);
    return res.json();
  },

  // Logs & Settings
  getLogs: async () => {
    const res = await fetch(`${BASE_URL}/logs`);
    return res.json();
  },
  clearLogs: async () => {
    const res = await fetch(`${BASE_URL}/logs`, { method: 'DELETE' });
    return res.json();
  },
  getSettings: async () => {
    const res = await fetch(`${BASE_URL}/settings`);
    return res.json();
  },
  saveSettings: async (settings) => {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Notification Testing
  testTelegram: async (data) => {
    const res = await fetch(`${BASE_URL}/notifications/test-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  testEmail: async (data) => {
    const res = await fetch(`${BASE_URL}/notifications/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  testWebhook: async (data) => {
    const res = await fetch(`${BASE_URL}/notifications/test-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Subnet Radar & Auto-Discovery
  getNetworkInfo: async () => {
    const res = await fetch(`${BASE_URL}/network/info`);
    return res.json();
  },
  scanNetwork: async (data) => {
    const res = await fetch(`${BASE_URL}/network/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    });
    return res.json();
  },

  // Instant VM Boot & Disaster Recovery
  getInstantVms: async () => {
    const res = await fetch(`${BASE_URL}/instant-vm/list`);
    return res.json();
  },
  launchInstantVm: async (data) => {
    const res = await fetch(`${BASE_URL}/instant-vm/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  stopInstantVm: async (id) => {
    const res = await fetch(`${BASE_URL}/instant-vm/stop/${id}`, { method: 'POST' });
    return res.json();
  },

  // Zstandard Compression & Deduplication Stats
  getDedupStats: async () => {
    const res = await fetch(`${BASE_URL}/dedup/stats`);
    return res.json();
  },

  // Windows NT Headless Service Management
  getServiceStatus: async () => {
    const res = await fetch(`${BASE_URL}/service/status`);
    return res.json();
  },
  controlService: async (action) => {
    const res = await fetch(`${BASE_URL}/service/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return res.json();
  },
  installService: async () => {
    const res = await fetch(`${BASE_URL}/service/install`, { method: 'POST' });
    return res.json();
  },

  // Bare-Metal Disaster Recovery (BMR) & ISO Rescue Media
  getBareMetalStatus: async () => {
    const res = await fetch(`${BASE_URL}/baremetal/status`);
    return res.json();
  },
  createRescueMedia: async (data) => {
    const res = await fetch(`${BASE_URL}/baremetal/create-media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    });
    return res.json();
  },
  getBareMetalSnapshots: async () => {
    const res = await fetch(`${BASE_URL}/baremetal/snapshots`);
    return res.json();
  },

  // SaaS Cloud Backup (M365 & Google Workspace)
  getSaasTenants: async () => {
    const res = await fetch(`${BASE_URL}/saas/tenants`);
    return res.json();
  },
  getSaasStats: async () => {
    const res = await fetch(`${BASE_URL}/saas/stats`);
    return res.json();
  },
  backupMailbox: async (data) => {
    const res = await fetch(`${BASE_URL}/saas/backup-mailbox`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  exportPst: async (data) => {
    const res = await fetch(`${BASE_URL}/saas/export-pst`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Active Directory & Tombstone Restoration
  getAdStatus: async () => {
    const res = await fetch(`${BASE_URL}/ad/status`);
    return res.json();
  },
  getAdDeletedObjects: async () => {
    const res = await fetch(`${BASE_URL}/ad/deleted-objects`);
    return res.json();
  },
  restoreAdObject: async (objectId) => {
    const res = await fetch(`${BASE_URL}/ad/restore-object`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectId })
    });
    return res.json();
  },
  createAdSnapshot: async () => {
    const res = await fetch(`${BASE_URL}/ad/snapshot`, { method: 'POST' });
    return res.json();
  },

  // MSP Multi-Tenancy & SLA Compliance Portal
  getMspTenants: async () => {
    const res = await fetch(`${BASE_URL}/msp/tenants`);
    return res.json();
  },
  getMspStats: async () => {
    const res = await fetch(`${BASE_URL}/msp/stats`);
    return res.json();
  },
  createMspTenant: async (tenantData) => {
    const res = await fetch(`${BASE_URL}/msp/create-tenant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tenantData)
    });
    return res.json();
  },
  getMspSlaReport: async (id) => {
    const res = await fetch(`${BASE_URL}/msp/sla-report/${id}`);
    return res.json();
  },

  // AI Capacity & Disk Forecasting
  getAiForecastMetrics: async () => {
    const res = await fetch(`${BASE_URL}/ai-forecast/metrics`);
    return res.json();
  },

  // Enterprise DBs (PostgreSQL, Oracle, Proxmox/VMware)
  testPostgres: async (data) => {
    const res = await fetch(`${BASE_URL}/enterprise-db/test-postgres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    });
    return res.json();
  },
  testOracle: async (data) => {
    const res = await fetch(`${BASE_URL}/enterprise-db/test-oracle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    });
    return res.json();
  },
  testHypervisor: async (data) => {
    const res = await fetch(`${BASE_URL}/enterprise-db/test-hypervisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    });
    return res.json();
  },

  // Cryptographic Key Escrow & Password Vault
  getKeyVaultInfo: async () => {
    const res = await fetch(`${BASE_URL}/keyvault/info`);
    return res.json();
  },
  revealVaultKey: async (data) => {
    const res = await fetch(`${BASE_URL}/keyvault/reveal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  exportKeyEscrow: async () => {
    const res = await fetch(`${BASE_URL}/keyvault/export-escrow`, { method: 'POST' });
    return res.json();
  },

  // 7.13 Continuous Data Protection (CDP) & Point-in-Time
  getCdpStatus: async () => {
    const res = await fetch(`${BASE_URL}/cdp/status`);
    return res.json();
  },
  getCdpTimeline: async (volume, hours) => {
    const res = await fetch(`${BASE_URL}/cdp/timeline?volume=${encodeURIComponent(volume || 'C:\\Data')}&hours=${hours || 24}`);
    return res.json();
  },
  rollbackCdp: async (data) => {
    const res = await fetch(`${BASE_URL}/cdp/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 7.14 VM Converter (P2V, V2V, V2C)
  getVmConverterFormats: async () => {
    const res = await fetch(`${BASE_URL}/converter/formats`);
    return res.json();
  },
  getVmConversions: async () => {
    const res = await fetch(`${BASE_URL}/converter/list`);
    return res.json();
  },
  startVmConversion: async (data) => {
    const res = await fetch(`${BASE_URL}/converter/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 7.15 Four-Eyes Principle Dual-Authorization
  getFourEyesRequests: async () => {
    const res = await fetch(`${BASE_URL}/four-eyes/requests`);
    return res.json();
  },
  createFourEyesRequest: async (data) => {
    const res = await fetch(`${BASE_URL}/four-eyes/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  approveFourEyesRequest: async (data) => {
    const res = await fetch(`${BASE_URL}/four-eyes/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  rejectFourEyesRequest: async (data) => {
    const res = await fetch(`${BASE_URL}/four-eyes/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 7.16 KVKK / GDPR Compliance & Sensitive Data Sanitization
  getKvkkOverview: async () => {
    const res = await fetch(`${BASE_URL}/kvkk/overview`);
    return res.json();
  },
  runKvkkScan: async (targetArchive) => {
    const res = await fetch(`${BASE_URL}/kvkk/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetArchive })
    });
    return res.json();
  },
  executeKvkkErasure: async (data) => {
    const res = await fetch(`${BASE_URL}/kvkk/erasure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 7.17 Self-Healing & Auto-Remediation
  getSelfHealingOverview: async () => {
    const res = await fetch(`${BASE_URL}/self-healing/overview`);
    return res.json();
  },
  diagnoseSelfHealing: async (agentId) => {
    const res = await fetch(`${BASE_URL}/self-healing/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId })
    });
    return res.json();
  },

  // 7.18 Hardware Air-Gap & S3 Compliance Object Lock
  getAirGapStatus: async () => {
    const res = await fetch(`${BASE_URL}/air-gap/status`);
    return res.json();
  },
  toggleAirGapDrive: async (data) => {
    const res = await fetch(`${BASE_URL}/air-gap/toggle-isolation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  applyS3ObjectLock: async (data) => {
    const res = await fetch(`${BASE_URL}/air-gap/apply-s3-lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 7.19 OmniAI Disaster Recovery Assistant
  getAiSessions: async () => {
    const res = await fetch(`${BASE_URL}/ai-assistant/sessions`);
    return res.json();
  },
  getAiQuickPrompts: async () => {
    const res = await fetch(`${BASE_URL}/ai-assistant/quick-prompts`);
    return res.json();
  },
  askAiAssistant: async (data) => {
    const res = await fetch(`${BASE_URL}/ai-assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  clearAiSession: async (id) => {
    const res = await fetch(`${BASE_URL}/ai-assistant/session/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // 7.20 1-Click DR Runbook & Site Failover
  getDrRunbooks: async () => {
    const res = await fetch(`${BASE_URL}/dr-runbook/overview`);
    return res.json();
  },
  executeDrRunbook: async (data) => {
    const res = await fetch(`${BASE_URL}/dr-runbook/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  createDrRunbook: async (data) => {
    const res = await fetch(`${BASE_URL}/dr-runbook/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 7.21 Kubernetes & Container State Backup
  getK8sOverview: async () => {
    const res = await fetch(`${BASE_URL}/k8s/overview`);
    return res.json();
  },
  backupK8sCluster: async (data) => {
    const res = await fetch(`${BASE_URL}/k8s/backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  restoreK8sSnapshot: async (data) => {
    const res = await fetch(`${BASE_URL}/k8s/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 7.22 Ransomware Decoy & Honeypot Trap
  getHoneypotStatus: async () => {
    const res = await fetch(`${BASE_URL}/honeypot/status`);
    return res.json();
  },
  toggleHoneypotSentry: async (enable) => {
    const res = await fetch(`${BASE_URL}/honeypot/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable })
    });
    return res.json();
  },
  deployHoneypotDecoy: async (data) => {
    const res = await fetch(`${BASE_URL}/honeypot/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  simulateHoneypotAttack: async () => {
    const res = await fetch(`${BASE_URL}/honeypot/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  // 7.23 ReFS / Btrfs Synthetic Fast-Clone
  getSyntheticOverview: async () => {
    const res = await fetch(`${BASE_URL}/synthetic-clone/overview`);
    return res.json();
  },
  benchmarkSyntheticClone: async (data) => {
    const res = await fetch(`${BASE_URL}/synthetic-clone/benchmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 7.24 WAN Accelerator & Traffic QoS
  getWanStatus: async () => {
    const res = await fetch(`${BASE_URL}/wan-accelerator/status`);
    return res.json();
  },
  updateWanConfig: async (data) => {
    const res = await fetch(`${BASE_URL}/wan-accelerator/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  purgeWanCache: async () => {
    const res = await fetch(`${BASE_URL}/wan-accelerator/purge-cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  // 7.25 Multi-Cloud Geo-Redundancy & 3-2-1-1-0 Radar
  getGeoOverview: async () => {
    const res = await fetch(`${BASE_URL}/geo-redundancy/overview`);
    return res.json();
  },
  runGeoAudit: async () => {
    const res = await fetch(`${BASE_URL}/geo-redundancy/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  // 7.28 OTA Network Auto-Updater
  checkUpdate: async (url) => {
    const query = url ? `?url=${encodeURIComponent(url)}` : '';
    const res = await fetch(`${BASE_URL}/update/check${query}`);
    return res.json();
  },
  applyUpdate: async (downloadUrl) => {
    const res = await fetch(`${BASE_URL}/update/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ downloadUrl })
    });
    return res.json();
  }
};
