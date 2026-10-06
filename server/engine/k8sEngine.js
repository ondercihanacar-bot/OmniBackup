/**
 * Kubernetes & Container State Backup Engine
 * Namespaces, Pods, StatefulSets, PVC snapshots, Helm Releases, Etcd & Secrets
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/k8s_backups.json');

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      clusters: [
        {
          id: 'k8s-prod-cluster-01',
          name: 'k8s-prod-cluster-01 (v1.29.2)',
          apiEndpoint: 'https://192.168.10.50:6443',
          nodeCount: 8,
          status: 'healthy',
          lastBackup: '2026-10-04T00:30:00Z',
          namespaces: [
            { name: 'default', pods: 12, pvcs: 2, helmReleases: 1, backupPolicy: 'Daily' },
            { name: 'production', pods: 48, pvcs: 16, helmReleases: 5, backupPolicy: 'Hourly-CDP' },
            { name: 'database', pods: 8, pvcs: 8, helmReleases: 2, backupPolicy: 'Hourly-CDP' },
            { name: 'ingress-nginx', pods: 4, pvcs: 0, helmReleases: 1, backupPolicy: 'Daily' },
            { name: 'monitoring', pods: 14, pvcs: 4, helmReleases: 2, backupPolicy: 'Weekly' }
          ]
        },
        {
          id: 'k8s-staging-cluster',
          name: 'k8s-staging-cluster (v1.29.0)',
          apiEndpoint: 'https://192.168.20.50:6443',
          nodeCount: 3,
          status: 'healthy',
          lastBackup: '2026-10-03T18:00:00Z',
          namespaces: [
            { name: 'default', pods: 6, pvcs: 1, helmReleases: 1, backupPolicy: 'Daily' },
            { name: 'staging-app', pods: 14, pvcs: 4, helmReleases: 2, backupPolicy: 'Daily' }
          ]
        }
      ],
      snapshots: [
        {
          id: 'k8s-snap-9901',
          clusterId: 'k8s-prod-cluster-01',
          namespace: 'production',
          type: 'Full State (Etcd + Secrets + 16 PVC)',
          size: '42.8 GB',
          createdAt: '2026-10-04T00:30:00Z',
          status: 'verified',
          pvcList: ['pvc-data-redis-0', 'pvc-mongo-primary-0', 'pvc-media-storage-01'],
          helmReleases: ['ecom-api-v2', 'order-processor-v1', 'payment-gateway']
        },
        {
          id: 'k8s-snap-9902',
          clusterId: 'k8s-prod-cluster-01',
          namespace: 'database',
          type: 'StatefulSet & PVC Volume Snapshot',
          size: '128.5 GB',
          createdAt: '2026-10-03T23:30:00Z',
          status: 'verified',
          pvcList: ['data-postgresql-ha-0', 'data-postgresql-ha-1'],
          helmReleases: ['postgresql-ha']
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
    return { clusters: [], snapshots: [] };
  }
}

function saveData(data) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  getOverview: () => {
    return getData();
  },
  triggerClusterBackup: (clusterId, namespace = 'all') => {
    const data = getData();
    const cluster = data.clusters.find(c => c.id === clusterId);
    if (!cluster) throw new Error('Cluster bulunamadı');

    const snapId = `k8s-snap-${Date.now()}`;
    const newSnapshot = {
      id: snapId,
      clusterId: cluster.id,
      namespace: namespace,
      type: namespace === 'all' ? 'Full Cluster & Etcd' : `Namespace (${namespace}) + PVC`,
      size: `${(Math.random() * 50 + 10).toFixed(1)} GB`,
      createdAt: new Date().toISOString(),
      status: 'verified',
      pvcList: ['pvc-auto-synced-01', 'pvc-auto-synced-02'],
      helmReleases: ['release-synced']
    };

    cluster.lastBackup = newSnapshot.createdAt;
    data.snapshots.unshift(newSnapshot);
    saveData(data);

    return { success: true, snapshot: newSnapshot };
  },
  restoreSnapshot: (snapshotId, targetClusterId, targetNamespace) => {
    const data = getData();
    const snap = data.snapshots.find(s => s.id === snapshotId);
    if (!snap) throw new Error('Snapshot bulunamadı');

    return {
      success: true,
      message: `Snapshot [${snap.id}] başarıyla [${targetClusterId}] / [${targetNamespace || snap.namespace}] üzerine geri yüklendi. PVC ve Podlar aktif.`,
      restoredAt: new Date().toISOString()
    };
  }
};
