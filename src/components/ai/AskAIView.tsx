import React, { useState, useRef, useEffect } from 'react';
import { useCrisisStore } from '../../store/useCrisisStore';
import {
  Send,
  Sparkles,
  Users,
  Droplets,
  BrainCircuit,
  Bot,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Mic,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const AskAIView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    isAIThinking,
    triggerRoadClosureSimulation,
    setActiveTab,
    openExplainWhyModal,
  } = useCrisisStore();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Why are we evacuating Zone C first?',
    "What's the safest route?",
    'Show hospital status',
    'What happens in 2 hours?',
    'Simulate Broadway closure',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAIThinking]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isAIThinking) return;
    sendChatMessage(query.trim());
    setInputQuery('');
  };

  return (
    <div className="w-full flex-1 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-64px)] p-4 md:p-6 pb-28 md:pb-6 font-sans select-none text-slate-200">
      {/* AI Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-xs">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-headline text-base md:text-lg font-bold text-white flex items-center gap-2">
              NIRNAY Decision Intelligence
              <span className="w-2 h-2 rounded-full bg-[#00ff99] animate-pulse"></span>
            </h2>
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              Server-Side Gemini 3.7 Flash Engine
            </span>
          </div>
        </div>

        <button
          onClick={() => openExplainWhyModal()}
          className="text-xs font-mono font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded cursor-pointer transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#00ff99]" />
          <span>Explain Logic</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'USER';

          if (isUser) {
            return (
              <div key={msg.id} className="flex justify-end items-start gap-2.5 animate-in fade-in">
                <div className="bg-blue-600 text-white p-3.5 rounded-lg rounded-tr-none max-w-md shadow-lg border border-blue-400/30">
                  <p className="text-xs md:text-sm font-medium">{msg.text}</p>
                  <span className="text-[9px] font-mono text-blue-200 mt-1 block text-right">{msg.timestamp}</span>
                </div>
                <div className="w-7 h-7 rounded bg-white/10 overflow-hidden shrink-0 border border-white/20 flex items-center justify-center font-mono text-[10px] font-bold text-white">
                  CMD
                </div>
              </div>
            );
          }

          // Nirnay AI Response
          return (
            <div key={msg.id} className="flex flex-col gap-3 items-start animate-in fade-in max-w-2xl">
              {/* Text Bubble */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#00ff99]" />
                </div>
                <div className="bg-[#0a0a0c]/90 text-slate-200 p-4 rounded-lg rounded-tl-none shadow-xl border border-white/10">
                  <p
                    className="text-xs md:text-sm leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#00ff99] font-mono">$1</strong>'),
                    }}
                  />
                  <span className="text-[9px] font-mono text-white/40 mt-2 block">{msg.timestamp} • NIRNAY AI</span>
                </div>
              </div>

              {/* Insight Card if attached */}
              {msg.insightCard && (
                <div className="ml-9 w-full max-w-lg bg-[#0a0a0c]/95 rounded-lg p-4 shadow-2xl border border-white/10 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                    <h3 className="font-headline text-sm font-bold text-white">
                      {msg.insightCard.recommendedZone || 'Zone C'}
                    </h3>
                    <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {msg.insightCard.priorityBadge || 'Critical Priority Area'}
                    </span>
                  </div>

                  {/* Dual Metrics */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-white/5 p-2.5 rounded border border-white/10 flex items-center gap-2.5">
                      <div className="p-1.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[9px] font-mono font-bold text-white/40 uppercase">Est. Population</div>
                        <div className="font-mono text-sm font-bold text-white">
                          {msg.insightCard.estPopulation.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 p-2.5 rounded border border-white/10 flex items-center gap-2.5">
                      <div className="p-1.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[9px] font-mono font-bold text-white/40 uppercase">
                          {msg.insightCard.secondaryMetricLabel || 'Water Rise Rate'}
                        </div>
                        <div className="font-mono text-sm font-bold text-yellow-400">
                          {msg.insightCard.secondaryMetricValue || msg.insightCard.waterRiseRate}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Button */}
                  <button
                    onClick={() => {
                      if (msg.insightCard?.title?.toLowerCase().includes('broadway')) {
                        triggerRoadClosureSimulation('road-broadway');
                      } else {
                        setActiveTab('map');
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white min-h-[38px] rounded font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  >
                    <span>Inspect Corridor on Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Follow up pills */}
              {msg.suggestedFollowUps && (
                <div className="ml-9 flex flex-wrap gap-1.5 pt-0.5">
                  {msg.suggestedFollowUps.map((fu, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(fu)}
                      className="text-[11px] font-mono bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 px-2.5 py-1 rounded transition-colors cursor-pointer"
                    >
                      {fu}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isAIThinking && (
          <div className="flex items-center gap-2.5 text-xs font-mono text-white/50 ml-2 animate-pulse">
            <div className="w-6 h-6 rounded bg-blue-600/30 text-blue-400 flex items-center justify-center">
              <Loader2 className="w-3 h-3 animate-spin text-[#00ff99]" />
            </div>
            <span>NIRNAY synthesizing crisis spatial graph and hydrological models...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Pills (Horizontally Scrollable) */}
      <div className="pt-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="text-[11px] font-mono font-medium text-blue-400 hover:text-blue-300 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded whitespace-nowrap transition-colors shrink-0 cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="bg-[#0a0a0c]/90 rounded-lg p-1 pl-3.5 flex items-center gap-2 border border-white/10 shadow-2xl focus-within:border-blue-500/50"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about crisis response, routes, or dispatch..."
            className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-white placeholder:text-white/30 font-sans"
          />

          <button
            type="button"
            onClick={() => handleSend("What's the safest route right now?")}
            className="h-8 w-8 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Voice query simulation"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isAIThinking}
            className={`h-8 px-3 rounded flex items-center justify-center gap-1.5 transition-all text-xs font-mono font-bold uppercase tracking-wider ${
              inputQuery.trim() && !isAIThinking
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] hover:bg-blue-500 cursor-pointer active:scale-95'
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
            }`}
          >
            <span>Transmit</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};
