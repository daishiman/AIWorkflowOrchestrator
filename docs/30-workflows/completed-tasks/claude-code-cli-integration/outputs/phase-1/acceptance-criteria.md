# Claude Code CLI統合 - 受け入れ基準

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| 機能名     | claude-code-cli-integration |
| バージョン | 1.0.0                       |
| 作成日     | 2026-01-17                  |
| Phase      | 1                           |

---

## 1. CLIインストール確認（FR-001）

### AC-001-01: CLIが正常にインストールされている場合

```gherkin
Given Claude Code CLIがローカル環境にインストールされている
  And PATH環境変数でclaudeコマンドが解決可能である
When CLIインストール確認APIを呼び出す
Then 結果オブジェクトのisInstalledがtrueである
  And バージョン情報が取得される（例: "1.0.0"）
  And executablePathにCLIのフルパスが含まれる
```

**検証方法**: 自動テスト（ユニットテスト）

### AC-001-02: CLIがインストールされていない場合

```gherkin
Given Claude Code CLIがローカル環境にインストールされていない
When CLIインストール確認APIを呼び出す
Then 結果オブジェクトのisInstalledがfalseである
  And エラーメッセージに"Claude Code CLI is not installed"が含まれる
  And バージョン情報はnullである
```

**検証方法**: 自動テスト（ユニットテスト、モック使用）

### AC-001-03: CLIは存在するがPATHに含まれない場合

```gherkin
Given Claude Code CLIがインストールされている
  But PATH環境変数でclaudeコマンドが解決できない
When CLIインストール確認APIを呼び出す
Then 結果オブジェクトのisInstalledがfalseである
  And エラーメッセージに"claude command not found in PATH"が含まれる
```

**検証方法**: 自動テスト（ユニットテスト、環境変数モック）

---

## 2. CLIプロセス起動（FR-002）

### AC-002-01: プロセスが正常に起動する場合

```gherkin
Given CLIが正常にインストールされている
  And 有効な作業ディレクトリが指定されている
When CLIプロセス起動APIを呼び出す
Then プロセスがchild_process.spawn()で起動される
  And プロセスIDが返却される（pid > 0）
  And プロセス状態が"running"になる
```

**検証方法**: 自動テスト（統合テスト）

### AC-002-02: 無効な作業ディレクトリの場合

```gherkin
Given CLIが正常にインストールされている
  And 存在しないディレクトリが作業ディレクトリとして指定されている
When CLIプロセス起動APIを呼び出す
Then エラーが発生する
  And エラーコードが"INVALID_WORKING_DIRECTORY"である
  And プロセスは起動されない
```

**検証方法**: 自動テスト（ユニットテスト）

### AC-002-03: CLIが見つからない場合

```gherkin
Given CLIがインストールされていない
When CLIプロセス起動APIを呼び出す
Then エラーが発生する
  And エラーコードが"CLI_NOT_FOUND"である
  And エラーメッセージに解決策（インストール方法）が含まれる
```

**検証方法**: 自動テスト（ユニットテスト、モック使用）

---

## 3. スキル実行（FR-003）

### AC-003-01: スキルが正常に実行される場合

```gherkin
Given CLIプロセスが起動している
  And ".claude/skills/task-specification-creator"スキルが存在する
When スキル実行APIに"task-specification-creator"と引数を渡す
Then スキルが実行される
  And 標準出力にスキルの出力が含まれる
  And 終了コードが0である
```

**検証方法**: 自動テスト（E2Eテスト、実スキル使用）

### AC-003-02: 存在しないスキルを指定した場合

```gherkin
Given CLIプロセスが起動している
  And "non-existent-skill"というスキルが存在しない
When スキル実行APIに"non-existent-skill"を渡す
Then エラーが発生する
  And エラーコードが"SKILL_NOT_FOUND"である
  And エラーメッセージにスキル名が含まれる
```

**検証方法**: 自動テスト（ユニットテスト）

### AC-003-03: スキル実行がタイムアウトした場合

```gherkin
Given CLIプロセスが起動している
  And スキルの実行タイムアウトが10秒に設定されている
  And スキルの実行に30秒以上かかる
When スキル実行APIを呼び出す
Then タイムアウトエラーが発生する
  And エラーコードが"EXECUTION_TIMEOUT"である
  And プロセスがクリーンアップされる
```

**検証方法**: 自動テスト（統合テスト、遅延モック使用）

---

## 4. スキル一覧取得（FR-004）

### AC-004-01: スキル一覧が正常に取得される場合

```gherkin
Given ".claude/skills/"ディレクトリに複数のスキルが存在する
  And 各スキルに有効なSKILL.mdが含まれている
When スキル一覧取得APIを呼び出す
Then スキルの配列が返却される
  And 各スキルにname, description, tagsが含まれる
  And スキル数が実際のディレクトリ数と一致する
```

**検証方法**: 自動テスト（統合テスト）

### AC-004-02: スキルディレクトリが空の場合

```gherkin
Given ".claude/skills/"ディレクトリが空である
When スキル一覧取得APIを呼び出す
Then 空の配列が返却される
  And エラーは発生しない
```

**検証方法**: 自動テスト（ユニットテスト）

### AC-004-03: 無効なSKILL.mdを持つスキルがある場合

```gherkin
Given ".claude/skills/"に"invalid-skill"ディレクトリが存在する
  And "invalid-skill"にSKILL.mdが存在しないまたは無効である
When スキル一覧取得APIを呼び出す
Then 有効なスキルのみが返却される
  And "invalid-skill"は結果に含まれない
  And 警告ログが出力される
```

**検証方法**: 自動テスト（ユニットテスト）

---

## 5. スキルフィルタリング（FR-005）

### AC-005-01: スキル名で検索する場合

```gherkin
Given スキル一覧に"task-specification-creator", "presentation-slide-generator"が含まれる
When フィルタリングAPIに検索クエリ"task"を渡す
Then "task-specification-creator"のみが返却される
  And "presentation-slide-generator"は含まれない
```

**検証方法**: 自動テスト（ユニットテスト）

### AC-005-02: タグでフィルタリングする場合

```gherkin
Given スキル一覧にタグ"development"を持つスキルが3つ存在する
When フィルタリングAPIにtags: ["development"]を渡す
Then タグ"development"を持つ3つのスキルのみが返却される
```

**検証方法**: 自動テスト（ユニットテスト）

### AC-005-03: 複合条件（AND）でフィルタリングする場合

```gherkin
Given スキル一覧に複数のスキルが存在する
When フィルタリングAPIに{name: "task", tags: ["workflow"]}を渡す
Then 名前に"task"を含み、かつタグに"workflow"を持つスキルのみが返却される
```

**検証方法**: 自動テスト（ユニットテスト）

---

## 6. スキルホワイトリスト管理（FR-006）

### AC-006-01: ホワイトリストを作成する場合

```gherkin
Given ホワイトリストが存在しない
When ホワイトリスト作成APIに{name: "default", skills: ["skill-a", "skill-b"]}を渡す
Then ホワイトリストが作成される
  And 設定ファイルに永続化される
  And 作成されたホワイトリストが返却される
```

**検証方法**: 自動テスト（統合テスト）

### AC-006-02: ホワイトリストに基づいてスキルをロードする場合

```gherkin
Given ホワイトリスト"default"に["skill-a", "skill-b"]が設定されている
  And ".claude/skills/"に"skill-a", "skill-b", "skill-c"が存在する
When ホワイトリスト"default"でスキルをロードする
Then "skill-a"と"skill-b"のみがロードされる
  And "skill-c"はロードされない
```

**検証方法**: 自動テスト（統合テスト）

### AC-006-03: 存在しないスキルがホワイトリストに含まれる場合

```gherkin
Given ホワイトリストに["skill-a", "non-existent"]が設定されている
  And "skill-a"は存在するが"non-existent"は存在しない
When ホワイトリストでスキルをロードする
Then "skill-a"のみがロードされる
  And 警告ログに"non-existent"が見つからない旨が出力される
```

**検証方法**: 自動テスト（ユニットテスト）

---

## 7. 標準出力ストリーミング（FR-007）

### AC-007-01: 標準出力がリアルタイムで受信される場合

```gherkin
Given CLIプロセスが起動している
  And スキルが実行中で標準出力を生成している
When ストリーミングAPIをsubscribeする
Then 出力チャンクがリアルタイムで受信される
  And 各チャンクにtype: "stdout"が含まれる
  And 受信遅延が100ms以内である
```

**検証方法**: 自動テスト（統合テスト、タイムスタンプ検証）

### AC-007-02: 標準エラー出力が受信される場合

```gherkin
Given CLIプロセスが起動している
  And スキルが標準エラー出力を生成している
When ストリーミングAPIをsubscribeする
Then エラーチャンクが受信される
  And 各チャンクにtype: "stderr"が含まれる
  And 標準出力とエラー出力が区別される
```

**検証方法**: 自動テスト（統合テスト）

### AC-007-03: プロセス終了時にストリームが完了する場合

```gherkin
Given CLIプロセスが起動している
  And ストリーミングAPIをsubscribeしている
When プロセスが終了する
Then ストリームが完了イベントを発行する
  And 完了イベントにexitCodeが含まれる
  And これ以上チャンクは受信されない
```

**検証方法**: 自動テスト（統合テスト）

---

## 8. IPC通信統合（FR-008）

### AC-008-01: RendererからMainへのinvoke呼び出し

```gherkin
Given Electronアプリが起動している
  And contextBridgeでclaudeCliAPIが公開されている
When Rendererからwindow.claudeCliAPI.checkInstallation()を呼び出す
Then ipcRenderer.invokeがコールされる
  And ipcMainのハンドラーが実行される
  And 結果がRendererに返却される
```

**検証方法**: 自動テスト（Playwright E2Eテスト）

### AC-008-02: ストリーミングデータのRenderer配信

```gherkin
Given スキルが実行中でストリーミング出力を生成している
  And Rendererがストリーミングチャンネルをlistenしている
When Mainプロセスがストリームデータを受信する
Then ipcMain.sendでRendererに配信される
  And Rendererのコールバックが呼び出される
  And データ形式が正しい（{type, data, timestamp}）
```

**検証方法**: 自動テスト（統合テスト）

### AC-008-03: 不正なIPCチャンネルへのアクセス拒否

```gherkin
Given contextBridgeでホワイトリストにないチャンネルが呼び出される
When DevToolsから直接ipcRenderer.invoke("unauthorized-channel")を呼び出す
Then アクセスが拒否される
  And エラーがコンソールに出力される
  And セキュリティログが記録される
```

**検証方法**: 自動テスト（セキュリティテスト）

---

## 9. セッション管理（FR-009）

### AC-009-01: セッションが作成される場合

```gherkin
Given セッションが存在しない
When セッション作成APIを呼び出す
Then 一意のセッションIDが生成される（UUID v4形式）
  And セッション状態が"pending"になる
  And セッションがセッションマップに追加される
```

**検証方法**: 自動テスト（ユニットテスト）

### AC-009-02: 複数セッションの並列実行

```gherkin
Given 最大セッション数が10に設定されている
  And 現在5つのセッションが実行中である
When 新しいセッションを3つ同時に作成する
Then 8つのセッションが並列実行される
  And 各セッションの出力が混在しない
  And 各セッションの状態が個別に管理される
```

**検証方法**: 自動テスト（負荷テスト）

### AC-009-03: 最大セッション数を超える場合

```gherkin
Given 最大セッション数が10に設定されている
  And 現在10個のセッションが実行中である
When 新しいセッションを作成しようとする
Then LRU方式で最も古いセッションが終了される
  And 新しいセッションが作成される
  And 警告ログが出力される
```

**検証方法**: 自動テスト（統合テスト）

---

## 10. セッション終了・クリーンアップ（FR-010）

### AC-010-01: セッションが正常に終了する場合

```gherkin
Given セッションが"running"状態である
When セッション終了APIを呼び出す
Then プロセスにSIGTERMが送信される
  And プロセスが正常終了する
  And セッション状態が"completed"になる
  And リソースがクリーンアップされる
```

**検証方法**: 自動テスト（統合テスト）

### AC-010-02: プロセスがSIGTERMに応答しない場合

```gherkin
Given セッションが"running"状態である
  And プロセスがSIGTERMに応答しない
  And graceful shutdownタイムアウトが5秒に設定されている
When セッション終了APIを呼び出す
Then SIGTERMが送信される
  And 5秒後にSIGKILLが送信される
  And プロセスが強制終了される
  And セッション状態が"terminated"になる
```

**検証方法**: 自動テスト（統合テスト、ハングプロセスモック）

### AC-010-03: アプリケーション終了時のクリーンアップ

```gherkin
Given 5つのセッションが実行中である
When Electronアプリケーションが終了する（app.quit()）
Then 全セッションにSIGTERMが送信される
  And 全プロセスが終了される
  And ゾンビプロセスが残らない
```

**検証方法**: 自動テスト（E2Eテスト、プロセス監視）

---

## 11. パフォーマンス要件（NFR-001）

### AC-NFR-001-01: CLIプロセス起動時間

```gherkin
Given CLIが正常にインストールされている
When CLIプロセス起動APIを100回呼び出す
Then 平均起動時間が500ms未満である
  And 95パーセンタイルが1000ms未満である
```

**検証方法**: 自動テスト（パフォーマンステスト）

### AC-NFR-001-02: スキル一覧取得時間

```gherkin
Given ".claude/skills/"に200個のスキルが存在する
When スキル一覧取得APIを呼び出す
Then 取得時間が1000ms未満である
  And メタデータのパースが正確である
```

**検証方法**: 自動テスト（パフォーマンステスト）

---

## 12. セキュリティ要件（NFR-003）

### AC-NFR-003-01: パストラバーサル攻撃防止

```gherkin
Given スキル名に"../../../etc/passwd"が含まれている
When スキル実行APIを呼び出す
Then エラーが発生する
  And エラーコードが"PATH_TRAVERSAL_DETECTED"である
  And スキルは実行されない
```

**検証方法**: 自動テスト（セキュリティテスト）

### AC-NFR-003-02: IPC sender検証

```gherkin
Given DevToolsからIPC呼び出しが行われる
When ipcMainハンドラーがリクエストを受信する
Then sender検証が実行される
  And DevToolsからの呼び出しは拒否される
  And セキュリティ警告がログに記録される
```

**検証方法**: 自動テスト（セキュリティテスト）

### AC-NFR-003-03: コマンドインジェクション防止

```gherkin
Given スキル引数に"; rm -rf /"が含まれている
When スキル実行APIを呼び出す
Then 引数が適切にエスケープされる
  And 不正なコマンドは実行されない
  And スキルは正常に実行される（または拒否される）
```

**検証方法**: 自動テスト（セキュリティテスト）

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-17 | 1.0.0      | 初版作成 |
