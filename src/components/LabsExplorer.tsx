import React, { useState } from 'react';
import { BookOpen, Play, CheckCircle, Terminal, HelpCircle, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface LabMeta {
  id: string;
  number: number;
  title: string;
  time: string;
  summary: string;
  highlight?: boolean;
  lookFor: string[];
}

const LABS_LIST: LabMeta[] = [
  {
    id: 'lab1',
    number: 1,
    title: 'Your First Model Call',
    time: '15 min',
    summary: 'Statelessness, roles, and token counts. Proves that models remember nothing without re-sending full history.',
    lookFor: [
      'The prompt-token difference between the call with and without history.',
      'That models have zero intrinsic memory between separate requests.',
    ],
  },
  {
    id: 'lab2',
    number: 2,
    title: 'Tools & The Four Dispatch Outcomes',
    time: '25 min',
    summary: 'Auto-generated JSON schemas and testing the 4 failure modes: success, tool exception, bad arguments, unknown tool.',
    lookFor: [
      'JSON schemas generated from function type hints without manually typing JSON.',
      'Dispatch NEVER raises — every failure becomes a structured result for the model.',
    ],
  },
  {
    id: 'lab3',
    number: 3,
    title: 'Your First Full Agent Loop',
    time: '30 min',
    summary: 'A complete autonomous loop: model, tool calls, tool execution, feedback, final answer.',
    lookFor: [
      'How many model calls happened — it dynamically terminates when no more tools are requested.',
      'Whether it called list_students_below_attendance or 3 separate calls.',
      'Did it invent a compare tool? The model compares numbers natively.',
    ],
  },
  {
    id: 'lab4',
    number: 4,
    title: 'Self-Healing Error Recovery',
    time: '25 min',
    highlight: true,
    summary: 'Highlight of Day 1: The agent receives a broken input ("twenty one CS zero four five"), encounters an error, reads its own traceback, and corrects itself!',
    lookFor: [
      'Failed tool step followed immediately by a self-corrected call with roll number 21CS045.',
      'The error names valid options ("Known roll numbers: ...") so the model has something to correct towards.',
      'Circuit breaker cap prevents infinite loops.',
    ],
  },
  {
    id: 'lab5',
    number: 5,
    title: 'Session Memory & Thread Isolation',
    time: '25 min',
    summary: 'Session storage and thread isolation. Thread A resolves "her", while Thread B has isolated clean state. Also demonstrates pair-safe trimming.',
    lookFor: [
      'Thread A resolves "her" attendance; Thread B cannot because history is isolated.',
      'Pair-safe trimming: first message after system is never an orphaned tool message.',
    ],
  },
  {
    id: 'lab6',
    number: 6,
    title: 'Agent Design Patterns',
    time: '40 min',
    summary: 'Evaluator-Optimizer (generate -> critique -> revise) and Orchestrator-Worker (runtime task decomposition and synthesis).',
    lookFor: [
      'Worker roles are planned at runtime, not hardcoded in source.',
      'Evaluator provides structured critique with specific quotes and fixes.',
    ],
  },
];

export const LabsExplorer: React.FC = () => {
  const [selectedLab, setSelectedLab] = useState<LabMeta>(LABS_LIST[0]);
  const [loading, setLoading] = useState(false);
  const [labOutput, setLabOutput] = useState<string[] | null>(null);

  const handleRunLab = async (lab: LabMeta) => {
    try {
      setLoading(true);
      setLabOutput(null);
      const res = await fetch('/api/labs/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labId: lab.id }),
      });
      const data = await res.json();
      setLabOutput(data.logs || []);
    } catch (err) {
      console.error('Failed to run lab:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar List */}
      <div className="lg:col-span-4 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Hands-On Lab Curriculum
        </div>
        <div className="space-y-2">
          {LABS_LIST.map((lab) => {
            const isSelected = selectedLab.id === lab.id;
            return (
              <button
                key={lab.id}
                id={`btn-select-lab-${lab.number}`}
                onClick={() => {
                  setSelectedLab(lab);
                  setLabOutput(null);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Lab {lab.number}
                  </span>
                  <div className="flex items-center space-x-2">
                    {lab.highlight && (
                      <span className="text-[10px] flex items-center gap-1 font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Flame className="w-3 h-3 text-amber-400" />
                        Highlight
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">{lab.time}</span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-white mt-0.5">{lab.title}</div>
                <p className="text-xs text-slate-400 line-clamp-2">{lab.summary}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Details & Output */}
      <div className="lg:col-span-8 space-y-6">
        {/* Lab Overview Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Lab #{selectedLab.number}
                </span>
                <span className="text-xs text-slate-500">Estimated: {selectedLab.time}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{selectedLab.title}</h2>
            </div>
            <button
              id="btn-run-selected-lab"
              onClick={() => handleRunLab(selectedLab)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Executing Lab {selectedLab.number}...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Lab {selectedLab.number} Now</span>
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{selectedLab.summary}</p>

          {/* Educational Callouts */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <HelpCircle className="w-4 h-4" />
              <span>What to look for in the run:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {selectedLab.lookFor.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Live Terminal Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Console Output & Run Traces
              </h3>
            </div>
            {labOutput && (
              <span className="text-[11px] text-slate-500 font-mono">
                {labOutput.length} lines logged
              </span>
            )}
          </div>

          <div className="min-h-[280px] max-h-[500px] overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed space-y-1">
            {loading ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 space-y-3">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p>Executing Lab {selectedLab.number} programmatically...</p>
              </div>
            ) : labOutput ? (
              labOutput.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.startsWith('===')
                      ? 'text-blue-400 font-semibold pt-2'
                      : line.startsWith('Q:')
                      ? 'text-amber-300 font-semibold'
                      : line.startsWith('  [ok]')
                      ? 'text-emerald-400'
                      : line.includes('escaped') || line.includes('KeyError')
                      ? 'text-red-400'
                      : 'text-slate-300'
                  }
                >
                  {line}
                </div>
              ))
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-600 space-y-2">
                <Terminal className="w-8 h-8 opacity-40" />
                <p>Click "Run Lab {selectedLab.number} Now" to execute the code and stream logs.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
