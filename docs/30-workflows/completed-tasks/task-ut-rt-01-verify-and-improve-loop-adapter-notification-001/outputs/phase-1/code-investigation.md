# Phase 1: 現行コード調査メモ

## メタ情報

| 項目         | 値                                                                    |
| ------------ | --------------------------------------------------------------------- |
| 調査日       | 2026-04-06                                                            |
| 対象ファイル | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |

## Task 1-1: 現行コード調査結果

### verifyAndImproveLoop() のアーキテクチャ確認

`verifyAndImproveLoop()` は `RuntimeSkillCreatorFacade.ts` L350付近に実装されているループ関数で:

1. `verify()` 呼び出し → 検証結果取得
2. 全チェック PASS なら成功終了
3. ループ上限チェック
4. `improve()` 呼び出し → 改善提案取得

### 現状 L440-458: improve() エラーハンドリング

```typescript
// エラーレスポンスチェック（実際の実装）
if ("success" in improveResult && !improveResult.success) {
  const errorCode = improveResult.error.code;
  const errorMessage = improveResult.error.message;
  this.notificationService?.notify("スキル作成失敗", errorMessage);  // L444: try/catch なし
  const snapshot = this.recordImproveFailureSnapshot(
    planId,
    `improve が ${errorCode} で失敗しました: ${errorMessage}`,
  );
  return { ... errorCode ... };
}
```

### 問題点

- L444 の `notify()` 呼び出しは `try/catch` でラップされていない
- `_executeInternal()` の通知パターンは `try { notify() } catch {}` でラップされている
- エッジケース E-2: `notify()` が例外を投げた場合にループ結果に影響してしまう

### \_executeInternal() の通知パターン（参照基準）

L1162付近:

```typescript
try {
  this.notificationService?.notify("スキル作成失敗", errorMessage);
} catch {
  // 通知の失敗はループ結果に影響しない
}
```

### recordImproveFailureSnapshot() の動作確認

- `currentPhase: "improve"` を維持（`"review"` に戻さない）
- `verifyResult.status: "fail"` を設定
- `verifyResult.nextAction: "improve"` を設定

### errorCode フィールドの確認

- `RuntimeSkillCreatorVerifyAndImproveResult` に `errorCode?` フィールドあり
- L457付近: `return { ..., errorCode, ... }` で戻り値に設定済み

## Task 1-2: FR/AC 定義

仕様書 Phase 1 の通り確定（FR-1〜FR-5, AC-1〜AC-6）。

## Task 1-3: エッジケース対処方針

| ケース                              | 現状                                      | 必要な対応           |
| ----------------------------------- | ----------------------------------------- | -------------------- |
| E-1 `notificationService` undefined | `?.` で安全                               | 変更不要             |
| E-2 `notify()` が例外               | try/catch なし → **問題**                 | try/catch 追加が必要 |
| E-3 `terminal_handoff`              | 別分岐で処理                              | 変更不要             |
| E-4 `suggestions: []`               | 別分岐で処理                              | 変更不要             |
| E-5 `errorCode undefined`           | `code` が undefined なら propagate しない | 既存ロジック確認OK   |

## Phase 2 開始条件: 確認済み

- [x] FR-1〜FR-5 定義済み
- [x] AC-1〜AC-6 定義済み
- [x] E-1〜E-5 対処方針明記済み
- [x] Phase 2 開始条件が整っている
