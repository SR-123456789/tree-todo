export interface TaskItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  isCompleted: boolean;
  order: number;
  isExpanded: boolean;
  position?: { x: number, y: number };
  checklist?: TaskItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TreeNode {
  task: Task;
  children: TreeNode[];
}
