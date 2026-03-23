# Terminal Handoff Adapter Placement

## メタ情報

| 項目           | 値                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| ワークフロー名 | `terminal-handoff-adapter-placement`                                                                  |
| 作成日         | 2026-03-22                                                                                            |
| 更新日         | 2026-03-22                                                                                            |
| 目的           | `toHandoffGuidance()` adapter 関数の配置先を確定し、Consumer 全件の変換ロジックを統一パスで動作させる |
| 現在状態       | 仕様書作成中                                                                                          |
| GitHub Issue   | [#1457](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1457)                              |

## 概要

本ワークフローは、`HandoffGuidance` 型への変換ロジック（`toHandoffGuidance()`）の配置先を確定し、既存の分散した変換実装を統一 adapter に集約する単一タスク構成です。

### 背景

Phase 2 設計で `HandoffGuidance` 型を統一 DTO として `packages/shared/src/types/handoff.ts` に定義済み。しかし Consumer ごとの変換ロジックが以下の 2 箇所に分散しており、MN-1 として配置先が未確定のまま残っていた:

- `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`

さらに `HandoffBlock.tsx` で `HandoffGuidance` 型がローカル再定義されており、P23（API 二重定義）のリスクがある。

## タスク一覧

| 実行順 | タスク                                                                                                     | 状態           | 概要                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------- |
| 01     | [UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001](./tasks/01-UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001/index.md) | `spec_created` | adapter 配置先確定、`toHandoffGuidance()` 実装、型二重定義解消、Consumer 5 件の統一パス確保 |

## 依存関係

- 外部依存なし（後続実装タスクのブロッカー解消が目的）

## 実装アンカー

| 項目                        | パス                                                                 |
| --------------------------- | -------------------------------------------------------------------- |
| HandoffGuidance 型（正本）  | `packages/shared/src/types/handoff.ts`                               |
| TerminalHandoffBundle 型    | `packages/shared/src/types/skillCreator.ts`                          |
| Chat Edit Builder           | `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts` |
| Runtime Builder             | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`   |
| HandoffBlock（UI）          | `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`         |
| LLM Adapter（参考パターン） | `apps/desktop/src/main/adapters/llm/`                                |

## ディレクトリ構造

```text
docs/30-workflows/terminal-handoff-adapter-placement/
  index.md
  tasks/
    01-UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001/
      index.md
      phase-1-requirements.md
      phase-2-design.md
      phase-3-design-review.md
      phase-4-test.md
      phase-5-implementation.md
      phase-6-test-expansion.md
      phase-7-coverage.md
      phase-8-refactoring.md
      phase-9-quality.md
      phase-10-final-review.md
      phase-11-manual-test.md
      phase-12-documentation.md
      phase-13-pr-creation.md
      artifacts.json
      outputs/
        phase-1/ ... phase-13/
```

## システム仕様参照

| 資料                                 | パス                                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| interfaces-agent-sdk-skill-reference | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` |
| llm-workspace-chat-edit              | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                                    |
