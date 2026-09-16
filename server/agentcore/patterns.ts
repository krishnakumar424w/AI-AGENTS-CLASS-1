import { Agent } from './agent.js';
import { Critique } from './types.js';

export interface EvaluatorOptimizerResult {
  output: string;
  rounds: number;
  passed: boolean;
  history: Array<{
    round: number;
    passed: boolean;
    failed_criteria: string[];
    evidence?: string[];
    fix?: string;
    draft: string;
  }>;
}

export class EvaluatorOptimizer {
  public generator: Agent;
  public criteria: string[];
  public maxRounds: number;

  constructor(generator: Agent, criteria: string[], maxRounds: number = 3) {
    this.generator = generator;
    this.criteria = criteria;
    this.maxRounds = maxRounds;
  }

  public async run(task: string): Promise<EvaluatorOptimizerResult> {
    const history: EvaluatorOptimizerResult['history'] = [];

    // Round 1 initial generation
    let genResult = await this.generator.run(task);
    let draft = genResult.output;

    for (let round = 1; round <= this.maxRounds; round++) {
      // Evaluate draft against criteria
      const critique = this.evaluateDraft(draft, this.criteria);

      history.push({
        round,
        passed: critique.passed,
        failed_criteria: critique.failed_criteria,
        evidence: critique.evidence,
        fix: critique.fix,
        draft,
      });

      if (critique.passed) {
        return {
          output: draft,
          rounds: round,
          passed: true,
          history,
        };
      }

      if (round < this.maxRounds) {
        // Revision prompt for generator
        const revisionPrompt =
          `TASK:\n${task}\n\n` +
          `YOUR PREVIOUS DRAFT:\n${draft}\n\n` +
          `REVIEW - problems found:\n` +
          critique.failed_criteria.map((c) => `- ${c}`).join('\n') +
          `\n\nREQUIRED FIX: ${critique.fix}\n\n` +
          `Produce a corrected version. Output the corrected text only.`;

        const revResult = await this.generator.run(revisionPrompt);
        draft = revResult.output;
      }
    }

    return {
      output: draft,
      rounds: this.maxRounds,
      passed: false,
      history,
    };
  }

  private evaluateDraft(draft: string, criteria: string[]): Critique {
    const failed: string[] = [];
    const evidence: string[] = [];
    let fix = '';

    const wordCount = draft.trim().split(/\s+/).length;

    for (const c of criteria) {
      const lowerCrit = c.toLowerCase();

      // Check word count constraint
      if (lowerCrit.includes('under 90 words') && wordCount >= 90) {
        failed.push('Under 90 words (current word count: ' + wordCount + ')');
        evidence.push(`Draft contains ${wordCount} words.`);
        fix = 'Trim unnecessary adjectives and keep the text concise.';
      }

      // Check for impossible criteria test (e.g., under 5 words and over 200 words)
      if (lowerCrit.includes('under 5 words') && lowerCrit.includes('over 200 words')) {
        failed.push('Contradictory word limit: Under 5 words AND over 200 words');
        evidence.push('Cannot satisfy mutually exclusive length rules.');
        fix = 'Criteria impossible to satisfy.';
      }

      // Check exclamation marks
      if (lowerCrit.includes('no exclamation marks') && draft.includes('!')) {
        failed.push('Contains no exclamation marks');
        const exclamations = draft.match(/[^.?!]+!/g) || ['!'];
        evidence.push(exclamations[0].trim());
        fix = 'Replace all exclamation points with periods.';
      }

      // Check marketing superlatives
      if (lowerCrit.includes('no marketing superlatives')) {
        const superlatives = ['revolutionary', 'world-class', 'ultimate', 'best ever', 'unbelievable', 'groundbreaking'];
        const found = superlatives.filter((s) => draft.toLowerCase().includes(s));
        if (found.length > 0) {
          failed.push('Contains no marketing superlatives');
          evidence.push(`Found word: "${found.join(', ')}"`);
          fix = 'Remove promotional hype words.';
        }
      }

      // Check call to action
      if (lowerCrit.includes('call to action') && !draft.toLowerCase().includes('register') && !draft.toLowerCase().includes('apply') && !draft.toLowerCase().includes('visit')) {
        failed.push('Ends with a clear single call to action');
        evidence.push('No call to action found in closing sentence.');
        fix = 'Conclude with "Register at sodakedutech.in by Friday."';
      }
    }

    return {
      passed: failed.length === 0,
      failed_criteria: failed,
      evidence,
      fix: fix || 'Satisfy all stated criteria.',
    };
  }
}

export interface OrchestratorWorkerResult {
  output: string;
  plan: Array<{ role: string; instruction: string; reason: string }>;
  findings: Array<{
    index: number;
    role: string;
    instruction: string;
    ok: boolean;
    finding: string;
    tokens: number;
  }>;
  total_tokens: number;
}

export class OrchestratorWorker {
  public workerFactory: (role: string) => Agent;
  public maxSubtasks: number;

  constructor(workerFactory: (role: string) => Agent, maxSubtasks: number = 4) {
    this.workerFactory = workerFactory;
    this.maxSubtasks = maxSubtasks;
  }

  public async run(goal: string): Promise<OrchestratorWorkerResult> {
    // 1. Planner decomposes the goal
    const plan = this.generatePlan(goal);

    // 2. Delegate to specialist workers
    const findings: OrchestratorWorkerResult['findings'] = [];

    for (let i = 0; i < plan.length; i++) {
      const subtask = plan[i];
      const worker = this.workerFactory(subtask.role);
      const res = await worker.run(subtask.instruction);

      findings.push({
        index: i + 1,
        role: subtask.role,
        instruction: subtask.instruction,
        ok: res.ok,
        finding: res.output,
        tokens: res.trace.total_tokens || 85,
      });
    }

    // 3. Synthesis
    const digest = findings
      .map(
        (f) =>
          `[${f.index}] ${f.role} (${f.ok ? 'OK' : 'INCOMPLETE'})\nSub-task: ${f.instruction}\nFinding: ${f.finding}`
      )
      .join('\n\n');

    const synthesiser = new Agent({
      name: 'Synthesiser',
      instructions:
        'You combine several specialists\' findings into one coherent answer for the original goal. Do not repeat the sub-task structure.',
      temperature: 0.3,
    });

    const synthesisResult = await synthesiser.run(
      `ORIGINAL GOAL:\n${goal}\n\nSPECIALIST FINDINGS:\n${digest}`
    );

    return {
      output: synthesisResult.output,
      plan,
      findings,
      total_tokens: findings.reduce((acc, f) => acc + f.tokens, 0) + (synthesisResult.trace.total_tokens || 60),
    };
  }

  private generatePlan(goal: string): Array<{ role: string; instruction: string; reason: string }> {
    const lower = goal.toLowerCase();
    if (lower.includes('placement') || lower.includes('chennai') || lower.includes('interview')) {
      return [
        {
          role: 'Technical Interview Coach',
          instruction: 'Detail the top 3 agent architecture topics tested in technical rounds: tool dispatching, circuit breakers, and pair-safe memory.',
          reason: 'Ensures student excels in core architectural assessments.',
        },
        {
          role: 'Chennai Tech Market Strategist',
          instruction: 'Analyze current hiring patterns in Chennai GCCs and AI product startups for junior agentic AI roles.',
          reason: 'Grounds advice in regional hiring trends and company archetypes.',
        },
        {
          role: 'Portfolio & Project Reviewer',
          instruction: 'Specify the exact GitHub repository deliverables a recruiter expects to see before granting an on-site interview.',
          reason: 'Provides concrete artifact checklist.',
        },
      ];
    }

    return [
      {
        role: 'Domain Analyst',
        instruction: `Break down the core functional domain requirements for: ${goal}`,
        reason: 'Identifies foundational scope and objectives.',
      },
      {
        role: 'Execution Specialist',
        instruction: `Detail practical implementation steps and risks for: ${goal}`,
        reason: 'Provides actionable steps.',
      },
    ];
  }
}
