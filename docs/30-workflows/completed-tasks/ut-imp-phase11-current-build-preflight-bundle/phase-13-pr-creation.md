# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001                                           |
| Phase      | 13                                                                                          |
| Phase名    | PR作成                                                                                      |
| カテゴリ   | 改善                                                                                        |
| 優先度     | 中                                                                                          |
| ステータス | blocked                                                                                     |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12 |
| 後続Phase  | なし                                                                                        |

## 目的

PR 用の説明文、検証結果、issue 取り扱い方針を整理し、 commit と PR を人の判断で実行できる状態を作る。

## 実行タスク

- タスク1: PR 情報を整理する
- タスク2: issue 取り扱い方針を整理する
- タスク3: 実行制約を確認する

### タスク1: PR 情報整理

**目的**: 変更点と検証結果を短く伝えられる状態にする

**整理項目**:

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| summary      | shared preflight core、thin CLI wrapper、capture integration、system spec 同期 |
| tests        | targeted vitest、build、manual test、Phase 12 監査                             |
| scope        | remediation task を含まない                                                    |
| architecture | shell-out 案を破棄し、shared core 正本へ寄せた理由                             |

### タスク2: issue 取り扱い方針

**目的**: closed Issue #1167 をどう扱うかを人が判断できる材料を残す

**確認項目**:

| 項目        | 方針                                             |
| ----------- | ------------------------------------------------ |
| issue state | #1167 は closed のため自動変更しない             |
| PR 本文     | 参照 issue として記載する                        |
| follow-up   | reopen と新規 issue のどちらにするかを人が決める |

### タスク3: 実行制約確認

**目的**: 自動 commit と自動 PR を防ぐ

**制約**:

| 項目   | ルール                                         |
| ------ | ---------------------------------------------- |
| commit | 人の明示指示が出るまで実行しない               |
| PR     | 人の明示指示が出るまで作成しない               |
| branch | 仕様書作成用 branch と実装用 branch を混ぜない |

## 参照資料

| 参照資料                 | パス                           | 説明                  |
| ------------------------ | ------------------------------ | --------------------- |
| Phase 1 要件定義         | `phase-1-requirements.md`      | AC と scope           |
| Phase 2 設計             | `phase-2-design.md`            | contract と sync plan |
| Phase 5 実装             | `phase-5-implementation.md`    | 実装対象              |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`    | test coverage         |
| Phase 7 カバレッジ確認   | `phase-7-coverage-check.md`    | command log           |
| Phase 8 リファクタリング | `phase-8-refactoring.md`       | helper 境界           |
| Phase 9 品質保証         | `phase-9-quality-assurance.md` | quality report        |
| Phase 10 最終レビュー    | `phase-10-final-review.md`     | gate 判定             |
| Phase 11 手動テスト      | `phase-11-manual-test.md`      | manual test 結果      |
| Phase 12 ドキュメント    | `phase-12-documentation.md`    | spec sync と監査      |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                        | 内容                           |
| ------------ | ------------------------------------------------------------------------------------------- | ------------------------------ |
| task 台帳    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | issue と workflow 状態の正本   |
| 品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | PR 前の確認項目                |
| 開発運用     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | commit と review の制約        |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | shared core 採用理由の伝達基準 |

## 実行手順

### ステップ1: PR 情報を shared contract 単位で整理する

shared core、thin CLI wrapper、capture consumer、Phase 12 同期の 4 観点で summary と tests をまとめる。

### ステップ2: issue と branch 制約を確認する

closed Issue #1167 を自動操作しないこと、仕様書 branch と実装 branch を混ぜないことを明文化する。

### ステップ3: 人の判断へ handoff する

commit / PR を自動実行せず、人がそのまま使える PR 情報だけを残す。

## 多角的チェック観点

| 観点           | この Phase での確認内容                                              | 主要仕様                                  |
| -------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| アーキテクチャ | PR summary が shared core 採用理由を正しく伝えるかを見る             | `architecture-implementation-patterns.md` |
| 品質           | tests と Phase 12 監査結果が漏れなく summary へ入るかを見る          | `quality-requirements.md`                 |
| 開発運用       | commit / PR / issue の制約が user 指示優先で明文化されているかを見る | `development-guidelines.md`               |

## 成果物

| 成果物  | パス                          | 内容                                 |
| ------- | ----------------------------- | ------------------------------------ |
| PR 情報 | `outputs/phase-13/pr-info.md` | summary、tests、issue 方針、実行制約 |

## 完了条件

- [ ] PR 情報に summary、tests、scope が記録されている
- [ ] shared core 採用理由と破棄案の要約が記録されている
- [ ] closed Issue #1167 の扱い方針が記録されている
- [ ] commit と PR を自動実行しない制約が記録されている
- [ ] 実装用 branch と仕様書用 branch の分離が記録されている
- [ ] 人の明示指示が出るまで実行しない方針が記録されている
