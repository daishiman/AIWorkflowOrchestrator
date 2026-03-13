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

### Atomsコンポーネント設計パターン（TASK-UI-00-ATOMS）

#### S12: Props最小化パターン

Atoms層はprops駆動を徹底し、Store依存を排除することで、P31（Store Hooks無限ループ）を根本的に防止する。

| 要素       | 実装                                       |
| ---------- | ------------------------------------------ |
| 必須Props  | 最小限（通常1つのみ）、省略不可            |
| オプション | デフォルト値を提供し、省略可能にする       |
| Store使用  | **禁止** — 全てprops経由でデータを受け取る |
| 再利用性   | コンテキスト依存ゼロ、どこでも使える       |

```typescript
// ✅ Props最小化パターン
interface StatusIndicatorProps {
  status: "running" | "success" | "error" | "warning" | "idle" | "offline"; // 必須は1つだけ
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

// ❌ アンチパターン：過剰なProps
interface StatusIndicatorProps {
  status: string;
  size: string;
  showLabel: boolean;
  color: string;
  backgroundColor: string;
  borderColor: string;
  // ... 10個以上のprops
}
```

#### S13: Record型バリアント定義パターン

バリアント（variant, size等）のスタイル定義をモジュールスコープの`Record`型として抽出し、React.memoの効果を最大化する。

| 要素           | 実装                                                        |
| -------------- | ----------------------------------------------------------- |
| 型安全性       | `Record<NonNullable<Props["variant"]>, string>`で網羅性保証 |
| 配置           | モジュールスコープ（コンポーネント外）                      |
| 新規バリアント | 追加漏れはコンパイルエラーで検出                            |
| React.memo効果 | 不変オブジェクトにより再レンダー最小化                      |

```typescript
// ✅ モジュールスコープに定数抽出
const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
  primary: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  success: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  error: "bg-[var(--status-error)] text-[var(--text-inverse)]",
  warning: "bg-[var(--status-warning)] text-[var(--text-primary)]",
  info: "bg-[var(--status-info)] text-[var(--text-inverse)]",
};

// 新規バリアント "secondary" を追加し忘れると：
// TS2741: Property 'secondary' is missing in type

// ❌ アンチパターン：コンポーネント内で定義
const Badge = ({ variant }) => {
  const styles = { // 毎回新しいオブジェクトを生成
    default: "...",
    primary: "...",
  };
  return <span className={styles[variant]} />;
};
```

#### S14: HTMLAttributes Props型衝突回避パターン（P46）

HTML標準属性名（`content`, `color`, `translate`, `hidden`, `title`等）とコンポーネント独自propsが衝突する場合、`Omit`で明示的に除外する。

| 衝突しやすい属性 | HTML標準型      | よくある独自型         | 対策                     |
| ---------------- | --------------- | ---------------------- | ------------------------ |
| content          | `string`        | `string \| number`     | `Omit<..., "content">`   |
| color            | `string`        | `"primary" \| "error"` | `Omit<..., "color">`     |
| translate        | `"yes" \| "no"` | `boolean`              | `Omit<..., "translate">` |
| hidden           | `boolean`       | `boolean \| "loading"` | `Omit<..., "hidden">`    |
| title            | `string`        | `ReactNode`            | `Omit<..., "title">`     |

```typescript
// ❌ TS2430: content は HTML標準属性（string）と衝突
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  content?: string | number; // Type 'number' is not assignable to type 'string'
}

// ✅ Omit で衝突する属性を除外
interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  content?: string | number; // OK
}
```

**検出方法**: TypeScriptコンパイルエラー「TS2430: Interface 'X' incorrectly extends interface 'Y'」が出た場合、衝突している属性を`Omit`で除外する。

#### S15: 後方互換性維持パターン

既存のchildren APIを残しつつ、新しいprops APIを追加する場合、children優先フォールバックで後方互換性を維持する。

| 要素           | 実装                                                           |
| -------------- | -------------------------------------------------------------- |
| 既存API        | `<Badge>New</Badge>` — children で表示                         |
| 新規API        | `<Badge content={42} variant="primary" />` — props で表示      |
| フォールバック | `children ?? (content !== undefined ? String(content) : null)` |
| 移行期間       | 両API共存、段階的に新APIへ移行                                 |

```typescript
// ✅ 後方互換性維持
const Badge = ({ children, content, variant = "default" }: BadgeProps) => {
  const displayContent = children ?? (content !== undefined ? String(content) : null);
  return <span className={variantStyles[variant]}>{displayContent}</span>;
};

// 既存コード（変更不要）
<Badge>New</Badge>

// 新規コード
<Badge content={42} variant="primary" />
<Badge content="Info" variant="info" />
```

#### S16: CSS変数＋Tailwind Arbitrary Values パターン

ハードコードカラーを完全排除し、CSS変数（`--status-primary`等）とTailwind Arbitrary Values（`bg-[var(...)]`）を組み合わせる。テーマ切替はCSS変数値の差し替えのみで実現する。

| 要素         | 実装                                                   |
| ------------ | ------------------------------------------------------ |
| カラー定義   | `:root` および `[data-theme="dark"]` でCSS変数定義     |
| Tailwind使用 | `bg-[var(--status-primary)]` 形式のArbitrary Values    |
| ハードコード | **0件** — TS/TSXコードにテーマ固有ロジックが存在しない |
| テーマ切替   | CSS変数値の差し替えのみ（JavaScriptコード変更不要）    |

```typescript
// ✅ CSS変数＋Tailwind Arbitrary Values
<div className="bg-[var(--status-primary)] text-[var(--text-muted)]" />

// ❌ アンチパターン：ハードコードカラー
<div className="bg-blue-600 text-gray-500" />

// ❌ アンチパターン：テーマ分岐ロジック
<div className={theme === "dark" ? "bg-gray-800" : "bg-white"} />
```

**CSS変数定義例**:

```css
:root {
  --status-primary: #007aff; /* Apple systemBlue Light */
  --text-muted: rgba(60, 60, 67, 0.6);
}

[data-theme="dark"] {
  --status-primary: #0a84ff; /* Apple systemBlue Dark */
  --text-muted: rgba(235, 235, 245, 0.6);
}
```

#### S17: displayName統一パターン

React DevToolsでの表示名を統一し、デバッグ効率を向上させる。`memo(forwardRef(...))`の場合、`Memo(ForwardRef(...))`ではなくコンポーネント名を表示する。

| 要素         | 実装                                            |
| ------------ | ----------------------------------------------- |
| displayName  | `ComponentName.displayName = "ComponentName"`   |
| 配置         | コンポーネント定義直後（export前）              |
| DevTools表示 | `Badge` ではなく `Memo(ForwardRef(...))` を回避 |
| デバッグ     | コンポーネントツリーで即座に識別可能            |

```typescript
// ✅ displayName統一パターン
export const Badge = memo(
  forwardRef<HTMLSpanElement, BadgeProps>(
    ({ children, content, variant = "default", ...props }, ref) => {
      // 実装
    },
  ),
);
Badge.displayName = "Badge";

// React DevToolsでの表示:
// ✅ Badge
// ❌ Memo(ForwardRef(...))
```

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

| 課題                     | 問題                                                 | 解決策                                        |
| ------------------------ | ---------------------------------------------------- | --------------------------------------------- |
| ハードコード文字列の発見 | `"skill:complete" as string` で型チェックをバイパス  | Grepで `as string` パターンを検索し定数に置換 |
| 重複定義の整理           | preload/channels.ts と shared/ipc/channels.ts の重複 | Single Source of Truth（preload側）に集約     |
| ホワイトリスト更新漏れ   | 旧チャンネル名が ALLOWED_INVOKE_CHANNELS に残存      | テストで旧チャンネルが含まれないことを検証    |

**Single Source of Truth パターン**:

| ステップ | 処理内容                                  | 成果物                                             |
| -------- | ----------------------------------------- | -------------------------------------------------- |
| 1        | Grep で重複チャンネル定義を検出           | 重複箇所リスト                                     |
| 2        | 正規のソース（preload/channels.ts）を特定 | IPC_CHANNELS オブジェクト定義                      |
| 3        | ハードコード文字列を定数参照に置換        | 型安全な import 使用                               |
| 4        | ホワイトリスト更新                        | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS 更新 |
| 5        | テスト追加                                | チャンネル存在検証、旧名称排除検証                 |

**チャンネルマイグレーション例**:

| 旧チャンネル         | 新チャンネル      | 理由                      |
| -------------------- | ----------------- | ------------------------- |
| skill:list-available | skill:list        | 冗長なサフィックス削除    |
| skill:list-imported  | skill:getImported | 命名規則統一（動詞:対象） |

**効果**:

| 観点         | 効果                                        |
| ------------ | ------------------------------------------- |
| 保守性       | 変更箇所が1箇所に集約され、不整合リスク排除 |
| 型安全性     | TypeScript の型チェックでチャンネル名を検証 |
| セキュリティ | ホワイトリスト更新漏れをテストで防止        |

**関連仕様書**: [security-skill-ipc.md](./security-skill-ipc.md)

#### IPCチャンネル名定数化パターン（TASK-FIX-12-1-IPC-HARDCODE-FIX 2026-02-09実装）

IPC チャンネル名のハードコード文字列を定数参照に置換し、04-electron-security.md IPC セキュリティ原則に準拠するパターン。

**問題**: Main Process 内で IPC チャンネル名がハードコードされており、タイポや不整合のリスクがある。

| 問題                 | 例                                                                      | リスク                             |
| -------------------- | ----------------------------------------------------------------------- | ---------------------------------- |
| ハードコード文字列   | `this.mainWindow.webContents.send("skill:stream", message)`             | タイポがコンパイル時に検出されない |
| 定数との不整合       | Preload側は定数、Main側はハードコード                                   | 変更時に片方だけ更新される         |
| セキュリティ原則違反 | 04-electron-security.md「ハードコード文字列でチャンネル名を指定しない」 | レビューで見落とされやすい         |

**解決策: 定数参照への置換**

| 修正前（NG）                                | 修正後（OK）                                             |
| ------------------------------------------- | -------------------------------------------------------- |
| `webContents.send("skill:stream", message)` | `webContents.send(SKILL_CHANNELS.SKILL_STREAM, message)` |

**実装ステップ**:

| ステップ | 処理内容                                                           | 成果物         |
| -------- | ------------------------------------------------------------------ | -------------- |
| 1        | `grep -rn '"skill:' src/` でハードコード箇所を検出                 | 対象箇所リスト |
| 2        | 対応する定数が `@repo/shared/src/ipc/channels.ts` に存在するか確認 | 定数マッピング |
| 3        | ハードコード文字列を定数参照に置換                                 | コード修正     |
| 4        | テスト実行で動作確認                                               | 品質検証       |

**メリット**:

| 観点           | 効果                             |
| -------------- | -------------------------------- |
| 型安全性       | タイポがコンパイル時に検出される |
| 保守性         | チャンネル名変更が1箇所で済む    |
| セキュリティ   | IPC セキュリティ原則準拠         |
| コードレビュー | 定数参照は意図が明確             |

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

| 要素     | 説明                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| 目的     | 初期化タイミングが異なる依存オブジェクトの注入                                                 |
| 構成     | `setXxx(dependency)` メソッドでオブジェクトを受け取り、内部フィールドに保持                    |
| 適用場面 | 依存オブジェクトが外部リソース（BrowserWindow等）を必要とし、Facade よりも後で初期化される場合 |
| 検証     | `executeXxx()` 呼び出し時に依存オブジェクトの存在を検証（未設定時はエラー）                    |

**適用例: SkillService と SkillExecutor**

| ステップ | 処理                                      | 説明                                         |
| -------- | ----------------------------------------- | -------------------------------------------- |
| 1        | `new SkillService()`                      | Facade サービス生成（skillExecutor は null） |
| 2        | `new SkillExecutor(mainWindow, ...)`      | 実行エンジン生成（mainWindow 依存）          |
| 3        | `skillService.setSkillExecutor(executor)` | Setter で注入                                |
| 4        | `skillService.executeSkill(...)`          | 内部で `skillExecutor.execute()` に委譲      |

**使い分け基準**:

| パターン              | 適用場面                                   | 例                            |
| --------------------- | ------------------------------------------ | ----------------------------- |
| Constructor Injection | 依存オブジェクトが生成時点で利用可能       | DB接続、設定オブジェクト      |
| Setter Injection      | 依存オブジェクトの生成に外部リソースが必要 | BrowserWindow、IPC ハンドラー |
| Factory Pattern       | 依存オブジェクトを動的に生成する必要がある | プラグインシステム            |

#### IPC ハンドラー登録パターン（TASK-9B-H 2026-02-12実装）

> **このセクションの役割**: 実装パターン（どう実装するか）を記録する。プロセス面の教訓（何が問題だったか、どう防止するか）については [lessons-learned.md - TASK-9B-H](./lessons-learned.md#task-9b-h-skillcreatorservice-ipcハンドラー登録) を参照。

BrowserWindow とサービスインスタンスを受け取り、IPC ハンドラーを登録するパターン。既存の registerAuthHandlers、registerSkillHandlers と同一構成。

| 要素     | 説明                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| 目的     | Main Process で IPC ハンドラーを登録し、Renderer からの要求を処理                       |
| 構成     | `registerXxxHandlers(mainWindow, service)` 関数で登録、`unregisterXxxHandlers()` で解除 |
| 適用場面 | 新規 IPC チャンネルグループの追加時                                                     |
| 適用例   | `registerSkillCreatorHandlers(mainWindow, skillCreatorService)`                         |

**構成要素**:

| 要素                      | 数量        | 説明                                    |
| ------------------------- | ----------- | --------------------------------------- |
| `ipcMain.handle()`        | 5チャンネル | Renderer からの invoke リクエストを処理 |
| `sendXxxProgress()`       | 1チャンネル | Main → Renderer への進捗通知送信        |
| `unregisterXxxHandlers()` | 1関数       | ハンドラー解除（テスト用）              |

**セキュリティ層（4層防御）**:

> セキュリティ仕様の正本: [security-electron-ipc.md - skillCreatorAPI](./security-electron-ipc.md)

| 層  | 実装                       | 説明                                                                     |
| --- | -------------------------- | ------------------------------------------------------------------------ |
| L1  | channels.ts ホワイトリスト | ALLOWED_INVOKE_CHANNELS / ALLOWED_ON_CHANNELS に登録                     |
| L2  | validateIpcSender          | 送信元BrowserWindowの正当性検証、DevToolsからの呼び出し検出・拒否        |
| L3  | 引数バリデーション         | typeof手動チェックによる型検証（文字列型・オブジェクト型）をMain側で実施 |
| L4  | エラーサニタイズ           | error.messageのみ返却。error.stack・ファイルパス等の内部情報は非露出     |

**Preload統合（4箇所更新必須）**:

| 更新箇所                   | ファイル                       | 内容                                                                   |
| -------------------------- | ------------------------------ | ---------------------------------------------------------------------- |
| 1. API実装                 | `preload/skill-creator-api.ts` | safeInvoke/safeOn でホワイトリスト検証付き API 実装                    |
| 2. import追加              | `preload/index.ts`             | API実装モジュールの import                                             |
| 3. electronAPIオブジェクト | `preload/index.ts`             | `electronAPI.skillCreator` として追加                                  |
| 4. contextBridge統合       | `preload/index.ts`             | `contextBridge.exposeInMainWorld` で公開 + non-isolated フォールバック |

**既存の同パターン実装**:

| ハンドラー                   | ファイル                  | チャンネル数                            |
| ---------------------------- | ------------------------- | --------------------------------------- |
| registerAuthHandlers         | `authHandlers.ts`         | 認証関連チャンネル                      |
| registerSkillHandlers        | `skillHandlers.ts`        | スキル管理・実行チャンネル              |
| registerSkillCreatorHandlers | `skillCreatorHandlers.ts` | スキル作成チャンネル（5 invoke + 1 on） |

**実装時の注意点**:

| 注意点                                                   | 対策                                     |
| -------------------------------------------------------- | ---------------------------------------- |
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

| 問題                           | 原因                        | 症状                               |
| ------------------------------ | --------------------------- | ---------------------------------- |
| ドロップダウンが他要素に隠れる | CSSスタッキングコンテキスト | z-[9999]でも親要素の範囲内に制限   |
| モーダルの重なり順が不正       | position指定の親要素存在    | 新しいスタッキングコンテキスト生成 |

#### 解決策：React Portal + createPortal

| 要素         | 実装                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| インポート   | `import { createPortal } from "react-dom"`                              |
| レンダリング | `createPortal(<DropdownContent className="z-[9999]" />, document.body)` |
| 位置計算     | `getBoundingClientRect()` でトリガー要素の位置を取得                    |
| SSR対応      | `typeof document !== "undefined"` でガード                              |

#### 実装ファイル

| ファイル                 | 行番号 | 内容                                                   |
| ------------------------ | ------ | ------------------------------------------------------ |
| AccountSection/index.tsx | 501    | ドロップダウンメニューをPortalでbody直下にレンダリング |

#### 適用基準

| 適用する                           | 適用しない                       |
| ---------------------------------- | -------------------------------- |
| ドロップダウンメニュー             | インライン展開コンテンツ         |
| モーダルダイアログ                 | 親要素内に収まるポップオーバー   |
| ツールチップ（オーバーフロー防止） | トースト通知（専用コンテナ使用） |

---

### Supabase認証状態変更時の即時UI更新パターン（AUTH-UI-001 2026-02-04実装）

認証状態変更（OAuth連携/解除）後にUIを即座に更新するためのパターン。

#### 問題

| 問題                           | 原因                                                      |
| ------------------------------ | --------------------------------------------------------- |
| OAuth連携後にUIが更新されない  | `onAuthStateChange`後にプロバイダー情報を再取得していない |
| 連携解除後も連携中と表示される | 状態更新がイベントハンドラ内で完結していない              |

#### 解決策：明示的なデータ再取得

| 要素         | 実装                                                       |
| ------------ | ---------------------------------------------------------- |
| トリガー     | `supabase.auth.onAuthStateChange((event, session) => ...)` |
| 再取得関数   | `fetchLinkedProviders()`                                   |
| 呼び出し位置 | 認証状態変更イベントハンドラ内（コールバック直後）         |

#### 実装ファイル

| ファイル     | 行番号  | 内容                                               |
| ------------ | ------- | -------------------------------------------------- |
| authSlice.ts | 342-345 | 認証状態変更時に`fetchLinkedProviders()`を呼び出し |

#### Zustandとの統合

| ステップ | 処理                                     |
| -------- | ---------------------------------------- |
| 1        | `onAuthStateChange`イベント発火          |
| 2        | セッション情報をZustandストアに保存      |
| 3        | `fetchLinkedProviders()`を呼び出し       |
| 4        | プロバイダー情報をZustandストアに保存    |
| 5        | React コンポーネントが自動再レンダリング |

#### 認証イベント種別

| イベント        | 再取得要否 | 理由                          |
| --------------- | ---------- | ----------------------------- |
| SIGNED_IN       | 必要       | OAuth連携が追加された可能性   |
| TOKEN_REFRESHED | 不要       | プロバイダー情報は変更なし    |
| SIGNED_OUT      | 必要       | 全連携情報をクリア            |
| USER_UPDATED    | 必要       | プロバイダー連携/解除の可能性 |

### IPC レスポンスラッパー展開パターン（safeInvokeUnwrap）

> **導入タスク**: UT-FIX-IPC-RESPONSE-UNWRAP-001（2026-02-14）
> **関連 Pitfall**: P19（型アサーションによる実行時検証バイパス）

#### 問題

Main Process の IPC ハンドラが `{ success: true, data: T }` 形式のラッパーでレスポンスを返す場合、Preload 層の `safeInvoke<T>()` は TypeScript ジェネリクスの type erasure により、ラッパーオブジェクトをそのまま Renderer に透過する。結果として `importedSkills.forEach is not a function` のようなランタイムエラーが発生する。

#### 解決パターン

```typescript
// IPC ハンドラのレスポンスラッパー型（ファイルスコープ）
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ラッパー展開関数
async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error || `IPC call failed: ${channel}`);
  }
  return result.data as T;
}
```

#### 使い分け基準

| ハンドラの return 文                           | 使用する関数       | 例                              |
| ---------------------------------------------- | ------------------ | ------------------------------- |
| `return { success: true, data: result }`       | `safeInvokeUnwrap` | list(), getImported(), rescan() |
| `return service.method()` (直接返却)           | `safeInvoke`       | import(), execute()             |
| `return { success: boolean }` (ステータスのみ) | `safeInvoke`       | sendPermissionResponse()        |
| `void` (戻り値なし)                            | `safeInvoke`       | abort(), remove()               |

#### データフロー

```
Renderer          Preload (safeInvokeUnwrap)        Main Process
  │                       │                              │
  │── skill.list() ──────>│                              │
  │                       │── ipcRenderer.invoke() ─────>│
  │                       │                              │── skillService.getSkills()
  │                       │<── { success, data: [...] } ─│
  │                       │                              │
  │                       │── if (!result.success) throw ─│
  │                       │── return result.data ─────────│
  │<── SkillMetadata[] ──│                              │
```

#### 注意事項

- `IpcResult<T>` はファイルスコープ（エクスポートしない）
- `safeInvokeUnwrap` は内部で `safeInvoke` を呼び出すため、チャンネルホワイトリスト検証は維持される
- `result.data as T` の型アサーションは、`success` チェック後の安全なパターンとして許容
- 新しいスキルメソッド追加時は、対応するハンドラの return 文を確認してから `safeInvoke` / `safeInvokeUnwrap` を選択すること

---

### Preload invoke hang containment パターン（safeInvoke timeout）

> **導入タスク**: TASK-FIX-SAFEINVOKE-TIMEOUT-001（監査観点）

#### 問題

Preload の `safeInvoke()` が `ipcRenderer.invoke()` をそのまま返すと、Main Process 側の未応答や外部 API ハング時に Renderer が永続 pending になる。特に認証初期化や設定ロードでは `isLoading` が落ちず、画面遷移が止まる。

#### 解決パターン

```typescript
const IPC_TIMEOUT_MS = 5000;

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }

  return Promise.race([
    ipcRenderer.invoke(channel, ...args),
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `IPC timeout: ${channel} did not respond within ${IPC_TIMEOUT_MS}ms`,
          ),
        );
      }, IPC_TIMEOUT_MS);
    }),
  ]);
}
```

#### 適用基準

| 条件 | 判断 |
| ---- | ---- |
| Preload 共通ラッパーで多数の `invoke` を集約している | timeout を共通化する |
| 戻り値シグネチャを変えたくない | `Promise<T>` を維持したまま `Promise.race` を使う |
| Renderer 側に loading state がある | timeout エラーを catch して復旧パスを明示する |
| まだ実装差分が存在しない | spec は pending / spec_created に留め、completed としない |

#### 注意事項

- timeout 追加は `safeOn` にはそのまま適用しない
- channel 名は whitelist 通過済み値のみ error 文言へ出す
- テストは `advanceTimersByTime` 系を使い、永続 pending mock で再現する

### Renderer local preview resilience パターン（TASK-UI-04C）

> **導入タスク**: TASK-UI-04C-WORKSPACE-PREVIEW

#### 問題

既存 IPC (`file:read`) を再利用する preview UI では、Main / Preload 契約を増やさなくても feature 層で hang、false positive search、structured parse failure が発生しうる。これを channel 追加や global helper 化だけで解こうとすると責務が過剰に広がる。

#### 解決パターン

| 論点 | パターン |
| ---- | -------- |
| hang containment | feature 層で `Promise.race` による timeout を掛け、限定回数 retry で閉じる |
| fuzzy search | 「一致判定」と「順位補正」を分離し、`score = 0` を候補に入れない |
| structured preview | parse failure は recoverable error として banner + source fallback を出す |
| transport failure | timeout / read failure は fatal surface に落とし、loading を確実に解除する |

#### 適用基準

| 条件 | 判断 |
| ---- | ---- |
| 既存 IPC の戻り値契約は変えたくない | Renderer local resilience で閉じる |
| failure が UI に局所化している | feature hook / view に timeout / fallback を置く |
| parse failure でも raw source は読める | fatal error ではなく fallback UI に分離する |
| ranking bug が結果誤認を生む | no-match を返す単体テストを先に置く |

#### 苦戦箇所と対策

| 苦戦箇所 | 原因 | 対策 |
| --- | --- | --- |
| subsequence score 0 でも候補が残る | boost 計算が match 判定より先に走る | `score > 0` を gate にした |
| `file:read` hang で loading が固着する | Renderer 側 timeout 不在 | 5秒 timeout + 1秒間隔 3回 retry を追加 |
| JSON/YAML parse failure が fatal 扱いになる | transport と parse を同じ error surface へ載せる | banner + `SourceView` fallback に分離した |

#### 関連未タスク

| タスクID | 目的 | タスク仕様書 |
| --- | --- | --- |
| ~~UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001~~ | ~~Renderer local preview resilience を utility / test / error taxonomy まで共通化し、次回 preview/search UI の初動を短縮する~~ | `docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md` | 完了: 2026-03-13 |

#### 2026-03-13 追補

- `readPreviewFileWithResilience()` を `WorkspaceView` から切り出し、timeout / retry / detail message を pure helper 化した
- `PreviewSurfaceError` を category / code / summary / detail の構造体へ揃え、`PreviewPanel` と `WorkspaceStatusBar` が同じ error contract を使う

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

| レイヤー | 検証内容             | 実装                                                               |
| -------- | -------------------- | ------------------------------------------------------------------ |
| L1       | 送信元ウィンドウ検証 | `validateIpcSender(event)`                                         |
| L2       | 引数の型チェック     | `typeof arg === "string"`                                          |
| L3       | ドメイン固有検証     | `validatePath()`, `ALLOWED_SCHEMA_NAMES`, `sanitizeErrorMessage()` |

#### パストラバーサル防止（validatePath）

```typescript
function validatePath(inputPath: string, _paramName: string): string | null {
  if (!inputPath) return null; // 空文字列
  if (inputPath.includes("\0")) return null; // NULLバイト
  if (inputPath.startsWith("\\\\")) return null; // UNCパス
  if (inputPath.includes("../")) return null; // Unixトラバーサル
  if (inputPath.includes("..\\")) return null; // Windowsトラバーサル
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
if (
  !ALLOWED_SCHEMA_NAMES.includes(
    schemaName as (typeof ALLOWED_SCHEMA_NAMES)[number],
  )
) {
  return { success: false, error: `Invalid schema name: ${schemaName}` };
}
```

**拡張手順**: (1) ResourceLoaderにスキーマ追加 → (2) 配列に値追加 → (3) テスト追加

#### 適用チェックリスト

| チェック項目          | 対象             |
| --------------------- | ---------------- |
| L1: sender検証        | 全ハンドラー     |
| L2: 型チェック        | 全引数           |
| L3a: パス検証         | ファイルパス引数 |
| L3b: ホワイトリスト   | 列挙値引数       |
| L3c: エラーサニタイズ | 全catchブロック  |

**関連仕様書**: [security-electron-ipc.md](./security-electron-ipc.md)
**関連タスク**: UT-9B-H-003

### isKnownSkillFileError 型ガードパターン（TASK-9A-B 2026-02-19実装）

**目的**: 複数のIPCハンドラーで共通するエラー判別・サニタイズロジックをDRYに保つ

**課題**: 6つのIPCハンドラーで5種類のカスタムエラーを個別に instanceof チェックすると、30箇所の重複判定が発生

**解決策**: TypeScript の type guard 関数で union type を返し、各ハンドラーの catch ブロックを2行に集約

```typescript
/**
 * 既知のスキルファイルエラーかどうかを判定する型ガード関数
 * 既知エラー → error.message をそのまま返す（ビジネスロジックのエラー）
 * 未知エラー → "Internal error" を返して内部情報を漏洩しない
 */
function isKnownSkillFileError(
  error: unknown,
): error is
  | SkillNotFoundError
  | ReadonlySkillError
  | PathTraversalError
  | FileExistsError
  | FileNotFoundError {
  return (
    error instanceof SkillNotFoundError ||
    error instanceof ReadonlySkillError ||
    error instanceof PathTraversalError ||
    error instanceof FileExistsError ||
    error instanceof FileNotFoundError
  );
}

// 各ハンドラーの catch ブロック（6ハンドラー共通）
catch (error) {
  if (isKnownSkillFileError(error)) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Internal error" };
}
```

**適用**: 全6スキルファイル操作IPCハンドラーの catch ブロック

**エラークラス一覧**:

| エラークラス       | 発生条件                                           | クライアント向けメッセージ例             |
| ------------------ | -------------------------------------------------- | ---------------------------------------- |
| SkillNotFoundError | スキルディレクトリが存在しない                     | "Skill not found: my-skill"              |
| ReadonlySkillError | claude-skills 配下の読み取り専用スキルへの書き込み | "Cannot modify readonly skill: my-skill" |
| PathTraversalError | `../` 等を含む不正パス                             | "Path traversal detected: ../etc/passwd" |
| FileExistsError    | createFile で既存ファイルに対して実行              | "File already exists: SKILL.md"          |
| FileNotFoundError  | readFile/deleteFile で存在しないファイル指定       | "File not found: SKILL.md"               |

**関連**:

- 実装ファイル: `apps/desktop/src/main/ipc/skillFileHandlers.ts:34-49`
- テスト: `skillFileHandlers.security.test.ts` S-09〜S-11
- 関連パターン: [security-electron-ipc.md](./security-electron-ipc.md) の skillFileAPI セキュリティ実装パターン
- **未タスク**: UT-9A-B-002（IPCエラーサニタイズ共通ユーティリティ化）— isKnownSkillFileError パターンを他のIPCハンドラーに横展開

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

| モック対象               | 設定タイミング | 用途                                            |
| ------------------------ | -------------- | ----------------------------------------------- |
| Clipboard API            | beforeAll      | コピー/ペースト機能テスト                       |
| window.electronAPI.skill | beforeAll      | useSkillExecution等のHook（TASK-FIX-5-1で統一） |
| IntersectionObserver     | トップレベル   | 無限スクロール等                                |

**モック上書きパターン**:

グローバルモック後にテスト固有モックを使用する場合、beforeEach内でvi.stubGlobalを再呼び出しする。

| 手順 | 処理                                                  |
| ---- | ----------------------------------------------------- |
| 1    | テストファイルでモックオブジェクト定義                |
| 2    | モジュールレベルでvi.stubGlobal実行                   |
| 3    | beforeEach内で再度vi.stubGlobal（setup.ts上書き対策） |
| 4    | vi.clearAllMocks()でカウンターリセット                |

### fireEvent vs userEvent 使い分けパターン（UT-FIX-AGENTVIEW-INFINITE-LOOP-001 2026-02-12実装）

| ライブラリ  | 特徴                                 | 適用ケース                     | テスト環境        |
| ----------- | ------------------------------------ | ------------------------------ | ----------------- |
| `fireEvent` | 同期的、低レベルDOMイベント発火      | happy-dom環境の標準テスト      | happy-dom（推奨） |
| `userEvent` | 非同期、ユーザー操作シミュレーション | アクセシビリティ検証、複合入力 | jsdom（必須）     |

**環境別推奨パターン**:

| テスト環境 | イベント発火           | 非同期ハンドラ                                   |
| ---------- | ---------------------- | ------------------------------------------------ |
| happy-dom  | `fireEvent.click(el)`  | `await act(async () => { fireEvent.click(el) })` |
| jsdom      | `await user.click(el)` | `await user.click(el)`（自動でact wrap）         |

**注意点**:

| 状況                           | 問題                                 | 解決策                                |
| ------------------------------ | ------------------------------------ | ------------------------------------- |
| happy-domで`userEvent.setup()` | `Symbol(Node prepared...)` エラー    | `fireEvent`に切り替え                 |
| `fireEvent`でPromiseハンドラ   | microtask未flush                     | `await act(async () => {...})` で包む |
| jsdomディレクティブ追加        | `toBeInTheDocument`動作不良、DOM重複 | happy-dom + fireEventに戻す           |

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

| 状況                                          | 結果                                                            |
| --------------------------------------------- | --------------------------------------------------------------- |
| `beforeEach` で `vi.clearAllMocks()` のみ使用 | `mockImplementation()` で設定した実装が残存し、後続テストが失敗 |
| `mockRejectedValue()` でエラーモック設定      | 永続的なモックのため、次のテストケースにもエラーが漏洩          |

#### Vitest モックリセット API の挙動差異

| API                    | `.mock.calls` クリア | `mockImplementation` リセット | `mockReturnValue` リセット |
| ---------------------- | :------------------: | :---------------------------: | :------------------------: |
| `vi.clearAllMocks()`   |          ✅          |              ❌               |             ❌             |
| `vi.resetAllMocks()`   |          ✅          |              ✅               |             ✅             |
| `vi.restoreAllMocks()` |          ✅          |        ✅（元に戻す）         |       ✅（元に戻す）       |

#### 解決策：2段階リセット + Once サフィックス

| 手順 | 処理                                              | 目的                                  |
| ---- | ------------------------------------------------- | ------------------------------------- |
| 1    | `vi.clearAllMocks()`                              | 呼び出し履歴クリア                    |
| 2    | `mock.mockResolvedValue(defaultResponse)`         | デフォルト正常応答を再設定            |
| 3    | エラーテストでは `mockRejectedValueOnce()` を使用 | 1回限りのエラーで次テストに影響しない |

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
  mockAgentAPI.query.mockRejectedValueOnce(new Error("SDK call failed"));
  // テスト実行...
});
```

#### 適用条件

| 条件     | 説明                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| 対象     | `vi.mock()` でモジュール全体をモック化しているテスト                          |
| トリガー | テスト実行順序により結果が変わる場合                                          |
| 関連     | P9（モジュールスコープ変数のテスト間リーク）、P13（タイマーテスト無限ループ） |

### モジュールレベルモックのタイムアウトテストパターン（TASK-FIX-11-1 2026-02-13実装）

`vi.mock()` でモジュール全体をモック化した場合、内部のタイマーロジック（`setTimeout` + `AbortController`）が消失する問題のパターン。

#### 問題

| 状況                                                          | 結果                                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| `vi.mock("../agent-client")` でモジュール全体をモック         | 内部の `setTimeout` + `AbortController` ロジックが消失           |
| `vi.advanceTimersByTimeAsync(30000)` でタイムアウト再現を試行 | モジュール内のタイマーが存在しないため、タイムアウトが発生しない |

#### 解決策：外部インターフェースでのタイムアウトシミュレーション

モジュール内部のタイマーロジックを再現するのではなく、モック関数の応答としてタイムアウトエラーを注入する。

| アプローチ         | 手法                                                                                         | 利点                             |
| ------------------ | -------------------------------------------------------------------------------------------- | -------------------------------- |
| 直接エラー注入     | `mockRejectedValueOnce(new Error("Request timeout"))`                                        | シンプル、タイマー不要           |
| タイマー付きモック | `mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(...), 30000)))` | タイマーテストとの組み合わせ可能 |

#### コード例

```typescript
// アプローチ1: 直接エラー注入（推奨）
it("タイムアウトエラーをハンドリング", async () => {
  mockAgentAPI.query.mockRejectedValueOnce(new Error("Request timeout"));
  const result = await skillExecutor.execute(request, metadata);
  expect(result.error).toContain("timeout");
});

// アプローチ2: タイマー付きモック（fake timer必要時）
it("30秒タイムアウト", async () => {
  vi.useFakeTimers();
  mockAgentAPI.query.mockImplementation(
    () =>
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 30000);
      }),
  );
  const promise = skillExecutor.execute(request, metadata);
  await vi.advanceTimersByTimeAsync(30000);
  await expect(promise).resolves.toMatchObject({
    error: expect.stringContaining("timeout"),
  });
  vi.useRealTimers();
});
```

#### 適用条件

| 条件     | 説明                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 対象     | `vi.mock()` でモジュール全体をモック化し、かつタイムアウトテストが必要 |
| トリガー | fake timer を使ってもタイムアウトが発生しない場合                      |
| 関連     | P13（タイマーテスト無限ループ）、ESModuleモッキング制約パターン        |

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

### IPC ハンドラー3層テスト分離パターン（TASK-9A-B 2026-02-19実装）

**目的**: IPCハンドラーのテストをUnit/Security/Integrationの3層に分離し、各テストの責務を明確化

**テスト構成**:

| テスト層    | ファイル                                | テスト数 | 責務                                                                            |
| ----------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| Unit        | `skillFileHandlers.test.ts`             | 38       | 引数バリデーション、正常系レスポンス、ハンドラー登録/解除、境界値、エッジケース |
| Security    | `skillFileHandlers.security.test.ts`    | 14       | Sender検証、パストラバーサル、エラーサニタイズ、XSSコンテンツ                   |
| Integration | `skillFileHandlers.integration.test.ts` | 13       | 実SkillFileManagerとの統合、ファイル操作サイクル、バックアップ/復元             |

**テストレイヤー間の責務分離**:

```
Unit（モック）     → ハンドラー単体の入出力検証
Security（モック）  → セキュリティ境界の検証（validateIpcSender、パストラバーサル、情報漏洩）
Integration（実装） → 実ファイルシステムでの一連操作フロー
```

**カバレッジ結果**: Line 91.14% / Branch 93.93% / Function 100%（65テスト全PASS）

**関連**:

- Handler Map 方式: 3テストファイル共通で `Map<string, Function>` によるハンドラーキャプチャを使用
- 実装: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers*.test.ts`
- **未タスク**: UT-9A-B-003（IPCテストhandlerMapモックユーティリティ共通化）— Handler Map 方式のセットアップコードを共通ユーティリティに抽出

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

| 要素 | 説明                                                  |
| ---- | ----------------------------------------------------- |
| 目的 | AI推論に依存しない決定論的処理の実現                  |
| 構成 | ScriptExecutorがchild_process.spawnでスクリプトを実行 |
| 利点 | テスト容易性、予測可能性、高速実行                    |
| 適用 | モード判定、検証処理、スキル初期化                    |

**実装構成**:

| コンポーネント | ファイル                                          | 責務                             |
| -------------- | ------------------------------------------------- | -------------------------------- |
| ScriptExecutor | `services/skill/ScriptExecutor.ts`                | スクリプト実行、JSON出力パース   |
| scripts/       | `~/.aiworkflow/skills/skill-creator/scripts/*.js` | 決定論的処理（detect_mode.js等） |

**使い分け基準**:

| 基準     | Script First                     | AI推論                   |
| -------- | -------------------------------- | ------------------------ |
| 処理特性 | 決定論的（同じ入力→同じ出力）    | 非決定論的（柔軟な応答） |
| 速度要件 | 高速応答必須                     | 多少の遅延許容           |
| テスト   | 単純なアサーション               | 出力のバリエーション検証 |
| 例       | バリデーション、フォーマット変換 | 自然言語解釈、創造的生成 |

**セキュリティ考慮**:

| 対策                 | 実装                                         |
| -------------------- | -------------------------------------------- |
| パストラバーサル防止 | スクリプト名に`..`, `/`, `\`を含む場合は拒否 |
| 実行ディレクトリ制限 | skill-creator/scripts/配下のみ実行許可       |
| shell: false         | コマンドインジェクション防止                 |

---

### Progressive Disclosure パターン

リソースを必要時に遅延読み込みし、メモリ効率とレスポンス速度を向上させるパターン。

| 要素 | 説明                                             |
| ---- | ------------------------------------------------ |
| 目的 | 必要なリソースのみを読み込み、効率化             |
| 構成 | ResourceLoaderがキャッシュ付き遅延読み込みを提供 |
| 利点 | メモリ効率、起動時間短縮、柔軟なリソース管理     |
| 適用 | エージェントプロンプト、スキーマ、参照資料       |

**実装構成**:

| コンポーネント       | ファイル                                            | 責務                             |
| -------------------- | --------------------------------------------------- | -------------------------------- |
| ResourceLoader       | `services/skill/ResourceLoader.ts`                  | リソース読み込み、キャッシュ管理 |
| リソースディレクトリ | `skill-creator/{agents,references,assets,schemas}/` | カテゴリ別リソース配置           |

**キャッシュ戦略**:

| 戦略             | 実装                                |
| ---------------- | ----------------------------------- |
| キャッシュキー   | `{category}/{filename}` 形式        |
| キャッシュ格納   | `Map<string, string>`               |
| キャッシュヒット | 同一キーの2回目以降はメモリから返却 |
| キャッシュクリア | `clearCache()` で全キャッシュ削除   |

**読み込み優先順位**:

| 順位 | ソース           | 条件                                    |
| ---- | ---------------- | --------------------------------------- |
| 1    | キャッシュ       | キャッシュにキーが存在する場合          |
| 2    | ファイルシステム | キャッシュミス時にfs.readFileで読み込み |

---

### Facade パターン（SkillCreatorService）

複雑なスキル作成処理を統合し、シンプルなAPIを提供するパターン。

| 要素 | 説明                                                      |
| ---- | --------------------------------------------------------- |
| 目的 | 複雑なサブシステムへの単純なインターフェース提供          |
| 構成 | SkillCreatorServiceがScriptExecutor、ResourceLoaderを統合 |
| 利点 | 利用者は内部実装を意識せず、高レベルAPIで操作可能         |
| 適用 | スキル作成、タスク実行、検証処理                          |

**統合サービス構成**:

| サービス            | 依存コンポーネント             | 統合内容                                 |
| ------------------- | ------------------------------ | ---------------------------------------- |
| SkillCreatorService | ScriptExecutor, ResourceLoader | モード判定、スキル作成、タスク実行、検証 |

**公開API**:

| メソッド      | 説明       | 内部で使用するコンポーネント   |
| ------------- | ---------- | ------------------------------ |
| detectMode    | モード判定 | ScriptExecutor                 |
| createSkill   | スキル作成 | ScriptExecutor, ResourceLoader |
| executeTasks  | タスク実行 | ScriptExecutor                 |
| validateSkill | スキル検証 | ScriptExecutor                 |

---

### タスク依存関係解決パターン

タスク間の依存関係を解決し、正しい実行順序を決定するパターン。

**アルゴリズム**:

| アルゴリズム                 | 用途         | 実装                                |
| ---------------------------- | ------------ | ----------------------------------- |
| トポロジカルソート（Kahn's） | 実行順序決定 | 入次数0のタスクをキューで処理       |
| DFS循環検出                  | 循環依存検出 | recursion stackで訪問中ノードを追跡 |

**実行モード**:

| モード    | 説明                 | 用途               |
| --------- | -------------------- | ------------------ |
| dry-run   | 実行計画のみ返却     | 事前確認、見積もり |
| execution | 実際にタスクを実行   | 本番実行           |
| parallel  | 独立タスクを並列実行 | 高速化（将来実装） |

---

## 外部API データ正規化パターン

### プロバイダー別フォールバックパターン（AUTH-UI-004）

複数の外部OAuthプロバイダーからのレスポンスを統一的に扱うためのパターン。プロバイダーごとにキー名が異なる場合に、Nullish coalescingでフォールバックチェーンを構成する。

**問題**: Supabase Authの`identity_data`でアバターURLのキー名がプロバイダーごとに異なる

| プロバイダー | キー名       | 備考                   |
| ------------ | ------------ | ---------------------- |
| Google       | `picture`    | OAuth 2.0標準のclaim名 |
| GitHub       | `avatar_url` | GitHub API準拠         |
| Discord      | `avatar_url` | GitHub互換             |

**実装パターン**:

| 要素           | 実装                                                          |
| -------------- | ------------------------------------------------------------- |
| フォールバック | `identity_data?.avatar_url ?? identity_data?.picture ?? null` |
| 優先順位       | 既存プロバイダー（avatar_url）を優先、Googleを後続            |
| 安全性         | 未知のプロバイダーはnullにフォールバック                      |

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

| 要素   | 説明                                                                                 |
| ------ | ------------------------------------------------------------------------------------ |
| 旧状態 | `window.skillAPI`（直接公開）+ `window.electronAPI.skill`（contextBridge経由）が共存 |
| 問題   | 呼び出し側で参照先が分散し、テストモックも二重管理が必要                             |
| 解決   | `window.electronAPI.skill` に一本化、旧 `window.skillAPI` を完全削除                 |

### 統一後のAPI構成（13メソッド）

| カテゴリ   | メソッド                                                          | パターン          | 戻り値                          |
| ---------- | ----------------------------------------------------------------- | ----------------- | ------------------------------- |
| Skill実行  | execute, onStream, abort, getExecutionStatus, onComplete, onError | safeInvoke/safeOn | 直接型（OperationResult不使用） |
| Permission | onPermissionRequest, sendPermissionResponse                       | safeOn/safeInvoke | 直接型                          |
| Skill管理  | list, getImported, rescan, import, remove                         | safeInvoke        | 直接型                          |

### テスト結果

| カテゴリ                     | テスト数 | 結果     |
| ---------------------------- | -------- | -------- |
| skill-api.test.ts            | 37       | PASS     |
| skill-api.permission.test.ts | 30       | PASS     |
| skillSlice.test.ts           | 59       | PASS     |
| SkillExecutor統合テスト      | 12       | PASS     |
| **合計**                     | **138**  | **PASS** |

**カバレッジ**: skill-api.ts で Statements 91.23%、Branches 85.71%、Functions 100%、Lines 91.23% を達成（平均91%）。

### 実装上の課題と対処法

#### 型アサーション残存（S1）

| 要素 | 説明                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------- |
| 問題 | `AgentView/index.tsx` で `as unknown as Skill[]` 型アサーション残存（agentSliceが旧 `Skill` 型使用） |
| 対処 | 未タスク UT-FIX-5-1-001 として登録、TASK-FIX-6-1（状態管理変更）で包含予定                           |
| 教訓 | API統一時は呼び出し側のStore型定義まで影響範囲を調査し、スコープに含めるか明示的に判断する           |

#### OperationResult廃止の影響波及（S4）

| 要素 | 説明                                                                                   |
| ---- | -------------------------------------------------------------------------------------- |
| 問題 | `OperationResult<T>` ラッパー廃止で8ファイルに影響波及。使用箇所が分散していた         |
| 対処 | Preload層では直接型に統一し、旧定義は後方互換のため残置                                |
| 教訓 | 型ラッパー廃止時は `grep -rn` で全使用箇所をリストアップし、段階的置換プランを策定する |

#### テストモック設計・仕様書参照・編集永続化（S2/S3/S5）

以下の実行プロセス上の課題は [skill-creator/references/patterns.md](.claude/skills/skill-creator/references/patterns.md) に成功パターンとして詳細を記録:

| ID  | 課題                                       | 対応パターン                                      |
| --- | ------------------------------------------ | ------------------------------------------------- |
| S2  | パスエイリアス対応でテスト623→1092行に膨張 | IPC Bridge API統一時のテストモック設計パターン    |
| S3  | Phase 1で仕様書参照19件が不足し後付け修正  | Phase 1仕様書作成時の依存仕様書マトリクスパターン |
| S5  | PostToolUseフックで8件が未永続化           | セッション間での仕様書編集永続化検証パターン      |

---

## 型定義修正タスクパターン（UT-FIX-5-4 2026-02-10実装）

IPC/Agent SDK関連の型定義を修正する際のシステム仕様書更新チェックリスト。

### 問題: 型定義変更時のシステム仕様書更新漏れ

| 問題                 | 原因                                         | 症状                                    |
| -------------------- | -------------------------------------------- | --------------------------------------- |
| 仕様書と実装の乖離   | Phase 12で複数ファイル更新が必要だが一部漏れ | ドキュメントが古いまま残る              |
| 関連仕様書の更新漏れ | 該当する仕様書が分散している                 | interfaces, api-ipc, security等が不整合 |
| topic-map再生成漏れ  | 仕様書追加/更新後の再生成忘れ                | インデックスが古いまま                  |

### 解決策: 型定義修正時のシステム仕様書更新チェックリスト

#### Step 1: 型定義ファイルの同時更新

| ファイル                             | 内容            | 更新タイミング |
| ------------------------------------ | --------------- | -------------- |
| `packages/shared/src/agent/types.ts` | 共有型定義      | 常に           |
| `apps/desktop/src/preload/types.ts`  | Preload層型定義 | IPC関連の場合  |

#### Step 2: システム仕様書の更新

| 仕様書                          | 更新内容                       | 該当条件               |
| ------------------------------- | ------------------------------ | ---------------------- |
| `interfaces-agent-sdk.md`       | 型定義の変更内容記録           | Agent SDK型変更時      |
| `interfaces-agent-sdk-skill.md` | 完了タスクセクション追加       | Skill関連型変更時      |
| `api-ipc-agent.md`              | 完了タスクセクション追加       | Agent IPC変更時        |
| `security-api-electron.md`      | 完了タスクテーブル追加         | セキュリティ関連変更時 |
| `task-workflow.md`              | 残課題テーブル・完了タスク記録 | 常に                   |
| `LOGS.md`（2ファイル）          | タスク完了記録                 | 常に                   |
| `SKILL.md`（2ファイル）         | 変更履歴更新                   | 常に                   |
| `topic-map.md`                  | 再生成                         | 常に                   |

#### Step 3: 検証

| 検証項目     | コマンド                               | 期待結果           |
| ------------ | -------------------------------------- | ------------------ |
| 型整合性     | `pnpm typecheck`                       | エラーなし         |
| テスト       | `pnpm test`                            | 全テストPASS       |
| 仕様書整合性 | Phase 12仕様書チェックリスト全項目確認 | 全項目チェック済み |

### 関連Pitfall

| Pitfall ID | タイトル                         | 関連                 |
| ---------- | -------------------------------- | -------------------- |
| P23        | API二重定義の型管理複雑性        | 型定義ファイルの分散 |
| P31        | Phase 12のシステム仕様書更新漏れ | 本パターンの教訓元   |
| P32        | 型定義の二箇所同時更新必須       | Step 1の根拠         |

**関連タスク**: UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH（2026-02-10完了）

---

## SDK 型統合パターン（TASK-9B-I 2026-02-12実装）

### S11: TypeScript モジュール解決の優先順位（TASK-9B-I）

カスタム `declare module` ファイルと `node_modules` 内の実 SDK 型が共存する場合に発生する型解決の優先順位問題。

| 要素   | 説明                                                                                                                                                                                                                                                                         |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` にカスタム `declare module` を作成していたが、SDK が `node_modules` にインストールされると TypeScript は `node_modules` 配下の実型定義を優先する                                                             |
| 原因   | TypeScript のモジュール解決アルゴリズムでは、`node_modules` 配下にパッケージ実体が存在する場合、ambient declaration（`declare module`）よりも実型定義が優先される                                                                                                            |
| 影響   | カスタム `.d.ts` で定義した `PermissionMode`（`'auto' \| 'ask' \| 'deny'`）が無視され、実 SDK の型（`'default' \| 'acceptEdits' \| 'bypassPermissions' \| 'plan' \| 'delegate' \| 'dontAsk'`）が使用される。カスタム型は「ゴースト型」となり、仕様書にも誤った値が記載される |
| 解決策 | SDK をインストールした時点でカスタム `.d.ts` を削除する。SDK 未インストール環境でのみ使用する場合はフラグで管理する                                                                                                                                                          |

**モジュール解決の優先順位**:

| 優先度 | ソース                                                          | 条件                               |
| ------ | --------------------------------------------------------------- | ---------------------------------- |
| 1      | `node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts`   | SDK がインストール済みの場合       |
| 2      | `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` | SDK が未インストールの場合のみ有効 |

**教訓**: SDK 型との重複を避けるため、`declare module` は SDK 未インストール環境でのみ使用する。SDK インストール後にカスタム `.d.ts` が残存すると、仕様書やコードレビューで誤った型情報を参照するリスクがある。

**関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION, UT-9B-I-001

---

### S12: SDK API パラメータの正確な把握（TASK-9B-I）

外部 SDK の公式ドキュメントが限定的な場合に、API パラメータの正確な型情報を取得するためのパターン。

| 要素             | 説明                                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題             | Claude Agent SDK (`@anthropic-ai/claude-agent-sdk@0.2.30`) の公式ドキュメントが限定的で、`query({ prompt, options })` の `options` の全フィールドを正確に把握するのに時間がかかった |
| 特に困難だった点 | `env: { ANTHROPIC_API_KEY }` パターン（API キーを環境変数として渡す）と `abortController` オプションは公式ドキュメントでは明示されていなかった                                      |

**情報源の信頼性順位**:

| 順位 | 情報源                                 | 信頼性                                       | 具体的なパス                                                  |
| ---- | -------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| 1    | SDK の TypeScript 型定義ファイル       | 最も信頼できる                               | `node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts` |
| 2    | SDK の GitHub リポジトリのテストコード | 実用例として参考                             | リポジトリの `test/` ディレクトリ                             |
| 3    | SDK の公式ドキュメント                 | 概要把握には有用だが詳細が不足する場合がある | README.md、公式サイト                                         |

**発見された重要なパラメータ**:

| パラメータ                           | 用途                                | 発見元         |
| ------------------------------------ | ----------------------------------- | -------------- |
| `env: { ANTHROPIC_API_KEY: string }` | API キーを環境変数として SDK に渡す | 型定義ファイル |
| `abortController: AbortController`   | SDK 実行の中断制御                  | 型定義ファイル |
| `permissionMode: PermissionMode`     | パーミッション制御モード            | 型定義ファイル |

**教訓**: 公式ドキュメントより型定義ファイル（`node_modules/<package>/dist/index.d.ts`）が最も信頼できる情報源である。新しい SDK を統合する際は、まず型定義ファイルを直接読み、全パラメータと型を把握してから実装に着手する。

**関連タスク**: TASK-9B-I-SDK-FORMAL-INTEGRATION

---

### S13: IPC 戻り値型2ステップ変換パターン（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 2026-02-21実装）

IPC ハンドラの戻り値型がサービス層の戻り値型と一致しない場合に、2ステップ呼び出しで型を変換するパターン。

| 要素         | 説明                                                                                                                                                                                                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題         | `skill:import` ハンドラが `importSkills()` の戻り値 `ImportResult`（`{ success, importedCount, errors }`）をそのまま返していたが、Renderer 側は `ImportedSkill`（`{ name, description, path, importedAt, status, agents }`）を期待していた。2つの型は共有フィールドがゼロであり、型変換が必須 |
| 発生条件     | サービス層の「操作結果型」と Renderer が必要とする「データ表現型」が異なる場合。特に POST 系操作（import/create/update）で操作結果ではなくリソース表現が必要な場合                                                                                                                            |
| 検出の困難さ | Preload 層がモック化されているためコンパイル時に検出不可。ランタイムで `args?.skillIds` が `undefined` となり、バリデーションエラーとして初めて顕在化する                                                                                                                                     |
| 解決策       | 2ステップ呼び出し: ①操作実行（`importSkills([skillName])`） → ②データ取得（`getSkillByName(skillName)`）で期待型のオブジェクトを返却                                                                                                                                                          |
| 不採用案     | A案: ImportResult→ImportedSkill の手動マッピング（importSkills が返さないフィールドが多すぎる）。B案: importSkills の内部変更（他の呼び出し元への影響が大きい）                                                                                                                               |

**2ステップ変換のデータフロー**:

| ステップ | API呼び出し                              | 入力       | 出力型                       | 目的                                 |
| -------- | ---------------------------------------- | ---------- | ---------------------------- | ------------------------------------ |
| 1        | `skillService.importSkills([skillName])` | `string[]` | `ImportResult`               | スキルファイルのインポート実行       |
| 2        | `skillService.getSkillByName(skillName)` | `string`   | `ImportedSkill \| undefined` | インポート済みスキルのデータ表現取得 |

**P42準拠3段バリデーション**（ハンドラ入口で実施）:

| 段階 | チェック内容                    | エラー       |
| ---- | ------------------------------- | ------------ |
| 1    | `typeof skillName !== "string"` | 型不一致     |
| 2    | `skillName === ""`              | 空文字列     |
| 3    | `skillName.trim() === ""`       | スペースのみ |

**苦戦箇所と解決策**:

| #   | 苦戦ポイント                                          | 原因                                                                                                       | 解決策                                                                             | 教訓                                                                   |
| --- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | IPC インターフェース不整合がランタイムまで検出不可    | Preload がモック化されるため、Main handler の引数型と Preload の送信型の不一致がコンパイル時に検出されない | E2E統合テスト、または IPC 契約テスト（Mock を使わず実際の IPC を通す）の導入を検討 | IPC 境界は「型安全ではない」と認識し、ランタイム型チェックを必ず入れる |
| 2   | ImportResult と ImportedSkill の型形状が完全に異なる  | サービス層は「操作の成否」を返し、UI 層は「リソースのデータ表現」を必要とする。関心事の違い                | 2ステップ変換パターン: 操作実行 → データ再取得                                     | POST 系操作の IPC ハンドラは「操作 + 取得」の2ステップを標準化する     |
| 3   | 引数名の契約ドリフト（skillId vs skillName）          | ハンドラ設計時に ID ベースで命名したが、実際の値はスキル名                                                 | 全レイヤーで引数名を `skillName` に統一                                            | 引数名は「実際の値のセマンティクス」に合致させる                       |
| 4   | 3層同時更新の必要性（Main・Preload・Test）            | P23/P32 パターン: IPC 関連の型変更は必ず複数ファイルに波及する                                             | 変更前に `grep` で全影響箇所を特定し、1コミットで同時更新                          | IPC 変更時は「影響範囲リスト」を事前に作成する                         |
| 5   | getSkillByName が null を返す場合のエラーハンドリング | importSkills 成功後でも、内部キャッシュのタイミングにより null が返る可能性がある                          | IMPORT_ERROR を throw し、Renderer 側で適切にエラー表示                            | 2ステップ目の「取得失敗」は独立したエラーケースとして設計する          |

**適用判断基準**:

| 条件                                           | 判断                      |
| ---------------------------------------------- | ------------------------- |
| サービス戻り値と UI 期待型が一致する           | 直接返却（変換不要）      |
| 戻り値から UI 期待型への機械的マッピングが可能 | マッピング関数で変換      |
| 戻り値と UI 期待型に共有フィールドがない       | **2ステップ変換パターン** |
| 操作結果ではなくリソース表現が必要             | **2ステップ変換パターン** |

**関連 Pitfall**: P23（API二重定義の型管理）、P32（型定義の二箇所同時更新必須）、P42（.trim()バリデーション漏れ）、P44（IPC ハンドラと Preload のインターフェース不整合）、P45（IPC引数命名の契約ドリフト）

**関連タスク**: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001（2026-02-21完了）

---

### S14: Renderer 層 id/name 契約変換パターン（UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 2026-02-22実装）

Renderer コンポーネントが内部識別子（`skill.id`＝SHA-256ハッシュ）と外部識別子（`skill.name`＝人間可読名）を混同する問題を、境界変換で解決するパターン。

| 要素         | 説明                                                                                                                                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題         | `SkillImportDialog` の `handleImport` が `selectedIds`（Set に格納された `skill.id`）をそのまま `onImport` コールバックに渡していた。IPC ハンドラ側は `skillName`（人間可読名）を期待しており、`getSkillByName(hashValue)` が常に `null` を返すため、インポートが 100% 失敗 |
| 発生条件     | 同じ `string` 型の識別子が複数種類（id, name, slug 等）あるコンポーネントで、UI が内部選択状態と外部 API 引数を直接結合している場合                                                                                                                                         |
| 検出の困難さ | TypeScript は `string` 型同士の代入を許容するため、コンパイル時に検出不可。IPC ハンドラの修正（IMPORT-INTERFACE-001）完了後も Renderer 側が未修正のまま残り、E2E でのみ検出可能                                                                                             |
| 解決策       | 境界変換を1箇所に集約: `availableSkills.filter(s => selectedIds.has(s.id)).map(s => s.name)`                                                                                                                                                                                |

**境界変換のデータフロー**:

| 段階             | 変数           | 型                   | 値の例                  | 用途                         |
| ---------------- | -------------- | -------------------- | ----------------------- | ---------------------------- |
| UI選択状態       | `selectedIds`  | `Set<string>`        | `"a1b2c3..."` (SHA-256) | チェックボックスのON/OFF管理 |
| 変換処理         | `filter + map` | `Skill[] → string[]` | -                       | id→name の契約変換           |
| コールバック引数 | `skillNames`   | `string[]`           | `["my-skill"]`          | IPC ハンドラへの入力値       |

**コード例**:

```typescript
// ❌ 修正前: id をそのまま渡す
const handleImport = () => {
  onImport(Array.from(selectedIds)); // selectedIds は skill.id（ハッシュ）
  onClose();
};

// ✅ 修正後: id → name への明示的変換
const handleImport = () => {
  const selectedNames = availableSkills
    .filter((skill) => selectedIds.has(skill.id))
    .map((skill) => skill.name);
  onImport(selectedNames);
  onClose();
};
```

**苦戦箇所と解決策**:

| #   | 苦戦ポイント                             | 原因                                                                                | 解決策                                                                               | 教訓                                                          |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| 1   | 同名ファイルの修正対象特定               | `SkillImportDialog` が複数配置されており、ファイル名検索だけでは対象を特定できない  | `AgentView` の import 文から逆引きし、`organisms/SkillImportDialog/index.tsx` を固定 | UI不具合は「利用箇所 → import先 → 実装本体」の順で特定する    |
| 2   | `skill.id` / `skill.name` の型的区別不可 | 両方 `string` 型のため TypeScript が警告しない                                      | 変数名を `skillNames` に統一し、テストで否定条件（id が渡されない）を追加            | 文字列識別子は「命名」「変換点」「否定条件テスト」の3点で守る |
| 3   | 偽成功ログによる障害点の誤認             | `importSkills` 関数単位のログだけ確認し、IPC ハンドラの最終戻り値まで追跡しなかった | Renderer入力値 → IPC引数 → `getSkillByName()` 照合を一連で確認                       | IPC系は「最終レスポンス契約」を真実源として扱う               |

**P44 三層修正の全体像**:

| レイヤー        | タスク                              | 修正内容                                                          | 完了日     |
| --------------- | ----------------------------------- | ----------------------------------------------------------------- | ---------- |
| IPC Handler     | UT-FIX-SKILL-IMPORT-INTERFACE-001   | 引数を `{ skillIds: string[] }` → `skillName: string` に変更      | 2026-02-21 |
| IPC Return Type | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | 戻り値を `ImportResult` → `ImportedSkill` に変更（2ステップ変換） | 2026-02-21 |
| Renderer        | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 | `skill.id` → `skill.name` への変換処理を追加                      | 2026-02-22 |

**適用判断基準**:

| 条件                                               | 判断                     |
| -------------------------------------------------- | ------------------------ |
| コンポーネントの内部状態IDとAPI引数の識別子が一致  | 変換不要                 |
| 内部状態IDとAPI引数が異なる `string` 型で分離可能  | **境界変換パターン適用** |
| 識別子が `number` や Branded Type で型的に区別可能 | 型チェックで防止可能     |

**関連 Pitfall**: P44（IPC ハンドラと Preload のインターフェース不整合）、P45（IPC引数命名の契約ドリフト）

**関連タスク**: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001（2026-02-22完了）

---

### IPC ハンドラ二重登録防止パターン（UT-FIX-IPC-HANDLER-DOUBLE-REG-001 2026-02-14実装）

macOS の `activate` イベントでウィンドウを再作成する際に、`ipcMain.handle()` の二重登録例外を防止するパターン。

| 要素     | 説明                                                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 問題     | `ipcMain.handle()` は同一チャンネルに2つ目のハンドラ登録を試みると例外を送出する。`ipcMain.on()` とは異なり、暗黙的な多重登録ができない |
| 発生条件 | macOS でドックアイコンクリック → `activate` イベント → `registerAllIpcHandlers()` 再実行                                                |
| 解決策   | `unregisterAllIpcHandlers()` で全チャンネルを一括解除してから再登録する（A案: unregister→register）                                     |
| 不採用案 | B案: フラグガード（stale参照リスク）、C案: 全ハンドラファイルリファクタ（影響範囲大）                                                   |

**一括解除の3ステップ**:

| ステップ | API                                   | 目的                                        |
| -------- | ------------------------------------- | ------------------------------------------- |
| 1        | `ipcMain.removeHandler(channel)`      | `ipcMain.handle()` で登録したハンドラを解除 |
| 2        | `ipcMain.removeAllListeners(channel)` | `ipcMain.on()` で登録したリスナーを解除     |
| 3        | `themeWatcherUnsubscribe()`           | `nativeTheme.on("updated")` リスナーを解除  |

**ipcMain.handle() vs ipcMain.on() の動作差異**:

| API                | 二重登録時の動作             | 解除API                        |
| ------------------ | ---------------------------- | ------------------------------ |
| `ipcMain.handle()` | 例外を送出                   | `ipcMain.removeHandler()`      |
| `ipcMain.on()`     | 暗黙的に追加（リスナー増殖） | `ipcMain.removeAllListeners()` |

**セキュリティ考慮事項**: 全チャンネルは `IPC_CHANNELS` 定数から `Object.values()` で取得し、ホワイトリストの網羅性を保証する。4層防御（L1-L4）は個別ハンドラ側で維持されるため、unregister/register では影響を受けない。

**関連タスク**: UT-FIX-IPC-HANDLER-DOUBLE-REG-001（2026-02-14完了）

**関連未タスク（UT-FIX-IPC-HANDLER-DOUBLE-REG-001 から派生）**:

| タスクID                             | タスク名                                             | 優先度 |
| ------------------------------------ | ---------------------------------------------------- | ------ |
| task-sec-ipc-lifecycle-audit-001     | Electron ライフサイクルイベント IPC リスナー管理監査 | 中     |
| task-imp-ipc-registration-verify-001 | IPC ハンドラ登録整合性自動検証テスト                 | 中     |

---

## IPCインターフェース不整合修正パターン（P44 2026-02-21実装）

> **ステータス**: 解決済み（UT-FIX-SKILL-IMPORT-INTERFACE-001 + UT-FIX-SKILL-REMOVE-INTERFACE-001）
> P44（skill:import/remove IPCハンドラとPreloadのインターフェース不整合）に対する体系的修正テンプレート。

### 問題: Main Processハンドラの引数型とPreload側実引数の不一致

| レイヤー                    | 修正前（不整合）                 | 修正後（統一）      |
| --------------------------- | -------------------------------- | ------------------- |
| Main Handler (skill:import) | `args: { skillIds: string[] }`   | `skillName: string` |
| Main Handler (skill:remove) | `args: { skillId: string }`      | `skillName: string` |
| Preload (skill-api.ts)      | `safeInvoke(channel, skillName)` | 変更なし            |
| Renderer (呼び出し元)       | `importSkill(skillName)`         | 変更なし            |

### 修正テンプレート: P42準拠3段バリデーション

```typescript
// 修正前（不整合）: ハンドラは object を期待、Preload は string を渡す
ipcMain.handle("skill:import", async (event, args: { skillIds: string[] }) => {
  if (!Array.isArray(args?.skillIds)) {
    throw { code: "VALIDATION_ERROR", message: "skillIds must be an array" };
  }
  // args.skillIds は undefined → バリデーションエラー
});

// 修正後（P42準拠3段バリデーション）: ハンドラを Preload に合わせる
ipcMain.handle("skill:import", async (event, skillName: string) => {
  // 3段バリデーション: 型チェック → 空文字列 → トリム空文字列
  if (typeof skillName !== "string" || skillName.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    };
  }
  // 配列ラップでサービス層API互換性を維持
  return skillService.importSkills([skillName]);
});
```

### 修正判断基準: 「呼び出し元が多い側を変更しない」

| 判断条件                             | 変更側                              | 理由               |
| ------------------------------------ | ----------------------------------- | ------------------ |
| Preload/Rendererの呼び出し箇所が多い | Main Handler                        | 影響範囲の最小化   |
| Main Handlerの利用箇所が多い         | Preload                             | 変更コストの最小化 |
| 両方同数                             | ドキュメント/仕様書の定義に合わせる | 正本基準           |

### 3箇所同時更新チェックリスト（P23/P32準拠）

| チェック | ファイル                          | 更新内容                                         |
| -------- | --------------------------------- | ------------------------------------------------ |
| [ ]      | Main Handler (`skillHandlers.ts`) | 引数型を `string` に変更 + 3段バリデーション追加 |
| [ ]      | Preload API (`skill-api.ts`)      | 通常は変更不要（確認のみ）                       |
| [ ]      | テスト (`skillHandlers.test.ts`)  | 新引数形式に合わせたテストケース更新             |
| [ ]      | `pnpm typecheck`                  | 型整合性の検証                                   |
| [ ]      | `pnpm vitest run` (apps/desktop)  | テスト全件PASS確認                               |

**関連Pitfall**: P23（API二重定義の型管理複雑性）、P32（型定義の二箇所同時更新必須）、P42（.trim()バリデーション漏れ）、P44（skill:import/remove IPCインターフェース不整合）、P45（IPC引数命名の契約ドリフト）

**関連タスク**: UT-FIX-SKILL-IMPORT-INTERFACE-001, UT-FIX-SKILL-REMOVE-INTERFACE-001

> **参照**:
>
> - IPCインターフェース契約検証の詳細チェックリスト: [ipc-contract-checklist.md](./ipc-contract-checklist.md)
> - 既知の落とし穴 P44: [06-known-pitfalls.md](../../rules/06-known-pitfalls.md#p44-skillimportremove-ipcハンドラとpreloadのインターフェース不整合)

---

## SkillEditor 実装パターン（TASK-9A completed）

> **ステータス**: 実装完了（2026-02-26）
> TASK-9A-skill-editor で採用した実装パターンを記録する。

### textareaベースコードエディターパターン

外部ライブラリ（Monaco, CodeMirror等）を使用せず、HTML textarea要素でコード編集UIを実現するパターン。

| 設定項目      | 値          | 目的                             |
| ------------- | ----------- | -------------------------------- |
| `spellCheck`  | `false`     | コード入力時のスペルチェック抑制 |
| `font-family` | `monospace` | 等幅フォントでコード可読性向上   |
| `white-space` | `pre`       | 空白文字・改行の保持             |
| `tab-size`    | `2`         | インデント幅統一                 |

**Tab→2スペース挿入**: `onKeyDown` で `key === 'Tab'` を検知し、`e.preventDefault()` 後にカーソル位置にスペース2個を挿入する。`selectionStart` / `selectionEnd` で挿入位置を制御。

### FileTree内部状態管理パターン

Zustand Storeを使用せず、`useState` + `Set<string>` でカテゴリ展開状態を管理するパターン。

| 状態             | 型               | 管理方法   | 理由                                        |
| ---------------- | ---------------- | ---------- | ------------------------------------------- |
| カテゴリ展開状態 | `Set<string>`    | `useState` | コンポーネント固有UI、P31無限ループ事前対策 |
| 選択ファイルパス | `string \| null` | `useState` | エディター内ローカル状態                    |
| ファイル内容     | `string`         | `useState` | IPC読み込み結果の一時保持                   |
| 未保存フラグ     | `boolean`        | `useState` | 保存ボタンの有効/無効制御                   |

**設計判断**: P31（Zustand Store Hooks無限ループ）の事前対策として、SkillEditorのすべての状態を `useState` で管理する。SkillEditorはモーダル的なコンポーネントであり、グローバル共有の必要がないため、この選択は妥当。

### IPC連携ファイル編集パターン

ファイルの読み込み・編集・保存・作成・削除・復元をIPC経由で行うデータフローパターン。

| ステップ | 処理             | データフロー                                                                 |
| -------- | ---------------- | ---------------------------------------------------------------------------- |
| 1        | ファイル選択     | ユーザークリック → setState(path)                                            |
| 2        | ファイル読み込み | readFile(skillName, path) → content                                          |
| 3        | コンテンツ表示   | setState(content) → textarea表示                                             |
| 4        | 編集検知         | onChange → setState(newContent) + hasChanges=true                            |
| 5        | 保存             | writeFile(skillName, path, content) → hasChanges=false                       |
| 6        | 新規作成         | createFile(skillName, path, "") → fileTree更新 + loadFile(path)              |
| 7        | 削除             | deleteFile(skillName, path) → fileTree更新 + fallback選択                    |
| 8        | バックアップ復元 | restoreBackup(skillName, backupPath) → fileTree更新 + loadFile(originalPath) |

**未保存検出**: `hasChanges` フラグで編集状態を追跡し、保存ボタンの有効/無効制御とEscape閉じる時の確認ダイアログ表示に使用。

### Pitfall事前組み込みパターン

仕様書段階で既知のPitfallを対策として組み込むアプローチ。

| Pitfall | 対策                                      | 組み込み箇所   |
| ------- | ----------------------------------------- | -------------- |
| P31     | Zustand不使用、useState のみで状態管理    | 状態管理設計   |
| P39     | happy-dom環境では fireEvent を使用        | テスト設計     |
| P40     | `apps/desktop` ディレクトリからテスト実行 | テスト実行手順 |

**関連タスク**: TASK-9A（completed）
**関連ドキュメント**: [SkillEditor UIコンポーネント仕様](./ui-ux-feature-components.md#skill-editor-ui-task-9a)

---

## IPC インターフェース不整合修正パターン（P44/P45解決）

### 問題

Main ProcessのIPCハンドラがオブジェクト形式（`{ skillId: string }`）を期待しているのに、Preload側が単一文字列 `skillName` を渡す。contextBridgeのモック化によりコンパイル時には検出されず、ランタイムで初めて顕在化する。

### 解決パターン

1. ハンドラ側をPreload側の引数形式に合わせる（アプローチA）
2. P42準拠の3段バリデーション適用（typeof → 空文字列 → trim空文字列）
3. 引数命名をセマンティクスに一致させる（skillId → skillName）
4. P23/P32準拠で3箇所同時更新（ハンドラ・Preload API・テスト）

### 実装苦戦箇所と対策

| 苦戦箇所                 | 原因                                                            | 対策                                                                  |
| ------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| Phase依存順序違反        | 5エージェント並列ディスパッチでPhase 1-3完了前にPhase 4-7が先行 | Phase依存チェーンを尊重し、ゲートPhase（3, 10）前後で並列化区間を分離 |
| worktree環境でのPhase 11 | Electron起動不可                                                | 自動テスト（vitest）で代替し、制約を明記                              |
| カバレッジ閾値解釈       | skillHandlers.ts全体のLine 45%は低いが修正対象は全分岐カバー    | ハンドラ固有の分岐カバー率を別途記録し、ファイル全体の数値と区別      |

### 関連Pitfall・タスク

- **関連Pitfall**: P23, P32, P42, P44, P45
- **関連タスク**: UT-FIX-SKILL-REMOVE-INTERFACE-001, UT-FIX-SKILL-IMPORT-INTERFACE-001

---

## useShallow派生selectorパターン（S18: TASK-10A-E-C 2026-03-06策定）

### 問題

Zustand の派生セレクタで `.filter()` を使用すると、毎回新しい配列参照が生成される。Zustand のデフォルト比較（`Object.is`）では内容が同一でも異なる参照と判定され、React の `useSyncExternalStore` が無限ループに陥る。これは P31（Zustand Store Hooks無限ループ）の派生パターンである。

### 症状

- `renderHook` テストで無限ループが発生し、テストがタイムアウト
- コンポーネントが無限再レンダーを繰り返す
- `useEffect` の依存配列にセレクタ結果を含めると永続実行

### 根本原因

```typescript
// ❌ 毎回新しい配列参照を返す → Object.is で常に false
export const useAvailableSkillsForImport = () =>
  useAppStore((state) =>
    state.availableSkillsMetadata.filter(
      (a) => !state.importedSkills.some((i) => i.name === a.name),
    ),
  );
```

`.filter()` は常に新しい配列を生成する。`[1, 2, 3].filter(x => true) !== [1, 2, 3].filter(x => true)` が常に `true` であるのと同じ原理。

### 解決パターン: useShallow の適用

```typescript
import { useShallow } from "zustand/react/shallow";

// ✅ useShallow で shallow 比較を適用 → 内容同一なら同一参照と判定
export const useAvailableSkillsForImport = () =>
  useAppStore(
    useShallow((state) =>
      state.availableSkillsMetadata.filter(
        (a) => !state.importedSkills.some((i) => i.name === a.name),
      ),
    ),
  );
```

### 適用判断基準

| 条件                                                  | useShallow 必要 | 理由                           |
| ----------------------------------------------------- | --------------- | ------------------------------ |
| `.filter()` で配列を返すセレクタ                      | **必須**        | 毎回新しい配列参照             |
| `.map()` で変換配列を返すセレクタ                     | **必須**        | 同上                           |
| `{ ...state, computed }` でオブジェクトを返すセレクタ | **必須**        | 毎回新しいオブジェクト参照     |
| `state.singleField` でプリミティブを返すセレクタ      | 不要            | `Object.is` で正しく比較可能   |
| `state.actionFunction` でアクション関数を返すセレクタ | 不要            | Zustand のクロージャで安定参照 |

### パフォーマンス特性

- `useShallow` は配列要素の参照を `===` で比較するのみ（O(n)）
- 100件規模の配列でも 1ms 未満で完了
- Deep equality よりも軽量で、ほとんどのユースケースで十分

### 関連Pitfall・タスク

- **関連Pitfall**: P31（Zustand Store Hooks無限ループ）
- **関連タスク**: TASK-10A-E-C（Store駆動ライフサイクル統合設計）
- **適用箇所**: `apps/desktop/src/renderer/store/index.ts` の `useAvailableSkillsForImport` / `useFilteredAvailableSkills`

---

## IPCチャネル名競合予防パターン（UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 2026-02-24策定）

### 問題

既存IPCチャネル `skill:import`（ローカルスキルインポート、引数: `string`）と、TASK-9Fで新規追加予定の外部ソースインポート機能（引数: `ShareTarget`）が同一チャネル名を使用する設計だった。`ipcMain.handle()` は同一チャネルへの二重登録で例外を送出するため（P5）、実装段階で100%失敗する構造的問題があった。

### 解決アプローチ: 仕様書段階でのチャネル名分離

コード実装前に仕様書レベルで競合を検出・解消する「予防的仕様書修正」パターン。

### IPCチャネル命名規則

| パターン                 | 用途                         | 例                                           |
| ------------------------ | ---------------------------- | -------------------------------------------- |
| `skill:{動詞}`           | 既存ローカル操作             | `skill:import`, `skill:remove`, `skill:list` |
| `skill:{動詞}FromSource` | 外部ソース経由の操作         | `skill:importFromSource`                     |
| `skill:{動詞}Source`     | ソース自体への操作（検証等） | `skill:validateSource`                       |

### チャネル名の既存/新規対応表

| チャネル名               | 引数型                                            | 用途                                | 状態             |
| ------------------------ | ------------------------------------------------- | ----------------------------------- | ---------------- |
| `skill:list`             | なし                                              | ローカルスキル一覧                  | 既存             |
| `skill:import`           | `skillName: string`                               | ローカルスキル読込                  | 既存（変更不要） |
| `skill:remove`           | `skillName: string`                               | ローカルスキル削除                  | 既存             |
| `skill:get-detail`       | `{ skillId: string }`                             | スキル詳細取得                      | 既存             |
| `skill:readFile`         | `{ skillName: string, relativePath: string }`     | ファイル読み取り（`SKILL.md` 含む） | 既存             |
| `skill:importFromSource` | `ShareTarget`                                     | 外部ソースインポート                | TASK-9F新規      |
| `skill:validateSource`   | `ShareTarget`                                     | インポート元の検証                  | TASK-9F新規      |
| `skill:export`           | `{ skillName: string, destination: ShareTarget }` | スキルエクスポート                  | TASK-9F新規      |

### 命名の判断基準

| 条件                                           | 命名パターン             | 理由                                               |
| ---------------------------------------------- | ------------------------ | -------------------------------------------------- |
| 既存チャネルと同じ動詞だが用途・引数型が異なる | `skill:{動詞}FromSource` | P5（二重登録例外）を回避しつつ、操作の意図を明確化 |
| 既存チャネルと名前衝突のリスクがない新規操作   | `skill:{動詞}`           | 簡潔さを優先                                       |
| 操作対象がソース自体（検証、一覧等）           | `skill:{動詞}Source`     | 「何に対する操作か」を名前で表現                   |

### 実装チェックリスト（TASK-9F実装時）

```typescript
// apps/desktop/src/main/ipc/channels.ts への追加
export enum IPC_CHANNELS {
  // 既存（変更不要）
  SKILL_IMPORT = "skill:import",
  // 新規追加
  SKILL_IMPORT_FROM_SOURCE = "skill:importFromSource",
  SKILL_VALIDATE_SOURCE = "skill:validateSource",
  SKILL_EXPORT = "skill:export",
}
```

1. `channels.ts` に新チャネル定数を追加
2. `preload/types.ts` に型定義を追加（P32準拠: 2箇所同時更新）
3. Main Process ハンドラを実装（P42準拠: 3段バリデーション）
4. Preload API を実装（`safeInvoke` 使用、P27準拠: 文字列リテラル禁止）
5. `grep -rn "skill:import" apps/desktop/src/` で既存チャネルとの競合がないことを検証

### 苦戦箇所と教訓

#### 1. Phase 4 での修正箇所数の見積もり誤差

- **問題**: Phase 4 仕様書で task-022 の修正箇所を「3箇所」と記載したが、実際は1箇所のみだった
- **原因**: 仕様書設計時にファイル内容を精査せず、概算で修正箇所数を決定
- **教訓**: Phase 4 テスト設計時は、対象ファイルを `grep` で事前検証し、期待値を「N件以上」のような柔軟な基準で設計する

#### 2. 仕様書修正のみタスクの Phase 6-8 ハンドリング

- **問題**: コード変更がないため、Phase 6（テスト拡充）・7（カバレッジ）・8（リファクタリング）が不要
- **解決策**: 各 Phase に `not-applicable.md` を作成し、N/A 理由を明記
- **教訓**: `taskType: "spec-only"` タスクでは、Phase 6-8 を明示的に N/A 記録する運用が有効。Phase 4 の grep 検証が唯一のテスト手段となる

#### 3. 仕様書間のチャネル名重複検出

- **問題**: skill-import-agent-system 配下の複数仕様書（task-022, task-030）に同じチャネル名が散在
- **解決策**: `grep -rn "skill:import" docs/30-workflows/skill-import-agent-system/` で全仕様書横断検索
- **教訓**: 新規 IPC チャネル追加時は、既存チャネルとの名前衝突を仕様書レベルで事前検証する

### 関連Pitfall

| Pitfall | 概要                            | 本パターンでの対応                                          |
| ------- | ------------------------------- | ----------------------------------------------------------- |
| P5      | `ipcMain.handle()` 二重登録例外 | 同名チャネルを分離してリスクを排除                          |
| P44     | IPC ハンドラと Preload の不整合 | チャネル名明確化により引数の曖昧性を解消                    |
| P45     | IPC 引数命名の契約ドリフト      | 新チャネルで `ShareTarget` 型を明示的に使用                 |
| P32     | 型定義の2箇所同時更新必須       | チェックリストで `channels.ts` と `preload/types.ts` を明記 |
| P42     | .trim() バリデーション漏れ      | 3段バリデーションをチェックリストに含有                     |

### 参照

- [UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 仕様書](../../../../docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/index.md)
- [06-known-pitfalls.md#P5](../../rules/06-known-pitfalls.md)
- [06-known-pitfalls.md#P44](../../rules/06-known-pitfalls.md)
- [ipc-contract-checklist.md](./ipc-contract-checklist.md)

---

## P42準拠バリデーション一括移行パターン（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 2026-02-24実装）

### S18: P42準拠バリデーション一括移行パターン（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001）

IPCハンドラ群のバリデーション応答形式を一括でP42準拠に統一するための移行パターン。個別ハンドラ修正（P44: skill:import/remove）とは異なり、ファイル内の全ハンドラを横断的に統一する。

#### 問題

IPCハンドラのバリデーションが4種類の応答形式で混在しており、エラーハンドリングの一貫性がなく、セキュリティ上のリスク（スペースのみ入力 `"   "` の通過）がある。

| パターン | 応答形式                              | 該当ハンドラ                    | セキュリティリスク |
| -------- | ------------------------------------- | ------------------------------- | ------------------ |
| A        | `return { code: "VALIDATION_ERROR" }` | skill:get-detail, skill:execute | `.trim()` 未適用   |
| B        | `return false`                        | skill:abort                     | 型チェックのみ     |
| C        | `return null`                         | skill:get-status                | 型チェックのみ     |
| D        | `return { success: false }`           | skill:analyze, skill:improve    | `.trim()` 未適用   |

#### 解決策

P42準拠の3段バリデーション + throw形式に統一:

| ステップ | チェック内容                         | 目的                                          |
| -------- | ------------------------------------ | --------------------------------------------- |
| 1        | `typeof !== "string"`                | 型チェック（null, undefined, number等を拒否） |
| 2        | `.trim() === ""`                     | スペースのみ入力の拒否（P42の核心）           |
| 3        | `throw { code: "VALIDATION_ERROR" }` | 統一エラー応答（safeInvokeが自動キャッチ）    |

```typescript
// ❌ 修正前: 4種類のバリデーションパターンが混在
// パターンA
if (typeof args?.skillId !== "string" || args.skillId === "") {
  return {
    code: "VALIDATION_ERROR",
    message: "skillId must be a non-empty string",
  };
}
// パターンB
if (!executionId) {
  return false;
}
// パターンC
if (!executionId) {
  return null;
}
// パターンD
if (typeof args?.skillName !== "string" || args.skillName === "") {
  return { success: false, error: "スキル名が指定されていません" };
}

// ✅ 修正後: P42準拠統一パターン（全ハンドラ共通）
// オブジェクト引数型
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
// 直接引数型
if (typeof executionId !== "string" || executionId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "executionId must be a non-empty string",
  };
}
```

#### 後方互換性

| レイヤー             | 影響         | 理由                                                                                                            |
| -------------------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| Main Process         | **変更あり** | return → throw に変更                                                                                           |
| Preload (safeInvoke) | **変更なし** | Main Processのthrowを自動キャッチしてPromise rejectionに変換（Electron仕様: `ipcRenderer.invoke()` が自動変換） |
| Renderer             | **変更なし** | safeInvokeのエラーハンドリングパスで既にキャッチ済み                                                            |

#### 引数形式別の適用パターン

| 引数形式       | バリデーション対象 | 該当ハンドラ                                                  | チェック式                                                              |
| -------------- | ------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| オブジェクト型 | `args?.fieldName`  | skill:get-detail, skill:execute, skill:analyze, skill:improve | `typeof args?.fieldName !== "string" \|\| args.fieldName.trim() === ""` |
| 直接引数型     | `argName`          | skill:abort, skill:get-status                                 | `typeof argName !== "string" \|\| argName.trim() === ""`                |

#### 移行チェックリスト

- [ ] 対象ハンドラのバリデーション形式を分類（`grep -n "return.*VALIDATION\|return false\|return null\|return.*success.*false" skillHandlers.ts`）
- [ ] Preload層のsafeInvoke例外処理パスを確認（throwがPromise rejectionに変換されることを検証）
- [ ] 各ハンドラに3段バリデーション（typeof + .trim() + throw）を適用
- [ ] describe.eachマトリクステストを作成（全ハンドラ × 入力パターン: null, undefined, `""`, `"   "`, 正常値）
- [ ] 既存テストのアサーション修正（return → throw: `rejects.toMatchObject` に変更）
- [ ] 全テストPASSを確認

#### テスト戦略: describe.eachマトリクステスト

| 要素         | 説明                                                              |
| ------------ | ----------------------------------------------------------------- |
| テスト手法   | `describe.each` で全ハンドラ × 入力パターンのマトリクスを自動生成 |
| 入力パターン | `null`, `undefined`, 空文字列 `""`, スペースのみ `"   "`, 正常値  |
| アサーション | `rejects.toMatchObject({ code: "VALIDATION_ERROR" })`             |
| テスト件数   | 59件の新規テスト（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001実績）   |
| 全テスト     | 181件PASS（既存テスト含む）                                       |

#### 注意事項

- 共通バリデーション関数の抽出は引数形式（オブジェクト型/直接引数型）が統一されるまで保留（YAGNI原則）
- throw統一はsafeInvoke設計に依存するため、Preload層の確認が必須前提
- ネストされたオブジェクト引数（例: `args.analysis` in skill:improve）はP42スコープ外（オブジェクト型のため文字列バリデーション不適用）
- 引数名のセマンティクスドリフト（skillId→skillName）は別タスク（P45参照）

#### 関連パターン

- P42（.trim()バリデーション漏れ）— 元となるPitfall
- P44（skill:import/remove IPCインターフェース不整合）— 参照実装（個別ハンドラ修正の先行事例）
- [IPCインターフェース不整合修正パターン（P44 2026-02-21実装）](#ipcインターフェース不整合修正パターンp44-2026-02-21実装) — P42準拠3段バリデーションの初回適用テンプレート
- [ipc-contract-checklist.md](./ipc-contract-checklist.md) — IPC契約検証の詳細チェックリスト

**関連タスク**: UT-FIX-SKILL-VALIDATION-CONSISTENCY-001（2026-02-24完了、Issue #874）

---

## IPC データフロー型ギャップパターン（UT-IPC-DATA-FLOW-TYPE-GAPS-001 2026-02-24実装）

### S19: IPC Date型シリアライズパターン

> **発見タスク**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
> **関連Pitfall**: なし（新規パターン）

#### 問題

IPC境界（Main Process ↔ Renderer）でDate型フィールドを送信する際、JSONシリアライズにより型情報が失われる。JavaScript の `JSON.stringify(new Date())` は文字列を返すが、形式が実装依存になるリスクがある。

#### 解決策

ISO 8601文字列を統一基準として採用し、Main Process側で明示的に `.toISOString()` で変換する。

```typescript
// Main Process（ハンドラ戻り値）
interface SkillScheduleResponse {
  nextRun: string; // ISO 8601
  lastRun: string | null; // ISO 8601, nullable
  createdAt: string; // ISO 8601
}

const response: SkillScheduleResponse = {
  nextRun: schedule.nextRun.toISOString(),
  lastRun: schedule.lastRun?.toISOString() ?? null,
  createdAt: schedule.createdAt.toISOString(),
};

// Renderer側（受信後の復元）
const nextRun = new Date(response.nextRun);
const lastRun = response.lastRun ? new Date(response.lastRun) : null;
```

#### 適用基準

| 条件                            | 適用                                 |
| ------------------------------- | ------------------------------------ |
| IPC境界を越えるDate型フィールド | 必須                                 |
| 同一プロセス内のDate型          | 不要（Date型のまま使用）             |
| nullable な Date フィールド     | `string \| null; // ISO 8601` と定義 |

#### 仕様書での型注記

仕様書レベルでは、Date型フィールドに `// ISO 8601` コメントを付与する：

```typescript
interface BackendType {
  scheduledAt: Date; // バックエンド側の型
}

interface IPCResponseType {
  scheduledAt: string; // ISO 8601（IPC送信用）
}
```

### S20: IPC引数object形式統一パターン

> **発見タスク**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
> **関連Pitfall**: P44（引数型不整合）, P45（引数命名ドリフト）

#### 問題

positional形式（`safeInvoke(channel, arg1, arg2)`）のIPC引数は、引数の順序を間違えたり、引数名のセマンティクスが不明確になるリスクがある。P44/P45で発見されたインターフェース不整合は、全てpositional形式に起因していた。

#### 解決策

全IPC引数をobject形式に統一し、Args型定義を新規作成する。

```typescript
// ❌ positional形式（P44リスク）
safeInvoke("skill:editor:read", skillName, relativePath);

// ✅ object形式 + Args型定義
interface SkillEditorReadArgs {
  skillName: string;
  relativePath: string;
}

safeInvoke("skill:editor:read", {
  skillName,
  relativePath,
} satisfies SkillEditorReadArgs);

// ハンドラ側（P42準拠3段バリデーション）
ipcMain.handle(
  "skill:editor:read",
  async (event, args: SkillEditorReadArgs) => {
    // フィールドごとに3段バリデーション
    if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }
    if (
      typeof args?.relativePath !== "string" ||
      args.relativePath.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "relativePath must be a non-empty string",
      };
    }
    return service.readFile(args.skillName.trim(), args.relativePath.trim());
  },
);
```

#### Args型定義テンプレート

```typescript
// 命名規則: {Channel}Args（例: SkillEditorReadArgs）
interface {Channel}Args {
  // フィールド名は実際の値のセマンティクスに合致させる（P45対策）
  fieldName: string;  // 必須フィールド
  optionalField?: string;  // オプショナルフィールド
}
```

#### 移行時の注意点

1. Preload側とHandler側を同時に変更する（P23/P32準拠）
2. テストの引数も新しいobject形式に更新する
3. 内部サービスメソッドの引数名もセマンティクスに合わせて統一する（P45対策）

### S21: 仕様書間型ギャップ検出パターン

> **発見タスク**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
> **関連Pitfall**: なし（新規パターン）

#### 問題

バックエンド型定義（task-9a〜task-9j）とフロントエンドProps定義（task-030, task-031b）の間に、以下のカテゴリの型ギャップが潜在する：

| ギャップカテゴリ       | 説明                                               | 検出方法                            |
| ---------------------- | -------------------------------------------------- | ----------------------------------- |
| Date型シリアライズ     | IPC境界でのDate→string変換未定義                   | `grep -c "Date" task-*.md`          |
| 状態値セット不一致     | バックエンドとフロントエンドのenum値セットが異なる | 型定義の目視比較                    |
| コールバック引数不明確 | UIコンポーネントのコールバック引数が仕様書で未定義 | Props定義とイベントハンドラの照合   |
| 変換ロジック未記載     | バックエンド戻り値→UI表示の変換ロジックが不在      | データフローの端点追跡              |
| 購読パターン未定義     | safeOnのcleanupやStrictMode対策が未記載            | useEffect内のIPC購読パターン検索    |
| 引数形式不整合         | positional vs object形式の不一致                   | `grep -c "safeInvoke.*," task-*.md` |

#### 検出手順

1. バックエンド仕様書の全型定義をリストアップ
2. フロントエンド仕様書のProps定義をリストアップ
3. 型名の対応表を作成（例: `SkillSchedule` ↔ `ScheduleViewProps`）
4. 各対応ペアのフィールド型を比較し、ギャップを分類
5. ギャップマトリクス（Gap×ファイル）を作成
6. Gap別に修正→ファイル間検証のサイクルで修正

#### 検証コマンド例

```bash
# Date型フィールドの数を各ファイルで確認
for f in task-9*.md; do echo "$f: $(grep -c 'Date' $f)"; done

# ISO 8601注記の追加状況を確認
grep -c "ISO 8601" task-*.md

# positional引数パターンの検出
grep -n "safeInvoke.*,.*," task-*.md

# object形式引数パターンの確認
grep -n "safeInvoke.*{" task-*.md
```

### S22: AUTH IPC登録一元化パターン（UT-IPC-AUTH-HANDLE-DUPLICATE-001 2026-02-25実装）

> **発見タスク**: UT-IPC-AUTH-HANDLE-DUPLICATE-001
> **関連Pitfall**: P5（二重登録）, P44（契約ドリフト）, P45（命名ドリフト）

#### 問題

AUTH系IPCでは、通常経路（Supabaseあり）とfallback経路（Supabaseなし）で
`ipcMain.handle` の登録式が重複しやすく、監査ノイズと修正漏れの原因になる。

#### 解決策

通常経路は共通登録ヘルパー、fallback経路は配列定義 + ループ登録に統一する。

```typescript
// 通常経路: authHandlers.ts
const registerValidatedAuthHandler = <TArgs extends unknown[]>(
  channel: AuthInvokeChannel,
  handler: (event: IpcMainInvokeEvent, ...args: TArgs) => Promise<unknown>,
): void => {
  ipcMain.handle(
    channel,
    withValidation(channel, handler, { getAllowedWindows: () => [mainWindow] }),
  );
};

registerValidatedAuthHandler(IPC_CHANNELS.AUTH_LOGIN, async (_event, args) => {
  /* ... */
});

// fallback経路: ipc/index.ts
const fallbackAuthHandlers: ReadonlyArray<
  readonly [string, () => Promise<unknown>]
> = [
  [IPC_CHANNELS.AUTH_LOGIN, async () => notConfiguredResponse],
  [IPC_CHANNELS.AUTH_LOGOUT, async () => notConfiguredResponse],
  [IPC_CHANNELS.AUTH_GET_SESSION, async () => ({ success: true, data: null })],
  [IPC_CHANNELS.AUTH_REFRESH, async () => notConfiguredResponse],
  [
    IPC_CHANNELS.AUTH_CHECK_ONLINE,
    async () => ({ success: true, data: { online: net.isOnline() } }),
  ],
];

for (const [channel, handler] of fallbackAuthHandlers) {
  ipcMain.handle(channel, handler);
}
```

#### 適用チェックリスト

- [ ] 通常経路/ fallback 経路の両方で AUTH 5チャネルが過不足なく登録される
- [ ] `ipcMain.handle(IPC_CHANNELS.AUTH_*)` の重複直書きを残さない
- [ ] 既存契約（引数/戻り値/エラーコード）を変更しない
- [ ] fallback回帰テスト（`auth:get-session`, `auth:check-online`）を追加する

#### 検証コマンド

```bash
rg -n "ipcMain\\.handle\\(\\s*IPC_CHANNELS\\.AUTH_" \
  apps/desktop/src/main/ipc/authHandlers.ts \
  apps/desktop/src/main/ipc/index.ts
```

期待結果: 0件

#### 再利用テンプレート（目的/場所/検証）

| Step | 目的     | 場所                                        | 実行                                                  | 成功基準                                        |
| ---- | -------- | ------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| 1    | 対象固定 | `apps/desktop/src/main/ipc/`                | AUTH 5チャネルを2経路（通常/fallback）で列挙          | 対象漏れ0件                                     |
| 2    | 実装修正 | `authHandlers.ts`, `index.ts`               | 通常=共通登録ヘルパー、fallback=配列/ループ登録へ統一 | `ipcMain.handle(IPC_CHANNELS.AUTH_*)` 直書き0件 |
| 3    | 回帰検証 | `__tests__/ipc-double-registration.test.ts` | fallback含む重複登録防止テスト実行                    | PASS                                            |
| 4    | 仕様同期 | `references/` + `task-workflow.md`          | 実装内容/苦戦箇所/完了記録を同一ターンで更新          | リンク切れ0件                                   |

| 監査の落とし穴                       | 対処                                             |
| ------------------------------------ | ------------------------------------------------ |
| 全体監査FAILをそのまま差分FAILと扱う | baseline（全体）と current（変更範囲）を分離判定 |
| 完了移管後の参照更新漏れ             | `verify-unassigned-links.js` を完了条件に固定    |

---

## IPCチャネル命名監査の運用パターン（UT-IPC-CHANNEL-NAMING-AUDIT-001 2026-02-25実施）

### 問題

チャネル命名規則を策定しても、横断監査を定期実行しないと「対象内完了」と「対象外ノイズ（例: AUTH重複式）」が混在し、完了判定と未タスク化の境界が曖昧になる。

### 解決パターン

#### 1. 監査結果を 3 区分で分類する

| 区分         | 判定                   | 対応               |
| ------------ | ---------------------- | ------------------ |
| 対象内・重大 | 仕様/実装ブロッカー    | 現タスクで即時是正 |
| 対象内・軽微 | 命名揺れ/記述不足      | リネーム計画に登録 |
| 対象外・軽微 | 別ドメイン由来のノイズ | 未タスクへ分離登録 |

#### 2. 台帳更新を同一ターンで実施する

1. `task-workflow.md` の対象行を完了化（`spec_created` を含む）
2. 新規未タスクがある場合は `unassigned-task/` に指示書を作成
3. `verify-unassigned-links.js` 実行でリンク切れを機械検証

#### 3. 重複式ノイズの再発防止コマンドを固定化する

```bash
# AUTH系 handle 登録の重複式確認
rg -n "ipcMain\\.handle\\(IPC_CHANNELS\\.AUTH_" apps/desktop/src/main/ipc

# チャネル命名監査の対象/対象外を分離確認
jq '.duplicateHandlers | length' /tmp/ut-ipc-usage-analysis.json
jq '[.duplicateHandlers[] | select(.expr | test("SKILL"))] | length' /tmp/ut-ipc-usage-analysis.json
```

### 適用指針

- 仕様書修正のみタスクでも、`Step 1-A/1-C/1-D`（完了記録・関連台帳・索引再生成）を省略しない。
- 「対象外の検出」を理由に完了判定を遅延させず、未タスク分離で追跡性を維持する。
- 未タスク化した項目は、元タスクの Phase 12 レポートと `task-workflow.md` の双方から辿れる状態にする。

---

## 未タスク監査スコープ分離パターン（UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001）

### 問題

未タスク監査を全体実行のみで運用すると、既存違反（baseline）が今回変更（current）の合否判定を覆い隠し、Phase 12 の完了判定が不安定になる。

### 解決パターン

#### 1. 判定軸を current / baseline に分離する

| 監査モード | コマンド                                                | 用途                       | fail条件                      |
| ---------- | ------------------------------------------------------- | -------------------------- | ----------------------------- |
| 対象監査   | `audit-unassigned-tasks.js --json --target-file <path>` | 今回変更の合否判定         | `currentViolations.total > 0` |
| 差分監査   | `audit-unassigned-tasks.js --json --diff-from <ref>`    | 複数変更ファイルの合否判定 | `currentViolations.total > 0` |
| 全体監査   | `audit-unassigned-tasks.js --json`                      | 既存資産健全性の監視       | 全体違反 > 0                  |

#### 2. Phase 12 の記録を2段構成で固定する

1. `unassigned-task-detection.md` に current/baseline を分離記録する
2. baseline違反は未タスク化の候補として管理し、今回タスクの完了判定とは分離する

#### 3. 完了済み未タスク指示書の移管を同一ターンで実施する

1. `unassigned-task/` → `completed-tasks/unassigned-task/` へ物理移動
2. `task-workflow.md` の参照パスを同期更新
3. `verify-unassigned-links.js` で参照整合を確認

#### 4. Phase 12 準拠確認チェーン（skill-creator連携）を固定する

```bash
# 1) 仕様準拠
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/<workflow> --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/<workflow>

# 2) 未タスク参照整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 3) スキル構造検証（system skill-creator）
node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
```

### 適用指針

- full監査結果をそのまま「今回差分fail」と解釈しない。
- 完了判定は current、負債管理は baseline に責務分離する。
- 台帳更新と物理移管を同一ターンで処理し、運用ドリフトを防止する。

---

## 共有型インポート標準パターン（TASK-10A-D）

### 問題

Electron 3プロセスモデル（Main/Preload/Renderer）で型定義が各層に分散すると、型不整合の発見が遅延する。特に Renderer 側で `unknown[]` プレースホルダ型を使用した場合、コンパイルは通るが実行時に型不一致が顕在化する（P23/P24/P32 の繰り返しパターン）。

### 解決パターン

#### 1. 型定義の配置ルール

| 型の種類           | 配置先                                           | 例                                            |
| ------------------ | ------------------------------------------------ | --------------------------------------------- |
| ドメインモデル型   | `@repo/shared` (`packages/shared/src/`)          | `Skill`, `SkillLifecycleState`, `Suggestion`  |
| Store Slice 状態型 | `@repo/shared` からimport + Slice固有の拡張      | `AgentSliceState extends { skills: Skill[] }` |
| Preload API 型     | `apps/desktop/src/preload/types.ts`              | `ElectronSkillAPI`, `SkillBridgeAPI`          |
| IPC ハンドラ引数型 | Main Process 内で定義、`@repo/shared` の型を参照 | `handler(event, skillName: string)`           |

#### 2. 新規型追加時のチェックリスト

1. `@repo/shared` に型定義を追加
2. `pnpm --filter @repo/shared build` で共有パッケージをビルド
3. Preload `types.ts` の API 型定義を更新
4. Store Slice の型を `@repo/shared` からの import に変更
5. `pnpm typecheck` で全パッケージの型整合性を検証

#### 3. 禁止パターン

| 禁止パターン                        | 理由                                       | 正しいパターン                     |
| ----------------------------------- | ------------------------------------------ | ---------------------------------- |
| `unknown[]` プレースホルダ型        | 型安全性が失われ、実行時エラーの発見が遅延 | `@repo/shared` から具体型をimport  |
| Slice 内での独自型定義              | Store と Preload で型が乖離する            | `@repo/shared` の型をre-export     |
| `as unknown as TargetType` キャスト | 型不整合を隠蔽する                         | 共有型を統一してキャスト不要にする |

### 適用指針

- 新規 IPC チャネル追加時は P23/P32 準拠で `@repo/shared` → Preload → Store の順に型を定義する
- 既存の `unknown[]` 型は発見次第、具体型への置換を未タスク化する
- `pnpm typecheck` は型変更後に必ず全パッケージ（`--filter @repo/shared && --filter @repo/desktop`）で実行する

---

## AgentView Enhancement 実装パターン（TASK-UI-03 2026-03-07実装）

### S23: CSS変数定数抽出パターン（TASK-UI-03-AGENT-VIEW-ENHANCEMENT）

**問題**: Tailwind arbitrary values（`bg-[var(--status-primary)]`）をテスト内でハードコード文字列として比較していたため、トークン名変更時に全テストの修正が必要になる（P47派生）。

**解決パターン**: スタイル定数とアニメーション定数をモジュールスコープの `styles.ts` / `animations.ts` に抽出し、コンポーネントとテストの両方から import する。

| ファイル        | 責務                                       | 内容例                                               |
| --------------- | ------------------------------------------ | ---------------------------------------------------- |
| `styles.ts`     | スペーシング・インタラクティブスタイル定数 | `spacing.sectionGap`, `interactiveStyles.iconButton` |
| `animations.ts` | トランジション・アニメーション定数         | `transitions.hover`, `transitions.slideIn`           |

**定数定義の設計原則**:

- `as const` アサーションで型を狭める
- 8px グリッド準拠のスペーシング値を使用（`gap-4` = 16px, `gap-6` = 24px）
- Tailwind arbitrary values（`bg-[var(--xxx)]`）はトークン名と1:1対応させる

```typescript
// styles.ts - コンポーネント外部で定数管理
export const spacing = {
  sectionGap: "gap-6", // 24px (8px x 3)
  chipGap: "gap-4", // 16px (8px x 2)
  containerPadding: "p-6", // 24px
} as const;

export const interactiveStyles = {
  iconButton:
    "p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors duration-200",
} as const;

// animations.ts - アニメーション定数管理
export const transitions = {
  hover: "transition-transform duration-200 ease",
  tap: "transition-transform duration-100 ease-in",
  slideIn: "transition-transform duration-300 ease-out",
  slideOut: "transition-transform duration-200 ease-in",
} as const;
```

**テスト側での利用**:

```typescript
// テスト側 - 定数を import して期待値に使用
import { spacing } from "./styles";
expect(container.className).toContain(spacing.sectionGap);
// トークン名変更時は styles.ts の1箇所だけ修正すれば完結
```

**適用タイミング**: UIコンポーネント追加時、Phase 5 実装直後に抽出する（Phase 8 リファクタリングでは遅い — テストが既にハードコード文字列で書かれてしまう）

**関連Pitfall**: P47（CSS変数ベースのスタイルテストアサーション戦略）

---

### S24: backward-compatible fallback パターン（TASK-UI-03-AGENT-VIEW-ENHANCEMENT）

**問題**: 新規 Zustand セレクタを追加した際、既存テストのモックが新セレクタを含んでおらず、テストが一斉に壊れる。大規模リファクタリング時に段階的移行が困難になる。

**解決パターン**: `typeof === "function"` ガード付きフォールバックで、新セレクタが存在しない環境でも安全にデフォルト値を返す。

```typescript
// 段階的移行: 新セレクタ未定義の環境でもクラッシュしない
const recentExecutions =
  typeof useRecentExecutions === "function" ? useRecentExecutions() : [];
```

**適用判断基準**:

| 条件                         | フォールバック使用 | 直接セレクタ使用     |
| ---------------------------- | ------------------ | -------------------- |
| 既存テストモックが多数存在   | 推奨               | 全モック更新が必要   |
| セレクタが段階的に追加される | 推奨               | 移行完了まで使えない |
| セレクタが確実に存在する     | 不要               | 推奨                 |

**注意**: フォールバックは移行期間の一時的措置。移行完了後は `typeof` ガードを除去し、直接セレクタ使用に切り替える。

**適用タイミング**: Zustand Store 拡張時、大規模リファクタリング時

**関連Pitfall**: P31（Zustand Store Hooks 無限ループ）

---

### S25: z-index Phase 2 事前設計パターン（TASK-UI-03-AGENT-VIEW-ENHANCEMENT）

**問題**: UIコンポーネント追加時に z-index 衝突が発生し、オーバーレイやフローティング要素が意図しない表示順序になる。Phase 5 実装中に場当たり的に z-index を調整すると、既存コンポーネントとの衝突が連鎖する。

**解決パターン**: Phase 2（アーキテクチャ設計）で z-index 管理テーブルを事前定義し、全レイヤーの表示順序を確定させる。

| レイヤー       | z-index     | コンポーネント例                   |
| -------------- | ----------- | ---------------------------------- |
| ベース         | z-0 〜 z-10 | ページコンテンツ、カードレイアウト |
| ナビゲーション | z-20        | GlobalNavStrip                     |
| パネル         | z-40        | AdvancedSettingsPanel              |
| フローティング | z-50        | FloatingExecutionBar               |

**設計時のルール**:

1. z-index は10刻みで割り当てる（中間値の挿入余地を確保）
2. 同一レイヤー内のコンポーネントは同じ z-index を使用し、DOM 順序で制御する
3. 新規コンポーネント追加時は管理テーブルに追記してからコーディングを開始する

**結果**: TASK-UI-03 では z-index 衝突 0 件を達成。

**適用タイミング**: UIコンポーネント追加タスクの Phase 2 設計レビュー時。Phase 2 テンプレートに z-index 管理テーブルを必須項目として含める。

**関連タスク**: TASK-UI-03-AGENT-VIEW-ENHANCEMENT

### S26: 直接IPC→Store個別セレクタ移行パターン（selector migration / TASK-10A-F 2026-03-07策定）

Custom Hookが `window.electronAPI` を直接呼び出している場合の、Store個別セレクタへの移行手順。

#### 移行チェックリスト

| ステップ | 内容                                             | 検証方法                                                         |
| -------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| 1        | Store actionが agentSlice に定義済みか確認       | `grep -n "analyzeSkill\|createSkill" store/slices/agentSlice.ts` |
| 2        | 個別セレクタが store/index.ts にexport済みか確認 | `grep -n "useAnalyzeSkill\|useCreateSkill" store/index.ts`       |
| 3        | ローカル useState を Store セレクタに置換        | State: `useCurrentAnalysis()`, Action: `useAnalyzeSkill()`       |
| 4        | 直接IPC呼び出しを削除                            | `window.electronAPI.skill.*` → Store action 経由                 |
| 5        | try/catch を全ハンドラに追加                     | Store側error処理済みでも UIクラッシュ防止で必須                  |
| 6        | isMountedRef パターンを削除                      | Store action内部で状態更新するため不要                           |
| 7        | テストを Store mock パターンに移行               | `vi.mock("../../../store")` で個別セレクタをmock                 |

#### テスト mock 標準パターン

```typescript
// State用セレクタ: 値を直接返す
// Action用セレクタ: mock関数を返す
const mockAnalyzeSkill = vi.fn();

vi.mock("../../../store", () => ({
  useCurrentAnalysis: () => null, // State
  useIsAnalyzingSkill: () => false, // State
  useAnalyzeSkill: () => mockAnalyzeSkill, // Action
}));

// beforeEach で mockReset
beforeEach(() => {
  mockAnalyzeSkill.mockReset();
});
```

#### 状態分類の判断基準

| 判断基準                         | Store移行 | ローカル維持 |
| -------------------------------- | --------- | ------------ |
| 複数画面で共有される             | ✅        |              |
| Store action 内部で管理される    | ✅        |              |
| UI一時状態（選択状態等）         |           | ✅           |
| コンポーネント固有の表示ロジック |           | ✅           |

#### P31/P48 適用判定

- スカラー値（string, boolean, null）を返すセレクタ → `useShallow` 不要
- `.filter()` / `.map()` で配列を返すセレクタ → `useShallow` 必須（P48）
- 全セレクタは個別セレクタで取得（合成Hook禁止、P31）

#### 関連パターン

- [S18: useShallow 適用条件](同ファイル内)
- P31: Zustand Store Hooks 無限ループ（06-known-pitfalls.md）
- P42: 文字列引数の .trim() バリデーション漏れ（06-known-pitfalls.md）

**関連タスク**: TASK-10A-F

---

### S27: Renderer 境界 5層防御パターン（06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 2026-03-07実装）

> 追加: 2026-03-07 / 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

**問題**: IPC レスポンスの shape が期待と異なる場合、Renderer 側でクラッシュする

**パターン**:

| 層  | 防御内容               | コード例                                     |
| --- | ---------------------- | -------------------------------------------- |
| L1  | API namespace 存在確認 | `window.electronAPI?.apiKey?.list`           |
| L2  | result shape 正規化    | `result?.success && result?.data`            |
| L3  | 配列保証               | `Array.isArray(result.data.providers)`       |
| L4  | 要素 shape フィルタ    | type predicate で必須フィールド検証          |
| L5  | 例外キャッチ           | try-catch でPromise rejection をハンドリング |

**適用基準**: IPC レスポンスを Renderer 側で消費するすべてのコンポーネント

**関連 Pitfall**: P48（non-null assertion）, P19（型キャスト）, P49（type predicate 内 as キャスト）

**type predicate の推奨パターン（`in` 演算子）**:

```typescript
// ✅ 推奨: in 演算子で実行時検証 + 型ナロイング
const isValidItem = (item: unknown): item is ProviderStatus =>
  item != null &&
  typeof item === "object" &&
  "provider" in item &&
  typeof item.provider === "string" &&
  "status" in item &&
  typeof item.status === "string";

// ❌ 非推奨: as キャストで実行時検証バイパス
const isValidItem = (item: unknown): item is ProviderStatus =>
  typeof (item as Record<string, unknown>).provider === "string";
```

**5層防御の完全コード例**:

```typescript
// L1: API namespace 存在確認
if (!window.electronAPI?.apiKey?.list) {
  return [];
}
try {
  // L5: 例外キャッチ
  const result = await window.electronAPI.apiKey.list();
  // L2: result shape 正規化
  if (!result?.success || !result?.data) {
    return [];
  }
  // L3: 配列保証
  const providers = Array.isArray(result.data.providers)
    ? result.data.providers
    : [];
  // L4: 要素 shape フィルタ
  return providers.filter(isValidItem);
} catch {
  return [];
}
```

---

### S28: Main ハンドラ間接テストパターン（ipcMain.handle モック）（06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 2026-03-07実装）

> 追加: 2026-03-07 / 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

**問題**: `ipcMain.handle` + `withValidation` でラップされたハンドラを直接テストできない

**パターン**:

```typescript
// 1. electron をモック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

// 2. ハンドラ登録関数を呼び出し
registerApiKeyHandlers(mockMainWindow, mockApiKeyStorage);

// 3. 登録されたコールバックを取得
const handleCalls = vi.mocked(ipcMain.handle).mock.calls;
const listHandler = handleCalls.find(
  ([channel]) => channel === "apiKey:list",
)?.[1];

// 4. コールバックを直接呼び出してテスト
const result = await listHandler(mockEvent);
expect(result.data.providers).toEqual([]);
```

**適用基準**: `withValidation` ラッパーを使用する IPC ハンドラのユニットテスト

**制約**: `withValidation` 内の sender 検証ロジックはこのパターンではテストされない。sender 検証は Security テスト層で別途検証する（IPC ハンドラー3層テスト分離パターン参照）。

**関連パターン**: IPC ハンドラー3層テスト分離パターン（本ファイル内）

---

### S29: Renderer 境界 providers 正規化パターン（06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 2026-03-08完了）

> 追加: 2026-03-08 / 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

**問題**: IPC 境界を超えたレスポンスでは structured clone により TypeScript 型が消失する。`apiKey.list()` の戻り値 `IPCResponse<ProviderListResult>` は型上 `providers: ProviderStatus[]` だが、実行時には null/undefined/非配列/malformed 要素が混入する可能性がある。

**パターン**: 4層防御

```typescript
// Layer 1: API 存在確認
const apiKeyApi = window.electronAPI?.apiKey;
if (!apiKeyApi?.list) {
  // フォールバック UI
  return;
}

// Layer 2: レスポンス成功確認
const result = await apiKeyApi.list();
if (!result?.success || !result?.data) {
  // エラー UI
  return;
}

// Layer 3: 配列正規化 + type predicate フィルタ（P49準拠）
const rawProviders = Array.isArray(result.data.providers)
  ? result.data.providers
  : [];
const providers = rawProviders.filter(
  (item): item is ProviderStatus =>
    item != null &&
    typeof item === "object" &&
    "provider" in item &&
    typeof item.provider === "string" &&
    "status" in item &&
    typeof item.status === "string",
);

// Layer 4: 正常データで UI 更新
setState((prev) => ({ ...prev, providers, isLoading: false }));
```

**S27（5層防御）との関係**: S27 は汎用的な Renderer 境界防御の全体構造（L1-L5）を定義する。S29 は S27 の L3（配列保証）+ L4（要素フィルタ）を `providers` 配列に特化し、`type predicate` + `.filter()` による正規化の具体的な実装パターンを示す。

**Main 側 配列正規化パターン（補足）**:

Main ハンドラ側でも IPC レスポンスに含める配列を正規化する。外部ストレージや SDK から取得したデータが非配列の場合にも安全にレスポンスを構築する。

```typescript
// Main ハンドラ内での配列正規化
const rawProviders = storageResult?.providers;
const providers = Array.isArray(rawProviders) ? rawProviders : [];
return { success: true, data: { providers } };
```

**適用基準**: IPC 経由で配列を含むオブジェクトを受け取る全コンポーネント

**関連パターン**: S27 Renderer 境界 5層防御、P48 non-null assertion 禁止、P49 type predicate 内 as キャスト禁止

---

### S30: IPC Fallback Handler DRYヘルパーパターン（TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 2026-03-08実装）

Supabase等の外部サービスが未設定の環境で、IPCハンドラが未登録のままRendererからの呼び出しがクラッシュする問題を防止する。共通ヘルパーで複数ドメインのフォールバックを宣言的に登録する。

#### 設計原則

| 原則                         | 実装                                                                   |
| ---------------------------- | ---------------------------------------------------------------------- |
| DRY（Don't Repeat Yourself） | `createNotConfiguredResponse()` と `registerFallbackHandlers()` を共有 |
| 宣言的登録                   | `ReadonlyArray<FallbackHandler>` タプル配列で静的定義                  |
| 排他分岐（P5対策）           | `getSupabaseClient()` null チェックの if/else で通常経路と排他         |
| 型安全                       | `FallbackHandler = readonly [string, () => Promise<unknown>]`          |
| 定数参照（P27対策）          | チャンネル名は全て `IPC_CHANNELS.*` 定数経由                           |

#### コード例

```typescript
// 共通ヘルパー: apps/desktop/src/main/ipc/index.ts
type FallbackHandler = readonly [string, () => Promise<unknown>];

function createNotConfiguredResponse(code: string, message: string) {
  return { success: false, error: { code, message } };
}

function registerFallbackHandlers(
  handlers: ReadonlyArray<FallbackHandler>,
): void {
  for (const [channel, handler] of handlers) {
    ipcMain.handle(channel, handler);
  }
}

// ドメイン別フォールバック登録（Profile例）
function registerProfileFallbackHandlers(): void {
  const response = createNotConfiguredResponse(
    PROFILE_ERROR_CODES.NOT_CONFIGURED,
    "Profile service is not configured. Supabase environment variables are required.",
  );
  const handlers: ReadonlyArray<FallbackHandler> = [
    [IPC_CHANNELS.PROFILE_GET, async () => response],
    [IPC_CHANNELS.PROFILE_UPDATE, async () => response],
    // ... 残り9チャンネル
  ];
  registerFallbackHandlers(handlers);
}

// if/else 排他分岐
const supabase = getSupabaseClient();
if (supabase) {
  registerAuthHandlers(mainWindow, supabase, secureStorage);
  registerProfileHandlers(mainWindow, supabase, profileCache);
  registerAvatarHandlers(mainWindow, supabase);
} else {
  registerAuthFallbackHandlers();
  registerProfileFallbackHandlers();
  registerAvatarFallbackHandlers();
}
```

#### 適用ガイド

| Step | 内容                                                                 | 確認基準                                            |
| ---- | -------------------------------------------------------------------- | --------------------------------------------------- |
| 1    | エラーコード定数を `packages/shared/types/` に追加                   | `as const` アサーション付き                         |
| 2    | `createNotConfiguredResponse()` でレスポンス生成                     | `{ success: false, error: { code, message } }` 形式 |
| 3    | `ReadonlyArray<FallbackHandler>` でチャンネル-ハンドラ対を宣言       | `IPC_CHANNELS.*` 定数使用                           |
| 4    | `registerFallbackHandlers()` で一括登録                              | for...of ループ                                     |
| 5    | if/else 排他分岐に呼び出しを追加                                     | 通常経路とfallback経路が排他                        |
| 6    | テストで `ipcMain.handle` モックの呼び出し回数・レスポンス形式を検証 | 全チャンネル分のPASS                                |

#### テスト戦略

```typescript
// 内部関数が export されていない場合のモック戦略
// getSupabaseClient() の戻り値で分岐制御
mockGetSupabaseClient.mockReturnValue(null); // fallback経路
registerAllIpcHandlers(mockWindow);

// プレフィックスフィルタリングで対象チャンネルを抽出
const profileCalls = mockHandle.mock.calls.filter(
  ([ch]) => typeof ch === "string" && ch.startsWith("profile:"),
);
expect(profileCalls).toHaveLength(11);

// レスポンス構造の検証
const handler = profileCalls[0][1];
const result = await handler();
expect(result).toEqual({
  success: false,
  error: {
    code: PROFILE_ERROR_CODES.NOT_CONFIGURED,
    message: expect.stringContaining("not configured"),
  },
});
```

#### 関連パターン

| パターン | 関連                                                    |
| -------- | ------------------------------------------------------- |
| S22      | AUTH IPC登録一元化パターン（同一構造の先行実装）        |
| P5       | リスナー二重登録防止（排他分岐で対策）                  |
| P27      | ハードコード文字列防止（IPC_CHANNELS定数使用）          |
| P50      | 既実装防御の発見（本パターンはP50該当で検証モード適用） |

---

## 変更履歴

| Version | Date       | Changes                                                                                                                                                                                                                                                                                                 |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.41.1 | 2026-03-11 | TASK-UI-04C follow-up: `Renderer local preview resilience` パターンに関連未タスク `UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001` を追加し、timeout+retry / fuzzy no-match / parse fallback の共通化導線を接続 |
| v1.41.0 | 2026-03-11 | TASK-UI-04C-WORKSPACE-PREVIEW: `Renderer local preview resilience` パターンを追加。Renderer timeout + retry、fuzzy match 判定分離、structured parse recoverable fallback を標準化 |
| v1.40.0 | 2026-03-08 | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001: S30 IPC Fallback Handler DRYヘルパーパターンを追加。createNotConfiguredResponse + registerFallbackHandlers によるAuth/Profile/Avatar 3ドメインのfallback宣言的登録を標準化                                                                               |
| v1.39.0 | 2026-03-08 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 完了記録: S29 Renderer境界providers正規化パターン追加（4層防御: API存在確認→レスポンス成功確認→配列正規化+type predicateフィルタ→UI更新、Main側配列正規化補足）                                                                                          |
| v1.38.0 | 2026-03-07 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001: S27 Renderer境界5層防御パターン追加（L1-L5防御層、type predicate in演算子推奨、完全コード例）、S28 Mainハンドラ間接テストパターン追加（ipcMain.handleモック経由のコールバック直接呼び出し）                                                             |
| v1.37.0 | 2026-03-07 | TASK-10A-F: 直接IPC→Store個別セレクタ移行パターン追加（S26: 移行チェックリスト7ステップ、テストmock標準パターン、状態分類判断基準、P31/P48適用判定）                                                                                                                                                    |
| v1.36.0 | 2026-03-07 | TASK-UI-03-AGENT-VIEW-ENHANCEMENT: AgentView Enhancement実装パターン追加（S23: CSS変数定数抽出パターン — styles.ts/animations.ts分離、S24: backward-compatible fallbackパターン — typeofガード付きZustandセレクタ段階的移行、S25: z-index Phase 2事前設計パターン — 管理テーブル事前定義で衝突0件達成） |
| v1.35.0 | 2026-03-03 | TASK-10A-D: 共有型インポート標準パターン追加（@repo/shared起点の型配置ルール、禁止パターン3件、新規型追加チェックリスト）                                                                                                                                                                               |
| v1.34.2 | 2026-02-26 | TASK-9A完了反映: SkillEditor実装パターンを `spec_created` から `completed` へ更新。IPC連携フローに create/delete/restore を追加し、関連参照を `TASK-9A-skill-editor` 正本へ同期                                                                                                                         |
| v1.34.1 | 2026-02-25 | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 再確認追補: Phase 12 準拠確認チェーン（verify-all-specs / validate-phase-output / verify-unassigned-links / skill-creator quick_validate.js）を追加し、検証経路を固定化                                                                                       |
| v1.34.0 | 2026-02-25 | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001: 未タスク監査スコープ分離パターンを追加（target/diff/fullの判定責務分離、Phase 12記録2段構成、完了済み未タスク移管の同一ターン実施）                                                                                                                          |
| v1.33.0 | 2026-02-25 | UT-IPC-AUTH-HANDLE-DUPLICATE-001: S22に再利用テンプレートを追加（目的/場所/検証/落とし穴対処）。同種課題の初動手順を標準化                                                                                                                                                                              |
| v1.32.0 | 2026-02-25 | UT-IPC-AUTH-HANDLE-DUPLICATE-001: S22 AUTH IPC登録一元化パターンを追加（通常/fallback二経路の宣言的集約、回帰テスト固定、監査コマンド標準化）                                                                                                                                                           |
| v1.31.0 | 2026-02-25 | UT-IPC-CHANNEL-NAMING-AUDIT-001: IPCチャネル命名監査の運用パターンを追加（対象内/対象外の3区分判定、未タスク分離、リンク検証、重複式ノイズの再発防止コマンド固定化）                                                                                                                                    |
| v1.30.0 | 2026-02-24 | UT-IPC-DATA-FLOW-TYPE-GAPS-001: IPCデータフロー型ギャップパターン追加（S19: IPC Date型シリアライズ、S20: IPC引数object形式統一、S21: 仕様書間型ギャップ検出）。S18が既存のため番号をS19-S21にシフト                                                                                                     |
| v1.29.0 | 2026-02-24 | IPCチャネル名競合予防パターン追加（UT-SKILL-IMPORT-CHANNEL-CONFLICT-001）: チャネル命名規則（skill:{動詞}FromSource）、既存/新規対応表、判断基準、実装チェックリスト、苦戦箇所3件                                                                                                                       |
| v1.28.0 | 2026-02-24 | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001: P42準拠バリデーション一括移行パターン（S18）追加。移行チェックリスト・引数形式別適用パターン・後方互換性注記・describe.eachマトリクステスト戦略を含む                                                                                                          |
| v1.27.0 | 2026-02-23 | TASK-UI-00-ATOMS: Atomsコンポーネント設計パターン追加（S12: Props最小化、S13: Record型バリアント定義、S14: HTMLAttributes Props型衝突回避、S15: 後方互換性維持、S16: CSS変数＋Tailwind Arbitrary Values、S17: displayName統一）                                                                         |
| v1.26.0 | 2026-02-21 | UT-FIX-SKILL-REMOVE-INTERFACE-001: IPCインターフェース不整合修正パターン（P44/P45解決）追加。Phase依存順序・worktree制約・カバレッジスコープの苦戦箇所を記録                                                                                                                                            |
| v1.26.0 | 2026-02-21 | UT-FIX-SKILL-IMPORT-INTERFACE-001: IPCインターフェース不整合修正パターン追加（P44修正テンプレート、P42準拠3段バリデーション、3箇所同時更新チェックリスト、修正判断基準テーブル）                                                                                                                        |
| v1.26.0 | 2026-02-21 | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001: S13 IPC戻り値型2ステップ変換パターン追加（苦戦箇所5件記録、適用判断基準テーブル、P42/P44/P45準拠）                                                                                                                                                                 |
| v1.25.0 | 2026-02-19 | TASK-9A-C: SkillEditor実装パターン追加（textareaベースコードエディター、FileTree内部状態管理、IPC連携ファイル編集、Pitfall事前組み込み）                                                                                                                                                                |
| v1.24.0 | 2026-02-19 | TASK-9A-B: isKnownSkillFileError型ガードパターン追加、IPC3層テスト分離パターン追加（Unit 38 / Security 14 / Integration 13、カバレッジ Line 91.14% / Branch 93.93% / Function 100%）                                                                                                                    |
| v1.24.0 | 2026-02-14 | UT-FIX-IPC-RESPONSE-UNWRAP-001: IPC レスポンスラッパー展開パターン（safeInvokeUnwrap）追加（使い分け基準、データフロー図、関連Pitfall P19）                                                                                                                                                             |
| v1.23.0 | 2026-02-14 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止パターン追加（unregister→register、ipcMain.handle() vs on() 動作差異、セキュリティ考慮事項）                                                                                                                                                 |
| v1.22.0 | 2026-02-13 | UT-9B-H-003: IPC L3ドメイン検証パターン追加（validatePath, sanitizeErrorMessage, ALLOWED_SCHEMA_NAMES）                                                                                                                                                                                                 |
| 1.21.0  | 2026-02-12 | TASK-9B-I-SDK-FORMAL-INTEGRATION: SDK型統合パターン追加（S11: TypeScriptモジュール解決の優先順位、S12: SDK APIパラメータの正確な把握）                                                                                                                                                                  |
| 1.20.0  | 2026-02-12 | TASK-9B-H: IPCハンドラー登録パターンに「実装時の注意点・苦戦箇所」テーブル追加（5件の苦戦箇所と解決策、lessons-learned.mdへのクロスリファレンス）                                                                                                                                                       |
| 1.19.0  | 2026-02-12 | TASK-9B-H: IPC ハンドラー登録パターン追加（3層セキュリティ、Preload統合4箇所更新チェックリスト、既存同パターンとの対応表）                                                                                                                                                                              |
| 1.18.0  | 2026-02-11 | TASK-FIX-7-1: Setter Injection パターン詳細追加（SkillService と SkillExecutor の統合、使い分け基準テーブル）                                                                                                                                                                                           |
| 1.17.0  | 2026-02-10 | UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH: 型定義修正タスクパターン追加（システム仕様書更新チェックリスト、関連Pitfall P31/P32との相互参照）                                                                                                                                                               |
| 1.16.0  | 2026-02-09 | TASK-FIX-12-1-IPC-HARDCODE-FIX: IPCチャンネル名定数化パターン追加（ハードコード検出、定数参照置換、セキュリティ原則準拠）                                                                                                                                                                               |
| 1.15.0  | 2026-02-06 | TASK-FIX-5-1リファクタリング: S1-S5苦戦箇所を最適化（S1/S4は実装パターンとして保持、S2/S3/S5はskill-creator/patterns.mdへクロスリファレンス化で重複解消）                                                                                                                                               |
| 1.14.0  | 2026-02-06 | TASK-FIX-5-1-SKILL-API-UNIFICATION: SkillAPI統一パターン追加（API二重公開解消、苦戦箇所5件記録）                                                                                                                                                                                                        |
| 1.13.0  | 2026-02-05 | TASK-FIX-4-1-IPC-CONSOLIDATION: IPCチャンネル統合パターン追加（Single Source of Truth、ハードコード検出、ホワイトリスト検証）                                                                                                                                                                           |
| 1.12.0  | 2026-02-04 | AUTH-UI-001: React Portal オーバーレイUI最前面表示パターン、Supabase認証状態変更時の即時UI更新パターン追加                                                                                                                                                                                              |
| 1.11.0  | 2026-02-04 | AUTH-UI-004: 外部APIデータ正規化パターン追加（プロバイダー別フォールバック）                                                                                                                                                                                                                            |
| 1.10.0  | 2026-02-03 | マージ統合: TASK-9B-G + TASK-9C/9A-A                                                                                                                                                                                                                                                                    |
| 1.9.0   | 2026-02-03 | TASK-9C: SDK連携パターン追加（Graceful SDK Fallback, queryFn DI, スキル名バリデーション）                                                                                                                                                                                                               |
| 1.8.0   | 2026-02-03 | TASK-9A-A: ESModuleモッキング制約パターン、バックアップファイルテストパターン追加                                                                                                                                                                                                                       |
| 1.7.0   | 2026-02-03 | TASK-9B-G: スキル作成実装パターン追加（Script First、Progressive Disclosure、Facade、タスク依存関係解決）                                                                                                                                                                                               |
| 1.6.0   | 2026-02-03 | TASK-WCE-MONACO-001スキル最適化: Main→Rendererパターン再構成（Problem Statement追加、課題IDテーブル、汎用チェックリスト、セキュリティ考慮事項表追加）、api-ipc-agent.md相互リンク追加                                                                                                                   |
| 1.5.0   | 2026-02-03 | TASK-WCE-MONACO-001: Main→Renderer逆方向クエリパターン追加（webContents.executeJavaScript、グローバルブリッジ、苦戦ポイントと対処法）                                                                                                                                                                   |
| 1.4.0   | 2026-02-02 | TASK-8C-C: E2Eテストパターン追加（Electron E2Eセットアップ、セレクタ定数、タイムアウト定数、ヘルパー関数、テストグループ構成、page.evaluate）                                                                                                                                                           |
| 1.3.0   | 2026-02-02 | TASK-8C-A: IPC通信テストパターン追加（Handler Map方式、SkillService Partial Mock、invokeOptionalHandler、validateIpcSender失敗検証）                                                                                                                                                                    |
| 1.2.0   | 2026-01-30 | TASK-7D: forwardRef + useImperativeHandleパターン、React.memo + Exclude型パターン追加                                                                                                                                                                                                                   |
| 1.1.0   | 2026-01-30 | TASK-3-2-F: テスト環境設定パターン追加（jsdom/happy-dom選択、グローバルモック設計、モック上書きパターン）                                                                                                                                                                                               |
| 1.0.0   | 2026-01-26 | 仕様ガイドライン準拠: コード例削除、文章・表形式に変更                                                                                                                                                                                                                                                  |
| 0.1.0   | 2026-01-26 | 初版作成                                                                                                                                                                                                                                                                                                |
| 2026-03-13 | v1.41.2 | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 を完了同期。renderer local preview resilience を helper / typed taxonomy / integration test まで引き上げ、related row を completed path へ更新 |
