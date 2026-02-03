# 手動テスト手順書 - TASK-WCE-MONACO-001

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 11                  |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |
| 更新日 | 2026-02-03          |

## テスト環境準備

### 前提条件

1. Node.js v18以上がインストールされていること
2. pnpmがインストールされていること
3. 依存関係がインストール済みであること

### 環境セットアップ

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm --filter @repo/desktop dev
```

## テストシナリオ

### MT-001: 基本的な選択範囲取得

**目的**: Monaco Editorでテキストを選択し、選択範囲が正しく取得されることを確認

**手順**:

1. アプリケーションを起動
2. エディタビューを開く
3. 任意のファイルを開く
4. マウスでテキストを選択（例：5行目から8行目までドラッグ）
5. Developer Toolsを開く（Cmd+Option+I / Ctrl+Shift+I）
6. Consoleで以下を実行:
   ```javascript
   window.chatEditAPI.getEditorSelection();
   ```

**期待結果**:

```javascript
{
  success: true,
  data: {
    startLine: 5,
    startColumn: 1,
    endLine: 8,
    endColumn: 20,
    selectedText: "選択されたテキスト内容"
  }
}
```

### MT-002: 選択なし時のnull返却

**目的**: テキストを選択していない状態でnullが返されることを確認

**手順**:

1. アプリケーションを起動
2. エディタビューを開く
3. 任意のファイルを開く
4. テキストを選択せず、カーソルのみの状態にする
5. Consoleで以下を実行:
   ```javascript
   window.chatEditAPI.getEditorSelection();
   ```

**期待結果**:

```javascript
{
  success: true,
  data: null
}
```

### MT-003: エディタ未初期化時のnull返却

**目的**: エディタが初期化される前にnullが返されることを確認

**手順**:

1. アプリケーションを起動
2. エディタビューを開かない状態で
3. Consoleで以下を実行:
   ```javascript
   window.chatEditAPI.getEditorSelection();
   ```

**期待結果**:

```javascript
{
  success: true,
  data: null
}
```

### MT-004: 日本語テキスト選択

**目的**: 日本語テキストが正しく取得されることを確認

**手順**:

1. アプリケーションを起動
2. エディタで日本語を含むファイルを開く
3. 日本語テキストを選択
4. Consoleで選択範囲を取得

**期待結果**:

- `selectedText`に日本語が正しく含まれる
- 文字化けがない

### MT-005: 複数行選択

**目的**: 複数行にわたる選択が正しく取得されることを確認

**手順**:

1. 10行以上のファイルを開く
2. 3行目から7行目までを選択
3. 選択範囲を取得

**期待結果**:

- `startLine` < `endLine`
- `selectedText`に改行が含まれる

## チェックリスト

| テストID | テスト名                 | 結果 | 備考 |
| -------- | ------------------------ | ---- | ---- |
| MT-001   | 基本的な選択範囲取得     | -    |      |
| MT-002   | 選択なし時のnull返却     | -    |      |
| MT-003   | エディタ未初期化時のnull | -    |      |
| MT-004   | 日本語テキスト選択       | -    |      |
| MT-005   | 複数行選択               | -    |      |

## 注意事項

1. **editorSelectionモジュールの読み込み**
   - `editorSelection.ts`はRenderer側で自動的にwindow.\_\_editorSelectionに公開される
   - Monaco EditorコンポーネントでsetActiveEditor()を呼び出す必要がある

2. **統合テスト**
   - 上記手動テストは、Monaco EditorコンポーネントでsetActiveEditor()が
     実装された後に実行可能

3. **デバッグ方法**
   - window.\_\_editorSelection.getActiveEditor() でエディタ参照を確認
   - window.\_\_editorSelection.getEditorSelection() で選択範囲を直接確認

## 結果記録

| 項目       | 値               |
| ---------- | ---------------- |
| テスト日   | （実施時に記入） |
| テスト者   | （実施時に記入） |
| テスト環境 | （実施時に記入） |
| 結果       | （実施時に記入） |
