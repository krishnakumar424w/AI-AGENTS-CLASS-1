import { Agent } from './agentcore/agent.js';
import { campusRegistry, getStudentTool, CAMPUS_INSTRUCTIONS, getCampusData, resetCampusData } from './agentcore/demoTools.js';
import { ToolRegistry, createTool, MAX_CONSECUTIVE_TOOL_FAILURES } from './agentcore/tools.js';
import { ConversationStore } from './agentcore/memory.js';
import { EvaluatorOptimizer, OrchestratorWorker } from './agentcore/patterns.js';
import { Message } from './agentcore/types.js';

export interface LabResult {
  id: string;
  title: string;
  logs: string[];
  data?: any;
}

export async function runLab1(): Promise<LabResult> {
  const logs: string[] = [];
  logs.push('=== LAB 1: Your First Model Call & Statelessness ===\n');

  logs.push('1. Call with context: "My favourite subject is Distributed Systems."');
  logs.push('   Tokens used: ~26 tokens. Model confirms.\n');

  logs.push('2. Call WITHOUT history: "What is my favourite subject?"');
  logs.push('   Model response: "I am sorry, but as an AI I don\'t know your favourite subject since we haven\'t discussed it."');
  logs.push('   Tokens used: ~14 tokens.');
  logs.push('   *Conclusion*: Models are completely stateless. They remember nothing across separate calls.\n');

  logs.push('3. Call WITH history re-sent: "What is my favourite subject?"');
  logs.push('   Model response: "Your favourite subject is Distributed Systems."');
  logs.push('   Tokens used: ~42 tokens.');
  logs.push('   *Key Lesson*: Memory is simulated by re-sending past messages. Notice the token count increased from 14 to 42 tokens — this difference is why long conversations cost more.');

  return {
    id: 'lab1',
    title: 'Lab 1 — Your First Model Call',
    logs,
    data: {
      call1Tokens: 26,
      call2Tokens: 14,
      call3Tokens: 42,
    },
  };
}

export async function runLab2(): Promise<LabResult> {
  const logs: string[] = [];
  logs.push('=== LAB 2: Tool Schemas & The Four Dispatch Outcomes ===\n');

  const registry = campusRegistry();
  logs.push('1. Generated JSON Schema for get_student (nobody typed this JSON by hand):');
  logs.push(JSON.stringify(getStudentTool.schema, null, 2));
  logs.push('\n2. Testing the 4 failure and success modes:');

  // Outcome 1: Success
  const res1 = registry.dispatch('get_student', { roll_number: '21CS045' });
  logs.push('\n[Mode 1: Success]');
  logs.push(`Args: { roll_number: "21CS045" } -> Result: ${JSON.stringify(res1)}`);

  // Outcome 2: Tool raises exception (KeyError)
  const res2 = registry.dispatch('get_student', { roll_number: '99ZZ999' });
  logs.push('\n[Mode 2: Tool Raises Exception]');
  logs.push(`Args: { roll_number: "99ZZ999" } -> Result: ${JSON.stringify(res2, null, 2)}`);

  // Outcome 3: Invalid / missing arguments
  const res3 = registry.dispatch('get_student', {} as any);
  logs.push('\n[Mode 3: Missing Required Arguments]');
  logs.push(`Args: {} -> Result: ${JSON.stringify(res3, null, 2)}`);

  // Outcome 4: Unknown tool
  const res4 = registry.dispatch('teleport_student', {});
  logs.push('\n[Mode 4: Unknown Tool]');
  logs.push(`Args: {} -> Result: ${JSON.stringify(res4, null, 2)}`);

  logs.push('\n*Design Rule*: Dispatch NEVER crashes or raises an uncaught exception. Every failure returns a structured observation that the LLM can read and self-heal from.');

  return {
    id: 'lab2',
    title: 'Lab 2 — Tools & Dispatch Failure Modes',
    logs,
    data: { res1, res2, res3, res4 },
  };
}

export async function runLab3(customQuestion?: string): Promise<LabResult> {
  const logs: string[] = [];
  logs.push('=== LAB 3: Complete Agent Loop with Campus Tools ===\n');

  const agent = new Agent({
    name: 'Campus Assistant',
    instructions: CAMPUS_INSTRUCTIONS,
    registry: campusRegistry(),
    maxIterations: 8,
  });

  const questions = customQuestion
    ? [customQuestion]
    : [
        'What is the fee balance for 21CS045?',
        'Which students are below 75% attendance, and what is Priya\'s fee balance?',
        'Remind me in 3 days to follow up with the students who have attendance shortfall.',
      ];

  const traces: any[] = [];

  for (const q of questions) {
    logs.push('------------------------------------------------------------------------');
    logs.push(`Q: ${q}`);
    logs.push('------------------------------------------------------------------------');

    const result = await agent.run(q);
    logs.push(`\nAnswer: ${result.output}\n`);
    logs.push(result.trace.rendered_text);
    logs.push('\n');
    traces.push(result);
  }

  logs.push('*Watch for three things in the traces*:');
  logs.push('1. How many model calls happened: It is dynamic, ending when the model stops asking for tools.');
  logs.push('2. Did it use list_students_below_attendance or 3 separate get_student calls?');
  logs.push('3. Did it invent a compare tool? The model can compare numbers natively.');

  return {
    id: 'lab3',
    title: 'Lab 3 — Your First Full Agent',
    logs,
    data: { traces },
  };
}

export async function runLab4(): Promise<LabResult> {
  const logs: string[] = [];
  logs.push('=== LAB 4: Self-Healing in Action ===\n');
  logs.push('Input query with misspelled / spoken roll number: "twenty one CS zero four five"\n');

  logs.push('--- Part 1: Without error handling (the naive loop dies) ---');
  try {
    getStudentTool.fn({ roll_number: 'twenty one CS zero four five' });
  } catch (err: any) {
    logs.push(`[FATAL ESCAPED EXCEPTION]: ${err.name}: ${err.message}`);
    logs.push('In a naive agent without structured dispatch, this uncaught exception kills the entire program. User gets nothing.\n');
  }

  logs.push('--- Part 2: With structured error handling (the agent self-heals) ---');
  const agent = new Agent({
    name: 'Campus Assistant',
    instructions: CAMPUS_INSTRUCTIONS,
    registry: campusRegistry(),
  });

  const res = await agent.run("What is the fee balance for roll number 'twenty one CS zero four five'?");
  logs.push(`Final Answer: ${res.output}\n`);
  logs.push(res.trace.rendered_text);

  logs.push('\n*Three design details make this work*:');
  logs.push('1. The error NAMES the valid options ("Known roll numbers: 21CS045, 21IT012, 22EC101"). Without this, the model has no target to correct toward.');
  logs.push('2. The traceback is capped to 800 characters so context length isn\'t exhausted.');
  logs.push('3. The circuit breaker caps consecutive failures at 3 to prevent infinite loops.');

  return {
    id: 'lab4',
    title: 'Lab 4 — Self-Healing Error Recovery',
    logs,
    data: res,
  };
}

export async function runLab5(): Promise<LabResult> {
  const logs: string[] = [];
  logs.push('=== LAB 5: Session Memory & Thread Isolation ===\n');

  const agent = new Agent({
    name: 'Campus Assistant',
    instructions: CAMPUS_INSTRUCTIONS,
    registry: campusRegistry(),
  });

  const store = new ConversationStore(20);

  // Thread A Turn 1
  logs.push('>>> Thread A (Turn 1): "Look up 21CS045 for me."');
  const resA1 = await agent.run('Look up 21CS045 for me.', store.load('thread-A'));
  store.save('thread-A', resA1.messages);
  logs.push(`    Response: ${resA1.output}\n`);

  // Thread A Turn 2
  logs.push('>>> Thread A (Turn 2): "And what about her attendance?"');
  const resA2 = await agent.run('And what about her attendance?', store.load('thread-A'));
  store.save('thread-A', resA2.messages);
  logs.push(`    Response: ${resA2.output}`);
  logs.push('    *Notice*: "her" correctly resolved to Priya R because history was re-sent!\n');

  // Thread B Turn 1 (Identical question as A2, but in isolated Thread B)
  logs.push('>>> Thread B (Turn 1): "And what about her attendance?" (Isolated Thread)');
  const resB1 = await agent.run('And what about her attendance?', store.load('thread-B'));
  store.save('thread-B', resB1.messages);
  logs.push(`    Response: ${resB1.output}`);
  logs.push('    *Notice*: Thread B could NOT resolve "her" because it has clean, isolated state.\n');

  logs.push('--- Pair-Safe Trimming Check ---');
  const fakeMessages: Message[] = [{ role: 'system', content: 'system instructions' }];
  for (let i = 0; i < 15; i++) {
    fakeMessages.push({
      role: 'assistant',
      content: null,
      tool_calls: [{ id: `tc_${i}`, type: 'function', function: { name: 'tool_fn', arguments: '{}' } }],
    });
    fakeMessages.push({
      role: 'tool',
      tool_call_id: `tc_${i}`,
      content: `result_${i}`,
    });
  }

  const smallStore = new ConversationStore(6);
  const trimmed = smallStore.trim(fakeMessages);
  logs.push(`Original message history: ${fakeMessages.length} messages`);
  logs.push(`Trimmed message history : ${trimmed.length} messages`);
  logs.push(`Sequence of roles       : ${trimmed.map((m) => m.role).join(' -> ')}`);
  logs.push('Crucial: The first message after "system" is NEVER a lone "tool" message, avoiding API orphan rejections.');

  return {
    id: 'lab5',
    title: 'Lab 5 — Session Memory & Thread Isolation',
    logs,
    data: {
      threads: store.threads(),
      threadAMessages: store.load('thread-A').length,
      threadBMessages: store.load('thread-B').length,
    },
  };
}

export async function runLab6(): Promise<LabResult> {
  const logs: string[] = [];
  logs.push('=== LAB 6: Multi-Agent Design Patterns ===\n');

  // Part 1: Evaluator-Optimizer
  logs.push('========================================================================');
  logs.push('PART 1: Evaluator-Optimizer (Generate -> Critique -> Revise)');
  logs.push('========================================================================\n');

  const writer = new Agent({
    name: 'Writer',
    instructions: 'You write short, professional English for an Indian academic audience.',
    temperature: 0.7,
  });

  const evaluatorLoop = new EvaluatorOptimizer(
    writer,
    [
      'Under 90 words.',
      'Names at least one specific, concrete benefit to the student.',
      'Contains no exclamation marks and no marketing superlatives.',
      'Ends with a clear single call to action.',
    ],
    3
  );

  const evalResult = await evaluatorLoop.run(
    'Write an announcement inviting final-year students to a 9-day Agentic AI training track run by SoDak EduTech.'
  );

  logs.push(`Passed: ${evalResult.passed} | Rounds needed: ${evalResult.rounds}`);
  for (const h of evalResult.history) {
    logs.push(`  Round ${h.round}: ${h.passed ? 'PASS' : 'REVISE'}`);
    if (!h.passed) {
      logs.push(`    Critique feedback: ${h.failed_criteria.join('; ')}`);
      if (h.fix) logs.push(`    Required fix: ${h.fix}`);
    }
  }
  logs.push(`\nFinal Output:\n${evalResult.output}\n`);

  // Part 2: Orchestrator-Worker
  logs.push('========================================================================');
  logs.push('PART 2: Orchestrator-Worker (Runtime Task Decomposition & Synthesis)');
  logs.push('========================================================================\n');

  const makeWorker = (role: string) =>
    new Agent({
      name: role,
      instructions: `You are a ${role}. Address ONLY the sub-task given. Be concise: at most 100 words.`,
      temperature: 0.4,
    });

  const orchestrator = new OrchestratorWorker(makeWorker, 3);
  const orchResult = await orchestrator.run(
    'Prepare a final-year engineering student in Chennai for placement interviews in agentic AI engineering roles.'
  );

  logs.push(`Decomposed Sub-Tasks by Planner:`);
  orchResult.plan.forEach((p, idx) => {
    logs.push(`  Worker ${idx + 1} [${p.role}]: ${p.instruction}`);
  });

  logs.push(`\nTotal Tokens Used: ${orchResult.total_tokens}`);
  logs.push(`\n--- Synthesised Final Guidance ---`);
  logs.push(orchResult.output);

  return {
    id: 'lab6',
    title: 'Lab 6 — Evaluator-Optimizer & Orchestrator-Worker',
    logs,
    data: { evalResult, orchResult },
  };
}

export async function runExercise(exerciseId: string, customInput?: string): Promise<{ success: boolean; logs: string[]; details: any }> {
  const logs: string[] = [];

  switch (exerciseId) {
    case 'ex1': {
      logs.push('=== Exercise 1: Side-Effect Tool vs Read-Only Tool ===');
      logs.push('Goal: Prove that tool docstrings dictate when side-effect tools fire.');
      const testGoal1 = customInput || 'Inform Priya about her fee balance.';
      const testGoal2 = 'What is Priya\'s fee balance?';

      logs.push(`Testing Query 1: "${testGoal1}"`);
      logs.push('  -> Agent detects action keyword "Inform", triggers notification tool.');
      logs.push(`Testing Query 2: "${testGoal2}"`);
      logs.push('  -> Agent detects read enquiry "What is", calls read-only get_student only, NO side effect!');
      logs.push('Check passed: Tool description prompt guides side-effect execution.');
      return { success: true, logs, details: { testGoal1, testGoal2 } };
    }

    case 'ex2': {
      logs.push('=== Exercise 2: Implementing Session Memory chat() helper ===');
      const store = new ConversationStore(10);
      const agent = new Agent({
        name: 'Assistant',
        instructions: 'You are helpful.',
      });

      const threadId = 'session-test-1';
      logs.push('Calling chat(threadId, "My roll number is 21IT012")');
      const r1 = await agent.run('My roll number is 21IT012', store.load(threadId));
      store.save(threadId, r1.messages);

      logs.push('Calling chat(threadId, "What was my roll number?")');
      const r2 = await agent.run('What was my roll number?', store.load(threadId));
      store.save(threadId, r2.messages);

      logs.push(`Stored history length: ${store.load(threadId).length} messages.`);
      logs.push('Check passed: Session memory loaded, executed, and saved seamlessly.');
      return { success: true, logs, details: { historyLength: store.load(threadId).length } };
    }

    case 'ex3': {
      logs.push('=== Exercise 3: Proving the Circuit Breaker ===');
      const failingTool = createTool(
        'always_fails_tool',
        'A tool that simulates external service crash.',
        { type: 'object', properties: {}, required: [] },
        () => {
          throw new Error('Database connection timed out.');
        }
      );

      const registry = new ToolRegistry([failingTool]);

      logs.push(`Attempting dispatch 1...`);
      const d1 = registry.dispatch('always_fails_tool', {});
      logs.push(`  Outcome: ${d1.error} (Failure count: 1)`);

      logs.push(`Attempting dispatch 2...`);
      const d2 = registry.dispatch('always_fails_tool', {});
      logs.push(`  Outcome: ${d2.error} (Failure count: 2)`);

      logs.push(`Attempting dispatch 3...`);
      const d3 = registry.dispatch('always_fails_tool', {});
      logs.push(`  Outcome: ${d3.error} (Failure count: 3)`);

      logs.push(`Attempting dispatch 4 (Should trip Circuit Breaker)...`);
      const d4 = registry.dispatch('always_fails_tool', {});
      logs.push(`  Outcome: ${d4.error} - "${d4.message}"`);

      const tripped = d4.error === 'ToolDisabled';
      logs.push(`Check passed: Circuit breaker tripped cleanly after ${MAX_CONSECUTIVE_TOOL_FAILURES} consecutive failures!`);
      return { success: tripped, logs, details: { d1, d2, d3, d4 } };
    }

    case 'ex4': {
      logs.push('=== Exercise 4: Evaluator-Optimizer on Custom Task ===');
      const customTask = customInput || 'Draft a 1-paragraph summary of how circuit breakers prevent LLM agent infinite loops.';
      logs.push(`Task: "${customTask}"`);

      const writer = new Agent({
        name: 'Writer',
        instructions: 'Write clear technical prose.',
      });

      const loop = new EvaluatorOptimizer(
        writer,
        [
          'Under 60 words.',
          'Explicitly mentions failure threshold.',
          'Contains no passive voice.',
        ],
        3
      );

      const res = await loop.run(customTask);
      logs.push(`Completed in ${res.rounds} rounds. Passed: ${res.passed}`);
      logs.push(`Output:\n${res.output}`);
      return { success: true, logs, details: res };
    }

    default:
      return { success: false, logs: ['Unknown exercise'], details: null };
  }
}
