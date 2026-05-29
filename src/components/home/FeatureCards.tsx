import React from 'react';
import { Card } from '../ui/Card';
import { FileText, Network, Brain, Activity } from 'lucide-react';

export function FeatureCards() {
  const features = [
    {
      title: "AI Code Summary",
      desc: "Instantly understand the purpose of any file or directory.",
      icon: <FileText size={48} strokeWidth={1} />
    },
    {
      title: "Architecture Visualization",
      desc: "Auto-generated interactive architecture diagrams.",
      icon: <Network size={48} strokeWidth={1} />
    },
    {
      title: "AI Repo Mentor",
      desc: "Personalized learning paths tailored to your skill level.",
      icon: <Brain size={48} strokeWidth={1} />
    },
    {
      title: "Business Analysis",
      desc: "Commercial insights, competitor analysis and monetization potential.",
      icon: <Activity size={48} strokeWidth={1} />
    }
  ];

  return (
    <section className="py-32 px-4 md:px-8 max-w-[95vw] mx-auto border-t-2 border-[#3F3F46]">
      <h2 className="text-5xl md:text-[clamp(3rem,6vw,6rem)] font-bold uppercase tracking-tighter mb-16 max-w-4xl">
        Decode Codebases <br /><span className="text-[#DFE104]">At Light Speed</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#3F3F46] border-2 border-[#3F3F46]">
        {features.map((f, i) => (
          <Card key={i} hoverable className="p-8 lg:p-12 group flex flex-col items-start min-h-[320px]">
            <div className="text-[#DFE104] group-hover:text-black mb-12 transition-colors">
              {f.icon}
            </div>
            <h3 className="text-3xl font-bold uppercase tracking-tighter text-[#FAFAFA] group-hover:text-black mb-4 transition-colors">
              {f.title}
            </h3>
            <p className="text-lg text-[#A1A1AA] group-hover:text-black/80 transition-colors mt-auto">
              {f.desc}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
