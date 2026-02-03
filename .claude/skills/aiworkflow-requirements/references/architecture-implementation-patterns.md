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

| パターン | 説明 | 用途 |
|----------|------|------|
| **Compound Components** | 関連コンポーネントをグループ化し、親子間で暗黙的に状態を共有 | Tabs, Dropdown, Dialog |
| **Render Props** | 関数をPropsとして渡し、動的なレンダリング制御を実現 | DataFetcher, Tooltip |
| **Controlled** | 状態を親コンポーネントで管理し、Propsで制御 | 複雑なバリデーション、外部連携 |
| **Uncontrolled** | 状態をコンポーネント内部で管理し、refで参照 | シンプルなフォーム |

### 状態管理パターン

| 状態タイプ | 管理方法 | 用途例 |
|-----------|----------|--------|
| UIローカル状態 | useState | モーダル開閉、フォーム入力値 |
| 複雑なローカル状態 | useReducer | 多段階フォーム、複合状態 |
| 機能グローバル状態 | Zustand Slice | 認証状態、テーマ設定 |
| サーバー状態 | React Query | APIレスポンス、キャッシュ |

#### Zustand Slice設計原則

| 原則 | 説明 |
|------|------|
| 単一責任 | 1つのSliceは1つの機能ドメインのみ担当 |
| 型安全性 | StateCreator型を使用し、型推論を活用 |
| 不変更新 | set関数で状態を不変に更新 |
| セレクタ使用 | 必要な状態のみ選択し、不要な再レンダリングを防止 |

### フォーム実装パターン

| パターン | ツール | 説明 |
|----------|--------|------|
| スキーマバリデーション | Zod | フォームスキーマを定義し、型安全なバリデーション |
| フォーム状態管理 | React Hook Form | 非制御コンポーネントベースの効率的なフォーム管理 |
| リゾルバー統合 | zodResolver | ZodスキーマとReact Hook Formの統合 |

#### バリデーションタイミング

| タイミング | 用途 | 設定 |
|-----------|------|------|
| onChange | リアルタイムフィードバック | mode: "onChange" |
| onBlur | フィールド離脱時検証 | mode: "onBlur" |
| onSubmit | 送信時のみ検証（デフォルト） | mode: "onSubmit" |

### データフェッチパターン

| パターン | 説明 | 用途 |
|----------|------|------|
| 基本クエリ | queryKey + queryFnでデータ取得 | 読み取り専用データ |
| 楽観的更新 | onMutateで即座にUI更新、失敗時ロールバック | 即時フィードバックが必要な操作 |
| 無効化 | invalidateQueriesで関連キャッシュを無効化 | データ更新後の再フェッチ |
| プリフェッチ | prefetchQueryで事前取得 | ホバー時の先読み |

### エラーバウンダリ配置戦略

| 配置レベル | 用途 | フォールバック例 |
|-----------|------|-----------------|
| アプリ全体 | グローバルエラーキャッチ | エラーページ表示 |
| 機能単位 | 機能隔離（チャット、設定等） | 機能別エラーUI |
| コンポーネント単位 | 特定UIの隔離 | プレースホルダー表示 |

### forwardRef + useImperativeHandle パターン（TASK-7D）

外部から命令的にコンポーネントのメソッドを呼び出すためのパターン。親コンポーネントがrefを通じて子コンポーネントの特定メソッドのみを呼び出す場合に使用する。

**ユースケース**: ChatPanelの`handleImportRequest`を親コンポーネントから呼び出す

| 要素 | 実装 |
|------|------|
| Handle型 | `ChatPanelHandle { handleImportRequest: (skill: SkillMetadata) => void }` |
| Component宣言 | `forwardRef<ChatPanelHandle, ChatPanelProps>` |
| Handle公開 | `useImperativeHandle(ref, () => ({ handleImportRequest }))` |
| displayName | `ChatPanel.displayName = "ChatPanel"` |
| 使用側 | `const ref = useRef<ChatPanelHandle>(null); ref.current?.handleImportRequest(skill)` |

**Props callbackパターンとの使い分け**:

| 判断基準 | forwardRef + useImperativeHandle | Props callback |
|----------|----------------------------------|----------------|
| 呼び出し方向 | 親 → 子（命令的） | 子 → 親（宣言的） |
| 適用場面 | 親が子のメソッドを直接呼ぶ必要がある場合 | 子のイベントを親に通知する場合 |
| パフォーマンス | 選択的メソッド公開で不要な再レンダー回避 | Props変更時に再レンダー発生 |
| テスト | `ref.current`経由でFunction Coverage 100%達成 | Props経由で直接テスト可能 |

### React.memo + Exclude型パターン（TASK-7D）

`React.memo`によるメモ化と`Exclude`ユーティリティ型を組み合わせ、表示不要なステータスをコンパイル時に除外するパターン。

**ユースケース**: SkillStreamingViewコンポーネントでステータス"idle"を表示対象から除外する

| 要素 | 実装 |
|------|------|
| メモ化 | `memo(({ skillName, messages, status }) => ...)` |
| 型安全除外 | `type DisplayableStatus = Exclude<SkillExecutionStatus, "idle">` |
| 設定マップ | `Record<DisplayableStatus, { color: string; label: string }>` |
| displayName | `SkillStreamingView.displayName = "SkillStreamingView"` |

**メリット**: `Record<DisplayableStatus, ...>`により、新しいステータスが追加された場合にコンパイルエラーで網羅性不足を検出できる。

---

## バックエンド実装パターン

### API設計パターン

#### RESTfulエンドポイント命名規則

| HTTP Method | パス形式 | 用途 |
|-------------|----------|------|
| GET | /resources | コレクション取得 |
| GET | /resources/:id | 単一リソース取得 |
| POST | /resources | 新規作成 |
| PUT | /resources/:id | 全体更新 |
| PATCH | /resources/:id | 部分更新 |
| DELETE | /resources/:id | 削除 |

#### Server Actions設計原則

| 原則 | 説明 |
|------|------|
| "use server"ディレクティブ | ファイル先頭に配置し、サーバー実行を明示 |
| 入力バリデーション | Zodスキーマで必ず検証 |
| キャッシュ無効化 | revalidatePathで関連パスを再検証 |
| エラーハンドリング | try-catchで適切にエラーを返却 |

### データアクセスパターン

#### Repositoryパターン

| 要素 | 説明 |
|------|------|
| インターフェース定義 | CRUD操作を抽象化したインターフェース |
| 実装クラス | Drizzle ORMを使用した具体的な実装 |
| 依存注入 | コンストラクタでDBインスタンスを受け取る |
| テスタビリティ | インターフェースに対してモックを作成可能 |

#### Unit of Workパターン

| 用途 | 説明 |
|------|------|
| トランザクション管理 | 複数の操作を1つのトランザクションで実行 |
| 整合性保証 | 全操作の成功または全ロールバック |
| 実装方法 | db.transaction()内で全操作を実行 |

### エラーハンドリングパターン

#### Result型パターン

| 状態 | 構造 | 用途 |
|------|------|------|
| 成功 | `{ success: true, data: T }` | 正常結果の返却 |
| 失敗 | `{ success: false, error: E }` | エラー情報の返却 |

このパターンでは例外をthrowせず、戻り値で成功/失敗を明示する。

#### カスタムエラークラス階層

| クラス | 用途 | HTTPステータス |
|--------|------|---------------|
| ApplicationError | 基底クラス | - |
| ValidationError | 入力検証エラー | 400/422 |
| NotFoundError | リソース不存在 | 404 |
| UnauthorizedError | 認可エラー | 403 |
| InternalError | 内部エラー | 500 |

---

## デスクトップ（Electron）実装パターン

### IPC通信パターン

| パターン | 方向 | 用途 |
|----------|------|------|
| 単方向（Push） | Main → Renderer | 通知、プログレス更新 |
| 双方向（Request/Response） | Renderer ↔ Main | データ取得、操作実行 |
| ストリーミング | Main → Renderer（連続） | AI応答、ログ出力 |

#### IPC通信設計原則

| 原則 | 説明 |
|------|------|
| Whitelist方式 | 許可されたチャンネルのみ通信可能 |
| 型安全性 | チャンネル名と引数/戻り値の型を定義 |
| エラーハンドリング | Main側でtry-catch、Result型で返却 |
| セキュリティ | sender検証、パス検証を実施 |

### サービス層パターン

#### Facadeパターン

| 要素 | 説明 |
|------|------|
| 目的 | 複雑なサブシステムへの単純なインターフェース提供 |
| 構成 | 複数の下位サービス（DB、Config、Logger等）を統合 |
| 初期化 | initialize()メソッドで依存関係を初期化 |
| 公開API | 上位から必要な操作のみを公開 |

### データ永続化パターン

| 用途 | 技術 | 設定 |
|------|------|------|
| アプリデータ | better-sqlite3 | WALモード、NORMAL同期 |
| ユーザー設定 | electron-store | スキーマ検証、暗号化オプション |
| 機密情報 | safeStorage | OSキーチェーン活用 |

#### SQLite最適化設定

| 設定 | 値 | 効果 |
|------|-----|------|
| journal_mode | WAL | 並行読み取り性能向上 |
| synchronous | NORMAL | 書き込み性能と安全性のバランス |

### ウィンドウ管理パターン

| 機能 | 説明 |
|------|------|
| ウィンドウ登録 | Map構造でID管理 |
| ライフサイクル管理 | closed イベントで自動削除 |
| 一括操作 | closeAll()で全ウィンドウ終了 |

---

## パフォーマンス最適化パターン

### React最適化

| テクニック | 用途 | 適用基準 |
|-----------|------|----------|
| React.memo | 純粋コンポーネント | Props変化時のみ再レンダリングが必要な場合 |
| useMemo | 重い計算結果 | 計算コストが高く、依存が変わらない場合 |
| useCallback | コールバック安定化 | React.memo子に渡す関数 |
| lazy/Suspense | コード分割 | ルートレベルのコンポーネント |
| useTransition | 非緊急更新 | 重い状態更新の優先度低下 |

### リスト最適化

| 技術 | 用途 | 閾値 |
|------|------|------|
| 仮想化（@tanstack/react-virtual） | 大量リスト | 100件以上 |
| ウィンドウイング | 無限スクロール | 動的読み込み |

### バンドル最適化

| 手法 | 効果 | 実現方法 |
|------|------|----------|
| Tree Shaking | 未使用コード削除 | ESM形式のimport使用 |
| Code Splitting | 初期ロード削減 | dynamic import |
| 依存関係最小化 | バンドルサイズ削減 | pnpm why で分析 |

### SQLite最適化

| 手法 | 効果 |
|------|------|
| インデックス作成 | クエリ高速化 |
| WALモード | 並行性能向上 |
| Prepared Statement | クエリプラン再利用 |
| VACUUM | 断片化解消 |

---

## セキュリティ実装パターン

### 入力バリデーション

| 手法 | 説明 |
|------|------|
| スキーマ定義 | Zodでフィールドごとにルール定義 |
| parse使用 | 失敗時に例外をthrow |
| safeParse使用 | 失敗時にエラーオブジェクトを返却 |
| カスタムルール | regex、refinementで独自ルール追加 |

### サニタイゼーション

| 対象 | 方法 |
|------|------|
| HTML表示 | Reactのデフォルトエスケープ |
| URL | encodeURIComponent |
| SQLクエリ | Drizzle ORMの自動エスケープ |
| ファイルパス | path.normalize + 許可リスト検証 |

### 認証フロー

| フェーズ | 処理内容 |
|----------|----------|
| 開始 | Code Verifier生成、Code Challenge計算 |
| 認可リクエスト | PKCEパラメータ付きで認可URLを開く |
| コールバック | カスタムプロトコルでコードを受信 |
| トークン交換 | Code Verifierを使用してトークン取得 |
| 保存 | safeStorageで暗号化して保存 |

---

## テスト実装パターン

### テストレベル別アプローチ

| レベル | 対象 | ツール | モック範囲 |
|--------|------|--------|-----------|
| ユニット | 関数、クラス | Vitest | 外部依存全て |
| 統合 | モジュール間連携 | Vitest | 外部サービスのみ |
| コンポーネント | Reactコンポーネント | RTL + Vitest | API、ストア |
| E2E | ユーザーフロー | Playwright | なし（実環境） |

### テスト環境設定パターン（TASK-3-2-F 2026-01-30実装）

| 環境 | 特徴 | 適用ケース |
|------|------|-----------|
| jsdom | 完全なDOM機能、Clipboard API対応 | UI統合テスト、ブラウザAPI依存 |
| happy-dom | 軽量・高速、基本DOM機能 | 単純なコンポーネントテスト |
| node | DOM不要 | ユーティリティ関数、サービス層 |

**テストファイル単位の環境指定**:

| 方法 | 説明 |
|------|------|
| ディレクティブ | ファイル先頭に `// @vitest-environment jsdom` を記述 |
| vitest.config.ts | environmentMatchGlobsで glob パターン指定 |

**グローバルモック設計（setup.ts）**:

| モック対象 | 設定タイミング | 用途 |
|-----------|---------------|------|
| Clipboard API | beforeAll | コピー/ペースト機能テスト |
| window.skillAPI | beforeAll | useSkillExecution等のHook |
| IntersectionObserver | トップレベル | 無限スクロール等 |

**モック上書きパターン**:

グローバルモック後にテスト固有モックを使用する場合、beforeEach内でvi.stubGlobalを再呼び出しする。

| 手順 | 処理 |
|------|------|
| 1 | テストファイルでモックオブジェクト定義 |
| 2 | モジュールレベルでvi.stubGlobal実行 |
| 3 | beforeEach内で再度vi.stubGlobal（setup.ts上書き対策） |
| 4 | vi.clearAllMocks()でカウンターリセット |

### モック戦略

| モック種別 | 用途 | 使用場面 |
|-----------|------|----------|
| Stub | 固定値を返す | 外部サービスのレスポンス |
| Mock | 呼び出し検証 | 関数が正しく呼ばれたか確認 |
| Spy | 実装保持しつつ監視 | 既存実装の振る舞い観察 |
| Fake | 軽量な代替実装 | InMemoryRepository |

### テストデータ管理

| 手法 | 用途 |
|------|------|
| Factory関数 | ユニークなテストデータ生成 |
| Fixture | 固定のテストデータセット |
| Builder | 複雑なオブジェクトの段階的構築 |

### IPC通信テストパターン（TASK-8C-A 2026-02-02実装）

Electron IPC ハンドラーの統合テストにおいて、Main Process のハンドラーを Renderer Process を起動せずにテストするためのパターン群。

#### Handler Map方式

`ipcMain.handle` をモック化し、登録されたハンドラー関数を `Map<string, Function>` に格納する方式。テスト側から `handlers.get(channel)` でハンドラーを直接呼び出すことにより、IPC通信層を経由せず統合テストを実行できる。

| 要素 | 実装 |
|------|------|
| モック対象 | `ipcMain.handle` |
| 格納構造 | `Map<string, (...args: unknown[]) => Promise<unknown>>` |
| ハンドラー取得 | `handlers.get("skill:list-available")` |
| 呼び出し方法 | `handler(mockIpcEvent, ...args)` |
| セットアップ | `beforeEach` 内で `registerSkillHandlers()` を呼び出し、Map にハンドラーを蓄積 |

**使い分け基準**:

| 基準 | Handler Map方式 | 実プロセス起動方式 |
|------|-----------------|-------------------|
| テスト速度 | 高速（プロセス不要） | 低速（Electron起動必要） |
| テスト粒度 | ハンドラーロジック単体 | E2Eプロセス間通信 |
| セットアップ | `vi.mock("electron")` | Spectron/Playwright |
| 適用場面 | 統合テスト（推奨） | E2Eテスト |

#### SkillService Partial Mock

テスト対象ハンドラーの依存サービス（SkillService）を部分モックする方式。全メソッドを `vi.fn()` で置き換えつつ、テストケースごとに `mockResolvedValueOnce` で個別の戻り値を設定する。

| 要素 | 実装 |
|------|------|
| モック構造 | 全メソッドを `vi.fn()` で定義したオブジェクトリテラル |
| 型キャスト | `mockSkillService as never` で型チェックを回避 |
| 個別設定 | `mockSkillService.scanAvailableSkills.mockResolvedValueOnce(data)` |
| リセット | `vi.clearAllMocks()` を `beforeEach` で実行 |

**メソッド数の目安**: テスト対象の全IPCチャネルが呼び出すServiceメソッドを網羅する（TASK-8C-Aでは15メソッド）。

#### invokeOptionalHandler パターン

未実装チャネル（将来実装予定）のテストを「ハンドラー未登録」の検証として記述する方式。ハンドラーが登録されていれば実行し、未登録であれば `undefined` を検証する。

| 要素 | 実装 |
|------|------|
| ヘルパー関数 | `invokeOptionalHandler(handlerMap, channel, ...args)` |
| 戻り値（登録済み） | `{ exists: true, result: unknown }` |
| 戻り値（未登録） | `{ exists: false }` |
| テスト記述 | `it("should handle channel (if handler exists)", ...)` |

**移行容易性**: ハンドラーが実装された時点で、テストは自動的に実ハンドラーパスを通過するため、テストコードの変更は不要。

#### validateIpcSender失敗検証パターン

セキュリティ検証（`validateIpcSender`）の失敗パスをテストする方式。`mockReturnValueOnce` で一時的にバリデーション失敗を返し、ハンドラーがエラー応答を返すことを検証する。

| 要素 | 実装 |
|------|------|
| モック設定 | `validateIpcSender.mockReturnValueOnce({ valid: false, errorCode: "..." })` |
| 検証対象 | ハンドラーが `success: false` を返すこと |
| エラー変換 | `toIPCValidationError(result)` で統一エラー形式に変換 |
| 適用チャネル | セキュリティ上重要なチャネル（abort, get-status等） |

### E2Eテストパターン（TASK-8C-C 2026-02-02実装）

Playwright + Vitest を使用した Electron アプリケーションの E2E テストパターン群。

#### Electron E2Eセットアップパターン

Playwright の `_electron` モジュールを使用して Electron アプリケーションを起動し、E2E テストを実行するためのセットアップパターン。

| 要素 | 実装 |
|------|------|
| 起動メソッド | `_electron.launch({ args: [...], env: {...} })` |
| ウィンドウ取得 | `electronApp.firstWindow()` |
| 待機処理 | `page.waitForLoadState("domcontentloaded")` |
| 終了処理 | `electronApp?.close()` |
| 環境変数 | `NODE_ENV: "test"`, `TEST_SKILLS_DIR: fixtureDir` |

**テストライフサイクル**:

| フック | 用途 |
|--------|------|
| beforeAll | Electron アプリ起動、初期ページ取得 |
| afterAll | Electron アプリ終了 |
| beforeEach | テスト間の状態リセット |

#### セレクタ定数パターン

E2E テストで使用するセレクタを定数オブジェクトとして一元管理するパターン。

| 要素 | 実装 |
|------|------|
| 構造 | `const SELECTORS = { ... } as const` |
| role セレクタ | `role=combobox`, `role=listbox`, `role=option` |
| text セレクタ | `text="スキャン中..."` |
| data-testid | `[data-testid="skill-streaming-view"]` |
| 動的セレクタ | `skillOption: (name: string) => \`role=option >> text="${name}"\`` |
| aria-label | `[aria-label="再スキャン"]` |

**セレクタ優先順位**:

| 優先度 | セレクタ種別 | 理由 |
|--------|------------|------|
| 1 | role セレクタ | アクセシビリティ準拠、実装非依存 |
| 2 | data-testid | テスト専用、安定性高い |
| 3 | text セレクタ | 可読性高いが変更に弱い |
| 4 | CSS クラス | 最終手段、スタイル変更に弱い |

#### タイムアウト定数パターン

操作種別ごとにタイムアウト値を定数化し、テストの安定性と可読性を向上させるパターン。

| 要素 | 実装 |
|------|------|
| 構造 | `const TIMEOUTS = { ... } as const` |
| ダイアログ表示 | `dialog: 5000` |
| スキャン完了 | `scan: 10000` |
| 実行状態変化 | `execution: 5000` |

**適用場面**: `page.waitForSelector()`, `expect().toBeVisible()` の timeout 引数

#### ヘルパー関数パターン

頻出する操作をヘルパー関数として抽出し、テストコードの重複を排除するパターン。

| 関数 | 用途 | 戻り値 |
|------|------|--------|
| `openSkillSelector(page)` | スキル選択UIを開く | Promise<void> |
| `openImportDialog(page, skillName)` | 未インポートスキルを選択してダイアログを開く | Promise<void> |
| `importSkillViaAPI(page, skillName)` | API経由でスキルをインポート | Promise<void> |
| `startSkillExecution(page, prompt)` | スキル実行を開始 | Promise<void> |
| `resetForTesting(page)` | テスト間の状態リセット | Promise<void> |

**ヘルパー関数設計原則**:

| 原則 | 説明 |
|------|------|
| 単一責任 | 1つの関数は1つの操作のみ |
| 暗黙の待機 | 必要な待機処理を関数内に含める |
| 状態非依存 | 関数呼び出し前の状態に依存しない |
| エラー伝播 | 例外は呼び出し元に伝播（catch しない） |

#### テストグループ構成パターン

関連するテストケースを describe ブロックでグループ化し、テストの構造を明確にするパターン。

| グループ | テストケース数 | 内容 |
|----------|---------------|------|
| Skill Import Flow | 3 | ダイアログ表示、詳細表示、インポート実行 |
| Skill Execution Flow | 3 | ストリーミング、停止ボタン、中止 |
| Rescan Flow | 1 | 再スキャン実行 |
| Edge Cases | 2 | 無効スキル除外、インポート済み再選択 |

**ネスト beforeEach パターン**: Execution Flow グループでは beforeEach でスキルを事前インポートし、各テストケースの前提条件を統一する。

#### page.evaluate パターン

Renderer Process のコンテキストで JavaScript を実行し、Electron API 経由で操作を行うパターン。

| 要素 | 実装 |
|------|------|
| 構文 | `page.evaluate(async (arg) => { ... }, arg)` |
| コンテキスト | Renderer Process（window オブジェクトにアクセス可能） |
| 用途 | preload API 呼び出し、DOM 直接操作、状態リセット |
| 引数渡し | 第2引数でシリアライズ可能な値を渡す |

**使用例**: `window.electronAPI?.skill?.resetForTesting?.()`

### Main→Renderer逆方向クエリパターン（TASK-WCE-MONACO-001 2026-02-03実装）

通常のElectron IPCは Renderer → Main 方向の通信が基本だが、Main ProcessからRenderer Processの状態を取得する必要がある場合（例: Monaco Editorの選択範囲取得）に使用するパターン。

#### 問題定義（Problem Statement）

| 問題 | 影響 | 発生条件 |
|------|------|----------|
| 通常IPCの方向制限 | Main側でUI状態を把握できない | Renderer状態に依存する機能 |
| Renderer状態アクセス不可 | DOM/コンポーネント状態の直接参照不可 | Monaco Editor等のUI状態取得 |
| 非同期タイミング問題 | レースコンディション発生 | エディタ未初期化時のアクセス |

#### 解決アプローチ

**コア解決策**: `webContents.executeJavaScript()` でMain→Rendererクエリを実現

| 解決策 | 適用対象 | 効果 |
|--------|----------|------|
| グローバルブリッジ | 状態公開 | Rendererから安全にMain参照可能な関数を公開 |
| Optional chaining | null安全性 | 未初期化時のクラッシュ防止 |
| フォールバック戦略 | webContents取得 | focused/first順でコンテキスト取得 |

#### 実装パターン構成

| 要素 | 役割 | 実装 |
|------|------|------|
| ブリッジインターフェース | Rendererに公開するグローバルオブジェクト | `window.__editorSelection = { getSelection: () => ... }` |
| エディタ登録関数 | Monaco EditorインスタンスをRendererで登録 | `setActiveEditor(editor)` でグローバル変数に格納 |
| Main側クエリ関数 | RendererのブリッジインターフェースをMain Processから呼び出し | `webContents.executeJavaScript('window.__editorSelection?.getSelection()')` |
| IPCハンドラー | preload API経由でRenderer→Mainトリガー | `ipcMain.handle("chat-edit:get-selection", handler)` |

#### 実装時の課題と解決策（再利用可能ナレッジ）

> **このセクションは同様のIPC課題を持つ将来のタスクで参照されることを想定**

| 課題ID | 課題 | 根本原因 | 解決策 | 適用条件 |
|--------|------|----------|--------|----------|
| MR-01 | webContentsがnull | BrowserWindow未作成/クローズ済み | focusedWebContents ?? firstWebContentsのフォールバック | Main→Renderer全般 |
| MR-02 | 未登録エラー | setActiveEditor未呼び出し | Optional chaining（`?.`）使用 | グローバルブリッジ全般 |
| MR-03 | 非同期結果処理 | executeJavaScriptがPromise | async/await適切使用 | Main→Renderer全般 |
| MR-04 | TypeScript型エラー | グローバル変数型未定義 | `declare global { interface Window { __xxx?: {...} } }` | グローバルブリッジ全般 |

**汎用チェックリスト**（Main→Renderer実装時に確認）:
- [ ] ブリッジオブジェクトはwindow直下に配置
- [ ] getterメソッドはOptional chainingで保護
- [ ] webContents取得にフォールバックを実装
- [ ] 型定義ファイルでdeclare globalを追加
- [ ] 単体テストでnull/undefined両ケースをカバー

#### 使い分け基準

| 基準 | Main→Rendererクエリ | 通常IPC（Renderer→Main） |
|------|---------------------|-------------------------|
| 主体 | Main ProcessがRenderer状態を「取得」 | RendererがMainに「要求」 |
| 用途 | UIコンポーネント状態、DOM状態の読み取り | データ取得、外部API呼び出し、ファイル操作 |
| 実装 | webContents.executeJavaScript | ipcMain.handle + ipcRenderer.invoke |
| 典型例 | エディタ選択範囲、フォーム入力値、スクロール位置 | DBクエリ、設定読み込み、ファイル読み書き |

#### セキュリティ考慮事項

| リスク | 対策 | 重要度 |
|--------|------|--------|
| 任意JS実行 | 信頼できる固定文字列のみ実行 | 高 |
| ユーザー入力注入 | 入力をJS文字列に連結しない | 高 |
| サンドボックス回避 | preload経由のみで実行 | 中 |

**関連ドキュメント**: [api-ipc-agent.md](./api-ipc-agent.md)（実装詳細・完了タスク記録）

---

## アクセシビリティ実装パターン

### キーボードナビゲーション

| キー | 期待動作 |
|------|----------|
| Tab | 次のインタラクティブ要素へ移動 |
| Shift+Tab | 前のインタラクティブ要素へ移動 |
| Enter | ボタン実行、リンク遷移 |
| Space | チェックボックストグル、ボタン実行 |
| Escape | モーダル/ドロップダウンを閉じる |
| 矢印キー | リスト内移動、ラジオボタン選択 |

### ARIA属性

| 属性 | 用途 | 適用場面 |
|------|------|----------|
| aria-label | 視覚ラベルがない要素の説明 | アイコンボタン |
| aria-describedby | 追加説明の関連付け | フォームヒント |
| aria-expanded | 展開/折りたたみ状態 | アコーディオン |
| aria-live | 動的コンテンツの通知 | トースト、アラート |
| role | 要素の役割を明示 | カスタムコンポーネント |

---

## 関連ドキュメント

| ドキュメント | 内容 |
|--------------|------|
| [architecture-overview.md](./architecture-overview.md) | アーキテクチャ全体像 |
| [development-guidelines.md](./development-guidelines.md) | 開発ガイドライン |
| [ui-ux-design-principles.md](./ui-ux-design-principles.md) | UI/UXデザイン原則 |
| [security-principles.md](./security-principles.md) | セキュリティ原則 |
| [quality-requirements.md](./quality-requirements.md) | 非機能要件・テスト |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.7.0 | 2026-02-03 | TASK-WCE-MONACO-001スキル最適化: Main→Rendererパターン再構成（Problem Statement追加、課題IDテーブル、汎用チェックリスト、セキュリティ考慮事項表追加）、api-ipc-agent.md相互リンク追加 |
| 1.6.0 | 2026-02-03 | TASK-WCE-MONACO-001: Main→Renderer逆方向クエリパターン追加（webContents.executeJavaScript、グローバルブリッジ、苦戦ポイントと対処法） |
| 1.5.0 | 2026-02-02 | TASK-8C-C: E2Eテストパターン追加（Electron E2Eセットアップ、セレクタ定数、タイムアウト定数、ヘルパー関数、テストグループ構成、page.evaluate） |
| 1.4.0 | 2026-02-02 | TASK-8C-A: IPC通信テストパターン追加（Handler Map方式、SkillService Partial Mock、invokeOptionalHandler、validateIpcSender失敗検証） |
| 1.3.0 | 2026-01-30 | TASK-7D: forwardRef + useImperativeHandleパターン、React.memo + Exclude型パターン追加 |
| 1.2.0 | 2026-01-30 | TASK-3-2-F: テスト環境設定パターン追加（jsdom/happy-dom選択、グローバルモック設計、モック上書きパターン） |
| 1.1.0 | 2026-01-26 | 仕様ガイドライン準拠: コード例削除、文章・表形式に変更 |
| 1.0.0 | 2026-01-26 | 初版作成 |
