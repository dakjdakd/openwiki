import React from 'react';
import { BookOpen, Bot, Boxes, GitBranch, MessageSquare, Network, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';

const repoStats = [
  ['FILES', '184'],
  ['MODULES', '12'],
  ['LESSONS', '07'],
];

const treeRows = [
  ['src/app', 'Core routes'],
  ['server/services', 'AI pipeline'],
  ['store/workspace', 'Analysis state'],
  ['components/ui', 'Reusable surface'],
];

const roadmap = [
  ['01', 'Trace entry points', 'README, package.json, src/main.tsx'],
  ['02', 'Understand data flow', 'API routes, analyzer, workspace store'],
  ['03', 'Change one feature', 'Architecture view and tutor context'],
];

export function DemoPreview() {
  return (
    <section className="py-32 px-4 md:px-8 max-w-[95vw] mx-auto border-t-2 border-[#3F3F46]">
      <div className="flex flex-col md:flex-row gap-12 items-end mb-16">
        <h2 className="text-5xl md:text-[clamp(3rem,6vw,6rem)] font-bold uppercase tracking-tighter leading-[0.9]">
          Platform <br />Preview
        </h2>
        <p className="text-xl text-[#A1A1AA] max-w-xl uppercase tracking-wide">
          A comprehensive suite of tools designed to dissect and demystify any GitHub repository.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="aspect-[4/3] relative overflow-hidden group p-0 border-2 border-[#3F3F46] flex flex-col">
          <div className="p-5 md:p-6 border-b-2 border-[#3F3F46] bg-[#27272A] flex items-center justify-between gap-4">
            <span className="text-xl md:text-2xl font-bold uppercase tracking-tighter text-[#FAFAFA] group-hover:text-[#DFE104] transition-colors">Repo Dashboard</span>
            <Boxes className="text-[#DFE104] shrink-0" size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1 bg-[#09090B] p-5 md:p-8 flex flex-col gap-5 min-h-0">
            <div className="grid grid-cols-3 gap-3">
              {repoStats.map(([label, value]) => (
                <div key={label} className="border-2 border-[#3F3F46] bg-[#111113] p-3 md:p-4">
                  <div className="text-[10px] md:text-xs text-[#A1A1AA] font-bold uppercase tracking-widest">{label}</div>
                  <div className="text-2xl md:text-4xl font-bold text-[#DFE104] leading-none mt-2">{value}</div>
                </div>
              ))}
            </div>
            <div className="border-2 border-[#3F3F46] bg-[#111113] flex-1 min-h-0 p-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-[#3F3F46] pb-3 mb-3">
                <span className="text-sm md:text-base font-bold uppercase">openwiki/openwiki</span>
                <span className="text-[10px] md:text-xs text-[#DFE104] font-bold uppercase tracking-widest">React + Express</span>
              </div>
              <div className="space-y-2 overflow-hidden">
                {treeRows.map(([path, note], index) => (
                  <div key={path} className="grid grid-cols-[1fr_auto] gap-3 items-center text-xs md:text-sm">
                    <span className="font-mono text-[#FAFAFA] truncate">
                      <span className="text-[#71717A] mr-2">{String(index + 1).padStart(2, '0')}</span>{path}
                    </span>
                    <span className="text-[#A1A1AA] uppercase text-[10px] md:text-xs truncate">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Card className="aspect-[4/3] relative overflow-hidden group p-0 border-2 border-[#3F3F46] flex flex-col">
          <div className="p-5 md:p-6 border-b-2 border-[#3F3F46] bg-[#27272A] flex items-center justify-between gap-4">
            <span className="text-xl md:text-2xl font-bold uppercase tracking-tighter text-[#FAFAFA] group-hover:text-[#DFE104] transition-colors">Architecture Map</span>
            <Network className="text-[#DFE104] shrink-0" size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1 bg-[#09090B] p-5 md:p-8 min-h-0">
            <div className="relative w-full h-full border-2 border-[#3F3F46] bg-[#111113] overflow-hidden">
              <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-[#3F3F46]" />
              <div className="absolute inset-y-0 left-1/2 border-l-2 border-dashed border-[#3F3F46]" />
              <div className="absolute left-[8%] top-[12%] w-[34%] border-2 border-[#DFE104] bg-[#09090B] p-3">
                <div className="text-xs text-[#DFE104] font-bold uppercase">Client</div>
                <div className="text-sm md:text-base font-bold uppercase truncate">React Router</div>
              </div>
              <div className="absolute right-[8%] top-[12%] w-[34%] border-2 border-[#3F3F46] bg-[#09090B] p-3">
                <div className="text-xs text-[#A1A1AA] font-bold uppercase">State</div>
                <div className="text-sm md:text-base font-bold uppercase truncate">Zustand Store</div>
              </div>
              <div className="absolute left-[8%] bottom-[12%] w-[34%] border-2 border-[#3F3F46] bg-[#09090B] p-3">
                <div className="text-xs text-[#A1A1AA] font-bold uppercase">Server</div>
                <div className="text-sm md:text-base font-bold uppercase truncate">Express API</div>
              </div>
              <div className="absolute right-[8%] bottom-[12%] w-[34%] border-2 border-[#3F3F46] bg-[#09090B] p-3">
                <div className="text-xs text-[#A1A1AA] font-bold uppercase">Model</div>
                <div className="text-sm md:text-base font-bold uppercase truncate">AI Analysis</div>
              </div>
              <GitBranch className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#DFE104] bg-[#111113] p-2 border-2 border-[#3F3F46]" size={48} />
            </div>
          </div>
        </Card>
        <Card className="aspect-[4/3] relative overflow-hidden group p-0 border-2 border-[#3F3F46] flex flex-col">
          <div className="p-5 md:p-6 border-b-2 border-[#3F3F46] bg-[#27272A] flex items-center justify-between gap-4">
            <span className="text-xl md:text-2xl font-bold uppercase tracking-tighter text-[#FAFAFA] group-hover:text-[#DFE104] transition-colors">Learning Roadmap</span>
            <BookOpen className="text-[#DFE104] shrink-0" size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1 bg-[#09090B] p-5 md:p-8 flex flex-col justify-center gap-4 min-h-0">
            {roadmap.map(([step, title, files]) => (
              <div key={step} className="grid grid-cols-[3.5rem_1fr] gap-4 items-stretch">
                <div className="border-2 border-[#DFE104] text-[#DFE104] flex items-center justify-center text-xl md:text-2xl font-bold">
                  {step}
                </div>
                <div className="border-2 border-[#3F3F46] bg-[#111113] p-3 md:p-4 min-w-0">
                  <div className="text-base md:text-xl font-bold uppercase truncate">{title}</div>
                  <div className="text-xs md:text-sm text-[#A1A1AA] font-mono truncate mt-1">{files}</div>
                </div>
              </div>
            ))}
            <div className="h-2 bg-[#27272A] border border-[#3F3F46] mt-1">
              <div className="h-full w-[68%] bg-[#DFE104]" />
            </div>
          </div>
        </Card>
        <Card className="aspect-[4/3] relative overflow-hidden group p-0 border-2 border-[#3F3F46] flex flex-col">
          <div className="p-5 md:p-6 border-b-2 border-[#3F3F46] bg-[#27272A] flex items-center justify-between gap-4">
            <span className="text-xl md:text-2xl font-bold uppercase tracking-tighter text-[#FAFAFA] group-hover:text-[#DFE104] transition-colors">AI Mentor</span>
            <Bot className="text-[#DFE104] shrink-0" size={24} strokeWidth={2.5} />
          </div>
          <div className="flex-1 bg-[#09090B] p-5 md:p-8 flex flex-col gap-4 min-h-0">
            <div className="border-2 border-[#3F3F46] bg-[#111113] p-4">
              <div className="flex items-center gap-2 text-[#DFE104] text-xs font-bold uppercase tracking-widest mb-2">
                <MessageSquare size={15} /> Current Context
              </div>
              <div className="text-sm md:text-base font-bold uppercase">Architecture / API route analysis</div>
            </div>
            <div className="border-2 border-[#3F3F46] bg-[#111113] p-4 ml-8">
              <div className="text-xs text-[#A1A1AA] uppercase tracking-widest mb-2">You</div>
              <div className="text-sm md:text-base">Where does repository data enter the app?</div>
            </div>
            <div className="border-2 border-[#DFE104] bg-[#151602] p-4 mr-8 flex-1 min-h-0">
              <div className="flex items-center gap-2 text-xs text-[#DFE104] font-bold uppercase tracking-widest mb-2">
                <Sparkles size={15} /> Mentor
              </div>
              <div className="text-sm md:text-base text-[#FAFAFA] leading-snug">
                Start at <span className="font-mono text-[#DFE104]">/api/analyze</span>, then follow the analyzer service into the workspace store.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
