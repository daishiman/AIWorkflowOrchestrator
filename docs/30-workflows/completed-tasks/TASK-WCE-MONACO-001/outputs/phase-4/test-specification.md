# テスト仕様書 - TASK-WCE-MONACO-001

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 4                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |
| 更新日 | 2026-02-03          |

## テスト対象

| 対象ファイル                                         | テストファイル                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/editorSelection.ts` | `apps/desktop/src/renderer/utils/editorSelection.test.ts`      |
| `apps/desktop/src/main/ipc/chatEditHandlers.ts`      | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.test.ts` |

## テスト設計

### editorSelection.ts テスト

#### テストスイート構成

```typescript
describe('editorSelection', () => {
  describe('setActiveEditor', () => { ... });
  describe('getActiveEditor', () => { ... });
  describe('getEditorSelection', () => { ... });
});
```

#### テストケース

| #   | テストケース                                  | 期待結果                   |
| --- | --------------------------------------------- | -------------------------- |
| 1   | setActiveEditorでエディタを設定できる         | activeEditorが更新される   |
| 2   | setActiveEditor(null)でエディタをクリアできる | activeEditorがnullになる   |
| 3   | getActiveEditorで設定したエディタを取得できる | 設定したエディタが返る     |
| 4   | エディタ未設定時にgetActiveEditorはnullを返す | nullが返る                 |
| 5   | 選択範囲がある時にTextSelectionが返る         | 正しいTextSelectionが返る  |
| 6   | 選択がない時（カーソルのみ）にnullが返る      | nullが返る                 |
| 7   | エディタがnullの時にnullが返る                | nullが返る                 |
| 8   | モデルがnullの時にnullが返る                  | nullが返る                 |
| 9   | 複数行選択時にstartLine < endLineになる       | 正しい行番号が設定される   |
| 10  | 単一行内選択時にstartColumn < endColumnになる | 正しい列番号が設定される   |
| 11  | selectedTextが選択範囲の文字列と一致する      | 正しいテキストが設定される |

### chatEditHandlers.ts テスト

#### テストスイート構成

```typescript
describe('chatEditHandlers', () => {
  describe('handleGetSelection', () => { ... });
  describe('registerChatEditHandlers', () => { ... });
});
```

#### テストケース

| #   | テストケース                            | 期待結果                               |
| --- | --------------------------------------- | -------------------------------------- |
| 1   | 選択範囲がある場合にTextSelectionを返す | { success: true, data: TextSelection } |
| 2   | 選択がない場合にnullを返す              | { success: true, data: null }          |
| 3   | BrowserWindowがない場合にnullを返す     | { success: true, data: null }          |
| 4   | executeJavaScriptがエラー時にnullを返す | { success: true, data: null }          |
| 5   | validateIpcSenderで検証される           | 検証失敗時にエラー                     |
| 6   | IPCハンドラーが正しく登録される         | ハンドラーが呼び出し可能               |

## 境界値テスト

| #   | テストケース     | 入力                 | 期待結果            |
| --- | ---------------- | -------------------- | ------------------- |
| 1   | 1文字選択        | startCol=1, endCol=2 | 1文字のselectedText |
| 2   | 空選択（isEmpty) | カーソルのみ         | null                |
| 3   | 1行目選択        | startLine=1          | 正しい選択範囲      |
| 4   | 日本語テキスト   | マルチバイト文字     | 正しいselectedText  |

## カバレッジ目標

| 指標              | 目標 |
| ----------------- | ---- |
| Line Coverage     | 80%+ |
| Branch Coverage   | 60%+ |
| Function Coverage | 80%+ |
