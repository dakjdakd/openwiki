import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t-2 border-[#3F3F46] bg-[#09090B] mt-auto">
      <div className="px-4 md:px-8 py-32 max-w-[95vw] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="text-[clamp(3rem,5vw,5rem)] font-bold uppercase tracking-tighter leading-none mb-6 block hover:text-[#DFE104] transition-colors">
            OpenWiki
          </Link>
          <p className="text-[#A1A1AA] text-lg uppercase tracking-wide max-w-md">
            Deciphering the world's open source codebases, one repository at a time. Designed for AI engineers and developers.
          </p>
        </div>
        <div>
          <h4 className="text-xl font-bold uppercase tracking-tighter text-[#FAFAFA] mb-6">Product</h4>
          <ul className="space-y-4 text-[#A1A1AA] font-bold uppercase tracking-widest text-sm">
            <li><Link to="/product" className="hover:text-[#DFE104] transition-colors">Features</Link></li>
            <li><Link to="/docs" className="hover:text-[#DFE104] transition-colors">Docs</Link></li>
            <li><Link to="/docs" className="hover:text-[#DFE104] transition-colors">API</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-bold uppercase tracking-tighter text-[#FAFAFA] mb-6">Connect</h4>
          <ul className="space-y-4 text-[#A1A1AA] font-bold uppercase tracking-widest text-sm">
            <li><Link to="/github" className="hover:text-[#DFE104] transition-colors">GitHub</Link></li>
            <li><Link to="#" className="hover:text-[#DFE104] transition-colors">Twitter</Link></li>
            <li><Link to="#" className="hover:text-[#DFE104] transition-colors">Privacy</Link></li>
            <li><Link to="#" className="hover:text-[#DFE104] transition-colors">Terms</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
