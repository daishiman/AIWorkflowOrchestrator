# Diff Check Result — Phase 5

## 評価観点ごとの判定

| 評価観点                                             | 判定         | 根拠                                                                                                          |
| ---------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| 表示中の復元質問と submission.requestId が一致するか | **変更必要** | undo 復元中は `pendingRequest` が Q1 を指す一方、送信は `workflowSnapshot.awaitingUserInput` 側 Q2 を使い得た |
| 再送信成功直後に stale な live 質問へ戻らないか      | **変更必要** | `setRestoredPendingRequest(null)` が早すぎ、親 snapshot 未更新時に Q2 へフォールバックする窓があった          |
| 送信 payload を検証する回帰テストがあるか            | **変更必要** | 既存テストは DOM 切替のみで、最重要の requestId 整合を固定できていなかった                                    |

## 実施内容

対象ファイル: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

### 修正 1: submission 生成元を pendingRequest に合わせる

```typescript
const submission = interview.buildSubmission(
  {
    ...workflowSnapshot,
    awaitingUserInput: pendingRequest,
  },
  answer,
);
```

### 修正 2: 送信成功直後の premature clear を削除

```typescript
try {
  await onSubmit(submission);
  resetInputValues();
} finally {
  setIsSubmitting(false);
}
```

## 変更要否判定

- **判定**: 変更必要（実ロジック修正 + 回帰テスト追加）
- **根拠**: レビューで requestId 不整合と stale fallback の実害が確認されたため
- **スコープ管理**: renderer 内部 state 合成とテストに限定し、外部 IF は不変
