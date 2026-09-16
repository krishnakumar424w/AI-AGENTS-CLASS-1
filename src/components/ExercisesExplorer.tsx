import React, { useState } from 'react';
import { Code, Play, CheckCircle2, AlertTriangle, Terminal, Sparkles } from 'lucide-react';

interface ExerciseMeta {
  id: string;
  number: number;
  title: string;
  time: string;
  task: string;
  checkpoint: string;
  defaultInput?: string;
  inputLabel?: string;
}

const EXERCISES_LIST: ExerciseMeta[] = [
  {
    id: 'ex1',
    number: 1,
    title: 'Side-Effect Tool Control via Docstrings',
    time: '20 min',
    task: 'Write a tool with a side-effect (e.g. sending fee notices) and a docstring that guides WHEN the agent calls it. It must fire for "Inform Priya about her fee" but NEVER for "What is Priya\'s fee balance?".',
    checkpoint: 'Docstring phrasing dictates action without changing underlying Python/TypeScript code.',
    defaultInput: 'Inform Priya about her fee balance.',
    inputLabel: 'Test Goal / Prompt',
  },
  {
    id: 'ex2',
    number: 2,
    title: 'Session Memory Helper (load / run / save)',
    time: '20 min',
    task: 'Implement the chat(thread_id, message) helper that loads thread history, calls agent.run(), and saves updated history without leaking state between threads.',
    checkpoint: 'Agent remains purely stateless while history accumulates in ConversationStore.',
  },
  {
    id: 'ex3',
    number: 3,
    title: 'Circuit Breaker Verification',
    time: '15 min',
    task: 'Write a tool that always throws an error. Prove that after exactly 3 consecutive failures, ToolRegistry disables the tool with ToolDisabled error rather than looping infinitely.',
    checkpoint: 'Failure count increments to 3, then 4th dispatch returns error: "ToolDisabled".',
  },
  {
    id: 'ex4',
    number: 4,
    title: 'Evaluator-Optimizer on Custom Task',
    time: '25 min',
    task: 'Apply the Evaluator-Optimizer loop to a custom real-world task against strict measurable criteria (word count, specific phrasing, tone).',
    checkpoint: 'Evaluator provides exact quotes in evidence list and structured fix instructions.',
    defaultInput: 'Draft a 1-paragraph summary of how circuit breakers prevent LLM agent infinite loops.',
    inputLabel: 'Task Goal for Evaluator-Optimizer',
  },
];

export const ExercisesExplorer: React.FC = () => {
  const [selectedEx, setSelectedEx] = useState<ExerciseMeta>(EXERCISES_LIST[0]);
  const [customInput, setCustomInput] = useState(selectedEx.defaultInput || '');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string[] | null>(null);

  const handleSelect = (ex: ExerciseMeta) => {
    setSelectedEx(ex);
    setCustomInput(ex.defaultInput || '');
    setOutput(null);
  };

  const handleRun = async () => {
    try {
      setLoading(true);
      setOutput(null);
      const res = await fetch('/api/exercises/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: selectedEx.id,
          customInput,
        }),
      });
      const data = await res.json();
      setOutput(data.logs || []);
    } catch (err) {
      console.error('Failed to run exercise:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Exercise Selection List */}
      <div className="lg:col-span-4 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Student Exercises (Write & Verify)
        </div>
        <div className="space-y-2">
          {EXERCISES_LIST.map((ex) => {
            const isSelected = selectedEx.id === ex.id;
            return (
              <button
                key={ex.id}
                id={`btn-select-exercise-${ex.number}`}
                onClick={() => handleSelect(ex)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Exercise {ex.number}
                  </span>
                  <span className="text-[11px] text-slate-500">{ex.time}</span>
                </div>
                <div className="text-sm font-semibold text-white mt-1">{ex.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Exercise #{selectedEx.number}
                </span>
                <span className="text-xs text-slate-500">Estimated: {selectedEx.time}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{selectedEx.title}</h2>
            </div>
            <button
              id="btn-run-exercise"
              onClick={handleRun}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Running Check...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Verify Exercise {selectedEx.number}</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Exercise Goal & Objective
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">{selectedEx.task}</p>
          </div>

          {selectedEx.inputLabel && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                {selectedEx.inputLabel}
              </label>
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>
          )}

          {/* Checkpoint Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300">Checkpoint Verification: </span>
              {selectedEx.checkpoint}
            </div>
          </div>
        </div>

        {/* Console / Verification Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Execution Logs & Test Assertion Output
            </h3>
          </div>

          <div className="min-h-[220px] max-h-[400px] overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed space-y-1">
            {loading ? (
              <div className="h-36 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p>Running verification suite...</p>
              </div>
            ) : output ? (
              output.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.startsWith('===')
                      ? 'text-blue-400 font-semibold pt-1'
                      : line.includes('Check passed')
                      ? 'text-emerald-400 font-semibold'
                      : line.includes('Failure count')
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }
                >
                  {line}
                </div>
              ))
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-slate-600 space-y-1">
                <p>Click "Verify Exercise {selectedEx.number}" to run tests against the implementation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
