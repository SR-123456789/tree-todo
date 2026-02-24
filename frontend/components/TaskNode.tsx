import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ChevronRight, ChevronDown, Check, Edit2, Plus, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { Task } from '../domain/task';
import { useAppStore } from '../store/useAppStore';

export type TaskNodeData = {
  task: Task;
  isRoot: boolean;
};

export default function TaskNode({ data }: { data: TaskNodeData }) {
  const { task, isRoot } = data;
  const { updateTask, deleteTask, addTask } = useAppStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;

    const newItem = {
      id: crypto.randomUUID(),
      title: newChecklistTitle.trim(),
      isCompleted: false,
    };

    updateTask({
      ...task,
      checklist: [...(task.checklist || []), newItem]
    });
    setNewChecklistTitle('');
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!task.checklist) return;
    updateTask({
      ...task,
      checklist: task.checklist.map(item => 
        item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
      )
    });
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    if (!task.checklist) return;
    updateTask({
      ...task,
      checklist: task.checklist.filter(item => item.id !== itemId)
    });
  };

  const handleToggleComplete = () => {
    updateTask({ ...task, isCompleted: !task.isCompleted });
  };

  const handleToggleExpand = () => {
    updateTask({ ...task, isExpanded: !task.isExpanded });
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      updateTask({ ...task, title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleAddSubTask = () => {
    addTask(task.projectId, task.id, 'New Task');
    if (!task.isExpanded) {
      updateTask({ ...task, isExpanded: true });
    }
  };

  return (
    <div className={cn(
      "relative min-w-[200px] bg-white dark:bg-gray-800 border-2 rounded-xl shadow-sm transition-all group",
      task.isCompleted ? "border-emerald-500/50 opacity-80" : "border-gray-200 dark:border-gray-700",
      "hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500"
    )}>
      {/* Target handle - Left side (for children connecting to parents) */}
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-blue-500 border-2 border-white dark:border-gray-800"
        />
      )}

      <div className="p-3 flex items-start gap-2">
        {/* Complete Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={cn(
            "mt-0.5 w-5 h-5 flex items-center justify-center rounded border transition-colors shrink-0",
            task.isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-300 dark:border-gray-600 hover:border-emerald-500 bg-gray-50 dark:bg-gray-900"
          )}
        >
          {task.isCompleted && <Check size={14} strokeWidth={3} />}
        </button>

        {/* Title Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {isEditing ? (
            <input
              autoFocus
              className="w-full bg-blue-50/50 dark:bg-gray-900/50 border border-blue-400 rounded px-2 py-0.5 text-sm outline-none text-gray-900 dark:text-gray-100"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div 
              className={cn(
                "text-sm font-medium leading-relaxed truncate cursor-text",
                task.isCompleted && "line-through text-gray-400 dark:text-gray-500"
              )}
              onDoubleClick={() => setIsEditing(true)}
            >
              {task.title}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar (Below Title) */}
      <div className="border-t border-gray-100 dark:border-gray-700/50 px-2 py-1 flex items-center justify-between text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-xl">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
            title="Edit task"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-1">
           <button
            onClick={handleToggleExpand}
            className="p-1 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            title={task.isExpanded ? "Collapse children" : "Expand children"}
          >
            {task.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <button
            onClick={handleAddSubTask}
            className="p-1 text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors"
            title="Add subtask"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Checklist section */}
      {task.isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/30 p-2 text-sm rounded-b-xl">
          <div className="flex flex-col gap-1.5">
            {task.checklist?.map((item, idx) => (
              <div key={item.id || idx} className="flex gap-2 items-center group/item hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded transition-colors">
                <button
                  onClick={() => handleToggleChecklistItem(item.id)}
                  className={cn(
                    "w-4 h-4 flex items-center justify-center rounded border shrink-0 transition-colors",
                    item.isCompleted 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "border-gray-300 dark:border-gray-600 hover:border-emerald-500 bg-white dark:bg-gray-900"
                  )}
                >
                  {item.isCompleted && <Check size={12} strokeWidth={3} />}
                </button>
                <span className={cn(
                  "flex-1 text-xs truncate", 
                  item.isCompleted ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-300"
                )}>
                  {item.title}
                </span>
                <button
                  onClick={() => handleDeleteChecklistItem(item.id)}
                  className="opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-0.5"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            
            <form onSubmit={handleAddChecklistItem} className="flex gap-2 items-center mt-1">
              <Plus size={14} className="text-gray-400 shrink-0 mx-1" />
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Add checklist item..."
                className="flex-1 bg-transparent text-xs outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400"
              />
            </form>
          </div>
        </div>
      )}

      {/* Source handle - Right side (for connecting out to children) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white dark:border-gray-800"
      />
    </div>
  );
}
