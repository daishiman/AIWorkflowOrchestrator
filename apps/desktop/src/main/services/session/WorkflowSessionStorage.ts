/**
 * WorkflowSessionStorage - workflow checkpoint 専用の electron-store wrapper
 * TASK-SDK-08: generic agent-sessions store とは別 store に分離する。
 */

import Store from "electron-store";
import type {
  SkillCreatorPersistedWorkflowCheckpoint,
  WorkflowSessionStorageSchema,
} from "@repo/shared/types";

const SCHEMA_VERSION = "task-sdk-08-v1";

export interface WorkflowSessionStorageOptions {
  name?: string;
}

export class WorkflowSessionStorage {
  private store: Store<WorkflowSessionStorageSchema>;

  constructor(options: WorkflowSessionStorageOptions = {}) {
    const name = options.name || "skill-creator-workflow-sessions";

    this.store = new Store<WorkflowSessionStorageSchema>({
      name,
      defaults: {
        checkpoints: {},
        metadata: {
          version: SCHEMA_VERSION,
          lastUpdated: Date.now(),
        },
      },
    });
  }

  getCheckpoint(
    planId: string,
  ): SkillCreatorPersistedWorkflowCheckpoint | undefined {
    const checkpoints = this.store.get("checkpoints") || {};
    return checkpoints[planId];
  }

  getAllCheckpoints(): Record<string, SkillCreatorPersistedWorkflowCheckpoint> {
    return this.store.get("checkpoints") || {};
  }

  setCheckpoint(
    planId: string,
    checkpoint: SkillCreatorPersistedWorkflowCheckpoint,
  ): void {
    const checkpoints = this.store.get("checkpoints") || {};
    checkpoints[planId] = checkpoint;
    this.store.set("checkpoints", checkpoints);
    this.updateMetadataTimestamp();
  }

  deleteCheckpoint(planId: string): void {
    const checkpoints = this.store.get("checkpoints") || {};
    delete checkpoints[planId];
    this.store.set("checkpoints", checkpoints);
    this.updateMetadataTimestamp();
  }

  clear(): void {
    this.store.clear();
    this.store.set("checkpoints", {});
    this.store.set("metadata", {
      version: SCHEMA_VERSION,
      lastUpdated: Date.now(),
    });
  }

  get path(): string {
    return this.store.path;
  }

  private updateMetadataTimestamp(): void {
    this.store.set("metadata", {
      version: SCHEMA_VERSION,
      lastUpdated: Date.now(),
    });
  }
}
