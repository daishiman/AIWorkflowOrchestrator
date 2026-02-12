# Phase 4: 統合テスト設計

## メタ情報

| 項目       | 値                            |
| ---------- | ----------------------------- |
| タスクID   | TASK-9B-H                     |
| フェーズ   | Phase 4: テスト作成 (TDD Red) |
| 作成日     | 2026-02-12                    |
| ステータス | 完了                          |

## テスト設計方針

### 1. テストレイヤー

```
Main Process Tests (skillCreatorIpc.integration.test.ts)
  |-- ハンドラー登録/解除
  |-- 各ハンドラーの正常フロー
  |-- 各ハンドラーのエラーハンドリング
  |-- Sender検証 (セキュリティ)
  |-- 引数バリデーション
  |-- 進捗通知

Preload API Tests (skill-creator-api.test.ts)
  |-- チャンネル定数の存在確認
  |-- ホワイトリスト登録確認
  |-- 各APIメソッドのチャンネル呼び出し確認
  |-- onProgressリスナー管理
```

### 2. モック戦略

#### Main Processテスト

- `electron` モジュール: `ipcMain.handle`/`removeHandler`をモック化し、ハンドラーマップで管理
- `BrowserWindow`: `fromWebContents`をモック化しSender検証をテスト
- `SkillCreatorService`: 全メソッドをvi.fnでモック化

#### Preload APIテスト

- `electron` モジュール: `ipcRenderer.invoke`/`on`/`removeListener`をモック化
- `vi.hoisted()`でモック関数をホイスティング

### 3. セキュリティテスト設計

各ハンドラーで以下を検証:

- `BrowserWindow.fromWebContents`がnullを返す場合に拒否
- `toIPCValidationError`形式のエラーがthrowされること
- 不正なwebContents IDでの呼び出しが拒否されること

### 4. 引数バリデーション設計

| ハンドラー      | 検証条件                                          |
| --------------- | ------------------------------------------------- |
| detect-mode     | request: string, 空文字/undefined拒否             |
| create          | name/description/mode: string, 未指定拒否         |
| execute-tasks   | tasksDir: string, 空文字/スペースのみ拒否         |
| validate        | skillDir: string, 空文字拒否                      |
| validate-schema | schemaName: string(空文字拒否), data: defined必須 |

### 5. エラーハンドリング設計

- Error instanceの場合: `error.message`を返却
- 非Error instanceの場合: デフォルトの日本語メッセージを返却
- 内部スタックトレースは返却しない（セキュリティ要件）
