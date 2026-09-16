import React from 'react';
import { Bot, Sparkles, Database, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SetupCheckData } from '../types.js';

interface HeaderProps {
  setupData: SetupCheckData | null;
  onOpenDatabase: () => void;
  activeTab: 'runner' | 'labs' | 'exercises' | 'patterns';
  setActiveTab: (tab: 'runner' | 'labs' | 'exercises' | 'patterns') => void;
}

export const Header: React.FC<HeaderProps> = ({
  setupData,
  onOpenDatabase,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">AI Agents Class</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                Day 1 Foundations
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Agent Loop · Tool Schemas · Self-Healing · Session Memory · Patterns
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/70 text-xs font-medium">
            <button
              id="tab-runner"
              onClick={() => setActiveTab('runner')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'runner'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Agent Runner
            </button>
            <button
              id="tab-labs"
              onClick={() => setActiveTab('labs')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'labs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Labs (1-6)
            </button>
            <button
              id="tab-exercises"
              onClick={() => setActiveTab('exercises')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'exercises'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Exercises
            </button>
            <button
              id="tab-patterns"
              onClick={() => setActiveTab('patterns')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'patterns'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Patterns
            </button>
          </div>

          {/* Campus Database Button */}
          <button
            id="btn-open-db"
            onClick={onOpenDatabase}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Campus Data</span>
          </button>

          {/* Provider Status Indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">Gemini 2.5 Flash</span>
            <span className="text-slate-500 font-mono text-[10px]">free tier</span>
          </div>
        </div>
      </div>
    </header>
  );
};
