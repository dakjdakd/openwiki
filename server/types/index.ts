// =====================
// Evidence Types
// =====================

export interface SampledFile {
  path: string;
  reason: string;
  chars: number;
}

export interface SkippedFile {
  path: string;
  reason: string;
}

export interface AnalysisEvidence {
  sampledFiles: SampledFile[];
  skippedFiles: SkippedFile[];
}

// =====================
// Core Data Types
// =====================

export interface Project {
  id: string; // repo name
  name: string;
  owner: string;
  url: string;
  description: string;
  techStack: string[];
  defaultBranch: string;
  analyzedAt: string;
}

export interface Summary {
  summary: string;
  targetUser: string;
  coreFunctionality: string;
  entryFile: string;
  dataFlow: string;
  startHere: string[];
}

export interface TreeNode {
  path: string;
  type: 'file' | 'directory';
  explanation: string;
  importance: 'high' | 'medium' | 'low';
  children?: TreeNode[];
}

export interface Module {
  id: string;
  name: string;
  files: string;
  responsibility: string;
  why: string;
  suggestion: string;
}

export interface Lesson {
  id: string;
  title: string;
  goal: string;
  files: string[];
  why: string;
  focus: string;
  questions: string[];
  exercise: string;
}

export interface Competitor {
  name: string;
  edge: string;
}

export interface Business {
  positioning: string;
  problems: string;
  users: string;
  painPoints: string;
  coreValue: string;
  competitors: Competitor[];
  model: string;
  mvp: string;
  growth: string;
  risks: string;
  future: string;
}

export interface WorkspaceData {
  project: Project;
  summary: Summary;
  fileTree: TreeNode[];
  modules: Module[];
  lessons: Lesson[];
  architecture: string;
  business: Business;
  analysisEvidence: AnalysisEvidence;
}

// =====================
// API / SSE Types
// =====================

export type AnalysisStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface SSEStepEvent {
  step: AnalysisStep;
  message: string;
}

export interface SSEDataEvent {
  step: 7;
  data: WorkspaceData;
}

export interface SSEErrorEvent {
  error: string;
}

export type SSEEvent = SSEStepEvent | SSEDataEvent | SSEErrorEvent;

export type ProjectStatus = 'pending' | 'completed' | 'failed';

// =====================
// Store Types
// =====================

export interface ProjectRecord {
  id: string;
  status: ProjectStatus;
  step: number;
  data?: WorkspaceData;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================
// AI / Analyzer Types
// =====================

export interface AnalyzerContext {
  owner: string;
  repo: string;
  defaultBranch: string;
  repoData: any; // raw GitHub repo response
  readme: string;
  techStack: string[];
  treePaths: string[];
  analysisEvidence: AnalysisEvidence;
}

export interface TutorRequest {
  question: string;
  context: string;
  history: Array<{ q: string; a: string }>;
}