# Phase 1: 現状棚卸しインベントリ

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 調査日: 2026-03-22

## 1. コード棚卸し

### 1.1 TranscriptProvenanceChip

| 項目 | 内容                                                                                    |
| ---- | --------------------------------------------------------------------------------------- |
| パス | `apps/desktop/src/renderer/views/WorkspaceView/components/TranscriptProvenanceChip.tsx` |
| 状態 | 基本骨組みのみ実装済み、使用箇所ゼロ                                                    |

**現在の Props 定義**:

```typescript
interface TranscriptProvenanceChipProps {
  source: ProvenanceSource;
  label: string;
}
type ProvenanceSource = "selection" | "recent" | "session";
```

**GAP**:

- copy / dismiss / inspect アクションが未実装
- sharedAt / sessionTitle 等の metadata を保持しない
- 他コンポーネントからの参照がゼロ

> **注記**: 既存コードの `ProvenanceSource = "selection" | "recent" | "session"` は現状コードの記録。設計では `"range" | "last-output" | "session"` に変更予定（Phase 2 contract-matrix 参照）。

### 1.2 WorkspaceChatPanel

| 項目 | 内容                                                                   |
| ---- | ---------------------------------------------------------------------- |
| パス | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` |
| 状態 | Guidance Block / Streaming 対応済み、Provenance 統合なし               |

**現在のコンポーネントツリー**:

```
WorkspaceChatPanel
  +- WorkspaceChatMessageList (messages, streamContent, isStreaming)
  +- WorkspaceFileContextChips (selectedFiles)
  +- WorkspaceChatInput (controller)
  +- GuidanceBlock / StreamingErrorDisplay
```

**GAP**: TranscriptProvenanceChip の使用箇所なし

### 1.3 WorkspaceChatMessage 型（Renderer 層）

| 項目 | 内容                                                                                |
| ---- | ----------------------------------------------------------------------------------- |
| パス | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` |
| 状態 | metadata フィールドなし                                                             |

```typescript
export interface WorkspaceChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
```

### 1.4 ChatMessage 型（DB / Shared 層）

| 項目 | 内容                                        |
| ---- | ------------------------------------------- |
| パス | `packages/shared/src/types/chat-message.ts` |
| 状態 | metadata / llmMetadata / attachments 完備   |

```typescript
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  messageIndex: number;
  timestamp: string;
  llmProvider: string | null;
  llmModel: string | null;
  llmMetadata: LlmMetadata | null;
  attachments: Attachment[];
  systemPrompt: string | null;
  metadata: Record<string, unknown>;
}
```

### 1.5 HandoffGuidance 型（共有 DTO）

| 項目 | 内容                                   |
| ---- | -------------------------------------- |
| パス | `packages/shared/src/types/handoff.ts` |
| 状態 | Task 05 で確定済み                     |

```typescript
export interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}
```

### 1.6 TranscriptPanel

| 項目 | 内容                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| パス | `apps/desktop/src/renderer/views/WorkspaceView/components/TranscriptPanel.tsx` |
| 状態 | ファイル未作成                                                                 |

### 1.7 SelectedFile スキーマ

| 項目 | 内容                                               |
| ---- | -------------------------------------------------- |
| パス | `packages/shared/schemas/file-selection.schema.ts` |
| 状態 | source / provenance フィールドなし                 |

## 2. ドキュメント棚卸し

| ドキュメント       | パス                                                                                                            | 状態                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 親パック index     | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`                                    | Task06 の依存順・lane 情報を含む                    |
| UI/UX 正本         | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md`                        | 3操作フロー・CTA 契約・provenance chip を規定       |
| UI/UX 図解         | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md`                           | Transcript -> Chat Bridge 状態遷移図を含む          |
| 設計監査マトリクス | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md`                      | Task06 は「整合」判定                               |
| workflow 正本      | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | Task06 = not_started                                |
| Task 04 成果物     | `docs/30-workflows/completed-tasks/step-03-par-task-04-*/outputs/phase-2/`                                      | useBlockedGuidance / BLOCKED_GUIDANCE_MAP 設計確定  |
| Task 05 成果物     | `docs/30-workflows/completed-tasks/step-03-par-task-05-*/outputs/phase-2/`                                      | Launcher / Handoff Card / Consumer Adapter 設計確定 |

## 3. Renderer Metadata Gap（最重要）

```
DB Layer (ChatMessage)     →  metadata ✅ / llmMetadata ✅ / attachments ✅
        ↓ IPC
Renderer Layer (WorkspaceChatMessage)  →  metadata ✗ / provenance ✗ / source ✗
```

DB 層は完全な metadata を保持しているが、Renderer 層の `WorkspaceChatMessage` はフィルタリングしている。provenance linkage の設計ではこの gap を埋める必要がある。

## 4. P50 チェック判定

| 範囲                          | 状態     | 備考               |
| ----------------------------- | -------- | ------------------ |
| TranscriptProvenanceChip      | 部分実装 | 定義のみ、利用ゼロ |
| WorkspaceChatMessage metadata | 未実装   | 型拡張が必要       |
| ChatMessage (DB)              | 完全実装 | 利用可能           |
| Copy/export 機能              | 未実装   | UI + ロジック両方  |
| Terminal handoff linkage      | 未実装   | 直接導線なし       |

**判定**: 新規実装が必要。Phase 4-5 は「新規実装」モードで進行する。
