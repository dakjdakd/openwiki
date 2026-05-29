import { fetchGithub, parseGitHubUrl } from './github.js';
import { generateWithRetry, ANALYSIS_SCHEMA } from './ai.js';
import { setProjectData, updateProject } from '../store/projectStore.js';
import type { WorkspaceData, AnalysisStep } from '../types/index.js';

export interface AnalysisCallbacks {
  onStep: (step: AnalysisStep, message: string) => void;
  onComplete: (data: WorkspaceData) => void;
  onError: (error: string) => void;
}

const STEP_MESSAGES: Record<number, string> = {
  0: 'Fetching repository metadata...',
  1: 'Parsing README...',
  2: 'Detecting tech stack...',
  3: 'Fetching file tree...',
  4: 'Sampling key source files...',
  5: 'Running AI analysis...',
  6: 'Validating response...',
  7: 'Finalizing data...',
};

async function fetchGithubJson<T>(url: string, label: string): Promise<T> {
  let response: Response;
  try {
    response = await fetchGithub(url);
  } catch (err: any) {
    throw new Error(`${label} request failed: ${err?.message || String(err)}`);
  }

  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function decodeBase64Content(content: string): string {
  return Buffer.from(content.replace(/\s/g, ''), 'base64').toString('utf-8');
}

function parseJsonObject(raw: string): Record<string, any> {
  const trimmed = raw.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(unfenced);
}

function normalizeAnalysisData(
  data: Record<string, any>,
  fallback: {
    repo: string;
    readme: string;
    techStack: string[];
    treePaths: string[];
  }
): Omit<WorkspaceData, 'project'> {
  const firstFile = fallback.treePaths[0] || 'README.md';
  const summarySource =
    typeof data.summary === 'string'
      ? data.summary
      : data.summary?.summary || fallback.readme.slice(0, 300) || 'Repository analysis generated.';

  return {
    summary: {
      summary: summarySource,
      targetUser: data.summary?.targetUser || 'Developers exploring this repository.',
      coreFunctionality:
        data.summary?.coreFunctionality || data.description || 'See repository README and file tree.',
      entryFile: data.summary?.entryFile || firstFile,
      dataFlow: data.summary?.dataFlow || data.dataFlow || 'Data flow is not explicit from repository metadata.',
      startHere: Array.isArray(data.summary?.startHere)
        ? data.summary.startHere
        : [firstFile, 'README.md'].filter(Boolean),
    },
    fileTree: Array.isArray(data.fileTree)
      ? data.fileTree
      : fallback.treePaths.slice(0, 20).map((path) => ({
          path,
          type: path.includes('.') ? 'file' : 'directory',
          explanation: 'Repository file detected from GitHub tree.',
          importance: path.toLowerCase().includes('readme') ? 'high' : 'medium',
        })),
    modules: Array.isArray(data.modules)
      ? data.modules
      : [
          {
            id: 'repository-overview',
            name: fallback.repo,
            files: fallback.treePaths.slice(0, 5).join(', ') || 'README.md',
            responsibility: 'Repository structure and primary project content.',
            why: 'Generated fallback module from available repository metadata.',
            suggestion: 'Inspect README and primary source files first.',
          },
        ],
    lessons: Array.isArray(data.lessons)
      ? data.lessons
      : [
          {
            id: 'repo-orientation',
            title: 'Repository Orientation',
            goal: 'Understand the project purpose and top-level structure.',
            files: [firstFile],
            why: 'These files provide the fastest entry point into the codebase.',
            focus: 'README, package metadata, and main source folders.',
            questions: ['What problem does this repository solve?', 'Where is the main entry point?'],
            exercise: 'Trace one user-facing flow from entry file to supporting modules.',
          },
        ],
    architecture:
      typeof data.architecture === 'string' && data.architecture.trim()
        ? data.architecture
        : 'flowchart TD\n  README[README] --> Code[Repository files]',
    business: {
      positioning: data.business?.positioning || 'Open source repository.',
      problems: data.business?.problems || 'Helps users solve the problem described by the project.',
      users: data.business?.users || 'Developers and technical evaluators.',
      painPoints: data.business?.painPoints || 'Understanding project structure and adoption fit.',
      coreValue: data.business?.coreValue || 'Provides reusable code or documentation.',
      competitors: Array.isArray(data.business?.competitors) ? data.business.competitors : [],
      model: data.business?.model || 'Open source or repository-driven distribution.',
      mvp: data.business?.mvp || 'Validate core functionality from README and source files.',
      growth: data.business?.growth || 'Improve documentation, examples, and integrations.',
      risks: data.business?.risks || 'Incomplete metadata may limit analysis precision.',
      future: data.business?.future || 'Expand capabilities based on user needs.',
    },
    // analysisEvidence is injected by the caller (runAnalysis) from sampled file data
    analysisEvidence: { sampledFiles: [], skippedFiles: [] },
  };
}

async function fetchRepoFile(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const encodedBranch = encodeURIComponent(branch);
  const response = await fetchGithub(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodedBranch}`
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub file fetch failed for ${path}: ${response.status} ${response.statusText}`);
  }

  const file = await response.json();
  if (file?.encoding !== 'base64' || typeof file?.content !== 'string') {
    return null;
  }

  return decodeBase64Content(file.content);
}

// Exclude patterns — files not worth sampling
const EXCLUDE_PATTERNS = [
  'node_modules', 'dist', 'build', '.git', '__pycache__', '.venv',
  '.cache', '.next', '.nuxt', '.svelte-kit',
];
const EXCLUDE_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.bmp',
  '.mp3', '.mp4', '.webm', '.wav', '.ogg',
  '.ttf', '.otf', '.woff', '.woff2', '.eot',
  '.zip', '.tar', '.gz', '.rar', '.7z',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.lock', '.log', '.tmp', '.temp',
]);
const LARGE_PATH_THRESHOLD = 200; // skip files with paths longer than this

function isExcluded(path: string): boolean {
  const lower = path.toLowerCase();
  for (const pattern of EXCLUDE_PATTERNS) {
    if (lower.includes(pattern)) return true;
  }
  const ext = lower.includes('.') ? '.' + lower.split('.').pop() : '';
  if (EXCLUDE_EXTENSIONS.has(ext)) return true;
  if (path.length > LARGE_PATH_THRESHOLD) return true;
  return false;
}

/**
 * Score a file path for sampling priority. Higher = more important.
 */
function scoreFilePath(path: string): number {
  const lower = path.toLowerCase();
  let score = 0;

  // Priority 1: README
  if (lower === 'readme.md' || lower === 'readme') score += 100;
  // Priority 2: package.json
  if (lower === 'package.json') score += 90;
  if (lower === 'package-lock.json' || lower === 'yarn.lock') score -= 50;
  // Priority 3: main entry points
  if (/\bsrc\/main\./.test(path)) score += 80;
  if (/\bsrc\/index\./.test(path)) score += 75;
  if (/\bsrc\/app\./.test(path)) score += 75;
  if (/\bsrc\/App\./.test(path)) score += 75;
  if (/\bserver\/index\./.test(path)) score += 70;
  if (/\bserver\.ts/.test(path)) score += 70;
  if (/\bapp\.ts/.test(path)) score += 70;
  if (/\bmain\.ts/.test(path)) score += 65;
  if (/\bmain\.js/.test(path)) score += 65;
  if (/\bindex\.ts/.test(path)) score += 60;
  if (/\bindex\.js/.test(path)) score += 60;
  // Priority 4: business logic
  if (/\broutes\//.test(path)) score += 50;
  if (/\bapi\//.test(path)) score += 50;
  if (/\bservices\//.test(path)) score += 50;
  if (/\bstore\//.test(path)) score += 50;
  if (/\bstores\//.test(path)) score += 50;
  if (/\bpages\//.test(path)) score += 45;
  if (/\bcontrollers?\//.test(path)) score += 50;
  if (/\bhandlers?\//.test(path)) score += 45;
  if (/\bmodels?\//.test(path)) score += 45;
  if (/\bmiddleware/.test(path)) score += 45;
  // Priority 5: components
  if (/\bcomponents?\//.test(path)) score += 35;
  if (/\bcomponents?\//.test(path) && /\.tsx?/.test(path)) score += 5;
  // Priority 6: config files
  if (/vite\.config\./.test(path)) score += 30;
  if (/next\.config\./.test(path)) score += 30;
  if (/nuxt\.config\./.test(path)) score += 30;
  if (/tsconfig\.json/.test(path)) score += 25;
  if (/webpack\.config\./.test(path)) score += 25;
  if (/rollup\.config\./.test(path)) score += 25;
  if (/eslint/.test(path)) score += 10;
  if (/prettier/.test(path)) score += 10;
  if (/\.env/.test(path)) score -= 30; // usually empty or irrelevant
  // Priority 7: src/ top-level files
  if (/^src\/[^/]+$/.test(path)) score += 20;
  if (/\bsrc\//.test(path)) score += 15;
  // Priority 8: test files — lower
  if (/\b(test|spec|__tests?__)\//.test(path)) score -= 20;
  if (/\.(test|spec)\./.test(path)) score -= 20;
  // Priority 9: docs
  if (/\bdocs?\//.test(path)) score -= 10;
  if (/\.md$/.test(path) && !lower.includes('readme')) score -= 5;

  return score;
}

/**
 * Select up to 18 key files from a list of paths using heuristic scoring.
 */
function selectKeyFiles(paths: string[]): string[] {
  const candidates = paths.filter(p => !isExcluded(p));
  const scored = candidates.map(p => ({ path: p, score: scoreFilePath(p) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 18).map(s => s.path);
}

interface SampledFileResult {
  path: string;
  reason: string;
  content: string;
  chars: number;
}

interface FetchKeyFilesResult {
  sampled: SampledFileResult[];
  skipped: { path: string; reason: string }[];
}

const MAX_TOTAL_CHARS = 25000;
const MAX_FILE_CHARS = 4000;

/**
 * Fetch content of selected files via GitHub Contents API.
 * Stops early if total chars approach limit. Single failures are skipped.
 * Throws only on rate-limit or repo-not-found.
 */
async function fetchKeyFiles(
  filePaths: string[],
  owner: string,
  repo: string,
  branch: string
): Promise<FetchKeyFilesResult> {
  const sampled: SampledFileResult[] = [];
  const skipped: { path: string; reason: string }[] = [];
  let totalChars = 0;

  for (const filePath of filePaths) {
    // Stop if we're close to the limit
    if (totalChars >= MAX_TOTAL_CHARS - MAX_FILE_CHARS) break;

    const reason = explainSelection(filePath);

    try {
      const content = await fetchRepoFile(owner, repo, filePath, branch);
      if (content === null) {
        skipped.push({ path: filePath, reason: 'empty or non-text file' });
        continue;
      }

      const truncated = content.slice(0, MAX_FILE_CHARS);
      totalChars += truncated.length;
      sampled.push({ path: filePath, reason, content: truncated, chars: truncated.length });
    } catch (err: any) {
      const status = err?.message?.match(/\d{3}/)?.[0];
      if (status === '403' || status === '429') {
        // Rate limit — abort the whole sampling phase
        throw new Error(`GitHub API rate limit exceeded while sampling. Try adding a GITHUB_TOKEN. (${status})`);
      }
      if (status === '404') {
        skipped.push({ path: filePath, reason: 'file not found' });
        continue;
      }
      // Other errors — skip individual file
      skipped.push({ path: filePath, reason: err?.message || 'fetch failed' });
    }
  }

  return { sampled, skipped };
}

/**
 * Human-readable reason for why a file was selected.
 */
function explainSelection(path: string): string {
  const lower = path.toLowerCase();
  if (lower === 'readme.md' || lower === 'readme') return 'entry point';
  if (lower === 'package.json') return 'package manifest';
  if (/\bsrc\/main\./.test(path)) return 'main entry';
  if (/\bsrc\/index\./.test(path)) return 'src index';
  if (/\bsrc\/app\./.test(path)) return 'app entry';
  if (/\bsrc\/App\./.test(path)) return 'App component';
  if (/\bserver\/index\./.test(path)) return 'server entry';
  if (/server\.ts/.test(path)) return 'server root';
  if (/app\.ts/.test(path)) return 'app root';
  if (/\broutes\//.test(path)) return 'API route';
  if (/\bapi\//.test(path)) return 'API layer';
  if (/\bservices\//.test(path)) return 'service layer';
  if (/\bstore\//.test(path)) return 'state management';
  if (/\bstores\//.test(path)) return 'state management';
  if (/\bpages\//.test(path)) return 'page/route';
  if (/\bcontrollers?\//.test(path)) return 'controller';
  if (/\bhandlers?\//.test(path)) return 'handler';
  if (/\bmodels?\//.test(path)) return 'data model';
  if (/\bmiddleware/.test(path)) return 'middleware';
  if (/\bcomponents?\//.test(path)) return 'component';
  if (/vite\.config\./.test(path)) return 'Vite config';
  if (/next\.config\./.test(path)) return 'Next.js config';
  if (/tsconfig\.json/.test(path)) return 'TypeScript config';
  if (/\bsrc\//.test(path)) return 'source file';
  return 'representative file';
}

export async function runAnalysis(
  url: string,
  callbacks: AnalysisCallbacks
): Promise<void> {
  const { onStep, onComplete, onError } = callbacks;

  try {
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      onError('Invalid GitHub URL');
      return;
    }
    const { owner, repo } = parsed;

    onStep(0, STEP_MESSAGES[0]);

    // Step 1: Fetch repo metadata
    const repoData = await fetchGithubJson<any>(
      `https://api.github.com/repos/${owner}/${repo}`,
      'GitHub repository metadata'
    );
    const defaultBranch = repoData.default_branch || 'main';

    onStep(1, STEP_MESSAGES[1]);

    // Step 2: Fetch README
    const readmeStr =
      (await fetchRepoFile(owner, repo, 'README.md', defaultBranch)) ||
      (await fetchRepoFile(owner, repo, 'readme.md', defaultBranch)) ||
      'No README found.';

    onStep(2, STEP_MESSAGES[2]);

    // Step 3: Detect tech stack
    let techStack: string[] = [repoData.language].filter(Boolean);
    const pkgStr = await fetchRepoFile(owner, repo, 'package.json', defaultBranch);
    if (pkgStr) {
      try {
        const pkg = JSON.parse(pkgStr);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps['react']) techStack.push('React');
        if (deps['next']) techStack.push('Next.js');
        if (deps['express']) techStack.push('Express');
        if (deps['typescript']) techStack.push('TypeScript');
        if (deps['vite']) techStack.push('Vite');
        if (deps['tailwindcss']) techStack.push('Tailwind CSS');
        if (deps['vue']) techStack.push('Vue');
        if (deps['nuxt']) techStack.push('Nuxt');
        if (deps['angular']) techStack.push('Angular');
        if (deps['svelte']) techStack.push('Svelte');
      } catch (_) {
        /* ignore parse errors */
      }
    }

    onStep(3, STEP_MESSAGES[3]);

    // Step 4: Fetch file tree
    let treePaths: string[] = [];
    const treeData = await fetchGithubJson<any>(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
      'GitHub repository tree'
    );
    treePaths = (treeData.tree || [])
      .map((t: any) => t.path)
      .filter(
        (p: string) =>
          !p.includes('node_modules') &&
          !p.includes('.git') &&
          !p.includes('dist') &&
          !p.includes('build') &&
          !p.includes('__pycache__') &&
          !p.includes('.venv')
      )
      .slice(0, 1000);

    onStep(4, STEP_MESSAGES[4]);

    // Step 5: Sample key source files
    let sampledFiles: SampledFileResult[] = [];
    let skippedFiles: { path: string; reason: string }[] = [];
    try {
      const keyFiles = selectKeyFiles(treePaths);
      const fetchResult = await fetchKeyFiles(keyFiles, owner, repo, defaultBranch);
      sampledFiles = fetchResult.sampled;
      skippedFiles = fetchResult.skipped;
    } catch (err: any) {
      console.warn('Source file sampling failed, continuing without it:', err?.message);
      // Not fatal — skip sampling entirely
    }

    onStep(5, STEP_MESSAGES[5]);
    const systemInstruction = `
You are an expert AI software architect, senior engineer, and business analyst.
Your task is to analyze a GitHub repository based on its README, tech stack, and file tree.
You must output a highly structured JSON object.

Ensure the "architecture" field is directly renderable using Mermaid syntax (flowchart TD).
All fields are required. Keep descriptions concise, "brutalist", and professional.
IMPORTANT: Base your analysis on the sampled source files and file tree, NOT on guesses.
Return JSON only, with no markdown.
    `.trim();

    const sampledFilesSection = sampledFiles.length > 0
      ? `\nSampled Source Files (evidence — do NOT guess, base your analysis on this):\n${sampledFiles.map(f => `--- ${f.path} ---\n${f.content}`).join('\n\n')}`
      : '';

    const prompt = `
Repository: ${owner}/${repo}
Description: ${repoData.description || 'N/A'}
Tech Stack: ${techStack.join(', ')}${sampledFilesSection}

README snippet:
${readmeStr.substring(0, 3000)}

File Tree snippet (first 500 files):
${treePaths.join('\n').substring(0, 5000)}

IMPORTANT: Do NOT rely solely on README. Analyze based on the sampled source files and file tree above.
If information is insufficient to determine something, say "Insufficient data" instead of guessing.

Return a JSON object matching this exact shape:
${JSON.stringify(ANALYSIS_SCHEMA)}
    `.trim();

    const response = await generateWithRetry({
      model: 'deepseek-v4-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    onStep(6, STEP_MESSAGES[6]);

    const analysisRaw = response.text;
    if (!analysisRaw) {
      throw new Error('Failed to generate analysis from AI');
    }

    const generatedData = normalizeAnalysisData(parseJsonObject(analysisRaw), {
      repo,
      readme: readmeStr,
      techStack,
      treePaths,
    });

    const fullResponse: WorkspaceData = {
      project: {
        id: repo,
        name: repo,
        owner: owner,
        url: url,
        description: repoData.description || '',
        techStack,
        defaultBranch,
        analyzedAt: new Date().toLocaleDateString(),
      },
      ...generatedData,
      analysisEvidence: {
        sampledFiles: sampledFiles.map(f => ({
          path: f.path,
          reason: f.reason,
          chars: f.chars,
        })),
        skippedFiles,
      },
    };

    onStep(7, STEP_MESSAGES[7]);

    // Persist to store
    setProjectData(repo, fullResponse);

    onComplete(fullResponse);
  } catch (err: any) {
    const message = err?.message || 'Failed to analyze repository';
    console.error('Repository analysis failed:', {
      url,
      message,
      cause: err?.cause?.message,
      stack: err?.stack,
    });
    onError(message);
  }
}
