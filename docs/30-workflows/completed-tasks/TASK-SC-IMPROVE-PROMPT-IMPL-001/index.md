---
task_id: TASK-SC-IMPROVE-PROMPT-IMPL-001
task_name: SkillCreatorService runImprovePromptWorkflow 実処理実装
category: 改善
target_feature: SkillCreatorService improve-prompt mode
priority: 中
scale: 中規模
status: completed
issue_number: 2319
created_date: 2026-04-21
implementation_mode: "new"
dependencies:
  - UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE
  - TASK-SC-CREATOR-UPDATE-IMPL-001
---

# TASK-SC-IMPROVE-PROMPT-IMPL-001: SkillCreatorService runImprovePromptWorkflow 実処理実装

## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-SC-IMPROVE-PROMPT-IMPL-001                         |
| タスク名     | SkillCreatorService runImprovePromptWorkflow 実処理実装 |
| 分類         | 改善                                                    |
| 対象機能     | SkillCreatorService improve-prompt mode                 |
| 優先度       | 中                                                      |
| 見積もり規模 | 中規模                                                  |
| ステータス   | completed                                               |
| GitHub Issue | #2319（CLOSED）                                         |
| 依存タスク   | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE             |
| タスク種別   | NON_VISUAL（UI変更なし）                                |
| 実装モード   | `"new"`（新規実装）                                     |
| 作成日       | 2026-04-21                                              |

## 背景・課題

`SkillCreatorService.runImprovePromptWorkflow()` がスタブ実装のまま（`logger.warn` のみ）で、`improve-prompt` モード実行時に SKILL.md のプロンプトセクションが実際に改善されない。

`UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` で `improve-prompt` モードの dispatch 修正は完了したが、`runImprovePromptWorkflow()` 本体の実処理が未実装のまま残っている。

### 現状のコード（スタブ状態）

`apps/desktop/src/main/services/skill/SkillCreatorService.ts` L416-420:

```typescript
case "improve-prompt":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  emitProgress("improving");
  break;  // ← 実処理なし。SKILL.md プロンプトセクションは改善されない
```

`improve-prompt` モードでは `improving(65%)` ステップが特有で、`update` モードの `generating-skill(60%)` とは異なる。`improveSkill()` メソッド（L724）が既存の改善スクリプト (`improve_skill.js`) を呼び出せるため、LLM 未設定時のフォールバックとして活用できる。

## 目的・ゴール

`case "improve-prompt":` ブロックに `runImprovePromptWorkflow()` 呼び出しを追加し、既存スキルの SKILL.md プロンプトセクションを実際に読み込んで改善・書き戻す処理を実装する。LLM クライアント利用可能時はプロンプトを LLM で改善し、LLM 未設定時は `improveSkill()` フォールバックを使用する。

## スコープ

### 対象

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（修正）
  - `runImprovePromptWorkflow()` メソッドの新規実装
  - `case "improve-prompt":` ブロックの修正
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.improve-prompt.test.ts`（新規作成）

### 対象外

- `runUpdateWorkflow()` / `update` モードの変更（兄弟タスク TASK-SC-CREATOR-UPDATE-IMPL-001 のスコープ）
- `SkillService.updateSkill()` 永続化（関連タスク TASK-SC-UPDATE-SKILL-IMPL-001 #2203 のスコープ）
- UI コンポーネントの変更（NON_VISUAL タスク）
- IPC ハンドラーの変更

## 関連タスク

| タスクID                                    | 関係                 | 説明                                    |
| ------------------------------------------- | -------------------- | --------------------------------------- |
| UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE | 前タスク（完了済み） | `improve-prompt` モードの dispatch 修正 |
| TASK-SC-CREATOR-UPDATE-IMPL-001             | 兄弟タスク           | `runUpdateWorkflow()` 実処理実装        |
| TASK-SC-UPDATE-SKILL-IMPL-001 #2203         | 関連                 | `SkillService.updateSkill()` 永続化     |

## improve-prompt モードの PROGRESS_FLOWS

```
loading-skill(10%) → analyzing(30%) → improving(65%) → validating(90%) → done(100%)
```

`update` モードとの差異: `generating-skill(60%)` ではなく `improving(65%)` を使用する。

## 受入基準

| ID     | 基準                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------- |
| AC-001 | `improve-prompt` モード実行時に SKILL.md のプロンプトセクションが実際に改善されること                           |
| AC-002 | `llmClient` 利用可能時はプロンプト改善が LLM で実施されること                                                   |
| AC-003 | `llmClient` 不在時は `improveSkill()` フォールバックが動作すること                                              |
| AC-004 | AbortSignal 中断が loading-skill / analyzing / improving 各ステップで機能すること                               |
| AC-005 | `runImprovePromptWorkflow()` に新規テスト（`SkillCreatorService.improve-prompt.test.ts`）が存在し PASS すること |
| AC-006 | 既存テスト（`SkillCreatorService.test.ts` 等）が引き続き PASS すること                                          |
| AC-007 | TypeScript 型チェック PASS・ESLint PASS                                                                         |

## 実装対象ファイル

| ファイル                                                                                    | 作業                                                                 |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                               | `runImprovePromptWorkflow()` 新規実装・`case "improve-prompt":` 修正 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.improve-prompt.test.ts` | 新規テストファイル作成                                               |

参照パターン（変更なし）:

- `runCreateWorkflow()` L980-1003: 実処理ワークフローのパターン
- `improveSkill()` L724-748: スクリプト経由改善のパターン（LLM不在時フォールバック）
- `extractPurposeWithLlm()` L1051-1073: LLM purpose 生成パターン
- `throwIfAborted()`: AbortSignal 確認パターン

## Phase 一覧

| Phase    | 名称             | 仕様書                                                 | ステータス |
| -------- | ---------------- | ------------------------------------------------------ | ---------- |
| Phase 1  | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)     | completed  |
| Phase 2  | 設計             | [phase-2-design.md](phase-2-design.md)                 | completed  |
| Phase 3  | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)   | completed  |
| Phase 4  | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)   | completed  |
| Phase 5  | 実装             | [phase-5-implementation.md](phase-5-implementation.md) | completed  |
| Phase 6  | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md) | completed  |
| Phase 7  | カバレッジ確認   | [phase-7-coverage.md](phase-7-coverage.md)             | completed  |
| Phase 8  | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)       | completed  |
| Phase 9  | 品質保証         | [phase-9-quality.md](phase-9-quality.md)               | completed  |
| Phase 10 | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)   | completed  |
| Phase 11 | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)     | completed  |
| Phase 12 | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md) | completed  |
| Phase 13 | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)     | blocked    |
