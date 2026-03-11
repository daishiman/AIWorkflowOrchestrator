# Phase 13: PR作成

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 13                                            |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

実行完了後のレビュー提出物を整理する。現時点のユーザー指示では commit / PR は実施しないため、この Phase は提出物の準備仕様として保持する。

## 実行タスク

- PR情報整理: 変更概要、テスト結果、スクリーンショット、仕様同期内容をまとめる
- レビュー観点整理: 04B / 04C への影響と未タスクを明記する
- ユーザー確認待ち: commit / PR は明示指示まで保留する

## 参照資料

| 資料名           | パス                                  | 説明                      |
| ---------------- | ------------------------------------- | ------------------------- |
| Phase 1          | `phase-1-requirements.md`             | 要件                      |
| Phase 2          | `phase-2-design.md`                   | 設計                      |
| Phase 5          | `phase-5-implementation.md`           | 実装                      |
| Phase 6          | `phase-6-test-expansion.md`           | 追加テスト                |
| Phase 7          | `phase-7-coverage-check.md`           | coverage                  |
| Phase 8          | `phase-8-refactoring.md`              | refactor                  |
| Phase 9          | `phase-9-quality-assurance.md`        | 品質保証                  |
| Phase 10         | `phase-10-final-review.md`            | 最終 gate                 |
| Phase 11         | `phase-11-manual-test.md`             | screenshot と manual test |
| Phase 12         | `phase-12-documentation.md`           | 文書同期                  |
| トレーサビリティ | `requirements-traceability-matrix.md` | 要件対応表                |

## 実行手順

### ステップ1: PR本文の構成

| セクション | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Summary    | 04A で実装した layout / file browser / watcher / status bar |
| Testing    | vitest、typecheck、manual test、screenshot                  |
| Spec Sync  | 更新した `aiworkflow-requirements` 正本仕様                 |
| Risks      | 04B / 04C 連携と未タスク                                    |

### ステップ2: 保留条件

| 条件                                 | 対応                |
| ------------------------------------ | ------------------- |
| ユーザーが commit 禁止を指示している | commit を実行しない |
| ユーザーが PR 禁止を指示している     | PR を作成しない     |

## 多角的チェック観点

| 観点             | このPhaseでの確認内容                                                | 仕様参照先                                                                          |
| ---------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| トレーサビリティ | Phase 1-12 の成果物が PR 本文草案へ辿れるか確認する                  | `requirements-traceability-matrix.md`, `outputs/verification-report.md`             |
| 品質             | coverage、manual test、doc sync の要点が不足なく要約されるか確認する | `phase-7-coverage-check.md`, `phase-11-manual-test.md`, `phase-12-documentation.md` |
| 依存関係         | 04B / 04C への影響、未タスク、リスクが独立して読めるか確認する       | `phase-10-final-review.md`, `phase-12-documentation.md`                             |
| ユーザー制約     | commit / PR 禁止条件を破らない手順になっているか確認する             | ユーザー指示, `index.md`                                                            |

## 成果物

| 成果物   | パス                                    | 説明                |
| -------- | --------------------------------------- | ------------------- |
| PR情報   | `outputs/phase-13/pr-info.md`           | PR テンプレート草案 |
| 完了報告 | `outputs/phase-13/completion-report.md` | 実行完了時の要約    |

## 完了条件

- [ ] PR 本文の構成を定義している
- [ ] Testing と Spec Sync の記載項目を定義している
- [ ] commit / PR をユーザー明示指示まで保留する条件を明記している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. PR 本文草案の整理
2. Testing / Spec Sync / Risks の整理
3. ユーザー制約の再確認
4. 成果物更新
5. 完了条件の確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-13/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

次工程なし。ユーザーの明示指示があるまで commit / PR は保留する。
