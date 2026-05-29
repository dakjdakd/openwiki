import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 md:px-8 border-b-2 border-[#3F3F46] bg-[#09090B] sticky top-0 z-50">
      <Link to="/" className="text-3xl font-bold uppercase tracking-tighter hover:text-[#DFE104] transition-colors group">
        Open<span className="text-[#DFE104] group-hover:text-white transition-colors">Wiki</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-[#A1A1AA]">
        <Link to="#" className="hover:text-[#DFE104] transition-colors">Product</Link>
        <Link to="#" className="hover:text-[#DFE104] transition-colors">Docs</Link>
        <Link to="#" className="hover:text-[#DFE104] transition-colors">GitHub</Link>
      </div>
      <div className="flex items-center gap-4">
        {/* Removed LOGIN and TRY DEMO buttons */}
      </div>
    </nav>
  );
}
