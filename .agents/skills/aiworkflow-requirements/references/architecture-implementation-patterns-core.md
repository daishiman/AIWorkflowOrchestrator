# 実装パターン総合ガイド / core specification

> 親仕様書: [architecture-implementation-patterns.md](architecture-implementation-patterns.md)
> 役割: core specification

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

#### S20: データ駆動CTA設計パターン（TASK-SKILL-LIFECYCLE-02）

定数配列に `ctaLabel?` + `onAction?` フィールドを持たせ、View側は `map()` + 条件レンダリングでCTAボタンを自動生成するパターン。新ステップ追加時は定数配列に1行追加するだけでView側のコード変更が不要。

| 要素 | 実装 |
| --- | --- |
| 定数配列 | `ctaLabel?` と `onAction?` をオプショナルフィールドとして定義 |
| View側 | `array.map()` + `ctaLabel && action` の条件でCTAボタンを自動生成 |
| 拡張方法 | 定数配列に1行追加するだけ（Viewコード変更不要） |
| 条件分岐 | View側にif文を追加しない — データが表示を駆動する |

```typescript
// 定数定義側: ctaLabel省略でCTA非表示
export type SkillLifecycleJobGuide = {
  id: string; title: string;
  ctaLabel?: string; onAction?: () => void;
};
// View側: map + 条件レンダリング
{jobs.map((job) => (
  <div key={job.id}>
    <h3>{job.title}</h3>
    {job.ctaLabel && job.onAction && (
      <button onClick={job.onAction} data-testid={`cta-${job.id}`}>{job.ctaLabel}</button>
    )}
  </div>
))}
```

**S13との使い分け**: S13はキー→スタイルの静的マッピング（コンパイル時網羅性保証）、S20は配列要素にアクションを含む動的UI生成（実行時条件レンダリング）。

#### S33: Hybrid State Pattern（ローカル useState + Zustand Store の併用）

**発見タスク**: TASK-SC-06-UI-RUNTIME-CONNECTION（2026-03-24）

**問題**: 非同期 API（planSkill/executePlan）の結果を Zustand Store に格納すると、Store 更新→再レンダーのサイクルで UI の即時フィードバックが遅延する。一方、useState だけでは他コンポーネントから状態を参照できない。

**解決策**: ローカル状態（useState）と Zustand Store の両方に同じデータを格納し、優先度付きで統合する。

```typescript
// SkillLifecyclePanel.tsx
const storePlanResult = useCurrentPlanResult(); // Zustand Store
const [localPlanResult, setLocalPlanResult] = useState<PlanResult | null>(null);

// ローカル優先で統合（ローカルがnullならストアにフォールバック）
const activePlanResult = localPlanResult ?? storePlanResult;

// API 呼び出し成功時: 両方に格納
setLocalPlanResult(planResult.data);      // 即時 UI 更新
setCurrentPlanResult(planResult.data);    // 永続化・共有用

// 計画実行完了時: ローカルをクリアしてストア側を優先に戻す
setLocalPlanResult(null);
clearGenerationState();
```

**適用基準**:
- API レスポンスを即座に UI に反映する必要がある場合
- 同じデータを他コンポーネントからも参照する可能性がある場合
- ストアの更新サイクルによる遅延が UX に影響する場合

**注意事項**:
- SSoT（Single Source of Truth）が曖昧になるリスクがある。Phase 2 設計書に「どちらが SSoT か」「クリア順序」を明記すること
- テストではローカル状態とストア状態の両方を考慮する必要がある
- ローカル状態が残ったままストア側を更新しても UI に反映されない（ローカル優先のため）

**関連パターン**: P31（Zustand Store Hooks 無限ループ）、S18（useShallow 派生セレクタ）
**関連タスク**: TASK-SC-06-UI-RUNTIME-CONNECTION、TASK-SC-12（ガイドドキュメント化予定）

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

### 横断ユーティリティ配置ガイドライン

サービス横断で使用されるユーティリティ関数（`normalizePath`、`escapeRegExp` 等）の配置先を以下の基準で決定する。

| 使用箇所の数 | 配置先 | 例 |
| --- | --- | --- |
| 3つ以上のサービス/モジュールで使用 | `packages/shared/src/utils/` | `normalizePath`, `escapeRegExp` |
| 2つのサービス/モジュールで使用 | 上位ディレクトリの `utils/` | `apps/desktop/src/main/utils/` |
| 1つのサービス/モジュールでのみ使用 | サービス内に定義 | サービス固有のヘルパー |

**判断フロー**:

1. 新規ユーティリティ作成前に `grep -rn "export.*function.*<名前>" packages/ apps/` で既存実装を検索する
2. 既存実装がある場合は再利用する（重複実装禁止）
3. 新規作成する場合は上記テーブルに従い配置先を決定する
4. `packages/shared/` に配置する場合は `package.json` の `exports` フィールドを更新する

**関連 Pitfall**: P8（幽霊依存）-- `import` するなら自身の `package.json` に宣言すること

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



---

## 続き

後半コンテンツは分割ファイルを参照:
- [architecture-implementation-patterns-shared.md](architecture-implementation-patterns-shared.md) — 共有パッケージパターン + ApprovalGate
