'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { WhiteboardTree } from '@/components/WhiteboardTree';

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { projects, loadProjects, loadTasks, addTask, tasks } = useAppStore();
  const projectTasks = tasks.filter(t => t.projectId === id);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  useEffect(() => {
    loadProjects();
    loadTasks(id);
  }, [id, loadProjects, loadTasks]);

  const project = projects.find(p => p.id === id);

  if (!project) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(project.id, null, newTaskTitle.trim());
    setNewTaskTitle('');
  };

  return (
    <main className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/20 dark:bg-cyan-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[100px] pointer-events-none" />

      {/* Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <WhiteboardTree projectTasks={projectTasks} />
      </div>

      {/* Floating Header Overlay (Glassmorphism) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-4 max-w-sm pointer-events-none">
        
        {/* Navigation & Title */}
        <div className="flex items-center gap-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 p-3 rounded-2xl shadow-lg shadow-indigo-500/5 pointer-events-auto transition-transform hover:scale-[1.01]">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-all hover:shadow-inner text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">
              {project.title}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
              Task Whiteboard
            </p>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="flex gap-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 p-2 rounded-2xl shadow-xl shadow-cyan-500/5 pointer-events-auto transition-transform hover:scale-[1.01]">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add new root task..."
            className="flex-1 bg-white/50 dark:bg-gray-800/50 rounded-xl px-4 py-2 border-none outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm font-medium transition-shadow placeholder:text-gray-400 dark:text-white"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl px-4 py-2 flex items-center justify-center transition-all hover:shadow-lg hover:shadow-cyan-500/25 active:scale-95"
          >
            <Plus size={20} />
          </button>
        </form>

      </div>
    </main>
  );
}
