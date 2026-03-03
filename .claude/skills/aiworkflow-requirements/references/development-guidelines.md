# 開発ガイドライン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-overview.md](./architecture-overview.md)

---

## ロギング戦略

### 構造化ログの原則

| 原則                 | 説明                                                 |
| -------------------- | ---------------------------------------------------- |
| **構造化形式**       | JSON形式でログを出力し、パース可能な形式を維持       |
| **コンテキスト付与** | リクエストID、ユーザーID、タイムスタンプを常に含める |
| **レベル分離**       | 適切なログレベルで出力し、フィルタリングを容易に     |
| **機密情報除外**     | パスワード、APIキー、個人情報はログに含めない        |

### ログレベル

| レベル    | 用途                     | 例                           |
| --------- | ------------------------ | ---------------------------- |
| **ERROR** | 即座に対応が必要なエラー | DB接続失敗、API認証エラー    |
| **WARN**  | 潜在的な問題、監視が必要 | リトライ発生、非推奨API使用  |
| **INFO**  | 重要なビジネスイベント   | ユーザーログイン、タスク完了 |
| **DEBUG** | 開発時のデバッグ情報     | 関数の入出力、状態変化       |
| **TRACE** | 詳細なトレース情報       | ループ内の値、低レベルの操作 |

### Electron環境でのログ出力

| プロセス | 出力先                     | 用途                                |
| -------- | -------------------------- | ----------------------------------- |
| Main     | ファイル + コンソール      | 起動ログ、IPC通信、システムイベント |
| Renderer | コンソール + IPC経由でMain | UIイベント、ユーザーアクション      |
| 本番環境 | electron-log               | ローテーション付きファイル出力      |

### ログエントリ構造

| フィールド        | 型       | 説明                         |
| ----------------- | -------- | ---------------------------- |
| timestamp         | string   | ISO 8601形式のタイムスタンプ |
| level             | LogLevel | ログレベル                   |
| message           | string   | ログメッセージ               |
| context.requestId | string   | リクエスト識別子             |
| context.userId    | string   | ユーザー識別子               |
| context.component | string   | コンポーネント名             |
| error.name        | string   | エラー名（エラー時のみ）     |
| error.message     | string   | エラーメッセージ             |
| error.stack       | string   | スタックトレース             |

### 禁止事項

| 禁止項目              | 理由               |
| --------------------- | ------------------ |
| パスワードのログ出力  | セキュリティリスク |
| APIキーの出力         | 漏洩リスク         |
| 個人情報（PII）の出力 | プライバシー保護   |
| 大量のバイナリデータ  | ログ肥大化         |
| console.logの本番使用 | 構造化ログを使用   |

### Skill系Main Processログ規約（TASK-FIX-14-1）

| 項目 | 規約 |
| ---- | ---- |
| 対象 | `apps/desktop/src/main/services/skill/` 配下の本番コード |
| 必須ライブラリ | `electron-log` |
| ログプレフィックス | `[ClassName]` 形式（例: `[SkillImportManager]`） |
| レベル割当 | `error`=処理失敗, `warn`=継続可能な異常, `info`=状態変化, `debug`=開発詳細 |
| テスト方針 | `vi.mock(\"electron-log\")` で `error/warn/info/debug` をモックし、必要箇所は呼び出し検証 |
| 補足 | 2026-02-14時点で `SkillExecutor.ts` の残存4箇所は `TASK-FIX-14-2` で継続管理 |

> **詳細ガイド**: [logging-migration-guide.md](./logging-migration-guide.md) に移行手順チェックリスト、コードパターン、テストモックテンプレートを記載

#### 移行適用範囲（2026-02-14時点）

| ファイル | ステータス | 移行箇所数 | タスクID |
| -------- | ---------- | ---------- | -------- |
| SkillScanner.ts | ✅ 移行完了 | 7箇所 | TASK-FIX-14-1 |
| PermissionStore.ts | ✅ 移行完了 | 7箇所 | TASK-FIX-14-1 |
| SkillImportManager.ts | ✅ 移行完了 | 9箇所 | TASK-FIX-14-1 |
| SkillAnalyzer.ts | ✅ 移行完了 | 1箇所 | TASK-FIX-14-1 |
| SkillExecutor.ts | 🔲 未着手 | 4箇所 | TASK-FIX-14-2 |

---

## キャッシング戦略

### キャッシュレイヤー

| レイヤー             | 実装            | 用途                     | TTL目安          |
| -------------------- | --------------- | ------------------------ | ---------------- |
| **メモリキャッシュ** | Map / LRU Cache | 頻繁にアクセスするデータ | 5分-30分         |
| **SQLiteキャッシュ** | better-sqlite3  | 永続的なローカルデータ   | 1日-7日          |
| **React Query**      | TanStack Query  | APIレスポンス            | 5分（staleTime） |

### キャッシュ戦略パターン

| パターン          | 説明                     | 使用場面                 |
| ----------------- | ------------------------ | ------------------------ |
| **Cache-Aside**   | 必要時にキャッシュを更新 | 読み取り頻度が高いデータ |
| **Write-Through** | 書き込み時に同時更新     | 一貫性が重要なデータ     |
| **Write-Behind**  | 非同期で後からDB更新     | 高頻度書き込み           |
| **Refresh-Ahead** | 有効期限前にプリフェッチ | 予測可能なアクセス       |

### React Queryの設定

| 設定項目             | 推奨値 | 説明                              |
| -------------------- | ------ | --------------------------------- |
| staleTime            | 5分    | データが古くなるまでの時間        |
| gcTime               | 30分   | キャッシュ保持時間（旧cacheTime） |
| retry                | 3      | リトライ回数                      |
| refetchOnWindowFocus | false  | 個人開発では無効化                |

### キャッシュ無効化

| トリガー           | アクション                 |
| ------------------ | -------------------------- |
| データ更新         | 関連クエリをinvalidate     |
| ユーザーアクション | 手動でrefetch              |
| 時間経過           | staleTime経過後にrefetch   |
| エラー発生         | キャッシュを保持、リトライ |

---

## データマイグレーション

### SQLiteマイグレーション戦略

| 項目           | 方針                               |
| -------------- | ---------------------------------- |
| ツール         | Drizzle Kit                        |
| ファイル配置   | packages/shared/src/db/migrations/ |
| 命名規則       | NNNN_description.sql（連番）       |
| 実行タイミング | アプリ起動時に自動実行             |

### マイグレーションのベストプラクティス

| 原則             | 説明                                     |
| ---------------- | ---------------------------------------- |
| **後方互換性**   | 古いスキーマでも動作するコードを維持     |
| **段階的変更**   | 大きな変更は複数のマイグレーションに分割 |
| **ロールバック** | DOWN マイグレーションを常に用意          |
| **データ保全**   | 破壊的変更前にバックアップ促進           |

### マイグレーション手順

| ステップ | コマンド/操作 | 説明                                        |
| -------- | ------------- | ------------------------------------------- |
| 1        | スキーマ変更  | packages/shared/src/db/schema/xxx.ts を編集 |
| 2        | 生成          | pnpm drizzle-kit generate                   |
| 3        | 確認          | pnpm drizzle-kit push --dry-run             |
| 4        | 実行          | pnpm drizzle-kit push                       |

### 破壊的変更の対処

| 変更タイプ     | 対処法                                         |
| -------------- | ---------------------------------------------- |
| カラム削除     | NULL許可 → コード更新 → カラム削除（3段階）    |
| テーブル名変更 | 新テーブル作成 → データコピー → 旧テーブル削除 |
| 型変更         | 新カラム追加 → データ移行 → 旧カラム削除       |

---

## コードレビューガイドライン

### レビューチェックリスト

#### 機能面

| 項目               | 確認内容                                     |
| ------------------ | -------------------------------------------- |
| 要件充足           | 仕様通りに実装されているか                   |
| エッジケース       | 境界値、null/undefined、空配列の処理         |
| エラーハンドリング | 適切なエラー処理とユーザーへのフィードバック |

#### コード品質

| 項目     | 確認内容                                 |
| -------- | ---------------------------------------- |
| 命名     | 変数・関数名が意図を明確に表現しているか |
| 単一責任 | 関数・クラスが1つの責務に集中しているか  |
| DRY      | 重複コードがないか                       |
| YAGNI    | 不要な機能を先回りで実装していないか     |

#### セキュリティ

| 項目                 | 確認内容                               |
| -------------------- | -------------------------------------- |
| 入力検証             | ユーザー入力をバリデーションしているか |
| 機密情報             | APIキー等がハードコードされていないか  |
| XSS/インジェクション | 適切にサニタイズされているか           |

#### パフォーマンス

| 項目                 | 確認内容                                             |
| -------------------- | ---------------------------------------------------- |
| N+1問題              | データベースクエリが最適化されているか               |
| メモリリーク         | イベントリスナー等が適切にクリーンアップされているか |
| 不要な再レンダリング | React.memo、useMemo、useCallbackの適切な使用         |

### レビューコメントの書き方

| 接頭辞     | 意味       | 例                                 |
| ---------- | ---------- | ---------------------------------- |
| [must]     | 必須の修正 | XSSの脆弱性があります              |
| [should]   | 推奨の修正 | この関数は分割した方が読みやすい   |
| [nit]      | 些細な指摘 | typo: recieve → receive            |
| [question] | 質問       | この実装の意図は？                 |
| [praise]   | 良い点     | このエラーハンドリングは素晴らしい |

---

## パフォーマンス最適化

### React最適化パターン

| パターン        | 用途                     | 適用基準                      |
| --------------- | ------------------------ | ----------------------------- |
| **React.memo**  | 純粋コンポーネント       | Props変化時のみ再レンダリング |
| **useMemo**     | 重い計算結果のキャッシュ | 計算コストが高い場合          |
| **useCallback** | コールバック関数の安定化 | React.memo子に渡す関数        |
| **React.lazy**  | コード分割               | ルートレベルでの遅延ロード    |

### useMemo/useCallback使用基準

| 使うべき場面                 | 使わなくてよい場面     |
| ---------------------------- | ---------------------- |
| 重い計算処理                 | プリミティブ値の計算   |
| 参照が変わると問題になる場合 | ルートコンポーネント   |
| React.memoの子に渡す関数     | 単純なイベントハンドラ |

### Zustand Store Hooks 無限ループ防止（P31対策）

合成Store Hook（複数のプロパティをまとめて返すHook）の関数を`useEffect`の依存配列に含めると無限ループが発生する問題への対策。

| パターン             | 説明                                                 | 推奨度  |
| -------------------- | ---------------------------------------------------- | ------- |
| useRefガード         | 初期化フラグを`useRef`で管理し、依存配列を空にする   | 短期    |
| 個別セレクタ         | `useAuthMode()`, `useSetAuthMode()`等の個別Hookを使用 | **長期** |
| 安定した関数参照     | Store外部で定義した関数を渡すか、useCallbackで安定化 | 状況次第 |

**問題のあるパターン**:

| 問題                        | 症状                                   |
| --------------------------- | -------------------------------------- |
| 合成Hook関数を依存配列に追加 | 設定画面が無限にぐるぐる回り続ける     |
| 毎回新オブジェクト生成       | LLM/スキル選択が無限実行される         |

**解決策の優先順位**:

| 優先度 | 解決策                                                       |
| ------ | ------------------------------------------------------------ |
| 1      | 個別セレクタベースに再設計（`useAuthMode()`, `useSetAuthMode()`等）|
| 2      | 既存コードは`useRef`でガードし、依存配列を空にする           |
| 3      | 初期化処理はコンポーネント外またはStoreの初期化時に移動      |

詳細: `.claude/rules/06-known-pitfalls.md#P31`

### 個別セレクタ命名規約

新規セレクタ追加時は以下の命名パターンに従う。

| カテゴリ | プレフィックス | 例 | 用途 |
| -------- | -------------- | --- | ---- |
| 状態取得 | `use{StateName}` | `useSkills`, `useSelectedSkill` | Store内の値をそのまま返す |
| アクション | `use{ActionVerb}{Target}` | `useFetchSkills`, `useSelectSkill` | Store内のアクション関数を返す |
| boolean状態 | `useIs{Condition}` | `useIsLoadingSkills`, `useIsExecuting` | boolean値を返す |
| boolean状態 | `useHas{Condition}` | `useHasPermissionRequest` | 存在判定のboolean値を返す |
| 派生状態 | `use{DerivedName}` | `useSkillLifecycleState`, `useLLMDisplayName` | 複数状態から計算した値を返す |
| 複合状態 | `use{Feature}State` | `useSkillLifecycleState` | 特定機能の関連状態をまとめて返す |

**命名の原則**:
- 状態取得は名詞形（`useSkills`）、アクションは動詞形（`useFetchSkills`）
- `is` / `has` / `can` / `should` プレフィックスはboolean専用
- `@repo/shared` の型名と一致させる（例: `Suggestion` 型 → `useSkillSuggestions`）

### Zustand Hook テスト戦略（renderHook パターン）

個別セレクタHookのテストでは `renderHook` パターンを使用する。`getState()` 直接呼び出しはReactサブスクリプションを経由しないため、テスト対象として不適切。

**テスト環境の前提条件**: テストファイル先頭に `@vitest-environment happy-dom` ディレクティブが必要。また `localStorage` は happy-dom に含まれないため `Object.defineProperty` によるポリフィルが必要。

| 対象 | 旧パターン（非推奨） | 新パターン（推奨） |
| --- | --- | --- |
| 状態取得 | `store.getState().field` | `renderHook(() => useField())` |
| 状態変更 | `store.setState({...})` | `act(() => useAppStore.setState({...}))` |
| アクション実行 | `store.getState().action()` | `renderHook` + `act()` |
| 非同期アクション | `await action()` | `await act(async () => { ... })` |

**テスト間の状態リセット手順**:

| 順序 | 処理 | 目的 |
| --- | --- | --- |
| 1 | `resetStore()` | Zustand Storeを初期状態に復元 |
| 2 | `cleanup()` | renderHookで生成されたReactツリーを破棄 |
| 3 | `vi.restoreAllMocks()` | モック関数をオリジナルに復元 |

**renderHookパターンの利点**:

| 利点 | 説明 |
| --- | --- |
| Reactサブスクリプション検証 | コンポーネントが実際に使用する経路でテスト可能 |
| 参照安定性テスト | `result.current` が同一参照を返すことを検証可能 |
| 無限ループ検出 | `renderCount` カウンターで不要な再レンダリングを検出可能 |

**テスト実績**（2026-02-12現在）: agentSlice 114テスト、authModeSlice 70+テスト、llmSlice 60+テスト、全PASS。

参照: [testing-component-patterns.md#9-zustand-store-hooks-テストパターン](./testing-component-patterns.md#9-zustand-store-hooks-テストパターン)、[arch-state-management.md#store-hooks-テスト実装ガイド](./arch-state-management.md#store-hooks-テスト実装ガイド)

### バンドル最適化

| 手法             | 効果                         |
| ---------------- | ---------------------------- |
| Tree Shaking     | 未使用コードの削除           |
| Code Splitting   | 初期ロード時間の短縮         |
| Dynamic Import   | 必要時にのみモジュールロード |
| 依存関係の最小化 | バンドルサイズ削減           |

### Electron最適化

| 項目     | 最適化手法                                   |
| -------- | -------------------------------------------- |
| 起動時間 | 遅延ロード、プリロード最小化                 |
| メモリ   | 未使用リソースの解放、ウィンドウの効率的管理 |
| IPC通信  | バッチ処理、不要な通信の削減                 |
| SQLite   | インデックス最適化、WALモード有効化          |

---

## 国際化（i18n）

### 対応言語

| 言語   | コード | 優先度   |
| ------ | ------ | -------- |
| 日本語 | ja     | 主言語   |
| 英語   | en     | 第二言語 |

### ファイル構造

| ディレクトリ               | 内容               |
| -------------------------- | ------------------ |
| locales/ja/                | 日本語翻訳ファイル |
| locales/en/                | 英語翻訳ファイル   |
| locales/{lang}/common.json | 共通翻訳           |
| locales/{lang}/errors.json | エラーメッセージ   |
| locales/{lang}/features/   | 機能別翻訳         |

### i18n実装ガイドライン

| 原則             | 説明                           |
| ---------------- | ------------------------------ |
| キーの命名       | feature.component.element 形式 |
| プレースホルダー | {{name}} 形式で変数を埋め込み  |
| 複数形対応       | \_one, \_other サフィックス    |
| 日付・数値       | Intl APIを使用                 |

---

## Git ワークフロー

### ブランチ戦略

| ブランチ    | 用途             | マージ先 |
| ----------- | ---------------- | -------- |
| main        | 本番環境         | -        |
| feature/\*  | 機能開発         | main     |
| fix/\*      | バグ修正         | main     |
| refactor/\* | リファクタリング | main     |

### コミットメッセージ規約

| type     | 用途                         |
| -------- | ---------------------------- |
| feat     | 新機能                       |
| fix      | バグ修正                     |
| docs     | ドキュメント                 |
| style    | フォーマット（機能変更なし） |
| refactor | リファクタリング             |
| test     | テスト追加・修正             |
| chore    | ビルド・補助ツール           |

**形式**: `<type>(<scope>): <subject>`

### プルリクエストテンプレート

| セクション     | 内容                                   |
| -------------- | -------------------------------------- |
| 概要           | 変更内容を簡潔に説明                   |
| 変更理由       | なぜこの変更が必要か                   |
| テスト方法     | 動作確認の手順                         |
| チェックリスト | テスト追加、ドキュメント更新、Lint通過 |

---

## 命名規則

### ファイル命名

| 種類           | 規則                  | 例                                |
| -------------- | --------------------- | --------------------------------- |
| コンポーネント | PascalCase            | UserAvatar.tsx, SettingsPanel.tsx |
| フック         | camelCase + use接頭辞 | useAuth.ts, useChatHistory.ts     |
| ユーティリティ | camelCase             | formatDate.ts, validateInput.ts   |
| 型定義         | camelCase             | types.ts, schema.ts               |
| テスト         | 元ファイル名 + .test  | UserAvatar.test.tsx               |
| 仕様書         | kebab-case            | api-endpoints.md, ui-ux-design.md |

### 変数・関数命名

| 種類              | 規則                    | 例                             |
| ----------------- | ----------------------- | ------------------------------ |
| 変数              | camelCase               | userName, isLoading            |
| 定数              | UPPER_SNAKE_CASE        | MAX_RETRY_COUNT, API_BASE_URL  |
| Boolean           | is/has/can/should接頭辞 | isVisible, hasError, canSubmit |
| イベントハンドラ  | handle接頭辞            | handleClick, handleSubmit      |
| コールバックProps | on接頭辞                | onClick, onSubmit, onChange    |
| 非同期関数        | 動詞で開始              | fetchUsers, saveSettings       |

### コンポーネント命名

| パターン   | 規則            | 例                          |
| ---------- | --------------- | --------------------------- |
| 基本       | 名詞            | Button, Modal, Card         |
| バリアント | 修飾語 + 名詞   | PrimaryButton, ConfirmModal |
| 機能特化   | 機能 + 基本名   | UserAvatar, SearchInput     |
| レイアウト | Layout接尾辞    | MainLayout, SidebarLayout   |
| コンテナ   | Container接尾辞 | UserListContainer           |
| プロバイダ | Provider接尾辞  | AuthProvider, ThemeProvider |

### TypeScript型命名

| 種類             | 規則                        | 例                      |
| ---------------- | --------------------------- | ----------------------- |
| インターフェース | I接頭辞（任意）+ PascalCase | User, IRepository       |
| 型エイリアス     | PascalCase                  | UserId, ApiResponse     |
| Enum             | PascalCase（単数形）        | Status, ErrorCode       |
| ジェネリクス     | 単一大文字 or 説明的        | T, TData, TError        |
| Props            | コンポーネント名 + Props    | ButtonProps, ModalProps |
| State            | State接尾辞                 | AuthState, ChatState    |

---

## デバッグガイド

### Electron DevTools

| 対象     | 開き方             | 用途                         |
| -------- | ------------------ | ---------------------------- |
| Renderer | Cmd+Option+I / F12 | UIデバッグ、ネットワーク確認 |
| Main     | --inspect フラグ   | Main Processデバッグ         |

### Main Processデバッグ

| 手順             | 説明                                  |
| ---------------- | ------------------------------------- |
| 起動コマンド     | pnpm --filter @repo/desktop dev:debug |
| VSCode接続       | launch.jsonでattach設定（port: 9229） |
| ブレークポイント | Main Processコードに設置可能          |

### よくある問題と解決策

| 問題                  | 原因                 | 解決策                      |
| --------------------- | -------------------- | --------------------------- |
| IPC通信が動かない     | チャンネル名不一致   | Whitelist確認、型定義確認   |
| Preload API undefined | contextIsolation設定 | window.\*APIの公開確認      |
| ホットリロードしない  | Vite設定             | vite.config.tsのHMR設定確認 |
| SQLite接続エラー      | パス問題             | app.getPath('userData')確認 |
| メモリリーク          | イベントリスナー     | removeListener呼び出し確認  |

### Vitestテスト固有の問題と解決策（TASK-9A-A 2026-02-03追加）

| 問題                                 | 原因                                 | 解決策                                                                |
| ------------------------------------ | ------------------------------------ | --------------------------------------------------------------------- |
| `Cannot redefine property: readFile` | ESModuleエクスポートは読み取り専用   | vi.spyOn()を使わず、実際のエラー条件（存在しないパス等）を使用        |
| 期待と異なるエラークラス発生         | 入力条件により複数のエラーパスが存在 | `.rejects.toThrow()`で汎用的に検証、特定クラスに依存しない            |
| act()警告が大量発生                  | 非同期状態更新がテスト外で発生       | vi.useFakeTimers() + vi.advanceTimersByTime()、または waitFor()を使用 |
| jsdomでClipboard APIがundefined      | happy-domからの移行不完全            | setup.tsでvi.fn().mockResolvedValue()でモック設定                     |

**ESModuleモッキング回避パターン**:

| 対象モジュール   | 推奨アプローチ           | 理由                                   |
| ---------------- | ------------------------ | -------------------------------------- |
| node:fs/promises | 存在しないパスを使用     | ENOENTエラーを自然に発生               |
| node:path        | モック不要（純粋関数）   | 副作用なし                             |
| electron-store   | vi.doMock() + 動的import | コンストラクタ初期化をテストごとに制御 |

### ログ確認方法

| 環境           | ログ場所                                        |
| -------------- | ----------------------------------------------- |
| 開発           | ターミナル + DevTools Console                   |
| 本番 (macOS)   | ~/Library/Logs/{app-name}/                      |
| 本番 (Windows) | %USERPROFILE%\AppData\Roaming\{app-name}\logs\  |

---

## リリースプロセス

### バージョニング（Semantic Versioning）

| 変更種別   | バージョン    | 例                       |
| ---------- | ------------- | ------------------------ |
| 破壊的変更 | MAJOR (X.0.0) | APIの互換性なし変更      |
| 新機能追加 | MINOR (0.X.0) | 後方互換性のある機能追加 |
| バグ修正   | PATCH (0.0.X) | 後方互換性のあるバグ修正 |

### リリースチェックリスト

| フェーズ         | チェック項目                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| **Pre-release**  | 全テストがパス、TypeScript型チェックがパス、ESLintエラーなし、CHANGELOG更新、バージョン番号更新 |
| **Build**        | プロダクションビルド成功、Electronパッケージング成功、コード署名（macOS: notarization）         |
| **Post-release** | GitHubリリース作成、リリースノート公開、本番環境動作確認                                        |

### リリースコマンド

| ステップ       | コマンド                            | 説明                    |
| -------------- | ----------------------------------- | ----------------------- |
| バージョン更新 | pnpm version patch                  | patch/minor/majorを選択 |
| ビルド         | pnpm --filter @repo/desktop build   | プロダクションビルド    |
| パッケージ     | pnpm --filter @repo/desktop package | パッケージング          |
| リリース       | pnpm --filter @repo/desktop release | DMG/インストーラー作成  |

---

## バックアップ・リカバリ

### SQLiteバックアップ戦略

| 方式                | 頻度         | 用途             |
| ------------------- | ------------ | ---------------- |
| 自動バックアップ    | アプリ起動時 | 直近状態の保存   |
| 手動エクスポート    | ユーザー操作 | データ移行、保存 |
| WALチェックポイント | 定期         | データ整合性確保 |

### バックアップ実装

| 要素       | 説明                             |
| ---------- | -------------------------------- |
| 保存元     | app.getPath('userData')/data.db  |
| 保存先     | app.getPath('userData')/backups/ |
| ファイル名 | data-{timestamp}.db              |
| 実装       | fs.copyFileSync()で同期コピー    |

### リカバリ手順

| 状況                 | 対応                                 |
| -------------------- | ------------------------------------ |
| データ破損           | 最新バックアップから復元             |
| マイグレーション失敗 | ロールバック後、バックアップから復元 |
| 誤削除               | バックアップから該当データを抽出     |

### バックアップローテーション

| 保持期間 | バックアップ数 |
| -------- | -------------- |
| 日次     | 7個            |
| 週次     | 4個            |
| 月次     | 3個            |

---

## 環境構築ガイド

### 前提条件

| ツール                   | バージョン    |
| ------------------------ | ------------- |
| Node.js                  | 20.x LTS      |
| pnpm                     | 9.x           |
| Git                      | 2.x           |
| Xcode Command Line Tools | 最新（macOS） |

### セットアップ手順

| ステップ        | 操作                              |
| --------------- | --------------------------------- |
| 1. クローン     | git clone {repository-url}        |
| 2. 移動         | cd AIWorkflowOrchestrator         |
| 3. インストール | pnpm install                      |
| 4. 環境変数     | cp .env.example .env.local → 編集 |
| 5. 起動         | pnpm --filter @repo/desktop dev   |

### 推奨VS Code拡張機能

| 拡張機能                  | 用途           |
| ------------------------- | -------------- |
| ESLint                    | リント         |
| Prettier                  | フォーマット   |
| TypeScript Importer       | 自動インポート |
| Tailwind CSS IntelliSense | Tailwind補完   |
| Error Lens                | エラー可視化   |
| GitLens                   | Git操作        |

### トラブルシューティング

| 問題                       | 解決策                                      |
| -------------------------- | ------------------------------------------- |
| pnpm install失敗           | pnpm store prune && pnpm install            |
| ネイティブモジュールエラー | pnpm rebuild                                |
| Electronが起動しない       | pnpm --filter @repo/desktop rebuild         |
| 型エラーが大量に出る       | pnpm --filter @repo/shared build を先に実行 |

### `@repo/shared` サブパス追加時の同期手順（TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001）

`@repo/shared` のサブパスを追加・変更する場合は、以下4ファイルを同一コミットで更新する。

| 順番 | ファイル | 更新内容 |
| --- | --- | --- |
| 1 | `packages/shared/package.json` | `exports` と `typesVersions` にエントリ追加 |
| 2 | `apps/desktop/tsconfig.json` | `compilerOptions.paths` にマッピング追加（順序注意: 具体的→汎用） |
| 3 | `apps/desktop/vitest.config.ts` | `resolve.alias` にエントリ追加 |
| 4 | `packages/shared/tsup.config.ts` | `entry` にビルドエントリ追加（ビルド対象の場合） |

#### サブパス追加チェックリスト

新しいサブパスを追加する場合、以下を全て実施:

- [ ] `packages/shared/package.json` — `exports` にサブパスの import 先を追加
- [ ] `packages/shared/package.json` — `typesVersions` に型解決エントリを追加
- [ ] `apps/desktop/tsconfig.json` — `compilerOptions.paths` にマッピング追加（`@repo/shared/*` より前に配置）
- [ ] `apps/desktop/vitest.config.ts` — `resolve.alias` にエントリ追加
- [ ] `packages/shared/tsup.config.ts` — `entry` にビルドエントリ追加（ビルド対象の場合）
- [ ] 3層整合性テストを実行して全PASS確認

**検証コマンド**:

| 順序 | コマンド | 検証対象 |
| --- | --- | --- |
| 1 | `pnpm --filter @repo/shared build` | shared パッケージのビルド成功 |
| 2 | `pnpm --filter @repo/desktop exec tsc --noEmit` | TypeScript 型解決の整合性 |
| 3 | `cd apps/desktop && pnpm vitest run src/__tests__/shared-module-resolution.test.ts src/__tests__/vitest-alias-consistency.test.ts` | Vitest alias 整合性 |
| 4 | `pnpm --filter @repo/shared exec vitest run src/__tests__/module-resolution.test.ts` | shared 側 exports 整合性 |

#### 補足

- `apps/desktop` が shared ソースを直接参照する場合、`apps/desktop/tsconfig.json` の `include` に shared 側補助型宣言（`packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`）を含める
- paths の定義順序は「具体的なサブパス → 汎用パターン（`@repo/shared/*`）→ ルート（`@repo/shared`）」を厳守する。詳細は [architecture-monorepo.md#paths-定義順序ルール](./architecture-monorepo.md) を参照

#### 関連テスト一覧

| テストファイル | テスト数 | 検証内容 |
| --- | --- | --- |
| `packages/shared/src/__tests__/module-resolution.test.ts` | 57 | shared パッケージの exports / typesVersions 整合性 |
| `apps/desktop/src/__tests__/shared-module-resolution.test.ts` | 59 | desktop → shared の paths マッピング整合性 |
| `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts` | 108 | 3層（exports / paths / alias）の完全一致検証 |

#### トラブルシューティング

| エラー | 原因 | 対処法 |
| --- | --- | --- |
| `TS2307: Cannot find module '@repo/shared/xxx'` | `tsconfig.json` の paths にマッピングが未追加 | `compilerOptions.paths` にエントリを追加（`@repo/shared/*` より前に配置） |
| `TS2307` が特定サブパスのみ発生 | paths の定義順序が誤っている（汎用パターンが先にマッチ） | 具体的なサブパスを `@repo/shared/*` より前に移動 |
| テスト時に `Cannot find module` | `vitest.config.ts` の `resolve.alias` に未追加 | alias にエントリを追加（tsconfig の paths は Vitest に自動反映されない） |
| ビルド後に `Module not found` | `package.json` の `exports` / `typesVersions` に未追加 | exports と typesVersions の両方にエントリを追加 |
| `paths` は正しいのに解決されない | 解決先ファイルパスの誤り（`src/` 有無の混在） | `packages/shared` のソース構造を確認し、実際のファイルパスを指定 |

#### 関連未タスク

| 未タスクID | 概要 |
| --- | --- |
| UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 | vitest-tsconfig-paths プラグイン導入により `resolve.alias` の手動同期を自動化 |

---

## 関連ドキュメント

| ドキュメント                                           | 内容                                |
| ------------------------------------------------------ | ----------------------------------- |
| [quality-requirements.md](./quality-requirements.md)   | 非機能要件・テスト戦略              |
| [quality-e2e-testing.md](./quality-e2e-testing.md)     | E2Eテスト仕様（スキル選択フロー等） |
| [error-handling.md](./error-handling.md)               | エラーハンドリング仕様              |
| [security-principles.md](./security-principles.md)     | セキュリティ原則                    |
| [architecture-overview.md](./architecture-overview.md) | アーキテクチャ全体像                |
| [glossary.md](./glossary.md)                           | 用語集                              |

---

## 完了タスク

### TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001（2026-02-20完了）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| 概要 | `@repo/shared` サブパス追加時の同期手順（`exports` / `paths` / `alias` / `tsup entry`）を標準化 |
| 成果物 | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/documentation-changelog.md` |

---

## 変更履歴

| Version | Date       | Changes                                                                                   |
| ------- | ---------- | ----------------------------------------------------------------------------------------- |
| 1.8.0   | 2026-02-20 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: `@repo/shared` サブパス追加時の同期手順を追加（`exports`/`paths`/`alias`/`tsup entry` 同時更新、補助型宣言取り込みルール） |
| 1.7.0   | 2026-02-14 | TASK-FIX-14-1: Skill系Main Processログ規約を追加（electron-log必須、プレフィックス、テスト方針、TASK-FIX-14-2継続管理） |
| 1.6.0   | 2026-02-12 | UT-STORE-HOOKS-TEST-REFACTOR-001: Zustand Hook テスト戦略（renderHookパターン）セクション追加 |
| 1.5.0   | 2026-02-12 | UT-STORE-HOOKS-REFACTOR-001: Zustand Store Hooks無限ループ防止（P31対策）セクション追加  |
| 1.4.0   | 2026-02-03 | TASK-9A-A: Vitestテスト固有の問題と解決策セクション追加（ESModuleモッキング回避パターン） |
| 1.3.0   | 2026-02-02 | E2Eテスト仕様（quality-e2e-testing.md）への参照リンク追加                                 |
| 1.2.0   | 2026-01-26 | 仕様ガイドライン準拠: コード例削除、文章・表形式に変更                                    |
| 1.1.0   | 2026-01-26 | 命名規則、デバッグガイド、リリースプロセス、バックアップ・リカバリ、環境構築ガイド追加    |
| 1.0.0   | 2026-01-26 | 初版作成                                                                                  |
