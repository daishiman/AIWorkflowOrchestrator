export type AgentFloatingStatus = "executing" | "completed" | "failed" | "idle";

export type AgentPermissionMode =
  | "default"
  | "acceptEdits"
  | "bypassPermissions"
  | "plan";

export interface ModelCardItem {
  providerId: string;
  modelId: string;
  displayName: string;
  description?: string;
  healthStatus: "healthy" | "degraded" | "unavailable" | "unknown";
  isSelected: boolean;
}
