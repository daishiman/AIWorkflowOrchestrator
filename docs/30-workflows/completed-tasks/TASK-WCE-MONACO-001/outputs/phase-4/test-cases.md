# テストケース一覧 - TASK-WCE-MONACO-001

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 4                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |
| 更新日 | 2026-02-03          |

## 作成したテストファイル

| ファイル                                                                 | 説明                           |
| ------------------------------------------------------------------------ | ------------------------------ |
| `apps/desktop/src/renderer/utils/__tests__/editorSelection.test.ts`      | Renderer側ユーティリティテスト |
| `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.selection.test.ts` | handleGetSelection詳細テスト   |

## editorSelection.test.ts テストケース

### setActiveEditor

| #   | テストケース                 | 状態 |
| --- | ---------------------------- | ---- |
| 1   | エディタを設定できる         | Red  |
| 2   | nullでエディタをクリアできる | Red  |

### getActiveEditor

| #   | テストケース                 | 状態 |
| --- | ---------------------------- | ---- |
| 3   | 設定したエディタを取得できる | Red  |
| 4   | エディタ未設定時はnullを返す | Red  |

### getEditorSelection

| #   | テストケース                             | 状態 |
| --- | ---------------------------------------- | ---- |
| 5   | 選択範囲がある時にTextSelectionを返す    | Red  |
| 6   | 選択がない時（カーソルのみ）にnullを返す | Red  |
| 7   | エディタがnullの時にnullを返す           | Red  |
| 8   | getSelection()がnullの時にnullを返す     | Red  |
| 9   | getModel()がnullの時にnullを返す         | Red  |
| 10  | 複数行選択時にstartLine < endLineになる  | Red  |
| 11  | 単一行内選択時に正しいカラム番号を返す   | Red  |
| 12  | selectedTextが選択範囲の文字列と一致する | Red  |
| 13  | 日本語テキストを正しく取得できる         | Red  |
| 14  | 1文字のみの選択を正しく取得できる        | Red  |

## chatEditHandlers.selection.test.ts テストケース

### 選択範囲取得

| #   | テストケース                                         | 状態 |
| --- | ---------------------------------------------------- | ---- |
| 1   | 選択範囲がある場合にTextSelectionを返す              | Red  |
| 2   | 選択がない場合にnullを返す                           | Red  |
| 3   | BrowserWindowがない場合にnullを返す                  | Red  |
| 4   | executeJavaScriptがエラー時にnullを返す              | Red  |
| 5   | window.\_\_editorSelectionを呼び出すスクリプトを実行 | Red  |
| 6   | validateIpcSenderで検証が行われる                    | Red  |
| 7   | 検証失敗時にエラーをスローする                       | Red  |

### 複数行選択

| #   | テストケース                              | 状態 |
| --- | ----------------------------------------- | ---- |
| 8   | startLine < endLineの選択範囲を正しく返す | Red  |

### 単一行選択

| #   | テストケース                                | 状態 |
| --- | ------------------------------------------- | ---- |
| 9   | 同一行でstartColumn < endColumnを正しく返す | Red  |

### 境界値テスト

| #   | テストケース                     | 状態 |
| --- | -------------------------------- | ---- |
| 10  | 1文字のみの選択を正しく返す      | Red  |
| 11  | 日本語テキストの選択を正しく返す | Red  |
| 12  | 1行目からの選択を正しく返す      | Red  |

## 既存テストファイル（参考）

| ファイル                            | 説明                  |
| ----------------------------------- | --------------------- |
| `chatEditHandlers.test.ts`          | 基本的なIPC登録テスト |
| `chatEditHandlers.security.test.ts` | セキュリティテスト    |

## テスト実行方法

```bash
# 全テスト実行
pnpm test

# 関連テストのみ実行
pnpm test -- --filter=@repo/desktop -- editorSelection
pnpm test -- --filter=@repo/desktop -- chatEditHandlers.selection
```

## TDD Red状態確認

すべてのテストは現時点で失敗状態（Red）です。Phase 5で実装を行い、Green状態にします。
