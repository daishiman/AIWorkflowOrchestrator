# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 10                                        |
| Phase名    | 最終レビュー                              |
| カテゴリ   | ゲート                                    |
| ステータス | completed                                 |
| 前提Phase  | Phase 9                                   |
| 後続Phase  | Phase 11                                  |

## 目的

AC-1..8 を最終判定し、手動テストへ進行できる状態か判定する。

## 実行タスク

- タスク1: 受入基準達成をレビューする
- タスク2: 残課題とリスクをレビューする
- タスク3: ゲート判定を記録する

### タスク1: 受入基準達成をレビューする

**目的**: AC-1..8 の達成状態を判定する。

**手順**:

1. AC-1..8 と証跡ファイルを 1 対 1 で照合する。
2. 証跡不足項目を抽出する。
3. 不足項目を `MAJOR` 指摘へ分類する。

**期待される成果物**:

- ACレビュー結果

### タスク2: 残課題とリスクをレビューする

**目的**: 手動テストで確認するリスクを固定する。

**手順**:

1. Team-A/B/C の残リスクを抽出する。
2. 手動テストで確認する観点へ変換する。
3. 影響範囲と優先度を記録する。

**期待される成果物**:

- リスクレビュー結果

### タスク3: ゲート判定を記録する

**目的**: Phase 11 進行可否を一意に決定する。

**手順**:

1. 判定を `PASS` / `MINOR` / `MAJOR` で記録する。
2. `MAJOR` の場合は戻り先 Phase を記録する。
3. 判定理由を再現可能な形式で記録する。

**期待される成果物**:

- 最終レビュー判定書

## 参照資料

| 参照資料      | パス                                                                                         | 説明     |
| ------------- | -------------------------------------------------------------------------------------------- | -------- |
| Phase 1成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-1/` | 要件定義 |
| Phase 2成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-2/` | 設計定義 |
| Phase 5成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/` | 実装結果 |
| Phase 9成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-9/` | 品質証跡 |
| 受入基準      | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/index.md`         | AC-1..8  |

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                   | 内容       |
| ---------- | ---------------------------------------------------------------------- | ---------- |
| タスク台帳 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 状態同期先 |
| 教訓集     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 苦戦反映先 |

## 統合テスト連携

- 手動テスト前に Team-A/B/C 統合テスト再実行ログを固定する。
- 再実行結果は Phase 11 テストシナリオへ添付する。

## 成果物

| 成果物           | パス                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| 最終レビュー結果 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-10/final-review-result.md` |
| ゲート判定       | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-10/gate-decision.md`       |
| 残課題一覧       | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-10/open-issues.md`         |

## 完了条件

- [x] AC-1..8 の判定が完了している
- [x] 残課題とリスクが分類されている
- [x] 判定が PASS または MINOR で記録されている
- [x] MAJOR 指摘時は戻り先 Phase が記録されている
- [x] 本Phase内の全タスクを100%実行完了
