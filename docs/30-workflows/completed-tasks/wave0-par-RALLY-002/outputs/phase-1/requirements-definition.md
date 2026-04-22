# 要件定義書

## タスク概要

**タスクID**: TASK-RALLY-002  
**機能名**: restoredPendingRequest合成ルール明確化  
**対象ファイル**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

## 問題の特定

### 問題1: pendingRequest合成式にコメントなし

```typescript
// ← コメントなし
const pendingRequest =
  restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;
```

`restoredPendingRequest` を `??` で優先している理由が不明確。コードを読んだ開発者が「なぜ restoredPendingRequest が優先されるのか」「いつ null になるのか」を理解できない。

### 問題2: クリアuseEffectにコメントなし

```typescript
useEffect(() => {
  if (workflowSnapshot?.awaitingUserInput) {
    setRestoredPendingRequest(null);
  }
}, [workflowSnapshot?.awaitingUserInput?.requestId]);
```

このuseEffectの存在意義・依存配列の選択理由（なぜ `?.requestId` か）が説明されていない。

## 変更方針

**最小変更原則**: ロジック変更は不要。コメント追加のみで受け入れ基準を達成できる。

### 変更内容

1. `pendingRequest` 合成式の直上にコメントを追加する（AC-1達成）
2. `restoredPendingRequest` クリアuseEffectにコメントを追加する（AC-3達成）

### 変更対象

| ファイル                                                                 | 変更種別              |
| ------------------------------------------------------------------------ | --------------------- |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | コメント追加（2箇所） |

## 背景: restoredPendingRequest の設計意図

`restoredPendingRequest` は undo操作によってセットされる state。ユーザーが回答を取り消した際に「前の質問」を即時表示するために使われる。サーバーから新しい `workflowSnapshot` が届くまでの間、この state が `pendingRequest` の源泉になる。

サーバー側が新しい `awaitingUserInput` を送ってきた時点で `restoredPendingRequest` は役目を終え、null にクリアされる。この切替タイミングを実装しているのが L55-59 の useEffect。
