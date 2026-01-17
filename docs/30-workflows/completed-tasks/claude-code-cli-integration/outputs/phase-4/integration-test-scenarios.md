# 統合テストシナリオ

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| 機能名     | claude-code-cli-integration |
| バージョン | 1.0.0                       |
| 作成日     | 2026-01-17                  |
| Phase      | 4                           |

---

## 1. CLI接続テストシナリオ

### 1.1 CLI存在確認

| ID       | INT-CLI-001                                                      |
| -------- | ---------------------------------------------------------------- |
| カテゴリ | CLI接続                                                          |
| 前提条件 | Claude Code CLIがシステムにインストールされている                |
| シナリオ | アプリケーション起動時にCLIインストールを確認                    |
| 期待結果 | CLIの存在とバージョン情報が取得できる                            |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts` |

```gherkin
Given アプリケーションが起動する
When CLI存在確認IPCが呼び出される
Then installed=true が返却される
And version にCLIバージョンが含まれる
And path にCLI実行パスが含まれる
```

### 1.2 CLI未インストール時

| ID       | INT-CLI-002                                                      |
| -------- | ---------------------------------------------------------------- |
| カテゴリ | CLI接続                                                          |
| 前提条件 | Claude Code CLIがインストールされていない                        |
| シナリオ | CLIが見つからない場合のエラーハンドリング                        |
| 期待結果 | 適切なエラーメッセージが返却される                               |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts` |

```gherkin
Given CLIがインストールされていない
When CLI存在確認IPCが呼び出される
Then installed=false が返却される
And error に「CLI not found」メッセージが含まれる
```

### 1.3 CLIバージョン不整合

| ID       | INT-CLI-003                                                      |
| -------- | ---------------------------------------------------------------- |
| カテゴリ | CLI接続                                                          |
| 前提条件 | CLIは存在するがバージョンが古い                                  |
| シナリオ | バージョンチェックと警告                                         |
| 期待結果 | バージョン警告が出力され、処理は続行可能                         |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts` |

```gherkin
Given CLIバージョンが最小要件を満たさない
When CLI存在確認IPCが呼び出される
Then installed=true が返却される
And version に古いバージョンが含まれる
And 警告イベントが発行される
```

---

## 2. IPC通信テストシナリオ

### 2.1 Renderer→Main→CLI→Main→Renderer往復

| ID       | INT-IPC-001                                                      |
| -------- | ---------------------------------------------------------------- |
| カテゴリ | IPC通信                                                          |
| 前提条件 | アプリケーションが正常に起動している                             |
| シナリオ | スキル一覧取得の完全な往復通信                                   |
| 期待結果 | RendererからMainを経由してスキル一覧が取得できる                 |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts` |

```gherkin
Given RendererプロセスがAPIを呼び出す
When listSkills() が実行される
Then Mainプロセスがリクエストを処理する
And スキル一覧がRendererに返却される
```

### 2.2 不正なチャンネルアクセス拒否

| ID       | INT-IPC-002                                                      |
| -------- | ---------------------------------------------------------------- |
| カテゴリ | IPC通信                                                          |
| 前提条件 | ホワイトリスト外のチャンネルへアクセス試行                       |
| シナリオ | 未登録チャンネルへのアクセスを拒否                               |
| 期待結果 | IPC_SENDER_INVALIDエラーが返却される                             |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts` |

```gherkin
Given ホワイトリスト外のチャンネル名でリクエストする
When IPCハンドラーが呼び出される
Then IPC_SENDER_INVALID エラーが返却される
And リクエストは処理されない
```

### 2.3 DevToolsからのリクエスト拒否

| ID       | INT-IPC-003                                                      |
| -------- | ---------------------------------------------------------------- |
| カテゴリ | IPC通信                                                          |
| 前提条件 | DevToolsコンソールからIPC呼び出しを試行                          |
| シナリオ | DevToolsからのリクエストをセキュリティ検証で拒否                 |
| 期待結果 | IPC_VALIDATION_ERRORが返却される                                 |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts` |

```gherkin
Given DevToolsコンソールからIPCを呼び出す
When validateIpcSender() が実行される
Then 検証が失敗する
And IPC_VALIDATION_ERROR が返却される
```

---

## 3. プロセス管理テストシナリオ

### 3.1 spawn→monitor→killライフサイクル

| ID       | INT-PROC-001                                                         |
| -------- | -------------------------------------------------------------------- |
| カテゴリ | プロセス管理                                                         |
| 前提条件 | スクリプト実行リクエストを受信                                       |
| シナリオ | プロセスのライフサイクル完全フロー                                   |
| 期待結果 | プロセスが起動→監視→終了まで正しく管理される                         |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/process-manager.test.ts` |

```gherkin
Given スクリプト実行リクエストを受信する
When ProcessManager.spawn() が呼び出される
Then 新しいプロセスが起動する
And セッションIDでプロセスが追跡される
And stdout/stderrがキャプチャされる
When プロセスが完了する
Then exitイベントが発火する
And リソースがクリーンアップされる
```

### 3.2 タイムアウト処理

| ID       | INT-PROC-002                                                         |
| -------- | -------------------------------------------------------------------- |
| カテゴリ | プロセス管理                                                         |
| 前提条件 | 長時間実行されるスクリプト                                           |
| シナリオ | タイムアウトによる強制終了                                           |
| 期待結果 | タイムアウト後にプロセスが強制終了される                             |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/process-manager.test.ts` |

```gherkin
Given タイムアウト5秒でプロセスを起動する
When 5秒以上プロセスが実行される
Then SIGTERM が送信される
And 猶予期間後に SIGKILL が送信される
And processTimeout イベントが発火する
```

### 3.3 異常終了ハンドリング

| ID       | INT-PROC-003                                                         |
| -------- | -------------------------------------------------------------------- |
| カテゴリ | プロセス管理                                                         |
| 前提条件 | スクリプトが異常終了する                                             |
| シナリオ | 異常終了時のエラーハンドリング                                       |
| 期待結果 | 終了コードとエラー出力が正しく記録される                             |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/process-manager.test.ts` |

```gherkin
Given スクリプトが非ゼロ終了コードで終了する
When exitイベントが発火する
Then セッションステータスが failed になる
And 終了コードが記録される
And stderrの内容が保存される
```

---

## 4. ストリーミングテストシナリオ

### 4.1 stdout/stderrリアルタイムキャプチャ

| ID       | INT-STREAM-001                                                       |
| -------- | -------------------------------------------------------------------- |
| カテゴリ | ストリーミング                                                       |
| 前提条件 | スクリプトが実行中                                                   |
| シナリオ | 出力のリアルタイムストリーミング                                     |
| 期待結果 | 出力が即座にRendererに転送される                                     |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/process-manager.test.ts` |

```gherkin
Given スクリプトが実行中である
When stdoutにデータが出力される
Then StreamMessage がRendererに送信される
And type="stdout" である
And content に出力内容が含まれる
And timestamp が設定される
```

### 4.2 複数行出力の処理

| ID       | INT-STREAM-002                                                       |
| -------- | -------------------------------------------------------------------- |
| カテゴリ | ストリーミング                                                       |
| 前提条件 | スクリプトが複数行を出力する                                         |
| シナリオ | 複数行出力の行単位処理                                               |
| 期待結果 | 各行が個別のStreamMessageとして送信される                            |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/process-manager.test.ts` |

```gherkin
Given スクリプトが "line1\nline2\nline3" を出力する
When 出力がキャプチャされる
Then 3つのStreamMessageが生成される
And 順序が保持される
```

### 4.3 大量出力時のバッファリング

| ID       | INT-STREAM-003                                                       |
| -------- | -------------------------------------------------------------------- |
| カテゴリ | ストリーミング                                                       |
| 前提条件 | スクリプトが大量のデータを出力する                                   |
| シナリオ | バッファオーバーフロー防止                                           |
| 期待結果 | メモリが適切に管理され、データ損失がない                             |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/process-manager.test.ts` |

```gherkin
Given スクリプトが1MBのデータを出力する
When 出力がキャプチャされる
Then データ損失なく処理される
And メモリ使用量が制限内に収まる
```

---

## 5. セッション管理テストシナリオ

### 5.1 作成→並列実行→クリーンアップ

| ID       | INT-SESSION-001                                                      |
| -------- | -------------------------------------------------------------------- |
| カテゴリ | セッション管理                                                       |
| 前提条件 | 複数のスクリプト実行リクエスト                                       |
| シナリオ | 複数セッションの並列管理                                             |
| 期待結果 | 各セッションが独立して管理される                                     |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/session-manager.test.ts` |

```gherkin
Given 3つのスクリプト実行リクエストを受信する
When 各リクエストでセッションが作成される
Then 3つの独立したセッションが存在する
And 各セッションのステータスが追跡される
When 全セッションが完了する
Then 各セッションにcompletedAtが設定される
```

### 5.2 セッション上限到達

| ID       | INT-SESSION-002                                                      |
| -------- | -------------------------------------------------------------------- |
| カテゴリ | セッション管理                                                       |
| 前提条件 | 最大セッション数に到達                                               |
| シナリオ | LRUエビクションによる自動解放                                        |
| 期待結果 | 古い完了セッションが削除され、新規セッションが作成できる             |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/session-manager.test.ts` |

```gherkin
Given maxSessions=10 で設定されている
And 10セッションが存在し、2つが完了済み
When 新しいセッション作成を試みる
Then 最も古い完了セッションが削除される
And 新しいセッションが作成される
```

### 5.3 アプリケーション終了時のクリーンアップ

| ID       | INT-SESSION-003                                                      |
| -------- | -------------------------------------------------------------------- |
| カテゴリ | セッション管理                                                       |
| 前提条件 | 実行中のセッションが存在する状態でアプリ終了                         |
| シナリオ | 全プロセスの正常終了                                                 |
| 期待結果 | 全プロセスが終了し、リソースが解放される                             |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/session-manager.test.ts` |

```gherkin
Given 3つの実行中セッションが存在する
When アプリケーションが終了する
Then 全セッションにSIGTERMが送信される
And 全セッションのステータスがterminatedになる
And プロセス参照がnullに設定される
```

---

## 6. エラーハンドリングテストシナリオ

### 6.1 各層でのエラー伝播

| ID       | INT-ERR-001                          |
| -------- | ------------------------------------ |
| カテゴリ | エラーハンドリング                   |
| 前提条件 | 各層でエラーが発生する可能性がある   |
| シナリオ | エラーの適切な伝播と変換             |
| 期待結果 | エラーがResult型で統一的に返却される |
| テスト   | 各テストファイル                     |

```gherkin
Given スキル実行中にCLIでエラーが発生する
When ProcessManagerがエラーをキャプチャする
Then CliError型に変換される
And SessionManagerにエラーが伝播する
And IPCハンドラーがResult.err()を返却する
And RendererにエラーResultが送信される
```

### 6.2 パストラバーサル攻撃防止

| ID       | INT-ERR-002                                                        |
| -------- | ------------------------------------------------------------------ |
| カテゴリ | エラーハンドリング                                                 |
| 前提条件 | 不正なパスを含むリクエスト                                         |
| シナリオ | パストラバーサル攻撃の検出と拒否                                   |
| 期待結果 | PATH_TRAVERSAL_DETECTEDエラーが返却される                          |
| テスト   | `apps/desktop/src/main/claude-cli/__tests__/skill-scanner.test.ts` |

```gherkin
Given skillName に "../../../etc/passwd" が含まれる
When バリデーションが実行される
Then PATH_TRAVERSAL_DETECTED エラーが返却される
And リクエストは処理されない
```

### 6.3 回復可能なエラーからの復帰

| ID       | INT-ERR-003                          |
| -------- | ------------------------------------ |
| カテゴリ | エラーハンドリング                   |
| 前提条件 | 一時的なエラー（ファイルロックなど） |
| シナリオ | エラー後の状態回復                   |
| 期待結果 | システムが正常状態に復帰する         |
| テスト   | 各テストファイル                     |

```gherkin
Given スキルスキャン中に一時的なファイルエラーが発生する
When エラーが記録される
Then ScanResult.errors にエラーが追加される
And スキャン処理は続行される
And 後続のスキルが正常に処理される
```

---

## 7. テストファイル対応表

| テストファイル            | カバーするシナリオ                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `process-manager.test.ts` | INT-PROC-001, INT-PROC-002, INT-PROC-003, INT-STREAM-001, INT-STREAM-002, INT-STREAM-003 |
| `ipc-handler.test.ts`     | INT-CLI-001, INT-CLI-002, INT-CLI-003, INT-IPC-001, INT-IPC-002, INT-IPC-003             |
| `skill-scanner.test.ts`   | INT-ERR-002                                                                              |
| `session-manager.test.ts` | INT-SESSION-001, INT-SESSION-002, INT-SESSION-003                                        |

---

## 8. テスト実行手順

### 8.1 単体テスト

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- --run

# 特定のテストファイル
pnpm --filter @repo/desktop test -- --run src/main/claude-cli/__tests__/process-manager.test.ts

# ウォッチモード
pnpm --filter @repo/desktop test -- --watch
```

### 8.2 カバレッジ確認

```bash
# カバレッジレポート生成
pnpm --filter @repo/desktop test -- --coverage --run

# 特定ディレクトリのカバレッジ
pnpm --filter @repo/desktop test -- --coverage --run src/main/claude-cli/
```

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-17 | 1.0.0      | 初版作成 |
