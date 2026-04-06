# Phase 2: 設計ノート

## メタ情報

| 項目       | 値         |
| ---------- | ---------- |
| 作成日     | 2026-04-06 |
| ステータス | COMPLETED  |

## Task 2-1: 通知追加箇所の設計（確定）

`verifyAndImproveLoop()` L444 の変更方針:

```typescript
// Before（現状）
this.notificationService?.notify("スキル作成失敗", errorMessage);

// After（設計）
try {
  this.notificationService?.notify("スキル作成失敗", errorMessage);
} catch {
  // 通知の失敗はループ結果に影響しない
}
```

変更行数: 約4行追加（try/catch ラッパー）

## Task 2-2: recordImproveFailureSnapshot() 設計確認

既存実装で正しい設計を確認:

- `currentPhase: "improve"` 維持 → 正しい
- `verifyResult.nextAction: "improve"` → 正しい
- **変更不要**

## Task 2-3: 変更ファイル一覧

| 種別   | ファイル                                                                                          | 変更内容                      |
| ------ | ------------------------------------------------------------------------------------------------- | ----------------------------- |
| 実装   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | L444 に try/catch 追加（4行） |
| テスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | T-VL-01〜07, T-REG-01 追加    |

新規作成ファイル: なし（既存ファイルの修正のみ）

## 完了確認

- [x] 通知追加箇所の実装方針確定
- [x] recordImproveFailureSnapshot() phase 保持方針確定
- [x] 変更ファイル 2 ファイルに絞られている
- [x] E-1〜E-5 全て対処設計済み
