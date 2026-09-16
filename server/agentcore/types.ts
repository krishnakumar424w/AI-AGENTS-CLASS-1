export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

export interface ToolParameterProperty {
  type: string;
  description?: string;
  enum?: string[];
  items?: {
    type: string;
  };
}

export interface ToolSchema {
  type: 'object';
  properties: Record<string, ToolParameterProperty>;
  required: string[];
  additionalProperties?: boolean;
}

export interface OpenAIToolFormat {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: ToolSchema;
  };
}

export interface Tool {
  name: string;
  description: string;
  schema: ToolSchema;
  fn: (args: any) => any;
  toOpenAI: () => OpenAIToolFormat;
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
  messages: Message[];
  trace: RunTraceData;
  ok: boolean;
}

export interface Critique {
  passed: boolean;
  failed_criteria: string[];
  evidence: string[];
  fix: string;
}
