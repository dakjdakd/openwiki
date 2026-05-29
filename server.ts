import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function generateWithRetry(params: any, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const errStr = String(error) + JSON.stringify(error);
      const isUnavailable = error?.status === 503 || error?.status === 'UNAVAILABLE' || errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE') || error?.error?.code === 503 || error?.status === 429 || errStr.includes('429');
      if (isUnavailable && attempt < maxRetries) {
        const delay = attempt * 3000;
        console.warn(`Gemini API Unavailable, retrying in ${delay}ms... (Attempt ${attempt} of ${maxRetries})`);
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

      // 5. Ask Gemini 3.5 Flash to generate the analysis
      const systemInstruction = `
You are an expert AI software architect, senior engineer, and business analyst.
Your task is to analyze a GitHub repository based on its README, tech stack, and file tree.
You must output a highly structured JSON object that completely replaces our mock data for this application.

Ensure the "architecture" field is directly renderable using Mermaid syntax (flowchart TD).
All fields are required. Keep descriptions concise, "brutalist", and professional.
      `;

      const prompt = `
Repository: ${owner}/${repo}
Description: ${repoData.description || "N/A"}
Tech Stack: ${techStack.join(', ')}

README snippet:
${readmeStr.substring(0, 3000)}

File Tree snippet:
${treePaths.join('\n').substring(0, 5000)}

Respond with the exact JSON structure specified by the schema.
      `;

      const response = await generateWithRetry({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  targetUser: { type: Type.STRING },
                  coreFunctionality: { type: Type.STRING },
                  entryFile: { type: Type.STRING },
                  dataFlow: { type: Type.STRING },
                  startHere: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["summary", "targetUser", "coreFunctionality", "entryFile", "dataFlow", "startHere"]
              },
              fileTree: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: { type: Type.STRING },
                    type: { type: Type.STRING, description: "'file' or 'directory'" },
                    explanation: { type: Type.STRING },
                    importance: { type: Type.STRING, description: "'high', 'medium', or 'low'" }
                  },
                  required: ["path", "type", "explanation", "importance"]
                },
                description: "Return a top-level summary of the file tree. Limit to 5-10 key items, representing top-level folders or important config files. DON'T nest children for this."
              },
              modules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    files: { type: Type.STRING },
                    responsibility: { type: Type.STRING },
                    why: { type: Type.STRING },
                    suggestion: { type: Type.STRING }
                  },
                  required: ["id", "name", "files", "responsibility", "why", "suggestion"]
                }
              },
              lessons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    goal: { type: Type.STRING },
                    files: { type: Type.ARRAY, items: { type: Type.STRING } },
                    why: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    questions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    exercise: { type: Type.STRING }
                  },
                  required: ["id", "title", "goal", "files", "why", "focus", "questions", "exercise"]
                }
              },
              architecture: { type: Type.STRING, description: "A raw mermaid syntax string for the architecture diagram (no markdown code blocks, just raw syntax)." },
              business: {
                type: Type.OBJECT,
                properties: {
                  positioning: { type: Type.STRING },
                  problems: { type: Type.STRING },
                  users: { type: Type.STRING },
                  painPoints: { type: Type.STRING },
                  coreValue: { type: Type.STRING },
                  competitors: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        edge: { type: Type.STRING }
                      },
                      required: ["name", "edge"]
                    }
                  },
                  model: { type: Type.STRING },
                  mvp: { type: Type.STRING },
                  growth: { type: Type.STRING },
                  risks: { type: Type.STRING },
                  future: { type: Type.STRING }
                },
                required: ["positioning", "problems", "users", "painPoints", "coreValue", "competitors", "model", "mvp", "growth", "risks", "future"]
              }
            },
            required: ["summary", "fileTree", "modules", "lessons", "architecture", "business"]
          }
        }
      });

      sendEvent({ step: 5, message: "Validating AI response..." });

      const analysisRaw = response.text;
      if (!analysisRaw) {
        throw new Error("Failed to generate analysis from AI.");
      }

      const generatedData = JSON.parse(analysisRaw);

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

      const prompt = `
You are a senior AI mentor explaining a software repository.
Context of what the user is currently reading/learning:
${context || 'General understanding'}

Prior conversation history (if any):
${JSON.stringify(history)}

User Question:
${question}

Provide a concise, direct answer focusing on guiding the user in code comprehension.
`;

      const response = await generateWithRetry({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ answer: response.text });
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
    const distPath = path.join(process.cwd(), 'dist');
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
