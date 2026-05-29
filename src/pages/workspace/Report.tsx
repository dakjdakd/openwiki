import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useWorkspaceStore } from '../../store/workspaceStore';

export default function Report() {
  const { project, summary, business } = useWorkspaceStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("# " + project?.name + " Report");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    alert("PDF Download will be available in the next phase.");
  };

  return (
    <div className="py-8 max-w-4xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#3F3F46] pb-8 mb-12">
        <div>
          <h2 className="text-6xl font-bold uppercase tracking-tighter text-[#DFE104] mb-2 leading-none">
            Final Report
          </h2>
          <p className="text-xl text-[#A1A1AA] uppercase tracking-widest">{project?.name}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? 'COPIED' : 'COPY MARKDOWN'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownload}>
            DOWNLOAD PDF
          </Button>
        </div>
      </div>

      <div className="bg-[#FAFAFA] text-[#09090B] p-8 md:p-16 border-2 border-[#3F3F46] shadow-[16px_16px_0px_0px_#3F3F46]">
        
        {/* Cover */}
        <div className="text-center py-20 border-b-4 border-black mb-12 relative overflow-hidden">
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[12rem] font-bold text-black/5 select-none pointer-events-none tracking-tighter">
            REPORT
          </span>
          <h1 className="text-7xl font-bold uppercase tracking-tighter mb-4 relative z-10">{project?.name}</h1>
          <p className="text-2xl font-medium tracking-tight relative z-10">{project?.description}</p>
          <p className="font-mono text-sm mt-8 relative z-10">{project?.url}</p>
          <p className="font-mono text-sm mt-2 text-black/50 relative z-10">Generated on {project?.analyzedAt}</p>
        </div>

        {/* Content */}
        <div className="space-y-16 section-prose">
          <section>
            <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4 pb-2 border-b-2 border-black">1. Technical Overview</h2>
            <div className="space-y-4">
              <p><strong>Tech Stack:</strong> {project?.techStack?.join(', ')}</p>
              <p><strong>Summary:</strong> {summary?.summary}</p>
              <p><strong>Core Functionality:</strong> {summary?.coreFunctionality}</p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4 pb-2 border-b-2 border-black">2. Architecture & Flow</h2>
            <div className="space-y-4">
              <p><strong>Entry Point:</strong> <span className="font-mono select-all bg-black/5 px-2 py-1">{summary?.entryFile}</span></p>
              <p><strong>Data Flow:</strong> {summary?.dataFlow}</p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4 pb-2 border-b-2 border-black">3. Business Analysis</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tighter mb-2">Positioning</h3>
                <p>{business?.positioning}</p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tighter mb-2 text-black/60">Target Users</h3>
                  <p>{business?.users}</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tighter mb-2 text-black/60">Problems Solved</h3>
                  <p>{business?.problems}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tighter mb-2">Growth Strategy</h3>
                <p>{business?.growth}</p>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
