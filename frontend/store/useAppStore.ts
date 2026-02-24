import { create } from 'zustand';
import { Project } from '../domain/project';
import { Task } from '../domain/task';
import { LocalProjectRepository } from '../repositories/local/localProject.repository';
import { LocalTaskRepository } from '../repositories/local/localTask.repository';

interface AppState {
  projects: Project[];
  tasks: Task[];
  
  loadProjects: () => Promise<void>;
  loadTasks: (projectId: string) => Promise<void>;
  
  addProject: (title: string) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  
  addTask: (projectId: string, parentId: string | null, title?: string) => Promise<Task>;
  updateTask: (task: Task) => Promise<void>;
  moveTask: (taskId: string, newParentId: string | null, newOrder: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  reorderTasks: (tasks: Task[]) => Promise<void>; // useful for dnd
  updateTaskPosition: (taskId: string, position: { x: number, y: number }) => Promise<void>;
}

const projectRepo = new LocalProjectRepository();
const taskRepo = new LocalTaskRepository();

export const useAppStore = create<AppState>((set, get) => ({
  projects: [],
  tasks: [],
  
  loadProjects: async () => {
    const projects = await projectRepo.getAll();
    set({ projects });
  },
  
  loadTasks: async (projectId: string) => {
    const tasks = await taskRepo.getByProject(projectId);
    set({ tasks });
  },
  
  addProject: async (title: string) => {
    const project = await projectRepo.create(title);
    set((state) => ({ projects: [...state.projects, project] }));
    return project;
  },
  
  deleteProject: async (projectId: string) => {
    await projectRepo.delete(projectId);
    set((state) => ({
      projects: state.projects.filter(p => p.id !== projectId)
    }));
  },
  
  addTask: async (projectId: string, parentId: string | null, title: string = '') => {
    const { tasks } = get();
    // Calculate new order to be at the bottom of the siblings
    const siblings = tasks.filter(t => t.parentId === parentId);
    const order = siblings.length > 0 ? Math.max(...siblings.map(t => t.order)) + 1 : 0;
    
    // For React Flow, new tasks default to no position (will rely on auto layout) unless specified.
    const newTask: Task = {
      id: crypto.randomUUID(),
      projectId,
      parentId,
      title,
      isCompleted: false,
      order,
      isExpanded: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const createdTask = await taskRepo.create(newTask);
    set((state) => ({ tasks: [...state.tasks, createdTask] }));
    return createdTask;
  },
  
  deleteTask: async (taskId: string) => {
    await taskRepo.delete(taskId);
    set((state) => {
      const idsToDelete = new Set<string>();
      
      const collectChildren = (parentId: string) => {
        idsToDelete.add(parentId);
        state.tasks.forEach(t => {
          if (t.parentId === parentId) {
            collectChildren(t.id);
          }
        });
      };
      
      collectChildren(taskId);
      return {
        tasks: state.tasks.filter(t => !idsToDelete.has(t.id))
      };
    });
  },

  updateTask: async (task: Task) => {
    await taskRepo.update(task);
    set((state) => ({
      tasks: state.tasks.map(t => t.id === task.id ? task : t)
    }));
  },

  updateTaskPosition: async (taskId: string, position: { x: number, y: number }) => {
    const { tasks, updateTask } = get();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, position };
    await updateTask(updatedTask);
  },
  
  moveTask: async (taskId: string, newParentId: string | null, newOrder: number) => {
    const { tasks, updateTask } = get();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedTask = { ...task, parentId: newParentId, order: newOrder };
    await updateTask(updatedTask);
  },

  reorderTasks: async (updatedTasks: Task[]) => {
    const promises = updatedTasks.map(t => taskRepo.update(t));
    await Promise.all(promises);
    
    set((state) => {
      const newTasks = [...state.tasks];
      updatedTasks.forEach(ut => {
        const idx = newTasks.findIndex(t => t.id === ut.id);
        if (idx !== -1) newTasks[idx] = ut;
      });
      return { tasks: newTasks };
    });
  }
}));
