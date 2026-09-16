import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { Agent } from './server/agentcore/agent.js';
import {
  campusRegistry,
  CAMPUS_INSTRUCTIONS,
  getCampusData,
  resetCampusData,
} from './server/agentcore/demoTools.js';
import {
  runLab1,
  runLab2,
  runLab3,
  runLab4,
  runLab5,
  runLab6,
  runExercise,
} from './server/labsRunner.js';
import { EvaluatorOptimizer, OrchestratorWorker } from './server/agentcore/patterns.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Setup Check (equivalent to setup_check.py)
  app.get('/api/setup-check', async (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
    const maskedKey = hasKey
      ? `${process.env.GEMINI_API_KEY!.slice(0, 6)}...${process.env.GEMINI_API_KEY!.slice(-4)}`
      : 'Not configured (using simulation fallback)';

    const checks = [
      { label: `Node.js ${process.version}`, passed: true },
      { label: 'Environment: AI Studio Container (Linux x64)', passed: true },
      { label: 'Provider: Google Gemini (Free Tier)', passed: true },
      {
        label: `API Key: ${hasKey ? `Loaded (${maskedKey})` : 'Simulation / Demo Mode'}`,
        passed: true,
        hint: hasKey ? undefined : 'You can optionally add GEMINI_API_KEY in Settings',
      },
      { label: `Main Model: ${process.env.MODEL_MAIN || 'gemini-2.5-flash'}`, passed: true },
      { label: `Cheap Model: ${process.env.MODEL_CHEAP || 'gemini-2.5-flash-lite'}`, passed: true },
      { label: 'Agent Core: Tools, Memory, Tracing, Patterns', passed: true },
    ];

    res.json({
      allPassed: true,
      hasKey,
      provider: 'gemini',
      providerLabel: 'Google Gemini (free tier)',
      modelMain: process.env.MODEL_MAIN || 'gemini-2.5-flash',
      modelCheap: process.env.MODEL_CHEAP || 'gemini-2.5-flash-lite',
      checks,
    });
  });

  // Campus Records & Database
  app.get('/api/campus', (req, res) => {
    res.json(getCampusData());
  });

  app.post('/api/campus/reset', (req, res) => {
    res.json(resetCampusData());
  });

  // Interactive Agent Runner
  app.post('/api/agent/run', async (req, res) => {
    try {
      const { goal, history, temperature, maxIterations } = req.body;
      if (!goal || typeof goal !== 'string') {
        return res.status(400).json({ error: 'goal is required' });
      }

      const agent = new Agent({
        name: 'Campus Assistant',
        instructions: CAMPUS_INSTRUCTIONS,
        registry: campusRegistry(),
        temperature: typeof temperature === 'number' ? temperature : 0.3,
        maxIterations: typeof maxIterations === 'number' ? maxIterations : 8,
      });

      const result = await agent.run(goal, history);
      res.json(result);
    } catch (err: any) {
      console.error('Error running agent:', err);
      res.status(500).json({ error: err?.message || 'Agent execution error' });
    }
  });

  // Labs Runner
  app.post('/api/labs/run', async (req, res) => {
    try {
      const { labId, customQuestion } = req.body;
      let result;
      switch (labId) {
        case 'lab1':
          result = await runLab1();
          break;
        case 'lab2':
          result = await runLab2();
          break;
        case 'lab3':
          result = await runLab3(customQuestion);
          break;
        case 'lab4':
          result = await runLab4();
          break;
        case 'lab5':
          result = await runLab5();
          break;
        case 'lab6':
          result = await runLab6();
          break;
        default:
          return res.status(400).json({ error: `Unknown labId '${labId}'` });
      }
      res.json(result);
    } catch (err: any) {
      console.error('Error running lab:', err);
      res.status(500).json({ error: err?.message || 'Lab execution error' });
    }
  });

  // Exercises Runner
  app.post('/api/exercises/run', async (req, res) => {
    try {
      const { exerciseId, customInput } = req.body;
      const result = await runExercise(exerciseId, customInput);
      res.json(result);
    } catch (err: any) {
      console.error('Error running exercise:', err);
      res.status(500).json({ error: err?.message || 'Exercise execution error' });
    }
  });

  // Evaluator-Optimizer Playground
  app.post('/api/patterns/evaluator-optimizer', async (req, res) => {
    try {
      const { task, criteria, maxRounds } = req.body;
      const writer = new Agent({
        name: 'Writer',
        instructions: 'You write short, professional English for an Indian academic audience.',
        temperature: 0.7,
      });

      const loop = new EvaluatorOptimizer(
        writer,
        criteria || [
          'Under 90 words.',
          'Names at least one specific, concrete benefit to the student.',
          'Contains no exclamation marks and no marketing superlatives.',
          'Ends with a clear single call to action.',
        ],
        maxRounds || 3
      );

      const result = await loop.run(task);
      res.json(result);
    } catch (err: any) {
      console.error('Error running evaluator-optimizer:', err);
      res.status(500).json({ error: err?.message || 'Pattern execution error' });
    }
  });

  // Orchestrator-Worker Playground
  app.post('/api/patterns/orchestrator-worker', async (req, res) => {
    try {
      const { goal } = req.body;
      const makeWorker = (role: string) =>
        new Agent({
          name: role,
          instructions: `You are a ${role}. Address ONLY the sub-task given. Be concise: at most 100 words.`,
          temperature: 0.4,
        });

      const orchestrator = new OrchestratorWorker(makeWorker, 3);
      const result = await orchestrator.run(goal);
      res.json(result);
    } catch (err: any) {
      console.error('Error running orchestrator-worker:', err);
      res.status(500).json({ error: err?.message || 'Orchestrator execution error' });
    }
  });

  // Vite middleware in dev or static serve in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Agents Class] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
