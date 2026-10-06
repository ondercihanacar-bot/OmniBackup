/**
 * 1-Click Disaster Recovery Runbook & Automated Site Failover Engine
 * Orchestrates ordered VM/Service boot sequences, DNS re-IP, and drill tests.
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/dr_runbooks.json');

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      runbooks: [
        {
          id: 'rb-datacenter-alpha',
          name: 'Merkez Veri Merkezi -> DR Bulut Failover',
          description: 'Birincil veri merkezi çökmesi durumunda kritik servisleri DR sahasında sıralı olarak ayağa kaldırır.',
          status: 'ready', // ready, running, failed, completed
          targetSite: 'Ankara DR Veri Merkezi (Hyper-V / VMware)',
          lastDrill: '2026-10-01T14:30:00Z',
          lastDrillStatus: 'Success (RTO: 4m 12s)',
          estimatedRtoSeconds: 260,
          steps: [
            { id: 1, name: 'Air-Gap Snapshot Kilit Açılışı & Bütünlük Kontrolü', tier: 'Tier-0 Pre-check', status: 'pending', duration: '12s' },
            { id: 2, name: 'Active Directory & Core DNS Sunucularını Başlat (DC-01, DC-02)', tier: 'Tier-1 Domain', status: 'pending', duration: '45s' },
            { id: 3, name: 'Kurumsal Veritabanı Kümelerini Ayağa Kaldır (SQL-Prod, PG-Cluster)', tier: 'Tier-2 Databases', status: 'pending', duration: '90s' },
            { id: 4, name: 'Uygulama ve ERP / CRM Sunucularını Başlat (ERP-App01, CRM-02)', tier: 'Tier-3 Application', status: 'pending', duration: '60s' },
            { id: 5, name: 'BGP Routing & DNS IP Güncellemesi (10.10.x.x -> 10.20.x.x)', tier: 'Tier-4 Network', status: 'pending', duration: '20s' },
            { id: 6, name: 'Sağlık Taraması (Health Check & End-to-End Ping)', tier: 'Tier-5 Validation', status: 'pending', duration: '15s' }
          ]
        },
        {
          id: 'rb-financial-isolated',
          name: 'Finans & Muhasebe İzole Sandbox Kurtarma',
          description: 'Yalnızca finans ve bordro veritabanlarını izole sanal ağda denetim ve tatbikat için ayağa kaldırır.',
          status: 'ready',
          targetSite: 'İzole Test Sandbox (VLAN 999)',
          lastDrill: '2026-09-28T10:00:00Z',
          lastDrillStatus: 'Success (RTO: 1m 55s)',
          estimatedRtoSeconds: 120,
          steps: [
            { id: 1, name: 'İzole Sanal Switch ve NAT Ağını Oluştur', tier: 'Tier-0 Network', status: 'pending', duration: '10s' },
            { id: 2, name: 'SQL Finans VM Fast-Clone Mount Et', tier: 'Tier-1 Database', status: 'pending', duration: '35s' },
            { id: 3, name: 'İstemci Test Makinesini Başlat ve DB Doğrula', tier: 'Tier-2 Client', status: 'pending', duration: '40s' }
          ]
        }
      ],
      executionHistory: [
        {
          id: 'exec-8491',
          runbookId: 'rb-datacenter-alpha',
          mode: 'Drill Test (Tatbikat)',
          startedAt: '2026-10-01T14:30:00Z',
          completedAt: '2026-10-01T14:34:12Z',
          rto: '4m 12s',
          status: 'Success',
          operator: 'admin@enterprise.local'
        }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function getData() {
  ensureDb();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return { runbooks: [], executionHistory: [] };
  }
}

function saveData(data) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  getRunbooks: () => {
    return getData();
  },
  executeRunbook: (runbookId, mode = 'drill') => {
    const data = getData();
    const rb = data.runbooks.find(r => r.id === runbookId);
    if (!rb) throw new Error('Runbook bulunamadı');

    const execId = `exec-${Date.now()}`;
    const startTime = new Date().toISOString();
    
    // Simulate step completions
    const updatedSteps = rb.steps.map(s => ({ ...s, status: 'completed' }));
    const execRecord = {
      id: execId,
      runbookId: rb.id,
      runbookName: rb.name,
      mode: mode === 'live' ? 'CANLI FAILOVER' : 'Tatbikat (Drill Test)',
      startedAt: startTime,
      completedAt: new Date(Date.now() + (rb.estimatedRtoSeconds * 1000)).toISOString(),
      rto: `${Math.floor(rb.estimatedRtoSeconds / 60)}m ${rb.estimatedRtoSeconds % 60}s`,
      status: 'Success',
      operator: 'admin@enterprise.local'
    };

    rb.lastDrill = startTime;
    rb.lastDrillStatus = `Success (RTO: ${execRecord.rto})`;
    rb.steps = updatedSteps;

    data.executionHistory.unshift(execRecord);
    saveData(data);

    return { success: true, execution: execRecord, runbook: rb };
  },
  createRunbook: (newRunbook) => {
    const data = getData();
    const rb = {
      id: `rb-${Date.now()}`,
      name: newRunbook.name || 'Yeni DR Runbook',
      description: newRunbook.description || '',
      status: 'ready',
      targetSite: newRunbook.targetSite || 'DR Bulut Hedefi',
      lastDrill: 'Henüz yapılmadı',
      lastDrillStatus: 'Pending',
      estimatedRtoSeconds: newRunbook.estimatedRtoSeconds || 180,
      steps: newRunbook.steps || [
        { id: 1, name: 'Snapshot Kilit Açılışı', tier: 'Tier-0', status: 'pending', duration: '15s' },
        { id: 2, name: 'Sanal Sunucuları Başlat', tier: 'Tier-1', status: 'pending', duration: '60s' },
        { id: 3, name: 'DNS Re-IP ve Ping Doğrulama', tier: 'Tier-2', status: 'pending', duration: '25s' }
      ]
    };
    data.runbooks.push(rb);
    saveData(data);
    return rb;
  }
};
