# Phase 12: ドキュメント

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase      | 12                                                   |
| Phase名    | ドキュメント更新                                     |
| タスクID   | TASK-SKILL-LIFECYCLE-05                              |
| タスク名   | 作成済みスキルを使う主導線                           |
| 機能名     | created-skill-usage-journey                          |
| 前提Phase  | [phase-11-manual-test.md](./phase-11-manual-test.md) |
| 後続Phase  | [phase-13-pr-creation.md](./phase-13-pr-creation.md) |
| ステータス | completed                                            |
| 最終更新日 | 2026-03-15                                           |

## 目的

Phase 1-11 で確定した「作成直後/あとから/履歴から」の3導線設計を、
実装時に再利用できる実装ガイド・仕様同期記録・未タスク台帳として固定する。

## 実行タスク

- タスク1: 実装ガイド（Part 1/Part 2）を作成する。
- タスク2: システム仕様更新（Step 1-A/1-B/1-C/1-D + Step 2 判定）を実施する。
- タスク3: documentation-changelog を実績ベースで記録する。
- タスク4: 未タスク検出レポートを作成し、指定ディレクトリ配置を検証する。
- タスク5: スキルフィードバックレポートを作成し、必要なスキル改善を反映する。

## 参照資料

| 参照資料                 | パス                                                                                                        | 用途                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 11 手動テスト結果  | [phase-11-manual-test.md](./phase-11-manual-test.md)                                                        | TC と画面証跡の再確認      |
| Phase 12 ガイド          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                 | 必須タスク/成果物の確認    |
| 仕様更新ワークフロー     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                              | Step 1/Step 2 の実施基準   |
| システム仕様（統合正本） | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` | 実装内容/苦戦箇所の反映先  |
| lessons learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                              | 再利用可能な苦戦箇所の記録 |
| backlog 正本             | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                | 未タスク台帳連携           |

## 実行手順

1. タスク1: `outputs/phase-12/implementation-guide.md` を Part 1 / Part 2 で整備した。
2. タスク2: Step 1-A〜1-D を実施し、Step 2 は「更新あり」と判定して system spec を追補した。
3. タスク3: `documentation-changelog.md` を「実施結果のみ」へ更新し、計画記述を除去した。
4. タスク4: 未タスク6件を `docs/30-workflows/completed-tasks/unassigned-task/` へ移管し、監査結果を記録した。
5. タスク5: `skill-creator` に再発防止パターンを追加し、LOGS/SKILL へ反映した。

## SubAgent分担（関心ごと分離）

| SubAgent   | 責務                                  | 出力                                                                                               |
| ---------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| SubAgent-A | Phase 12 実行記録同期                 | `phase-12-documentation.md`, `documentation-changelog.md`, `phase12-task-spec-compliance-check.md` |
| SubAgent-B | system spec 同期（実装内容/苦戦箇所） | `workflow-skill-lifecycle-created-skill-usage-journey.md`, `lessons-learned-current.md`            |
| SubAgent-C | 未タスク検出/配置監査                 | `unassigned-task-detection.md`, `spec-update-summary.md`                                           |
| SubAgent-D | スキル改善反映                        | `skill-feedback-report.md`, `skill-creator` の `patterns.md` / `LOGS.md` / `SKILL.md`              |

## 画面検証結果（Phase 11連携）

- review board を含む代表画面証跡を `outputs/phase-11/screenshots/` に配置済み。
- `TC-11-01`〜`TC-11-05` を `validate-phase11-screenshot-coverage` で突合済み（5/5）。
- 画面検証の詳細は `outputs/phase-11/manual-test-result.md` と metadata を参照する。

## 成果物

| 成果物                 | パス                                                     | 内容                             |
| ---------------------- | -------------------------------------------------------- | -------------------------------- |
| 実装ガイド             | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2                  |
| 仕様更新サマリー       | `outputs/phase-12/spec-update-summary.md`                | Step 1-A〜1-D / Step 2 の結果    |
| 更新履歴               | `outputs/phase-12/documentation-changelog.md`            | 実施ログと検証結果               |
| 未タスク検出           | `outputs/phase-12/unassigned-task-detection.md`          | 検出件数/配置監査/リンク監査     |
| スキルフィードバック   | `outputs/phase-12/skill-feedback-report.md`              | 3スキル改善結果                  |
| 準拠チェック           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1〜5 準拠判定               |
| 互換レポート（旧命名） | `outputs/phase-12/unassigned-task-report.md`             | 詳細未タスク説明（既存運用互換） |

## 完了条件

- [x] タスク1: implementation-guide.md（Part 1 + Part 2）を作成した
- [x] タスク2 Step 1-A: 完了記録（LOGS/SKILL 含む）を同期した
- [x] タスク2 Step 1-B: 実装状況/台帳の整合を更新した
- [x] タスク2 Step 1-C: 関連タスク/未タスク参照を更新した
- [x] タスク2 Step 1-D: index 再生成と更新履歴記録を実施した
- [x] タスク2 Step 2: system spec へ実装内容と苦戦箇所を反映した
- [x] タスク3: documentation-changelog.md を実績ベースで更新した
- [x] タスク4: 未タスク6件を指定ディレクトリへ配置し監査した
- [x] タスク5: skill-feedback-report.md を作成し skill-creator 改善を反映した
- [x] artifacts.json の Phase 12 状態と成果物リストを同期した

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 必須成果物を生成し、実在確認を完了
- [x] Phase 12検証コマンド群を再実行し PASS を確認
- [x] 未タスク配置・リンク・フォーマット監査を実施

## 次のPhase

Phase 13: [phase-13-pr-creation.md](./phase-13-pr-creation.md)
