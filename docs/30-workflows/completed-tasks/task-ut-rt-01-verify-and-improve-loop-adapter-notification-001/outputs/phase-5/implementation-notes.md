# Phase 5: 実装ノート

## メタ情報

| 項目         | 値                                                                    |
| ------------ | --------------------------------------------------------------------- |
| 実装日       | 2026-04-06                                                            |
| 対象ファイル | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| 変更行数     | +4行（try/catch ラッパー追加）                                        |

## 変更内容

`verifyAndImproveLoop()` 内の `improve()` エラーハンドリングブロック（L440〜L458）に `try/catch` ラッパーを追加。

### Before

```typescript
const errorCode = improveResult.error.code;
const errorMessage = improveResult.error.message;
this.notificationService?.notify("スキル作成失敗", errorMessage);
const snapshot = this.recordImproveFailureSnapshot(...)
```

### After

```typescript
const errorCode = improveResult.error.code;
const errorMessage = improveResult.error.message;
// TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001
// runtime guard と統一した通知呼び出し（E-2: 通知失敗がループ結果に影響しない）
try {
  this.notificationService?.notify("スキル作成失敗", errorMessage);
} catch {
  // 通知の失敗はループ結果に影響しない
}
const snapshot = this.recordImproveFailureSnapshot(...)
```

## テスト結果

- T-VL-01: PASS（notify が呼ばれる）
- T-VL-02: PASS（errorCode が伝播する）
- T-VL-03: PASS（notificationService undefined でも正常終了）
- T-VL-04: PASS（notify 例外がループ結果に影響しない）← 実装前は FAIL
- T-VL-05: PASS（success 時は notify が呼ばれない）

## typecheck

`pnpm --filter @repo/desktop typecheck` → エラーなし
