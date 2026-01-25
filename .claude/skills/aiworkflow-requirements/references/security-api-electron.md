# APIセキュリティ・Electronセキュリティ

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [security-implementation.md](./security-implementation.md)

## API セキュリティ

### 認証・認可フロー

**APIエンドポイント分類**:

| 分類     | 認証要件     | 例                             |
| -------- | ------------ | ------------------------------ |
| 公開     | 不要         | ヘルスチェック、公開情報取得   |
| 認証必須 | ログイン済み | ユーザー情報、ワークフロー操作 |
| 管理者   | 管理者権限   | システム設定、ユーザー管理     |
| 内部     | Agent認証    | Local Agent通信                |

**認証チェックの実装場所**:

- Next.js Middlewareでルート全体の認証チェック
- API Routeハンドラーでの詳細な認可チェック
- データアクセス層でのオーナーシップ検証

### レート制限

| エンドポイント種別   | 制限値        | 単位           |
| -------------------- | ------------- | -------------- |
| 一般API              | 100リクエスト | 1分間/IP       |
| 認証API              | 10リクエスト  | 1分間/IP       |
| AI処理API            | 10リクエスト  | 1分間/ユーザー |
| ファイルアップロード | 5リクエスト   | 1分間/ユーザー |

**実装方針**:

- メモリベースのレート制限（Redis不要で開始可能）
- 429ステータスコードと Retry-After ヘッダーの返却
- レート超過のログ記録

### CORS設定

| 環境 | 許可オリジン                   |
| ---- | ------------------------------ |
| 開発 | localhost:3000, localhost:3001 |
| 本番 | 本番ドメインのみ               |

---

## 依存関係セキュリティ

### 脆弱性管理

| ツール     | 用途                 | 実行タイミング     |
| ---------- | -------------------- | ------------------ |
| pnpm audit | 依存関係の脆弱性検出 | CI/CD、週次        |
| Dependabot | 自動PR作成           | 常時（GitHub設定） |
| Snyk       | 詳細な脆弱性分析     | 任意（無料枠あり） |

**対応フロー**:

1. 脆弱性検出時は重大度を確認する
2. Critical/Highは即時対応（24時間以内）
3. Mediumは次回リリースまでに対応
4. Lowは定期メンテナンスで対応

### lock ファイルの管理

- pnpm-lock.yamlは必ずコミットする
- lock ファイルの手動編集は禁止
- CI/CDでは`pnpm install --frozen-lockfile`を使用

---

## Electron セキュリティ

### セキュリティ設定

**BrowserWindow設定の必須項目**:

| 設定                        | 推奨値 | 理由                               |
| --------------------------- | ------ | ---------------------------------- |
| nodeIntegration             | false  | Rendererからのシステムアクセス防止 |
| contextIsolation            | true   | preloadスクリプトの分離            |
| sandbox                     | true   | Chromiumサンドボックスの有効化     |
| webSecurity                 | true   | Same-Originポリシーの強制          |
| allowRunningInsecureContent | false  | HTTP上のコンテンツ実行防止         |

### Content Security Policy (CSP)

**実装場所**: `apps/desktop/src/main/infrastructure/security/csp.ts`

| 環境 | script-src                           | unsafe-eval | 用途               |
| ---- | ------------------------------------ | ----------- | ------------------ |
| 本番 | 'self'                               | 禁止        | 厳格なセキュリティ |
| 開発 | 'self' 'unsafe-inline' 'unsafe-eval' | 許可        | HMR対応            |

**共通設定**:

- `object-src 'none'`: プラグイン無効化
- `frame-ancestors 'none'`: クリックジャッキング対策
- `upgrade-insecure-requests`: HTTP→HTTPS自動変換

### IPC通信のセキュリティ

**preloadスクリプトでのAPI公開**:

- contextBridgeを使用して限定的なAPIのみ公開する
- チャンネル名はホワイトリストで管理する
- 引数のバリデーションをMain側で実施する
- センシティブな操作にはユーザー確認ダイアログを表示する

**IPC sender検証**:

**実装場所**: `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`

1. webContentsに対応するBrowserWindowの存在確認
2. DevToolsからの呼び出し検出・拒否
3. 許可されたウィンドウリストとの照合

**禁止事項**:

- ipcRenderer全体の公開
- nodeモジュールの直接公開
- ファイルシステムへの無制限アクセス
- シェルコマンドの無制限実行

### 実装例: historyAPI

**実装場所**:

- チャンネル定義: `apps/desktop/src/main/infrastructure/ipc/channels.ts`
- preload: `apps/desktop/src/preload/index.ts`
- 型定義: `apps/desktop/src/renderer/components/history/types.ts`

**チャンネルホワイトリスト方式**:

```typescript
// apps/desktop/src/main/infrastructure/ipc/channels.ts
export const HISTORY_CHANNELS = {
  GET_FILE_HISTORY: "history:getFileHistory",
  GET_VERSION_DETAIL: "history:getVersionDetail",
  GET_CONVERSION_LOGS: "history:getConversionLogs",
  RESTORE_VERSION: "history:restoreVersion",
} as const;
```

**safeInvoke ラッパーによる安全な呼び出し**:

```typescript
// apps/desktop/src/preload/index.ts
const createSafeInvoke = <T>(channel: string) => {
  return (...args: unknown[]): Promise<T> => {
    return ipcRenderer.invoke(channel, ...args);
  };
};

contextBridge.exposeInMainWorld("historyAPI", {
  getFileHistory: createSafeInvoke<Result<PaginatedResult<VersionHistoryItem>>>(
    HISTORY_CHANNELS.GET_FILE_HISTORY,
  ),
  getVersionDetail: createSafeInvoke<Result<VersionDetail>>(
    HISTORY_CHANNELS.GET_VERSION_DETAIL,
  ),
  getConversionLogs: createSafeInvoke<Result<PaginatedResult<ConversionLog>>>(
    HISTORY_CHANNELS.GET_CONVERSION_LOGS,
  ),
  restoreVersion: createSafeInvoke<Result<VersionHistoryItem>>(
    HISTORY_CHANNELS.RESTORE_VERSION,
  ),
});
```

**IPCセキュリティ要件**:

| 要件               | 実装                         | 確認方法                 |
| ------------------ | ---------------------------- | ------------------------ |
| ホワイトリスト     | `HISTORY_CHANNELS`定数で管理 | 定義外チャンネルはエラー |
| 型安全性           | Result<T>型で統一            | TypeScript型チェック     |
| サンドボックス分離 | contextBridgeで公開          | contextIsolation=true    |
| 引数検証           | Main側ハンドラーで実施       | バリデーションテスト     |

**関連タスク**: history-preload-setup（2026-01-13完了）

### 実装例: slideSettingsAPI

**実装場所**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- preload: `apps/desktop/src/preload/index.ts`
- Store: `apps/desktop/src/main/settings/slideSettingsStore.ts`
- ハンドラー: `apps/desktop/src/main/ipc/slideSettingsHandlers.ts`

**チャンネルホワイトリスト方式**:

```typescript
// apps/desktop/src/preload/channels.ts
export const SLIDE_SETTINGS_CHANNELS = {
  GET_DIRECTORY: "slideSettings:getDirectory",
  SET_DIRECTORY: "slideSettings:setDirectory",
  SELECT_DIRECTORY: "slideSettings:selectDirectory",
  VALIDATE_DIRECTORY: "slideSettings:validateDirectory",
  GET_ALL: "slideSettings:getAll",
} as const;
```

**パストラバーサル防止の実装**:

```typescript
// apps/desktop/src/main/settings/slideSettingsStore.ts
const TRAVERSAL_PATTERNS = ["..", "%2e%2e", "%2e.", ".%2e", "..%c0%af", "\0"];

function detectPathTraversal(inputPath: string): boolean {
  const normalized = inputPath.normalize("NFC");
  const decoded = decodeURIComponent(normalized);
  return TRAVERSAL_PATTERNS.some(
    (pattern) => decoded.includes(pattern) || normalized.includes(pattern),
  );
}
```

**IPCセキュリティ要件**:

| 要件             | 実装                          | 確認方法                 |
| ---------------- | ----------------------------- | ------------------------ |
| ホワイトリスト   | `SLIDE_SETTINGS_CHANNELS`定数 | 定義外チャンネルはエラー |
| sender検証       | `validateIpcSender()`         | DevTools/外部からの拒否  |
| パストラバーサル | `detectPathTraversal()`       | 32テストケースで検証     |
| 書き込み権限     | `fs.accessSync(W_OK)`         | 権限なしパスでエラー     |
| Unicode正規化    | `normalize("NFC")`            | Unicode攻撃パターン検出  |

**テストカバレッジ**: 156テスト（94.30% Line Coverage）

**関連タスク**: slide-directory-settings（2026-01-14完了）

### スキル管理セキュリティ

**実装場所**: `apps/desktop/src/main/services/skill/SkillScanner.ts`

スキル管理機能では、ファイルシステムアクセスに関する追加のセキュリティ対策を実装する。

**パストラバーサル防止**:

| チェック項目       | 実装                                  | エラーコード            |
| ------------------ | ------------------------------------- | ----------------------- |
| パス正規化         | `path.normalize()` + `path.resolve()` | -                       |
| ベースパス検証     | `startsWith(basePath)`                | PATH_TRAVERSAL_DETECTED |
| `../` パターン検出 | 相対パスの上位参照を拒否              | PATH_TRAVERSAL_DETECTED |

```typescript
// 実装パターン
private validatePath(targetPath: string): void {
  const normalized = path.normalize(targetPath);
  const resolved = path.resolve(this.basePath, normalized);

  if (!resolved.startsWith(this.basePath)) {
    throw new Error("PATH_TRAVERSAL_DETECTED");
  }
}
```

**シンボリックリンク検証**:

| チェック項目 | 実装                          | 対応                 |
| ------------ | ----------------------------- | -------------------- |
| リンク検出   | `fs.lstat().isSymbolicLink()` | リンク先を検証       |
| リンク先解決 | `fs.realpath()`               | ベースパス外なら除外 |
| 循環リンク   | 検出時は除外                  | エラーログを出力     |

**IPCチャネル検証**:

全てのスキル管理IPCハンドラは`validateIpcSender`を使用して呼び出し元を検証する。

| チャネル               | 検証項目                          |
| ---------------------- | --------------------------------- |
| `skill:list-available` | sender検証 + パストラバーサル検証 |
| `skill:list-imported`  | sender検証                        |
| `skill:import`         | sender検証 + skillIds検証         |
| `skill:remove`         | sender検証 + skillId検証          |
| `skill:get-detail`     | sender検証 + skillId検証          |

#### スキルインポートIPCチャネル（TASK-4-1）

**実装場所**: `apps/desktop/src/preload/channels.ts`

スキルインポート機能用のIPCチャネル定義（8チャネル）:

```typescript
// Skill import operations (TASK-4-1)
SKILL_LIST: "skill:list",
SKILL_SCAN: "skill:scan",
SKILL_GET_IMPORTED: "skill:getImported",
SKILL_UPDATE: "skill:update",
SKILL_COMPLETE: "skill:complete",
SKILL_ERROR: "skill:error",
SKILL_PERMISSION_REQUEST: "skill:permission:request",
SKILL_PERMISSION_RESPONSE: "skill:permission:response",
```

**ホワイトリスト登録**:

| ホワイトリスト          | 登録チャネル                                                                 |
| ----------------------- | ---------------------------------------------------------------------------- |
| ALLOWED_INVOKE_CHANNELS | `skill:list`, `skill:scan`, `skill:getImported`, `skill:update`, `skill:permission:response` |
| ALLOWED_ON_CHANNELS     | `skill:complete`, `skill:error`, `skill:permission:request`                  |

**チャネル通信方向**:

| チャネル                    | 方向  | 用途                           |
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

**関連タスク**: TASK-4-1 IPCチャネル定義（2026-01-25完了）

### 自動更新のセキュリティ

| 項目         | 要件                         |
| ------------ | ---------------------------- |
| 更新ソース   | HTTPS経由のみ                |
| 署名検証     | コード署名の検証必須         |
| ロールバック | 失敗時の自動ロールバック機能 |
| 通知         | 更新内容のユーザーへの明示   |

---

### Claude Code CLI連携セキュリティ

**実装場所**: `apps/desktop/src/main/claude-cli/`

Claude Code CLI連携機能では、外部プロセス実行に関する追加のセキュリティ対策を実装する。

**コマンドインジェクション防止**:

| チェック項目       | 実装                                 | 対応                 |
| ------------------ | ------------------------------------ | -------------------- |
| シェル経由実行禁止 | `spawn(cmd, args, { shell: false })` | インジェクション防止 |
| 引数の直接渡し     | 配列形式で引数渡し                   | 文字列連結回避       |
| 環境変数の制限     | 必要な変数のみ渡す                   | 情報漏洩防止         |

```typescript
// 安全な実装パターン
spawn("node", [scriptPath, "--arg", value], {
  shell: false, // シェル経由実行を禁止
  cwd: workingDir,
  env: filteredEnv, // 必要な環境変数のみ
});
```

**パストラバーサル防止（SkillScanner）**:

| チェック項目       | 実装                                  | エラーコード            |
| ------------------ | ------------------------------------- | ----------------------- |
| パス正規化         | `path.normalize()` + `path.resolve()` | -                       |
| ベースパス検証     | `startsWith(basePath)`                | PATH_TRAVERSAL_DETECTED |
| `../` パターン検出 | 相対パスの上位参照を拒否              | PATH_TRAVERSAL_DETECTED |
| スクリプトパス検証 | スキルディレクトリ内に限定            | INVALID_SCRIPT_PATH     |

```typescript
// スキルパス検証パターン
function validateSkillPath(skillPath: string, basePath: string): void {
  const normalized = path.normalize(skillPath);
  const resolved = path.resolve(basePath, normalized);

  if (!resolved.startsWith(basePath) || skillPath.includes("..")) {
    throw new Error("Invalid skill path");
  }
}
```

**IPC sender検証**:

全てのClaude CLI IPCハンドラは`validateIpcSender`を使用して呼び出し元を検証する。

| チャネル                        | 検証項目                        |
| ------------------------------- | ------------------------------- |
| `claude-cli:check-installation` | sender検証                      |
| `claude-cli:list-skills`        | sender検証 + リクエストZod検証  |
| `claude-cli:get-skill-detail`   | sender検証 + skillName検証      |
| `claude-cli:execute-script`     | sender検証 + パス検証 + Zod検証 |
| `claude-cli:terminate-session`  | sender検証 + sessionId検証      |
| `claude-cli:list-sessions`      | sender検証                      |
| `claude-cli:get-session`        | sender検証 + sessionId検証      |

**Zodスキーマによる入力検証**:

```typescript
// 実行リクエストのZodスキーマ
const executeScriptRequestSchema = z.object({
  skillName: z.string().min(1).max(100),
  scriptName: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+$/),
  args: z.array(z.string().max(1000)).max(50).optional(),
  cwd: z.string().max(500).optional(),
  timeoutMs: z.number().positive().max(3600000).optional(),
});
```

**リソース制限**:

| 項目                   | 制限値   | 説明                       |
| ---------------------- | -------- | -------------------------- |
| 最大同時セッション数   | 10       | DoS防止                    |
| デフォルトタイムアウト | 30分     | プロセスハング防止         |
| 出力バッファ最大サイズ | 100MB    | メモリ枯渇防止             |
| 最大引数数             | 50       | コマンドライン長制限       |
| 引数最大長             | 1000文字 | バッファオーバーフロー防止 |

**プロセス終了保証**:

| 状況                 | 対応                               |
| -------------------- | ---------------------------------- |
| 正常終了             | exitコードを記録                   |
| タイムアウト         | SIGTERM送信 → 3秒待機 → SIGKILL    |
| 明示的終了要求       | SIGTERM送信 → graceful/force選択可 |
| アプリケーション終了 | 全子プロセスを確実に終了           |

**セキュリティテストカバレッジ**: 240テスト中25テストがセキュリティ関連

**関連タスク**: claude-code-cli-integration（2026-01-17完了）

---

### Claude CLI Renderer API セキュリティ（Preload）

**実装場所**: `apps/desktop/src/preload/index.ts`

Renderer ProcessからClaude CLI機能にアクセスするためのPreload APIにおけるセキュリティ実装。

**ホワイトリストパターン**:

すべてのIPC呼び出しは`safeInvoke`/`safeOn`関数でラップされ、ホワイトリスト検証を行う。

| 機能                     | 実装                            | 効果                   |
| ------------------------ | ------------------------------- | ---------------------- |
| チャンネルホワイトリスト | `ALLOWED_INVOKE_CHANNELS`配列   | 未許可チャンネルを拒否 |
| イベントホワイトリスト   | `ALLOWED_ON_CHANNELS`配列       | 未許可イベントを拒否   |
| contextBridge            | `exposeInMainWorld`             | window直接割り当て禁止 |
| 型安全性                 | TypeScript + ClaudeCliResult<T> | 型チェックによる安全性 |

**safeInvokeセキュリティチェック**:

```typescript
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

| チェック項目       | 実装                                 | エラー時の挙動 |
| ------------------ | ------------------------------------ | -------------- |
| チャンネル存在確認 | `ALLOWED_INVOKE_CHANNELS.includes()` | Promise.reject |
| エラーメッセージ   | チャンネル名を含む                   | デバッグ可能   |
| 型安全性           | ジェネリクス<T>使用                  | 戻り値型保証   |

**safeOnセキュリティチェック**:

```typescript
function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }
  const handler = (_event: IpcRendererEvent, data: T) => callback(data);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}
```

| チェック項目         | 実装                             | エラー時の挙動             |
| -------------------- | -------------------------------- | -------------------------- |
| チャンネル存在確認   | `ALLOWED_ON_CHANNELS.includes()` | console.error + no-op      |
| メモリリーク防止     | unsubscribe関数返却              | リスナー解除可能           |
| 安全なフォールバック | 空関数返却                       | エラー時もクラッシュしない |

**IPCチャンネルセキュリティ**:

| チャンネル                      | 検証項目                   |
| ------------------------------- | -------------------------- |
| `claude-cli:check-installation` | ホワイトリスト検証         |
| `claude-cli:list-skills`        | ホワイトリスト検証         |
| `claude-cli:get-skill-detail`   | ホワイトリスト検証         |
| `claude-cli:execute-script`     | ホワイトリスト検証         |
| `claude-cli:terminate-session`  | ホワイトリスト検証         |
| `claude-cli:list-sessions`      | ホワイトリスト検証         |
| `claude-cli:get-session`        | ホワイトリスト検証         |
| `claude-cli:session-output`     | イベントホワイトリスト検証 |
| `claude-cli:session-status`     | イベントホワイトリスト検証 |

**テストカバレッジ**:

| テストカテゴリ         | テスト数 | セキュリティ関連 |
| ---------------------- | -------- | ---------------- |
| safeInvokeセキュリティ | 7        | ✅               |
| safeOnセキュリティ     | 2        | ✅               |
| ホワイトリスト登録     | 9        | ✅               |
| セキュリティテスト     | 4        | ✅               |
| **合計**               | **22**   | ✅               |

**関連タスク**: claude-cli-renderer-api（2026-01-17完了）

---

### Skill Execution Preload API セキュリティ

**実装場所**: `apps/desktop/src/preload/skill-api.ts`

Renderer ProcessからSkillExecutor機能にアクセスするためのPreload APIにおけるセキュリティ実装。

**ホワイトリストパターン**:

Claude CLI Renderer APIと同様に、すべてのIPC呼び出しは`safeInvoke`/`safeOn`関数でラップされ、ホワイトリスト検証を行う。

| 機能                     | 実装                            | 効果                   |
| ------------------------ | ------------------------------- | ---------------------- |
| チャンネルホワイトリスト | `SKILL_INVOKE_CHANNELS`配列     | 未許可チャンネルを拒否 |
| イベントホワイトリスト   | `SKILL_ON_CHANNELS`配列         | 未許可イベントを拒否   |
| contextBridge            | `exposeInMainWorld('skillApi')` | window直接割り当て禁止 |
| 型安全性                 | TypeScript + SkillStreamChunk型 | 型チェックによる安全性 |

**IPCチャンネルセキュリティ**:

| チャンネル                  | 方向            | 検証項目                                   |
| --------------------------- | --------------- | ------------------------------------------ |
| `skill:execute`             | Renderer → Main | ホワイトリスト検証、スキル名検証           |
| `skill:abort`               | Renderer → Main | ホワイトリスト検証、セッションID検証       |
| `skill:get-status`          | Renderer → Main | ホワイトリスト検証、セッションID検証       |
| `skill:stream`              | Main → Renderer | イベントホワイトリスト検証、chunk型検証    |
| `skill:permission:request`  | Main → Renderer | ALLOWED_ON_CHANNELS検証（TASK-3-1-D）      |
| `skill:permission:response` | Renderer → Main | ALLOWED_INVOKE_CHANNELS検証、requestId検証 |

**スキル実行セキュリティレイヤー**:

| レイヤー      | 検証内容                           | 実装箇所                 |
| ------------- | ---------------------------------- | ------------------------ |
| Preload API   | チャンネルホワイトリスト           | skill-api.ts             |
| Main Process  | スキル存在確認、実行権限           | skill-ipc-handler.ts     |
| SkillExecutor | 危険パターン、禁止パス、許可ツール | security-skill-execution |

**ストリーミングセキュリティ**:

```typescript
// skill:stream イベントの型検証
interface SkillStreamChunk {
  sessionId: string;
  type: "output" | "status" | "error" | "complete";
  data: unknown;
  timestamp: number;
}
```

| チェック項目       | 実装                     | エラー時の挙動    |
| ------------------ | ------------------------ | ----------------- |
| セッションID検証   | UUIDv4形式チェック       | ストリームを無視  |
| チャンク型検証     | type属性の列挙値チェック | unknownとして処理 |
| タイムスタンプ検証 | 数値型チェック           | 現在時刻を使用    |

**React Hook セキュリティ統合**:

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

**テストカバレッジ**:

| テストカテゴリ                | テスト数 | セキュリティ関連 |
| ----------------------------- | -------- | ---------------- |
| Preload API単体テスト         | 37       | ✅               |
| useSkillExecution Hook        | 38       | ✅               |
| useSkillPermission Hook       | 17       | ✅               |
| SkillStreamDisplay            | 40       | ✅               |
| SkillStreamDisplay Permission | 37       | ✅               |
| 統合テスト                    | 23       | ✅               |
| **合計**                      | **192**  | ✅               |

**関連タスク**:

- TASK-3-2 SkillExecutor IPC Handler Integration（2026-01-25完了）
- TASK-3-1-D Permission Dialog UI実装（2026-01-26完了）

---

### Permission IPC Handler セキュリティ

**実装場所**: `apps/desktop/src/main/ipc/permission-handlers.ts`

PermissionResolverとRenderer Processの権限確認ダイアログを連携するIPCハンドラーにおけるセキュリティ実装。

**IPCチャンネルセキュリティ**:

| チャンネル                  | 方向            | 検証項目                           |
| --------------------------- | --------------- | ---------------------------------- |
| `skill:permission-request`  | Main → Renderer | ウィンドウ破棄確認、チャンネル登録 |
| `skill:permission-response` | Renderer → Main | sender検証、ホワイトリスト、型検証 |

**IPC sender検証**:

```typescript
// apps/desktop/src/main/ipc/permission-handlers.ts
ipcMain.handle(
  SKILL_PERMISSION_RESPONSE,
  async (event, response: SkillPermissionResponse) => {
    // sender検証: メインウィンドウからのリクエストのみ受付
    if (event.sender !== mainWindow.webContents) {
      console.warn("[Permission] IPC request from unknown sender, ignoring...");
      return { success: false };
    }
    // 処理続行...
  },
);
```

| チェック項目   | 実装                                      | エラー時の挙動            |
| -------------- | ----------------------------------------- | ------------------------- |
| sender一致確認 | `event.sender === mainWindow.webContents` | `{ success: false }` 返却 |
| requestId検証  | `typeof response.requestId === 'string'`  | 無効なリクエスト無視      |
| approved検証   | `typeof response.approved === 'boolean'`  | 無効なリクエスト無視      |

**ホワイトリスト登録**:

```typescript
// apps/desktop/src/preload/channels.ts

// Renderer → Main (invoke)
export const ALLOWED_INVOKE_CHANNELS = [
  // ... 他のチャンネル
  SKILL_PERMISSION_RESPONSE, // "skill:permission-response"
];

// Main → Renderer (on)
export const ALLOWED_ON_CHANNELS = [
  // ... 他のチャンネル
  SKILL_PERMISSION_REQUEST, // "skill:permission-request"
];
```

**Preload API セキュリティ**:

| 機能            | 実装                                      | 効果                   |
| --------------- | ----------------------------------------- | ---------------------- |
| safeInvoke      | ホワイトリスト検証                        | 未許可チャンネルを拒否 |
| safeOn          | イベントホワイトリスト検証                | 未許可イベントを拒否   |
| unsubscribe関数 | リスナー解除関数返却                      | メモリリーク防止       |
| contextBridge   | `exposeInMainWorld('skillPermissionAPI')` | window直接割り当て禁止 |

**UIセキュリティ（XSS防止）**:

| 対策項目        | 実装                        | 効果               |
| --------------- | --------------------------- | ------------------ |
| textContent使用 | `<span>{toolName}</span>`   | HTML注入防止       |
| innerHTML不使用 | dangerouslySetInnerHTML禁止 | スクリプト注入防止 |
| 入力検証        | ツール名・理由の型チェック  | 不正データ表示防止 |

**テストカバレッジ**:

| テストカテゴリ           | テスト数 | セキュリティ関連 |
| ------------------------ | -------- | ---------------- |
| permission-handlers単体  | 15       | ✅               |
| skill-api.permission単体 | 12       | ✅               |
| usePermissionDialog Hook | 21       | ✅               |
| PermissionDialog UI      | 25       | ✅               |
| 統合テスト               | 20       | ✅               |
| **合計**                 | **93**   | ✅               |

**関連タスク**: TASK-4-2 PermissionResolver IPC Handlers（2026-01-26完了）

---

## 関連ドキュメント

- [セキュリティ実装概要](./security-implementation.md)
- [入力バリデーション](./security-input-validation.md)
- [デプロイメント](./deployment.md)
- [TASK-4-1 IPCチャネル定義 実装ガイド](../../../docs/30-workflows/TASK-4-1-ipc-channels/outputs/phase-12/implementation-guide.md)

---

## 完了タスク

### TASK-4-1（2026-01-25完了）

- スキルインポート機能用IPCチャネル定義（8チャネル）
- ホワイトリスト登録（ALLOWED_INVOKE_CHANNELS: 5件、ALLOWED_ON_CHANNELS: 3件）
- 型安全性確保（as const、IpcChannel型）
- テスト60件作成（全件PASS）

---

## 変更履歴

| バージョン | 日付       | 変更内容                                              |
| ---------- | ---------- | ----------------------------------------------------- |
| 1.6.0      | 2026-01-25 | TASK-4-1完了: スキルインポートIPCチャネル8件追加      |
| 1.5.0      | 2026-01-25 | TASK-3-2完了: Skill Execution Preload APIセキュリティ |
| 1.4.0      | 2026-01-17 | Claude CLI Renderer APIセキュリティ追加               |
| 1.3.0      | 2026-01-17 | Claude Code CLI連携セキュリティ追加                   |
| 1.2.0      | 2026-01-14 | slideSettingsAPI実装例追加                            |
| 1.1.0      | 2026-01-13 | historyAPI実装例追加                                  |
| 1.0.0      | 2026-01-01 | 初版作成                                              |
