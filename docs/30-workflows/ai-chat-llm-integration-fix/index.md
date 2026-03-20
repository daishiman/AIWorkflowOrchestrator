# AI Chat/LLM統合修正 - タスク仕様書群

## メタ情報

| 項目           | 値                                             |
| -------------- | ---------------------------------------------- |
| ワークフロー名 | ai-chat-llm-integration-fix                    |
| 作成日         | 2026-03-20                                     |
| 目的           | AI Chat/Workspace画面のLLM通信を動作可能にする |
| 優先度         | P0-P1                                          |

## 背景

AIWorkflowOrchestratorのチャット画面とワークスペース画面において、以下の問題が確認された:

1. **ChatView**: メッセージ送信後にAIから応答が返らない（エラー握りつぶし）
2. **WorkspaceChat**: モデル未選択で送信不可だが、選択UIへの導線がない
3. **LLM設定**: Provider/Model選択状態がアプリ再起動でリセットされる
4. **WorkspaceChat**: ストリーミングエラー時のUXが不十分

## タスク分解（SRP準拠・実行順序付き）

| 実行順 | タスクID                               | 責務                                          | 優先度 | 依存関係 |
| ------ | -------------------------------------- | --------------------------------------------- | ------ | -------- |
| 01     | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE | ChatViewのエラー握りつぶし修正 + エラーUI表示 | P0     | なし     |
| 02     | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE  | ChatView/WorkspaceにLLMモデル選択導線追加     | P0     | なし     |
| 03     | TASK-FIX-LLM-CONFIG-PERSISTENCE        | LLM選択状態のZustand persist永続化            | P1     | なし     |
| 04     | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR   | WorkspaceChatのストリーミングエラー表示改善   | P1     | 01参照   |

> **実行順序の意図**: 01-03は独立して並列実行可能。04は01のエラー表示パターンを参照するため、01完了後に着手を推奨。

## タスク間の関心分離

```
Task 1 (Store/エラーハンドリング層)
  chatSlice.ts sendMessage → エラー表示追加

Task 2 (UI/導線層)
  ChatView/WorkspaceView → モデル選択誘導UI追加

Task 3 (永続化/インフラ層)
  llmSlice.ts + store/index.ts → persist設定追加
  llmConfigProvider.ts → 起動時復元

Task 4 (ストリーミング/エラーUX層)
  useWorkspaceChatController.ts → エラー種別判定改善
  WorkspaceChatPanel.tsx → エラー表示UI追加
```

## 影響ファイル一覧

| ファイル                                                                            | Task 1 | Task 2 | Task 3 | Task 4 |
| ----------------------------------------------------------------------------------- | ------ | ------ | ------ | ------ |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`                               | **主** | -      | -      | -      |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`                                | 副     | **主** | -      | -      |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts`                                | -      | -      | **主** | -      |
| `apps/desktop/src/renderer/store/index.ts`                                          | -      | -      | **主** | -      |
| `apps/desktop/src/main/ipc/llmConfigProvider.ts`                                    | -      | -      | **主** | -      |
| `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                           | -      | **主** | -      | -      |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | -      | -      | -      | **主** |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | -      | -      | -      | **主** |

## 実行順序

Task 1〜3は独立して並列実行可能。Task 4はTask 1の設計パターンを参照する。

```
Phase 1-3（設計）: Task 1 | Task 2 | Task 3 | Task 4  ← 並列実行
Phase 4-13（実装以降）: 設計レビュー完了後に順次実行
```

## 仕様書ディレクトリ構造

```
docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/  ← Task 01 canonical root
  phase-1-requirements.md ... phase-13-pr-creation.md
docs/30-workflows/ai-chat-llm-integration-fix/
  index.md
  tasks/
    02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/            ← P0: 01と並列可
      phase-1-requirements.md ... phase-13-pr-creation.md
    03-TASK-FIX-LLM-CONFIG-PERSISTENCE/                  ← P1: 01-02と並列可
      phase-1-requirements.md ... phase-13-pr-creation.md
    04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/             ← P1: 01完了後に着手
      phase-1-requirements.md ... phase-13-pr-creation.md
```

> Task 01 はユーザー指定に基づき root 直下 workflow が canonical。`ai-chat-llm-integration-fix/tasks/01-*` は legacy path として扱う。

## システム仕様参照（aiworkflow-requirements）

| 参照資料                | パス                                                                                                                  | 内容                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 抽出マトリクス          | `.claude/skills/aiworkflow-requirements/references/workflow-ai-chat-llm-integration-fix.md`                           | 4 タスクの最小読書セット                                     |
| artifact inventory      | `.claude/skills/aiworkflow-requirements/references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md`        | current canonical set、root evidence、未タスク、検証チェーン |
| LLM IPC契約             | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                                  | `AIChatResponse.error` / `llm:set-selected-config`           |
| 状態管理設計            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                          | state ownership の入口                                       |
| 状態管理 core           | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                     | `chatError` / selector ownership の current contract         |
| persist hardening       | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-persist-hardening-test-quality.md` | 永続化復元の境界                                             |
| UI surface              | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                       | Chat / Workspace 既存 UI パターン                            |
| ナビゲーション          | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                               | Settings 誘導の責務                                          |
| エラーハンドリング      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                 | UI-safe error 表現                                           |
| エラーハンドリング core | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`                                            | raw message fallback と renderer 正規化責務                  |
| lessons                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`                            | code/message drift と same-wave sync の教訓                  |

## Phase 12 同期ステータス

| タスクID | 状態                   | 備考                                                                |
| -------- | ---------------------- | ------------------------------------------------------------------- |
| 01       | completed + re-audited | screenshot 5件、system spec same-wave sync、follow-up 2件 formalize |
| 02       | spec ready             | workflow spec 維持、未実装                                          |
| 03       | spec ready             | workflow spec 維持、未実装                                          |
| 04       | spec ready             | workflow spec 維持、未実装                                          |
