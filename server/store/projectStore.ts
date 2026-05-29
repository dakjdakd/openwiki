import type { ProjectRecord, WorkspaceData, ProjectStatus } from '../types/index.js';

// In-memory store: project id -> ProjectRecord
const store = new Map<string, ProjectRecord>();

export function createProject(id: string): ProjectRecord {
  const now = new Date().toISOString();
  const record: ProjectRecord = {
    id,
    status: 'pending',
    step: 0,
    createdAt: now,
    updatedAt: now,
  };
  store.set(id, record);
  return record;
}

export function getProject(id: string): ProjectRecord | undefined {
  return store.get(id);
}

export function updateProject(
  id: string,
  patch: Partial<Pick<ProjectRecord, 'status' | 'step' | 'data' | 'error'>>
): ProjectRecord | undefined {
  const record = store.get(id);
  if (!record) return undefined;
  const updated: ProjectRecord = {
    ...record,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.set(id, updated);
  return updated;
}

export function setProjectData(id: string, data: WorkspaceData): void {
  updateProject(id, { status: 'completed', step: 7, data, error: undefined });
}

export function setProjectError(id: string, error: string): void {
  updateProject(id, { status: 'failed', error });
}

export function getProjectStatus(id: string): ProjectStatus | undefined {
  return store.get(id)?.status;
}

export function getProjectData(id: string): WorkspaceData | undefined {
  return store.get(id)?.data;
}

export function isProjectCompleted(id: string): boolean {
  return store.get(id)?.status === 'completed';
}

export function listProjects(): ProjectRecord[] {
  return Array.from(store.values());
}