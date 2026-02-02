# Chat Edit Monaco Editor統合 - タスク指示書

## メタ情報

```yaml
issue_number: 659
```

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | UT-WCE-MONACO-001                       |
| タスク名     | Chat Edit Monaco Editor統合             |
| 分類         | 改善                                    |
| 対象機能     | workspace-chat-edit / Monaco Editor連携 |
| 優先度       | 中                                      |
| 見積もり規模 | 中規模                                  |
| ステータス   | 未実施                                  |
| 発見元       | Phase 12（コードベースTODOスキャン）    |
| 発見日       | 2026-02-02                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

workspace-chat-edit機能において、Monaco Editorとの連携が未実装のままになっている。具体的には以下のTODOが存在:

- `chatEditHandlers.ts:302` - `// TODO: Monaco Editorとの連携を実装`

現在の`handleGetSelection`は常に`null`を返す仮実装であり、エディタの選択範囲を取得する機能が動作しない。

### 1.2 問題点・課題

1. **選択範囲取得不可**: ユーザーがエディタで選択したテキスト範囲を取得できない
2. **コンテキスト指定不可**: 特定のコード範囲に対してLLMに指示を出す機能が使えない
3. **UX制限**: 「選択範囲をリファクタリング」「選択範囲にコメント追加」等のユースケースが実現できない

### 1.3 放置した場合の影響

- ユーザーが特定のコード範囲を指定してLLMに質問・指示することができない
- ファイル全体でなく部分的なコード修正を依頼するユースケースが実現できない
- 競合する他ツール（Cursor、Copilot等）と比較して機能が劣る

---

## 2. 何を達成するか（What）

### 2.1 目的

Monaco Editorの選択範囲情報をMain Processで取得可能にし、chat-edit機能でコンテキスト付きLLM連携を実現する。

### 2.2 最終ゴール

- `chat-edit:get-selection` IPCコマンドがエディタの選択範囲を正しく返す
- 選択範囲情報（startLine, endLine, startColumn, endColumn, selectedText）が取得可能
- 選択範囲をコンテキストとしてLLMに送信可能
- 関連テストが全てパス

### 2.3 スコープ

#### 含むもの

- Renderer Process側でのMonaco Editor選択範囲取得ロジック
- IPC経由での選択範囲情報送信メカニズム
- `handleGetSelection`の実装完成
- TextSelection型を使用した構造化データ返却
- ユニットテスト・統合テスト追加

#### 含まないもの

- Monaco Editor自体の実装・設定変更
- マルチカーソル対応（単一選択範囲のみ）
- 選択範囲のハイライト表示機能
- エディタへの書き戻し機能（別タスク）

### 2.4 成果物

| 成果物                    | 説明                                         |
| ------------------------- | -------------------------------------------- |
| chatEditHandlers.ts修正   | handleGetSelection実装完成                   |
| preload/chat-edit API修正 | getEditorSelection実装                       |
| Monaco Editor連携コード   | エディタから選択範囲を取得するユーティリティ |
| ユニットテスト            | 選択範囲取得のテストコード                   |
| 統合テスト                | IPC経由での選択範囲取得テスト                |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- workspace-chat-edit-main-process実装が完了していること
- Monaco Editorがアプリケーションに統合されていること
- Electron IPC contextBridgeが適切に設定されていること

### 3.2 依存タスク

| タスク                           | ステータス | 関係         |
| -------------------------------- | ---------- | ------------ |
| workspace-chat-edit-main-process | ✅ 完了    | 基盤実装     |
| Monaco Editor統合                | 要確認     | エディタ基盤 |

### 3.3 必要な知識

- Monaco Editor API（`editor.getSelection()`, `editor.getModel()`)
- Electron IPC通信パターン（contextBridge, ipcRenderer, ipcMain）
- TypeScript型定義（TextSelection型）
- Vitest テスティング

### 3.4 推奨アプローチ

1. Monaco EditorインスタンスへのアクセスパターンをRenderer側で確認
2. Renderer側で`getEditorSelection()`を実装し、Monaco APIから選択範囲を取得
3. contextBridge経由でPreload APIとして公開
4. Main Processの`handleGetSelection`からRenderer側の情報を取得するメカニズムを実装
5. ユニットテスト・統合テストを追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 概要                             |
| ----- | ---------------- | -------------------------------- |
| 1     | 調査             | Monaco Editor統合状況・APIの確認 |
| 2     | 設計             | IPC通信パターン設計              |
| 4     | テスト作成       | ユニット・統合テスト作成         |
| 5     | 実装             | コード修正                       |
| 6-9   | テスト・品質     | カバレッジ確認                   |
| 12    | ドキュメント更新 | TODOコメント削除・仕様書更新     |

### Phase 1: 調査

#### 目的

Monaco Editorの現在の統合状況を確認し、選択範囲取得のAPIを特定する。

#### 手順

1. アプリケーション内でMonaco Editorが使用されている箇所を特定
2. Monaco Editorインスタンスの取得方法を確認
3. `monaco.editor.IStandaloneCodeEditor`インターフェースの`getSelection()`を確認
4. 選択範囲→TextSelection型への変換ロジックを設計

#### 成果物

- 調査結果ドキュメント（Monaco統合パターン、API使用方法）

#### 完了条件

- 選択範囲取得の実装方針が決定している

### Phase 2: 設計

#### 目的

IPC通信を通じて選択範囲を取得するアーキテクチャを設計する。

#### 手順

1. Renderer → Main Process通信パターンを決定
   - オプションA: Main ProcessがRenderer側の状態をポーリング（非推奨）
   - オプションB: Renderer側で選択範囲を保持し、IPC経由で送信（推奨）
2. contextBridge APIの設計
3. 型定義の確認（TextSelection型の再利用）

#### 成果物

- 設計ドキュメント（シーケンス図、API定義）

#### 完了条件

- IPC通信パターンが決定している
- API設計が完了している

### Phase 5: 実装

#### 目的

設計に基づいてコードを実装する。

#### 手順

1. Renderer側で選択範囲取得ユーティリティを実装

```typescript
// 例: apps/desktop/src/renderer/utils/editorSelection.ts
export const getEditorSelection = (): TextSelection | null => {
  const editor = getActiveEditor(); // Monaco Editorインスタンス取得
  if (!editor) return null;

  const selection = editor.getSelection();
  if (!selection) return null;

  return {
    startLine: selection.startLineNumber,
    endLine: selection.endLineNumber,
    startColumn: selection.startColumn,
    endColumn: selection.endColumn,
    selectedText: editor.getModel()?.getValueInRange(selection) || "",
  };
};
```

2. contextBridge経由でPreload APIに追加
3. `chatEditHandlers.ts`の`handleGetSelection`を修正
4. TypeScript型チェック・テスト実行

#### 成果物

- 修正済みソースコード
- ユニットテスト・統合テスト

#### 完了条件

- TODOコメント1箇所が削除されている
- `pnpm typecheck`がエラー0
- `pnpm test`が全てパス

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `chat-edit:get-selection`がエディタの選択範囲を正しく返している
- [ ] 選択範囲がない場合は`null`を返す
- [ ] TextSelection型の全フィールド（startLine, endLine, startColumn, endColumn, selectedText）が正しく設定されている
- [ ] 選択範囲をLLMへのコンテキストとして使用可能

### 品質要件

- [ ] テストカバレッジ Line 80%以上
- [ ] TypeScript strict mode エラー0件
- [ ] ESLint エラー0件
- [ ] `grep -rn "TODO.*Monaco Editor" apps/desktop/src/` の結果が0件

### ドキュメント要件

- [ ] api-endpoints.md更新
- [ ] aiworkflow-requirements/LOGS.md更新

---

## 6. 検証方法

### テストケース

| #   | テストケース                     | 期待結果                                 |
| --- | -------------------------------- | ---------------------------------------- |
| 1   | テキストが選択されている場合     | TextSelectionオブジェクトが返される      |
| 2   | テキストが選択されていない場合   | nullが返される                           |
| 3   | 複数行選択の場合                 | startLine < endLineのTextSelectionが返る |
| 4   | 単一行内の部分選択の場合         | 同一行でstartColumn < endColumnが返る    |
| 5   | 選択範囲のテキスト内容が正しいか | selectedTextが選択範囲の文字列と一致     |
| 6   | エディタがアクティブでない場合   | nullが返される                           |

### 検証手順

1. `pnpm test -- --filter chat-edit` を実行し、全テストGREEN
2. `grep -rn "TODO.*Monaco Editor" apps/desktop/src/` で0件を確認
3. 手動テスト: エディタでテキストを選択→選択範囲取得APIを呼び出し→正しいデータが返ることを確認

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                           |
| ----------------------------------------- | ------ | -------- | ---------------------------------------------- |
| Monaco Editorインスタンスへのアクセス困難 | 高     | 中       | グローバル参照またはコンテキスト経由でアクセス |
| 複数エディタ対応の複雑化                  | 中     | 低       | アクティブエディタのみを対象とし、複雑化を回避 |
| IPC通信のレイテンシ                       | 低     | 低       | 同期的なAPIは避け、非同期で実装                |
| エディタ破棄時の参照エラー                | 中     | 中       | nullチェックを徹底、エラーハンドリングを実装   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント        | 用途                         |
| ------------------- | ---------------------------- |
| api-endpoints.md    | IPC APIエンドポイント仕様    |
| interfaces-core.md  | TextSelection型定義          |
| ui-ux-components.md | エディタUIコンポーネント仕様 |

### 参考資料

| ファイルパス                                         | 該当行 | 内容                                                                                              |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts` | L302   | TODO: Monaco Editor連携                                                                           |
| Monaco Editor公式ドキュメント                        | -      | https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneCodeEditor.html |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
// TODO: Monaco Editorとの連携を実装
// この実装はレンダラープロセスからの情報が必要（chatEditHandlers.ts:302-304）
```

### 補足事項

- Monaco Editorの選択範囲取得は、Electron Main Process単体では実現できない。Renderer Processとの協調が必須
- 実装パターンとしては、Renderer側でEditor状態を保持し、IPCリクエスト時に最新の選択範囲を返す方式を推奨
- マルチカーソル対応は本タスクのスコープ外とし、単一選択範囲のみを対象とする
- 将来的にはVim/Emacsモードでの選択範囲取得も考慮が必要だが、本タスクでは標準モードのみを対象

### 技術的注意点

1. **Renderer → Main通信**: 選択範囲はRenderer側で保持されるため、Main側からの直接アクセスは不可能
2. **contextBridge制約**: Serializableなデータのみを渡せるため、Monaco Editorのオブジェクト参照は直接渡せない
3. **タイミング**: IPC呼び出し時点の選択範囲を取得するため、取得とLLM送信の間にユーザーが選択を変更する可能性を考慮
