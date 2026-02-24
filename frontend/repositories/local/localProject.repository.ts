import { Project } from '../../domain/project';
import { ProjectRepository } from '../project.repository';

const STORAGE_KEY = 'task-tree-projects';

export class LocalProjectRepository implements ProjectRepository {
  private getProjectsFromStorage(): Project[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveProjectsToStorage(projects: Project[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }

  async getAll(): Promise<Project[]> {
    return this.getProjectsFromStorage();
  }

  async create(title: string): Promise<Project> {
    const projects = this.getProjectsFromStorage();
    const newProject: Project = {
      id: crypto.randomUUID(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.push(newProject);
    this.saveProjectsToStorage(projects);
    return newProject;
  }

  async update(id: string, title: string): Promise<void> {
    const projects = this.getProjectsFromStorage();
    const index = projects.findIndex((p) => p.id === id);
    if (index !== -1) {
      projects[index].title = title;
      projects[index].updatedAt = new Date().toISOString();
      this.saveProjectsToStorage(projects);
    }
  }

  async delete(id: string): Promise<void> {
    const projects = this.getProjectsFromStorage();
    const newProjects = projects.filter((p) => p.id !== id);
    this.saveProjectsToStorage(newProjects);
    
    // Also delete associated tasks for this project
    const TASK_STORAGE_KEY = 'task-tree-tasks';
    if (typeof window !== 'undefined') {
      const tasksData = localStorage.getItem(TASK_STORAGE_KEY);
      if (tasksData) {
        const tasks: any[] = JSON.parse(tasksData);
        const filteredTasks = tasks.filter((t) => t.projectId !== id);
        localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(filteredTasks));
      }
    }
  }
}
