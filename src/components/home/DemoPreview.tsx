import React from 'react';
import { Card } from '../ui/Card';

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
          <div className="p-6 border-b-2 border-[#3F3F46] bg-[#27272A]">
            <span className="text-2xl font-bold uppercase tracking-tighter text-[#FAFAFA] group-hover:text-[#DFE104] transition-colors">Repo Dashboard</span>
          </div>
          <div className="flex-1 bg-[#09090B] flex items-center justify-center p-8">
            <div className="w-full h-full border-2 border-[#3F3F46] border-dashed flex items-center justify-center text-[#3F3F46] font-bold text-2xl uppercase">
              Dashboard Mockup
            </div>
          </div>
        </Card>
        <Card className="aspect-[4/3] relative overflow-hidden group p-0 border-2 border-[#3F3F46] flex flex-col">
          <div className="p-6 border-b-2 border-[#3F3F46] bg-[#27272A]">
            <span className="text-2xl font-bold uppercase tracking-tighter text-[#FAFAFA] group-hover:text-[#DFE104] transition-colors">Architecture Map</span>
          </div>
          <div className="flex-1 bg-[#09090B] flex items-center justify-center p-8">
            <div className="w-full h-full border-2 border-[#3F3F46] border-dashed flex items-center justify-center text-[#3F3F46] font-bold text-2xl uppercase">
              Mermaid Diagram
            </div>
          </div>
        </Card>
        <Card className="aspect-[4/3] relative overflow-hidden group p-0 border-2 border-[#3F3F46] flex flex-col">
          <div className="p-6 border-b-2 border-[#3F3F46] bg-[#27272A]">
            <span className="text-2xl font-bold uppercase tracking-tighter text-[#FAFAFA] group-hover:text-[#DFE104] transition-colors">Learning Roadmap</span>
          </div>
          <div className="flex-1 bg-[#09090B] flex items-center justify-center p-8">
            <div className="w-full h-full border-2 border-[#3F3F46] border-dashed flex items-center justify-center text-[#3F3F46] font-bold text-2xl uppercase">
              Roadmap Outline
            </div>
          </div>
        </Card>
        <Card className="aspect-[4/3] relative overflow-hidden group p-0 border-2 border-[#3F3F46] flex flex-col">
          <div className="p-6 border-b-2 border-[#3F3F46] bg-[#27272A]">
            <span className="text-2xl font-bold uppercase tracking-tighter text-[#FAFAFA] group-hover:text-[#DFE104] transition-colors">AI Mentor</span>
          </div>
          <div className="flex-1 bg-[#09090B] flex items-center justify-center p-8">
            <div className="w-full h-full border-2 border-[#3F3F46] border-dashed flex items-center justify-center text-[#3F3F46] font-bold text-2xl uppercase">
              Chat Interface
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
