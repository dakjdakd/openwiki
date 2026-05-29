import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

const ANALYSIS_STEPS = [
  "Cloning repository...",
  "Parsing README...",
  "Detecting architecture...",
  "Building knowledge graph...",
  "Running AI analysis...",
  "Validating response...",
  "Finalizing data..."
];

const MOCK_FILES = [
  "src/",
  "src/api/router.ts",
  "src/components/Button.tsx",
  "src/models/user.ts",
  "src/services/auth.ts",
  "src/utils/helpers.ts",
  "tests/",
  "package.json",
  "README.md",
  "docker-compose.yml"
];

export default function Loading() {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentFile, setCurrentFile] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setWorkspaceData, setError } = useWorkspaceStore();

  useEffect(() => {
    const targetUrl = searchParams.get('url');
    
    // File scrolling simulation
    const fileInterval = setInterval(() => {
      setCurrentFile((prev) => (prev + 1) % MOCK_FILES.length);
    }, 150);

    let isMock = !targetUrl;

    if (isMock) {
      // Step progression for mock
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= ANALYSIS_STEPS.length - 1) {
            clearInterval(stepInterval);
            setTimeout(() => navigate('/workspace/demo'), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
      return () => {
        clearInterval(stepInterval);
        clearInterval(fileInterval);
      };
    } else {
      let eventSource: EventSource | null = null;
      try {
        eventSource = new EventSource(`/api/analyze?url=${encodeURIComponent(targetUrl)}`);
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.error) {
            setError(data.error);
            alert("Error analyzing: " + data.error);
            eventSource?.close();
            navigate('/');
            return;
          }

          if (data.step !== undefined) {
             setCurrentStep(data.step);
          }

          if (data.data && data.step === 6) {
             setWorkspaceData(data.data);
             eventSource?.close();
             setTimeout(() => {
               navigate(`/workspace/${data.data.project.id}`);
             }, 1000);
          }
        };

        eventSource.onerror = (err) => {
          console.error("SSE error", err);
          eventSource?.close();
          setError("Connection drop or failed analysis");
          navigate('/');
        };

      } catch (err: any) {
        setError(err.message);
        navigate('/');
      }

      return () => {
        if (eventSource) {
           eventSource.close();
        }
        clearInterval(fileInterval);
      };
    }
  }, [navigate, searchParams, setWorkspaceData, setError]);

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col">
      <div className="noise-overlay" />

      <main className="flex-1 max-w-[95vw] mx-auto w-full py-20 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Steps */}
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-4">
              Analyzing <br /> Repository...
            </h1>
            <p className="text-[#A1A1AA] text-lg uppercase tracking-widest">
              Please wait while our models parse the codebase.
            </p>
          </div>

          <div className="space-y-4">
            {ANALYSIS_STEPS.map((step, index) => (
              <div 
                key={step} 
                className={`flex items-center gap-4 text-xl md:text-2xl font-bold uppercase tracking-tighter transition-all duration-300 ${
                  index < currentStep ? 'text-[#FAFAFA]' : index === currentStep ? 'text-[#DFE104]' : 'text-[#3F3F46]'
                }`}
              >
                <span className={`w-8 h-8 border-2 flex items-center justify-center shrink-0 ${
                  index < currentStep ? 'border-[#FAFAFA]' : index === currentStep ? 'border-[#DFE104]' : 'border-[#3F3F46]'
                }`}>
                  {index < currentStep && <Check size={16} strokeWidth={4} />}
                  {index === currentStep && <span className="w-3 h-3 bg-[#DFE104] animate-pulse" />}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: File Tree Animation */}
        <div className="bg-[#27272A] border-2 border-[#3F3F46] h-[60vh] flex flex-col overflow-hidden relative">
          <div className="p-4 border-b-2 border-[#3F3F46] bg-[#09090B] flex justify-between items-center text-xs text-[#A1A1AA] uppercase tracking-widest font-bold">
            <span>Terminal</span>
            <span className="text-[#DFE104]">Processing</span>
          </div>
          <div className="p-6 font-mono text-sm text-[#A1A1AA] space-y-2 flex-1 overflow-hidden relative break-all">
             <div className="absolute inset-0 bg-gradient-to-b from-[#27272A] via-transparent to-[#27272A] pointer-events-none z-10" />
             <div className="absolute right-16 top-1/2 -translate-y-1/2 z-20 mix-blend-screen opacity-50 pl-4">
                <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-[#3F3F46] border-t-[#DFE104] rounded-full animate-spin" />
             </div>
            {Array.from({ length: 15 }).map((_, i) => {
              const fileIdx = (currentFile + i) % MOCK_FILES.length;
              return (
                <div key={i} className={`flex items-center gap-4 ${i === 7 ? 'text-[#DFE104]' : 'opacity-30'}`}>
                  <span className="shrink-0">$ analyzing</span>
                  <span>{MOCK_FILES[fileIdx]}</span>
                </div>
              );
            })}
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-[#09090B] border-t-2 border-[#3F3F46] w-full mt-auto shrink-0 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-[#DFE104] transition-all duration-500"
              style={{ width: `${((currentStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
