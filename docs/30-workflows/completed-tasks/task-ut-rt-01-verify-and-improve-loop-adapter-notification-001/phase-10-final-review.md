# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                                             |
| ------ | -------------------------------------------------------------- |
| Phase  | 10                                                             |
| 機能名 | task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 |
| 作成日 | 2026-04-06                                                     |

## 目的

Phase 1 で定義した受入基準（AC-1〜AC-6）に対して最終判定を行い、PR作成の可否を決定する。

## 実行タスク

- Task 10-1: 受入基準チェック（AC-1〜AC-6）
- Task 10-2: MINOR 指摘の記録
- Task 10-3: Phase 11 開始条件の確認

## 参照資料

| 資料名               | パス                                                         | 説明                |
| -------------------- | ------------------------------------------------------------ | ------------------- |
| Phase 1 受入基準     | [phase-1-requirements.md](phase-1-requirements.md)           | AC-1〜AC-6 の参照   |
| Phase 9 品質保証結果 | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 品質確認結果の参照  |
| Phase 3 MINOR追跡    | [phase-3-design-review.md](phase-3-design-review.md)         | TECH-M-01の追跡確認 |

## 実行手順

### Step 1: Task 10-1 受入基準チェック

| ID   | 受入基準                                                      | 判定 | 証跡          |
| ---- | ------------------------------------------------------------- | ---- | ------------- |
| AC-1 | `improve()` adapter エラー時に `notify()` が呼ばれる          | [ ]  | T-VL-01 PASS  |
| AC-2 | 通知文言が `execute()` 単体ガードと同等                       | [ ]  | T-VL-01 PASS  |
| AC-3 | 戻り値に `errorCode` が含まれる                               | [ ]  | T-VL-02 PASS  |
| AC-4 | `recordImproveFailureSnapshot()` が phase を `improve` で保持 | [ ]  | T-VL-02 PASS  |
| AC-5 | adapter エラー時にループが即終了する                          | [ ]  | T-VL-01 PASS  |
| AC-6 | 既存テストがリグレッションなし                                | [ ]  | T-REG-01 PASS |

### Step 2: Task 10-2 MINOR 指摘の記録

| MINOR ID  | 指摘内容                                                                           | 対応                     |
| --------- | ---------------------------------------------------------------------------------- | ------------------------ |
| TECH-M-01 | `notify()` 呼び出しが3か所（execute/improve単体/ループ内）に分散 → 共通ヘルパー化  | 別タスクとして検討       |
| TECH-M-02 | `executeAsync()` adapter エラーを `onWorkflowStateSnapshot` に伝搬する際の通知統一 | 別タスクとして formalize |

### Step 3: Task 10-3 Phase 11 開始条件確認

- [ ] AC-1〜AC-6 が全て PASS
- [ ] MINOR 指摘が記録されている（別タスク移管）
- [ ] MAJOR/CRITICAL 指摘がない

**Phase 11 開始判定**: APPROVED（全 AC 達成時）

**Phase 13 BLOCKED 条件**: AC が1つでも未達の場合（MAJOR 相当の問題あり）

## 統合テスト連携【必須】

| 連携アクション               | 内容                                                    |
| ---------------------------- | ------------------------------------------------------- |
| 最終レビューで統合テスト確認 | T-VL-01〜07 + T-REG-01 全て PASS していることを最終確認 |

## 成果物

| 成果物           | 配置先                                    |
| ---------------- | ----------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` |
| MINOR指摘記録    | 本ファイル内（Step 2 テーブル）           |

## 完了条件

- [ ] AC-1〜AC-6 の判定が全て PASS
- [ ] MINOR 指摘が記録されている
- [ ] Phase 11 開始条件が確認されている

## タスク100%実行確認【必須】

Phase 10 完了時に以下を確認すること:

- [ ] Task 10-1（受入基準チェック）を完全に実行した
- [ ] Task 10-2（MINOR 指摘記録）を完全に実行した
- [ ] Task 10-3（Phase 11 開始条件確認）を完全に実行した

## 次Phase

→ [Phase 11: 手動テスト](phase-11-manual-test.md)

**Phase 10→11 の遷移条件**: AC-1〜AC-6 が全て PASS であること
