# 統合テスト設計 - TASK-WCE-MONACO-001

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 4                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |
| 更新日 | 2026-02-03          |

## 統合テストシナリオ

### IPC接続テスト

| #   | シナリオ                            | 検証内容                |
| --- | ----------------------------------- | ----------------------- |
| 1   | chat-edit:get-selection疎通         | IPCチャンネルが応答する |
| 2   | 正常な選択範囲でTextSelectionが返る | 型安全なレスポンス      |
| 3   | 選択なし時にnullが返る              | 適切なnullレスポンス    |

### データフローテスト

| #   | シナリオ                              | 検証内容       |
| --- | ------------------------------------- | -------------- |
| 4   | Renderer→Preload→Main→戻り値の往復    | データ整合性   |
| 5   | TextSelection型の全フィールドが正しい | 型検証         |
| 6   | executeJavaScriptが正しく呼び出される | Renderer側連携 |

### エラーハンドリングテスト

| #   | シナリオ                          | 検証内容           |
| --- | --------------------------------- | ------------------ |
| 7   | エディタ未存在時のnull返却        | エラーなくnull返却 |
| 8   | BrowserWindow未取得時のnull返却   | エラーなくnull返却 |
| 9   | executeJavaScript失敗時のnull返却 | エラーハンドリング |

## 統合ポイント/契約

| 統合ポイント     | 契約定義                                                                         |
| ---------------- | -------------------------------------------------------------------------------- |
| Renderer→Preload | chatEditAPI.getEditorSelection(): Promise<TextSelection \| null>                 |
| Preload→Main     | ipcRenderer.invoke('chat-edit:get-selection')                                    |
| Main→Renderer    | webContents.executeJavaScript('window.\_\_editorSelection.getEditorSelection()') |

## テストデータ

### 正常系テストデータ

```typescript
// 単一行選択
const singleLineSelection: TextSelection = {
  startLine: 5,
  startColumn: 10,
  endLine: 5,
  endColumn: 25,
  selectedText: "const x = 42;",
};

// 複数行選択
const multiLineSelection: TextSelection = {
  startLine: 10,
  startColumn: 1,
  endLine: 15,
  endColumn: 30,
  selectedText: "function foo() {\n  return 'bar';\n}",
};

// 日本語選択
const japaneseSelection: TextSelection = {
  startLine: 1,
  startColumn: 1,
  endLine: 1,
  endColumn: 12,
  selectedText: "これは日本語です",
};
```

### 異常系テストデータ

```typescript
// 選択なし（null）
const noSelection = null;

// エディタ未初期化（null）
const noEditor = null;
```

## テスト環境要件

| 項目     | 要件                      |
| -------- | ------------------------- |
| Vitest   | モックサポート            |
| Electron | ipcMain/ipcRendererモック |
| Monaco   | エディタAPIモック         |

## カバレッジ目標

| テストカテゴリ     | 目標 |
| ------------------ | ---- |
| IPC接続テスト      | 100% |
| データフローテスト | 100% |
| エラーハンドリング | 80%+ |
| 境界値テスト       | 80%+ |
