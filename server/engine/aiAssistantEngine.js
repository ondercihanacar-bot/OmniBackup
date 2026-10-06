/**
 * OmniAI Disaster Recovery Assistant Engine
 * Natural Language Prompt-based Restore & Enterprise Query Orchestrator
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/ai_assistant.json');

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      sessions: [
        {
          id: 'session-default',
          title: 'Genel Sistem Kurtarma & Analiz',
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: 'msg-1',
              sender: 'assistant',
              text: 'Merhaba! Ben OmniAI Kurtarma Asistanı. Doğal dilde sorgu yazarak yedekleri analiz edebilir, anında geri yükleme planları oluşturabilir veya felaket senaryoları simüle edebilirsiniz. Nasıl yardımcı olabilirim?',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              suggestedActions: [
                'Son 2 saatteki SQL veritabanı yedeğini doğrula',
                'Kritik sanal makineler için RTO/RPO analizi yap',
                'Fidye yazılımı honeypot alarmlarını kontrol et',
                'Site Failover tatbikatı için senaryo hazırla'
              ]
            }
          ]
        }
      ],
      quickPrompts: [
        { id: 'qp-1', label: 'SQL DB Hızlı Kurtarma', prompt: 'Finans-SQL sunucusunun en son transaction log yedeğini test ortamına yükle' },
        { id: 'qp-2', label: 'RPO/RTO Sağlık Raporu', prompt: 'Tüm kritik servislerin RPO ve RTO uyumluluk durumunu listele' },
        { id: 'qp-3', label: 'Zero-Day Tehdit Kontrolü', prompt: 'Son 24 saatteki değişen blok oranlarını ve şifreleme anomalilerini incele' },
        { id: 'qp-4', label: 'Kubernetes PVC Geri Dönüş', prompt: 'Production clusterindeki ecommerce-db PVC snapshotını geri yükle' }
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
    return { sessions: [], quickPrompts: [] };
  }
}

function saveData(data) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function generateResponse(prompt) {
  const p = prompt.toLowerCase();
  let responseText = '';
  let intent = 'general_query';
  let executionPlan = null;
  let suggestedActions = [];

  if (p.includes('sql') || p.includes('veritaban') || p.includes('database')) {
    intent = 'db_restore';
    responseText = 'SQL Veritabanı analizi tamamlandı. [SRV-MSSQL-PROD / DB_ERP_2026] için son 15 dakikalık CDP log snapshot bulundu. Bütünlük doğrulaması (SHA-256) başarılı. Geri yükleme sandbox ortamında 45 saniyede ayağa kaldırılabilir.';
    executionPlan = {
      target: 'SRV-MSSQL-PROD (DB_ERP_2026)',
      restorePoint: 'Bugün 01:45 (CDP Snapshot #8492)',
      estimatedTime: '45 sn (Instant Mount)',
      mode: 'Isolated Sandbox / Staging Test',
      safeScore: 99.8
    };
    suggestedActions = ['Test Ortamına Canlı Mount Et', 'Hedef Sunucuya Overwrite Restore Yap', 'Point-in-Time Tablo Düzeyinde İncele'];
  } else if (p.includes('rpo') || p.includes('rto') || p.includes('rapor') || p.includes('sağlık')) {
    intent = 'sla_analysis';
    responseText = 'SLA Uyumluluk Değerlendirmesi: Toplam 42 kritik sunucudan 40 tanesi hedeflenen 15 dk RPO ve 5 dk RTO eşiğine %100 uyumlu. 2 adet uzak ofis NAS yedeğinde WAN bant genişliği sınırlaması nedeniyle RPO 28 dakikaya uzadı. WAN Hızlandırıcı ve Deduplikasyon optimizasyonu önerilmektedir.';
    executionPlan = {
      target: 'Enterprise Fleet (42 VM & DB)',
      slaCompliance: '95.2%',
      currentAvgRpo: '4.2 Dakika',
      currentAvgRto: '2.8 Dakika',
      criticalAlerts: 0
    };
    suggestedActions = ['WAN Hızlandırmayı Devreye Al', 'Uzak Ofis Yedeklerini Önceliklendir', 'PDF SLA Raporu İndir'];
  } else if (p.includes('fidye') || p.includes('ransomware') || p.includes('honeypot') || p.includes('şifrele')) {
    intent = 'threat_defense';
    responseText = 'Fidye Yazılımı Güvenlik Taraması: 18 Honeypot yem dosyasında herhangi bir yetkisiz şifreleme veya uzantı modifikasyonu tespit edilmedi. Değişen blok entropi seviyesi %1.2 (Normal). İmmutable (Değiştirilemez) WORM Air-Gap depolama 32 gündür kilitli ve güvende.';
    executionPlan = {
      threatLevel: 'GÜVENLİ (CLEAN)',
      honeypotActiveSentry: 18,
      entropyStatus: 'Stabil (< 3.0 Normal)',
      wormLockStatus: 'Active WORM (Değiştirilemez)'
    };
    suggestedActions = ['Honeypot Tuzaklarını Yenile', 'Air-Gap Anlık Karantina Testi Başlat', 'Immutable Snapshot Kilidini Doğrula'];
  } else if (p.includes('k8s') || p.includes('kubernetes') || p.includes('pod') || p.includes('pvc')) {
    intent = 'k8s_restore';
    responseText = 'Kubernetes Cluster Durumu: k8s-prod-cluster-01 üzerinde 6 Namespace, 24 PVC ve 8 Helm sürümü izleniyor. Son başarılı etcd + PVC snapshot 20 dakika önce alındı.';
    executionPlan = {
      cluster: 'k8s-prod-cluster-01',
      namespaces: ['default', 'production', 'database', 'ingress'],
      pvcCount: 24,
      lastSnapshot: '20 dk önce'
    };
    suggestedActions = ['Namespace Bazlı Kurtarma Başlat', 'Helm Chart State İndir', 'PVC Verisini Staging Clustere Klonla'];
  } else {
    responseText = `"${prompt}" talebiniz OmniAI tarafından çözümlendi. İlgili altyapı bileşenleri, veri havuzları ve şifreli snapshot katalogları tarandı. Sistem tüm koruma politikaları dahilinde optimum kurtarma adımlarını yürütmeye hazırdır.`;
    executionPlan = {
      status: 'Ready',
      targetScope: 'All Backup Repositories',
      confidence: 98.5
    };
    suggestedActions = ['Detaylı Sistem Tanılaması Yap', 'Otomatik Kurtarma Simülasyonu Çalıştır'];
  }

  return { responseText, intent, executionPlan, suggestedActions };
}

module.exports = {
  getSessions: () => {
    const data = getData();
    return data.sessions;
  },
  getQuickPrompts: () => {
    const data = getData();
    return data.quickPrompts;
  },
  askQuestion: (sessionId, prompt) => {
    const data = getData();
    let session = data.sessions.find(s => s.id === sessionId);
    if (!session) {
      session = {
        id: `session-${Date.now()}`,
        title: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
        createdAt: new Date().toISOString(),
        messages: []
      };
      data.sessions.unshift(session);
    }

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toISOString()
    };
    session.messages.push(userMsg);

    const generated = generateResponse(prompt);
    const aiMsg = {
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',
      text: generated.responseText,
      intent: generated.intent,
      executionPlan: generated.executionPlan,
      suggestedActions: generated.suggestedActions,
      timestamp: new Date().toISOString()
    };
    session.messages.push(aiMsg);

    saveData(data);
    return { session, userMsg, aiMsg };
  },
  clearSession: (sessionId) => {
    const data = getData();
    data.sessions = data.sessions.filter(s => s.id !== sessionId);
    if (data.sessions.length === 0) {
      data.sessions.push({
        id: 'session-default',
        title: 'Yeni Kurtarma Oturumu',
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-init',
            sender: 'assistant',
            text: 'Yeni kurtarma oturumu başlatıldı. Size nasıl yardımcı olabilirim?',
            timestamp: new Date().toISOString(),
            suggestedActions: ['SQL DB Kurtar', 'RPO/RTO Kontrol', 'Honeypot Kontrol']
          }
        ]
      });
    }
    saveData(data);
    return data.sessions;
  }
};
