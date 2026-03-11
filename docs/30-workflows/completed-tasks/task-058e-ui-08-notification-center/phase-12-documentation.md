# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 12                                  |
| 機能名 | task-058e-ui-08-notification-center |
| 作成日 | 2026-03-11                          |
| 前提   | Phase 11, Phase 10                  |

## 目的

058e 実装結果を、実装ガイド、システム仕様同期、未タスク検出、スキル改善へ落とし込む。将来の再監査でも抜けが出ないよう、必須成果物と同期先を固定する。

## 実行タスク

- 実装ガイド作成: Part 1 と Part 2 の 2 部構成を作る。
- system spec同期: Step 1-A / 1-B / 1-C と条件付き Step 2 を分けて定義する。
- changelog作成: 058e の変更点と証跡を記録する。
- 未タスク検出: 0 件でも出力し、swipe gesture 品質、delete 競合、theme 逸脱を監査する。
- feedback作成: 改善点がなくても成果物を作成する。

## 参照資料

| 参照資料              | パス                                                                            | 説明                    |
| --------------------- | ------------------------------------------------------------------------------- | ----------------------- |
| Phase 2 設計          | `outputs/phase-2/state-ipc-design.md`                                           | state / IPC             |
| Phase 5 実装          | `outputs/phase-5/p50-gap-closure-plan.md`                                       | 差分収束                |
| Phase 6 拡充          | `outputs/phase-6/integration-test.md`                                           | integration 結果        |
| Phase 7 coverage      | `outputs/phase-7/coverage-report.md`                                            | coverage 結果           |
| Phase 8 境界          | `outputs/phase-8/boundary-checklist.md`                                         | 境界確認                |
| Phase 9 品質          | `outputs/phase-9/quality-report.md`                                             | 品質結果                |
| Phase 10 判定         | `outputs/phase-10/final-review-result.md`                                       | 完了条件                |
| Phase 11 結果         | `outputs/phase-11/manual-test-result.md`                                        | 証跡                    |
| Phase 11 screenshot   | `outputs/phase-11/screenshot-matrix.md`                                         | 視覚証跡                |
| task workflow 正本    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | Phase 12 運用           |
| ui feature 正本       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 通知仕様同期先          |
| state 正本            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | slice 同期先            |
| task-spec 準拠台帳    | `task-specification-creator-compliance-matrix.md`                               | Phase 12 必須要件の監査 |
| requirements 抽出台帳 | `aiworkflow-requirements-extraction-matrix.md`                                  | 同期候補の根拠          |
| 差分反映台帳          | `branch-diff-reflection-matrix.md`                                              | 本ブランチ差分との接続  |
| アーキテクチャ設計    | `outputs/phase-2/architecture-design.md`                                        | Phase 2 成果物          |
| コンポーネント設計    | `outputs/phase-2/component-design.md`                                           | Phase 2 成果物          |
| 正本仕様抽出          | `outputs/phase-2/aiworkflow-requirements-extract.md`                            | Phase 2 成果物          |
| 要件定義書            | `outputs/phase-1/requirements-definition.md`                                    | Phase 1 成果物          |
| 受け入れ基準          | `outputs/phase-1/acceptance-criteria.md`                                        | Phase 1 成果物          |
| スコープ定義          | `outputs/phase-1/scope-definition.md`                                           | Phase 1 成果物          |
| SubAgent責務表        | `outputs/phase-1/subagent-ownership.md`                                         | Phase 1 成果物          |
| 実装サマリー          | `outputs/phase-5/implementation-summary.md`                                     | Phase 5 成果物          |
| IPC差分対応           | `outputs/phase-5/ipc-channel-migration.md`                                      | Phase 5 成果物          |
| 未解決項目            | `outputs/phase-10/open-items.md`                                                | Phase 10 成果物         |
| 手動テスト計画        | `outputs/phase-11/manual-test-plan.md`                                          | Phase 11 成果物         |
| リファクタ記録        | `outputs/phase-8/refactoring-log.md`                                            | Phase 8 成果物          |
| screenshot計画        | `outputs/phase-11/screenshot-plan.json`                                         | Phase 11 成果物         |
| screenshot網羅率      | `outputs/phase-11/screenshot-coverage.md`                                       | Phase 11 成果物         |
| 発見事項一覧          | `outputs/phase-11/discovered-issues.md`                                         | Phase 11 成果物         |

## 実行手順

### ステップ1: 実装ガイド構成

| Part   | 内容                                                                                        |
| ------ | ------------------------------------------------------------------------------------------- |
| Part 1 | 中学生向け。Bell とお知らせ箱の比喩で「なぜ必要か」を先に説明し、専門用語をそのまま置かない |
| Part 2 | 開発者向け。component、slice、IPC、a11y、gesture、型、API シグネチャ、edge case を説明する  |

### ステップ2: Task 2 system spec 同期

| Step     | 内容                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| Step 1-A | 完了タスク記録、関連ドキュメントリンク、変更履歴、LOGS / topic-map の更新要否と更新対象を特定する |
| Step 1-B | 実装状況テーブルを `spec_created` または完了状態へ同期する                                        |
| Step 1-C | 関連タスク / 未タスク候補テーブルを更新する                                                       |
| Step 2   | 新規 interface / API / 定数追加がある場合のみ system spec 正本を更新する                          |

### ステップ3: system spec 同期先候補

| 同期先                        | 反映内容                                              |
| ----------------------------- | ----------------------------------------------------- |
| `ui-ux-feature-components.md` | Notification popover UI の 058e 補完点                |
| `arch-state-management.md`    | `notificationSlice` の delete 契約と P50 補完         |
| `lessons-learned.md`          | clear all UI と task 正本差分の再発防止               |
| `ui-ux-navigation.md`         | Bell 導線と `aria-label` 契約の同期                   |
| `api-ipc-system.md`           | `notification:delete` を追加した場合の契約同期        |
| `security-electron-ipc.md`    | delete channel の allowlist / sender 検証追加時の同期 |

### ステップ4: 未タスク監査

| 監査対象      | 監査内容                                        |
| ------------- | ----------------------------------------------- |
| swipe gesture | mobile と trackpad の差分                       |
| push race     | delete 直後 push 再着時の整合                   |
| theme drift   | 3 theme で badge 可読性が維持されるか           |
| a11y drift    | live region と focus 戻しが視覚実装と一致するか |

### ステップ5: スキルフィードバック

| 対象                         | 観点                                                            |
| ---------------------------- | --------------------------------------------------------------- |
| `task-specification-creator` | Phase 12 の必須節や監査台帳の不足が再発しないか                 |
| `aiworkflow-requirements`    | Notification UI で直接ヒットしにくい query の再入場導線が十分か |

## 成果物

| 成果物               | パス                                            | 説明                                |
| -------------------- | ----------------------------------------------- | ----------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 + Part 2                     |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step 1-A / 1-B / 1-C と Step 2 判定 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | changelog                           |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 0 件でも出力する未タスク一覧        |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善点なしでも出力するスキル改善点  |

## 完了条件

- [ ] 実装ガイドの Part 1 / Part 2 を定義している
- [ ] Step 1-A / 1-B / 1-C と条件付き Step 2 を定義している
- [ ] system spec 同期先を 5 件以上定義している
- [ ] 未タスク検出を 0 件でも出力必須としている
- [ ] feedback 成果物を改善点なしでも必須にしている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 実装ガイド構成
2. Step 1-A / 1-B / 1-C 整理
3. 条件付き Step 2 判定整理
4. changelog / 未タスク整理
5. feedback 整理

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-12/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 12 と整合している

## 次のPhase

[Phase 13: PR作成](./phase-13-pr-creation.md)
