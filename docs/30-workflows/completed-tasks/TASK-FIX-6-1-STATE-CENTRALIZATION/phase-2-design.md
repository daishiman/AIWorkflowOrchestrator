# Phase 2: 設計

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-6-1-STATE-CENTRALIZATION         |
| タスク名   | スキル状態管理のZustand集約（仕様書準拠） |
| Phase      | 2 - 設計                                  |
| 分類       | リファクタリング                          |
| 作成日     | 2026-02-09                                |
| 最終更新日 | 2026-02-09                                |
| 依存       | Phase 1: phase-1-requirements.md          |

---

## 1. 設計概要

### 1.1 設計方針

本タスクでは、仕様書`arch-state-management.md`に準拠し、全てのスキル関連状態をagentSliceに集約する。設計の基本方針は以下のとおり。

| 方針                   | 詳細                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Single Source of Truth | 全てのスキル状態はagentSliceに集約し、他のSlice・Hook・コンポーネントはagentSliceを参照する |
| 段階的移行             | skillSliceの状態を段階的にagentSliceへ移行し、各段階でテストを実行して品質を担保する        |
| 後方互換性維持         | useSkillExecution, useSkillStoreのAPIは変更せず、内部実装のみ変更する                       |
| Race Condition対策     | executionIdの事前生成パターンでストリームメッセージ損失を防止する                           |

### 1.2 変更対象ファイル一覧

| ファイル                        | 変更種別 | 変更内容                                         |
| ------------------------------- | -------- | ------------------------------------------------ |
| `store/slices/agentSlice.ts`    | 拡張     | skillSliceの状態・アクション・内部ハンドラを統合 |
| `store/slices/skillSlice.ts`    | 削除     | 全内容をagentSliceに移行後、削除                 |
| `store/index.ts`                | 変更     | SkillSlice参照を削除、useSkillStore実装を変更    |
| `store/setupSkillListeners.ts`  | 変更     | agentSliceを参照するよう変更                     |
| `hooks/useSkillExecution.ts`    | 変更     | agentSliceをデータソースに変更                   |
| `views/AgentView/index.tsx`     | 変更     | 直接IPC呼び出しをagentSliceアクション経由に変更  |
| `components/chat/ChatPanel.tsx` | 微修正   | セレクターパスの調整（必要に応じて）             |

---

## 2. 統合後のAgentSlice設計

### 2.1 状態インターフェース設計

統合後のAgentStateインターフェース。論理的なグループでセクション分けする。

```typescript
/**
 * agentSlice統合状態インターフェース
 * @see arch-state-management.md
 */
export interface AgentState {
  // ============================================
  // スキル管理（Skill Management）
  // ============================================

  /** インポート済みスキル一覧（Skill[]型を使用） */
  skills: Skill[];

  /** 利用可能なスキル一覧（未インポート） */
  availableSkills: Skill[];

  /** インポート済みスキルID一覧 */
  importedSkillIds: string[];

  /** 選択中のスキル（nullは未選択） */
  selectedSkill: Skill | null;

  /** スキルフィルター文字列 */
  skillFilter: string;

  /** スキルカテゴリフィルター */
  skillCategory: SkillCategory | null;

  /** インポートダイアログ表示状態 */
  isImportDialogOpen: boolean;

  /** トーストメッセージ */
  toastMessage: { type: "success" | "error"; message: string } | null;

  // ============================================
  // スキル実行状態（Skill Execution）
  // ============================================

  /** 実行中フラグ */
  isExecuting: boolean;

  /** 現在の実行ID（Race Condition対策: IPC呼び出し前に設定） */
  currentExecutionId: string | null;

  /** 実行ステータス */
  executionStatus: SkillExecutionStatus | null;

  /** ストリーミングメッセージ一覧 */
  streamingMessages: SkillStreamMessage[];

  /** 実行出力（レガシー互換） */
  executionOutput: string[];

  /** 実行エラー */
  executionError: string | null;

  // ============================================
  // 権限管理（Permission Management）
  // ============================================

  /** 保留中の権限リクエスト */
  pendingPermission: SkillPermissionRequest | null;

  /** 記憶された権限選択 */
  rememberedPermissionChoices: Record<string, boolean>;

  // ============================================
  // ローディング状態（Loading States）
  // ============================================

  /** スキル一覧読み込み中 */
  isLoadingSkills: boolean;

  /** スキルスキャン中 */
  isScanning: boolean;

  /** スキルインポート中 */
  isImporting: boolean;

  /** インポート中のスキル名 */
  importingSkillName: string | null;

  /** 汎用ローディング状態 */
  isLoading: boolean;

  // ============================================
  // エラー状態（Error States）
  // ============================================

  /** 汎用エラーメッセージ */
  error: string | null;

  // ============================================
  // プレビュー関連（Preview - AGENT-006）
  // ============================================

  /** プレビューコンテンツ */
  previewContent: PreviewContent | null;

  /** 選択中の環境タイプ */
  selectedEnvironment: EnvironmentType;

  /** 分割比率 (0-100) */
  splitRatio: number;
}
```

### 2.2 アクションインターフェース設計

```typescript
/**
 * agentSlice統合アクションインターフェース
 */
export interface AgentActions {
  // ============================================
  // スキル管理アクション
  // ============================================

  /** スキル一覧を設定 */
  setSkills: (skills: Skill[]) => void;

  /** 利用可能スキル一覧を設定 */
  setAvailableSkills: (skills: Skill[]) => void;

  /** スキルを選択 */
  selectSkill: (skill: Skill | null) => void;

  /** スキル名でスキルを選択 */
  selectSkillByName: (skillName: string | null) => void;

  /** フィルター文字列を設定 */
  setSkillFilter: (filter: string) => void;

  /** カテゴリフィルターを設定 */
  setSkillCategory: (category: SkillCategory | null) => void;

  /** インポートダイアログを開く */
  openImportDialog: () => void;

  /** インポートダイアログを閉じる */
  closeImportDialog: () => void;

  /** トーストを表示 */
  showToast: (type: "success" | "error", message: string) => void;

  /** トーストをクリア */
  clearToast: () => void;

  // ============================================
  // スキルAPIアクション（IPC経由）
  // ============================================

  /** スキル一覧を取得（IPC: skill:list, skill:getImported） */
  fetchSkills: () => Promise<void>;

  /** スキルを再スキャン（IPC: skill:rescan） */
  rescanSkills: () => Promise<void>;

  /** スキルをインポート（IPC: skill:import） */
  importSkill: (skillName: string) => Promise<void>;

  /** スキルを削除（IPC: skill:remove） */
  removeSkill: (skillName: string) => Promise<void>;

  // ============================================
  // スキル実行アクション
  // ============================================

  /** スキルを実行（Race Condition対策付き） */
  executeSkill: (prompt: string) => Promise<void>;

  /** 実行を中断 */
  abortExecution: () => void;

  /** 実行状態を設定 */
  setExecutionStatus: (status: SkillExecutionStatus | null) => void;

  /** 出力を追加（レガシー互換） */
  appendOutput: (output: string) => void;

  /** 実行をクリア */
  clearExecution: () => void;

  /** ストリーミングメッセージをクリア */
  clearStreamingMessages: () => void;

  /** 実行エラーをクリア */
  clearExecutionError: () => void;

  // ============================================
  // 権限アクション
  // ============================================

  /** 権限リクエストに応答 */
  respondToPermission: (approved: boolean, remember?: boolean) => void;

  /** 権限リクエストを設定（内部用） */
  setPermissionRequest: (request: SkillPermissionRequest | null) => void;

  /** 記憶された選択を取得 */
  getRememberedChoice: (toolName: string) => boolean | undefined;

  /** 記憶された選択をクリア */
  clearRememberedChoices: () => void;

  // ============================================
  // 内部ハンドラ（IPCイベント処理用）
  // ============================================

  /** ストリームメッセージを処理 */
  _handleStreamMessage: (msg: SkillStreamMessage) => void;

  /** 実行完了を処理 */
  _handleComplete: (executionId: string) => void;

  /** 実行エラーを処理 */
  _handleError: (executionId: string, error: string) => void;

  /** 権限リクエストを処理 */
  _handlePermissionRequest: (req: SkillPermissionRequest) => void;

  // ============================================
  // 共通アクション
  // ============================================

  /** ローディング状態を設定 */
  setLoading: (isLoading: boolean) => void;

  /** エラーを設定 */
  setError: (error: string | null) => void;

  /** 状態をリセット */
  resetAgentState: () => void;

  // ============================================
  // プレビューアクション（AGENT-006）
  // ============================================

  /** プレビューコンテンツを設定 */
  setPreviewContent: (content: PreviewContent | null) => void;

  /** 環境タイプを設定 */
  setSelectedEnvironment: (type: EnvironmentType) => void;

  /** 分割比率を設定 */
  setSplitRatio: (ratio: number) => void;

  /** プレビューをクリア */
  clearPreview: () => void;
}
```

### 2.3 状態マッピング（skillSlice → agentSlice）

既存のskillSlice状態とagentSlice状態のマッピング。

| skillSliceプロパティ      | 統合後agentSliceプロパティ                    | 変更点                      |
| ------------------------- | --------------------------------------------- | --------------------------- | ---------------- | ----------------------------------------- |
| `availableSkillsMetadata` | `availableSkills`                             | 型をSkill[]に統一、命名変更 |
| `importedSkills`          | `skills`                                      | 既存の`skills`に統合        |
| `selectedSkillName`       | 新規追加（selectSkillByNameアクションで対応） | Skill                       | null から string | null への変換が必要な場合はゲッターを提供 |
| `isExecuting`             | `isExecuting`                                 | そのまま移行                |
| `executionId`             | `currentExecutionId`                          | 既存の名前を維持            |
| `skillExecutionStatus`    | `executionStatus`                             | 命名を統一                  |
| `streamingMessages`       | `streamingMessages`                           | そのまま移行                |
| `pendingPermission`       | `pendingPermission`                           | そのまま移行                |
| `skillError`              | `executionError`                              | 命名を明確化                |
| `isLoadingSkills`         | `isLoadingSkills`                             | そのまま移行                |
| `isScanning`              | `isScanning`                                  | そのまま移行                |
| `isImporting`             | `isImporting`                                 | そのまま移行                |
| `importingSkillName`      | `importingSkillName`                          | そのまま移行                |

---

## 3. Race Condition対策設計

### 3.1 問題の詳細分析

現在の実装フローの問題点。

```
[現在の実装]
┌─────────────────────────────────────────────────────────────────┐
│ 1. executeSkill(prompt) 呼び出し                                 │
│ 2. set({ isExecuting: true, streamingMessages: [] })            │
│ 3. await window.electronAPI.skill.execute({...})                │
│    └─→ Main Process で実行開始                                   │
│        └─→ ストリームメッセージ送信開始 ←─── (A) ここでメッセージ到着可能 │
│ 4. response = await (IPC応答)                                    │
│ 5. set({ executionId: response.executionId }) ←─── (B) ここでID設定 │
└─────────────────────────────────────────────────────────────────┘

問題: (A)で到着したメッセージは(B)より前のため、executionIdが未設定。
      _handleStreamMessageでexecutionIdチェックすると、これらのメッセージは破棄される。
```

### 3.2 解決策: executionIdの事前生成

```
[修正後の実装]
┌─────────────────────────────────────────────────────────────────┐
│ 1. executeSkill(prompt) 呼び出し                                 │
│ 2. const executionId = generateExecutionId()  ←─── (X) ID事前生成 │
│ 3. set({                                                        │
│      isExecuting: true,                                         │
│      currentExecutionId: executionId,  ←─── (Y) 先にState設定    │
│      streamingMessages: []                                      │
│    })                                                           │
│ 4. await window.electronAPI.skill.execute({                     │
│      skillName,                                                 │
│      prompt,                                                    │
│      executionId  ←─── (Z) リクエストにIDを含める                 │
│    })                                                           │
│    └─→ Main Process で実行開始                                   │
│        └─→ ストリームメッセージ送信開始（executionId付き）         │
│ 5. (メッセージ受信時、既にexecutionIdがStateに存在)               │
└─────────────────────────────────────────────────────────────────┘

解決: (Y)で先にexecutionIdを設定するため、(Z)以降のメッセージは正しくフィルタリングされる。
```

### 3.3 executionId生成関数

```typescript
/**
 * 実行IDを生成する
 *
 * フォーマット: UUID v4形式 (例: "550e8400-e29b-41d4-a716-446655440000")
 * - crypto.randomUUID() がサポートされている場合はそれを使用
 * - サポートされていない場合はフォールバック実装を使用
 *
 * @returns 一意の実行ID（UUID v4形式）
 */
function generateExecutionId(): string {
  // crypto.randomUUID() がサポートされている場合
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // フォールバック（UUID v4形式）
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

### 3.4 executeSkillの修正実装

```typescript
executeSkill: async (prompt) => {
  const state = get();
  const selectedSkill = state.selectedSkill;

  if (!selectedSkill) {
    set({ executionError: "スキルが選択されていません" });
    return;
  }

  // (1) executionIdを事前生成
  const executionId = generateExecutionId();

  // (2) 状態を先に設定（Race Condition対策）
  set({
    isExecuting: true,
    currentExecutionId: executionId,
    executionStatus: "running",
    streamingMessages: [],
    executionError: null,
  });

  try {
    if (!window.electronAPI?.skill) {
      throw new Error("Skill API not available");
    }

    // (3) executionIdをリクエストに含める
    const response = await window.electronAPI.skill.execute({
      skillName: selectedSkill.name,
      prompt,
      executionId,  // 追加
    });

    // (4) Main Processから返却されたIDが一致することを検証
    if (response.executionId !== executionId) {
      console.warn(
        `[agentSlice] executionId mismatch: expected=${executionId}, received=${response.executionId}`
      );
    }
  } catch (error) {
    set({
      isExecuting: false,
      executionStatus: "error",
      executionError: formatErrorMessage("実行開始に失敗", error),
    });
  }
},
```

### 3.5 IPCリクエスト型の拡張

```typescript
// packages/shared/src/types/skill.ts に追加

export interface SkillExecutionRequest {
  /** 実行対象のスキル名 */
  skillName: string;
  /** ユーザープロンプト */
  prompt: string;
  /** 実行ID（クライアント側で事前生成） */
  executionId?: string; // optional（後方互換性のため）
}
```

Main Process側でexecutionIdが渡されなかった場合は従来どおりMain Processで生成する。渡された場合はそれを使用する。

---

## 4. 内部ハンドラの実装設計

### 4.1 \_handleStreamMessage

```typescript
_handleStreamMessage: (msg: SkillStreamMessage) => {
  const state = get();

  // executionIdでフィルタリング
  if (msg.executionId !== state.currentExecutionId) {
    // 異なる実行のメッセージは無視
    return;
  }

  // メッセージを追加（最大1000件）
  const MAX_MESSAGES = 1000;
  set((s) => ({
    streamingMessages: s.streamingMessages.length >= MAX_MESSAGES
      ? [...s.streamingMessages.slice(-(MAX_MESSAGES - 1)), msg]
      : [...s.streamingMessages, msg],
  }));
},
```

### 4.2 \_handleComplete

```typescript
_handleComplete: (executionId: string) => {
  const state = get();

  // 現在の実行IDと一致する場合のみ処理
  if (executionId !== state.currentExecutionId) {
    return;
  }

  set({
    isExecuting: false,
    executionStatus: "completed",
  });
},
```

### 4.3 \_handleError

```typescript
_handleError: (executionId: string, error: string) => {
  const state = get();

  // 現在の実行IDと一致する場合のみ処理
  if (executionId !== state.currentExecutionId) {
    return;
  }

  set({
    isExecuting: false,
    executionStatus: "error",
    executionError: error,
  });
},
```

### 4.4 \_handlePermissionRequest

```typescript
_handlePermissionRequest: (req: SkillPermissionRequest) => {
  const state = get();

  // 現在の実行IDと一致する場合のみ処理
  if (req.executionId !== state.currentExecutionId) {
    return;
  }

  set({
    pendingPermission: req,
    executionStatus: "permission_pending",
  });
},
```

---

## 5. useSkillExecution変更設計

### 5.1 設計方針

- ローカルuseStateを削除
- agentSliceの状態をセレクトして返却
- 既存APIは完全維持（後方互換性）

### 5.2 変更後の実装

```typescript
import { useCallback } from "react";
import { useAppStore } from "../store";
import type {
  SkillStreamMessage,
  SkillExecutionResponse,
  SkillExecutionError,
} from "@repo/shared/types/skill";

export type ExecutionStatus =
  | "idle"
  | "running"
  | "completed"
  | "error"
  | "aborted";

export interface UseSkillExecutionReturn {
  messages: SkillStreamMessage[];
  status: ExecutionStatus;
  executionId: string | null;
  error: SkillExecutionError | null;
  isAborting: boolean;
  execute: (prompt: string) => Promise<SkillExecutionResponse | null>;
  abort: () => Promise<void>;
  reset: () => void;
}

/**
 * スキル実行を管理する React Hook
 *
 * @param skillId - 実行対象のスキルID（現在は未使用、将来の拡張用）
 * @returns Hook の戻り値
 */
export function useSkillExecution(_skillId: string): UseSkillExecutionReturn {
  // agentSliceからセレクト
  const messages = useAppStore((s) => s.streamingMessages);
  const executionStatus = useAppStore((s) => s.executionStatus);
  const executionId = useAppStore((s) => s.currentExecutionId);
  const executionError = useAppStore((s) => s.executionError);
  const isExecuting = useAppStore((s) => s.isExecuting);

  // アクション
  const executeSkillAction = useAppStore((s) => s.executeSkill);
  const abortExecution = useAppStore((s) => s.abortExecution);
  const clearExecution = useAppStore((s) => s.clearExecution);

  // ステータス変換（agentSlice → useSkillExecution API）
  const status: ExecutionStatus =
    executionStatus === "permission_pending"
      ? "running"
      : (executionStatus ?? "idle");

  // エラー変換
  const error: SkillExecutionError | null = executionError
    ? { code: "EXECUTION_FAILED", message: executionError }
    : null;

  // execute（後方互換のためPromiseラッパー）
  const execute = useCallback(
    async (prompt: string): Promise<SkillExecutionResponse | null> => {
      await executeSkillAction(prompt);
      // 注: 実際のresponseは内部で処理されるため、ここでは簡易的に返却
      return executionId
        ? { success: true, executionId }
        : { success: false, error: "Execution failed" };
    },
    [executeSkillAction, executionId],
  );

  // abort
  const abort = useCallback(async (): Promise<void> => {
    abortExecution();
  }, [abortExecution]);

  // reset
  const reset = useCallback((): void => {
    clearExecution();
  }, [clearExecution]);

  return {
    messages,
    status,
    executionId,
    error,
    isAborting: isExecuting && status === "running", // 簡易判定
    execute,
    abort,
    reset,
  };
}
```

---

## 6. セレクター設計

### 6.1 useSkillStore変更

store/index.tsの`useSkillStore`を以下のように変更。

```typescript
// Skill selectors - single hook for all Skill-related state and actions
export const useSkillStore = () =>
  useAppStore((state) => ({
    // 状態（agentSliceから）
    availableSkills: state.availableSkills,
    importedSkills: state.skills, // skillsをimportedSkillsとしてエイリアス
    selectedSkillName: state.selectedSkill?.name ?? null, // Skill → name変換
    isExecuting: state.isExecuting,
    executionId: state.currentExecutionId,
    executionStatus: state.executionStatus,
    streamingMessages: state.streamingMessages,
    pendingPermission: state.pendingPermission,
    skillError: state.executionError, // 命名マッピング
    // ローディング状態
    isLoadingSkills: state.isLoadingSkills,
    isScanning: state.isScanning,
    isImporting: state.isImporting,
    importingSkillName: state.importingSkillName,
    // アクション
    fetchSkills: state.fetchSkills,
    rescanSkills: state.rescanSkills,
    importSkill: state.importSkill,
    removeSkill: state.removeSkill,
    selectSkill: state.selectSkill,
    selectSkillByName: state.selectSkillByName,
    executeSkill: state.executeSkill,
    abortExecution: state.abortExecution,
    respondToPermission: state.respondToPermission,
    clearError: () => state.setError(null),
    clearStreamingMessages: state.clearStreamingMessages,
  }));
```

### 6.2 個別セレクター

パフォーマンス最適化のため、必要に応じて個別セレクターも提供。

```typescript
// 個別セレクター（shallow比較で最適化）
export const useSkillExecutionStatus = () =>
  useAppStore((s) => s.executionStatus);

export const useStreamingMessages = () =>
  useAppStore((s) => s.streamingMessages);

export const usePendingPermission = () =>
  useAppStore((s) => s.pendingPermission);

export const useIsExecuting = () => useAppStore((s) => s.isExecuting);
```

---

## 7. setupSkillListeners変更設計

### 7.1 変更内容

agentSliceの内部ハンドラを呼び出すよう変更。

```typescript
// store/setupSkillListeners.ts

import { useAppStore } from "./index";

let skillListenerRegistered = false;
let cleanupFunctions: (() => void)[] = [];

/**
 * スキルIPCリスナーをセットアップ
 * アプリ初期化時に一度だけ呼び出す
 *
 * @returns クリーンアップ関数
 */
export function setupSkillListeners(): () => void {
  // 二重登録防止
  if (skillListenerRegistered) {
    return () => {};
  }
  skillListenerRegistered = true;

  const state = useAppStore.getState();

  // ストリームメッセージリスナー
  const unsubStream = window.electronAPI.skill.onStream((msg) => {
    useAppStore.getState()._handleStreamMessage(msg);
  });
  cleanupFunctions.push(unsubStream);

  // 完了リスナー
  const unsubComplete = window.electronAPI.skill.onComplete(
    ({ executionId }) => {
      useAppStore.getState()._handleComplete(executionId);
    },
  );
  cleanupFunctions.push(unsubComplete);

  // エラーリスナー
  const unsubError = window.electronAPI.skill.onError(
    ({ executionId, error }) => {
      useAppStore.getState()._handleError(executionId, error);
    },
  );
  cleanupFunctions.push(unsubError);

  // 権限リクエストリスナー
  const unsubPermission = window.electronAPI.skill.onPermissionRequest(
    (req) => {
      useAppStore.getState()._handlePermissionRequest(req);
    },
  );
  cleanupFunctions.push(unsubPermission);

  // クリーンアップ関数を返す
  return () => {
    cleanupFunctions.forEach((fn) => fn());
    cleanupFunctions = [];
    skillListenerRegistered = false;
  };
}
```

---

## 8. 移行計画

### 8.1 段階的移行ステップ

| ステップ | 作業内容                                                    | 検証                          |
| -------- | ----------------------------------------------------------- | ----------------------------- |
| Step 1   | agentSliceに状態プロパティを追加（skillSliceと並行稼働）    | TypeCheckがPASS               |
| Step 2   | agentSliceにアクションを追加                                | TypeCheckがPASS               |
| Step 3   | agentSliceに内部ハンドラを追加                              | TypeCheckがPASS               |
| Step 4   | setupSkillListenersをagentSlice参照に変更                   | IPCリスナーテストがPASS       |
| Step 5   | useSkillStoreをagentSliceベースに変更                       | useSkillStoreテストがPASS     |
| Step 6   | useSkillExecutionをagentSliceベースに変更                   | useSkillExecutionテストがPASS |
| Step 7   | AgentViewをagentSliceアクション経由に変更                   | AgentViewテストがPASS         |
| Step 8   | ChatPanelのセレクターを確認・調整                           | ChatPanelテストがPASS         |
| Step 9   | skillSlice.tsを削除、store/index.tsからSkillSlice参照を削除 | 全テストがPASS                |
| Step 10  | skillSliceテストをagentSliceテストとして移行                | 全テストがPASS                |

### 8.2 テスト移行計画

| 既存テストファイル                           | 移行先                                      | 変更内容                                |
| -------------------------------------------- | ------------------------------------------- | --------------------------------------- |
| `skillSlice.test.ts` (59件)                  | `agentSlice.skill.test.ts`                  | Slice名をagentSliceに変更、状態パス調整 |
| `skillSlice.edge-cases.test.ts` (16件)       | `agentSlice.skill.edge-cases.test.ts`       | 同上                                    |
| `skillSlice.state-transition.test.ts` (17件) | `agentSlice.skill.state-transition.test.ts` | 同上                                    |
| `skillSlice.ipc.test.ts` (14件)              | `agentSlice.skill.ipc.test.ts`              | 同上                                    |
| `skillSlice.integration.test.ts` (7件)       | `agentSlice.skill.integration.test.ts`      | 同上                                    |

---

## 9. エラーハンドリング設計

### 9.1 エラーメッセージ定数

```typescript
const AGENT_ERRORS = {
  SKILL_NOT_SELECTED: "スキルが選択されていません",
  SKILL_API_NOT_AVAILABLE: "Skill API not available",
  FETCH_FAILED: "スキル一覧の取得に失敗",
  SCAN_FAILED: "スキル再スキャンに失敗",
  IMPORT_FAILED: "スキルのインポートに失敗",
  REMOVE_FAILED: "スキルの削除に失敗",
  EXECUTE_FAILED: "実行開始に失敗",
} as const;
```

### 9.2 エラーフォーマット関数

```typescript
function formatErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `${prefix}: ${message}`;
}
```

---

## 10. 参照資料

| 資料                         | パス                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| 状態管理仕様書               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`            |
| IPC永続化パターン詳細        | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`             |
| スキル関連インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` |
| Electron IPCセキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            |
| スキル実行セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`         |
| SkillStreamDisplay仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`       |

---

## 11. 統合テスト連携【必須】

統合ポイント/契約（IPC・スキーマ）を設計に反映:

| 統合ポイント    | 契約定義                                                          |
| --------------- | ----------------------------------------------------------------- |
| Renderer → Main | window.electronAPI.skill.\* 経由の IPC 呼び出し                   |
| Main → Renderer | skill:stream-message, skill:complete, skill:error イベント        |
| 状態同期        | Zustand set() による状態更新 → セレクタ経由のコンポーネント再描画 |

---

## 12. 完了条件

- [ ] 統一状態設計（AgentSliceState）が定義されている
- [ ] skillSliceからの移行対象が特定されている
- [ ] race condition対策が設計されている
- [ ] IPCイベントハンドラが設計されている
- [ ] 移行計画（10ステップ）が定義されている
- [ ] 仕様書との整合性が確認されている

---

## 13. 成果物

| 成果物            | 説明                   |
| ----------------- | ---------------------- |
| phase-2-design.md | 本ドキュメント（設計） |

---

## 14. 次Phase

Phase 3: 設計レビュー → `phase-3-design-review.md`
