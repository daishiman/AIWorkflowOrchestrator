# TASK-RT-05: multi-select-user-input-kind

## 概要

SkillCreatorUserInputKind に `multi_select` を追加する。現在 `single_select` / `free_text` / `secret` / `confirm` のみ対応しており、「複数選択可」の要件が未充足である。本タスクは型定義、バリデーション、UI コンポーネントの三層にわたって `multi_select` 対応を追加する。

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-RT-05   |
| タスク種別 | 機能追加     |
| 優先度     | RT (Runtime) |
| ステータス | spec_created |
| 上流ゲート | なし         |
| 依存タスク | なし         |
| 後続タスク | TASK-P0-06   |
| 作成日     | 2026-03-29   |
| 更新日     | 2026-03-29   |

## 受入基準

| ID   | 基準                                                                             |
| ---- | -------------------------------------------------------------------------------- |
| AC-1 | `SkillCreatorUserInputKind` 型に `multi_select` が追加されている                 |
| AC-2 | `validateUserInputSubmission` に `multi_select` のバリデーションが追加されている |
| AC-3 | SkillLifecyclePanel に複数選択 UI が実装されている                               |
| AC-4 | 既存の `single_select` / `free_text` / `secret` / `confirm` が非破壊である       |

## スコープ

**含む**:

- `packages/shared/src/types/skillCreator.ts` — `multi_select` kind 追加
- `SkillCreatorWorkflowEngine.ts` — `validateUserInputSubmission` のバリデーション拡張
- `SkillLifecyclePanel.tsx` — 複数選択 UI コンポーネント（チェックボックスリスト）
- ユニットテスト

**含まない**:

- 他の新規 kind の追加
- バックエンド / main 側の IPC チャネル追加
- ドラッグ&ドロップによる並び替え

## 依存関係

| 種別       | 参照先                           | 役割                              |
| ---------- | -------------------------------- | --------------------------------- |
| upstream   | `../requirements-draft.md`       | skill-creator 全体の要件          |
| upstream   | `../root-workflow-pack/index.md` | lane 共通不変条件と責務分離方針   |
| downstream | TASK-P0-06                       | interview UI で multi_select 利用 |

## 現行コードアンカー

| ファイル                                                               | 現状の役割             | TASK-RT-05 での扱い             |
| ---------------------------------------------------------------------- | ---------------------- | ------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                            | UserInputKind 型定義   | `multi_select` 追加             |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | バリデーションロジック | multi_select バリデーション追加 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | ユーザー入力 UI        | 複数選択 UI 追加                |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| 真の論点             | 複数選択の kind が型レベルで欠落しており、バリデーション・UI ともに対応できない                         |
| 依存関係・責務境界   | shared types → engine → renderer の三層に跨るが、各層の変更は局所的                                     |
| 価値とコストの不均衡 | 型追加 + バリデーション分岐 + UI コンポーネントで完結。コスト低                                         |
| 改善優先順位         | 1. 型定義 2. バリデーション 3. UI コンポーネント 4. テスト                                              |
| 4条件評価            | 価値性: 高（要件充足）/ 実現性: 高（既存パターン拡張）/ 整合性: 既存 kind と同構造 / 運用性: テスト可能 |

## ディレクトリ構成

```text
step-09-par-task-rt-05-multi-select-user-input-kind/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
```

## 実装者向けクイックガイド

### 着手条件

- `packages/shared/src/types/skillCreator.ts` の `SkillCreatorUserInputKind` を読了している
- `SkillCreatorWorkflowEngine.ts` の `validateUserInputSubmission` を読了している
- `SkillLifecyclePanel.tsx` の既存 kind 切り替え UI を読了している

### 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts` — `SkillCreatorUserInputKind` に `"multi_select"` 追加、`SkillCreatorUserInput` に `selectedValues?: string[]` 追加
- `SkillCreatorWorkflowEngine.ts` — `validateUserInputSubmission` の switch/case に `multi_select` 追加
- `SkillLifecyclePanel.tsx` — チェックボックスリスト UI 追加

### 非対象

- 他の新規 kind
- ドラッグ&ドロップ
- main 側 IPC 変更

### 完了イメージ

- `multi_select` kind の入力要求が来たとき、チェックボックスリストが表示される
- ユーザーが複数選択し submit すると、`selectedValues` 配列がバリデーションを通る
- 既存の kind は影響を受けない

### 並列実行メモ

- TASK-RT-05 は TASK-P0-05 / TASK-P0-06 と並列実行可能（shared type のマージ競合に注意）

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
