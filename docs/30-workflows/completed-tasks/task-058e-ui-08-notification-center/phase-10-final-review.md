# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 10                                                            |
| 機能名 | task-058e-ui-08-notification-center                           |
| 作成日 | 2026-03-11                                                    |
| 前提   | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9 |

## 目的

058e 実装が task 原本、056c 契約、quality gate を同時に満たすか最終判定する。

## 実行タスク

- UI最終レビュー: 文言、motion、responsive、empty state を確認する。
- IPC最終レビュー: delete 追加と既存 channel 共存を確認する。
- test最終レビュー: coverage と regression の未解決項目を確認する。
- ゲート判定: PASS / MINOR / MAJOR / CRITICAL と戻り先を記録する。

## 参照資料

| 参照資料            | パス                                                 | 説明           |
| ------------------- | ---------------------------------------------------- | -------------- |
| Phase 1 要件        | `outputs/phase-1/acceptance-criteria.md`             | 受け入れ条件   |
| Phase 2 設計        | `outputs/phase-2/architecture-design.md`             | 目標設計       |
| Phase 5 実装        | `outputs/phase-5/implementation-summary.md`          | 実装結果       |
| Phase 7 coverage    | `outputs/phase-7/coverage-report.md`                 | 数値結果       |
| Phase 9 品質        | `outputs/phase-9/quality-report.md`                  | 品質結果       |
| コンポーネント設計  | `outputs/phase-2/component-design.md`                | Phase 2 成果物 |
| 状態とIPC設計       | `outputs/phase-2/state-ipc-design.md`                | Phase 2 成果物 |
| 正本仕様抽出        | `outputs/phase-2/aiworkflow-requirements-extract.md` | Phase 2 成果物 |
| 要件定義書          | `outputs/phase-1/requirements-definition.md`         | Phase 1 成果物 |
| スコープ定義        | `outputs/phase-1/scope-definition.md`                | Phase 1 成果物 |
| SubAgent責務表      | `outputs/phase-1/subagent-ownership.md`              | Phase 1 成果物 |
| P50差分収束計画     | `outputs/phase-5/p50-gap-closure-plan.md`            | Phase 5 成果物 |
| IPC差分対応         | `outputs/phase-5/ipc-channel-migration.md`           | Phase 5 成果物 |
| カバレッジ不足一覧  | `outputs/phase-7/coverage-gap-list.md`               | Phase 7 成果物 |
| IPCセキュリティ確認 | `outputs/phase-9/ipc-security-check.md`              | Phase 9 成果物 |
| リファクタ記録      | `outputs/phase-8/refactoring-log.md`                 | Phase 8 成果物 |
| 責務境界チェック    | `outputs/phase-8/boundary-checklist.md`              | Phase 8 成果物 |

## 実行手順

### ステップ1: 最終判定観点

| 観点         | 内容                                             |
| ------------ | ------------------------------------------------ |
| 仕様一致     | 058e task の完了条件を満たす                     |
| ドメイン整合 | 056c 契約を壊さない                              |
| 品質下限     | coverage gate を満たす                           |
| security     | delete channel が allowlist と validation を持つ |

### ステップ2: 判定基準

| 判定     | 条件                                   | 戻り先           |
| -------- | -------------------------------------- | ---------------- |
| PASS     | blocker 0 件                           | Phase 11 / 12    |
| MINOR    | wording と screenshot 修正のみ         | Phase 11 / 12    |
| MAJOR    | 仕様未達か回帰あり                     | Phase 5 または 6 |
| CRITICAL | security 破綻か data corruption がある | Phase 1 または 5 |

## 統合テスト連携

| 観点           | 内容                                                          |
| -------------- | ------------------------------------------------------------- |
| UI             | Bell、list、item delete、empty state を通す                   |
| IPC            | get-history / mark-read / mark-all-read / delete / new を通す |
| Review barrier | Phase 11 と Phase 12 の開始可否を記録する                     |

## 成果物

| 成果物           | パス                                      | 説明     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |
| 未解決項目       | `outputs/phase-10/open-items.md`          | 残課題   |

## 完了条件

- [ ] UI / IPC / test / security の最終判定を記録している
- [ ] PASS / MINOR / MAJOR / CRITICAL と戻り先を記録している
- [ ] Phase 11 / 12 の開始可否を記録している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. UI 最終レビュー
2. IPC 最終レビュー
3. test 最終レビュー
4. 判定記録
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-10/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 10 と整合している

## 次のPhase

[Phase 11: 手動テスト検証](./phase-11-manual-test.md)
