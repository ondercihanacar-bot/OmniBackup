import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, CheckCircle2, AlertTriangle, Shield, 
  Terminal, RefreshCw, Trash2, ArrowRight, Play, Database, Server
} from 'lucide-react';
import { api } from '../api';

export default function AiAssistantView({ onOpenHelp }) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('session-default');
  const [quickPrompts, setQuickPrompts] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
    loadQuickPrompts();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, loading]);

  const loadSessions = async () => {
    try {
      const data = await api.getAiSessions();
      setSessions(data || []);
      if (data && data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadQuickPrompts = async () => {
    try {
      const data = await api.getAiQuickPrompts();
      setQuickPrompts(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || loading) return;

    setInputPrompt('');
    setLoading(true);

    try {
      const res = await api.askAiAssistant({
        sessionId: activeSessionId,
        prompt: query
      });
      if (res.success) {
        await loadSessions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = (actionText) => {
    setActionNotice(`OmniAI Görevi Başlatıldı: "${actionText}". İlgili VSS/Air-Gap sandbox tetiklendi.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || { messages: [] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-wide">OmniAI Felaket Kurtarma Asistanı</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                NLP Engine Active
              </span>
            </div>
            <p className="text-sm text-slate-400">Doğal dil komutlarıyla akıllı geri yükleme analizi, RPO/RTO hesaplama ve felaket tatbikatları</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHelp && (
            <button
              onClick={() => onOpenHelp('aiAssistant')}
              className="px-3 py-2 text-xs font-medium text-cyan-400 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800/60 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Sekme Kılavuzu
            </button>
          )}
          <button
            onClick={() => api.clearAiSession(activeSessionId).then(loadSessions)}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-950/30 border border-slate-700/60 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Sohbeti Sıfırla
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{actionNotice}</span>
          </div>
        </div>
      )}

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Quick Prompts & Suggestions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Hızlı İstek Şablonları
            </h3>
            <div className="space-y-2">
              {quickPrompts.map(qp => (
                <button
                  key={qp.id}
                  onClick={() => handleSend(qp.prompt)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs transition-all group cursor-pointer"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-300 mb-1 flex items-center justify-between">
                    <span>{qp.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">{qp.prompt}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              AI Güvenlik Doğrulaması
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              OmniAI komutları doğrudan çalıştırmadan önce Four-Eyes onay protokolünü ve WORM kilitlerini denetler. Yıkıcı işlemler sandbox ortamında simüle edilir.
            </p>
          </div>
        </div>

        {/* Right Side: Chat Feed */}
        <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col h-[600px] overflow-hidden">
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {activeSession.messages?.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                }`}>
                  <div className="font-sans whitespace-pre-wrap">{msg.text}</div>

                  {/* Execution Plan Card if Assistant returned one */}
                  {msg.executionPlan && (
                    <div className="mt-3 pt-3 border-t border-slate-800 bg-slate-900/80 rounded-xl p-3 text-[11px] space-y-1.5">
                      <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        Kurtarma / Analiz Planı
                      </div>
                      {Object.entries(msg.executionPlan).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-slate-300">
                          <span className="text-slate-400 capitalize">{k}:</span>
                          <span className="font-mono text-cyan-300 font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Actions Buttons */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleExecuteAction(act)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                        >
                          <Play className="w-2.5 h-2.5 text-cyan-400" />
                          {act}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[9px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-cyan-200' : 'text-slate-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('tr-TR')}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-xs text-cyan-400">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center animate-pulse">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  OmniAI yedek depolarını ve snapshot kataloglarını analiz ediyor...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-[#090d16]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                placeholder="OmniAI'ya doğal dilde komut verin (Örn: 'SQL sunucusunu 1 saat önceki haline test ortamında geri yükle')..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                disabled={loading || !inputPrompt.trim()}
                className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-900/40"
              >
                <Send className="w-4 h-4" />
                <span>Gönder</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
