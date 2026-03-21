# チャット内インラインモデルセレクタ - タスク仕様書群

## メタ情報

| 項目           | 値                                                                  |
| -------------- | ------------------------------------------------------------------- |
| ワークフロー名 | chat-inline-model-selector                                          |
| 作成日         | 2026-03-21                                                          |
| 目的           | 各チャット画面でLLMモデルを直接選択できるインラインUIを提供する     |
| 優先度         | P1                                                                  |
| 前提           | ai-chat-llm-integration-fix Task 03（永続化）は本ワークフローと独立 |

## 背景

現在のAIWorkflowOrchestratorでは、LLMモデルの選択は設定画面（Settings）でのみ可能であり、チャット画面からは「未選択時の警告バナー → Settings誘導」という間接的な導線しかない。ChatGPTやCursorのように、チャット画面で直接モデルを切り替えるUXが求められている。

### 現状の課題

1. **操作コストが高い**: モデルを変更するためにSettingsに遷移し、戻ってくる必要がある
2. **コンテキスト切断**: チャット中にSettings遷移するとフローが途切れる
3. **モデル選択UIの未配置**: ChatView/WorkspaceChatPanelにモデル選択コンポーネントがない
4. **共通化の不足**: `components/llm/` に再利用可能な部品はあるが、チャット向けのコンパクト版がない

### 既存資産

- `components/llm/LLMSelectorPanel.tsx` (224行): フル版パネル（Store直接接続済み）
- `components/llm/ProviderSelector.tsx`: プロバイダー選択ドロップダウン
- `components/llm/ModelSelector.tsx`: モデル選択ドロップダウン
- `components/llm/HealthIndicator.tsx`: ヘルスステータスバッジ
- `llmSlice.ts`: `selectedProviderId`/`selectedModelId` 状態管理済み
- IPC: `llm:set-selected-config` でMain Process同期済み

## タスク分解（SRP準拠・実行順序付き）

| 実行順 | タスクID                                     | 責務                                                       | 優先度 | 依存関係 |
| ------ | -------------------------------------------- | ---------------------------------------------------------- | ------ | -------- |
| 01     | TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT      | チャット向けコンパクトモデルセレクタ共通コンポーネント作成 | P1     | なし     |
| 02     | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION  | ChatViewへのインラインモデルセレクタ配置                   | P1     | 01       |
| 03     | TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION | WorkspaceChatPanelへのインラインモデルセレクタ配置         | P1     | 01       |

> **実行順序の意図**: Task 01が共通コンポーネント、Task 02-03はその利用側。Task 02と03は01完了後に並列実行可能。

## タスク間の関心分離

```
Task 01 (共通コンポーネント層)
  components/llm/InlineModelSelector.tsx ← 新規作成
  既存 ProviderSelector/ModelSelector を内部利用

Task 02 (ChatView統合層)
  views/ChatView/index.tsx ← InlineModelSelector配置
  views/ChatView/LLMGuidanceBanner.tsx ← 役割調整

Task 03 (WorkspaceChat統合層)
  views/WorkspaceView/WorkspaceChatPanel.tsx ← InlineModelSelector配置
  views/WorkspaceView/hooks/useWorkspaceChatController.ts ← blocked状態調整
```

## 影響ファイル一覧

| ファイル                                                                            | Task 01 | Task 02 | Task 03 |
| ----------------------------------------------------------------------------------- | ------- | ------- | ------- |
| `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                  | **主**  | -       | -       |
| `apps/desktop/src/renderer/components/llm/index.ts`                                 | 副      | -       | -       |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`                                | -       | **主**  | -       |
| `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`                    | -       | 副      | -       |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | -       | -       | **主**  |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | -       | -       | 副      |

## 関連する既存タスク

| タスクID                                       | 関係                                     | ステータス   |
| ---------------------------------------------- | ---------------------------------------- | ------------ |
| TASK-FIX-LLM-CONFIG-PERSISTENCE (Task03)       | モデル選択の永続化（本タスクとは独立）   | spec_created |
| TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR           | エラー時のUI改善（本タスク後に着手推奨） | spec_created |
| Issue #1220                                    | liveLLMAdapterモデルIDハードコード       | 未着手       |
| TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING | blocked状態のaction wiring               | spec_created |

## 仕様書ディレクトリ構造

```
docs/30-workflows/chat-inline-model-selector/
  index.md                                              ← 本ファイル
  phase-1-requirements.md                               ← Phase 1: 要件定義
  phase-2-design.md                                     ← Phase 2: 設計
  phase-3-design-review.md                              ← Phase 3: 設計レビュー
  tasks/
    01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/         ← 共通コンポーネント
      phase-4-test.md ... phase-13-pr-creation.md
    02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/     ← ChatView統合
      phase-4-test.md ... phase-13-pr-creation.md
    03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/    ← WorkspaceChat統合
      phase-4-test.md ... phase-13-pr-creation.md
```

## システム仕様参照（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容                      |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------- |
| UI/UX設計          | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | 既存UIコンポーネント構造  |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | LLM Slice設計             |
| LLM IPC契約        | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`              | llm:set-selected-config等 |
| ナビゲーション     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | 画面遷移・導線設計        |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`        | UIエラー表示パターン      |
