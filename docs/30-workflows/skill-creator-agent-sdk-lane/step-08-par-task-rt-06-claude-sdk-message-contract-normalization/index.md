# TASK-RT-06: claude-sdk-message-contract-normalization

## 概要

Claude Code SDK の `query()` は `system/init`、`assistant`、`result` など複数種の `SDKMessage` をストリームで返し、`session_id`、permission denial、result subtype などの重要情報を含む。本タスクは、この SDK 生イベントを lane 内の安定契約へ正規化し、常に最新の `.claude/skills/skill-creator/` を動的に読んで実行する主線を壊さずに、UI / WorkflowEngine / session resume が一貫した入力を受け取れるようにする。

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-RT-06                                     |
| タスク種別 | バグ修正 / SDK 契約安定化                      |
| 優先度     | RT (Runtime)                                   |
| ステータス | spec_created                                   |
| 上流ゲート | なし                                           |
| 依存タスク | なし                                           |
| 後続タスク | TASK-RT-03, TASK-P0-05, TASK-P0-08, TASK-P0-09 |
| 作成日     | 2026-03-29                                     |
| 更新日     | 2026-03-29                                     |

## 受入基準

| ID   | 基準                                                                                    |
| ---- | --------------------------------------------------------------------------------------- |
| AC-1 | Claude Code SDK の `SDKMessage` を lane 専用の正規化イベント型へ変換できる              |
| AC-2 | `session_id`、`result.subtype`、permission denial、stop reason が正規化結果に保持される |
| AC-3 | UI / IPC / WorkflowEngine が SDK 生イベントではなく正規化イベントを消費する             |
| AC-4 | `.claude/skills/skill-creator/` の source root / provenance が正規化結果へ紐付く        |
| AC-5 | `system/init` 不在、途中中断、permission denial、tool error の edge case を扱える       |
| AC-6 | 既存の `skill-creator` 動的読込と `query()` 実行主線を変更しない                        |

## スコープ

**含む**:

- Claude Code SDK `SDKMessage` → lane 正規化イベント型の定義
- `system/init` / `assistant` / `result` / error 系メッセージの分類
- `session_id` / provenance / permission denial / result subtype の保持
- Facade / IPC / renderer へ渡す payload の統一
- ストリーム順序と replay 可能性の定義
- ユニットテスト・統合テスト

**含まない**:

- `.claude/skills/skill-creator/` の内容固定化やハードコード
- `query()` 呼び出しそのものの実装置き換え
- permission policy 本体の実装（TASK-P0-09 の責務）
- session persistence UI（TASK-P0-08 の責務）

## 依存関係

| 種別       | 参照先                           | 役割                                       |
| ---------- | -------------------------------- | ------------------------------------------ |
| upstream   | `../requirements-draft.md`       | `query()` 主線と session 要件              |
| upstream   | `../root-workflow-pack/index.md` | lane 共通不変条件                          |
| downstream | TASK-RT-03                       | 結果パネル表示の入力契約                   |
| downstream | TASK-P0-05                       | execute 書き出し時の result 解釈           |
| downstream | TASK-P0-08                       | session resume の `session_id` 契約        |
| downstream | TASK-P0-09                       | permission / hooks / audit の event source |

## 現行コードアンカー

| ファイル                                                              | 現状の役割                  | TASK-RT-06 での扱い                    |
| --------------------------------------------------------------------- | --------------------------- | -------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `query()` 実行結果の橋渡し  | SDKMessage 正規化の entry point を追加 |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | renderer へのレスポンス変換 | 正規化 payload を forward              |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | preload API 定義            | ストリーム / result payload を同期     |
| `packages/shared/src/types/skillCreator.ts`                           | 共有型定義                  | lane 正規化イベント型を追加            |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点             | SDK 生イベントがそのまま UI / Workflow に漏れると、`session_id`、permission denial、result subtype の重要情報を安定して扱えない |
| 依存関係・責務境界   | SDKMessage の解釈は Facade 手前で閉じ、UI は lane 契約だけを消費する                                                            |
| 価値とコストの不均衡 | 一度正規化層を置くと、session / file writer / hooks の後続実装が単純化する                                                      |
| 改善優先順位         | 1. 型定義 2. normalizer 3. Facade 統合 4. IPC payload 5. renderer 消費点調整                                                    |
| 4条件評価            | 価値性: 高 / 実現性: 高 / 整合性: 高 / 運用性: 高                                                                               |

## ディレクトリ構成

```text
step-08-par-task-rt-06-claude-sdk-message-contract-normalization/
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

- Claude Code SDK の `query()` / `SDKMessage` / `session_id` 契約を読了している
- `.claude/skills/skill-creator/` を常に動的解決する前提を理解している
- 既存 `RuntimeSkillCreatorFacade` の `query()` bridge を把握している

### 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts` — 正規化イベント型追加
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — SDKMessage normalizer 統合
- `apps/desktop/src/main/ipc/creatorHandlers.ts` — 正規化 payload 返却
- renderer state / result panel — 生イベント依存の排除

### 非対象

- skill-creator の固定プロンプト化
- 動的ロードの停止
- permission policy / hooks 本体

### 完了イメージ

- `query()` 実行の全結果が lane 正規化イベントとして揃う
- `session_id` が session resume にそのまま引き渡せる
- permission denial や result subtype が UI へ欠落なく届く
- `.claude/skills/skill-creator/` の provenance が結果へ紐付く

### 並列実行メモ

- TASK-RT-06 は他の Step 08 タスクと並列可能
- `packages/shared/src/types/skillCreator.ts` は RT-01/02/05 と競合しやすい

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
