# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                                             |
| ------ | -------------------------------------------------------------- |
| Phase  | 6                                                              |
| 機能名 | task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 |
| 作成日 | 2026-04-06                                                     |

## 目的

Phase 5 で実装した通知機能のテストカバレッジをさらに拡充し、エッジケースとリグレッションシナリオを網羅する。

## 実行タスク

- Task 6-1: 追加テストの設計（T-VL-06〜07, T-REG-01）
- Task 6-2: 追加テストコードの実装
- Task 6-3: 全テスト実行確認

## 参照資料

| 資料名               | パス                                                   | 説明                 |
| -------------------- | ------------------------------------------------------ | -------------------- |
| Phase 5 成果物       | [phase-5-implementation.md](phase-5-implementation.md) | 実装済みコードの参照 |
| Phase 4 テスト       | [phase-4-test-creation.md](phase-4-test-creation.md)   | 既存テストの参照     |
| Phase 1 エッジケース | [phase-1-requirements.md](phase-1-requirements.md)     | E-1〜E-5 の対処方針  |

## 実行手順

### Step 1: Task 6-1 追加テスト設計

| テストID | シナリオ                                                            | 優先度 |
| -------- | ------------------------------------------------------------------- | ------ |
| T-VL-06  | `improve()` が `catch` ブロックで例外を出した場合                   | LOW    |
| T-VL-07  | `improve()` が `terminal_handoff` を返した場合は通知なし            | LOW    |
| T-REG-01 | `verifyAndImproveLoop()` の既存 PASS シナリオ（リグレッション確認） | HIGH   |

### Step 2: Task 6-2 追加テストコード実装

**テスト対象ファイル**:
`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`

**T-VL-07 の検証ポイント**:

- `terminal_handoff` は adapter エラーではないため、通知が呼ばれないことを確認
- 既存の `terminal_handoff` 分岐ロジックが壊れていないことを確認

**T-REG-01 の検証ポイント**:

- `verifyAndImproveLoop()` の正常系（PASS シナリオ）が動作し続けることを確認

### Step 3: Task 6-3 全テスト実行確認

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

**期待結果**: T-VL-01〜07 + T-REG-01 全て PASS

## 統合テスト連携【必須】

| 連携アクション   | 内容                                                        |
| ---------------- | ----------------------------------------------------------- |
| 統合テストの拡充 | 全カテゴリのカバレッジ向上（エッジケース + リグレッション） |

## 成果物

| 成果物                                    | 配置先                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 追加テストコード（T-VL-06〜07, T-REG-01） | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` |

## 完了条件

- [ ] T-VL-06〜07 のテストが追加されている
- [ ] T-REG-01（既存シナリオ）がリグレッションなし
- [ ] T-VL-01〜07 + T-REG-01 全て PASS する

## タスク100%実行確認【必須】

Phase 6 完了時に以下を確認すること:

- [ ] Task 6-1（追加テスト設計）を完全に実行した
- [ ] Task 6-2（追加テストコード実装）を完全に実行した
- [ ] Task 6-3（全テスト実行確認）を完全に実行した

## 次Phase

→ [Phase 7: カバレッジ確認](phase-7-coverage-check.md)

**Phase 6→7 の遷移条件**: T-VL-01〜07 + T-REG-01 が全て PASS していること
