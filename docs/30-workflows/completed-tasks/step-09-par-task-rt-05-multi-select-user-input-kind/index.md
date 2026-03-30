# TASK-RT-05: multi-select-user-input-kind

## 概要

`SkillCreatorUserInputKind` に `multi_select` を追加し、既存の `option.id` 契約を保ったまま複数選択入力を扱えるようにする。現在の workflow は `single_select` / `free_text` / `secret` / `confirm` の 4 種のみ対応で、送信 payload も `selectedOptionId` の単数前提である。本タスクは shared type、workflow engine、renderer の 3 層を最小拡張し、追加 IPC や別系統の入力モデルを増やさず `multi_select` を成立させる。

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-RT-05   |
| タスク種別 | 機能追加     |
| 優先度     | RT (Runtime) |
| ステータス | in_progress  |
| 上流ゲート | なし         |
| 依存タスク | なし         |
| 後続タスク | TASK-P0-06   |
| 作成日     | 2026-03-29   |
| 更新日     | 2026-03-30   |

> 現在値: code / spec sync は反映済み。Phase 11 の手動スクリーンショット証跡と Phase 9 のローカル再実行は未完了。

## 受入基準

| ID   | 基準                                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `packages/shared/src/types/skillCreator.ts` の `SkillCreatorUserInputKind` に `multi_select` が追加されている                            |
| AC-2 | `SkillCreatorUserInputSubmission` が `selectedOptionIds?: string[]` を持ち、`validateUserInputSubmission` が `multi_select` を検証できる |
| AC-3 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` が複数選択の入力 host を表示し、複数の `option.id` を送信できる     |
| AC-4 | 既存の `single_select` / `free_text` / `secret` / `confirm` の送信経路と表示挙動が非破壊である                                           |

## スコープ

**含む**:

- `packages/shared/src/types/skillCreator.ts` — `multi_select` kind 追加
- `packages/shared/src/types/skillCreator.ts` — `SkillCreatorUserInputSubmission.selectedOptionIds?: string[]` 追加
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` — `validateUserInputSubmission` の分岐追加
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — 複数選択入力 host の state と submit 分岐追加
- ユニットテスト

**含まない**:

- 他の新規 kind の追加
- バックエンド / main 側の IPC チャネル追加
- `SkillCreatorUserInputRequest` への新規 min/max プロパティ追加
- 全選択 / 全解除ボタンの追加
- ドラッグ&ドロップによる並び替え

## 依存関係

| 種別       | 参照先                                                                   | 役割                                 |
| ---------- | ------------------------------------------------------------------------ | ------------------------------------ |
| upstream   | `../skill-creator-agent-sdk-lane/requirements-draft.md`                  | skill-creator 全体の要件             |
| upstream   | `../skill-creator-agent-sdk-lane/root-workflow-pack/index.md`            | lane 共通不変条件と責務分離方針      |
| upstream   | `../skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md` | Step 09 の sibling task 配置         |
| downstream | TASK-P0-06                                                               | interview 画面で `multi_select` 利用 |

## 現行コードアンカー

| ファイル                                                                                           | 現状の役割                                   | TASK-RT-05 での扱い                                  |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                                        | `SkillCreatorUserInputKind` と submission 型 | `multi_select` と `selectedOptionIds` を追加する     |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                             | `validateUserInputSubmission` を保持         | `multi_select` 分岐を追加し option id 集合を検証する |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | awaitingUserInput の描画と submit            | checkbox 群の local state と送信 payload を追加する  |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`              | engine の回帰テスト                          | `multi_select` pass / fail ケースを追加する          |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | question host の描画テスト                   | 複数選択 host の描画と submit ケースを追加する       |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| 真の論点             | `kind` は単数選択前提を脱せていないのに、下流 task は複数選択を要求している。この契約差分を最小変更で埋める |
| 依存関係・責務境界   | shared types → engine → renderer の三層に跨るが、request schema と IPC surface は維持できる                 |
| 価値とコストの不均衡 | `selectedOptionIds` の配列化だけで要求を満たせる。新規 DTO や別コンポーネント層は不要                       |
| 改善優先順位         | 1. 型定義 2. engine validation 3. renderer submit 4. renderer host 5. 回帰テスト                            |
| 4条件評価            | 価値性: 高 / 実現性: 高 / 整合性: `option.id` 契約で統一 / 運用性: engine と renderer の両側で検証可能      |

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

- `packages/shared/src/types/skillCreator.ts` の `SkillCreatorUserInputKind` と `SkillCreatorUserInputSubmission` を読了している
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` の `validateUserInputSubmission` を読了している
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の既存 question host を読了している

### 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts` — `SkillCreatorUserInputKind` に `"multi_select"` を追加し、`SkillCreatorUserInputSubmission` に `selectedOptionIds?: string[]` を追加する
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` — `validateUserInputSubmission` に `multi_select` を追加し、空配列と未知 option id を拒否する
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — checkbox 群の state と submit 分岐を追加する
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` — validation の pass / fail ケースを追加する
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` — question host の描画と送信ケースを追加する

### 非対象

- 他の新規 kind
- min/max selection の一般化
- 全選択 / 全解除ボタン
- ドラッグ&ドロップ
- main 側 IPC 変更

### 完了イメージ

- `multi_select` kind の入力要求が来たとき、checkbox 群が表示される
- ユーザーが複数選択し submit すると、`selectedOptionIds` 配列が送信される
- engine が空配列と未知 option id を reject する
- 既存の 4 kind は従来どおり動作する

### 並列実行メモ

- TASK-RT-05 は TASK-P0-05 / TASK-P0-06 と並列実行可能
- `packages/shared/src/types/skillCreator.ts` は競合しやすいため、型変更は先に固める
- renderer と engine のテスト追加は型確定後に並列化できる

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
