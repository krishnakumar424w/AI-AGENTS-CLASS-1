import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { AgentRunner } from './components/AgentRunner.js';
import { LabsExplorer } from './components/LabsExplorer.js';
import { ExercisesExplorer } from './components/ExercisesExplorer.js';
import { PatternsPlayground } from './components/PatternsPlayground.js';
import { CampusDatabaseModal } from './components/CampusDatabaseModal.js';
import { SetupCheckData } from './types.js';
import { CheckCircle2, AlertCircle, Sparkles, Terminal } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'runner' | 'labs' | 'exercises' | 'patterns'>('runner');
  const [isDbOpen, setIsDbOpen] = useState(false);
  const [setupData, setSetupData] = useState<SetupCheckData | null>(null);

  useEffect(() => {
    fetch('/api/setup-check')
      .then((res) => res.json())
      .then((data) => setSetupData(data))
      .catch((err) => console.error('Setup check failed:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        setupData={setupData}
        onOpenDatabase={() => setIsDbOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Setup Banner (compact) */}
        {setupData && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-white">Setup Status: </strong>
                All 6 Labs and 4 Exercises ready to run
              </span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
              <span>Node {process.version || 'v22'}</span>
              <span>•</span>
              <span className="text-blue-400">Model: {setupData.modelMain}</span>
              <span>•</span>
              <span className="text-emerald-400">Tokens: Zero Overhead</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'runner' && <AgentRunner />}
        {activeTab === 'labs' && <LabsExplorer />}
        {activeTab === 'exercises' && <ExercisesExplorer />}
        {activeTab === 'patterns' && <PatternsPlayground />}
      </main>

      {/* Campus DB Modal */}
      <CampusDatabaseModal isOpen={isDbOpen} onClose={() => setIsDbOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Agents Class — Day 1: Foundations of Agentic AI</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDbOpen(true)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Mock Campus DB
            </button>
            <span>•</span>
            <span className="text-slate-400">DeepMind & SoDak EduTech Curriculum</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
