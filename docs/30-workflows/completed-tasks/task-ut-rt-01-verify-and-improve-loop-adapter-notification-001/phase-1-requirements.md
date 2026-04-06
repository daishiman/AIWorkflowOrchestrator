# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                                             |
| ------ | -------------------------------------------------------------- |
| Phase  | 1                                                              |
| 機能名 | task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 |
| 作成日 | 2026-04-06                                                     |

## 目的

`verifyAndImproveLoop()` 内で `improve()` が adapter エラーを返した場合の現状動作を調査し、通知統一に必要な変更を特定する。

## 実行タスク

- Task 1-1: 現行コード調査 — `verifyAndImproveLoop()` と `_executeInternal()` の通知パターン比較
- Task 1-2: 機能要件定義 — FR/AC定義
- Task 1-3: エッジケース洗い出し — E-1〜E-5の対処方針確定

## 参照資料

| 資料名               | パス                                                                                                  | 説明                         |
| -------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------- |
| 対象実装ファイル     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                 | verifyAndImproveLoop()の実装 |
| 既存テストファイル   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts`   | 既存adapter-statusテスト参照 |
| 親タスクワークフロー | `docs/30-workflows/ut-rt-01-execute-improve-adapter-guard-001/phase-10-final-review.md`               | MINOR指摘の原文参照          |
| 旧未タスク仕様書     | `docs/30-workflows/unassigned-task/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001.md` | 詳細要件参照                 |

## 実行手順

### Step 0: P50チェック（必須）

Phase 1 開始前に対象ファイルの現在の実装状態を確認する。

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# verifyAndImproveLoop() の現在の実装確認
rg -n "verifyAndImproveLoop|notificationService|notify|llm_adapter" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

### Step 1: Task 1-1 現行コード調査

**調査対象**:

- `RuntimeSkillCreatorFacade.verifyAndImproveLoop()`（L340〜L526付近）
- `recordImproveFailureSnapshot()`（L1013〜付近）
- `_executeInternal()` の通知呼び出しパターン（L1109〜L1140付近 — 実装済み参照）

**現状確認ポイント**:

| 確認項目                                                                      | 現状                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `improve()` が `success: false` を返した場合の通知呼び出し有無                | `recordImproveFailureSnapshot()` を呼ぶが通知なし（要検証）   |
| `errorCode` が戻り値 `RuntimeSkillCreatorVerifyAndImproveResult` に含まれるか | `errorCode?` フィールドあり（L443付近）                       |
| `recordImproveFailureSnapshot()` の phase 保持方針                            | `currentPhase: "improve"` のまま保持（L1042付近）             |
| `execute()` 単体の通知呼び出しパターン                                        | `notificationService?.notify("スキル作成失敗", ...)` 実装済み |

### Step 2: Task 1-2 機能要件定義

| ID   | 要件                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| FR-1 | `improve()` が `{ success: false }` を返した場合、`notificationService?.notify()` を呼び出す                    |
| FR-2 | 通知タイトルは `"スキル作成失敗"`、メッセージは `improveResult.error.message` とする                            |
| FR-3 | `verifyAndImproveLoop()` 戻り値の `errorCode` フィールドに `improveResult.error.code` を設定する                |
| FR-4 | `recordImproveFailureSnapshot()` は phase を `"improve"` のまま保持し、`verifyResult.status` を `"fail"` にする |
| FR-5 | adapter エラー時はループを即終了し、次の `while` イテレーションへ進まない                                       |

**受入基準（Acceptance Criteria）**:

| ID   | 基準                                                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------- |
| AC-1 | `improve()` が `llm_adapter_unavailable` を返した場合、`INotificationService.notify()` が呼び出される |
| AC-2 | 通知メッセージが `execute()` 単体ガードの通知文言（`"スキル作成失敗"` タイトル）と同等である          |
| AC-3 | `verifyAndImproveLoop()` の戻り値に `errorCode: "llm_adapter_unavailable"` が含まれる                 |
| AC-4 | `recordImproveFailureSnapshot()` が phase を `"improve"` のまま保持し、`verifyResult` だけを更新する  |
| AC-5 | `improve()` adapter エラー時にループが即終了し、無意味なリトライが発生しない                          |
| AC-6 | 既存の `verifyAndImproveLoop()` テストがリグレッションなし                                            |

### Step 3: Task 1-3 エッジケース洗い出し

| ケース | 説明                                              | 対応                                                     |
| ------ | ------------------------------------------------- | -------------------------------------------------------- |
| E-1    | `notificationService` が `undefined` の場合       | optional chaining で安全にスキップ                       |
| E-2    | `notificationService.notify()` が例外を投げた場合 | `try/catch` でスキップ（ループ結果に影響させない）       |
| E-3    | `improve()` が `terminal_handoff` を返した場合    | 既存の `terminal_handoff` 分岐で処理（通知不要）         |
| E-4    | `improve()` が `suggestions: []` を返した場合     | 既存の「改善提案なし」分岐で処理（adapter エラーでない） |
| E-5    | `errorCode` が `undefined` の adapter エラー      | `code` フィールドがある場合のみ伝播させる                |

## 統合テスト連携【必須】

| 連携アクション | 内容                                                       |
| -------------- | ---------------------------------------------------------- |
| 接続要件確認   | `INotificationService` インターフェースの型定義確認        |
| データフロー   | `improve()` → エラー伝播 → `notify()` 呼び出しフローの明記 |

## 成果物

| 成果物                     | 配置先                                  |
| -------------------------- | --------------------------------------- |
| 現行コード調査メモ         | `outputs/phase-1/code-investigation.md` |
| 機能要件定義（FR-1〜FR-5） | 本ファイル内（上記 Step 2 に記載）      |
| 受入基準（AC-1〜AC-6）     | 本ファイル内（上記 Step 2 に記載）      |
| エッジケース表（E-1〜E-5） | 本ファイル内（上記 Step 3 に記載）      |

## 完了条件

- [ ] P50チェック完了（対象ファイルの現状把握）
- [ ] FR-1〜FR-5 が定義されている
- [ ] AC-1〜AC-6 が定義されている
- [ ] E-1〜E-5 のエッジケースと対処方針が明記されている
- [ ] Phase 2 開始条件が整っている

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認すること:

- [ ] Task 1-1（現行コード調査）を完全に実行した
- [ ] Task 1-2（機能要件定義）を完全に実行した
- [ ] Task 1-3（エッジケース洗い出し）を完全に実行した

## 次Phase

→ [Phase 2: 設計](phase-2-design.md)

**Phase 1→2 の遷移条件**: FR/AC/エッジケースが全て定義されていること
