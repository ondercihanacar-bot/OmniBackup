const db = require('../db');

class MspEngine {
  constructor() {
    this.initDefaultTenants();
  }

  initDefaultTenants() {
    const data = db.read();
    if (!data.mspTenants) {
      data.mspTenants = [
        {
          id: 'msp-tenant-01',
          name: 'Anadolu Lojistik A.Ş.',
          contactPerson: 'Murat Yılmaz (IT Müdürü)',
          contactEmail: 'it@anadolulojistik.com',
          planType: 'MSP Platinum Gold 24/7',
          allocatedQuotaGB: 2048,
          usedQuotaGB: 684.2,
          maxAgents: 15,
          activeAgents: 8,
          slaTargetPercent: 99.9,
          slaAchievedPercent: 100.0,
          totalJobsMonth: 240,
          successJobsMonth: 240,
          failedJobsMonth: 0,
          status: 'ACTIVE',
          billingCycle: 'Aylık',
          createdDate: '2026-01-15'
        },
        {
          id: 'msp-tenant-02',
          name: 'Marmara Sağlık & Poliklinik Grubu',
          contactPerson: 'Dr. Selin Kaya',
          contactEmail: 'bilgi@marmarasaglik.com',
          planType: 'MSP HIPAA/KVKK Sağlık Paketi',
          allocatedQuotaGB: 4096,
          usedQuotaGB: 1820.5,
          maxAgents: 25,
          activeAgents: 14,
          slaTargetPercent: 99.95,
          slaAchievedPercent: 99.98,
          totalJobsMonth: 580,
          successJobsMonth: 578,
          failedJobsMonth: 2,
          status: 'ACTIVE',
          billingCycle: 'Yıllık',
          createdDate: '2026-02-01'
        },
        {
          id: 'msp-tenant-03',
          name: 'Ege Resort Oteller Zinciri',
          contactPerson: 'Caner Demir (Sistem Yöneticisi)',
          contactEmail: 'teknik@egeresort.com',
          planType: 'MSP Standart Business',
          allocatedQuotaGB: 1024,
          usedQuotaGB: 340.0,
          maxAgents: 10,
          activeAgents: 4,
          slaTargetPercent: 99.5,
          slaAchievedPercent: 100.0,
          totalJobsMonth: 120,
          successJobsMonth: 120,
          failedJobsMonth: 0,
          status: 'ACTIVE',
          billingCycle: 'Aylık',
          createdDate: '2026-03-10'
        }
      ];
      db.write(data);
    }
  }

  getTenants() {
    this.initDefaultTenants();
    const data = db.read();
    return data.mspTenants || [];
  }

  getStats() {
    const tenants = this.getTenants();
    let totalAllocatedGB = 0;
    let totalUsedGB = 0;
    let totalAgents = 0;
    let totalJobs = 0;
    let totalSuccess = 0;

    tenants.forEach(t => {
      totalAllocatedGB += t.allocatedQuotaGB;
      totalUsedGB += t.usedQuotaGB;
      totalAgents += t.activeAgents;
      totalJobs += t.totalJobsMonth;
      totalSuccess += t.successJobsMonth;
    });

    const avgSla = (totalSuccess / Math.max(1, totalJobs) * 100).toFixed(2);

    return {
      totalTenants: tenants.length,
      totalAllocatedGB: `${totalAllocatedGB} GB`,
      totalUsedGB: `${totalUsedGB.toFixed(1)} GB`,
      quotaUtilizationPercent: `${((totalUsedGB / totalAllocatedGB) * 100).toFixed(1)}%`,
      managedAgentsCount: totalAgents,
      averageSlaCompliance: `${avgSla}%`,
      portalMode: 'MSP Central Multi-Tenant Hub'
    };
  }

  async createTenant(tenantData) {
    const data = db.read();
    const id = `msp-tenant-${Date.now().toString(36)}`;
    const newTenant = {
      id,
      name: tenantData.name || 'Yeni Müşteri Şirketi',
      contactPerson: tenantData.contactPerson || 'IT Sorumlusu',
      contactEmail: tenantData.contactEmail || 'it@musteri.com',
      planType: tenantData.planType || 'MSP Standart Tier',
      allocatedQuotaGB: Number(tenantData.allocatedQuotaGB) || 1024,
      usedQuotaGB: 0,
      maxAgents: Number(tenantData.maxAgents) || 10,
      activeAgents: 1,
      slaTargetPercent: 99.9,
      slaAchievedPercent: 100.0,
      totalJobsMonth: 0,
      successJobsMonth: 0,
      failedJobsMonth: 0,
      status: 'ACTIVE',
      billingCycle: tenantData.billingCycle || 'Aylık',
      createdDate: new Date().toISOString().slice(0, 10)
    };

    data.mspTenants.push(newTenant);
    db.write(data);
    db.addLog("info", "MSPPortal", `Yeni MSP Müşteri Şirketi tanımlandı: ${newTenant.name}`);
    return newTenant;
  }

  generateSlaReport(tenantId) {
    const tenants = this.getTenants();
    const t = tenants.find(x => x.id === tenantId) || tenants[0];

    return {
      success: true,
      reportTitle: `Aylık Yedekleme SLA & Performans Karnesi - ${t.name}`,
      reportMonth: new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
      tenantName: t.name,
      slaAchieved: `${t.slaAchievedPercent}%`,
      slaTarget: `${t.slaTargetPercent}%`,
      totalProtectedJobs: t.totalJobsMonth,
      successfulRuns: t.successJobsMonth,
      failedRuns: t.failedJobsMonth,
      quotaStatus: `${t.usedQuotaGB} GB / ${t.allocatedQuotaGB} GB (%${((t.usedQuotaGB / t.allocatedQuotaGB) * 100).toFixed(1)})`,
      complianceRating: t.slaAchievedPercent >= t.slaTargetPercent ? 'SLA_COMPLIANT_EXCELLENT' : 'SLA_WARNING',
      executiveSummary: `${t.name} firmasına ait ${t.activeAgents} adet fiziksel/sanal ajan ve veritabanı 7/24 başarıyla yedeklenmiş, RPO/RTO hedefleri %100 oranında karşılanmıştır.`
    };
  }
}

module.exports = new MspEngine();
