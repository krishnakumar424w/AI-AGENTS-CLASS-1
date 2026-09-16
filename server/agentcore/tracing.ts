import { Step, RunTraceData } from './types.js';

export const PRICE_PER_1K_INPUT = Number(process.env.PRICE_PER_1K_INPUT || 0.0);
export const PRICE_PER_1K_OUTPUT = Number(process.env.PRICE_PER_1K_OUTPUT || 0.0);
export const USD_TO_INR = Number(process.env.USD_TO_INR || 88.0);

export class RunTrace {
  public goal: string;
  public steps: Step[] = [];
  public started_at: number;
  public finished_at?: number;
  public outcome: 'completed' | 'max_iterations' | 'incomplete' = 'incomplete';

  constructor(goal: string) {
    this.goal = goal;
    this.started_at = Date.now();
  }

  get prompt_tokens(): number {
    return this.steps.reduce((acc, s) => acc + (s.prompt_tokens || 0), 0);
  }

  get completion_tokens(): number {
    return this.steps.reduce((acc, s) => acc + (s.completion_tokens || 0), 0);
  }

  get total_tokens(): number {
    return this.prompt_tokens + this.completion_tokens;
  }

  get duration_s(): number {
    const end = this.finished_at || Date.now();
    return Math.max(0.01, (end - this.started_at) / 1000);
  }

  get cost_inr(): number {
    const usd =
      (this.prompt_tokens / 1000) * PRICE_PER_1K_INPUT +
      (this.completion_tokens / 1000) * PRICE_PER_1K_OUTPUT;
    return usd * USD_TO_INR;
  }

  add(step: Step): Step {
    this.steps.push(step);
    return step;
  }

  render(): string {
    const width = 74;
    const lines: string[] = [
      '-'.repeat(width),
      `RUN TRACE  |  ${this.goal.slice(0, 58)}`,
      '-'.repeat(width),
    ];

    for (const s of this.steps) {
      const mark = s.ok ? ' ' : 'x';
      const tokens =
        s.kind === 'model'
          ? `${String(s.prompt_tokens + s.completion_tokens).padStart(6)} tok`
          : ' '.repeat(10);
      lines.push(
        ` ${mark} #${String(s.index).padEnd(2)} ${s.kind.padEnd(6)} ${s.duration_s.toFixed(2).padStart(5)}s ${tokens}  ${s.label}`
      );
      if (s.detail) {
        lines.push(`        ${s.detail.slice(0, 96)}`);
      }
    }

    const costStr = this.cost_inr > 0 ? `est. cost: Rs ${this.cost_inr.toFixed(3)}` : 'cost: free tier';
    lines.push('-'.repeat(width));
    lines.push(
      ` outcome: ${this.outcome.padEnd(14)} steps: ${String(this.steps.length).padEnd(4)} tokens: ${this.total_tokens.toLocaleString().padEnd(7)} time: ${this.duration_s.toFixed(1)}s   ${costStr}`
    );
    lines.push('-'.repeat(width));

    return lines.join('\n');
  }

  toJSON(): RunTraceData {
    return {
      goal: this.goal,
      steps: this.steps,
      started_at: this.started_at,
      finished_at: this.finished_at,
      outcome: this.outcome,
      prompt_tokens: this.prompt_tokens,
      completion_tokens: this.completion_tokens,
      total_tokens: this.total_tokens,
      duration_s: this.duration_s,
      cost_inr: this.cost_inr,
      rendered_text: this.render(),
    };
  }
}
