import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ChevronRight, ChevronDown, Check, Edit2, Plus, Trash2, Copy } from 'lucide-react';
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
      "relative min-w-[240px] max-w-[320px] backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-xl transition-all duration-300 ease-out group",
      task.isCompleted 
        ? "bg-white/40 dark:bg-gray-900/40 border-emerald-400/50 shadow-emerald-500/10 opacity-75 grayscale-[20%]" 
        : "bg-white/80 dark:bg-gray-800/80 hover:shadow-cyan-500/20 hover:border-cyan-400/50 hover:-translate-y-0.5"
    )}>
      {/* Target handle - Left side (always visible so we can connect isolated elements) */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white dark:border-gray-800 shadow-md transition-transform hover:scale-125 hover:shadow-cyan-500/50"
      />

      <div className="p-3 flex items-start gap-2">
        {/* Complete Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={cn(
            "mt-0.5 w-5 h-5 flex items-center justify-center rounded-lg border transition-all duration-300 shrink-0",
            task.isCompleted
              ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-transparent text-white shadow-inner"
              : "border-gray-300 dark:border-gray-600 hover:border-cyan-500/80 bg-white/50 dark:bg-gray-900/50 hover:shadow-[0_0_8px_rgba(6,182,212,0.5)]"
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
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 px-3 py-1.5 flex items-center justify-between text-gray-400 bg-white/30 dark:bg-gray-900/30 rounded-b-2xl transition-colors">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 hover:text-cyan-600 hover:bg-cyan-500/10 rounded-lg transition-all hover:scale-110 active:scale-95"
            title="Edit task"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => useAppStore.getState().duplicateTask(task.id)}
            className="p-1.5 hover:text-purple-600 hover:bg-purple-500/10 rounded-lg transition-all hover:scale-110 active:scale-95"
            title="Duplicate task"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-all hover:scale-110 active:scale-95"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-1">
           <button
            onClick={handleToggleExpand}
            className="p-1.5 hover:text-gray-900 dark:hover:text-white hover:bg-gray-500/10 rounded-lg transition-all active:scale-95"
            title={task.isExpanded ? "Collapse children" : "Expand children"}
          >
            {task.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <button
            onClick={handleAddSubTask}
            className="p-1.5 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all hover:scale-110 active:scale-95"
            title="Add subtask"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Checklist section */}
      {task.isExpanded && (
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/20 dark:bg-gray-900/20 px-3 py-2 text-sm rounded-b-2xl">
          <div className="flex flex-col gap-1.5">
            {task.checklist?.map((item, idx) => (
              <div key={item.id || idx} className="flex gap-2 items-center group/item hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-lg transition-colors">
                <button
                  onClick={() => handleToggleChecklistItem(item.id)}
                  className={cn(
                    "w-4 h-4 flex items-center justify-center rounded border shrink-0 transition-all duration-300",
                    item.isCompleted 
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-transparent text-white" 
                      : "border-gray-300 dark:border-gray-600 hover:border-cyan-500 bg-white/50 dark:bg-gray-900/50"
                  )}
                >
                  {item.isCompleted && <Check size={10} strokeWidth={3} />}
                </button>
                <span className={cn(
                  "flex-1 text-xs truncate transition-all", 
                  item.isCompleted ? "line-through text-gray-400 opacity-60" : "text-gray-700 dark:text-gray-200 font-medium"
                )}>
                  {item.title}
                </span>
                <button
                  onClick={() => handleDeleteChecklistItem(item.id)}
                  className="opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-rose-500 transition-all p-1 hover:scale-110"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            
            <form onSubmit={handleAddChecklistItem} className="flex gap-2 items-center mt-2 bg-black/5 dark:bg-white/5 rounded-lg px-2 py-1.5 border border-transparent focus-within:border-cyan-500/30 focus-within:bg-white/50 dark:focus-within:bg-gray-900/50 transition-all">
              <Plus size={12} className="text-cyan-500 shrink-0" />
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Add checklist item..."
                className="flex-1 bg-transparent text-xs outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 font-medium"
              />
            </form>
          </div>
        </div>
      )}

      {/* Source handle - Right side (for connecting out to children) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-white dark:border-gray-800 shadow-md transition-transform hover:scale-125 hover:shadow-indigo-500/50"
      />
    </div>
  );
}
