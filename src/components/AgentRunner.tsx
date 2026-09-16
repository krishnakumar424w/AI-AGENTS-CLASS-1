import React, { useState } from 'react';
import { Play, RotateCcw, Zap, Terminal, Clock, CheckCircle2, XCircle, Cpu, ShieldAlert, Sparkles, Copy, Check } from 'lucide-react';
import { RunResult } from '../types.js';

export const AgentRunner: React.FC = () => {
  const [goal, setGoal] = useState('What is the fee balance for 21CS045?');
  const [temperature, setTemperature] = useState(0.3);
  const [maxIterations, setMaxIterations] = useState(8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'ascii'>('visual');
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    {
      title: 'Fee Lookup',
      prompt: 'What is the fee balance for 21CS045?',
      tag: 'Single Tool',
    },
    {
      title: 'Multi-Tool Query',
      prompt: "Which students are below 75% attendance, and what is Priya's fee balance?",
      tag: 'Multi-Step',
    },
    {
      title: 'Side-Effect Reminder',
      prompt: 'Remind me in 3 days to follow up with the students who have attendance shortfall.',
      tag: 'State Mutation',
    },
    {
      title: 'Self-Healing Test',
      prompt: "What is the fee balance for roll number 'twenty one CS zero four five'?",
      tag: 'Error Recovery',
    },
  ];

  const handleRun = async (promptToRun?: string) => {
    const targetGoal = promptToRun || goal;
    if (!targetGoal.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: targetGoal,
          temperature,
          maxIterations,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to run agent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAscii = () => {
    if (!result?.trace.rendered_text) return;
    navigator.clipboard.writeText(result.trace.rendered_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/40 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            Interactive Agent Loop & RunTrace Inspector
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Execute the complete agent cycle: Model call → Tool call detection → Tool dispatching → Observation append → Next turn → Final answer. Inspect live step timings, token counts, and self-healing.
          </p>
        </div>

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              id={`btn-sample-prompt-${idx}`}
              onClick={() => {
                setGoal(sp.prompt);
                handleRun(sp.prompt);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span className="text-blue-400 font-medium">{sp.title}</span>
              <span className="text-[10px] text-slate-500 px-1 py-0.2 rounded bg-slate-900 border border-slate-800">
                {sp.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Execution Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Agent Goal / Natural Language Prompt
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="input-agent-goal"
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. What is the fee balance for 21CS045?"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRun();
              }}
            />
            <button
              id="btn-run-agent"
              onClick={() => handleRun()}
              disabled={loading || !goal.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Agent Loop</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loop Controls */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span>Temperature:</span>
              <span className="font-mono text-white">{temperature}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-20 accent-blue-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>Max Iterations:</span>
              <span className="font-mono text-white">{maxIterations}</span>
              <input
                type="range"
                min="2"
                max="12"
                step="1"
                value={maxIterations}
                onChange={(e) => setMaxIterations(parseInt(e.target.value, 10))}
                className="w-20 accent-blue-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Circuit Breaker Active (Max 3 consecutive tool failures)</span>
          </div>
        </div>
      </div>

      {/* Execution Results */}
      {result && (
        <div className="space-y-6">
          {/* Agent Answer Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Agent Final Answer
                </h3>
              </div>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                  result.ok
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {result.trace.outcome === 'completed' ? 'Completed Successfully' : 'Escalated'}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 leading-relaxed font-sans">
              {result.output}
            </div>
          </div>

          {/* RunTrace Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Total Steps</div>
              <div className="text-xl font-bold text-white font-mono mt-1">
                {result.trace.steps.length}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Model & tool turns</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Tokens Used</div>
              <div className="text-xl font-bold text-blue-400 font-mono mt-1">
                {result.trace.total_tokens.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {result.trace.prompt_tokens} in / {result.trace.completion_tokens} out
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Elapsed Time</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                {result.trace.duration_s.toFixed(2)}s
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">End-to-end latency</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Estimated Cost</div>
              <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                {result.trace.cost_inr > 0 ? `₹${result.trace.cost_inr.toFixed(3)}` : 'Free Tier'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Google Gemini tier</div>
            </div>
          </div>

          {/* Trace Steps Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Execution Trace Steps ({result.trace.steps.length})
                </h3>
              </div>
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setViewMode('visual')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    viewMode === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Step Cards
                </button>
                <button
                  onClick={() => setViewMode('ascii')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    viewMode === 'ascii' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Terminal ASCII
                </button>
              </div>
            </div>

            {viewMode === 'visual' ? (
              <div className="space-y-2.5">
                {result.trace.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      step.kind === 'model'
                        ? 'bg-slate-950/70 border-blue-500/20'
                        : step.ok
                        ? 'bg-slate-950/70 border-emerald-500/20'
                        : 'bg-red-950/20 border-red-500/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-mono text-xs text-slate-300">
                          #{step.index}
                        </span>
                        {step.ok ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${
                            step.kind === 'model'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}
                        >
                          {step.kind.toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-white font-mono">
                          {step.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                        {step.kind === 'model' && (
                          <span className="text-blue-300">
                            {step.prompt_tokens + step.completion_tokens} tokens
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {step.duration_s.toFixed(2)}s
                        </span>
                      </div>
                    </div>

                    {step.detail && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 font-mono text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg overflow-x-auto">
                        {step.detail}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed selection:bg-emerald-900/50">
                  {result.trace.rendered_text}
                </pre>
                <button
                  onClick={handleCopyAscii}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Copy ASCII Trace"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
