/**
 * agentSlice Permission関連テスト
 * TDD: Red Phase - 実装前にテストを作成
 */
import { describe, it, expect, beforeEach } from "vitest";
import { createAgentSlice, type AgentSlice } from "../agentSlice";
import type { PermissionRequest } from "@repo/shared/types/agent";

// テスト用のモックPermissionRequest
const mockPermissionRequest: PermissionRequest = {
  executionId: "exec-123",
  requestId: "req-456",
  toolName: "Bash",
  args: {
    command: "npm install",
  },
  reason: "Installing dependencies",
};

describe("agentSlice permission", () => {
  let store: AgentSlice;

  beforeEach(() => {
    // Zustandのset関数をモック
    const set = (
      partial:
        | Partial<AgentSlice>
        | ((state: AgentSlice) => Partial<AgentSlice>),
    ) => {
      if (typeof partial === "function") {
        Object.assign(store, partial(store));
      } else {
        Object.assign(store, partial);
      }
    };
    store = createAgentSlice(
      set as never,
      () => store as never,
      store as never,
    );
  });

  describe("setPermissionRequest", () => {
    it("should set pending permission request", () => {
      // Act
      store.setPermissionRequest?.(mockPermissionRequest);

      // Assert
      expect(store.executionState?.pendingPermission).toEqual(
        mockPermissionRequest,
      );
    });

    it("should set status to awaiting_permission", () => {
      // Act
      store.setPermissionRequest?.(mockPermissionRequest);

      // Assert
      expect(store.executionState?.status).toBe("awaiting_permission");
    });

    it("should clear pending permission when null", () => {
      // Arrange
      store.setPermissionRequest?.(mockPermissionRequest);

      // Act
      store.setPermissionRequest?.(null);

      // Assert
      expect(store.executionState?.pendingPermission).toBeNull();
    });
  });

  describe("respondToPermission", () => {
    beforeEach(() => {
      // 事前にPermissionRequestを設定
      store.setPermissionRequest?.(mockPermissionRequest);
    });

    it("should clear pending permission on approve", () => {
      // Act
      store.respondToPermission?.({
        requestId: "req-456",
        approved: true,
      });

      // Assert
      expect(store.executionState?.pendingPermission).toBeNull();
    });

    it("should clear pending permission on deny", () => {
      // Act
      store.respondToPermission?.({
        requestId: "req-456",
        approved: false,
      });

      // Assert
      expect(store.executionState?.pendingPermission).toBeNull();
    });

    it("should set status back to executing", () => {
      // Act
      store.respondToPermission?.({
        requestId: "req-456",
        approved: true,
      });

      // Assert
      expect(store.executionState?.status).toBe("executing");
    });
  });

  describe("rememberPermissionChoice", () => {
    it("should remember approved choice for tool", () => {
      // Act
      store.rememberPermissionChoice?.("Bash", true);

      // Assert
      expect(store.executionState?.rememberedChoices?.["Bash"]).toBe(true);
    });

    it("should remember denied choice for tool", () => {
      // Act
      store.rememberPermissionChoice?.("Bash", false);

      // Assert
      expect(store.executionState?.rememberedChoices?.["Bash"]).toBe(false);
    });

    it("should overwrite previous choice", () => {
      // Arrange
      store.rememberPermissionChoice?.("Bash", true);

      // Act
      store.rememberPermissionChoice?.("Bash", false);

      // Assert
      expect(store.executionState?.rememberedChoices?.["Bash"]).toBe(false);
    });
  });

  describe("getRememberedChoice", () => {
    it("should return remembered choice for known tool", () => {
      // Arrange
      store.rememberPermissionChoice?.("Bash", true);

      // Act
      const choice = store.getRememberedChoice?.("Bash");

      // Assert
      expect(choice).toBe(true);
    });

    it("should return undefined for unknown tool", () => {
      // Act
      const choice = store.getRememberedChoice?.("UnknownTool");

      // Assert
      expect(choice).toBeUndefined();
    });
  });

  describe("clearRememberedChoices", () => {
    it("should clear all remembered choices", () => {
      // Arrange
      store.rememberPermissionChoice?.("Bash", true);
      store.rememberPermissionChoice?.("Read", false);

      // Act
      store.clearRememberedChoices?.();

      // Assert
      expect(store.executionState?.rememberedChoices).toEqual({});
    });
  });
});
