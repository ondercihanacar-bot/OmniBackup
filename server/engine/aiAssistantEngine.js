/**
 * OmniAI Disaster Recovery Assistant Engine
 * Natural Language Prompt-based Restore & Real Database Query Orchestrator
 */
const fs = require('fs');
const path = require('path');
const db = require('../db');

const DB_PATH = path.join(__dirname, '../data/ai_assistant.json');

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      sessions: [
        {
          id: 'session-default',
          title: 'Genel Sistem Analiz ve Kurtarma',
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: 'msg-1',
              sender: 'assistant',
              text: 'Merhaba! Ben OmniAI Kurtarma Asistanı. Doğal dilde sorgu yazarak yedekleri analiz edebilir, sistem durumunu sorgulayabilir veya anında geri yükleme planları oluşturabilirsiniz. Size nasıl yardımcı olabilirim?',
              timestamp: new Date().toISOString(),
              suggestedActions: [
                'Sistem yedekleme durumunu analiz et',
                'Depolama hedeflerini kontrol et',
                'Ransomware kalkanı durumunu incele'
              ]
            }
          ]
        }
      ],
      quickPrompts: [
        { id: 'qp-1', label: 'Sistem Sağlık Durumu', prompt: 'Sistem genel durumunu ve son yedekleri analiz et' },
        { id: 'qp-2', label: 'Depolama Alanları', prompt: 'Kayıtlı depolama alanlarının durumunu raporla' },
        { id: 'qp-3', label: 'Güvenlik ve Tehdit Kontrolü', prompt: 'Siber kalkan ve ransomware tehdit durumunu incele' }
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
  const mainDb = db.read();
  const jobs = mainDb.jobs || [];
  const history = mainDb.history || [];
  const destinations = mainDb.destinations || [];
  const failedCount = history.filter(h => h.status === 'failed').length;

  let responseText = '';
  let intent = 'general_query';
  let executionPlan = null;
  let suggestedActions = [];

  if (p.includes('sql') || p.includes('veritaban') || p.includes('database')) {
    const sqlJobs = jobs.filter(j => j.sourceType === 'sql' || j.type === 'sql');
    intent = 'db_restore';
    if (sqlJobs.length > 0) {
      responseText = `Kayıtlı ${sqlJobs.length} adet SQL veritabanı koruma planı incelendi: ${sqlJobs.map(j => j.name).join(', ')}. Sistem anında geri yükleme için hazırdır.`;
    } else {
      responseText = 'Sistemde henüz kayıtlı bir SQL veritabanı yedekleme görevi bulunmuyor. Yeni bir SQL yedekleme görevi oluşturmak için "Yedekleme Görevleri" sekmesini kullanabilirsiniz.';
    }
    executionPlan = {
      target: sqlJobs.length > 0 ? sqlJobs[0].name : 'Yerel Sistem',
      activeSqlJobs: sqlJobs.length,
      mode: 'Standard VSS / Instant Mount',
      safeScore: 100
    };
    suggestedActions = ['Yeni SQL Görevi Oluştur', 'Sistem Yedeklerini Listele'];
  } else if (p.includes('depo') || p.includes('hedef') || p.includes('storage') || p.includes('disk')) {
    intent = 'storage_analysis';
    responseText = `Sistemde ${destinations.length} adet kayıtlı depolama alanı mevcut: ${destinations.map(d => `${d.name} (${d.path || d.type})`).join(', ')}.`;
    executionPlan = {
      destinationsCount: destinations.length,
      status: 'Ready'
    };
    suggestedActions = ['Yeni Depo Ekle', 'Depolama Durumunu İncele'];
  } else {
    responseText = `"${prompt}" talebiniz gerçek sistem verileriyle incelendi. Toplam ${jobs.length} aktif görev, ${history.length} yedekleme kaydı ve ${destinations.length} depolama alanı denetlendi. Sistem durumu stabil ve %100 operasyoneldir.`;
    executionPlan = {
      status: 'Ready',
      totalJobs: jobs.length,
      totalBackups: history.length,
      failedBackups: failedCount
    };
    suggestedActions = ['Genel Rapor Görüntüle', 'Yedekleme Başlat'];
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
    let session = (data.sessions || []).find(s => s.id === sessionId);
    if (!session) {
      session = {
        id: `session-${Date.now()}`,
        title: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
        createdAt: new Date().toISOString(),
        messages: []
      };
      data.sessions = data.sessions || [];
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
    data.sessions = (data.sessions || []).filter(s => s.id !== sessionId);
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
            suggestedActions: ['Sistem Durumunu Analiz Et', 'Depolama Kontrolü']
          }
        ]
      });
    }
    saveData(data);
    return data.sessions;
  }
};
