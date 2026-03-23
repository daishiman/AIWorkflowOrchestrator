# チャット内インラインモデルセレクタ

## メタ情報

| 項目           | 値                                                                                 |
| -------------- | ---------------------------------------------------------------------------------- |
| ワークフロー名 | `chat-inline-model-selector`                                                       |
| 作成日         | 2026-03-21                                                                         |
| 更新日         | 2026-03-23                                                                         |
| 目的           | ChatView / WorkspaceChatPanel から直接 LLM provider / model を選べる導線を整備する |
| 現在状態       | Task 01〜03 全て実装済み                                                           |

## 概要

本ワークフローは、設定画面に閉じていた LLM 選択をチャット導線へ近づけるための 3 タスク構成です。実体ファイルはすべて `tasks/` 配下にあり、workflow root 直下に共通 Phase 1〜3 は存在しません。

## タスク一覧

| 実行順 | タスク                                                                                                                      | 状態     | 概要                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| 01     | [TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT](./tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/index.md)                      | 実装済み | `InlineModelSelector` 共通コンポーネント、unit test、export、Phase 12 close-out |
| 02     | [TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION](./tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/index.md)              | 実装済み | ChatView header への配置、GuidanceBanner 連携、screen capture                   |
| 03     | [TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION](../completed-tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/index.md) | 実装済み | WorkspaceChatPanel への配置、blocked guidance 連携、screen capture              |

## 依存関係

- Task 01 が shared component を提供する
- Task 02 / Task 03 は Task 01 完了後に独立して進行できる
- representative screenshot による live UI 検証は Task 02 / Task 03 の統合後に実施する

## 実装アンカー

| 項目               | パス                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| 共通コンポーネント | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`     |
| export             | `apps/desktop/src/renderer/components/llm/index.ts`                    |
| ChatView 統合先    | `apps/desktop/src/renderer/views/ChatView/index.tsx`                   |
| Workspace 統合先   | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` |
| Zustand state      | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                   |

## ディレクトリ構造

```text
docs/30-workflows/chat-inline-model-selector/
  index.md
  tasks/
    01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/
    02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/
    03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/
```

## システム仕様参照

| 資料                       | パス                                                                                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LLM 選択 UI 正本           | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                                                                                                          |
| ナビゲーション             | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                                                                                            |
| backlog / completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-chat-lifecycle-tests.md` |
