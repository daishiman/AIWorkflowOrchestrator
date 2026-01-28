---
id: TASK-6-1
tier: 1
title: SkillSlice 実装（Zustand）
phase: 6
depends_on: [TASK-5-1]
parallel_with: []
blocks: [TASK-7A, TASK-7B, TASK-7C, TASK-7D]
status: pending
priority: high
estimated_complexity: medium
tags: [frontend, renderer, state-management]
---

# SkillSlice 実装（Zustand）

## 概要

スキル機能の状態管理を行う Zustand Slice を実装する。
既存の `ChatSlice`, `LLMSlice` パターンに準拠する。

## 入力

- TASK-5-1 で実装した SkillAPI
- TASK-1-1 で定義した型
- 既存の Slice パターン

## 出力

- `apps/desktop/src/renderer/store/slices/skillSlice.ts`
- 既存 store への統合

## 実装詳細

### Slice定義

```typescript
// apps/desktop/src/renderer/store/slices/skillSlice.ts

import { StateCreator } from "zustand";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillExecutionStatus,
  SkillStreamMessage,
  PermissionRequest,
} from "@repo/shared";

export interface SkillSlice {
  // 状態
  availableSkills: SkillMetadata[];
  importedSkills: ImportedSkill[];
  selectedSkillName: string | null;
  isExecuting: boolean;
  executionId: string | null;
  executionStatus: SkillExecutionStatus | null;
  streamingMessages: SkillStreamMessage[];
  pendingPermission: PermissionRequest | null;
  skillError: string | null;

  // ローディング状態
  isLoadingSkills: boolean;
  isScanning: boolean;
  isImporting: boolean;
  importingSkillName: string | null;

  // アクション
  fetchSkills: () => Promise<void>;
  rescanSkills: () => Promise<void>;
  importSkill: (skillName: string) => Promise<void>;
  removeSkill: (skillName: string) => Promise<void>;
  selectSkill: (skillName: string | null) => void;
  executeSkill: (prompt: string) => Promise<void>;
  abortExecution: () => void;
  respondToPermission: (approved: boolean, remember?: boolean) => void;
  clearError: () => void;
  clearStreamingMessages: () => void;

  // 内部アクション（IPCイベントハンドラ用）
  _handleStreamMessage: (msg: SkillStreamMessage) => void;
  _handleComplete: (executionId: string) => void;
  _handleError: (executionId: string, error: string) => void;
  _handlePermissionRequest: (req: PermissionRequest) => void;
}

export const createSkillSlice: StateCreator<SkillSlice> = (set, get) => ({
  // 初期状態
  availableSkills: [],
  importedSkills: [],
  selectedSkillName: null,
  isExecuting: false,
  executionId: null,
  executionStatus: null,
  streamingMessages: [],
  pendingPermission: null,
  skillError: null,

  isLoadingSkills: false,
  isScanning: false,
  isImporting: false,
  importingSkillName: null,

  // アクション実装
  fetchSkills: async () => {
    set({ isLoadingSkills: true, skillError: null });
    try {
      const [available, imported] = await Promise.all([
        window.electronAPI.skill.list(),
        window.electronAPI.skill.getImported(),
      ]);
      set({
        availableSkills: available,
        importedSkills: imported,
        isLoadingSkills: false,
      });
    } catch (error) {
      set({
        skillError: `スキル一覧の取得に失敗: ${error}`,
        isLoadingSkills: false,
      });
    }
  },

  rescanSkills: async () => {
    set({ isScanning: true, skillError: null });
    try {
      const available = await window.electronAPI.skill.rescan();
      const imported = await window.electronAPI.skill.getImported();
      set({
        availableSkills: available,
        importedSkills: imported,
        isScanning: false,
      });
    } catch (error) {
      set({
        skillError: `スキル再スキャンに失敗: ${error}`,
        isScanning: false,
      });
    }
  },

  importSkill: async (skillName) => {
    set({ isImporting: true, importingSkillName: skillName, skillError: null });
    try {
      const imported = await window.electronAPI.skill.import(skillName);
      set((state) => ({
        importedSkills: [...state.importedSkills, imported],
        availableSkills: state.availableSkills.filter(
          (s) => s.name !== skillName,
        ),
        isImporting: false,
        importingSkillName: null,
      }));
    } catch (error) {
      set({
        skillError: `スキルのインポートに失敗: ${error}`,
        isImporting: false,
        importingSkillName: null,
      });
    }
  },

  removeSkill: async (skillName) => {
    try {
      await window.electronAPI.skill.remove(skillName);
      set((state) => ({
        importedSkills: state.importedSkills.filter(
          (s) => s.name !== skillName,
        ),
        selectedSkillName:
          state.selectedSkillName === skillName
            ? null
            : state.selectedSkillName,
      }));
    } catch (error) {
      set({ skillError: `スキルの削除に失敗: ${error}` });
    }
  },

  selectSkill: (skillName) => {
    set({ selectedSkillName: skillName });
  },

  executeSkill: async (prompt) => {
    const { selectedSkillName } = get();
    if (!selectedSkillName) return;

    try {
      set({
        isExecuting: true,
        executionStatus: "running",
        streamingMessages: [],
        skillError: null,
      });

      const response = await window.electronAPI.skill.execute({
        skillName: selectedSkillName,
        prompt,
      });

      set({ executionId: response.executionId });
    } catch (error) {
      set({
        isExecuting: false,
        executionStatus: "error",
        skillError: `実行開始に失敗: ${error}`,
      });
    }
  },

  abortExecution: () => {
    const { executionId } = get();
    if (executionId) {
      window.electronAPI.skill.abort(executionId);
      set({
        isExecuting: false,
        executionStatus: "cancelled",
      });
    }
  },

  respondToPermission: (approved, remember = false) => {
    const { pendingPermission } = get();
    if (pendingPermission) {
      window.electronAPI.skill.respondToPermission({
        requestId: pendingPermission.requestId,
        approved,
        rememberChoice: remember,
      });
      set({ pendingPermission: null });
    }
  },

  clearError: () => set({ skillError: null }),

  clearStreamingMessages: () => set({ streamingMessages: [] }),

  // 内部ハンドラ
  _handleStreamMessage: (msg) => {
    set((state) => ({
      streamingMessages: [...state.streamingMessages, msg],
    }));
  },

  _handleComplete: (_executionId) => {
    set({
      isExecuting: false,
      executionStatus: "completed",
    });
  },

  _handleError: (_executionId, error) => {
    set({
      isExecuting: false,
      executionStatus: "error",
      skillError: error,
    });
  },

  _handlePermissionRequest: (req) => {
    set({
      pendingPermission: req,
      executionStatus: "permission_pending",
    });
  },
});
```

### IPCイベントリスナーの設定

```typescript
// apps/desktop/src/renderer/store/setupSkillListeners.ts

import { useAppStore } from "./index";

export function setupSkillListeners(): () => void {
  const store = useAppStore.getState();

  const unsubStream = window.electronAPI.skill.onStream(
    store._handleStreamMessage,
  );
  const unsubComplete = window.electronAPI.skill.onComplete(({ executionId }) =>
    store._handleComplete(executionId),
  );
  const unsubError = window.electronAPI.skill.onError(
    ({ executionId, error }) => store._handleError(executionId, error),
  );
  const unsubPermission = window.electronAPI.skill.onPermissionRequest(
    store._handlePermissionRequest,
  );

  return () => {
    unsubStream();
    unsubComplete();
    unsubError();
    unsubPermission();
  };
}
```

### 既存storeへの統合

```typescript
// apps/desktop/src/renderer/store/index.ts に追加

import { createSkillSlice, SkillSlice } from "./slices/skillSlice";

type AppStore = ChatSlice & LLMSlice & SkillSlice;

export const useAppStore = create<AppStore>()((...a) => ({
  ...createChatSlice(...a),
  ...createLLMSlice(...a),
  ...createSkillSlice(...a),
}));
```

## ファイル

| 操作 | パス                                                                  |
| ---- | --------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                |
| 作成 | `apps/desktop/src/renderer/store/setupSkillListeners.ts`              |
| 修正 | `apps/desktop/src/renderer/store/index.ts`                            |
| 作成 | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts` |

## 依存パッケージ

なし（既存パッケージのみ使用）

## 完了条件

- [ ] `SkillSlice` インターフェースが定義されている
- [ ] 全状態が定義されている
- [ ] 全アクションが実装されている
- [ ] ローディング状態が管理されている
- [ ] IPCイベントリスナーが設定されている
- [ ] 既存 store（`useAppStore`）に統合されている
- [ ] 単体テストが全て通過する

## テスト要件

### 単体テスト

```typescript
describe("skillSlice", () => {
  describe("fetchSkills", () => {
    it("should fetch available and imported skills");
    it("should handle errors");
  });

  describe("importSkill", () => {
    it("should import skill and update state");
    it("should handle errors");
  });

  describe("removeSkill", () => {
    it("should remove skill from imported list");
    it("should clear selection if removed skill was selected");
  });

  describe("executeSkill", () => {
    it("should start execution");
    it("should not execute if no skill selected");
  });

  describe("_handleStreamMessage", () => {
    it("should append message to streamingMessages");
  });

  describe("_handlePermissionRequest", () => {
    it("should set pendingPermission");
  });
});
```

## 参考資料

- [specification.md - 5.5 Zustand Store設計](../specification.md)
- 既存パターン: `apps/desktop/src/renderer/store/slices/chatSlice.ts`
