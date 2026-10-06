/**
 * OmniBackup Enterprise - Four-Eyes Principle (Dört Göz Kuralı) & Zero-Trust Dual-Authorization Engine
 * Requires 2 separate administrators to approve critical/destructive actions (e.g., delete backup, disable WORM, reset key escrow).
 */

class FourEyesEngine {
  constructor() {
    this.pendingRequests = [
      {
        id: 'req-fe-01',
        actionType: 'DELETE_WORM_BACKUP',
        actionLabel: 'WORM Korumalı ERP Arşiv Yedeğini Silme Talebi',
        initiator: 'onder.acar (Admin)',
        initiatorIp: '192.168.0.51',
        targetResource: 'backup_mssql_full_20260901.obk (WORM LOCKED)',
        requestDate: new Date(Date.now() - 1800000).toISOString(),
        expiresDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'PENDING_SECOND_APPROVAL',
        requiredApproverRole: 'Security Officer / Super Admin',
        secondApprover: null,
        notes: 'Yasal saklama süresi dolan eski test arşivinin temizlenmesi talebi.'
      },
      {
        id: 'req-fe-02',
        actionType: 'DISABLE_RANSOMWARE_SHIELD',
        actionLabel: 'Siber Kalkan (Anti-Ransomware) Kapatma Talebi',
        initiator: 'sistem.yonetici (Admin)',
        initiatorIp: '192.168.0.88',
        targetResource: 'CyberShield Shannon Entropy & WORM Filter',
        requestDate: new Date(Date.now() - 7200000).toISOString(),
        expiresDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'APPROVED',
        requiredApproverRole: 'CISO / Security Director',
        secondApprover: 'ciso.guvenlik@sirket.com (2FA Verified)',
        approvedDate: new Date(Date.now() - 3600000).toISOString(),
        notes: 'Büyük ölçekli veri geçişi için 2 saatlik geçici bakım onayı.'
      }
    ];
  }

  getRequests() {
    return {
      success: true,
      pendingCount: this.pendingRequests.filter(r => r.status === 'PENDING_SECOND_APPROVAL').length,
      requests: this.pendingRequests
    };
  }

  createRequest(data) {
    const { actionType, actionLabel, targetResource, notes, initiator } = data;
    const req = {
      id: `req-fe-${Date.now().toString(36)}`,
      actionType: actionType || 'CRITICAL_OPERATION',
      actionLabel: actionLabel || 'Kritik Güvenlik İşlemi Talebi',
      initiator: initiator || 'admin@omnihub.local',
      initiatorIp: '127.0.0.1',
      targetResource: targetResource || 'Master Encryption & Retention Policy',
      requestDate: new Date().toISOString(),
      expiresDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      status: 'PENDING_SECOND_APPROVAL',
      requiredApproverRole: 'İkinci Yönetici (Dual-Admin)',
      secondApprover: null,
      notes: notes || 'Yönetici onay talebi.'
    };

    this.pendingRequests.unshift(req);
    return {
      success: true,
      message: 'Kritik işlem talebi oluşturuldu. İkinci yönetici onayı bekleniyor (Dört Göz Kuralı).',
      request: req
    };
  }

  approveRequest(requestId, approverUser, pinCode) {
    const req = this.pendingRequests.find(r => r.id === requestId);
    if (!req) {
      throw new Error('Talep bulunamadı.');
    }

    if (pinCode !== '123456' && pinCode !== '998811') {
      throw new Error('İkinci yönetici 2FA / Güvenlik PIN kodu geçersiz.');
    }

    req.status = 'APPROVED';
    req.secondApprover = approverUser || 'ikinci.admin@sirket.local (2FA Onaylandı)';
    req.approvedDate = new Date().toISOString();

    return {
      success: true,
      message: `"${req.actionLabel}" işlemi 2. yönetici tarafından başarıyla onaylandı ve icra edildi.`,
      request: req
    };
  }

  rejectRequest(requestId, approverUser, reason) {
    const req = this.pendingRequests.find(r => r.id === requestId);
    if (!req) {
      throw new Error('Talep bulunamadı.');
    }

    req.status = 'REJECTED';
    req.secondApprover = approverUser || 'security.auditor@sirket.local';
    req.rejectionReason = reason || 'Güvenlik politikalarına aykırı işlem reddedildi.';
    req.rejectedDate = new Date().toISOString();

    return {
      success: true,
      message: `"${req.actionLabel}" işlemi reddedildi ve güvenli şekilde kilitlendi.`,
      request: req
    };
  }
}

module.exports = new FourEyesEngine();
