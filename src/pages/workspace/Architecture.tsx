import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Button } from '../../components/ui/Button';
import { useWorkspaceStore } from '../../store/workspaceStore';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    darkMode: true,
    background: '#09090B',
    primaryColor: '#27272A',
    primaryTextColor: '#FAFAFA',
    primaryBorderColor: '#3F3F46',
    lineColor: '#DFE104',
    secondaryColor: '#3F3F46',
    tertiaryColor: '#09090B'
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
  }
});

export default function Architecture() {
  const { architecture, modules, setActiveContext } = useWorkspaceStore();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  const handleSelectModule = (mod: any) => {
    setSelectedModule(mod);
    setActiveContext(`Viewing Module: ${mod.name}\nResponsibility: ${mod.responsibility}\nFiles: ${mod.files}`);
  };

  useEffect(() => {
    if (mermaidRef.current && !loading && architecture) {
      mermaidRef.current.innerHTML = '';
      mermaid.render('architecture-diagram', architecture).then(({ svg }) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      }).catch(e => console.error("Mermaid error", e));
    }
  }, [loading, architecture]);

  const handleCopy = () => {
    navigator.clipboard.writeText(architecture || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    alert("Export functionality comes in the next phase.");
  };

  return (
    <div className="py-6 h-[800px] lg:h-[calc(100vh-10rem)] flex flex-col">
      {/* Top Toolbar */}
      <div className="flex flex-wrap gap-4 border-b-2 border-[#3F3F46] pb-6 mb-6 shrink-0">
        <Button onClick={handleCopy} variant="outline" size="sm">
          {copied ? 'COPIED' : 'COPY MERMAID'}
        </Button>
        <Button onClick={handleRegenerate} variant="ghost" size="sm" disabled={loading}>
          {loading ? 'GENERATING...' : 'REGENERATE'}
        </Button>
        <Button onClick={handleExport} variant="ghost" size="sm">
          EXPORT
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-px bg-[#3F3F46] border-2 border-[#3F3F46] overflow-hidden">
        
        {/* Left: Module List */}
        <div className="bg-[#09090B] overflow-y-auto border-r-2 border-[#3F3F46]">
          <div className="p-4 bg-[#27272A]">
            <h2 className="uppercase font-bold tracking-tighter">Architecture Modules</h2>
          </div>
          <div className="flex flex-col gap-px bg-[#3F3F46]">
            {modules?.map((mod: any) => (
              <button
                key={mod.id}
                onClick={() => handleSelectModule(mod)}
                className={`text-left p-4 uppercase transition-colors \${selectedModule?.id === mod.id ? 'bg-[#DFE104] text-black font-bold' : 'bg-[#09090B] text-[#FAFAFA] hover:bg-[#27272A]'}`}
              >
                {mod.name}
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Diagram */}
        <div className="col-span-1 lg:col-span-2 bg-[#09090B] overflow-auto p-4 flex items-center justify-center relative">
          {loading ? (
            <div className="text-[4rem] font-bold uppercase text-[#3F3F46] animate-pulse">GENERATING...</div>
          ) : (
            <div ref={mermaidRef} className="w-full h-full flex items-center justify-center" />
          )}
        </div>

        {/* Right: Inspector */}
        <div className="bg-[#09090B] overflow-y-auto border-l-2 border-[#3F3F46] p-6 lg:p-8">
          {selectedModule ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold uppercase tracking-tighter text-[#DFE104] mb-8 border-b-2 border-[#3F3F46] pb-4">
                {selectedModule.name}
              </h2>
              
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#A1A1AA] mb-2">Responsibility</h3>
                <p className="text-lg">{selectedModule.responsibility}</p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#A1A1AA] mb-2">Location</h3>
                <p className="font-mono text-sm text-[#DFE104] break-all">{selectedModule.files}</p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#A1A1AA] mb-2">Analysis</h3>
                <p className="text-sm">{selectedModule.why}</p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#A1A1AA] mb-2">Recommendation</h3>
                <p className="text-sm border-l-2 border-[#DFE104] pl-4">{selectedModule.suggestion}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#3F3F46] font-bold uppercase text-2xl text-center">
              SELECT MODULE <br/> TO INSPECT
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
