# テスト戦略

## 方針

コメント追加は動作変更を伴わないため追加テスト不要。  
既存の useEffect クリアロジック（L55-59）に対するシナリオテストを新規追加する。

## テスト対象

`apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx` に `pendingRequest合成ロジック` の describe ブロックを追加する。

## テストシナリオ一覧

| シナリオID | シナリオ                                                  | テスト手法            | 優先度 |
| ---------- | --------------------------------------------------------- | --------------------- | ------ |
| S-1        | 通常フロー: workflowSnapshot.awaitingUserInput が使われる | RTL render + query    | 必須   |
| S-2        | undo後: restoredPendingRequest が優先される               | RTL render + undo操作 | 必須   |
| S-3        | snapshot更新後: restoredPendingRequest がクリアされる     | RTL render + rerender | 必須   |
| S-4        | awaitingUserInput が null の場合: クリアされない          | RTL render + rerender | 必須   |

## テストフレームワーク

- **Vitest** + **React Testing Library**
- `@testing-library/react` の `render`, `rerender`, `screen`, `fireEvent`, `waitFor`

## restoredPendingRequest のテスト方法

`restoredPendingRequest` は内部 state のため、直接テストできない。  
代わりに**UIの表示変化**でテストする:

- `restoredPendingRequest` がセットされる → `handleUndo()` をトリガー（戻るボタンクリック）
- `pendingRequest` が `restoredPendingRequest` になる → 表示されている質問テキストを確認
- クリアされる → `rerender` で新しい snapshot を渡し、表示が変わることを確認

## テストファイル

**追加先**: `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx`

```
describe('pendingRequest合成ロジック', () => {
  it('通常フロー: workflowSnapshot.awaitingUserInputを使用する');
  it('undo後: restoredPendingRequestを優先する');
  it('snapshot更新後: restoredPendingRequestがクリアされpendingRequestが切り替わる');
  it('awaitingUserInputがnullの場合: restoredPendingRequestはクリアされない');
});
```
