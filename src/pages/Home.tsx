import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { RepoInput } from '../components/home/RepoInput';
import { FeaturePreview } from '../components/home/FeaturePreview';
import { FeatureCards } from '../components/home/FeatureCards';
import { DemoPreview } from '../components/home/DemoPreview';
import { ExampleRepoCard } from '../components/home/ExampleRepoCard';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090B]">
      {/* Noise Texture */}
      <div className="noise-overlay" />

      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 md:px-8 max-w-[95vw] mx-auto">
          <h1 className="text-[clamp(2.5rem,5vw,7rem)] text-[#FAFAFA] leading-[0.9] font-bold uppercase tracking-tighter mb-8">
            Understand Any <br className="hidden md:block" /> GitHub Repository <br className="hidden md:block" /> <span className="text-[#DFE104]">With AI</span>
          </h1>
          <p className="text-lg md:text-xl text-[#71717A] max-w-3xl mb-16 uppercase tracking-wide">
            OpenWiki automatically generates an AI Mentor, architecture diagrams, a learning roadmap, and business analysis from any public codebase.
          </p>

          <RepoInput />
        </section>

        {/* Marquee Section */}
        <FeaturePreview />

        {/* Feature Cards Component */}
        <FeatureCards />

        {/* Demo Preview Component */}
        <DemoPreview />

        {/* Example Projects */}
        <section className="py-32 px-4 md:px-8 max-w-[95vw] mx-auto border-t-2 border-[#3F3F46]">
          <h2 className="text-5xl md:text-[clamp(3rem,6vw,6rem)] font-bold uppercase tracking-tighter border-b-2 border-[#3F3F46] pb-8 mb-16">
            Example Repos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#3F3F46] border-2 border-[#3F3F46]">
            {['React Dashboard', 'Node API Server', 'AI Chatbot App'].map((title, i) => (
              <ExampleRepoCard key={i} title={title} index={i + 1} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
