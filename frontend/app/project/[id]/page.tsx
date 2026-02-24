'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { WhiteboardTree } from '@/components/WhiteboardTree';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { projects, loadProjects, loadTasks, addTask } = useAppStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (projects.length === 0) {
      loadProjects();
    }
    loadTasks(projectId);
  }, [projectId, loadProjects, loadTasks, projects.length]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask(projectId, null, newTaskTitle.trim());
    setNewTaskTitle('');
  };

  if (!project && projects.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
        Project not found.
      </div>
    );
  }

  return (
    <main className="h-screen w-full relative bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Absolute Header Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none w-[400px]">
        <header className="mb-4 flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 pointer-events-auto">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
            >
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight truncate max-w-[200px]">{project?.title || 'Loading...'}</h1>
          </div>
        </header>

        <form onSubmit={handleAddTask} className="flex gap-2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 pointer-events-auto">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add root task..."
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
          >
            <Plus size={20} />
          </button>
        </form>
      </div>

      {/* Full Canvas Background */}
      <div className="absolute inset-0 w-full h-full">
        <WhiteboardTree projectId={projectId} />
      </div>
    </main>
  );
}
