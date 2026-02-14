# 実装パターン総合ガイド

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-overview.md](./architecture-overview.md)

---

## 概要

本ドキュメントは、AIWorkflowOrchestratorの各レイヤー（フロントエンド、バックエンド、デスクトップ）における実装パターンを定義する。

---

## フロントエンド実装パターン

### コンポーネント設計パターン

| パターン                | 説明                                                         | 用途                           |
| ----------------------- | ------------------------------------------------------------ | ------------------------------ |
| **Compound Components** | 関連コンポーネントをグループ化し、親子間で暗黙的に状態を共有 | Tabs, Dropdown, Dialog         |
| **Render Props**        | 関数をPropsとして渡し、動的なレンダリング制御を実現          | DataFetcher, Tooltip           |
| **Controlled**          | 状態を親コンポーネントで管理し、Propsで制御                  | 複雑なバリデーション、外部連携 |
| **Uncontrolled**        | 状態をコンポーネント内部で管理し、refで参照                  | シンプルなフォーム             |

### 状態管理パターン

| 状態タイプ         | 管理方法      | 用途例                       |
| ------------------ | ------------- | ---------------------------- |
| UIローカル状態     | useState      | モーダル開閉、フォーム入力値 |
| 複雑なローカル状態 | useReducer    | 多段階フォーム、複合状態     |
| 機能グローバル状態 | Zustand Slice | 認証状態、テーマ設定         |
| サーバー状態       | React Query   | APIレスポンス、キャッシュ    |

#### Zustand Slice設計原則

| 原則         | 説明                                             |
| ------------ | ------------------------------------------------ |
| 単一責任     | 1つのSliceは1つの機能ドメインのみ担当            |
| 型安全性     | StateCreator型を使用し、型推論を活用             |
| 不変更新     | set関数で状態を不変に更新                        |
| セレクタ使用 | 必要な状態のみ選択し、不要な再レンダリングを防止 |

### フォーム実装パターン

| パターン               | ツール          | 説明                                             |
| ---------------------- | --------------- | ------------------------------------------------ |
| スキーマバリデーション | Zod             | フォームスキーマを定義し、型安全なバリデーション |
| フォーム状態管理       | React Hook Form | 非制御コンポーネントベースの効率的なフォーム管理 |
| リゾルバー統合         | zodResolver     | ZodスキーマとReact Hook Formの統合               |

#### バリデーションタイミング

| タイミング | 用途                         | 設定             |
| ---------- | ---------------------------- | ---------------- |
| onChange   | リアルタイムフィードバック   | mode: "onChange" |
| onBlur     | フィールド離脱時検証         | mode: "onBlur"   |
| onSubmit   | 送信時のみ検証（デフォルト） | mode: "onSubmit" |

### データフェッチパターン

| パターン     | 説明                                       | 用途                           |
| ------------ | ------------------------------------------ | ------------------------------ |
| 基本クエリ   | queryKey + queryFnでデータ取得             | 読み取り専用データ             |
| 楽観的更新   | onMutateで即座にUI更新、失敗時ロールバック | 即時フィードバックが必要な操作 |
| 無効化       | invalidateQueriesで関連キャッシュを無効化  | データ更新後の再フェッチ       |
| プリフェッチ | prefetchQueryで事前取得                    | ホバー時の先読み               |

### エラーバウンダリ配置戦略

| 配置レベル         | 用途                         | フォールバック例     |
| ------------------ | ---------------------------- | -------------------- |
| アプリ全体         | グローバルエラーキャッチ     | エラーページ表示     |
| 機能単位           | 機能隔離（チャット、設定等） | 機能別エラーUI       |
| コンポーネント単位 | 特定UIの隔離                 | プレースホルダー表示 |

### forwardRef + useImperativeHandle パターン（TASK-7D）

外部から命令的にコンポーネントのメソッドを呼び出すためのパターン。親コンポーネントがrefを通じて子コンポーネントの特定メソッドのみを呼び出す場合に使用する。

**ユースケース**: ChatPanelの`handleImportRequest`を親コンポーネントから呼び出す

| 要素          | 実装                                                                                 |
| ------------- | ------------------------------------------------------------------------------------ |
| Handle型      | `ChatPanelHandle { handleImportRequest: (skill: SkillMetadata) => void }`            |
| Component宣言 | `forwardRef<ChatPanelHandle, ChatPanelProps>`                                        |
| Handle公開    | `useImperativeHandle(ref, () => ({ handleImportRequest }))`                          |
| displayName   | `ChatPanel.displayName = "ChatPanel"`                                                |
| 使用側        | `const ref = useRef<ChatPanelHandle>(null); ref.current?.handleImportRequest(skill)` |

**Props callbackパターンとの使い分け**:

| 判断基準       | forwardRef + useImperativeHandle              | Props callback                 |
| -------------- | --------------------------------------------- | ------------------------------ |
| 呼び出し方向   | 親 → 子（命令的）                             | 子 → 親（宣言的）              |
| 適用場面       | 親が子のメソッドを直接呼ぶ必要がある場合      | 子のイベントを親に通知する場合 |
| パフォーマンス | 選択的メソッド公開で不要な再レンダー回避      | Props変更時に再レンダー発生    |
| テスト         | `ref.current`経由でFunction Coverage 100%達成 | Props経由で直接テスト可能      |

### React.memo + Exclude型パターン（TASK-7D）

`React.memo`によるメモ化と`Exclude`ユーティリティ型を組み合わせ、表示不要なステータスをコンパイル時に除外するパターン。

**ユースケース**: SkillStreamingViewコンポーネントでステータス"idle"を表示対象から除外する

| 要素        | 実装                                                             |
| ----------- | ---------------------------------------------------------------- |
| メモ化      | `memo(({ skillName, messages, status }) => ...)`                 |
| 型安全除外  | `type DisplayableStatus = Exclude<SkillExecutionStatus, "idle">` |
| 設定マップ  | `Record<DisplayableStatus, { color: string; label: string }>`    |
| displayName | `SkillStreamingView.displayName = "SkillStreamingView"`          |

**メリット**: `Record<DisplayableStatus, ...>`により、新しいステータスが追加された場合にコンパイルエラーで網羅性不足を検出できる。

---

## バックエンド実装パターン

### API設計パターン

#### RESTfulエンドポイント命名規則

| HTTP Method | パス形式       | 用途             |
| ----------- | -------------- | ---------------- |
| GET         | /resources     | コレクション取得 |
| GET         | /resources/:id | 単一リソース取得 |
| POST        | /resources     | 新規作成         |
| PUT         | /resources/:id | 全体更新         |
| PATCH       | /resources/:id | 部分更新         |
| DELETE      | /resources/:id | 削除             |

#### Server Actions設計原則

| 原則                       | 説明                                     |
| -------------------------- | ---------------------------------------- |
| "use server"ディレクティブ | ファイル先頭に配置し、サーバー実行を明示 |
| 入力バリデーション         | Zodスキーマで必ず検証                    |
| キャッシュ無効化           | revalidatePathで関連パスを再検証         |
| エラーハンドリング         | try-catchで適切にエラーを返却            |

### データアクセスパターン

#### Repositoryパターン

| 要素                 | 説明                                     |
| -------------------- | ---------------------------------------- |
| インターフェース定義 | CRUD操作を抽象化したインターフェース     |
| 実装クラス           | Drizzle ORMを使用した具体的な実装        |
| 依存注入             | コンストラクタでDBインスタンスを受け取る |
| テスタビリティ       | インターフェースに対してモックを作成可能 |

#### Unit of Workパターン

| 用途                 | 説明                                    |
| -------------------- | --------------------------------------- |
| トランザクション管理 | 複数の操作を1つのトランザクションで実行 |
| 整合性保証           | 全操作の成功または全ロールバック        |
| 実装方法             | db.transaction()内で全操作を実行        |

### エラーハンドリングパターン

#### Result型パターン

| 状態 | 構造                           | 用途             |
| ---- | ------------------------------ | ---------------- |
| 成功 | `{ success: true, data: T }`   | 正常結果の返却   |
| 失敗 | `{ success: false, error: E }` | エラー情報の返却 |

このパターンでは例外をthrowせず、戻り値で成功/失敗を明示する。

#### カスタムエラークラス階層

| クラス            | 用途           | HTTPステータス |
| ----------------- | -------------- | -------------- |
| ApplicationError  | 基底クラス     | -              |
| ValidationError   | 入力検証エラー | 400/422        |
| NotFoundError     | リソース不存在 | 404            |
| UnauthorizedError | 認可エラー     | 403            |
| InternalError     | 内部エラー     | 500            |

---

## デスクトップ（Electron）実装パターン

### IPC通信パターン

| パターン                   | 方向                    | 用途                 |
| -------------------------- | ----------------------- | -------------------- |
| 単方向（Push）             | Main → Renderer         | 通知、プログレス更新 |
| 双方向（Request/Response） | Renderer ↔ Main         | データ取得、操作実行 |
| ストリーミング             | Main → Renderer（連続） | AI応答、ログ出力     |

#### IPC通信設計原則

| 原則               | 説明                                |
| ------------------ | ----------------------------------- |
| Whitelist方式      | 許可されたチャンネルのみ通信可能    |
| 型安全性           | チャンネル名と引数/戻り値の型を定義 |
| エラーハンドリング | Main側でtry-catch、Result型で返却   |
| セキュリティ       | sender検証、パス検証を実施          |

#### IPCチャンネル統合パターン（TASK-FIX-4-1-IPC-CONSOLIDATION 2026-02-05実装）

既存のIPCチャンネル定義が複数箇所に重複している場合に、Single Source of Truthへ統合するパターン。

**問題**: `preload/channels.ts` と `shared/ipc/channels.ts` に同じチャンネル定義が存在し、変更時に不整合が発生する。

| 課題                     | 問題                                                        | 解決策                                       |
| ------------------------ | ----------------------------------------------------------- | -------------------------------------------- |
| ハードコード文字列の発見 | `"skill:complete" as string` で型チェックをバイパス         | Grepで `as string` パターンを検索し定数に置換 |
| 重複定義の整理           | preload/channels.ts と shared/ipc/channels.ts の重複        | Single Source of Truth（preload側）に集約    |
| ホワイトリスト更新漏れ   | 旧チャンネル名が ALLOWED_INVOKE_CHANNELS に残存             | テストで旧チャンネルが含まれないことを検証   |

**Single Source of Truth パターン**:

| ステップ | 処理内容                               | 成果物                                      |
| -------- | -------------------------------------- | ------------------------------------------- |
| 1        | Grep で重複チャンネル定義を検出        | 重複箇所リスト                              |
| 2        | 正規のソース（preload/channels.ts）を特定 | IPC_CHANNELS オブジェクト定義               |
| 3        | ハードコード文字列を定数参照に置換     | 型安全な import 使用                        |
| 4        | ホワイトリスト更新                     | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS 更新 |
| 5        | テスト追加                             | チャンネル存在検証、旧名称排除検証          |

**チャンネルマイグレーション例**:

| 旧チャンネル          | 新チャンネル       | 理由                       |
| --------------------- | ------------------ | -------------------------- |
| skill:list-available  | skill:list         | 冗長なサフィックス削除     |
| skill:list-imported   | skill:getImported  | 命名規則統一（動詞:対象）  |

**効果**:

| 観点       | 効果                                           |
| ---------- | ---------------------------------------------- |
| 保守性     | 変更箇所が1箇所に集約され、不整合リスク排除    |
| 型安全性   | TypeScript の型チェックでチャンネル名を検証    |
| セキュリティ | ホワイトリスト更新漏れをテストで防止         |

**関連仕様書**: [security-skill-ipc.md](./security-skill-ipc.md)

#### IPCチャンネル名定数化パターン（TASK-FIX-12-1-IPC-HARDCODE-FIX 2026-02-09実装）

IPC チャンネル名のハードコード文字列を定数参照に置換し、04-electron-security.md IPC セキュリティ原則に準拠するパターン。

**問題**: Main Process 内で IPC チャンネル名がハードコードされており、タイポや不整合のリスクがある。

| 問題 | 例 | リスク |
|------|---|--------|
| ハードコード文字列 | `this.mainWindow.webContents.send("skill:stream", message)` | タイポがコンパイル時に検出されない |
| 定数との不整合 | Preload側は定数、Main側はハードコード | 変更時に片方だけ更新される |
| セキュリティ原則違反 | 04-electron-security.md「ハードコード文字列でチャンネル名を指定しない」 | レビューで見落とされやすい |

**解決策: 定数参照への置換**

| 修正前（NG） | 修正後（OK） |
|-------------|-------------|
| `webContents.send("skill:stream", message)` | `webContents.send(SKILL_CHANNELS.SKILL_STREAM, message)` |

**実装ステップ**:

| ステップ | 処理内容 | 成果物 |
|---------|---------|--------|
| 1 | `grep -rn '"skill:' src/` でハードコード箇所を検出 | 対象箇所リスト |
| 2 | 対応する定数が `@repo/shared/src/ipc/channels.ts` に存在するか確認 | 定数マッピング |
| 3 | ハードコード文字列を定数参照に置換 | コード修正 |
| 4 | テスト実行で動作確認 | 品質検証 |

**メリット**:

| 観点 | 効果 |
|------|------|
| 型安全性 | タイポがコンパイル時に検出される |
| 保守性 | チャンネル名変更が1箇所で済む |
| セキュリティ | IPC セキュリティ原則準拠 |
| コードレビュー | 定数参照は意図が明確 |

**関連タスク**: TASK-FIX-12-1-IPC-HARDCODE-FIX（2026-02-09完了）

### サービス層パターン

#### Facadeパターン

| 要素    | 説明                                             |
| ------- | ------------------------------------------------ |
| 目的    | 複雑なサブシステムへの単純なインターフェース提供 |
| 構成    | 複数の下位サービス（DB、Config、Logger等）を統合 |
| 初期化  | initialize()メソッドで依存関係を初期化           |
| 公開API | 上位から必要な操作のみを公開                     |

#### Setter Injection パターン（TASK-FIX-7-1 2026-02-11実装）

遅延初期化が必要な依存オブジェクトを、コンストラクタではなく Setter メソッドで注入するパターン。

| 要素 | 説明 |
|------|------|
| 目的 | 初期化タイミングが異なる依存オブジェクトの注入 |
| 構成 | `setXxx(dependency)` メソッドでオブジェクトを受け取り、内部フィールドに保持 |
| 適用場面 | 依存オブジェクトが外部リソース（BrowserWindow等）を必要とし、Facade よりも後で初期化される場合 |
| 検証 | `executeXxx()` 呼び出し時に依存オブジェクトの存在を検証（未設定時はエラー） |

**適用例: SkillService と SkillExecutor**

| ステップ | 処理 | 説明 |
|----------|------|------|
| 1 | `new SkillService()` | Facade サービス生成（skillExecutor は null） |
| 2 | `new SkillExecutor(mainWindow, ...)` | 実行エンジン生成（mainWindow 依存） |
| 3 | `skillService.setSkillExecutor(executor)` | Setter で注入 |
| 4 | `skillService.executeSkill(...)` | 内部で `skillExecutor.execute()` に委譲 |

**使い分け基準**:

| パターン | 適用場面 | 例 |
|----------|----------|-----|
| Constructor Injection | 依存オブジェクトが生成時点で利用可能 | DB接続、設定オブジェクト |
| Setter Injection | 依存オブジェクトの生成に外部リソースが必要 | BrowserWindow、IPC ハンドラー |
| Factory Pattern | 依存オブジェクトを動的に生成する必要がある | プラグインシステム |

#### IPC ハンドラー登録パターン（TASK-9B-H 2026-02-12実装）

> **このセクションの役割**: 実装パターン（どう実装するか）を記録する。プロセス面の教訓（何が問題だったか、どう防止するか）については [lessons-learned.md - TASK-9B-H](./lessons-learned.md#task-9b-h-skillcreatorservice-ipcハンドラー登録) を参照。

BrowserWindow とサービスインスタンスを受け取り、IPC ハンドラーを登録するパターン。既存の registerAuthHandlers、registerSkillHandlers と同一構成。

| 要素 | 説明 |
|------|------|
| 目的 | Main Process で IPC ハンドラーを登録し、Renderer からの要求を処理 |
| 構成 | `registerXxxHandlers(mainWindow, service)` 関数で登録、`unregisterXxxHandlers()` で解除 |
| 適用場面 | 新規 IPC チャンネルグループの追加時 |
| 適用例 | `registerSkillCreatorHandlers(mainWindow, skillCreatorService)` |

**構成要素**:

| 要素 | 数量 | 説明 |
|------|------|------|
| `ipcMain.handle()` | 5チャンネル | Renderer からの invoke リクエストを処理 |
| `sendXxxProgress()` | 1チャンネル | Main → Renderer への進捗通知送信 |
| `unregisterXxxHandlers()` | 1関数 | ハンドラー解除（テスト用） |

**セキュリティ層（4層防御）**:

> セキュリティ仕様の正本: [security-electron-ipc.md - skillCreatorAPI](./security-electron-ipc.md)

| 層 | 実装 | 説明 |
|----|------|------|
| L1 | channels.ts ホワイトリスト | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS に登録 |
| L2 | validateIpcSender | 送信元BrowserWindowの正当性検証、DevToolsからの呼び出し検出・拒否 |
| L3 | 引数バリデーション | typeof手動チェックによる型検証（文字列型・オブジェクト型）をMain側で実施 |
| L4 | エラーサニタイズ | error.messageのみ返却。error.stack・ファイルパス等の内部情報は非露出 |

**Preload統合（4箇所更新必須）**:

| 更新箇所 | ファイル | 内容 |
|----------|----------|------|
| 1. API実装 | `preload/skill-creator-api.ts` | safeInvoke/safeOn でホワイトリスト検証付き API 実装 |
| 2. import追加 | `preload/index.ts` | API実装モジュールの import |
| 3. electronAPIオブジェクト | `preload/index.ts` | `electronAPI.skillCreator` として追加 |
| 4. contextBridge統合 | `preload/index.ts` | `contextBridge.exposeInMainWorld` で公開 + non-isolated フォールバック |

**既存の同パターン実装**:

| ハンドラー | ファイル | チャンネル数 |
|-----------|----------|------------|
| registerAuthHandlers | `authHandlers.ts` | 認証関連チャンネル |
| registerSkillHandlers | `skillHandlers.ts` | スキル管理・実行チャンネル |
| registerSkillCreatorHandlers | `skillCreatorHandlers.ts` | スキル作成チャンネル（5 invoke + 1 on） |

**実装時の注意点**:

| 注意点 | 対策 |
|--------|------|
| IpcResult型の重複定義（Main側とPreload側で独立に型定義） | @repo/shared/typesに共通型として配置する |

**プロセス面の教訓（苦戦箇所の詳細）**: [lessons-learned.md - TASK-9B-H 教訓1-8](./lessons-learned.md#task-9b-h-skillcreatorservice-ipcハンドラー登録) を参照。Preload統合漏れ、並列Phase実行、設計-実装乖離、仕様書更新漏れの教訓を記録。

**関連タスク**: TASK-9B-H-SKILL-CREATOR-IPC（2026-02-12完了）

### SDK連携パターン（TASK-9C 2026-02-03実装）

外部SDK（Claude Agent SDK等）との連携で発生する課題と解決パターン。

#### Graceful SDK Fallback パターン

SDK接続エラー時にアプリケーションをクラッシュさせず継続動作させるパターン。

| 要素           | 説明                                                                  |
| -------------- | --------------------------------------------------------------------- |
| ユーティリティ | `sdkUtils.ts: tryAgentSdkWithFallback<T>(fn, fallback)`               |
| 動作           | SDK呼び出しをtry-catchで囲み、エラー時はフォールバック値を返却        |
| ログ           | `console.warn()` で警告出力、アプリは継続動作                         |
| 適用例         | `tryAgentSdkWithFallback(() => queryFn(prompt), { suggestions: [] })` |

| 効果     | 説明                                               |
| -------- | -------------------------------------------------- |
| 堅牢性   | SDKが未インストール/設定不備でもアプリが起動・動作 |
| UX       | ユーザーには「分析結果なし」等の空状態を表示       |
| デバッグ | エラー詳細は開発者コンソールで確認可能             |

#### queryFn DI パターン（SDK テスト用）

SDK呼び出しを依存注入可能にし、テストでモック関数を渡せるようにするパターン。

| 要素             | 説明                                                       |
| ---------------- | ---------------------------------------------------------- |
| インターフェース | `queryFn?: (prompt: string) => Promise<Result>`            |
| デフォルト値     | 本番: Claude Agent SDK の `query()` を呼び出す関数         |
| テスト時         | `vi.fn().mockResolvedValue({ suggestions: [...] })` を注入 |

| 効果         | 説明                                      |
| ------------ | ----------------------------------------- |
| ESModule回避 | SDK本体をモック不要（ESModule制約を回避） |
| 高速テスト   | 実際のAPI呼び出しなしで高速・決定論的     |
| 本番互換     | 本番コードは変更なしで動作                |

#### スキル名バリデーションパターン

ユーザー入力のスキル名をファイルパスとして使用する際のセキュリティ対策。

| 要素             | 説明                                                           |
| ---------------- | -------------------------------------------------------------- |
| 禁止文字定数     | `FORBIDDEN_CHARS = ['<', '>', ':', '"', '\|', '?', '*']`       |
| 検証関数         | `validateSkillName(name): { valid: boolean; error?: string }`  |
| エラーメッセージ | 「スキル名に使用できない文字が含まれています: <具体的な文字>」 |

| 効果         | 説明                                        |
| ------------ | ------------------------------------------- |
| セキュリティ | パストラバーサル攻撃の防止                  |
| 互換性       | Windows/macOS/Linux全環境で安全なファイル名 |
| UX           | ユーザーフレンドリーなエラーメッセージ      |

### データ永続化パターン

| 用途         | 技術           | 設定                           |
| ------------ | -------------- | ------------------------------ |
| アプリデータ | better-sqlite3 | WALモード、NORMAL同期          |
| ユーザー設定 | electron-store | スキーマ検証、暗号化オプション |
| 機密情報     | safeStorage    | OSキーチェーン活用             |

#### SQLite最適化設定

| 設定         | 値     | 効果                           |
| ------------ | ------ | ------------------------------ |
| journal_mode | WAL    | 並行読み取り性能向上           |
| synchronous  | NORMAL | 書き込み性能と安全性のバランス |

### ウィンドウ管理パターン

| 機能               | 説明                         |
| ------------------ | ---------------------------- |
| ウィンドウ登録     | Map構造でID管理              |
| ライフサイクル管理 | closed イベントで自動削除    |
| 一括操作           | closeAll()で全ウィンドウ終了 |

### React Portal によるオーバーレイUI最前面表示パターン（AUTH-UI-001 2026-02-04実装）

CSSスタッキングコンテキストによりz-indexが親要素の範囲内に制限される問題を、React Portalで解決するパターン。

#### 問題

| 問題 | 原因 | 症状 |
|------|------|------|
| ドロップダウンが他要素に隠れる | CSSスタッキングコンテキスト | z-[9999]でも親要素の範囲内に制限 |
| モーダルの重なり順が不正 | position指定の親要素存在 | 新しいスタッキングコンテキスト生成 |

#### 解決策：React Portal + createPortal

| 要素 | 実装 |
|------|------|
| インポート | `import { createPortal } from "react-dom"` |
| レンダリング | `createPortal(<DropdownContent className="z-[9999]" />, document.body)` |
| 位置計算 | `getBoundingClientRect()` でトリガー要素の位置を取得 |
| SSR対応 | `typeof document !== "undefined"` でガード |

#### 実装ファイル

| ファイル | 行番号 | 内容 |
|----------|--------|------|
| AccountSection/index.tsx | 501 | ドロップダウンメニューをPortalでbody直下にレンダリング |

#### 適用基準

| 適用する | 適用しない |
|----------|------------|
| ドロップダウンメニュー | インライン展開コンテンツ |
| モーダルダイアログ | 親要素内に収まるポップオーバー |
| ツールチップ（オーバーフロー防止） | トースト通知（専用コンテナ使用） |

---

### Supabase認証状態変更時の即時UI更新パターン（AUTH-UI-001 2026-02-04実装）

認証状態変更（OAuth連携/解除）後にUIを即座に更新するためのパターン。

#### 問題

| 問題 | 原因 |
|------|------|
| OAuth連携後にUIが更新されない | `onAuthStateChange`後にプロバイダー情報を再取得していない |
| 連携解除後も連携中と表示される | 状態更新がイベントハンドラ内で完結していない |

#### 解決策：明示的なデータ再取得

| 要素 | 実装 |
|------|------|
| トリガー | `supabase.auth.onAuthStateChange((event, session) => ...)` |
| 再取得関数 | `fetchLinkedProviders()` |
| 呼び出し位置 | 認証状態変更イベントハンドラ内（コールバック直後） |

#### 実装ファイル

| ファイル | 行番号 | 内容 |
|----------|--------|------|
| authSlice.ts | 342-345 | 認証状態変更時に`fetchLinkedProviders()`を呼び出し |

#### Zustandとの統合

| ステップ | 処理 |
|----------|------|
| 1 | `onAuthStateChange`イベント発火 |
| 2 | セッション情報をZustandストアに保存 |
| 3 | `fetchLinkedProviders()`を呼び出し |
| 4 | プロバイダー情報をZustandストアに保存 |
| 5 | React コンポーネントが自動再レンダリング |

#### 認証イベント種別

| イベント | 再取得要否 | 理由 |
|----------|------------|------|
| SIGNED_IN | 必要 | OAuth連携が追加された可能性 |
| TOKEN_REFRESHED | 不要 | プロバイダー情報は変更なし |
| SIGNED_OUT | 必要 | 全連携情報をクリア |
| USER_UPDATED | 必要 | プロバイダー連携/解除の可能性 |

---

## パフォーマンス最適化パターン

### React最適化

| テクニック    | 用途               | 適用基準                                  |
| ------------- | ------------------ | ----------------------------------------- |
| React.memo    | 純粋コンポーネント | Props変化時のみ再レンダリングが必要な場合 |
| useMemo       | 重い計算結果       | 計算コストが高く、依存が変わらない場合    |
| useCallback   | コールバック安定化 | React.memo子に渡す関数                    |
| lazy/Suspense | コード分割         | ルートレベルのコンポーネント              |
| useTransition | 非緊急更新         | 重い状態更新の優先度低下                  |

### リスト最適化

| 技術                              | 用途           | 閾値         |
| --------------------------------- | -------------- | ------------ |
| 仮想化（@tanstack/react-virtual） | 大量リスト     | 100件以上    |
| ウィンドウイング                  | 無限スクロール | 動的読み込み |

### バンドル最適化

| 手法           | 効果               | 実現方法            |
| -------------- | ------------------ | ------------------- |
| Tree Shaking   | 未使用コード削除   | ESM形式のimport使用 |
| Code Splitting | 初期ロード削減     | dynamic import      |
| 依存関係最小化 | バンドルサイズ削減 | pnpm why で分析     |

### SQLite最適化

| 手法               | 効果               |
| ------------------ | ------------------ |
| インデックス作成   | クエリ高速化       |
| WALモード          | 並行性能向上       |
| Prepared Statement | クエリプラン再利用 |
| VACUUM             | 断片化解消         |

---

## セキュリティ実装パターン

### 入力バリデーション

| 手法           | 説明                              |
| -------------- | --------------------------------- |
| スキーマ定義   | Zodでフィールドごとにルール定義   |
| parse使用      | 失敗時に例外をthrow               |
| safeParse使用  | 失敗時にエラーオブジェクトを返却  |
| カスタムルール | regex、refinementで独自ルール追加 |

### サニタイゼーション

| 対象         | 方法                            |
| ------------ | ------------------------------- |
| HTML表示     | Reactのデフォルトエスケープ     |
| URL          | encodeURIComponent              |
| SQLクエリ    | Drizzle ORMの自動エスケープ     |
| ファイルパス | path.normalize + 許可リスト検証 |

### 認証フロー

| フェーズ       | 処理内容                              |
| -------------- | ------------------------------------- |
| 開始           | Code Verifier生成、Code Challenge計算 |
| 認可リクエスト | PKCEパラメータ付きで認可URLを開く     |
| コールバック   | カスタムプロトコルでコードを受信      |
| トークン交換   | Code Verifierを使用してトークン取得   |
| 保存           | safeStorageで暗号化して保存           |

### IPC L3ドメイン検証パターン（UT-9B-H-003）

IPCハンドラーの3層防御モデルにおけるL3（ドメイン固有検証）の実装パターン。

#### 3層防御モデル

| レイヤー | 検証内容 | 実装 |
|----------|---------|------|
| L1 | 送信元ウィンドウ検証 | `validateIpcSender(event)` |
| L2 | 引数の型チェック | `typeof arg === "string"` |
| L3 | ドメイン固有検証 | `validatePath()`, `ALLOWED_SCHEMA_NAMES`, `sanitizeErrorMessage()` |

#### パストラバーサル防止（validatePath）

```typescript
function validatePath(inputPath: string, _paramName: string): string | null {
  if (!inputPath) return null;                    // 空文字列
  if (inputPath.includes("\0")) return null;      // NULLバイト
  if (inputPath.startsWith("\\\\")) return null;  // UNCパス
  if (inputPath.includes("../")) return null;     // Unixトラバーサル
  if (inputPath.includes("..\\")) return null;    // Windowsトラバーサル
  return path.normalize(inputPath);
}
```

**検出パターン**: 空文字列 → NULLバイト → UNCパス → Unixトラバーサル → Windowsトラバーサル（5段階順序が重要）

#### エラーサニタイズ（sanitizeErrorMessage）

```typescript
const STACK_TRACE_PATTERN = /\n\s+at\s+.*/g;
const UNIX_PATH_PATTERN = /\/[\w./\\-]+/g;
const WINDOWS_PATH_PATTERN = /[A-Z]:\\[\w.\\-]+/gi;
const SENSITIVE_DATA_PATTERN = /(token|key|password|secret)=\S+/gi;

function sanitizeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "スキル作成処理でエラーが発生しました";
  return error.message
    .replace(STACK_TRACE_PATTERN, "")
    .replace(UNIX_PATH_PATTERN, "[path]")
    .replace(WINDOWS_PATH_PATTERN, "[path]")
    .replace(SENSITIVE_DATA_PATTERN, "$1=***");
}
```

**適用**: 全IPCハンドラーのcatchブロックで使用

#### ホワイトリスト検証（ALLOWED_SCHEMA_NAMES）

```typescript
const ALLOWED_SCHEMA_NAMES = ["task-spec", "skill-spec", "mode"] as const;

// 使用例（ハンドラー内）
if (!ALLOWED_SCHEMA_NAMES.includes(schemaName as typeof ALLOWED_SCHEMA_NAMES[number])) {
  return { success: false, error: `Invalid schema name: ${schemaName}` };
}
```

**拡張手順**: (1) ResourceLoaderにスキーマ追加 → (2) 配列に値追加 → (3) テスト追加

#### 適用チェックリスト

| チェック項目 | 対象 |
|-------------|------|
| L1: sender検証 | 全ハンドラー |
| L2: 型チェック | 全引数 |
| L3a: パス検証 | ファイルパス引数 |
| L3b: ホワイトリスト | 列挙値引数 |
| L3c: エラーサニタイズ | 全catchブロック |

**関連仕様書**: [security-electron-ipc.md](./security-electron-ipc.md)
**関連タスク**: UT-9B-H-003

---

## テスト実装パターン

### テストレベル別アプローチ

| レベル         | 対象                | ツール       | モック範囲       |
| -------------- | ------------------- | ------------ | ---------------- |
| ユニット       | 関数、クラス        | Vitest       | 外部依存全て     |
| 統合           | モジュール間連携    | Vitest       | 外部サービスのみ |
| コンポーネント | Reactコンポーネント | RTL + Vitest | API、ストア      |
| E2E            | ユーザーフロー      | Playwright   | なし（実環境）   |

### テスト環境設定パターン（TASK-3-2-F 2026-01-30実装）

| 環境      | 特徴                             | 適用ケース                     |
| --------- | -------------------------------- | ------------------------------ |
| jsdom     | 完全なDOM機能、Clipboard API対応 | UI統合テスト、ブラウザAPI依存  |
| happy-dom | 軽量・高速、基本DOM機能          | 単純なコンポーネントテスト     |
| node      | DOM不要                          | ユーティリティ関数、サービス層 |

**テストファイル単位の環境指定**:

| 方法             | 説明                                                 |
| ---------------- | ---------------------------------------------------- |
| ディレクティブ   | ファイル先頭に `// @vitest-environment jsdom` を記述 |
| vitest.config.ts | environmentMatchGlobsで glob パターン指定            |

**グローバルモック設計（setup.ts）**:

| モック対象           | 設定タイミング | 用途                      |
| -------------------- | -------------- | ------------------------- |
| Clipboard API        | beforeAll      | コピー/ペースト機能テスト |
| window.electronAPI.skill | beforeAll      | useSkillExecution等のHook（TASK-FIX-5-1で統一） |
| IntersectionObserver | トップレベル   | 無限スクロール等          |

**モック上書きパターン**:

グローバルモック後にテスト固有モックを使用する場合、beforeEach内でvi.stubGlobalを再呼び出しする。

| 手順 | 処理                                                  |
| ---- | ----------------------------------------------------- |
| 1    | テストファイルでモックオブジェクト定義                |
| 2    | モジュールレベルでvi.stubGlobal実行                   |
| 3    | beforeEach内で再度vi.stubGlobal（setup.ts上書き対策） |
| 4    | vi.clearAllMocks()でカウンターリセット                |

### fireEvent vs userEvent 使い分けパターン（UT-FIX-AGENTVIEW-INFINITE-LOOP-001 2026-02-12実装）

| ライブラリ | 特徴 | 適用ケース | テスト環境 |
| ---------- | ---- | ---------- | ---------- |
| `fireEvent` | 同期的、低レベルDOMイベント発火 | happy-dom環境の標準テスト | happy-dom（推奨） |
| `userEvent` | 非同期、ユーザー操作シミュレーション | アクセシビリティ検証、複合入力 | jsdom（必須） |

**環境別推奨パターン**:

| テスト環境 | イベント発火 | 非同期ハンドラ |
| ---------- | ------------ | -------------- |
| happy-dom | `fireEvent.click(el)` | `await act(async () => { fireEvent.click(el) })` |
| jsdom | `await user.click(el)` | `await user.click(el)`（自動でact wrap） |

**注意点**:

| 状況 | 問題 | 解決策 |
| ---- | ---- | ------ |
| happy-domで`userEvent.setup()` | `Symbol(Node prepared...)` エラー | `fireEvent`に切り替え |
| `fireEvent`でPromiseハンドラ | microtask未flush | `await act(async () => {...})` で包む |
| jsdomディレクティブ追加 | `toBeInTheDocument`動作不良、DOM重複 | happy-dom + fireEventに戻す |

### モック戦略

| モック種別 | 用途               | 使用場面                   |
| ---------- | ------------------ | -------------------------- |
| Stub       | 固定値を返す       | 外部サービスのレスポンス   |
| Mock       | 呼び出し検証       | 関数が正しく呼ばれたか確認 |
| Spy        | 実装保持しつつ監視 | 既存実装の振る舞い観察     |
| Fake       | 軽量な代替実装     | InMemoryRepository         |

### テストデータ管理

| 手法        | 用途                           |
| ----------- | ------------------------------ |
| Factory関数 | ユニークなテストデータ生成     |
| Fixture     | 固定のテストデータセット       |
| Builder     | 複雑なオブジェクトの段階的構築 |

### ESModuleモッキング制約パターン（TASK-9A-A 2026-02-03実装）

Node.js ESModule（`node:fs/promises`等）のエクスポートは読み取り専用プロパティのため、`vi.spyOn()`で再定義できない。この制約に対する回避策パターン。

#### 問題

| 状況                              | エラー                                          |
| --------------------------------- | ----------------------------------------------- |
| `vi.spyOn(fs, "readFile")` を使用 | `TypeError: Cannot redefine property: readFile` |
| ESModuleエクスポートのモック試行  | Vitestが再定義を許可しない                      |

#### 解決策：実エラー条件の使用

| 方法                   | 説明                                         |
| ---------------------- | -------------------------------------------- |
| 実際のエラー条件を使用 | モックせず、実際にエラーが発生する条件を作る |
| 存在しないパスの使用   | `ENOENT`エラーを発生させる                   |
| 権限のないパスの使用   | `EACCES`エラーを発生させる                   |
| 無効な引数の使用       | `EINVAL`エラーを発生させる                   |

#### 回避策パターン比較

| パターン     | 適用場面               | 安定性     |
| ------------ | ---------------------- | ---------- |
| 実エラー条件 | ファイルシステム操作   | 高（推奨） |
| vi.mock()    | モジュール全体モック   | 中         |
| 依存注入     | テスタビリティ設計済み | 高         |
| Wrapper関数  | レガシーコード対応     | 低         |

**推奨**: `node:fs/promises`のテストでは、モックを避けて実際のエラー条件（存在しないファイル、権限不足等）を使用する。これによりVitestの制約を回避しつつ、実際の動作に近いテストが可能。

### Vitest モックリセット戦略パターン（TASK-FIX-11-1 2026-02-13実装）

SDK統合テスト有効化時に発見された、`vi.clearAllMocks()` では不十分なモックリセットの問題と解決策。

#### 問題

| 状況                                           | 結果                                                                   |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| `beforeEach` で `vi.clearAllMocks()` のみ使用  | `mockImplementation()` で設定した実装が残存し、後続テストが失敗        |
| `mockRejectedValue()` でエラーモック設定       | 永続的なモックのため、次のテストケースにもエラーが漏洩                 |

#### Vitest モックリセット API の挙動差異

| API                      | `.mock.calls` クリア | `mockImplementation` リセット | `mockReturnValue` リセット |
| ------------------------ | :------------------: | :---------------------------: | :------------------------: |
| `vi.clearAllMocks()`     |          ✅          |              ❌               |             ❌             |
| `vi.resetAllMocks()`     |          ✅          |              ✅               |             ✅             |
| `vi.restoreAllMocks()`   |          ✅          |        ✅（元に戻す）         |       ✅（元に戻す）       |

#### 解決策：2段階リセット + Once サフィックス

| 手順 | 処理                                             | 目的                                       |
| ---- | ------------------------------------------------ | ------------------------------------------ |
| 1    | `vi.clearAllMocks()`                             | 呼び出し履歴クリア                         |
| 2    | `mock.mockResolvedValue(defaultResponse)`        | デフォルト正常応答を再設定                 |
| 3    | エラーテストでは `mockRejectedValueOnce()` を使用 | 1回限りのエラーで次テストに影響しない      |

#### コード例

```typescript
// beforeEach で2段階リセットを実施
beforeEach(() => {
  vi.clearAllMocks();
  // mockImplementation をデフォルト応答で上書き
  mockAgentAPI.query.mockResolvedValue({
    response: "mock response",
    tokenUsage: { input: 100, output: 50 },
  });
});

// エラーテストでは "Once" を使用
it("SDK障害をハンドリング", async () => {
  mockAgentAPI.query.mockRejectedValueOnce(
    new Error("SDK call failed")
  );
  // テスト実行...
});
```

#### 適用条件

| 条件     | 説明                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| 対象     | `vi.mock()` でモジュール全体をモック化しているテスト                                   |
| トリガー | テスト実行順序により結果が変わる場合                                                   |
| 関連     | P9（モジュールスコープ変数のテスト間リーク）、P13（タイマーテスト無限ループ）          |

### モジュールレベルモックのタイムアウトテストパターン（TASK-FIX-11-1 2026-02-13実装）

`vi.mock()` でモジュール全体をモック化した場合、内部のタイマーロジック（`setTimeout` + `AbortController`）が消失する問題のパターン。

#### 問題

| 状況                                                          | 結果                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `vi.mock("../agent-client")` でモジュール全体をモック         | 内部の `setTimeout` + `AbortController` ロジックが消失                   |
| `vi.advanceTimersByTimeAsync(30000)` でタイムアウト再現を試行 | モジュール内のタイマーが存在しないため、タイムアウトが発生しない         |

#### 解決策：外部インターフェースでのタイムアウトシミュレーション

モジュール内部のタイマーロジックを再現するのではなく、モック関数の応答としてタイムアウトエラーを注入する。

| アプローチ       | 手法                                                                                                | 利点                               |
| ---------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 直接エラー注入   | `mockRejectedValueOnce(new Error("Request timeout"))`                                               | シンプル、タイマー不要             |
| タイマー付きモック | `mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(...), 30000)))`       | タイマーテストとの組み合わせ可能   |

#### コード例

```typescript
// アプローチ1: 直接エラー注入（推奨）
it("タイムアウトエラーをハンドリング", async () => {
  mockAgentAPI.query.mockRejectedValueOnce(
    new Error("Request timeout")
  );
  const result = await skillExecutor.execute(request, metadata);
  expect(result.error).toContain("timeout");
});

// アプローチ2: タイマー付きモック（fake timer必要時）
it("30秒タイムアウト", async () => {
  vi.useFakeTimers();
  mockAgentAPI.query.mockImplementation(
    () => new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 30000);
    })
  );
  const promise = skillExecutor.execute(request, metadata);
  await vi.advanceTimersByTimeAsync(30000);
  await expect(promise).resolves.toMatchObject({ error: expect.stringContaining("timeout") });
  vi.useRealTimers();
});
```

#### 適用条件

| 条件     | 説明                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| 対象     | `vi.mock()` でモジュール全体をモック化し、かつタイムアウトテストが必要                  |
| トリガー | fake timer を使ってもタイムアウトが発生しない場合                                       |
| 関連     | P13（タイマーテスト無限ループ）、ESModuleモッキング制約パターン                         |

### バックアップファイルテストパターン（TASK-9A-A 2026-02-03実装）

ファイル操作サービスのバックアップ機能をテストするためのパターン。

#### テスト観点

| 観点                 | テスト方法                                          |
| -------------------- | --------------------------------------------------- |
| バックアップ作成     | 書き込み後に`.backup.{timestamp}`ファイルの存在確認 |
| バックアップ一覧取得 | `listBackups()`の戻り値でtimestamp降順を検証        |
| バックアップ復元     | `restoreBackup()`後の内容一致を検証                 |
| 削除時バックアップ   | 削除後に`.deleted.{timestamp}`ファイルの存在確認    |

#### 一時ディレクトリ活用

| 要素           | 実装                                                        |
| -------------- | ----------------------------------------------------------- |
| セットアップ   | `beforeEach`で`os.tmpdir()`配下にユニーク名ディレクトリ作成 |
| クリーンアップ | `afterEach`で`fs.rm(dir, { recursive: true, force: true })` |
| 隔離性         | 各テストで独立したディレクトリを使用                        |
| CI環境対応     | 環境変数`TMPDIR`等に依存しない相対パス使用                  |

### IPC通信テストパターン（TASK-8C-A 2026-02-02実装）

Electron IPC ハンドラーの統合テストにおいて、Main Process のハンドラーを Renderer Process を起動せずにテストするためのパターン群。

#### Handler Map方式

`ipcMain.handle` をモック化し、登録されたハンドラー関数を `Map<string, Function>` に格納する方式。テスト側から `handlers.get(channel)` でハンドラーを直接呼び出すことにより、IPC通信層を経由せず統合テストを実行できる。

| 要素           | 実装                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| モック対象     | `ipcMain.handle`                                                               |
| 格納構造       | `Map<string, (...args: unknown[]) => Promise<unknown>>`                        |
| ハンドラー取得 | `handlers.get("skill:list-available")`                                         |
| 呼び出し方法   | `handler(mockIpcEvent, ...args)`                                               |
| セットアップ   | `beforeEach` 内で `registerSkillHandlers()` を呼び出し、Map にハンドラーを蓄積 |

**使い分け基準**:

| 基準         | Handler Map方式        | 実プロセス起動方式       |
| ------------ | ---------------------- | ------------------------ |
| テスト速度   | 高速（プロセス不要）   | 低速（Electron起動必要） |
| テスト粒度   | ハンドラーロジック単体 | E2Eプロセス間通信        |
| セットアップ | `vi.mock("electron")`  | Spectron/Playwright      |
| 適用場面     | 統合テスト（推奨）     | E2Eテスト                |

#### SkillService Partial Mock

テスト対象ハンドラーの依存サービス（SkillService）を部分モックする方式。全メソッドを `vi.fn()` で置き換えつつ、テストケースごとに `mockResolvedValueOnce` で個別の戻り値を設定する。

| 要素       | 実装                                                               |
| ---------- | ------------------------------------------------------------------ |
| モック構造 | 全メソッドを `vi.fn()` で定義したオブジェクトリテラル              |
| 型キャスト | `mockSkillService as never` で型チェックを回避                     |
| 個別設定   | `mockSkillService.scanAvailableSkills.mockResolvedValueOnce(data)` |
| リセット   | `vi.clearAllMocks()` を `beforeEach` で実行                        |

**メソッド数の目安**: テスト対象の全IPCチャネルが呼び出すServiceメソッドを網羅する（TASK-8C-Aでは15メソッド）。

#### invokeOptionalHandler パターン

未実装チャネル（将来実装予定）のテストを「ハンドラー未登録」の検証として記述する方式。ハンドラーが登録されていれば実行し、未登録であれば `undefined` を検証する。

| 要素               | 実装                                                   |
| ------------------ | ------------------------------------------------------ |
| ヘルパー関数       | `invokeOptionalHandler(handlerMap, channel, ...args)`  |
| 戻り値（登録済み） | `{ exists: true, result: unknown }`                    |
| 戻り値（未登録）   | `{ exists: false }`                                    |
| テスト記述         | `it("should handle channel (if handler exists)", ...)` |

**移行容易性**: ハンドラーが実装された時点で、テストは自動的に実ハンドラーパスを通過するため、テストコードの変更は不要。

#### validateIpcSender失敗検証パターン

セキュリティ検証（`validateIpcSender`）の失敗パスをテストする方式。`mockReturnValueOnce` で一時的にバリデーション失敗を返し、ハンドラーがエラー応答を返すことを検証する。

| 要素         | 実装                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| モック設定   | `validateIpcSender.mockReturnValueOnce({ valid: false, errorCode: "..." })` |
| 検証対象     | ハンドラーが `success: false` を返すこと                                    |
| エラー変換   | `toIPCValidationError(result)` で統一エラー形式に変換                       |
| 適用チャネル | セキュリティ上重要なチャネル（abort, get-status等）                         |

### E2Eテストパターン（TASK-8C-C 2026-02-02実装）

Playwright + Vitest を使用した Electron アプリケーションの E2E テストパターン群。

#### Electron E2Eセットアップパターン

Playwright の `_electron` モジュールを使用して Electron アプリケーションを起動し、E2E テストを実行するためのセットアップパターン。

| 要素           | 実装                                              |
| -------------- | ------------------------------------------------- |
| 起動メソッド   | `_electron.launch({ args: [...], env: {...} })`   |
| ウィンドウ取得 | `electronApp.firstWindow()`                       |
| 待機処理       | `page.waitForLoadState("domcontentloaded")`       |
| 終了処理       | `electronApp?.close()`                            |
| 環境変数       | `NODE_ENV: "test"`, `TEST_SKILLS_DIR: fixtureDir` |

**テストライフサイクル**:

| フック     | 用途                                |
| ---------- | ----------------------------------- |
| beforeAll  | Electron アプリ起動、初期ページ取得 |
| afterAll   | Electron アプリ終了                 |
| beforeEach | テスト間の状態リセット              |

#### セレクタ定数パターン

E2E テストで使用するセレクタを定数オブジェクトとして一元管理するパターン。

| 要素          | 実装                                                               |
| ------------- | ------------------------------------------------------------------ |
| 構造          | `const SELECTORS = { ... } as const`                               |
| role セレクタ | `role=combobox`, `role=listbox`, `role=option`                     |
| text セレクタ | `text="スキャン中..."`                                             |
| data-testid   | `[data-testid="skill-streaming-view"]`                             |
| 動的セレクタ  | `skillOption: (name: string) => \`role=option >> text="${name}"\`` |
| aria-label    | `[aria-label="再スキャン"]`                                        |

**セレクタ優先順位**:

| 優先度 | セレクタ種別  | 理由                             |
| ------ | ------------- | -------------------------------- |
| 1      | role セレクタ | アクセシビリティ準拠、実装非依存 |
| 2      | data-testid   | テスト専用、安定性高い           |
| 3      | text セレクタ | 可読性高いが変更に弱い           |
| 4      | CSS クラス    | 最終手段、スタイル変更に弱い     |

#### タイムアウト定数パターン

操作種別ごとにタイムアウト値を定数化し、テストの安定性と可読性を向上させるパターン。

| 要素           | 実装                                |
| -------------- | ----------------------------------- |
| 構造           | `const TIMEOUTS = { ... } as const` |
| ダイアログ表示 | `dialog: 5000`                      |
| スキャン完了   | `scan: 10000`                       |
| 実行状態変化   | `execution: 5000`                   |

**適用場面**: `page.waitForSelector()`, `expect().toBeVisible()` の timeout 引数

#### ヘルパー関数パターン

頻出する操作をヘルパー関数として抽出し、テストコードの重複を排除するパターン。

| 関数                                 | 用途                                         | 戻り値        |
| ------------------------------------ | -------------------------------------------- | ------------- |
| `openSkillSelector(page)`            | スキル選択UIを開く                           | Promise<void> |
| `openImportDialog(page, skillName)`  | 未インポートスキルを選択してダイアログを開く | Promise<void> |
| `importSkillViaAPI(page, skillName)` | API経由でスキルをインポート                  | Promise<void> |
| `startSkillExecution(page, prompt)`  | スキル実行を開始                             | Promise<void> |
| `resetForTesting(page)`              | テスト間の状態リセット                       | Promise<void> |

**ヘルパー関数設計原則**:

| 原則       | 説明                                   |
| ---------- | -------------------------------------- |
| 単一責任   | 1つの関数は1つの操作のみ               |
| 暗黙の待機 | 必要な待機処理を関数内に含める         |
| 状態非依存 | 関数呼び出し前の状態に依存しない       |
| エラー伝播 | 例外は呼び出し元に伝播（catch しない） |

#### テストグループ構成パターン

関連するテストケースを describe ブロックでグループ化し、テストの構造を明確にするパターン。

| グループ             | テストケース数 | 内容                                     |
| -------------------- | -------------- | ---------------------------------------- |
| Skill Import Flow    | 3              | ダイアログ表示、詳細表示、インポート実行 |
| Skill Execution Flow | 3              | ストリーミング、停止ボタン、中止         |
| Rescan Flow          | 1              | 再スキャン実行                           |
| Edge Cases           | 2              | 無効スキル除外、インポート済み再選択     |

**ネスト beforeEach パターン**: Execution Flow グループでは beforeEach でスキルを事前インポートし、各テストケースの前提条件を統一する。

#### page.evaluate パターン

Renderer Process のコンテキストで JavaScript を実行し、Electron API 経由で操作を行うパターン。

| 要素         | 実装                                                  |
| ------------ | ----------------------------------------------------- |
| 構文         | `page.evaluate(async (arg) => { ... }, arg)`          |
| コンテキスト | Renderer Process（window オブジェクトにアクセス可能） |
| 用途         | preload API 呼び出し、DOM 直接操作、状態リセット      |
| 引数渡し     | 第2引数でシリアライズ可能な値を渡す                   |

**使用例**: `window.electronAPI?.skill?.resetForTesting?.()`

---

## アクセシビリティ実装パターン

### キーボードナビゲーション

| キー      | 期待動作                           |
| --------- | ---------------------------------- |
| Tab       | 次のインタラクティブ要素へ移動     |
| Shift+Tab | 前のインタラクティブ要素へ移動     |
| Enter     | ボタン実行、リンク遷移             |
| Space     | チェックボックストグル、ボタン実行 |
| Escape    | モーダル/ドロップダウンを閉じる    |
| 矢印キー  | リスト内移動、ラジオボタン選択     |

### ARIA属性

| 属性             | 用途                       | 適用場面               |
| ---------------- | -------------------------- | ---------------------- |
| aria-label       | 視覚ラベルがない要素の説明 | アイコンボタン         |
| aria-describedby | 追加説明の関連付け         | フォームヒント         |
| aria-expanded    | 展開/折りたたみ状態        | アコーディオン         |
| aria-live        | 動的コンテンツの通知       | トースト、アラート     |
| role             | 要素の役割を明示           | カスタムコンポーネント |

---

## 関連ドキュメント

| ドキュメント                                               | 内容                 |
| ---------------------------------------------------------- | -------------------- |
| [architecture-overview.md](./architecture-overview.md)     | アーキテクチャ全体像 |
| [development-guidelines.md](./development-guidelines.md)   | 開発ガイドライン     |
| [ui-ux-design-principles.md](./ui-ux-design-principles.md) | UI/UXデザイン原則    |
| [security-principles.md](./security-principles.md)         | セキュリティ原則     |
| [quality-requirements.md](./quality-requirements.md)       | 非機能要件・テスト   |

---

## スキル作成実装パターン（TASK-9B-G）

### Script First パターン

決定論的処理をスクリプトに委譲し、予測可能な結果を保証するパターン。

| 要素 | 説明 |
|------|------|
| 目的 | AI推論に依存しない決定論的処理の実現 |
| 構成 | ScriptExecutorがchild_process.spawnでスクリプトを実行 |
| 利点 | テスト容易性、予測可能性、高速実行 |
| 適用 | モード判定、検証処理、スキル初期化 |

**実装構成**:

| コンポーネント | ファイル | 責務 |
|----------------|----------|------|
| ScriptExecutor | `services/skill/ScriptExecutor.ts` | スクリプト実行、JSON出力パース |
| scripts/ | `~/.aiworkflow/skills/skill-creator/scripts/*.js` | 決定論的処理（detect_mode.js等） |

**使い分け基準**:

| 基準 | Script First | AI推論 |
|------|-------------|--------|
| 処理特性 | 決定論的（同じ入力→同じ出力） | 非決定論的（柔軟な応答） |
| 速度要件 | 高速応答必須 | 多少の遅延許容 |
| テスト | 単純なアサーション | 出力のバリエーション検証 |
| 例 | バリデーション、フォーマット変換 | 自然言語解釈、創造的生成 |

**セキュリティ考慮**:

| 対策 | 実装 |
|------|------|
| パストラバーサル防止 | スクリプト名に`..`, `/`, `\`を含む場合は拒否 |
| 実行ディレクトリ制限 | skill-creator/scripts/配下のみ実行許可 |
| shell: false | コマンドインジェクション防止 |

---

### Progressive Disclosure パターン

リソースを必要時に遅延読み込みし、メモリ効率とレスポンス速度を向上させるパターン。

| 要素 | 説明 |
|------|------|
| 目的 | 必要なリソースのみを読み込み、効率化 |
| 構成 | ResourceLoaderがキャッシュ付き遅延読み込みを提供 |
| 利点 | メモリ効率、起動時間短縮、柔軟なリソース管理 |
| 適用 | エージェントプロンプト、スキーマ、参照資料 |

**実装構成**:

| コンポーネント | ファイル | 責務 |
|----------------|----------|------|
| ResourceLoader | `services/skill/ResourceLoader.ts` | リソース読み込み、キャッシュ管理 |
| リソースディレクトリ | `skill-creator/{agents,references,assets,schemas}/` | カテゴリ別リソース配置 |

**キャッシュ戦略**:

| 戦略 | 実装 |
|------|------|
| キャッシュキー | `{category}/{filename}` 形式 |
| キャッシュ格納 | `Map<string, string>` |
| キャッシュヒット | 同一キーの2回目以降はメモリから返却 |
| キャッシュクリア | `clearCache()` で全キャッシュ削除 |

**読み込み優先順位**:

| 順位 | ソース | 条件 |
|------|--------|------|
| 1 | キャッシュ | キャッシュにキーが存在する場合 |
| 2 | ファイルシステム | キャッシュミス時にfs.readFileで読み込み |

---

### Facade パターン（SkillCreatorService）

複雑なスキル作成処理を統合し、シンプルなAPIを提供するパターン。

| 要素 | 説明 |
|------|------|
| 目的 | 複雑なサブシステムへの単純なインターフェース提供 |
| 構成 | SkillCreatorServiceがScriptExecutor、ResourceLoaderを統合 |
| 利点 | 利用者は内部実装を意識せず、高レベルAPIで操作可能 |
| 適用 | スキル作成、タスク実行、検証処理 |

**統合サービス構成**:

| サービス | 依存コンポーネント | 統合内容 |
|----------|-------------------|----------|
| SkillCreatorService | ScriptExecutor, ResourceLoader | モード判定、スキル作成、タスク実行、検証 |

**公開API**:

| メソッド | 説明 | 内部で使用するコンポーネント |
|----------|------|------------------------------|
| detectMode | モード判定 | ScriptExecutor |
| createSkill | スキル作成 | ScriptExecutor, ResourceLoader |
| executeTasks | タスク実行 | ScriptExecutor |
| validateSkill | スキル検証 | ScriptExecutor |

---

### タスク依存関係解決パターン

タスク間の依存関係を解決し、正しい実行順序を決定するパターン。

**アルゴリズム**:

| アルゴリズム | 用途 | 実装 |
|--------------|------|------|
| トポロジカルソート（Kahn's） | 実行順序決定 | 入次数0のタスクをキューで処理 |
| DFS循環検出 | 循環依存検出 | recursion stackで訪問中ノードを追跡 |

**実行モード**:

| モード | 説明 | 用途 |
|--------|------|------|
| dry-run | 実行計画のみ返却 | 事前確認、見積もり |
| execution | 実際にタスクを実行 | 本番実行 |
| parallel | 独立タスクを並列実行 | 高速化（将来実装） |

---

## 外部API データ正規化パターン

### プロバイダー別フォールバックパターン（AUTH-UI-004）

複数の外部OAuthプロバイダーからのレスポンスを統一的に扱うためのパターン。プロバイダーごとにキー名が異なる場合に、Nullish coalescingでフォールバックチェーンを構成する。

**問題**: Supabase Authの`identity_data`でアバターURLのキー名がプロバイダーごとに異なる

| プロバイダー | キー名       | 備考                     |
| ------------ | ------------ | ------------------------ |
| Google       | `picture`    | OAuth 2.0標準のclaim名   |
| GitHub       | `avatar_url` | GitHub API準拠           |
| Discord      | `avatar_url` | GitHub互換               |

**実装パターン**:

| 要素           | 実装                                                         |
| -------------- | ------------------------------------------------------------ |
| フォールバック | `identity_data?.avatar_url ?? identity_data?.picture ?? null` |
| 優先順位       | 既存プロバイダー（avatar_url）を優先、Googleを後続           |
| 安全性         | 未知のプロバイダーはnullにフォールバック                     |

**型定義の拡張**:

| プロパティ | 型                  | 追加理由               |
| ---------- | ------------------- | ---------------------- |
| avatar_url | string \| undefined | 既存（GitHub/Discord） |
| picture    | string \| undefined | Google用に追加         |

**適用場面**:
- 複数OAuthプロバイダーのデータ統合
- 外部APIのレスポンス正規化
- 後方互換性を維持した機能拡張

**関連タスク**: AUTH-UI-004
**関連仕様書**: [interfaces-auth.md](./interfaces-auth.md) - SupabaseIdentity型定義

---

## SkillAPI統一パターン（TASK-FIX-5-1 2026-02-06実装）

SkillAPIの二重定義（`window.skillAPI` + `window.electronAPI.skill`）を単一の `window.electronAPI.skill` に統一するパターン。

### 問題: IPC Bridge API二重公開

| 要素 | 説明 |
|------|------|
| 旧状態 | `window.skillAPI`（直接公開）+ `window.electronAPI.skill`（contextBridge経由）が共存 |
| 問題 | 呼び出し側で参照先が分散し、テストモックも二重管理が必要 |
| 解決 | `window.electronAPI.skill` に一本化、旧 `window.skillAPI` を完全削除 |

### 統一後のAPI構成（13メソッド）

| カテゴリ | メソッド | パターン | 戻り値 |
|----------|----------|----------|--------|
| Skill実行 | execute, onStream, abort, getExecutionStatus, onComplete, onError | safeInvoke/safeOn | 直接型（OperationResult不使用） |
| Permission | onPermissionRequest, sendPermissionResponse | safeOn/safeInvoke | 直接型 |
| Skill管理 | list, getImported, rescan, import, remove | safeInvoke | 直接型 |

### テスト結果

| カテゴリ | テスト数 | 結果 |
|----------|----------|------|
| skill-api.test.ts | 37 | PASS |
| skill-api.permission.test.ts | 30 | PASS |
| skillSlice.test.ts | 59 | PASS |
| SkillExecutor統合テスト | 12 | PASS |
| **合計** | **138** | **PASS** |

**カバレッジ**: skill-api.ts で Statements 91.23%、Branches 85.71%、Functions 100%、Lines 91.23% を達成（平均91%）。

### 実装上の課題と対処法

#### 型アサーション残存（S1）

| 要素 | 説明 |
|------|------|
| 問題 | `AgentView/index.tsx` で `as unknown as Skill[]` 型アサーション残存（agentSliceが旧 `Skill` 型使用） |
| 対処 | 未タスク UT-FIX-5-1-001 として登録、TASK-FIX-6-1（状態管理変更）で包含予定 |
| 教訓 | API統一時は呼び出し側のStore型定義まで影響範囲を調査し、スコープに含めるか明示的に判断する |

#### OperationResult廃止の影響波及（S4）

| 要素 | 説明 |
|------|------|
| 問題 | `OperationResult<T>` ラッパー廃止で8ファイルに影響波及。使用箇所が分散していた |
| 対処 | Preload層では直接型に統一し、旧定義は後方互換のため残置 |
| 教訓 | 型ラッパー廃止時は `grep -rn` で全使用箇所をリストアップし、段階的置換プランを策定する |

#### テストモック設計・仕様書参照・編集永続化（S2/S3/S5）

以下の実行プロセス上の課題は [skill-creator/references/patterns.md](.claude/skills/skill-creator/references/patterns.md) に成功パターンとして詳細を記録:

| ID | 課題 | 対応パターン |
|----|------|-------------|
| S2 | パスエイリアス対応でテスト623→1092行に膨張 | IPC Bridge API統一時のテストモック設計パターン |
| S3 | Phase 1で仕様書参照19件が不足し後付け修正 | Phase 1仕様書作成時の依存仕様書マトリクスパターン |
| S5 | PostToolUseフックで8件が未永続化 | セッション間での仕様書編集永続化検証パターン |

---

## 型定義修正タスクパターン（UT-FIX-5-4 2026-02-10実装）

IPC/Agent SDK関連の型定義を修正する際のシステム仕様書更新チェックリスト。

### 問題: 型定義変更時のシステム仕様書更新漏れ

| 問題 | 原因 | 症状 |
|------|------|------|
| 仕様書と実装の乖離 | Phase 12で複数ファイル更新が必要だが一部漏れ | ドキュメントが古いまま残る |
| 関連仕様書の更新漏れ | 該当する仕様書が分散している | interfaces, api-ipc, security等が不整合 |
| topic-map再生成漏れ | 仕様書追加/更新後の再生成忘れ | インデックスが古いまま |

### 解決策: 型定義修正時のシステム仕様書更新チェックリスト

#### Step 1: 型定義ファイルの同時更新

| ファイル | 内容 | 更新タイミング |
|----------|------|---------------|
| `packages/shared/src/agent/types.ts` | 共有型定義 | 常に |
| `apps/desktop/src/preload/types.ts` | Preload層型定義 | IPC関連の場合 |

#### Step 2: システム仕様書の更新

| 仕様書 | 更新内容 | 該当条件 |
|--------|----------|----------|
| `interfaces-agent-sdk.md` | 型定義の変更内容記録 | Agent SDK型変更時 |
| `interfaces-agent-sdk-skill.md` | 完了タスクセクション追加 | Skill関連型変更時 |
| `api-ipc-agent.md` | 完了タスクセクション追加 | Agent IPC変更時 |
| `security-api-electron.md` | 完了タスクテーブル追加 | セキュリティ関連変更時 |
| `task-workflow.md` | 残課題テーブル・完了タスク記録 | 常に |
| `LOGS.md`（2ファイル） | タスク完了記録 | 常に |
| `SKILL.md`（2ファイル） | 変更履歴更新 | 常に |
| `topic-map.md` | 再生成 | 常に |

#### Step 3: 検証

| 検証項目 | コマンド | 期待結果 |
|----------|----------|----------|
| 型整合性 | `pnpm typecheck` | エラーなし |
| テスト | `pnpm test` | 全テストPASS |
| 仕様書整合性 | Phase 12仕様書チェックリスト全項目確認 | 全項目チェック済み |

### 関連Pitfall

| Pitfall ID | タイトル | 関連 |
|------------|----------|------|
| P23 | API二重定義の型管理複雑性 | 型定義ファイルの分散 |
| P31 | Phase 12のシステム仕様書更新漏れ | 本パターンの教訓元 |
| P32 | 型定義の二箇所同時更新必須 | Step 1の根拠 |

**関連タスク**: UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH（2026-02-10完了）

---

## SDK 型統合パターン（TASK-9B-I 2026-02-12実装）

### S11: TypeScript モジュール解決の優先順位（TASK-9B-I）

カスタム `declare module` ファイルと `node_modules` 内の実 SDK 型が共存する場合に発生する型解決の優先順位問題。

| 要素 | 説明 |
|------|------|
| 問題 | `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` にカスタム `declare module` を作成していたが、SDK が `node_modules` にインストールされると TypeScript は `node_modules` 配下の実型定義を優先する |
| 原因 | TypeScript のモジュール解決アルゴリズムでは、`node_modules` 配下にパッケージ実体が存在する場合、ambient declaration（`declare module`）よりも実型定義が優先される |
| 影響 | カスタム `.d.ts` で定義した `PermissionMode`（`'auto' \| 'ask' \| 'deny'`）が無視され、実 SDK の型（`'default' \| 'acceptEdits' \| 'bypassPermissions' \| 'plan' \| 'delegate' \| 'dontAsk'`）が使用される。カスタム型は「ゴースト型」となり、仕様書にも誤った値が記載される |
| 解決策 | SDK をインストールした時点でカスタム `.d.ts` を削除する。SDK 未インストール環境でのみ使用する場合はフラグで管理する |

**モジュール解決の優先順位**:

| 優先度 | ソース | 条件 |
|--------|--------|------|
| 1 | `node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts` | SDK がインストール済みの場合 |
| 2 | `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` | SDK が未インストールの場合のみ有効 |

**教訓**: SDK 型との重複を避けるため、`declare module` は SDK 未インストール環境でのみ使用する。SDK インストール後にカスタム `.d.ts` が残存すると、仕様書やコードレビューで誤った型情報を参照するリスクがある。

**関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION, UT-9B-I-001

---

### S12: SDK API パラメータの正確な把握（TASK-9B-I）

外部 SDK の公式ドキュメントが限定的な場合に、API パラメータの正確な型情報を取得するためのパターン。

| 要素 | 説明 |
|------|------|
| 問題 | Claude Agent SDK (`@anthropic-ai/claude-agent-sdk@0.2.30`) の公式ドキュメントが限定的で、`query({ prompt, options })` の `options` の全フィールドを正確に把握するのに時間がかかった |
| 特に困難だった点 | `env: { ANTHROPIC_API_KEY }` パターン（API キーを環境変数として渡す）と `abortController` オプションは公式ドキュメントでは明示されていなかった |

**情報源の信頼性順位**:

| 順位 | 情報源 | 信頼性 | 具体的なパス |
|------|--------|--------|-------------|
| 1 | SDK の TypeScript 型定義ファイル | 最も信頼できる | `node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts` |
| 2 | SDK の GitHub リポジトリのテストコード | 実用例として参考 | リポジトリの `test/` ディレクトリ |
| 3 | SDK の公式ドキュメント | 概要把握には有用だが詳細が不足する場合がある | README.md、公式サイト |

**発見された重要なパラメータ**:

| パラメータ | 用途 | 発見元 |
|-----------|------|--------|
| `env: { ANTHROPIC_API_KEY: string }` | API キーを環境変数として SDK に渡す | 型定義ファイル |
| `abortController: AbortController` | SDK 実行の中断制御 | 型定義ファイル |
| `permissionMode: PermissionMode` | パーミッション制御モード | 型定義ファイル |

**教訓**: 公式ドキュメントより型定義ファイル（`node_modules/<package>/dist/index.d.ts`）が最も信頼できる情報源である。新しい SDK を統合する際は、まず型定義ファイルを直接読み、全パラメータと型を把握してから実装に着手する。

**関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION

---

### IPC ハンドラ二重登録防止パターン（UT-FIX-IPC-HANDLER-DOUBLE-REG-001 2026-02-14実装）

macOS の `activate` イベントでウィンドウを再作成する際に、`ipcMain.handle()` の二重登録例外を防止するパターン。

| 要素 | 説明 |
|------|------|
| 問題 | `ipcMain.handle()` は同一チャンネルに2つ目のハンドラ登録を試みると例外を送出する。`ipcMain.on()` とは異なり、暗黙的な多重登録ができない |
| 発生条件 | macOS でドックアイコンクリック → `activate` イベント → `registerAllIpcHandlers()` 再実行 |
| 解決策 | `unregisterAllIpcHandlers()` で全チャンネルを一括解除してから再登録する（A案: unregister→register） |
| 不採用案 | B案: フラグガード（stale参照リスク）、C案: 全ハンドラファイルリファクタ（影響範囲大） |

**一括解除の3ステップ**:

| ステップ | API | 目的 |
|----------|-----|------|
| 1 | `ipcMain.removeHandler(channel)` | `ipcMain.handle()` で登録したハンドラを解除 |
| 2 | `ipcMain.removeAllListeners(channel)` | `ipcMain.on()` で登録したリスナーを解除 |
| 3 | `themeWatcherUnsubscribe()` | `nativeTheme.on("updated")` リスナーを解除 |

**ipcMain.handle() vs ipcMain.on() の動作差異**:

| API | 二重登録時の動作 | 解除API |
|-----|-----------------|---------|
| `ipcMain.handle()` | 例外を送出 | `ipcMain.removeHandler()` |
| `ipcMain.on()` | 暗黙的に追加（リスナー増殖） | `ipcMain.removeAllListeners()` |

**セキュリティ考慮事項**: 全チャンネルは `IPC_CHANNELS` 定数から `Object.values()` で取得し、ホワイトリストの網羅性を保証する。4層防御（L1-L4）は個別ハンドラ側で維持されるため、unregister/register では影響を受けない。

**関連タスク**: UT-FIX-IPC-HANDLER-DOUBLE-REG-001（2026-02-14完了）

**関連未タスク（UT-FIX-IPC-HANDLER-DOUBLE-REG-001 から派生）**:

| タスクID                             | タスク名                                          | 優先度 |
| ------------------------------------ | ------------------------------------------------- | ------ |
| task-sec-ipc-lifecycle-audit-001     | Electron ライフサイクルイベント IPC リスナー管理監査 | 中     |
| task-imp-ipc-registration-verify-001 | IPC ハンドラ登録整合性自動検証テスト               | 中     |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| v1.23.0 | 2026-02-14 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止パターン追加（unregister→register、ipcMain.handle() vs on() 動作差異、セキュリティ考慮事項） |
| v1.22.0 | 2026-02-13 | UT-9B-H-003: IPC L3ドメイン検証パターン追加（validatePath, sanitizeErrorMessage, ALLOWED_SCHEMA_NAMES） |
| 1.21.0 | 2026-02-12 | TASK-9B-I-SDK-FORMAL-INTEGRATION: SDK型統合パターン追加（S11: TypeScriptモジュール解決の優先順位、S12: SDK APIパラメータの正確な把握） |
| 1.20.0 | 2026-02-12 | TASK-9B-H: IPCハンドラー登録パターンに「実装時の注意点・苦戦箇所」テーブル追加（5件の苦戦箇所と解決策、lessons-learned.mdへのクロスリファレンス） |
| 1.19.0 | 2026-02-12 | TASK-9B-H: IPC ハンドラー登録パターン追加（3層セキュリティ、Preload統合4箇所更新チェックリスト、既存同パターンとの対応表） |
| 1.18.0 | 2026-02-11 | TASK-FIX-7-1: Setter Injection パターン詳細追加（SkillService と SkillExecutor の統合、使い分け基準テーブル） |
| 1.17.0 | 2026-02-10 | UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH: 型定義修正タスクパターン追加（システム仕様書更新チェックリスト、関連Pitfall P31/P32との相互参照） |
| 1.16.0 | 2026-02-09 | TASK-FIX-12-1-IPC-HARDCODE-FIX: IPCチャンネル名定数化パターン追加（ハードコード検出、定数参照置換、セキュリティ原則準拠） |
| 1.15.0 | 2026-02-06 | TASK-FIX-5-1リファクタリング: S1-S5苦戦箇所を最適化（S1/S4は実装パターンとして保持、S2/S3/S5はskill-creator/patterns.mdへクロスリファレンス化で重複解消） |
| 1.14.0 | 2026-02-06 | TASK-FIX-5-1-SKILL-API-UNIFICATION: SkillAPI統一パターン追加（API二重公開解消、苦戦箇所5件記録） |
| 1.13.0 | 2026-02-05 | TASK-FIX-4-1-IPC-CONSOLIDATION: IPCチャンネル統合パターン追加（Single Source of Truth、ハードコード検出、ホワイトリスト検証） |
| 1.12.0 | 2026-02-04 | AUTH-UI-001: React Portal オーバーレイUI最前面表示パターン、Supabase認証状態変更時の即時UI更新パターン追加 |
| 1.11.0 | 2026-02-04 | AUTH-UI-004: 外部APIデータ正規化パターン追加（プロバイダー別フォールバック） |
| 1.10.0 | 2026-02-03 | マージ統合: TASK-9B-G + TASK-9C/9A-A |
| 1.9.0 | 2026-02-03 | TASK-9C: SDK連携パターン追加（Graceful SDK Fallback, queryFn DI, スキル名バリデーション） |
| 1.8.0 | 2026-02-03 | TASK-9A-A: ESModuleモッキング制約パターン、バックアップファイルテストパターン追加 |
| 1.7.0 | 2026-02-03 | TASK-9B-G: スキル作成実装パターン追加（Script First、Progressive Disclosure、Facade、タスク依存関係解決） |
| 1.6.0 | 2026-02-03 | TASK-WCE-MONACO-001スキル最適化: Main→Rendererパターン再構成（Problem Statement追加、課題IDテーブル、汎用チェックリスト、セキュリティ考慮事項表追加）、api-ipc-agent.md相互リンク追加 |
| 1.5.0 | 2026-02-03 | TASK-WCE-MONACO-001: Main→Renderer逆方向クエリパターン追加（webContents.executeJavaScript、グローバルブリッジ、苦戦ポイントと対処法） |
| 1.4.0 | 2026-02-02 | TASK-8C-C: E2Eテストパターン追加（Electron E2Eセットアップ、セレクタ定数、タイムアウト定数、ヘルパー関数、テストグループ構成、page.evaluate） |
| 1.3.0 | 2026-02-02 | TASK-8C-A: IPC通信テストパターン追加（Handler Map方式、SkillService Partial Mock、invokeOptionalHandler、validateIpcSender失敗検証） |
| 1.2.0 | 2026-01-30 | TASK-7D: forwardRef + useImperativeHandleパターン、React.memo + Exclude型パターン追加 |
| 1.1.0 | 2026-01-30 | TASK-3-2-F: テスト環境設定パターン追加（jsdom/happy-dom選択、グローバルモック設計、モック上書きパターン） |
| 1.0.0 | 2026-01-26 | 仕様ガイドライン準拠: コード例削除、文章・表形式に変更 |
| 0.1.0 | 2026-01-26 | 初版作成 |
