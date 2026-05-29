import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CollapsibleSection = ({ title, defaultOpen = true, children }: any) => {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div className="border-2 border-[#3F3F46] bg-[#09090B] mb-4 overflow-hidden">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 bg-[#27272A] hover:bg-[#3F3F46] transition-colors"
      >
        <h3 className="text-xl font-bold uppercase tracking-tighter text-[#FAFAFA]">{title}</h3>
        <span className="text-[#DFE104]">
          {open ? <ChevronUp /> : <ChevronDown />}
        </span>
      </button>
      {open && (
        <div className="p-6 md:p-8">
          {children}
        </div>
      )}
    </div>
  );
};

export default function Business() {
  const { business, project } = useWorkspaceStore();
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(business, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!generated) {
    return (
      <div className="py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-6xl md:text-[8rem] font-bold uppercase tracking-tighter text-[#3F3F46] mb-8 leading-none">
          Business <br/> Intelligence
        </h2>
        <p className="text-xl text-[#A1A1AA] uppercase tracking-wide max-w-2xl mb-12">
          Reveal an AI-driven, commercial analysis of {project?.name}. Understand its market positioning, business model, and competitive landscape.
        </p>
        <Button size="lg" onClick={handleGenerate} disabled={loading}>
          {loading ? 'REVEALING...' : 'REVEAL ANALYSIS'}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#3F3F46] pb-8">
        <div>
          <h2 className="text-6xl font-bold uppercase tracking-tighter text-[#DFE104] mb-2 leading-none">
            Business Analysis 
          </h2>
          <p className="text-2xl text-[#FAFAFA] uppercase">{project?.name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? 'COPIED MARKDOWN' : 'COPY AS MARKDOWN'}
        </Button>
      </div>

      <div className="space-y-4">
        
        <CollapsibleSection title="Positioning & Core Value">
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest mb-2">Elevator Pitch</h4>
              <p className="text-3xl font-bold tracking-tight">{business?.positioning}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t-2 border-[#3F3F46]">
              <div>
                <h4 className="text-xs font-bold text-[#DFE104] uppercase tracking-widest mb-2">Core Value</h4>
                <p className="text-lg">{business?.coreValue}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest mb-2">Problem Solved</h4>
                <p className="text-lg text-[#A1A1AA]">{business?.problems}</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Target Audience & Pain Points" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#3F3F46] border-2 border-[#3F3F46]">
            <div className="bg-[#09090B] p-8">
               <h4 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-widest mb-4">Target Users</h4>
               <p className="text-xl">{business?.users}</p>
            </div>
            <div className="bg-[#09090B] p-8 relative overflow-hidden group">
               <span className="absolute -right-4 -bottom-8 text-[8rem] text-[#27272A] leading-none group-hover:text-transparent transition-colors font-sans pointer-events-none">
                 !
               </span>
               <h4 className="text-xs font-bold text-[#DFE104] uppercase tracking-widest mb-4 relative z-10">User Pain Points</h4>
               <p className="text-xl relative z-10">{business?.painPoints}</p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Competitive Landscape" defaultOpen={false}>
          <div className="grid grid-cols-1 gap-px bg-[#3F3F46] border-2 border-[#3F3F46]">
            {business?.competitors?.map((comp: any, idx: number) => (
              <div key={idx} className="bg-[#09090B] p-6 lg:p-8 flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-1/3">
                  <h4 className="text-3xl font-bold uppercase tracking-tighter text-[#DFE104]">{comp.name}</h4>
                </div>
                <div className="w-2/3 border-l-2 border-[#3F3F46] pl-6">
                  <p className="text-lg text-[#FAFAFA]"><span className="text-[#A1A1AA] uppercase text-sm mr-2 tracking-widest">Competitive Edge:</span> {comp.edge}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Strategy & Future" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-[#27272A] border-l-4 border-[#DFE104]">
              <h4 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest mb-3">Business Model</h4>
              <p>{business?.model}</p>
            </div>
            <div className="p-6 bg-[#27272A] border-l-4 border-[#3F3F46]">
              <h4 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest mb-3">Growth Strategy</h4>
              <p>{business?.growth}</p>
            </div>
            <div className="p-6 bg-[#27272A] border-l-4 border-[#3F3F46]">
              <h4 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest mb-3">Risks</h4>
              <p>{business?.risks}</p>
            </div>
            <div className="p-6 bg-[#27272A] border-l-4 border-[#DFE104]">
              <h4 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest mb-3">Future Direction</h4>
              <p>{business?.future}</p>
            </div>
          </div>
        </CollapsibleSection>

      </div>
    </div>
  );
}
