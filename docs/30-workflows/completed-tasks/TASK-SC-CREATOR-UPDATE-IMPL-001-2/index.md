---
task_id: TASK-SC-CREATOR-UPDATE-IMPL-001
task_name: SkillCreatorService runUpdateWorkflow 実処理実装
category: 改善
target_feature: SkillCreatorService update mode
priority: 中
scale: 中規模
status: pending
issue_number: 2318
created_date: 2026-04-21
implementation_mode: "new"
dependencies:
  - UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE
---

# TASK-SC-CREATOR-UPDATE-IMPL-001: SkillCreatorService runUpdateWorkflow 実処理実装

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | TASK-SC-CREATOR-UPDATE-IMPL-001                  |
| タスク名     | SkillCreatorService runUpdateWorkflow 実処理実装 |
| 分類         | 改善                                             |
| 対象機能     | SkillCreatorService update mode                  |
| 優先度       | 中                                               |
| 見積もり規模 | 中規模                                           |
| ステータス   | pending                                          |
| GitHub Issue | #2318（CLOSED）                                  |
| 依存タスク   | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE      |
| タスク種別   | NON_VISUAL（UI変更なし）                         |
| 実装モード   | `"new"`（新規実装）                              |
| 作成日       | 2026-04-21                                       |

## 背景・課題

`SkillCreatorService.runUpdateWorkflow()` がスタブ実装のまま（`logger.warn` のみ）で、`update` モード実行時に既存スキルの SKILL.md が実際に更新されない。

`UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` で `update` モードの dispatch 修正は完了したが、`runUpdateWorkflow()` 本体の実処理が未実装のまま残っている。

### 現状のコード（スタブ状態）

`apps/desktop/src/main/services/skill/SkillCreatorService.ts` L412-415:

```typescript
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  break;  // ← 実処理なし。SKILL.md は更新されない
```

dispatch後は `emitProgress("generating-skill")` → `init_skill.js` → `ensureSkillMdExists` に流れるため、`update` モードでも既存 SKILL.md が上書きされることなく終了する。

## 目的・ゴール

`case "update":` ブロックに `runUpdateWorkflow()` 呼び出しを追加し、既存スキルの SKILL.md を実際に読み込んで更新・書き戻す処理を実装する。LLM クライアント利用可能時は purpose を LLM で再生成する。

## スコープ

### 対象

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（修正）
  - `runUpdateWorkflow()` メソッドの新規実装
  - `case "update":` ブロックの修正
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts`（新規作成）

### 対象外

- `improveSkill()` / `improve-prompt` モードの変更（兄弟タスク TASK-SC-IMPROVE-PROMPT-IMPL-001 のスコープ）
- `SkillService.updateSkill()` 永続化（関連タスク TASK-SC-UPDATE-SKILL-IMPL-001 #2203 のスコープ）
- UI コンポーネントの変更（NON_VISUAL タスク）
- IPC ハンドラーの変更

## 関連タスク

| タスクID                                    | 関係                 | 説明                                |
| ------------------------------------------- | -------------------- | ----------------------------------- |
| UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE | 前タスク（完了済み） | `update` モードの dispatch 修正     |
| TASK-SC-IMPROVE-PROMPT-IMPL-001             | 兄弟タスク           | `improve-prompt` 実処理実装         |
| TASK-SC-UPDATE-SKILL-IMPL-001 #2203         | 関連                 | `SkillService.updateSkill()` 永続化 |

## update モードの PROGRESS_FLOWS

```
loading-skill(10%) → analyzing(30%) → generating-skill(60%) → validating(90%) → done(100%)
```

## 受入基準

| ID     | 基準                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------ |
| AC-001 | `update` モード実行時に既存 SKILL.md が実際に読み込まれ、更新・書き戻されること                  |
| AC-002 | `llmClient` 利用可能時は purpose が LLM で再生成されること                                       |
| AC-003 | `llmClient` 不在時は既存の purpose を維持したまま更新されること                                  |
| AC-004 | AbortSignal 中断が loading-skill / analyzing / generating-skill 各ステップで機能すること         |
| AC-005 | `runUpdateWorkflow()` に新規テスト（`SkillCreatorService.update.test.ts`）が存在し PASS すること |
| AC-006 | 既存テスト（`SkillCreatorService.test.ts` 等）が引き続き PASS すること                           |
| AC-007 | TypeScript 型チェック PASS・ESLint PASS                                                          |

## 実装対象ファイル

| ファイル                                                                            | 作業                                                  |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                       | `runUpdateWorkflow()` 新規実装・`case "update":` 修正 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts` | 新規テストファイル作成                                |

参照パターン（変更なし）:

- `runCreateWorkflow()` L980-1003: 実処理ワークフローのパターン
- `extractPurposeWithLlm()` L1051-1073: LLM purpose 生成パターン
- `throwIfAborted()`: AbortSignal 確認パターン

## Phase 一覧

| Phase    | 名称             | 仕様書                                                 | ステータス |
| -------- | ---------------- | ------------------------------------------------------ | ---------- |
| Phase 1  | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)     | 未実施     |
| Phase 2  | 設計             | [phase-2-design.md](phase-2-design.md)                 | 未実施     |
| Phase 3  | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)   | 未実施     |
| Phase 4  | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)   | 未実施     |
| Phase 5  | 実装             | [phase-5-implementation.md](phase-5-implementation.md) | 未実施     |
| Phase 6  | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md) | 未実施     |
| Phase 7  | カバレッジ確認   | [phase-7-coverage.md](phase-7-coverage.md)             | 未実施     |
| Phase 8  | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)       | 未実施     |
| Phase 9  | 品質保証         | [phase-9-quality.md](phase-9-quality.md)               | 未実施     |
| Phase 10 | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)   | 未実施     |
| Phase 11 | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)     | 未実施     |
| Phase 12 | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md) | 未実施     |
| Phase 13 | PR作成           | [phase-13-pr.md](phase-13-pr.md)                       | 未実施     |
