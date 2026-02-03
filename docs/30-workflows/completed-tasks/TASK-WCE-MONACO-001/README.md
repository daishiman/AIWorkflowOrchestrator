# TASK-WCE-MONACO-001: Chat Edit Monaco Editor統合

## 概要

Monaco Editorの選択範囲情報をMain Processで取得可能にし、chat-edit機能でコンテキスト付きLLM連携を実現する。

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | TASK-WCE-MONACO-001                     |
| タスク名     | Chat Edit Monaco Editor統合             |
| 分類         | 改善                                    |
| 対象機能     | workspace-chat-edit / Monaco Editor連携 |
| 優先度       | 中                                      |
| 見積もり規模 | 中規模                                  |
| ステータス   | 仕様書作成済み                          |
| GitHub Issue | #659                                    |
| 発見元       | Phase 12（コードベースTODOスキャン）    |
| 発見日       | 2026-02-02                              |

## Phase一覧

| Phase | 名称                 | ファイル                   |
| ----- | -------------------- | -------------------------- |
| 1     | 要件定義             | [phase-1.md](phase-1.md)   |
| 2     | 設計                 | [phase-2.md](phase-2.md)   |
| 3     | 設計レビューゲート   | [phase-3.md](phase-3.md)   |
| 4     | テスト作成           | [phase-4.md](phase-4.md)   |
| 5     | 実装                 | [phase-5.md](phase-5.md)   |
| 6     | テスト拡充           | [phase-6.md](phase-6.md)   |
| 7     | テストカバレッジ確認 | [phase-7.md](phase-7.md)   |
| 8     | リファクタリング     | [phase-8.md](phase-8.md)   |
| 9     | 品質保証             | [phase-9.md](phase-9.md)   |
| 10    | 最終レビューゲート   | [phase-10.md](phase-10.md) |
| 11    | 手動テスト検証       | [phase-11.md](phase-11.md) |
| 12    | ドキュメント更新     | [phase-12.md](phase-12.md) |
| 13    | PR作成               | [phase-13.md](phase-13.md) |

## 目的

- `chat-edit:get-selection` IPCコマンドがエディタの選択範囲を正しく返す
- 選択範囲情報（startLine, endLine, startColumn, endColumn, selectedText）が取得可能
- 選択範囲をコンテキストとしてLLMに送信可能
- 関連テストが全てパス

## スコープ

### 含むもの

- Renderer Process側でのMonaco Editor選択範囲取得ロジック
- IPC経由での選択範囲情報送信メカニズム
- `handleGetSelection`の実装完成
- TextSelection型を使用した構造化データ返却
- ユニットテスト・統合テスト追加
- chatEditHandlersのIPC登録

### 含まないもの

- Monaco Editor自体の実装・設定変更
- マルチカーソル対応（単一選択範囲のみ）
- 選択範囲のハイライト表示機能
- エディタへの書き戻し機能（別タスク）

## 依存タスク

| タスク                           | ステータス | 関係         |
| -------------------------------- | ---------- | ------------ |
| workspace-chat-edit-main-process | ✅ 完了    | 基盤実装     |
| Monaco Editor統合                | ✅ 完了    | エディタ基盤 |

## 関連ドキュメント

| ドキュメント             | 用途                      |
| ------------------------ | ------------------------- |
| api-endpoints.md         | IPC APIエンドポイント仕様 |
| api-ipc-agent.md         | Chat Edit IPC定義         |
| interfaces-core.md       | Result型定義              |
| security-api-electron.md | Electron IPC セキュリティ |
| security-electron-ipc.md | IPC通信セキュリティ       |

## 技術的注意点

1. **Renderer → Main通信**: 選択範囲はRenderer側で保持されるため、Main側からの直接アクセスは不可能
2. **contextBridge制約**: Serializableなデータのみを渡せるため、Monaco Editorのオブジェクト参照は直接渡せない
3. **タイミング**: IPC呼び出し時点の選択範囲を取得するため、取得とLLM送信の間にユーザーが選択を変更する可能性を考慮
4. **IPCハンドラー未登録**: 現在chatEditHandlersがregisterAllIpcHandlers()に登録されていない

## 変更履歴

| バージョン | 日付       | 変更内容         |
| ---------- | ---------- | ---------------- |
| 1.0.0      | 2026-02-03 | タスク仕様書作成 |
