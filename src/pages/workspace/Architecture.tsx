import type { MouseEvent, WheelEvent } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import { Button } from '../../components/ui/Button';
import { useWorkspaceStore } from '../../store/workspaceStore';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    darkMode: true,
    background: '#09090B',
    primaryColor: '#27272A',
    primaryTextColor: '#FAFAFA',
    primaryBorderColor: '#3F3F46',
    lineColor: '#DFE104',
    secondaryColor: '#3F3F46',
    tertiaryColor: '#09090B'
  },
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
  }
});

// Normalize AI-returned Mermaid text into valid syntax
function sanitizeMermaid(text: string): string {
  if (!text) return '';
  let out = text.trim().replace(/^```mermaid\s*/i, '').replace(/\s*```$/i, '').trim();
  out = out.replace(/flowchart_TD_/gi, 'flowchart TD\n    ');
  out = out.replace(/flowchartTD\b/gi, 'flowchart TD\n    ');
  out = out.replace(/^(flowchart|graph|stateDiagram)[^\n]*\n?/gim, '');
  out = out.replace(/\[([^\]]*)\]/g, (_, label) => {
    if (/[|:/\\()>[\]]/.test(label)) {
      const quoted = label.replace(/\|/g, '\\|').replace(/"/g, '\\"');
      return `["${quoted}"]`;
    }
    return `[${label}]`;
  });
  return out;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export default function Architecture() {
  const { architecture, modules, setActiveContext, setWorkspaceData, project } = useWorkspaceStore();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [diagramReady, setDiagramReady] = useState(false); // true = diagram is showing

  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // Render diagram to SVG container
  const doRender = useCallback((arch: string) => {
    if (!arch || !svgContainerRef.current) return;
    const safe = 'flowchart TD\n' + sanitizeMermaid(arch);
    svgContainerRef.current.innerHTML = '';
    mermaid.render('architecture-diagram', safe)
      .then(({ svg }) => {
        if (svgContainerRef.current) svgContainerRef.current.innerHTML = svg;
        setRenderError(null);
        // Auto-fit to container
        if (svgContainerRef.current && containerRef.current) {
          const svgEl = svgContainerRef.current.querySelector('svg');
          if (svgEl) {
            const cw = containerRef.current.clientWidth;
            const ch = containerRef.current.clientHeight;
            const sw = svgEl.clientWidth || 800;
            const sh = svgEl.clientHeight || 400;
            const scale = Math.min((cw - 80) / sw, (ch - 80) / sh, 1.5);
            setTransform({ x: (cw - sw * scale) / 2, y: (ch - sh * scale) / 2, scale });
          }
        }
      })
      .catch((e: any) => setRenderError(e.message || 'Render failed'));
  }, []);

  // When diagramReady becomes true, render
  useEffect(() => {
    if (diagramReady && architecture) {
      doRender(architecture);
    }
  }, [diagramReady, architecture, doRender]);

  // --- Pan/Zoom ---
  const handleMouseDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    setTransform(t => ({
      ...t,
      x: dragStart.current.tx + (e.clientX - dragStart.current.x),
      y: dragStart.current.ty + (e.clientY - dragStart.current.y),
    }));
  };

  const handleMouseUp = () => { isDragging.current = false; };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = containerRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setTransform(t => {
      const ns = Math.min(Math.max(t.scale * delta, 0.2), 4);
      return { scale: ns, x: mx - (ns / t.scale) * (mx - t.x), y: my - (ns / t.scale) * (my - t.y) };
    });
  };

  const zoomTo = (ratio: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const mx = (rect?.width ?? 600) / 2;
    const my = (rect?.height ?? 400) / 2;
    setTransform(t => {
      const ns = Math.min(Math.max(t.scale * ratio, 0.2), 4);
      return { scale: ns, x: mx - (ns / t.scale) * (mx - t.x), y: my - (ns / t.scale) * (my - t.y) };
    });
  };

  const resetView = () => {
    if (svgContainerRef.current && containerRef.current) {
      const svgEl = svgContainerRef.current.querySelector('svg');
      if (!svgEl) return;
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const sw = svgEl.clientWidth || 800;
      const sh = svgEl.clientHeight || 400;
      setTransform({ x: (cw - sw) / 2, y: (ch - sh) / 2, scale: Math.min((cw - 80) / sw, (ch - 80) / sh, 1.5) });
    }
  };

  const handleSelectModule = (mod: any) => {
    setSelectedModule(mod);
    setActiveContext(`Viewing Module: ${mod.name}\nResponsibility: ${mod.responsibility}\nFiles: ${mod.files}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(architecture || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clicking the center button — show the diagram (no API call, data already in store)
  const handleShowDiagram = () => {
    setDiagramReady(true);
  };

  // REGENERATE in toolbar — re-fetch from API
  const handleRegenerate = async () => {
    if (!project?.owner || !project?.name) return;
    setLoading(true);
    setRenderError(null);
    try {
      const targetUrl = `https://github.com/${project.owner}/${project.name}`;
      const res = await fetch(`/api/analyze?url=${encodeURIComponent(targetUrl)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';
          for (const block of lines) {
            if (block.startsWith('data: ')) {
              const data = JSON.parse(block.slice(6));
              if (data.error) throw new Error(data.error);
              if (data.data) setWorkspaceData(data.data);
            }
          }
        }
      }
    } catch (e: any) {
      alert('Regenerate failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const svgEl = svgContainerRef.current?.querySelector('svg');
    if (!svgEl) return;
    const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const svgStyle = {
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
    transformOrigin: '0 0',
    cursor: isDragging.current ? 'grabbing' : 'grab',
  };

  return (
    <div className="py-6 h-[800px] lg:h-[calc(100vh-10rem)] flex flex-col">
      {/* Top Toolbar */}
      <div className="flex flex-wrap gap-4 border-b-2 border-[#3F3F46] pb-6 mb-6 shrink-0">
        <Button onClick={handleCopy} variant="outline" size="sm" disabled={!architecture}>
          {copied ? 'COPIED' : 'COPY MERMAID'}
        </Button>
        <Button onClick={handleRegenerate} variant="ghost" size="sm" disabled={loading || !project?.owner}>
          {loading ? 'GENERATING...' : 'REGENERATE'}
        </Button>
        <Button onClick={handleExport} variant="ghost" size="sm" disabled={!diagramReady}>
          EXPORT
        </Button>

        {/* Zoom Controls — only show when diagram is ready */}
        {diagramReady && (
          <div className="ml-auto flex items-center gap-1 border border-[#3F3F46] rounded-sm overflow-hidden">
            <button onClick={() => zoomTo(0.8)} className="px-3 py-1.5 bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-[#FAFAFA] font-bold text-sm transition-colors">−</button>
            <button onClick={resetView} className="px-3 py-1.5 bg-[#27272A] hover:bg-[#3F3F46] text-[#DFE104] font-bold text-xs transition-colors">
              {Math.round(transform.scale * 100)}%
            </button>
            <button onClick={() => zoomTo(1.25)} className="px-3 py-1.5 bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-[#FAFAFA] font-bold text-sm transition-colors">+</button>
            <button onClick={() => zoomTo(2 / transform.scale)} className="px-3 py-1.5 bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-[#FAFAFA] font-bold text-xs transition-colors">FIT</button>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-px bg-[#3F3F46] border-2 border-[#3F3F46] overflow-hidden">

        {/* Left: Module List */}
        <div className="bg-[#09090B] overflow-y-auto border-r-2 border-[#3F3F46]">
          <div className="p-4 bg-[#27272A]">
            <h2 className="uppercase font-bold tracking-tighter">Architecture Modules</h2>
          </div>
          <div className="flex flex-col gap-px bg-[#3F3F46]">
            {modules?.map((mod: any) => (
              <button
                key={mod.id}
                onClick={() => handleSelectModule(mod)}
                className={`text-left p-4 uppercase transition-colors ${selectedModule?.id === mod.id ? 'bg-[#DFE104] text-black font-bold' : 'bg-[#09090B] text-[#FAFAFA] hover:bg-[#27272A]'}`}
              >
                {mod.name}
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Canvas */}
        <div
          ref={containerRef}
          className="col-span-1 lg:col-span-2 bg-[#09090B] relative overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ userSelect: 'none' }}
        >
          {/* State 1: Empty — show center button */}
          {!diagramReady && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
              <p className="text-[#3F3F46] font-bold uppercase tracking-widest text-sm">
                Click to render diagram
              </p>
              <Button
                onClick={handleShowDiagram}
                size="lg"
                className="text-2xl px-16 py-6"
                disabled={!architecture}
              >
                RENDER ARCHITECTURE
              </Button>
              {!architecture && (
                <p className="text-xs text-[#52525B] uppercase tracking-widest">
                  No architecture data available
                </p>
              )}
            </div>
          )}

          {/* State 2: Loading */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[4rem] font-bold uppercase text-[#3F3F46] animate-pulse">GENERATING...</div>
            </div>
          )}

          {/* State 3: Error */}
          {diagramReady && renderError && !loading && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center max-w-2xl">
                <p className="text-[#EF4444] font-bold uppercase mb-4">Diagram Render Failed</p>
                <pre className="text-xs text-[#A1A1AA] text-left whitespace-pre-wrap bg-[#27272A] p-4 rounded border border-[#3F3F46] max-h-48 overflow-auto">
{architecture}
                </pre>
                <p className="text-xs text-[#A1A1AA] mt-3 bg-[#1a1a1a] p-3 rounded border border-[#3F3F46]">
                  Error: {renderError}
                </p>
              </div>
            </div>
          )}

          {/* State 4: Diagram */}
          {diagramReady && !loading && !renderError && (
            <>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <span className="text-[10px] text-[#3F3F46] uppercase tracking-widest font-bold">
                  Drag to pan · Scroll to zoom
                </span>
              </div>

              <div
                ref={svgContainerRef}
                style={svgStyle}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              />

              <div className="absolute top-3 right-3 flex flex-col gap-1 z-10" data-no-drag>
                <button onClick={() => zoomTo(1.25)} className="w-8 h-8 bg-[#27272A] border border-[#3F3F46] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#DFE104] font-bold text-lg transition-colors">+</button>
                <button onClick={() => zoomTo(0.8)} className="w-8 h-8 bg-[#27272A] border border-[#3F3F46] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#DFE104] font-bold text-lg transition-colors">−</button>
                <button onClick={resetView} className="w-8 h-8 bg-[#27272A] border border-[#3F3F46] text-[#DFE104] font-bold text-lg transition-colors">⟲</button>
              </div>
            </>
          )}
        </div>

        {/* Right: Inspector */}
        <div className="bg-[#09090B] overflow-y-auto border-l-2 border-[#3F3F46] p-6 lg:p-8">
          {selectedModule ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold uppercase tracking-tighter text-[#DFE104] mb-8 border-b-2 border-[#3F3F46] pb-4">
                {selectedModule.name}
              </h2>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#A1A1AA] mb-2">Responsibility</h3>
                <p className="text-lg">{selectedModule.responsibility}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#A1A1AA] mb-2">Location</h3>
                <p className="font-mono text-sm text-[#DFE104] break-all">{selectedModule.files}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#A1A1AA] mb-2">Analysis</h3>
                <p className="text-sm">{selectedModule.why}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#A1A1AA] mb-2">Recommendation</h3>
                <p className="text-sm border-l-2 border-[#DFE104] pl-4">{selectedModule.suggestion}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#3F3F46] font-bold uppercase text-2xl text-center">
              SELECT MODULE <br/> TO INSPECT
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
