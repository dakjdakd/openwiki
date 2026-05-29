import React from 'react';
import Marquee from 'react-fast-marquee';

export function FeaturePreview() {
  return (
    <section className="py-12 bg-[#DFE104] text-black overflow-hidden border-y-2 border-[#3F3F46]">
      <Marquee speed={80} gradient={false} autoFill>
        <div className="flex items-center gap-12 px-6 tracking-tighter">
          <span className="text-6xl font-bold uppercase">Code Summary</span>
          <span className="text-4xl text-[#3F3F46]">///</span>
          <span className="text-6xl font-bold uppercase">Architecture Map</span>
           <span className="text-4xl text-[#3F3F46]">///</span>
          <span className="text-6xl font-bold uppercase">AI Source Tutor</span>
          <span className="text-4xl text-[#3F3F46]">///</span>
          <span className="text-6xl font-bold uppercase">Business Analysis</span>
          <span className="text-4xl text-[#3F3F46]">///</span>
        </div>
      </Marquee>
    </section>
  );
}
