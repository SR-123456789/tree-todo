import { Task } from '../../domain/task';
import { TaskRepository } from '../task.repository';

const STORAGE_KEY = 'task-tree-tasks';

export class LocalTaskRepository implements TaskRepository {
  private getTasksFromStorage(): Task[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveTasksToStorage(tasks: Task[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }

  async getByProject(projectId: string): Promise<Task[]> {
    const tasks = this.getTasksFromStorage();
    return tasks.filter((t) => t.projectId === projectId);
  }

  async create(task: Task): Promise<Task> {
    const tasks = this.getTasksFromStorage();
    tasks.push(task);
    this.saveTasksToStorage(tasks);
    return task;
  }

  async update(task: Task): Promise<void> {
    const tasks = this.getTasksFromStorage();
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      tasks[index] = {
        ...task,
        updatedAt: new Date().toISOString(),
      };
      this.saveTasksToStorage(tasks);
    }
  }

  async delete(id: string): Promise<void> {
    let tasks = this.getTasksFromStorage();
    
    // Need to recursively delete all children.
    // Let's create a helper function to find all dependent children.
    const idsToDelete = new Set<string>();
    
    const collectChildren = (parentId: string) => {
      idsToDelete.add(parentId);
      for (const t of tasks) {
        if (t.parentId === parentId) {
          collectChildren(t.id);
        }
      }
    };
    
    collectChildren(id);
    
    tasks = tasks.filter((t) => !idsToDelete.has(t.id));
    this.saveTasksToStorage(tasks);
  }
}
