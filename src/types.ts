export interface StudentRecord {
  name: string;
  programme: string;
  semester: number;
  fee_balance: number;
  attendance_pct: number;
}

export interface ReminderRecord {
  title: string;
  due: string;
  note?: string;
}

export interface Step {
  index: number;
  kind: 'model' | 'tool';
  label: string;
  duration_s: number;
  prompt_tokens: number;
  completion_tokens: number;
  detail?: string;
  ok: boolean;
}

export interface RunTraceData {
  goal: string;
  steps: Step[];
  started_at: number;
  finished_at?: number;
  outcome: 'completed' | 'max_iterations' | 'incomplete';
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  duration_s: number;
  cost_inr: number;
  rendered_text: string;
}

export interface RunResult {
  output: string;
  messages: Array<{
    role: string;
    content?: string | null;
    tool_calls?: any[];
    tool_call_id?: string;
  }>;
  trace: RunTraceData;
  ok: boolean;
}

export interface SetupCheckData {
  allPassed: boolean;
  hasKey: boolean;
  provider: string;
  providerLabel: string;
  modelMain: string;
  modelCheap: string;
  checks: Array<{
    label: string;
    passed: boolean;
    hint?: string;
  }>;
}
