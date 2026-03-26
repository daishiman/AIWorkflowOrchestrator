# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 8                                                  |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001 |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7        |
| 後続Phase  | Phase 9                                            |
| ステータス | 完了                                               |
| 作成日     | 2026-03-26                                         |

## 目的

failure append 修正で生じた重複処理、命名揺れ、責務混在を整理する。

## 実行タスク

- `verify_result` payload 生成の重複を確認する
- test helper の重複を整理する
- append 専用ロジックを責務境界に沿って保つ

## 参照資料

| 参照資料 | パス                        | 内容       |
| -------- | --------------------------- | ---------- |
| Phase 5  | `phase-5-implementation.md` | 実装内容   |
| Phase 7  | `phase-7-coverage-check.md` | 重複と欠落 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 内容           |
| --------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| architecture patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 責務分離の確認 |

## 統合テスト連携

| 観点       | 連携内容                                                 |
| ---------- | -------------------------------------------------------- |
| regression | refactor 後も Phase 6 の case が維持されることを確認する |

## 成果物

| 成果物        | パス                                     | 説明               |
| ------------- | ---------------------------------------- | ------------------ |
| refactor 方針 | `outputs/phase-8/refactoring-summary.md` | 重複排除と責務整理 |

## 完了条件

- [ ] append 実装が過剰抽象化されていない
- [ ] test helper の重複が整理されている
- [ ] state owner と artifact owner の境界が崩れていない
- [ ] 命名が `verify_result` 正本へ統一されている
