import { Task } from '../domain/task';

export interface TaskRepository {
  /**
   * Get all tasks for a given project
   */
  getByProject(projectId: string): Promise<Task[]>;

  /**
   * Create a new task
   */
  create(task: Task): Promise<Task>;

  /**
   * Update an existing task
   */
  update(task: Task): Promise<void>;

  /**
   * Delete a task
   */
  delete(id: string): Promise<void>;
}
