# ストア依存関係マップ

## AppStore構成

```typescript
export type AppStore = NavigationSlice &
  EditorSlice &
  ChatSlice &
  GraphSlice &
  SettingsSlice &
  UISlice &
  DashboardSlice &
  AuthSlice &
  WorkspaceSlice &
  FileSelectionSlice &
  SystemPromptTemplateSlice &
  LLMSlice &
  AgentSlice &
  ChatEditSlice &
  SkillSlice;
```

## SkillSlice（ChatPanel統合の主要依存先）

### 状態プロパティ

| プロパティ              | 型                             | ChatPanel使用 | 用途                   |
| ----------------------- | ------------------------------ | ------------- | ---------------------- |
| availableSkillsMetadata | SkillMetadata[]                | 間接          | 利用可能スキル一覧     |
| importedSkills          | ImportedSkill[]                | 間接          | インポート済みスキル   |
| selectedSkillName       | string \| null                 | **直接**      | 選択中スキル名表示     |
| isExecuting             | boolean                        | **直接**      | 実行中判定             |
| executionId             | string \| null                 | -             | 実行ID                 |
| skillExecutionStatus    | SkillExecutionStatus \| null   | **直接**      | ステータスバッジ       |
| streamingMessages       | SkillStreamMessage[]           | **直接**      | ストリーミング表示     |
| pendingPermission       | SkillPermissionRequest \| null | 間接          | 権限ダイアログ表示判定 |
| skillError              | string \| null                 | -             | エラーメッセージ       |
| isLoadingSkills         | boolean                        | -             | フェッチ中             |
| isScanning              | boolean                        | 間接          | リスキャン中           |
| isImporting             | boolean                        | 間接          | インポート中           |
| importingSkillName      | string \| null                 | 間接          | インポート中スキル名   |

### アクション

| アクション               | 引数                  | ChatPanel使用 | 用途             |
| ------------------------ | --------------------- | ------------- | ---------------- |
| fetchSkills()            | -                     | **直接**      | 初回スキル取得   |
| rescanSkills()           | -                     | 間接          | リスキャン       |
| importSkill(name)        | string                | 間接          | インポート       |
| removeSkill(name)        | string                | -             | 削除             |
| selectSkillByName(name)  | string \| null        | 間接          | スキル選択       |
| executeSkill(prompt)     | string                | -             | 実行             |
| abortExecution()         | -                     | 間接          | 中止             |
| respondToSkillPermission | (approved, remember?) | 間接          | 権限応答         |
| clearError()             | -                     | -             | エラークリア     |
| clearStreamingMessages() | -                     | -             | メッセージクリア |

## AgentSlice（参考・既存互換）

### 主要状態

| プロパティ            | 型                                                                                      | 備考                 |
| --------------------- | --------------------------------------------------------------------------------------- | -------------------- |
| executionState        | AgentExecutionState                                                                     | レガシー実行状態管理 |
| executionState.status | "idle" \| "executing" \| "streaming" \| "awaiting_permission" \| "error" \| "cancelled" | 実行ステータス       |
| skills                | Skill[]                                                                                 | レガシースキルリスト |
| selectedSkill         | Skill \| null                                                                           | レガシー選択         |

> ChatPanel統合ではskillSliceを主に使用し、agentSliceは後方互換のために存在する。

## 型定義（packages/shared/src/types/skill.ts）

### SkillExecutionStatus

```typescript
type SkillExecutionStatus =
  | "idle"
  | "running"
  | "permission_pending"
  | "completed"
  | "cancelled"
  | "error";
```

### SkillStreamMessage（Discriminated Union）

| type          | content型                | 表示内容                  |
| ------------- | ------------------------ | ------------------------- |
| "assistant"   | AssistantMessageContent  | テキスト + partial cursor |
| "tool_use"    | ToolUseMessageContent    | ツール名 + 引数           |
| "tool_result" | ToolResultMessageContent | 成功/失敗結果             |
| "status"      | StatusMessageContent     | ステータス更新（非表示）  |
| "error"       | ErrorMessageContent      | エラーメッセージ          |

### SkillPermissionRequest

```typescript
interface SkillPermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}
```

## データフロー図

```
[skillSlice] ─── selectedSkillName ──→ [ChatPanel] ─── skillName ──→ [SkillStreamingView]
[skillSlice] ─── streamingMessages ──→ [ChatPanel] ─── messages ──→ [SkillStreamingView]
[skillSlice] ─── skillExecutionStatus → [ChatPanel] ─── status ───→ [SkillStreamingView]
[skillSlice] ─── isExecuting ────────→ [ChatPanel] ─── 条件付きレンダリング
[skillSlice] ─── pendingPermission ──→ [PermissionDialog] (Store-direct)
[SkillSelector] → onImportRequest ───→ [ChatPanel] ─── importDialogSkill → [SkillImportDialog]
```

## useSkillStore フック

```typescript
export const useSkillStore = () =>
  useAppStore((state) => ({
    availableSkills: state.availableSkills,
    importedSkills: state.importedSkills,
    selectedSkillName: state.selectedSkillName,
    isExecuting: state.isExecuting,
    streamingMessages: state.streamingMessages,
    pendingPermission: state.pendingPermission,
    skillError: state.skillError,
    fetchSkills: state.fetchSkills,
    abortExecution: state.abortExecution,
    // ... (全プロパティ)
  }));
```
