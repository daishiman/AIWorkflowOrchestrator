# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 10                                            |
| 機能名 | task-058b-ui-04a-workspace-layout-filebrowser |
| 作成日 | 2026-03-10                                    |

## 目的

Phase 1 から 9 を横断レビューし、04A が release candidate として 04B / 04C 着手条件を満たすか判定する。

## 実行タスク

- トレーサビリティ確認: FR / NFR がテストと実装へ接続されているか確認する
- 回帰確認: resize、watcher、zero state、keyboard nav の回帰を確認する
- ドキュメント準備確認: Phase 11 と 12 で必要な情報が揃っているか確認する
- ゲート判定: PASS / MINOR / MAJOR / CRITICAL を決定する

## 参照資料

| 参照資料           | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| スコープ定義       | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物 |
| SubAgent責務表     | `outputs/phase-1/subagent-ownership.md`      | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物 |
| コンポーネント設計 | `outputs/phase-2/component-design.md`        | Phase 2 成果物 |
| 状態設計           | `outputs/phase-2/state-design.md`            | Phase 2 成果物 |
| IPC watcher設計    | `outputs/phase-2/ipc-watcher-design.md`      | Phase 2 成果物 |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物 |
| 回帰マトリクス     | `outputs/phase-6/regression-matrix.md`       | Phase 6 成果物 |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`         | Phase 7 成果物 |
| リファクタ記録     | `outputs/phase-8/refactoring-log.md`         | Phase 8 成果物 |
| 品質レポート       | `outputs/phase-9/quality-report.md`          | Phase 9 成果物 |

## 実行手順

### ステップ1: 判定基準

| 判定     | 条件                                                     | 戻り先           |
| -------- | -------------------------------------------------------- | ---------------- |
| PASS     | blocking issue 0 件、coverage 達成、manual test 準備完了 | Phase 11         |
| MINOR    | wording、log、document 補足のみ                          | Phase 11         |
| MAJOR    | UI / state / watcher / test の欠落がある                 | Phase 5 または 6 |
| CRITICAL | 04B / 04C 境界、IPC 契約、data loss の危険がある         | Phase 1 または 2 |

## 統合テスト連携

| 観点       | 具体項目                                                  |
| ---------- | --------------------------------------------------------- |
| 04A → 04B  | file context boundary が維持される                        |
| 04A → 04C  | preview open state と selected file contract が維持される |
| Navigation | `workspace` view route が維持される                       |
| Persist    | layout mode と panel sizes が起動間で再現される           |

## 多角的チェック観点

| 観点           | このPhaseでの確認内容                                                           | 仕様参照先                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 要件整合       | FR / NFR から test / manual test / doc sync まで途切れがないか確認する          | `requirements-traceability-matrix.md`, `phase-1-requirements.md`                                                                                            |
| UI/UX          | responsive、keyboard nav、status bar、overlay の完成度を最終確認する            | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `phase-11-manual-test.md`                                                   |
| 状態管理 / IPC | persist、watcher、boundary contract が 04B / 04C を阻害しないか確認する         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`, `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  |
| 品質ゲート     | PASS / MINOR / MAJOR / CRITICAL と戻り先が review-gate 正本に一致するか確認する | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`, `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

## 成果物

| 成果物            | パス                                      | 説明             |
| ----------------- | ----------------------------------------- | ---------------- |
| 最終レビュー結果  | `outputs/phase-10/final-review-result.md` | gate 結果        |
| release readiness | `outputs/phase-10/release-readiness.md`   | 残課題確認       |
| open items        | `outputs/phase-10/open-items.md`          | MINOR 以上の項目 |

## 完了条件

- [ ] PASS / MINOR / MAJOR / CRITICAL の基準を定義している
- [ ] 04B / 04C 境界を再確認する観点を定義している
- [ ] persist と navigation の確認観点を定義している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行時は以下を SubTask として分離する。

1. トレーサビリティ確認
2. 回帰 / 依存境界の確認
3. ドキュメント準備確認
4. ゲート判定と open items 更新
5. 完了条件と validator の確認

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-10/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser` を再実行できる状態

## 次のPhase

[Phase 11: 手動テスト検証](./phase-11-manual-test.md)
