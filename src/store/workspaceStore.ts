import { create } from 'zustand';

interface WorkspaceState {
  project: any;
  summary: any;
  fileTree: any[];
  modules: any[];
  lessons: any[];
  architecture: string;
  business: any;
  setWorkspaceData: (data: any) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  activeContext: string;
  setActiveContext: (context: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  project: null,
  summary: null,
  fileTree: [],
  modules: [],
  lessons: [],
  architecture: '',
  business: null,
  isLoading: false,
  error: null,
  activeContext: 'General Overview',
  setWorkspaceData: (data) => set({
    project: data.project,
    summary: data.summary,
    fileTree: data.fileTree,
    modules: data.modules,
    lessons: data.lessons,
    architecture: data.architecture,
    business: data.business,
  }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setActiveContext: (activeContext) => set({ activeContext }),
}));
