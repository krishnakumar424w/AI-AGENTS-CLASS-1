import React, { useState } from 'react';
import { Layers, Play, CheckCircle2, AlertCircle, Sparkles, RefreshCw, GitFork, UserCheck } from 'lucide-react';

export const PatternsPlayground: React.FC = () => {
  const [activePattern, setActivePattern] = useState<'evaluator' | 'orchestrator'>('evaluator');

  // Evaluator-Optimizer State
  const [evalTask, setEvalTask] = useState(
    'Write an announcement inviting final-year students to a 9-day Agentic AI training track run by SoDak EduTech.'
  );
  const [criteria, setCriteria] = useState([
    'Under 90 words.',
    'Names at least one specific, concrete benefit to the student.',
    'Contains no exclamation marks and no marketing superlatives.',
    'Ends with a clear single call to action.',
  ]);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);

  // Orchestrator-Worker State
  const [orchGoal, setOrchGoal] = useState(
    'Prepare a final-year engineering student in Chennai for placement interviews in agentic AI engineering roles.'
  );
  const [orchLoading, setOrchLoading] = useState(false);
  const [orchResult, setOrchResult] = useState<any>(null);

  const handleRunEvaluator = async () => {
    try {
      setEvalLoading(true);
      const res = await fetch('/api/patterns/evaluator-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: evalTask,
          criteria,
          maxRounds: 3,
        }),
      });
      const data = await res.json();
      setEvalResult(data);
    } catch (err) {
      console.error('Failed to run evaluator-optimizer:', err);
    } finally {
      setEvalLoading(false);
    }
  };

  const handleRunOrchestrator = async () => {
    try {
      setOrchLoading(true);
      const res = await fetch('/api/patterns/orchestrator-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: orchGoal }),
      });
      const data = await res.json();
      setOrchResult(data);
    } catch (err) {
      console.error('Failed to run orchestrator-worker:', err);
    } finally {
      setOrchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pattern Selector Tabs */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center space-x-2">
          <button
            id="tab-evaluator-optimizer"
            onClick={() => setActivePattern('evaluator')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activePattern === 'evaluator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>1. Evaluator-Optimizer</span>
          </button>
          <button
            id="tab-orchestrator-worker"
            onClick={() => setActivePattern('orchestrator')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activePattern === 'orchestrator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>2. Orchestrator-Worker</span>
          </button>
        </div>
        <div className="hidden sm:block text-xs text-slate-500 px-3">
          Architectural Patterns from Anthropic & DeepMind Research
        </div>
      </div>

      {activePattern === 'evaluator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Config & Criteria Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                Generate → Critique → Revise Loop
              </h3>
              <p className="text-xs text-slate-400">
                A Generator produces drafts while an independent Evaluator critiques against measurable rules until all criteria pass.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Generation Task
                </label>
                <textarea
                  rows={3}
                  value={evalTask}
                  onChange={(e) => setEvalTask(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Measurable Pass Criteria
                </label>
                <div className="space-y-1.5">
                  {criteria.map((c, i) => (
                    <div
                      key={i}
                      className="text-xs p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between"
                    >
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                id="btn-run-eval-optimizer"
                onClick={handleRunEvaluator}
                disabled={evalLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                {evalLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating Rounds...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Evaluator Loop</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-4">
            {evalResult ? (
              <div className="space-y-4">
                {/* Final Draft */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Final Approved Output
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        evalResult.passed
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {evalResult.passed ? `Passed in Round ${evalResult.rounds}` : 'Max Rounds Reached'}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 leading-relaxed">
                    {evalResult.output}
                  </div>
                </div>

                {/* Round History */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Critique Rounds & Iterations ({evalResult.history.length})
                  </h4>
                  <div className="space-y-3">
                    {evalResult.history.map((h: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl border text-xs ${
                          h.passed
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-amber-950/20 border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-white">Round {h.round}</span>
                          <span
                            className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                              h.passed
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {h.passed ? 'PASSED CRITERIA' : 'FAILED - REQUIRED FIX'}
                          </span>
                        </div>
                        {h.failed_criteria && h.failed_criteria.length > 0 && (
                          <div className="mt-1 space-y-1 text-slate-300">
                            <div>
                              <strong className="text-amber-400">Issues:</strong>{' '}
                              {h.failed_criteria.join(', ')}
                            </div>
                            {h.fix && (
                              <div>
                                <strong className="text-blue-400">Fix instruction:</strong> {h.fix}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500 text-center space-y-2">
                <RefreshCw className="w-8 h-8 opacity-40" />
                <p className="text-xs">
                  Click "Run Evaluator Loop" to witness multi-round self-correction against the 4 criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Orchestrator-Worker View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <GitFork className="w-4 h-4 text-purple-400" />
                Dynamic Task Decomposition & Synthesis
              </h3>
              <p className="text-xs text-slate-400">
                A Planner decomposes the high-level goal at runtime into specialized worker roles, delegates sub-tasks, and synthesizes results.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Complex Multi-Facet Goal
                </label>
                <textarea
                  rows={3}
                  value={orchGoal}
                  onChange={(e) => setOrchGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                id="btn-run-orchestrator"
                onClick={handleRunOrchestrator}
                disabled={orchLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                {orchLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Planning & Executing Workers...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Orchestrator-Worker</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {orchResult ? (
              <div className="space-y-4">
                {/* Synthesized Output */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Synthesized Final Output
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {orchResult.total_tokens} total tokens
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                    {orchResult.output}
                  </div>
                </div>

                {/* Planned Worker Findings */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Specialist Worker Findings ({orchResult.findings?.length || 0})
                  </h4>
                  <div className="space-y-2.5">
                    {orchResult.findings?.map((f: any, i: number) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-purple-300">
                            Worker #{f.index}: {f.role}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {f.tokens} tok
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] italic">Task: {f.instruction}</p>
                        <p className="text-slate-200 mt-1">{f.finding}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500 text-center space-y-2">
                <GitFork className="w-8 h-8 opacity-40" />
                <p className="text-xs">
                  Click "Run Orchestrator-Worker" to trigger runtime task decomposition across specialist agents.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
