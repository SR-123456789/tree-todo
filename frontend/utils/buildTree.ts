import { Task, TreeNode } from '../domain/task';

export function buildTree(tasks: Task[]): TreeNode[] {
  const taskMap = new Map<string, TreeNode>();
  
  // First, map all tasks to TreeNodes
  tasks.forEach((task) => {
    taskMap.set(task.id, { task, children: [] });
  });

  const rootNodes: TreeNode[] = [];

  // Then build the tree by assigning children to their parents
  tasks.forEach((task) => {
    const node = taskMap.get(task.id);
    if (!node) return;

    if (task.parentId === null) {
      rootNodes.push(node);
    } else {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // If parent is not found (orphaned), push to root to be safe
        rootNodes.push(node);
      }
    }
  });

  // Sort nodes by order at each level
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.task.order - b.task.order);
    nodes.forEach((node) => sortNodes(node.children));
  };
  
  sortNodes(rootNodes);

  return rootNodes;
}
