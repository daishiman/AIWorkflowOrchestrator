/**
 * ワークフロー関連の型定義
 */

export type WorkflowStatus = 'active' | 'inactive';

export type WorkflowType = 'file_watch';

export interface WorkflowBase {
  id: string;
  name: string;
  type: WorkflowType;
  triggerPath: string | null;
  status: WorkflowStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ExecutionBase {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  inputPayload: Record<string, unknown> | null;
  outputPayload: Record<string, unknown> | null;
  errorMessage: string | null;
  retryCount: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogBase {
  id: string;
  executionId: string;
  level: LogLevel;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
