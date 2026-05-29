import React from 'react';
import { ExternalLink, GitFork, Github, Layers, Star, Workflow } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const repoUrl = 'https://github.com/dakjdakd/openwiki';

const repoHighlights = [
  ['Frontend', 'React 19, React Router 7, Tailwind CSS 4, Zustand, Mermaid'],
  ['Backend', 'Express, TypeScript, GitHub REST API, OpenAI-compatible AI service'],
  ['Analysis', 'README parsing, tech stack detection, file tree scoring, source sampling'],
  ['Workspace', 'Overview, Architecture, Learn, Business, Report, AI tutor context'],
];

export default function GitHub() {
  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col">
      <div className="noise-overlay" />
      <Navbar />

      <main className="flex-1">
        <section className="px-4 md:px-8 py-24 md:py-32 max-w-[95vw] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_28rem] gap-12 items-stretch">
            <div>
              <p className="text-[#DFE104] font-bold uppercase tracking-widest mb-6">GitHub</p>
              <h1 className="text-6xl md:text-[clamp(5rem,10vw,11rem)] font-bold uppercase tracking-tighter leading-[0.82]">
                dakjdakd/<br />openwiki
              </h1>
              <p className="text-xl md:text-2xl text-[#A1A1AA] uppercase tracking-wide max-w-3xl mt-10">
                The OpenWiki repository contains the full React and Express application for turning GitHub projects into AI-generated technical workspaces.
              </p>
            </div>

            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="border-2 border-[#DFE104] bg-[#111113] p-8 md:p-10 flex flex-col justify-between hover:bg-[#DFE104] hover:text-black transition-colors group"
            >
              <Github size={64} strokeWidth={1.3} className="text-[#DFE104] group-hover:text-black transition-colors" />
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-[#A1A1AA] group-hover:text-black/70 mb-4">Repository</div>
                <div className="text-3xl font-bold uppercase tracking-tighter break-all">github.com/dakjdakd/openwiki</div>
                <div className="flex items-center gap-2 mt-8 font-bold uppercase tracking-widest">
                  Open on GitHub <ExternalLink size={18} />
                </div>
              </div>
            </a>
          </div>
        </section>

        <section className="px-4 md:px-8 pb-24 max-w-[95vw] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#3F3F46] border-2 border-[#3F3F46]">
            <div className="bg-[#09090B] p-8 min-h-[240px]">
              <Star className="text-[#DFE104] mb-10" size={44} strokeWidth={1.5} />
              <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4">Star It</h2>
              <p className="text-[#A1A1AA] text-lg">Follow the project as the analyzer, diagrams, reports, and persistence story continue to improve.</p>
            </div>
            <div className="bg-[#09090B] p-8 min-h-[240px]">
              <GitFork className="text-[#DFE104] mb-10" size={44} strokeWidth={1.5} />
              <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4">Fork It</h2>
              <p className="text-[#A1A1AA] text-lg">Experiment with new prompts, model providers, source sampling strategies, or workspace pages.</p>
            </div>
            <div className="bg-[#09090B] p-8 min-h-[240px]">
              <Workflow className="text-[#DFE104] mb-10" size={44} strokeWidth={1.5} />
              <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4">Extend It</h2>
              <p className="text-[#A1A1AA] text-lg">Add persistent storage, private repository support, richer Mermaid repair, or deployment tooling.</p>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-8 pb-32 max-w-[95vw] mx-auto">
          <div className="border-2 border-[#3F3F46]">
            <div className="p-6 md:p-8 bg-[#27272A] border-b-2 border-[#3F3F46] flex items-center gap-4">
              <Layers className="text-[#DFE104]" size={36} strokeWidth={1.5} />
              <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">Repository Map</h2>
            </div>
            <div className="grid gap-px bg-[#3F3F46]">
              {repoHighlights.map(([area, detail]) => (
                <div key={area} className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-4 bg-[#09090B] p-6">
                  <span className="text-[#DFE104] font-bold uppercase tracking-widest">{area}</span>
                  <span className="text-[#A1A1AA] text-lg">{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
