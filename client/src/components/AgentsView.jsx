import React, { useState } from 'react';
import { 
  Server, 
  Plus, 
  Trash2, 
  Activity, 
  Cpu, 
  HardDrive, 
  Laptop, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  Settings,
  ShieldCheck,
  Terminal
} from 'lucide-react';

export default function AgentsView({ 
  agents = [], 
  jobs = [], 
  history = [], 
  onRunJob, 
  onOpenRestoreModal, 
  onDeleteAgent, 
  onOpenDeployAgent 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredAgents = agents.filter(agent => 
    agent.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.ipAddress.includes(searchTerm) ||
    agent.os.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAgentBackup = (agent) => {
    // Find job assigned to this agent, or matching hostname, or fallback to first job
    const targetJob = jobs.find(j => j.agentId === agent.id || j.name.toLowerCase().includes(agent.hostname.toLowerCase())) || jobs[0];
    if (targetJob && onRunJob) {
      onRunJob(targetJob.id);
    } else {
      alert(`${agent.hostname} için atanmış bir koruma planı bulunamadı. Lütfen yeni bir plan oluşturun.`);
    }
  };

  const handleAgentRecover = (agent) => {
    // Find latest restore point for this machine
    const targetRestore = history.find(h => h.agentName === agent.hostname || (h.jobName && h.jobName.toLowerCase().includes(agent.hostname.toLowerCase()))) || history[0];
    if (targetRestore && onOpenRestoreModal) {
      onOpenRestoreModal(targetRestore);
    } else {
      alert(`${agent.hostname} cihazı için henüz bir geri yükleme noktası oluşturulmamış. Lütfen önce "BACK UP NOW" ile yedek alınız.`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar (Acronis Image 2: All machines + ADD button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">
            All machines (Devices)
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
            {agents.length} Cihaz
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDeployAgent}
            className="btn-acronis-primary px-4 py-2 flex items-center gap-2 text-xs shadow-xs uppercase font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD (YENİ AJAN EKLE)</span>
          </button>
        </div>
      </div>

      {/* Search & Sub-Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Hostname, IP veya işletim sistemi ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0070e0]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'all' ? 'bg-[#0070e0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tüm Cihazlar ({agents.length})
          </button>
          <button
            onClick={() => setFilterType('online')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'online' ? 'bg-[#0070e0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Çevrimiçi (Online)
          </button>
        </div>
      </div>

      {/* Machines Cards List (Exact Replica of Acronis Image 2) */}
      <div className="space-y-4">
        {filteredAgents.map((agent) => {
          const isOnline = agent.status === 'online';
          const isVM = agent.hostname.toLowerCase().includes('vm') || agent.hostname.toLowerCase().includes('azure') || agent.os.toLowerCase().includes('linux');

          return (
            <div 
              key={agent.id} 
              className="acronis-card p-5 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition hover:border-[#0070e0]/40"
            >
              {/* Left Column: Device Monitor Graphic + Hostname */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-14 rounded-lg bg-sky-500/90 border border-sky-600 flex items-center justify-center text-white shadow-xs shrink-0">
                  <span className="font-extrabold text-sm tracking-wider">
                    {isVM ? 'VM' : 'PC'}
                  </span>
                  <div className="absolute -bottom-1.5 w-6 h-1.5 bg-slate-400 rounded-b" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800 tracking-tight">
                      {agent.hostname}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-slate-100 text-slate-600 border border-slate-200">
                      {agent.ipAddress}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {agent.os} • {agent.totalMemory || '16 GB RAM'} • VSS Agent v2.5
                  </p>
                </div>
              </div>

              {/* Center Column: Status, Last Backup, Next Backup (from Image 2) */}
              <div className="grid grid-cols-3 gap-6 text-xs text-slate-600 font-medium">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Status</span>
                  {isOnline ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OK
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      ⊘ Not protected
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Last backup</span>
                  <span className="text-slate-700 font-medium font-mono text-[11px]">
                    {agent.lastBackupAt ? new Date(agent.lastBackupAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Bugün 02:23'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">Next backup</span>
                  <span className="text-slate-700 font-medium font-mono text-[11px]">
                    Bugün 23:00
                  </span>
                </div>
              </div>

              {/* Right Column: Acronis Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAgentBackup(agent)}
                  className="btn-acronis-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-xs uppercase font-bold transition hover:scale-102"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>BACK UP NOW</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAgentRecover(agent)}
                  className="btn-acronis-outline px-4 py-2 text-xs flex items-center gap-1.5 uppercase font-bold transition hover:scale-102"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>RECOVER</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteAgent(agent.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Ajanı Kaldır"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
