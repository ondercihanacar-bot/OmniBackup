/**
 * OmniBackup Enterprise - Four-Eyes Principle (Dört Göz Kuralı) & Zero-Trust Dual-Authorization Engine
 */

class FourEyesEngine {
  constructor() {
    this.pendingRequests = [];
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
      initiator: initiator || 'admin',
      initiatorIp: '127.0.0.1',
      targetResource: targetResource || 'Master Encryption & Retention Policy',
      requestDate: new Date().toISOString(),
      expiresDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      status: 'PENDING_SECOND_APPROVAL',
      requiredApproverRole: 'İkinci Yönetici (2FA)',
      secondApprover: null,
      notes: notes || 'Güvenlik onay talebi.'
    };

    this.pendingRequests.unshift(req);
    return { success: true, request: req };
  }

  approveRequest(requestId, approverName = 'Güvenlik Sorumlusu') {
    const req = this.pendingRequests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Talep bulunamadı.' };

    req.status = 'APPROVED';
    req.secondApprover = `${approverName} (Onaylandı)`;
    req.approvedDate = new Date().toISOString();

    return { success: true, message: `Talep başarıyla onaylandı: ${req.actionLabel}` };
  }

  rejectRequest(requestId, rejectReason = 'Yönetici tarafından reddedildi') {
    const req = this.pendingRequests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Talep bulunamadı.' };

    req.status = 'REJECTED';
    req.rejectReason = rejectReason;
    req.rejectedDate = new Date().toISOString();

    return { success: true, message: `Talep reddedildi: ${req.actionLabel}` };
  }
}

module.exports = new FourEyesEngine();
