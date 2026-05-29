import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function RepoInput() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartAnalysis = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url) return;
    setLoading(true);
    setTimeout(() => {
      navigate('/analyze/loading?url=' + encodeURIComponent(url));
    }, 500);
  };

  return (
    <form onSubmit={handleStartAnalysis} className="max-w-[90vw] md:max-w-7xl space-y-12">
      <div className="relative group">
        <Input 
          type="url" 
          placeholder="HTTPS://GITHUB.COM/VERCEL/NEXT.JS"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="relative z-10 w-full h-auto py-4 md:py-6 text-[clamp(2.5rem,6vw,8rem)] leading-[1.1] font-bold uppercase tracking-tighter placeholder:text-zinc-400 text-[#FAFAFA] border-0 border-b-[6px] border-[#DFE104] focus-visible:border-[#DFE104] focus-visible:ring-0 bg-transparent transition-all px-0"
        />
        {/* Subtle Ambient Glow */}
        <div className="absolute -bottom-1 left-0 right-0 h-[8px] bg-[#DFE104] blur-[16px] opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
        <div className="absolute -bottom-0.5 left-0 right-0 h-[4px] bg-[#DFE104] blur-[4px] opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
      </div>
      
      <div className="flex items-center gap-6">
        <Button 
          type="submit" 
          size="lg" 
          className="h-20 px-12 text-2xl w-full md:w-auto mt-4 md:mt-8 hover:bg-[#FAFAFA] hover:text-black transition-colors" 
          disabled={loading || !url}
        >
          {loading ? 'ANALYZING...' : 'ANALYZE REPOSITORY'}
        </Button>
        {!url && (
           <span className="hidden md:block mt-8 text-lg font-mono text-[#71717A] tracking-tight uppercase">
             Press Enter to <br/> execute analysis
           </span>
        )}
      </div>
    </form>
  );
}
