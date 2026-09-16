import React, { useEffect, useState } from 'react';
import { X, RefreshCw, Database, Bell, Users, Wrench } from 'lucide-react';
import { StudentRecord, ReminderRecord } from '../types.js';

interface CampusDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampusDatabaseModal: React.FC<CampusDatabaseModalProps> = ({ isOpen, onClose }) => {
  const [students, setStudents] = useState<Record<string, StudentRecord>>({});
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campus');
      const data = await res.json();
      setStudents(data.students || {});
      setReminders(data.reminders || []);
    } catch (err) {
      console.error('Failed to load campus data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campus/reset', { method: 'POST' });
      const data = await res.json();
      setStudents(data.students || {});
      setReminders(data.reminders || []);
    } catch (err) {
      console.error('Failed to reset campus data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Campus Mock Database & Tools</h2>
              <p className="text-xs text-slate-400">
                Ground-truth records used by the Agent for verification and tool calls
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="btn-reset-campus-data"
              onClick={handleReset}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Reset Records</span>
            </button>
            <button
              id="btn-close-modal"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Students Section */}
          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Student Records (STUDENTS)
              </h3>
            </div>
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/50">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 font-medium border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Programme</th>
                    <th className="px-4 py-3">Semester</th>
                    <th className="px-4 py-3">Fee Balance</th>
                    <th className="px-4 py-3">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {Object.entries(students).map(([roll, rec]) => (
                    <tr key={roll} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-semibold text-blue-400">{roll}</td>
                      <td className="px-4 py-3 font-sans text-white">{rec.name}</td>
                      <td className="px-4 py-3 font-sans text-slate-300">{rec.programme}</td>
                      <td className="px-4 py-3">{rec.semester}</td>
                      <td className="px-4 py-3 text-amber-400">
                        ₹{rec.fee_balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            rec.attendance_pct < 75
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {rec.attendance_pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Reminders Section */}
          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Active Reminders (REMINDERS)
              </h3>
            </div>
            {reminders.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center text-xs text-slate-500">
                No active reminders created yet. Ask the Agent or run Lab 3 to schedule a reminder!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reminders.map((r, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/40 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{r.title}</span>
                      <span className="text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        Due: {r.due}
                      </span>
                    </div>
                    {r.note && <p className="text-xs text-slate-400">{r.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tool Schemas Section */}
          <section>
            <div className="flex items-center space-x-2 mb-3">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Registered Tools (ToolRegistry)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50">
                <div className="font-mono text-xs font-semibold text-blue-400 mb-1">
                  get_student
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  Looks up student record by roll number (name, programme, fee balance, attendance).
                </p>
                <div className="text-[10px] font-mono text-slate-500 bg-slate-900 p-2 rounded border border-slate-800">
                  required: ["roll_number"]
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50">
                <div className="font-mono text-xs font-semibold text-emerald-400 mb-1">
                  list_students_below_attendance
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  Flags all students falling below a percentage cutoff threshold.
                </p>
                <div className="text-[10px] font-mono text-slate-500 bg-slate-900 p-2 rounded border border-slate-800">
                  required: ["threshold_pct"]
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50">
                <div className="font-mono text-xs font-semibold text-amber-400 mb-1">
                  create_reminder
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  Creates dated reminder with title, days ahead, and optional note.
                </p>
                <div className="text-[10px] font-mono text-slate-500 bg-slate-900 p-2 rounded border border-slate-800">
                  required: ["title", "days_from_now"]
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
