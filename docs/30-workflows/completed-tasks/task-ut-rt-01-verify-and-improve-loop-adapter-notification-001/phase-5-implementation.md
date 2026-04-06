# Phase 5: 実装

## メタ情報

| 項目   | 値                                                             |
| ------ | -------------------------------------------------------------- |
| Phase  | 5                                                              |
| 機能名 | task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 |
| 作成日 | 2026-04-06                                                     |

## 目的

Phase 2 の設計に従い、`verifyAndImproveLoop()` 内での `improve()` adapter エラー時の通知呼び出しを実装する。最小変更（約5行の追加）で通知統一を実現する。

## 実行タスク

- Task 5-1: 実装（`RuntimeSkillCreatorFacade.ts` の修正）
- Task 5-2: 型チェック・コンパイル確認
- Task 5-3: T-VL-01〜05 のテストがPASSすることを確認

## 参照資料

| 資料名           | パス                                                                  | 説明                     |
| ---------------- | --------------------------------------------------------------------- | ------------------------ |
| Phase 2 設計     | [phase-2-design.md](phase-2-design.md)                                | 実装方針の参照元         |
| Phase 4 テスト   | [phase-4-test-creation.md](phase-4-test-creation.md)                  | テストマトリクスの参照元 |
| 対象実装ファイル | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 修正対象                 |

## 実行手順

### Step 1: Task 5-1 実装

**修正ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**修正場所**: `verifyAndImproveLoop()` 内の `improve()` エラーハンドリングブロック（L434〜L450付近）

**変更内容**（約5行の追加）:

```typescript
if ("success" in improveResult && !improveResult.success) {
  const errorCode = improveResult.error.code;
  const errorMessage = improveResult.error.message;

  // TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001
  // runtime guard と統一した通知呼び出し
  try {
    this.notificationService?.notify("スキル作成失敗", errorMessage);
  } catch {
    // 通知の失敗はループ結果に影響しない
  }

  const snapshot = this.recordImproveFailureSnapshot(
    planId,
    `improve が ${errorCode} で失敗しました: ${errorMessage}`,
  );
  return {
    finalStatus: "error",
    totalAttempts: attemptCount,
    finalChecks: checks,
    loopExhausted: false,
    errorCode,
    errorMessage,
    workflowSnapshot: snapshot,
  };
}
```

### Step 2: Task 5-2 型チェック・コンパイル確認

```bash
pnpm --filter @repo/desktop typecheck
```

**期待結果**: エラーなし

### Step 3: Task 5-3 テストPASS確認

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

**期待結果**: T-VL-01〜05 が全て PASS

## 統合テスト連携【必須】

| 連携アクション                | 内容                                                                 |
| ----------------------------- | -------------------------------------------------------------------- |
| フロント/バック接続テスト支援 | `INotificationService.notify()` の呼び出しが実装されていることを確認 |

## 成果物

| 成果物                                | 配置先                                                                |
| ------------------------------------- | --------------------------------------------------------------------- |
| 実装済み RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| 実装確認メモ                          | `outputs/phase-5/implementation-notes.md`                             |

## 完了条件

- [ ] `verifyAndImproveLoop()` 内に `notify()` 呼び出しが追加されている
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] T-VL-01〜05 が全て PASS する

## タスク100%実行確認【必須】

Phase 5 完了時に以下を確認すること:

- [ ] Task 5-1（実装）を完全に実行した
- [ ] Task 5-2（型チェック）を完全に実行した
- [ ] Task 5-3（テストPASS確認）を完全に実行した

## 次Phase

→ [Phase 6: テスト拡充](phase-6-test-expansion.md)

**Phase 5→6 の遷移条件**: T-VL-01〜05 が全て PASS していること
