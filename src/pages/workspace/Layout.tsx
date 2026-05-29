import { Outlet, NavLink, useParams, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { MOCK_PROJECT } from '../../mock/data';

export default function WorkspaceLayout() {
  const { id } = useParams();
  const { project: storeProject, setWorkspaceData } = useWorkspaceStore();
  const project = storeProject || MOCK_PROJECT;
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // When accessing a real project (non-demo), fetch from backend if store is empty
  useEffect(() => {
    if (id && id !== 'demo' && !storeProject) {
      setLoading(true);
      setLoadError(false);
      fetch(`/api/project/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Project not found');
          return res.json();
        })
        .then((data) => {
          setWorkspaceData(data);
        })
        .catch(() => {
          setLoadError(true);
        })
        .finally(() => setLoading(false));
    }
  }, [id, storeProject, setWorkspaceData]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center gap-6">
        <div className="text-4xl font-bold uppercase tracking-tighter text-[#DFE104]">
          Project Not Found
        </div>
        <Link to="/" className="text-[#A1AAA] underline uppercase text-sm">
          Return to Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-2xl font-bold uppercase tracking-tighter text-[#DFE104] animate-pulse">
          Loading project...
        </div>
      </div>
    );
  }

  // Active link styling function
  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `block px-6 py-3 border-r-2 border-[#3F3F46] text-sm md:text-base font-bold uppercase tracking-tight transition-colors whitespace-nowrap ${
      isActive ? 'bg-[#DFE104] text-black' : 'hover:bg-[#27272A]'
    }`;

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col font-sans">
      <div className="noise-overlay" />
      
      {/* Header */}
      <header className="border-b-2 border-[#3F3F46] shrink-0 bg-[#09090B]">
        <div className="px-4 md:px-8 py-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4 max-w-[95vw] mx-auto border-b-2 border-[#3F3F46] pb-4">
          <div className="flex flex-col">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#A1A1AA] hover:text-[#DFE104] transition-colors w-fit mb-4 group">
              <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> Return to Home
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-1">
                {project.name}
              </h1>
              <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">
                {project.url}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 pb-1">
            <div className="flex gap-2 flex-wrap">
              {project.techStack.map((tech: string) => (
                <span key={tech} className="border border-[#3F3F46] px-2 py-0.5 text-xs uppercase tracking-widest text-[#DFE104]">
                  {tech}
                </span>
              ))}
            </div>
            <div className="text-xs text-[#A1A1AA] uppercase">
              Analysis Complete • {project.analyzedAt}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex overflow-x-auto max-w-[95vw] mx-auto border-b-0 scrollbar-hide">
          <NavLink to={`/workspace/${id}`} end className={navLinkClass}>Overview</NavLink>
          <NavLink to={`/workspace/${id}/architecture`} className={navLinkClass}>Architecture</NavLink>
          <NavLink to={`/workspace/${id}/learn`} className={navLinkClass}>Learn</NavLink>
          <NavLink to={`/workspace/${id}/business`} className={navLinkClass}>Business</NavLink>
          <NavLink to={`/workspace/${id}/report`} className={navLinkClass}>Report</NavLink>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[95vw] mx-auto flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
