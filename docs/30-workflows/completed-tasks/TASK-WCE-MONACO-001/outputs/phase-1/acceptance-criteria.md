# 受け入れ基準 - TASK-WCE-MONACO-001

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 1                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |
| 更新日 | 2026-02-03          |

## 受け入れ基準一覧

### 機能要件の受け入れ基準

| AC-ID | 要件ID | 受け入れ基準                                                           | 検証方法                           |
| ----- | ------ | ---------------------------------------------------------------------- | ---------------------------------- |
| AC-1  | FR-1   | `chat-edit:get-selection` IPC呼び出しでTextSelectionオブジェクトが返る | ユニットテスト、統合テスト         |
| AC-2  | FR-2   | 選択なし時に`null`が返却される                                         | ユニットテスト                     |
| AC-3  | FR-3   | startLine, endLine, startColumn, endColumn, selectedTextが全て正しい値 | ユニットテスト（各フィールド検証） |
| AC-4  | FR-4   | Renderer→Main間でデータが正しく送受信される                            | 統合テスト                         |
| AC-5  | FR-5   | `registerAllIpcHandlers()`内でchatEditHandlersが登録される             | コードレビュー、統合テスト         |
| AC-6  | FR-6   | Renderer側でMonaco Editor APIから選択範囲を取得できる                  | ユニットテスト                     |
| AC-7  | FR-7   | Main ProcessがRenderer側に問い合わせて選択範囲を取得できる             | 統合テスト                         |

### 非機能要件の受け入れ基準

| AC-ID | 要件ID | 受け入れ基準                                   | 検証方法             |
| ----- | ------ | ---------------------------------------------- | -------------------- |
| AC-8  | NFR-2  | `pnpm typecheck`がエラー0件                    | TypeScriptコンパイル |
| AC-9  | NFR-3  | 新規コードのテストカバレッジが80%以上          | `pnpm test:coverage` |
| AC-10 | NFR-4  | contextBridge経由のみでAPIが公開される         | セキュリティレビュー |
| AC-11 | NFR-5  | validateIpcSender()がchat-editチャンネルに適用 | コードレビュー       |
| AC-12 | NFR-6  | ESLintエラー0件、Prettierフォーマット済み      | `pnpm lint`          |

## テストシナリオ対応表

| AC-ID | テストシナリオ                                             |
| ----- | ---------------------------------------------------------- |
| AC-1  | 選択範囲がある時にTextSelectionが返る                      |
| AC-2  | 選択がない時にnullが返る                                   |
| AC-3  | 全フィールドが正しい値を持つ（境界値含む）                 |
| AC-4  | IPC経由でデータが正しく送受信される                        |
| AC-5  | IPC登録後にチャンネルが有効になる                          |
| AC-6  | Monaco Editorの選択範囲をTextSelection形式で返す           |
| AC-7  | Main ProcessがRenderer側に問い合わせて選択範囲を取得できる |
| AC-9  | 新規コードのカバレッジが80%以上                            |
| AC-10 | contextBridge経由のみでAPIが公開される                     |

## 検証チェックリスト

### 機能検証

- [ ] AC-1: 選択範囲がある場合にTextSelectionが返る
- [ ] AC-2: 選択がない場合にnullが返る
- [ ] AC-3: TextSelection型の全フィールドが正しい値
- [ ] AC-4: IPC通信が正常に動作
- [ ] AC-5: chatEditHandlersがIPC登録されている
- [ ] AC-6: Renderer側で選択範囲取得が動作
- [ ] AC-7: Main→Renderer問い合わせが動作

### 品質検証

- [ ] AC-8: TypeScript strict mode準拠
- [ ] AC-9: テストカバレッジ Line 80%以上
- [ ] AC-10: contextIsolation準拠
- [ ] AC-11: validateIpcSender()適用
- [ ] AC-12: ESLint/Prettierクリア
