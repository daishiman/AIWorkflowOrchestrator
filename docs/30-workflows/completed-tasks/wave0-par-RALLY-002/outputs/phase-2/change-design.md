# 変更設計書

## 変更概要

**対象ファイル**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`  
**変更種別**: コメント追加（2箇所）  
**ロジック変更**: なし

## 変更1: pendingRequest合成式へのコメント追加

### 追加箇所

L44 の `const pendingRequest = ...` の直上

### 追加内容

```typescript
// [優先ルール] restoredPendingRequest は undo操作時のみ非 null になる。
// undo でユーザーが前の質問に戻ったとき、workflowSnapshot がまだ更新前の状態でも
// 前の質問を即時表示できるよう restoedPendingRequest を優先して使用する。
//
// 通常フロー（undo なし）では restoredPendingRequest は null のため、
// workflowSnapshot?.awaitingUserInput が使用される。
//
// サーバーから新しい awaitingUserInput が届いた時点（requestId が変化）で
// restoredPendingRequest はクリアされ、通常フローに戻る（下の useEffect 参照）。
const pendingRequest =
  restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;
```

### 設計根拠

- `restoredPendingRequest` は `handleUndo()` でのみセットされる
- undo後は「前の質問」を見せながらユーザーが再回答できる状態を保つ必要がある
- `workflowSnapshot.awaitingUserInput` が更新される（サーバーから新質問が届く）まで、undo状態を維持する

## 変更2: restoredPendingRequestクリアuseEffectへのコメント追加

### 追加箇所

L55 の `useEffect(() => {` の直上

### 追加内容

```typescript
// undo後、サーバーから新しい awaitingUserInput が届いたら restoredPendingRequest をクリアして通常フローに戻す。
// requestId のみを依存配列に含めることで、同一リクエストの参照更新による不要な再実行を防ぐ。
useEffect(() => {
  if (workflowSnapshot?.awaitingUserInput) {
    setRestoredPendingRequest(null);
  }
}, [workflowSnapshot?.awaitingUserInput?.requestId]);
```

### 設計根拠

- 依存配列に `workflowSnapshot?.awaitingUserInput` 全体を入れると、オブジェクト参照が変わるたびに再実行される
- `requestId` のみを依存配列に含めることで「新しい質問が届いた」場合のみ実行される
- `restoredPendingRequest` を依存配列に含めると「クリア→再チェック→クリア」の循環ループになるため除外

## 依存配列の設計詳細

```typescript
// ❌ 循環ループ発生
useEffect(() => {
  if (workflowSnapshot?.awaitingUserInput && restoredPendingRequest) {
    setRestoredPendingRequest(null);
  }
}, [workflowSnapshot?.awaitingUserInput?.requestId, restoredPendingRequest]); // restoredPendingRequest を含めると無限ループ

// ✅ 正しい設計（requestIdのみ）
useEffect(() => {
  if (workflowSnapshot?.awaitingUserInput) {
    setRestoredPendingRequest(null);
  }
}, [workflowSnapshot?.awaitingUserInput?.requestId]);
```

## lint互換性

`react-hooks/exhaustive-deps` は `workflowSnapshot?.awaitingUserInput?.requestId` のような深いアクセスに対して通常警告を出さない。`restoredPendingRequest` を依存配列から省いても、意図的な設計であることをコメントで補足済み。
