import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Check, ChevronRight, ChevronDown } from 'lucide-react';

export default function Learn() {
  const { lessons, activeContext, setActiveContext } = useWorkspaceStore();
  const [completed, setCompleted] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState<{q: string, a: string}[]>([]);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (lessons && lessons.length > 0 && !expanded) {
      setExpanded(lessons[0].id);
      setActiveContext(`Lesson: ${lessons[0].title}. Goal: ${lessons[0].goal}. Files: ${lessons[0].files.join(', ')}`);
    }
  }, [lessons, expanded, setActiveContext]);

  const toggleLesson = (id: string) => {
    const newExpanded = expanded === id ? '' : id;
    setExpanded(newExpanded);
    if (newExpanded) {
      const activeLesson = lessons?.find((l: any) => l.id === newExpanded);
      if (activeLesson) {
        setActiveContext(`Lesson: ${activeLesson.title}. Goal: ${activeLesson.goal}. Files: ${activeLesson.files.join(', ')}`);
      }
    }
  };

  const markDone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!completed.includes(id)) {
      setCompleted([...completed, id]);
      const currentIndex = lessons?.findIndex((l: any) => l.id === id) ?? -1;
      if (currentIndex !== -1 && currentIndex + 1 < (lessons?.length || 0)) {
        const nextId = lessons[currentIndex + 1].id;
        setExpanded(nextId);
        const nextLesson = lessons[currentIndex + 1];
        setActiveContext(`Lesson: ${nextLesson.title}. Goal: ${nextLesson.goal}. Files: ${nextLesson.files.join(', ')}`);
      }
    } else {
      setCompleted(completed.filter(x => x !== id));
    }
  };

  const askHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || asking) return;
    setAsking(true);
    const q = question;
    setQuestion('');
    
    // Optimistic UI for question
    setChat(prev => [...prev, { q, a: "..." }]);
    
    try {
      const { activeContext } = useWorkspaceStore.getState();
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: activeContext,
          history: chat
        })
      });
      const data = await res.json();
      setChat(prev => {
        const newChat = [...prev];
        newChat[newChat.length - 1].a = data.answer || "Sorry, I couldn't understand that.";
        return newChat;
      });
    } catch (err) {
      setChat(prev => {
        const newChat = [...prev];
        newChat[newChat.length - 1].a = "Error talking to tutor API.";
        return newChat;
      });
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Learning Path */}
      <div className="col-span-1 lg:col-span-2 space-y-8">
        <div className="flex items-end justify-between border-b-2 border-[#3F3F46] pb-4">
          <h2 className="text-4xl font-bold uppercase tracking-tighter">Learning Route</h2>
          <div className="text-2xl font-bold text-[#DFE104] tracking-tighter">
            {completed.length} / {lessons?.length || 0} <span className="text-sm text-[#A1A1AA] uppercase">Completed</span>
          </div>
        </div>

        <div className="space-y-4">
          {lessons?.map((lesson: any, idx: number) => {
            const isCompleted = completed.includes(lesson.id);
            const isExpanded = expanded === lesson.id;
            
            return (
              <Card 
                key={lesson.id} 
                className={`p-0 cursor-pointer overflow-hidden transition-all duration-300 ${isCompleted ? 'opacity-75' : ''}`}
                onClick={() => toggleLesson(lesson.id)}
              >
                {/* Header */}
                <div className={`p-6 flex items-center justify-between border-b-2 \${isExpanded ? 'border-[#3F3F46]' : 'border-transparent'} \${isCompleted ? 'bg-[#27272A]' : 'bg-[#09090B]'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-none border-2 flex items-center justify-center shrink-0 \${isCompleted ? 'bg-[#DFE104] border-[#DFE104] text-black' : 'border-[#3F3F46] text-transparent'}`}>
                      {isCompleted && <Check size={16} strokeWidth={4} />}
                    </div>
                    <h3 className={`text-2xl font-bold uppercase tracking-tighter \${isCompleted ? 'text-[#A1A1AA] line-through' : 'text-[#FAFAFA]'}`}>
                      {lesson.title}
                    </h3>
                  </div>
                  <div className="text-[#A1A1AA]">
                    {isExpanded ? <ChevronDown /> : <ChevronRight />}
                  </div>
                </div>

                {/* Content */}
                {isExpanded && (
                  <div className="p-6 md:p-8 space-y-8 bg-[#09090B]">
                    <div>
                      <h4 className="text-[#DFE104] font-bold uppercase tracking-widest text-xs mb-2">Goal</h4>
                      <p className="text-xl">{lesson.goal}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-[#A1A1AA] font-bold uppercase tracking-widest text-xs mb-2">Read Files</h4>
                        <ul className="space-y-2">
                          {lesson.files.map((file, i) => (
                            <li key={i} className="font-mono text-sm text-[#FAFAFA] bg-[#27272A] p-2 break-all">
                              {file}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[#A1A1AA] font-bold uppercase tracking-widest text-xs mb-2">Why & Focus</h4>
                        <p className="text-sm border-l-2 border-[#3F3F46] pl-4 mb-4">{lesson.why}</p>
                        <p className="text-sm border-l-2 border-[#DFE104] pl-4">{lesson.focus}</p>
                      </div>
                    </div>

                    <div className="bg-[#27272A] p-6 border-l-4 border-[#3F3F46]">
                      <h4 className="text-[#FAFAFA] font-bold uppercase tracking-widest text-xs mb-4">Check Questions</h4>
                      <ul className="list-disc pl-4 space-y-2 mb-6">
                        {lesson.questions.map((q, i) => (
                          <li key={i} className="text-sm">{q}</li>
                        ))}
                      </ul>
                      
                      <h4 className="text-[#FAFAFA] font-bold uppercase tracking-widest text-xs mb-2">Exercise</h4>
                      <p className="text-sm italic">{lesson.exercise}</p>
                    </div>

                    <div className="pt-4 border-t-2 border-[#3F3F46] flex justify-end">
                      <Button size="sm" onClick={(e) => markDone(lesson.id, e)} variant={isCompleted ? 'outline' : 'primary'}>
                        {isCompleted ? 'Mark Undone' : 'Mark as Done'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Right: Tutor Chat */}
      <div className="bg-[#09090B] border-2 border-[#3F3F46] flex flex-col h-[600px] lg:h-[calc(100vh-10rem)] sticky top-6">
        <div className="p-6 bg-[#3F3F46] text-[#FAFAFA] border-b-2 border-[#3F3F46]">
          <h2 className="uppercase font-bold tracking-tighter text-2xl">AI Source Tutor</h2>
          <p className="text-xs text-[#A1A1AA] uppercase mt-1 tracking-widest line-clamp-2">Context: {activeContext.substring(0, 50)}...</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
          {chat.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#3F3F46] font-bold uppercase text-2xl text-center">
              NO QUESTIONS<br/>YET
            </div>
          ) : (
            chat.map((msg, i) => (
              <div key={i} className="space-y-4">
                <div className="ml-8 bg-[#DFE104] text-black p-4 uppercase text-sm font-bold self-end border-2 border-black">
                  {msg.q}
                </div>
                <div className="mr-8 bg-[#27272A] text-[#FAFAFA] p-4 text-sm border-l-2 border-[#DFE104]">
                  {msg.a}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={askHandler} className="p-4 border-t-2 border-[#3F3F46] shrink-0 bg-[#09090B]">
          <Input 
            className="h-14 text-sm tracking-normal border-x-0 border-t-0 border-b-2 border-[#3F3F46]" 
            placeholder="TYPE YOUR QUESTION..." 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button type="submit" className="w-full mt-4" size="sm" disabled={!question}>
            SEND
          </Button>
        </form>
      </div>

    </div>
  );
}
