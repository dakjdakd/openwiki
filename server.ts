import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});

async function generateWithRetry(params: any, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.chat.completions.create(params);
    } catch (error: any) {
      const errStr = String(error);
      const isUnavailable =
        error?.status === 503 ||
        error?.status === 429 ||
        errStr.includes('503') ||
        errStr.includes('429') ||
        errStr.includes('rate limit') ||
        errStr.includes('internal server error');
      if (isUnavailable && attempt < maxRetries) {
        const delay = attempt * 3000;
        console.warn(`DeepSeek API unavailable, retrying in ${delay}ms... (Attempt ${attempt} of ${maxRetries})`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to generate content after retries");
}

async function fetchGithub(url: string, options: any = {}) {
  const headers: any = { ...options.headers };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return fetch(url, { ...options, headers });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/analyze', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const url = req.query.url as string;
      if (!url) {
        sendEvent({ error: "URL is required" });
        return res.end();
      }

      // parse github url
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        sendEvent({ error: "Invalid GitHub URL" });
        return res.end();
      }

      const owner = match[1];
      const repo = match[2].replace('.git', '');

      sendEvent({ step: 0, message: `Cloning repository ${owner}/${repo}...` });

      // 1. Fetch Repository Info
      const repoRes = await fetchGithub(`https://api.github.com/repos/${owner}/${repo}`);
      if (!repoRes.ok) throw new Error("Failed to fetch repo from GitHub");
      const repoData = await repoRes.json();

      const defaultBranch = repoData.default_branch || 'main';

      sendEvent({ step: 1, message: "Parsing README..." });
      // 2. Fetch README.md
      const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.md`);
      const readmeStr = readmeRes.ok ? await readmeRes.text() : "No README found.";

      sendEvent({ step: 2, message: "Detecting architecture (package.json)..." });
      // 3. Fetch package.json
      let techStack: string[] = [repoData.language].filter(Boolean);
      const pkgRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/package.json`);
      if (pkgRes.ok) {
        try {
          const pkg = await pkgRes.json();
          const deps = { ...pkg.dependencies, ...pkg.devDependencies };
          if (deps['react']) techStack.push('React');
          if (deps['next']) techStack.push('Next.js');
          if (deps['express']) techStack.push('Express');
          if (deps['typescript']) techStack.push('TypeScript');
          if (deps['vite']) techStack.push('Vite');
          if (deps['tailwindcss']) techStack.push('Tailwind CSS');
        } catch (e) { }
      }

      sendEvent({ step: 3, message: "Building knowledge graph (Fetching File Tree)..." });
      // 4. Fetch File Tree (up to some depth)
      const treeRes = await fetchGithub(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
      let treePaths: string[] = [];
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        // keep only interesting files, ignore node_modules, .git, etc
        treePaths = (treeData.tree || [])
          .map((t: any) => t.path)
          .filter((p: string) => !p.includes('node_modules') && !p.includes('.git') && !p.includes('dist') && !p.includes('build'))
          .slice(0, 1000); // Take up to 1000 files to avoid exceeding limits
      }

      sendEvent({ step: 4, message: "Generating business analysis and AI Mentor Data..." });

      // 5. Ask DeepSeek to generate the analysis
      const systemInstruction = `You are an expert AI software architect, senior engineer, and business analyst.
Your task is to analyze a GitHub repository based on its README, tech stack, and file tree.
You must output a highly structured JSON object that completely replaces our mock data for this application.

Ensure the "architecture" field is directly renderable using Mermaid flowchart syntax.
CRITICAL Mermaid rules:
- Node IDs must be simple alphanumeric with underscores only (no spaces, no special chars). Example: UserService NOT "User Service"
- Arrow labels with | must be in double-quoted labels: A["label with | pipe"] --> B
- Avoid special chars in labels; if needed, wrap label in ["..."] and escape | as \\|
- Keep it simple: nodes, arrows, and minimal text
All fields are required. Keep descriptions concise, "brutalist", and professional.

IMPORTANT: You must respond with ONLY valid JSON, no markdown code blocks, no explanation, no text before or after the JSON.`;

      const prompt = `Repository: ${owner}/${repo}
Description: ${repoData.description || "N/A"}
Tech Stack: ${techStack.join(', ')}

README snippet:
${readmeStr.substring(0, 3000)}

File Tree snippet:
${treePaths.join('\n').substring(0, 5000)}

You must respond with valid JSON matching this schema:
{
  "summary": {
    "summary": "<what the project does>",
    "targetUser": "<who this is for>",
    "coreFunctionality": "<core features>",
    "entryFile": "<main entry file path>",
    "dataFlow": "<request to response flow description>",
    "startHere": ["<list of files to start reading>"]
  },
  "fileTree": [
    {
      "path": "<top-level path>",
      "type": "file or directory",
      "explanation": "<what this is>",
      "importance": "high, medium, or low"
    }
  ],
  "modules": [
    {
      "id": "<short-id>",
      "name": "<module name>",
      "files": "<file paths>",
      "responsibility": "<what it does>",
      "why": "<why it matters>",
      "suggestion": "<learning direction>"
    }
  ],
  "lessons": [
    {
      "id": "<lesson-id>",
      "title": "<lesson title>",
      "goal": "<learning goal>",
      "files": ["<files to read>"],
      "why": "<why learn this>",
      "focus": "<what to focus on>",
      "questions": ["<check questions>"],
      "exercise": "<exercise description>"
    }
  ],
  "architecture": "<raw mermaid syntax, no markdown code blocks>",
  "business": {
    "positioning": "<elevator pitch>",
    "problems": "<problems solved>",
    "users": "<target users>",
    "painPoints": "<user pain points>",
    "coreValue": "<core value proposition>",
    "competitors": [
      {
        "name": "<competitor name>",
        "edge": "<our competitive advantage>"
      }
    ],
    "model": "<business model>",
    "mvp": "<minimum viable product>",
    "growth": "<growth strategy>",
    "risks": "<business risks>",
    "future": "<future direction>"
  }
}`;

      const response = await generateWithRetry({
        model: "deepseek-v4-pro",
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 8192,
      });

      sendEvent({ step: 5, message: "Validating AI response..." });

      const analysisRaw = response.choices[0]?.message?.content;
      if (!analysisRaw) {
        throw new Error("Failed to generate analysis from AI.");
      }

      // Strip markdown code blocks if any
      let cleanJson = analysisRaw.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      }

      const generatedData = JSON.parse(cleanJson);

      // add project info base
      const fullResponse = {
        project: {
          id: repo,
          name: repo,
          owner: owner,
          url: url,
          description: repoData.description || "",
          techStack,
          defaultBranch,
          analyzedAt: new Date().toLocaleDateString(),
        },
        ...generatedData
      };

      sendEvent({ step: 6, message: "Done", data: fullResponse });
      res.end();

    } catch (error: any) {
      console.error(error);
      sendEvent({ error: error.message || "Failed to analyze repository." });
      res.end();
    }
  });

  app.post('/api/tutor', async (req, res) => {
    try {
      const { question, context, history } = req.body;
      if (!question) return res.status(400).json({ error: "Question is required" });

      const systemInstruction = `You are a senior AI mentor explaining a software repository.
Provide concise, direct answers focusing on guiding the user in code comprehension.`;

      const messages: any[] = [
        { role: 'system', content: systemInstruction }
      ];

      // Add conversation history
      if (history && Array.isArray(history) && history.length > 0) {
        history.forEach((h: any) => {
          if (h.q) messages.push({ role: 'user', content: h.q });
          if (h.a) messages.push({ role: 'assistant', content: h.a });
        });
      }

      // Add current context
      const contextPrompt = context
        ? `Context of what the user is currently reading/learning:\n${context}\n\n`
        : '';

      messages.push({
        role: 'user',
        content: `${contextPrompt}User Question:\n${question}`
      });

      const response = await generateWithRetry({
        model: "deepseek-v4-pro",
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      });

      res.json({ answer: response.choices[0]?.message?.content || "No response" });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to get tutor answer." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();