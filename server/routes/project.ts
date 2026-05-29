import type { Request, Response } from 'express';
import { getProjectData, getProject, updateProject } from '../store/projectStore.js';
import { generateWithRetry } from '../services/ai.js';
import type { TutorRequest } from '../types/index.js';

export function setupProjectRoute(app: {
  get: (path: string, handler: (req: Request, res: Response) => void) => void;
  post: (path: string, handler: (req: Request, res: Response) => void) => void;
}) {
  // GET /api/project/:id — get project data
  app.get('/api/project/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const data = getProjectData(id);
    if (!data) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(data);
  });

  // GET /api/project/:id/status — get analysis status
  app.get('/api/project/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const record = getProject(id);
    if (!record) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({
      status: record.status,
      step: record.step,
      error: record.error,
    });
  });

  // POST /api/project/:id/business — regenerate business analysis
  app.post('/api/project/:id/business', async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = getProjectData(id);
    if (!data) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // For MVP, regenerate business section via AI
    const prompt = `
You are a business analyst. Given the following project information, generate a business analysis JSON.

Project: ${data.project.name}
Description: ${data.project.description}
Tech Stack: ${data.project.techStack.join(', ')}
Summary: ${data.summary.summary}
Core Functionality: ${data.summary.coreFunctionality}

Return ONLY a JSON object matching this schema (no markdown, no code blocks):
{
  "positioning": "string",
  "problems": "string",
  "users": "string",
  "painPoints": "string",
  "coreValue": "string",
  "competitors": [{ "name": "string", "edge": "string" }],
  "model": "string",
  "mvp": "string",
  "growth": "string",
  "risks": "string",
  "future": "string"
}
    `.trim();

    try {
      const response = await generateWithRetry({
        model: 'deepseek-v4-flash',
        contents: prompt,
      });

      const business = JSON.parse(response.text);
      const updatedData = { ...data, business };

      // Update store with new business data
      const record = getProject(id);
      if (record?.data) {
        record.data.business = business;
      }

      res.json({ business, status: 'completed' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate business analysis' });
    }
  });
}

export function setupTutorRoute(app: {
  post: (path: string, handler: (req: Request, res: Response) => void) => void;
}) {
  // POST /api/tutor — AI tutor Q&A
  app.post('/api/tutor', async (req: Request, res: Response) => {
    try {
      const { question, context, history } = req.body as TutorRequest;
      if (!question) {
        res.status(400).json({ error: 'Question is required' });
        return;
      }

      const prompt = `
You are a senior AI mentor explaining a software repository.
Context of what the user is currently reading/learning:
${context || 'General understanding'}

Prior conversation history (if any):
${JSON.stringify(history || [])}

User Question:
${question}

Provide a concise, direct answer focusing on guiding the user in code comprehension.
      `.trim();

      const response = await generateWithRetry({
        model: 'deepseek-v4-flash',
        contents: prompt,
      });

      res.json({ answer: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get tutor answer' });
    }
  });
}