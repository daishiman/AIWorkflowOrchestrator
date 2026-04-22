# テスト仕様書

## テスト対象

`ConversationalInterview.tsx` の `pendingRequest` 合成ロジック（L44-45）と restoredPendingRequest クリアuseEffect（L55-59）

## テストファイル

`apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx`

追加する describe ブロック: `pendingRequest合成ロジック`

## シナリオ一覧

| ID  | シナリオ                                         | テスト手法                              | 期待結果                                                                      | 優先度 |
| --- | ------------------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------- | ------ |
| S-1 | 通常フロー（restoredPendingRequest が null）     | render with snapshot                    | workflowSnapshot.awaitingUserInput の質問テキストが表示される                 | 必須   |
| S-2 | undo後（restoredPendingRequest が非 null）       | render + submit + undo                  | 前の質問（prevReq）のテキストが表示される                                     | 必須   |
| S-3 | snapshot更新後（新requestIdのawaitingUserInput） | render + submit + undo + rerender       | restoredPendingRequestがクリアされ、新しいawaitingUserInputの質問が表示される | 必須   |
| S-4 | awaitingUserInput が null の場合                 | render + submit + undo + rerender(null) | restoredPendingRequestはクリアされず、前の質問が引き続き表示される            | 必須   |

## テスト設計の詳細

### restoredPendingRequest のテスト方法

内部 state のため直接検証不可。以下のUIフローで間接的に検証する:

1. **undo実行**: 送信 → 戻るボタンクリック → `handleUndo()` → `setRestoredPendingRequest(prevReq)`
2. **表示確認**: `pendingRequest` が `prevReq` になる → `prevReq.prompt` が画面に表示される
3. **クリア確認**: `rerender` で新 snapshot（新 requestId）を渡す → `pendingRequest` が `newAwaitingUserInput` に切り替わる

### テストフロー（S-2〜S-4共通）

```
render(req1のsnapshot)
→ 回答選択・送信（req1の答えをsubmit）
→ rerender(req2のsnapshot)  ← サーバーから次の質問が届いた
→ undoクリック  ← setRestoredPendingRequest(req1)
→ req1の質問テキストが表示されていることを確認（S-2）
→ rerender(req3のsnapshot)  ← 新requestIdのsnapshotが届いた
→ req3の質問テキストが表示されていることを確認（S-3）
```

## テストコード骨格

```typescript
describe('pendingRequest合成ロジック', () => {
  it('S-1: 通常フロー: workflowSnapshot.awaitingUserInputを使用する', () => { ... });
  it('S-2: undo後: restoredPendingRequestを優先する', async () => { ... });
  it('S-3: snapshot更新後: restoredPendingRequestがクリアされpendingRequestが切り替わる', async () => { ... });
  it('S-4: awaitingUserInputがnullの場合: restoredPendingRequestはクリアされない', async () => { ... });
});
```
