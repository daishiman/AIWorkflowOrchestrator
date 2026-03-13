# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 |
| Phase      | 7                                                 |
| Phase名    | カバレッジ確認                                    |
| カテゴリ   | 改善                                              |
| 優先度     | 中                                                |
| ステータス | completed                                         |
| 前提Phase  | Phase 5, Phase 6                                  |
| 後続Phase  | Phase 8                                           |

## 目的

preflight bundle の test、build、CLI 実行コマンドがそろっているかを検証し、failure bucket と success path の確認漏れをなくす。

## 実行タスク

- タスク1: targeted test の網羅性を確認する
- タスク2: build と preflight 実行コマンドを確認する
- タスク3: 検証ログを記録する

### タスク1: targeted test 網羅性確認

**目的**: Phase 4 と Phase 6 の test case が実行可能な形にそろっているかを確認する

**確認項目**:

| 項目           | 合格条件                                                        |
| -------------- | --------------------------------------------------------------- |
| success path   | test で pass を確認できる                                       |
| 4 failure case | 各 bucket ごとに fail case がある                               |
| CLI options    | `--json`, `--write`, `--no-auto-serve`, `--base-url` が含まれる |
| no-duplication | capture consumer の重複排除を確認する検証が含まれる             |

### タスク2: build と preflight 実行コマンド確認

**目的**: current build capture へ進む前提コマンドを確定する

**確認コマンド**:

| コマンド                                                                                                                                           | 目的                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `pnpm --filter @repo/desktop exec vitest run scripts/phase11-current-build-preflight-core.test.ts scripts/phase11-current-build-preflight.test.ts` | shared core と CLI wrapper の targeted test |
| `pnpm --filter @repo/desktop build`                                                                                                                | build output 確認                           |
| `node apps/desktop/scripts/phase11-current-build-preflight.mjs --json`                                                                             | preflight 単体実行                          |

### タスク3: 検証ログ記録

**目的**: Phase 9 と Phase 10 で参照するログを残す

**記録対象**:

| 成果物                                        | 内容                |
| --------------------------------------------- | ------------------- |
| `outputs/phase-7/coverage-report.md`          | case ごとの充足状況 |
| `outputs/phase-7/verification-command-log.md` | 実行コマンドと結果  |

## 参照資料

| 参照資料           | パス                        | 説明                        |
| ------------------ | --------------------------- | --------------------------- |
| Phase 5 実装       | `phase-5-implementation.md` | 実装対象の一覧              |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md` | 追加 test と command matrix |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                                  | 内容                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                           | build と test の基準                              |
| 親 workflow 正本 | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | current build capture の前提                      |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           | shared core / wrapper / consumer の coverage 観点 |
| desktop build    | `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`                             | harness 出力と current build artifact の確認      |

## 実行手順

### ステップ1: targeted test の coverage を確認する

shared core、CLI wrapper、consumer 側重複排除の観点が test 群へ入っているかを確認する。

### ステップ2: build と preflight command を固定する

current build artifact が生成され、thin CLI wrapper から shared contract を呼び出せることを確認する。

### ステップ3: Phase 9/11 向けログを残す

coverage report と command log が品質保証と manual test の両方へ引き継げる形になっているかを確認する。

## 統合テスト連携

- Phase 7 の coverage report は Phase 9 品質保証と Phase 10 最終レビューの入力にする。
- build と preflight 実行ログは Phase 11 の success path 実施順の根拠にする。
- 不足 case があれば Phase 6 へ戻し、command matrix を更新する。

## 多角的チェック観点

| 観点           | この Phase での確認内容                                                   | 主要仕様                                  |
| -------------- | ------------------------------------------------------------------------- | ----------------------------------------- |
| アーキテクチャ | shared core / CLI wrapper / consumer の coverage が揃っているかを見る     | `architecture-implementation-patterns.md` |
| 品質           | test、build、CLI 実行ログが Phase 9/11 の入力になるかを見る               | `quality-requirements.md`                 |
| デスクトップ   | current build artifact と harness 出力確認が command に入っているかを見る | `technology-desktop.md`                   |

## 成果物

| 成果物                 | パス                                          | 内容                      |
| ---------------------- | --------------------------------------------- | ------------------------- |
| カバレッジ確認レポート | `outputs/phase-7/coverage-report.md`          | test と bucket の充足状況 |
| 検証コマンド記録       | `outputs/phase-7/verification-command-log.md` | コマンド結果の記録        |

## 完了条件

- [ ] success path と 4 failure case の充足状況が記録されている
- [ ] CLI オプションの充足状況が記録されている
- [ ] no-duplication 観点の検証が coverage に入っている
- [ ] build と preflight 実行コマンドが記録されている
- [ ] Phase 9 が参照できる検証ログが残っている
- [ ] current build capture へ進む前提が明文化されている

## 次Phase

Phase 8: リファクタリングへ進む。
