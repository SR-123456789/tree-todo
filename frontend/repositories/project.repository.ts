import { Project } from '../domain/project';

export interface ProjectRepository {
  /**
   * Return all projects
   */
  getAll(): Promise<Project[]>;

  /**
   * Create a new project
   */
  create(title: string): Promise<Project>;

  /**
   * Update an existing project
   */
  update(id: string, title: string): Promise<void>;

  /**
   * Delete a project
   */
  delete(id: string): Promise<void>;
}
