# 実装サマリー

## 実装日時

2026-04-21

## 実装内容

`apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` にコメントを2箇所追加した。

### 変更1: pendingRequest合成式へのコメント追加

```typescript
// [優先ルール] restoredPendingRequest は undo 操作時のみ非 null になる。
// undo でユーザーが前の質問に戻ったとき、workflowSnapshot がまだ更新前の状態でも
// 前の質問を即時表示できるよう restoredPendingRequest を優先して使用する。
//
// 通常フロー（undo なし）では restoredPendingRequest は null のため、
// workflowSnapshot?.awaitingUserInput が使用される。
//
// サーバーから新しい awaitingUserInput が届いた時点（requestId が変化）で
// restoredPendingRequest はクリアされ、通常フローに戻る（下の useEffect 参照）。
const pendingRequest =
  restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;
```

### 変更2: restoredPendingRequestクリアuseEffectへのコメント追加

```typescript
// undo 後、サーバーから新しい awaitingUserInput が届いたら restoredPendingRequest をクリアして通常フローに戻す。
// requestId のみを依存配列に含めることで、同一リクエストの参照更新による不要な再実行を防ぐ。
useEffect(() => {
  if (workflowSnapshot?.awaitingUserInput) {
    setRestoredPendingRequest(null);
  }
}, [workflowSnapshot?.awaitingUserInput?.requestId]);
```

## 受け入れ基準確認

| AC                                                | 達成状況            |
| ------------------------------------------------- | ------------------- |
| AC-1: pendingRequest合成式の直上にコメント追加    | ✅ PASS             |
| AC-2: restoredPendingRequestクリアロジックの存在  | ✅ PASS（実装済み） |
| AC-3: コードの可読性（切り替わり条件の理解）      | ✅ PASS             |
| AC-4: pnpm typecheck エラーなし                   | ✅ PASS             |
| AC-5: pnpm lint エラーなし（exhaustive-deps含む） | ✅ PASS             |
