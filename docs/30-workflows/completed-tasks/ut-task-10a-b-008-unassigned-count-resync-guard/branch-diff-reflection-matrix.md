# ブランチ差分反映マトリクス

## 目的

本ブランチで追加・更新した workflow 資産が、`task-specification-creator` と `aiworkflow-requirements` の要求へ 1:1 で反映されているかを追跡する。

## 差分取得コマンド

```bash
find docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard -maxdepth 2 -type f | sort
git status --short docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## Atent Team 分担

| SubAgent | 関心ごと       | 担当範囲                                                                                   |
| -------- | -------------- | ------------------------------------------------------------------------------------------ |
| A        | Core Phase     | `phase-1`〜`phase-4`                                                                       |
| B        | Execution / QA | `phase-5`〜`phase-9`                                                                       |
| C        | Gate / Docs    | `phase-10`〜`phase-13`                                                                     |
| D        | 仕様抽出       | `aiworkflow-requirements-extraction-matrix.md`                                             |
| E        | 準拠監査       | `skill-compliance-audit.md`                                                                |
| F        | 整合監査       | `elegant-consistency-check-report.md`, `multi-thinking-improvement-matrix.md`, `outputs/*` |

## 仕様書別 SubAgent 割当

| 仕様書                                         | SubAgent | 主責務                   |
| ---------------------------------------------- | -------- | ------------------------ |
| `index.md`                                     | C0       | 入口情報と設計判断の固定 |
| `artifacts.json`                               | C1       | ルート台帳管理           |
| `phase-1-requirements.md`                      | A1       | 正本定義と要件化         |
| `phase-2-design.md`                            | A2       | 3層設計と更新順序        |
| `phase-3-design-review.md`                     | A3       | Gate準備                 |
| `phase-4-test-creation.md`                     | A4       | テスト設計               |
| `phase-5-implementation.md`                    | B1       | 実装計画                 |
| `phase-6-test-expansion.md`                    | B2       | 回帰計画                 |
| `phase-7-coverage-check.md`                    | B3       | カバレッジ基準           |
| `phase-8-refactoring.md`                       | B4       | 再利用ガード             |
| `phase-9-quality-assurance.md`                 | B5       | 品質保証                 |
| `phase-10-final-review.md`                     | C2       | 情報源整合レビュー       |
| `phase-11-manual-test.md`                      | C3       | 手動検証                 |
| `phase-12-documentation.md`                    | C4       | Phase 12 完全性          |
| `phase-13-pr-creation.md`                      | C5       | handoff 条件整理         |
| `aiworkflow-requirements-extraction-matrix.md` | D1       | 採用 / 非採用理由の固定  |
| `skill-compliance-audit.md`                    | E1       | 2 skill 準拠監査         |
| `elegant-consistency-check-report.md`          | F1       | 矛盾 / 漏れ / 依存監査   |
| `multi-thinking-improvement-matrix.md`         | F2       | 思考法監査               |
| `outputs/artifacts.json`                       | F3       | 副台帳同期               |
| `outputs/verification-report.md`               | F4       | 実測検証証跡             |

## 差分反映トレース

| 変更ファイル                                   | 反映観点                                       | 状態 |
| ---------------------------------------------- | ---------------------------------------------- | ---- |
| `index.md`                                     | 3層正本分類と補助監査資料導線                  | ✅   |
| `artifacts.json`                               | `lastUpdated` 更新と schema 準拠               | ✅   |
| `phase-1-requirements.md`                      | 3層正本分類の要件化                            | ✅   |
| `phase-2-design.md`                            | canonical -> derived 同期設計                  | ✅   |
| `phase-3-design-review.md`                     | 既存構造維持                                   | ✅   |
| `phase-4-test-creation.md`                     | 既存構造維持                                   | ✅   |
| `phase-5-implementation.md`                    | 既存構造維持                                   | ✅   |
| `phase-6-test-expansion.md`                    | 既存構造維持                                   | ✅   |
| `phase-7-coverage-check.md`                    | 既存構造維持                                   | ✅   |
| `phase-8-refactoring.md`                       | 既存構造維持                                   | ✅   |
| `phase-9-quality-assurance.md`                 | 既存構造維持                                   | ✅   |
| `phase-10-final-review.md`                     | 情報源整合レビュー追加                         | ✅   |
| `phase-11-manual-test.md`                      | 既存構造維持                                   | ✅   |
| `phase-12-documentation.md`                    | schema 検証、3層分類、verification report 追加 | ✅   |
| `phase-13-pr-creation.md`                      | 既存構造維持                                   | ✅   |
| `aiworkflow-requirements-extraction-matrix.md` | aiworkflow 抽出根拠の固定                      | ✅   |
| `skill-compliance-audit.md`                    | 2 skill 準拠監査                               | ✅   |
| `elegant-consistency-check-report.md`          | 破棄した前提と採用解の固定                     | ✅   |
| `multi-thinking-improvement-matrix.md`         | 20思考法の反映証跡                             | ✅   |
| `outputs/artifacts.json`                       | ルート台帳との同期                             | ✅   |
| `outputs/verification-report.md`               | 実測値の固定                                   | ✅   |

## 反映漏れガード

- [x] Phase 1〜13 が存在する
- [x] `index.md` から全Phaseへ到達できる
- [x] Phase 12 に Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 がある
- [x] 補助監査資料 5件を追加した
- [x] `artifacts.json` と `outputs/artifacts.json` を同期した
- [x] `outputs/verification-report.md` に実測値を残した
- [x] 3層正本分類を Phase 1 / 2 / 10 / 12 と `index.md` へ反映した
