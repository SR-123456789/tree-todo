'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import Link from 'next/link';
import { FolderPlus, Trash2, ChevronRight } from 'lucide-react';

export default function Home() {
  const { projects, loadProjects, addProject, deleteProject } = useAppStore();
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addProject(newTitle.trim());
    setNewTitle('');
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Task Tree</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage your hierarchical tasks</p>
        </header>

        <form onSubmit={handleCreate} className="mb-10 flex gap-4">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New project title..."
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
          >
            <FolderPlus size={20} />
            Create Project
          </button>
        </form>

        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900"
            >
              <Link
                href={`/project/${project.id}`}
                className="flex flex-1 items-center gap-4"
              >
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{project.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                  <ChevronRight size={24} />
                </div>
              </Link>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.id);
                }}
                className="ml-4 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                aria-label="Delete project"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          
          {projects.length === 0 && (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50">
              <FolderPlus size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No projects yet.</p>
              <p className="text-sm mt-1">Create one above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
