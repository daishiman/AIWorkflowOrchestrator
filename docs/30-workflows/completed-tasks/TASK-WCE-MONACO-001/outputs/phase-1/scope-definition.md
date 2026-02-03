# スコープ定義 - TASK-WCE-MONACO-001

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 1                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |
| 更新日 | 2026-02-03          |

## スコープ範囲

### 含むもの（In Scope）

| #   | 項目                                    | 詳細                                        |
| --- | --------------------------------------- | ------------------------------------------- |
| 1   | Renderer側選択範囲取得ユーティリティ    | `editorSelection.ts`新規作成                |
| 2   | Main Process handleGetSelection実装完成 | TODOコメント解消                            |
| 3   | chatEditHandlersのIPC登録               | `registerAllIpcHandlers()`への追加          |
| 4   | webContents.executeJavaScript連携       | Main→Renderer選択範囲問い合わせ             |
| 5   | グローバル関数公開                      | window.\_\_editorSelectionへの公開          |
| 6   | ユニットテスト作成                      | editorSelection, handleGetSelectionのテスト |
| 7   | 統合テスト作成                          | IPC経由での選択範囲取得テスト               |
| 8   | 既存TODOコメント削除                    | `chatEditHandlers.ts:331-333`               |
| 9   | TextSelection型の再利用                 | 既存型定義をそのまま使用                    |

### 含まないもの（Out of Scope）

| #   | 項目                        | 理由                               | 別タスク化 |
| --- | --------------------------- | ---------------------------------- | ---------- |
| 1   | Monaco Editor自体の実装変更 | 既存のMonaco統合をそのまま利用     | 不要       |
| 2   | マルチカーソル対応          | 複雑性が増すため、単一選択のみ対象 | 要検討     |
| 3   | 選択範囲のハイライト表示    | UI機能は別タスク                   | 要検討     |
| 4   | エディタへの書き戻し機能    | 別タスクとして分離                 | 別タスク   |
| 5   | Vim/Emacsモード対応         | 標準モードのみ対象                 | 要検討     |
| 6   | 複数エディタ対応            | アクティブエディタのみ対象         | 要検討     |

## 変更対象ファイル

| ファイルパス                                              | 変更種別 | 変更内容                               |
| --------------------------------------------------------- | -------- | -------------------------------------- |
| `apps/desktop/src/renderer/utils/editorSelection.ts`      | 新規     | Monaco選択範囲取得ユーティリティ       |
| `apps/desktop/src/main/ipc/chatEditHandlers.ts`           | 修正     | handleGetSelection実装完成             |
| `apps/desktop/src/main/ipc/index.ts`                      | 修正     | registerChatEditHandlers()呼び出し追加 |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts`      | 修正     | TODOコメント削除（ipc版に統合）        |
| `apps/desktop/src/renderer/utils/editorSelection.test.ts` | 新規     | ユニットテスト                         |
| `apps/desktop/src/main/ipc/chatEditHandlers.test.ts`      | 新規     | ユニットテスト                         |
| `apps/desktop/src/__tests__/chatEdit.integration.test.ts` | 新規     | 統合テスト                             |

## 依存関係

### 前提条件

| 依存項目                     | ステータス | 確認方法               |
| ---------------------------- | ---------- | ---------------------- |
| workspace-chat-edit-main基盤 | ✅ 完了    | 既存コード確認済み     |
| Monaco Editor統合            | ✅ 完了    | DiffEditor.tsx確認済み |
| contextBridge設定            | ✅ 完了    | preload設定確認済み    |
| TextSelection型定義          | ✅ 完了    | types/index.ts確認済み |
| IPCチャンネル定義            | ✅ 完了    | channels.ts確認済み    |

### 後続タスク

| タスク               | 依存関係                     |
| -------------------- | ---------------------------- |
| エディタ書き戻し機能 | 本タスク完了後               |
| マルチカーソル対応   | 本タスク完了後（オプション） |

## 技術的制約

| 制約                              | 対応策                                             |
| --------------------------------- | -------------------------------------------------- |
| contextBridgeのSerializable制約   | プレーンオブジェクトのみ送信                       |
| Main ProcessからのDOM直接アクセス | webContents.executeJavaScript使用                  |
| タイミング問題                    | IPC呼び出し時点の選択範囲を取得                    |
| Monaco Editorインスタンス取得     | グローバル参照（window.\_\_editorSelection）を使用 |

## リスク評価

| リスク                                    | 影響度 | 発生確率 | 対策                                           |
| ----------------------------------------- | ------ | -------- | ---------------------------------------------- |
| Monaco Editorインスタンスへのアクセス困難 | 高     | 中       | グローバル参照またはコンテキスト経由でアクセス |
| 複数エディタ対応の複雑化                  | 中     | 低       | アクティブエディタのみを対象とし、複雑化を回避 |
| IPC通信のレイテンシ                       | 低     | 低       | 同期的なAPIは避け、非同期で実装                |
| エディタ破棄時の参照エラー                | 中     | 中       | nullチェックを徹底、エラーハンドリングを実装   |
