import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, X, CheckCircle2, Shield, Info, Sparkles, 
  ArrowRight, Search, BookOpen, Layers, Zap
} from 'lucide-react';
import { TAB_HELP_GUIDE } from '../helpGuide';

export default function HelpModal({ isOpen, onClose, activeTab, onNavigateTab }) {
  const [selectedKey, setSelectedKey] = useState(activeTab || 'dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeTab && TAB_HELP_GUIDE[activeTab]) {
      setSelectedKey(activeTab);
    }
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  const tabKeys = Object.keys(TAB_HELP_GUIDE);
  const filteredKeys = tabKeys.filter(key => {
    const guide = TAB_HELP_GUIDE[key];
    const matchSearch = (guide.title + guide.subtitle + guide.description).toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const currentGuide = TAB_HELP_GUIDE[selectedKey] || TAB_HELP_GUIDE.dashboard;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0c1322] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0f172a]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">OmniBackup Modül & Yardım Kılavuzu</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  v2.5 Kurumsal Rehber
                </span>
              </div>
              <p className="text-xs text-slate-400">Tüm sekmeler, kurumsal kullanım senaryoları ve en iyi uygulama yöntemleri</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: List of Tabs with search */}
          <div className="w-80 border-r border-slate-800 bg-[#090d16] flex flex-col">
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Sekme veya özellik ara..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredKeys.map(key => {
                const guide = TAB_HELP_GUIDE[key];
                const isSelected = selectedKey === key;
                const isCurrentActive = activeTab === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                        : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold truncate">{guide.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{guide.subtitle}</div>
                    </div>
                    {isCurrentActive && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-cyan-500 text-slate-950 whitespace-nowrap">
                        Açık
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content: Detailed Guide for Selected Tab */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#0c1322] to-[#080d17] custom-scrollbar">
            
            {/* Header info */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sekme Detay Rehberi
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{currentGuide.title}</h3>
                  <p className="text-sm text-cyan-300/80 font-medium">{currentGuide.subtitle}</p>
                </div>

                {onNavigateTab && (
                  <button
                    onClick={() => {
                      onNavigateTab(selectedKey);
                      onClose();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Bu Sekmeye Git
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 text-sm text-slate-300 leading-relaxed">
                {currentGuide.description}
              </div>
            </div>

            {/* Enterprise Use-Case */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Kurumsal Kullanım Senaryosu (Enterprise Use-Case)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentGuide.useCase}
              </p>
            </div>

            {/* Key Features Grid */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-cyan-400" />
                Önemli Teknik Yetenekler & Özellikler
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentGuide.keyFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Practice Tip */}
            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-cyan-300 block mb-0.5">Uzman Tavsiyesi (Best Practice):</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentGuide.tips}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#090d16] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            OmniBackup Enterprise Kılavuz Sistemi Aktif
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
