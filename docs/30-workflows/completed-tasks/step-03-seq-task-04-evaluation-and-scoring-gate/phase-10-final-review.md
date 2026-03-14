# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 10                      |
| Phase名    | 最終レビュー            |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | completed               |
| 前提Phase  | Phase 1, 2, 5, 9        |
| 後続Phase  | Phase 11                |

## 目的

採点と評価ゲートが受け入れ基準を満たし、導線制御に使える状態かを最終判定する。

## 実行タスク

- タスク1: 受入基準 AC-1〜AC-5 の充足をレビューする。
- タスク2: 品質ゲート結果と仕様整合監査をレビューする。
- タスク3: 残課題を `PASS` `MINOR` `MAJOR` で分類する。
- タスク4: 次フェーズへの進行可否を判定する。

## 参照資料

| 参照資料        | パス                                                                                                   | 目的                       |
| --------------- | ------------------------------------------------------------------------------------------------------ | -------------------------- |
| タスクindex     | `./index.md`                                                                                           | 受入基準確認               |
| 品質ゲート結果  | `./phase-9-quality-assurance.md`                                                                       | 品質判定確認               |
| レビュー基準    | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`                         | 判定ルール確認             |
| 仕様抽出マップ  | `./aiworkflow-requirements-extraction.md`                                                              | 仕様充足確認               |
| エレガンス監査  | `./elegance-thinking-audit.md`                                                                         | 矛盾・漏れ・依存の最終確認 |
| 依存Phase成果物 | phase-1-requirements.md（Phase 1）, phase-2-design.md（Phase 2）, phase-5-implementation.md（Phase 5） | Phase 1/2/5 の成果物を参照 |

## 実行手順

1. AC-1〜AC-5 を項目別に検証する。
2. 品質ゲート結果をレビューする。
3. 指摘を PASS/MINOR/MAJOR で分類する。
4. 戻り先と進行条件を確定する。

## 統合テスト連携

- Phase 11 手動テストへ渡す確認項目と優先順位を確定する。
- `MAJOR` 判定時は Phase 5 または Phase 8 へ戻す。

## 多角的チェック観点（AIが判断）

- 採点が導線制御に直結しているか。
- 仕様抽出マップで定義した正本仕様に矛盾がないか。
- 未解決事項が Phase 11 へ持ち越されていないか。

## サブタスク管理

| SubAgent   | 責務             | 実行方式 | 出力                 |
| ---------- | ---------------- | -------- | -------------------- |
| SubAgent-A | ACレビュー       | 並列     | acceptance-review.md |
| SubAgent-B | 品質レビュー     | 並列     | quality-review.md    |
| SubAgent-C | 仕様整合レビュー | 並列     | spec-review.md       |

## 成果物

| 成果物           | パス                                      | 内容                  |
| ---------------- | ----------------------------------------- | --------------------- |
| 最終レビュー仕様 | `./phase-10-final-review.md`              | 判定手順              |
| 最終判定記録     | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR 判定 |

## 完了条件

- [x] AC-1〜AC-5 の判定が記録されている
- [x] PASS/MINOR/MAJOR 判定が記録されている
- [x] 戻り先が記録されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 次Phase

- PASS/MINOR: Phase 11 へ進む
- MAJOR: Phase 5 または Phase 8 へ戻る
