import { useState, useEffect } from 'react';

interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  triggerPath: string | null;
  createdAt: string;
}

interface WorkflowListProps {
  workflows: Workflow[];
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export function WorkflowList({
  workflows,
  onToggleStatus,
  onDelete,
  loading = false,
}: WorkflowListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        ワークフローがありません
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {workflows.map((workflow) => (
        <div
          key={workflow.id}
          className="p-4 hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  workflow.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <h3 className="font-medium text-gray-900">{workflow.name}</h3>
            </div>
            {workflow.triggerPath && (
              <p className="text-sm text-gray-500 mt-1 truncate">
                {workflow.triggerPath}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onToggleStatus && (
              <button
                onClick={() => onToggleStatus(workflow.id)}
                className={`px-3 py-1 text-sm rounded ${
                  workflow.status === 'active'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {workflow.status === 'active' ? '停止' : '開始'}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(workflow.id)}
                className="px-3 py-1 text-sm rounded bg-red-100 text-red-800 hover:bg-red-200"
              >
                削除
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
