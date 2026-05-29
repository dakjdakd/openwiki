import type { Request, Response } from 'express';
import { runAnalysis } from '../services/analyzer.js';
import { createProject, updateProject, setProjectError } from '../store/projectStore.js';
import { parseGitHubUrl } from '../services/github.js';
import type { AnalysisStep } from '../types/index.js';

export function setupAnalyzeRoute(app: { get: (path: string, handler: (req: Request, res: Response) => void) => void }) {
  app.get('/api/analyze', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const sendStep = (step: AnalysisStep, message: string) => {
      sendEvent({ step, message });
    };

    try {
      const url = req.query.url as string;
      if (!url) {
        sendEvent({ error: 'URL is required' });
        res.end();
        return;
      }

      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        sendEvent({ error: 'Invalid GitHub URL' });
        res.end();
        return;
      }

      const { repo } = parsed;

      // Register project in store
      createProject(repo);
      updateProject(repo, { step: 0 });

      await runAnalysis(url, {
        onStep: (step, message) => {
          updateProject(repo, { step });
          sendStep(step, message);
        },
        onComplete: (data) => {
          sendEvent({ step: 7, data });
          res.end();
        },
        onError: (error) => {
          setProjectError(repo, error);
          sendEvent({ error });
          res.end();
        },
      });
    } catch (err: any) {
      sendEvent({ error: err.message || 'Internal server error' });
      res.end();
    }
  });
}