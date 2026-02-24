import React, { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useAppStore } from '../store/useAppStore';
import TaskNode, { TaskNodeData } from './TaskNode';
import { Task } from '../domain/task';

const nodeTypes: NodeTypes = {
  customTask: TaskNode as any,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 100;

function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'LR') {
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    let position = node.position;
    const taskPos = (node.data as any).task.position;

    if (!taskPos) {
      position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };
    }

    return {
      ...node,
      position,
      targetPosition: 'left' as any,
      sourcePosition: 'right' as any,
    };
  });

  return { nodes: layoutedNodes, edges };
}

interface WhiteboardTreeProps {
  projectTasks: Task[];
}

function Flow({ projectTasks }: WhiteboardTreeProps) {
  const { updateTaskPosition, moveTask } = useAppStore();
  const { fitView } = useReactFlow();

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    projectTasks.forEach((task) => {
      nodes.push({
        id: task.id,
        type: 'customTask',
        position: task.position || { x: 0, y: 0 },
        data: {
          task,
          isRoot: task.parentId === null,
        } as any,
      });

      if (task.parentId) {
        const parentExists = projectTasks.some(t => t.id === task.parentId);
        if (parentExists) {
          edges.push({
            id: `e-${task.parentId}-${task.id}`,
            source: task.parentId,
            target: task.id,
            type: 'smoothstep',
            animated: !task.isCompleted,
            style: { stroke: task.isCompleted ? '#9ca3af' : '#06b6d4', strokeWidth: 2 } // Cyan stroke
          });
        }
      }
    });

    const visibleNodeIds = new Set<string>();
    
    const collectVisible = (parentId: string | null) => {
      projectTasks.filter(t => t.parentId === parentId).forEach(child => {
        visibleNodeIds.add(child.id);
        if (child.isExpanded) {
          collectVisible(child.id);
        }
      });
    };
    
    collectVisible(null);

    const visibleNodes = nodes.filter(n => visibleNodeIds.has(n.id) || projectTasks.find(t => t.id === n.id)?.parentId === null);

    const layouted = getLayoutedElements(visibleNodes, edges, 'LR');
    return { initialNodes: layouted.nodes, initialEdges: layouted.edges };
  }, [projectTasks]);

  const [nodes, setNodes] = React.useState<Node[]>([]);
  const [edges, setEdges] = React.useState<Edge[]>([]);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  useEffect(() => {
    if (nodes.length > 0) {
       setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
    }
  }, [nodes.length, fitView]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      
      changes.forEach(change => {
        if (change.type === 'position' && change.dragging === false && change.position) {
            updateTaskPosition(change.id, change.position);
        }
      });
    },
    [updateTaskPosition]
  );

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      deletedNodes.forEach(node => {
        useAppStore.getState().deleteTask(node.id);
      });
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      deletedEdges.forEach(edge => {
        const taskId = edge.target;
        useAppStore.getState().moveTask(taskId, null, 0);
      });
    },
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
         moveTask(params.target, params.source, 0); 
      }
    },
    [moveTask]
  );

  return (
    <div className="w-full h-full"> {/* Parent page controls bg */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodesDelete={onNodesDelete}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls className="backdrop-blur-md bg-white/20 dark:bg-gray-800/20 border-white/20 rounded-lg overflow-hidden [&_button]:bg-white/80 dark:[&_button]:bg-gray-800/80 [&_button]:border-b-gray-200 dark:[&_button]:border-b-gray-700 [&_svg]:fill-gray-700 dark:[&_svg]:fill-gray-200" />
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} className="opacity-40" />
      </ReactFlow>
    </div>
  );
}

export function WhiteboardTree({ projectTasks }: WhiteboardTreeProps) {
  return (
    <ReactFlowProvider>
      <Flow projectTasks={projectTasks} />
    </ReactFlowProvider>
  );
}
