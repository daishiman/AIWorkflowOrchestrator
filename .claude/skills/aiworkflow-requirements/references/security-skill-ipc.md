# スキル実行IPCセキュリティ

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [security-api-electron.md](./security-api-electron.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                     |
| ---------- | ---------- | -------------------------------------------- |
| v1.0.0     | 2026-01-25 | 初版作成                                     |
| v1.1.0     | 2026-01-26 | コードブロックを表形式・文章に変換（ガイドライン準拠） |

---

## スキル管理IPCセキュリティ

**実装場所**: `apps/desktop/src/main/services/skill/SkillScanner.ts`

スキル管理機能では、ファイルシステムアクセスに関する追加のセキュリティ対策を実装する。

### パストラバーサル防止

| チェック項目       | 実装                                  | エラーコード            |
| ------------------ | ------------------------------------- | ----------------------- |
| パス正規化         | `path.normalize()` + `path.resolve()` | -                       |
| ベースパス検証     | `startsWith(basePath)`                | PATH_TRAVERSAL_DETECTED |
| `../` パターン検出 | 相対パスの上位参照を拒否              | PATH_TRAVERSAL_DETECTED |

**validatePath処理フロー**:

| ステップ | 処理内容               | 使用API                       | 説明                           |
| -------- | ---------------------- | ----------------------------- | ------------------------------ |
| 1        | パス正規化             | `path.normalize(targetPath)`  | 冗長な区切りや`.`を正規化      |
| 2        | 絶対パス変換           | `path.resolve(basePath, ...)` | ベースパス基準で絶対パスに変換 |
| 3        | ベースパス検証         | `resolved.startsWith(basePath)` | 解決後パスがベースパス配下か確認 |
| 4        | 違反時はエラースロー   | Error("PATH_TRAVERSAL_DETECTED") | パストラバーサル検出時に例外発生 |

この検証ロジックにより、`../`を含む相対パスや絶対パスでのベースパス外アクセスを防止する。

### シンボリックリンク検証

| チェック項目 | 実装                          | 対応                 |
| ------------ | ----------------------------- | -------------------- |
| リンク検出   | `fs.lstat().isSymbolicLink()` | リンク先を検証       |
| リンク先解決 | `fs.realpath()`               | ベースパス外なら除外 |
| 循環リンク   | 検出時は除外                  | エラーログを出力     |

### IPCチャネル検証

全てのスキル管理IPCハンドラは`validateIpcSender`を使用して呼び出し元を検証する。

| チャネル               | 検証項目                          |
| ---------------------- | --------------------------------- |
| `skill:list-available` | sender検証 + パストラバーサル検証 |
| `skill:list-imported`  | sender検証                        |
| `skill:import`         | sender検証 + skillIds検証         |
| `skill:remove`         | sender検証 + skillId検証          |
| `skill:get-detail`     | sender検証 + skillId検証          |

---

## スキルインポートIPCチャネル（TASK-4-1）

**実装場所**: `apps/desktop/src/preload/channels.ts`

スキルインポート機能用のIPCチャネル定義（8チャネル）:

**チャネル定数一覧**:

| 定数名                   | チャネル文字列               | 用途                     |
| ------------------------ | ---------------------------- | ------------------------ |
| SKILL_LIST               | skill:list                   | スキル一覧取得           |
| SKILL_SCAN               | skill:scan                   | ディレクトリスキャン     |
| SKILL_GET_IMPORTED       | skill:getImported            | インポート済み取得       |
| SKILL_UPDATE             | skill:update                 | 設定更新                 |
| SKILL_COMPLETE           | skill:complete               | 実行完了イベント         |
| SKILL_ERROR              | skill:error                  | エラーイベント           |
| SKILL_PERMISSION_REQUEST | skill:permission:request     | 権限リクエスト（Main起点）|
| SKILL_PERMISSION_RESPONSE| skill:permission:response    | 権限レスポンス（Renderer応答）|

**ホワイトリスト登録**:

| ホワイトリスト          | 登録チャネル                                                                 |
| ----------------------- | ---------------------------------------------------------------------------- |
| ALLOWED_INVOKE_CHANNELS | `skill:list`, `skill:scan`, `skill:getImported`, `skill:update`, `skill:permission:response` |
| ALLOWED_ON_CHANNELS     | `skill:complete`, `skill:error`, `skill:permission:request`                  |

**チャネル通信方向**:

| チャンネル                  | 方向  | 用途                           |
| --------------------------- | ----- | ------------------------------ |
| `skill:list`                | R→M   | 利用可能なスキル一覧取得       |
| `skill:scan`                | R→M   | スキルディレクトリスキャン     |
| `skill:getImported`         | R→M   | インポート済みスキル一覧取得   |
| `skill:update`              | R→M   | スキル設定更新                 |
| `skill:complete`            | M→R   | スキル実行完了イベント         |
| `skill:error`               | M→R   | スキルエラーイベント           |
| `skill:permission:request`  | M→R   | 権限リクエスト（Main起点）     |
| `skill:permission:response` | R→M   | 権限レスポンス（Renderer応答） |

**テストカバレッジ**: 60テスト（channels.skill-import.test.ts）

---

## Claude Code CLI連携セキュリティ

**実装場所**: `apps/desktop/src/main/claude-cli/`

### コマンドインジェクション防止

| チェック項目       | 実装                                 | 対応                 |
| ------------------ | ------------------------------------ | -------------------- |
| シェル経由実行禁止 | `spawn(cmd, args, { shell: false })` | インジェクション防止 |
| 引数の直接渡し     | 配列形式で引数渡し                   | 文字列連結回避       |
| 環境変数の制限     | 必要な変数のみ渡す                   | 情報漏洩防止         |

**spawn実行時のセキュリティオプション**:

| オプション | 設定値        | 効果                               |
| ---------- | ------------- | ---------------------------------- |
| shell      | false（必須） | シェル経由実行を禁止し、インジェクション防止 |
| cwd        | workingDir    | 作業ディレクトリを明示的に指定     |
| env        | filteredEnv   | 必要な環境変数のみに制限し情報漏洩防止 |

引数は配列形式（例: `["scriptPath", "--arg", "value"]`）で渡し、文字列連結によるインジェクションリスクを排除する。

### Zodスキーマによる入力検証

スクリプト実行リクエストの入力検証スキーマを以下の制約で定義する。

**executeScriptRequestスキーマ**:

| フィールド | 型              | 制約                                       | 必須 |
| ---------- | --------------- | ------------------------------------------ | ---- |
| skillName  | string          | 最小1文字、最大100文字                     | Yes  |
| scriptName | string          | 最小1文字、最大100文字、英数字と`_.-`のみ  | Yes  |
| args       | array of string | 各要素最大1000文字、配列最大50要素         | No   |
| cwd        | string          | 最大500文字                                | No   |
| timeoutMs  | number          | 正の数、最大3,600,000（1時間）             | No   |

scriptNameには正規表現`^[a-zA-Z0-9_.-]+$`を適用し、パストラバーサルやコマンドインジェクションに使用される特殊文字を拒否する。

### リソース制限

| 項目                   | 制限値   | 説明                       |
| ---------------------- | -------- | -------------------------- |
| 最大同時セッション数   | 10       | DoS防止                    |
| デフォルトタイムアウト | 30分     | プロセスハング防止         |
| 出力バッファ最大サイズ | 100MB    | メモリ枯渇防止             |
| 最大引数数             | 50       | コマンドライン長制限       |
| 引数最大長             | 1000文字 | バッファオーバーフロー防止 |

### プロセス終了保証

| 状況                 | 対応                               |
| -------------------- | ---------------------------------- |
| 正常終了             | exitコードを記録                   |
| タイムアウト         | SIGTERM送信 → 3秒待機 → SIGKILL    |
| 明示的終了要求       | SIGTERM送信 → graceful/force選択可 |
| アプリケーション終了 | 全子プロセスを確実に終了           |

**セキュリティテストカバレッジ**: 240テスト中25テストがセキュリティ関連

---

## Skill Execution Preload API セキュリティ

**実装場所**: `apps/desktop/src/preload/skill-api.ts`

### ホワイトリストパターン

| 機能                     | 実装                            | 効果                   |
| ------------------------ | ------------------------------- | ---------------------- |
| チャンネルホワイトリスト | `SKILL_INVOKE_CHANNELS`配列     | 未許可チャンネルを拒否 |
| イベントホワイトリスト   | `SKILL_ON_CHANNELS`配列         | 未許可イベントを拒否   |
| contextBridge            | `exposeInMainWorld('skillApi')` | window直接割り当て禁止 |
| 型安全性                 | TypeScript + SkillStreamChunk型 | 型チェックによる安全性 |

### スキル実行セキュリティレイヤー

| レイヤー      | 検証内容                           | 実装箇所             |
| ------------- | ---------------------------------- | -------------------- |
| Preload API   | チャンネルホワイトリスト           | skill-api.ts         |
| Main Process  | スキル存在確認、実行権限           | skill-ipc-handler.ts |
| SkillExecutor | 危険パターン、禁止パス、許可ツール | security.ts          |

### React Hook セキュリティ統合

`useSkillExecution` Hookは以下のセキュリティ機能を提供:

| 機能               | 実装                         | 効果             |
| ------------------ | ---------------------------- | ---------------- |
| 自動クリーンアップ | useEffect cleanup            | メモリリーク防止 |
| エラーバウンダリ   | try-catch + setError         | UIクラッシュ防止 |
| 中断処理           | AbortController連携          | リソース解放保証 |
| 状態整合性         | useRef + isExecuting状態管理 | 競合状態防止     |

`useSkillPermission` Hook（TASK-3-1-D）は以下のセキュリティ機能を提供:

| 機能               | 実装                         | 効果               |
| ------------------ | ---------------------------- | ------------------ |
| 自動クリーンアップ | useEffect cleanup            | リスナーリーク防止 |
| エラーハンドリング | try-catch + console.error    | IPC失敗時のUI継続  |
| 状態リセット       | respond後にnullリセット      | 二重応答防止       |
| requestId検証      | リクエストとレスポンス紐付け | 不正応答防止       |

**テストカバレッジ**: 192テスト

---

## Permission IPC Handler セキュリティ

**実装場所**: `apps/desktop/src/main/ipc/permission-handlers.ts`

### IPC sender検証

Permission IPC Handlerでは、ipcMain.handleの第1引数eventオブジェクトを使用してsender検証を行う。

**sender検証フロー**:

| ステップ | 処理内容               | 条件                                         | 結果                     |
| -------- | ---------------------- | -------------------------------------------- | ------------------------ |
| 1        | sender取得             | event.sender                                 | 呼び出し元webContents取得|
| 2        | メインウィンドウ比較   | event.sender === mainWindow.webContents      | 一致すれば続行           |
| 3        | 不一致時の処理         | 上記条件がfalse                              | 警告ログ出力、{ success: false }返却 |

この検証により、メインウィンドウ以外（悪意のあるRenderer Process等）からの不正なPermissionレスポンスを拒否する。

| チェック項目   | 実装                                      | エラー時の挙動            |
| -------------- | ----------------------------------------- | ------------------------- |
| sender一致確認 | `event.sender === mainWindow.webContents` | `{ success: false }` 返却 |
| requestId検証  | `typeof response.requestId === 'string'`  | 無効なリクエスト無視      |
| approved検証   | `typeof response.approved === 'boolean'`  | 無効なリクエスト無視      |

### UIセキュリティ（XSS防止）

| 対策項目        | 実装                        | 効果               |
| --------------- | --------------------------- | ------------------ |
| textContent使用 | `<span>{toolName}</span>`   | HTML注入防止       |
| innerHTML不使用 | dangerouslySetInnerHTML禁止 | スクリプト注入防止 |
| 入力検証        | ツール名・理由の型チェック  | 不正データ表示防止 |

**テストカバレッジ**: 93テスト

---

## 完了タスク

| タスク | 完了日 | テスト数 |
|--------|--------|----------|
| TASK-4-1 スキルインポートIPCチャネル | 2026-01-25 | 60 |
| TASK-3-2 SkillExecutor IPC Handler | 2026-01-25 | 192 |
| TASK-3-1-D Permission Dialog UI | 2026-01-26 | 93 |
| claude-code-cli-integration | 2026-01-17 | 240 |

---

## 関連ドキュメント

- [スキル実行セキュリティ定数](./security-skill-execution.md)
- [APIセキュリティ](./security-api.md)
- [Electron IPCセキュリティ](./security-electron-ipc.md)
