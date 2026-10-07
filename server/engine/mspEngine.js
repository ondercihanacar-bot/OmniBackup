const db = require('../db');

class MspEngine {
  initDefaultTenants() {
    const data = db.read();
    if (!data.mspTenants) {
      data.mspTenants = [];
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
      totalAllocatedGB += (t.allocatedQuotaGB || 0);
      totalUsedGB += (t.usedQuotaGB || 0);
      totalAgents += (t.activeAgents || 0);
      totalJobs += (t.totalJobsMonth || 0);
      totalSuccess += (t.successJobsMonth || 0);
    });

    const avgSla = totalJobs > 0 ? (totalSuccess / totalJobs * 100).toFixed(2) : "100.00";

    return {
      totalTenants: tenants.length,
      totalAllocatedGB: `${totalAllocatedGB} GB`,
      totalUsedGB: `${totalUsedGB.toFixed(1)} GB`,
      totalActiveAgents: totalAgents,
      monthlyJobsExecuted: totalJobs,
      globalSlaCompliance: `${avgSla}%`
    };
  }

  async createTenant(tenantData) {
    const data = db.read();
    data.mspTenants = data.mspTenants || [];

    const newTenant = {
      id: `msp-tenant-${Date.now()}`,
      name: tenantData.name || 'Yeni MSP Müşterisi',
      contactPerson: tenantData.contactPerson || '',
      contactEmail: tenantData.contactEmail || '',
      planType: tenantData.planType || 'Standart',
      allocatedQuotaGB: parseInt(tenantData.allocatedQuotaGB) || 1024,
      usedQuotaGB: 0,
      maxAgents: parseInt(tenantData.maxAgents) || 10,
      activeAgents: 0,
      slaTargetPercent: 99.9,
      slaAchievedPercent: 100.0,
      totalJobsMonth: 0,
      successJobsMonth: 0,
      failedJobsMonth: 0,
      status: 'ACTIVE',
      billingCycle: tenantData.billingCycle || 'Aylık',
      createdDate: new Date().toISOString().split('T')[0]
    };

    data.mspTenants.push(newTenant);
    db.write(data);
    db.addLog("success", "MSP", `Yeni MSP kiracısı oluşturuldu: ${newTenant.name}`);
    return newTenant;
  }

  deleteTenant(id) {
    const data = db.read();
    data.mspTenants = (data.mspTenants || []).filter(t => t.id !== id);
    db.write(data);
    return { success: true };
  }
}

module.exports = new MspEngine();
