import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Folder, File as FileIcon, ChevronRight, ChevronDown } from 'lucide-react';

const FileTreeNode = ({ node, level = 0, onSelect }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.type === 'directory' && node.children;
  
  return (
    <div className="font-mono">
      <div 
        className={`flex items-center gap-2 py-2 cursor-pointer hover:bg-[#27272A] px-2 transition-colors`}
        style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen);
          onSelect(node);
        }}
      >
        <div className="w-4 shrink-0 text-[#A1A1AA]">
          {hasChildren ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
        </div>
        <div className="text-[#DFE104] shrink-0">
          {node.type === 'directory' ? <Folder size={14} /> : <FileIcon size={14} />}
        </div>
        <span className="text-sm truncate">
          {node.path.split('/').pop()}
        </span>
        {node.importance === 'high' && (
          <span className="ml-auto shrink-0 w-2 h-2 rounded-full bg-[#DFE104]" />
        )}
      </div>
      {isOpen && hasChildren && (
        <div>
          {node.children.map((child: any) => (
            <FileTreeNode key={child.path} node={child} level={level + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Overview() {
  const { project, summary, fileTree, modules, activeContext, setActiveContext } = useWorkspaceStore();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [errorFile, setErrorFile] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const [asking, setAsking] = useState(false);

  // Update active context when file is selected
  const handleSelectFile = async (node: any) => {
    setSelectedFile(node);
    
    // Fetch file content if project details exist
    if (project && node.type === 'file') {
      setLoadingFile(true);
      setErrorFile('');
      setFileContent('');
      try {
        const url = `https://raw.githubusercontent.com/${project.owner}/${project.id}/${project.defaultBranch || 'main'}/${node.path}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch file content");
        const code = await res.text();
        setFileContent(code);
        setActiveContext(`Viewing File String: \n${code.substring(0, 3000)}\n\nFile Path: ${node.path}\nExplanation: ${node.explanation}`);
      } catch (err: any) {
        setErrorFile(err.message);
        setActiveContext(`Viewing File: ${node.path}\nExplanation: ${node.explanation}\n(Failed to load source)`);
      } finally {
        setLoadingFile(false);
      }
    } else {
      setFileContent('');
      setActiveContext(`Viewing Path: ${node.path}\nExplanation: ${node.explanation}`);
    }
  };

  const askTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || asking) return;
    setAsking(true);
    const q = question;
    setQuestion('');
    setAnswer("...");

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: activeContext,
          history: [] // could expand to keep track here too
        })
      });
      const data = await res.json();
      setAnswer(data.answer || "No response");
    } catch (err) {
      setAnswer("Error talking to tutor API.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="py-6 grid grid-cols-1 lg:grid-cols-4 gap-px bg-[#3F3F46] border-2 border-[#3F3F46]">
      
      {/* File Tree Left Sidebar */}
      <div className="bg-[#09090B] flex flex-col h-[500px] lg:h-[calc(100vh-12rem)] overflow-hidden">
        <div className="p-4 border-b-2 border-[#3F3F46]">
          <h2 className="uppercase font-bold tracking-tighter">File Explorer</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-2">
            {fileTree?.map((node: any) => (
              <FileTreeNode key={node.path} node={node} onSelect={handleSelectFile} />
            ))}
          </div>
        </div>

        {/* Selected File Details */}
        {selectedFile && (
          <div className="p-4 border-t-2 border-[#3F3F46] bg-[#27272A] shrink-0">
            <h3 className="font-mono text-sm text-[#DFE104] break-all">{selectedFile.path}</h3>
            <p className="text-sm mt-2 text-[#FAFAFA]">{selectedFile.explanation}</p>
            <div className="text-xs uppercase tracking-widest text-[#A1A1AA] mt-2">
              Importance: {selectedFile.importance}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="col-span-1 lg:col-span-2 bg-[#09090B] overflow-y-auto h-[600px] lg:h-[calc(100vh-12rem)] p-6 lg:p-10 space-y-12">
        
        {selectedFile ? (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b-2 border-[#3F3F46] pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-tighter truncate max-w-[80%]">
                {selectedFile.path.split('/').pop()}
              </h2>
              <Button size="sm" variant="outline" onClick={() => {
                setSelectedFile(null);
                setFileContent('');
                setActiveContext('General Overview');
              }}>CLOSE</Button>
            </div>
            
            <p className="text-[#A1A1AA] mb-4">{selectedFile.explanation}</p>
            
            <div className="flex-1 overflow-auto bg-[#27272A] border border-[#3F3F46] p-4 text-sm font-mono whitespace-pre text-[#FAFAFA]">
              {loadingFile ? "Loading source..." : errorFile ? `Error: ${errorFile}` : fileContent ? fileContent : "(Directory or empty file)"}
            </div>
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-4xl font-bold uppercase tracking-tighter mb-8 border-b-2 border-[#3F3F46] pb-4">
                Project Summary
              </h2>
              <div className="space-y-6 text-lg text-[#A1A1AA]">
                <div>
                  <h3 className="text-[#FAFAFA] uppercase text-sm tracking-widest mb-2">What is it?</h3>
                  <p>{summary?.summary}</p>
                </div>
                <div>
                  <h3 className="text-[#FAFAFA] uppercase text-sm tracking-widest mb-2">Target User</h3>
                  <p>{summary?.targetUser}</p>
                </div>
                <div>
                  <h3 className="text-[#FAFAFA] uppercase text-sm tracking-widest mb-2">Core Features</h3>
                  <p>{summary?.coreFunctionality}</p>
                </div>
                <div>
                  <h3 className="text-[#FAFAFA] uppercase text-sm tracking-widest mb-2">Data Flow</h3>
                  <p className="font-mono text-sm">{summary?.dataFlow}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-4xl font-bold uppercase tracking-tighter mb-8 border-b-2 border-[#3F3F46] pb-4">
                Core Modules
              </h2>
              <div className="flex flex-col gap-px bg-[#3F3F46] border-2 border-[#3F3F46]">
                {modules?.map((mod: any) => (
                  <Card key={mod.id} hoverable className="border-0 border-b-2 border-[#3F3F46] last:border-b-0 p-6 md:p-8 relative overflow-hidden group">
                    <span className="absolute -right-4 -bottom-8 text-[8rem] text-[#27272A] leading-none group-hover:text-black/10 transition-colors font-sans pointer-events-none">
                      {mod.id.substring(0,2).toUpperCase()}
                    </span>
                    
                    <h3 className="text-2xl font-bold uppercase mb-2 group-hover:text-black relative z-10 transition-colors">
                      {mod.name}
                    </h3>
                    <div className="font-mono text-sm text-[#DFE104] group-hover:text-black/80 mb-4 relative z-10 transition-colors">
                      {mod.files}
                    </div>
                    <p className="text-[#A1A1AA] mb-4 group-hover:text-black/80 relative z-10 transition-colors">
                      {mod.why}
                    </p>
                    <div className="text-sm font-bold uppercase tracking-widest group-hover:text-black relative z-10 transition-colors">
                      → {mod.suggestion}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* AI Tutor Right Sidebar */}
      <div className="bg-[#09090B] border-l-2 border-[#3F3F46] flex flex-col h-[500px] lg:h-[calc(100vh-12rem)]">
        <div className="p-6 bg-[#DFE104] text-black">
          <h2 className="uppercase font-bold tracking-tighter text-2xl">AI Tutor</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <h3 className="text-[#FAFAFA] uppercase text-sm tracking-widest mb-4">Start Here</h3>
            <ul className="space-y-2">
              {summary?.startHere?.map((path: string, i: number) => (
                <li key={i} className="font-mono text-xs text-[#DFE104] break-all border border-[#3F3F46] p-2 hover:bg-[#27272A] cursor-pointer">
                  {path}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-[#27272A] p-4 border border-[#3F3F46]">
            <h3 className="text-[#FAFAFA] uppercase text-sm tracking-widest mb-2 text-[#DFE104]">Current Focus</h3>
            <p className="text-sm text-[#FAFAFA] break-all">
              {activeContext}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {answer && (
              <div className="bg-[#27272A] p-4 text-sm text-[#FAFAFA] border-l-4 border-[#DFE104]">
                {answer}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={askTutor} className="p-4 border-t-2 border-[#3F3F46] shrink-0 bg-[#09090B]">
          <Input 
            className="h-14 text-base tracking-normal border-2 border-[#3F3F46] px-4" 
            placeholder="Ask AI Tutor..." 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button type="submit" className="w-full mt-4" size="sm">
            ASK
          </Button>
        </form>

      </div>
    </div>
  );
}
