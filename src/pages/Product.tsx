import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, FileSearch, GraduationCap, Network, Presentation, Sparkles } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const capabilities = [
  {
    title: 'Repository Intelligence',
    body: 'OpenWiki reads GitHub metadata, README content, package manifests, file trees, and selected source files to build a practical first-pass understanding.',
    icon: FileSearch,
  },
  {
    title: 'Architecture Workspace',
    body: 'Mermaid diagrams turn routes, services, stores, modules, and data flow into an interactive map for exploration and review.',
    icon: Network,
  },
  {
    title: 'Learning Roadmap',
    body: 'Each repository becomes a guided curriculum with goals, files to inspect, focus points, review questions, and exercises.',
    icon: GraduationCap,
  },
  {
    title: 'AI Mentor Context',
    body: 'The tutor follows the current file, module, or lesson so follow-up questions stay grounded in what the user is reading.',
    icon: Bot,
  },
  {
    title: 'Business Lens',
    body: 'Open-source projects can be evaluated as products, with positioning, users, competitors, risks, growth paths, and MVP direction.',
    icon: Sparkles,
  },
  {
    title: 'Shareable Report',
    body: 'The generated report packages technical and product insights into a clean artifact for onboarding, research, and handoff.',
    icon: Presentation,
  },
];

const flow = ['Paste a GitHub URL', 'Stream analysis progress', 'Explore generated workspace', 'Ask focused follow-ups', 'Share the final report'];

export default function Product() {
  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col">
      <div className="noise-overlay" />
      <Navbar />

      <main className="flex-1">
        <section className="px-4 md:px-8 py-24 md:py-32 max-w-[95vw] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-end border-b-2 border-[#3F3F46] pb-16">
            <div>
              <p className="text-[#DFE104] font-bold uppercase tracking-widest mb-6">Product</p>
              <h1 className="text-6xl md:text-[clamp(5rem,10vw,11rem)] font-bold uppercase tracking-tighter leading-[0.82]">
                AI Wiki For <br />Real Code
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-[#A1A1AA] uppercase tracking-wide max-w-2xl">
              OpenWiki turns a public GitHub repository into a navigable technical workspace with architecture, learning, tutoring, business analysis, and reports.
            </p>
          </div>
        </section>

        <section className="px-4 md:px-8 pb-24 max-w-[95vw] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-[#3F3F46] border-2 border-[#3F3F46]">
            {capabilities.map(({ title, body, icon: Icon }) => (
              <div key={title} className="bg-[#09090B] p-8 md:p-10 min-h-[300px] flex flex-col">
                <Icon className="text-[#DFE104] mb-12" size={44} strokeWidth={1.5} />
                <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4">{title}</h2>
                <p className="text-[#A1A1AA] text-lg leading-relaxed mt-auto">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 md:px-8 pb-32 max-w-[95vw] mx-auto">
          <div className="border-2 border-[#3F3F46]">
            <div className="p-6 md:p-8 bg-[#27272A] border-b-2 border-[#3F3F46] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter">Workspace Flow</h2>
              <Link to="/" className="text-[#DFE104] font-bold uppercase tracking-widest hover:text-white transition-colors">
                Analyze a repo
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-[#3F3F46]">
              {flow.map((item, index) => (
                <div key={item} className="bg-[#09090B] p-6 min-h-[180px] flex flex-col justify-between">
                  <span className="text-[#DFE104] text-4xl font-bold tracking-tighter">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-xl font-bold uppercase tracking-tighter">{item}</span>
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
