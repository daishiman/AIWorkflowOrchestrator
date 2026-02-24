# Phase 2: 設計 - TASK-UI-00-ATOMS

## メタ情報

| 項目       | 値                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 2                                                                                                                                   |
| Phase名    | 設計                                                                                                                                |
| 前提Phase  | Phase 1（要件定義）                                                                                                                 |
| 後続Phase  | Phase 3（設計レビュー）                                                                                                             |
| ステータス | pending                                                                                                                             |
| 作成日     | 2026-02-22                                                                                                                          |
| 機能名     | Atoms共通コンポーネント実装（StatusIndicator・FilterChip・SkeletonCard・SuggestionBubble・RelativeTime新規、Badge・EmptyState拡張） |

## 目的

Phase 1 で確定した機能要件・非機能要件をもとに、7コンポーネントの TypeScript インターフェース、デザイントークンマッピング、ARIA設計、テスト戦略、CSS/アニメーション設計を行い、Phase 4（テスト作成）・Phase 5（実装）の入力として完全な設計セットを提供する。

## 背景

- Phase 1 で 31 の機能要件（SI-F-01〜06, FC-F-01〜07, SK-F-01〜07, SB-F-01〜08, RT-F-01〜10, BD-F-01〜08, ES-F-01〜09）が確定した
- 既存 Badge テスト 6件がカラートークン移行で影響を受けることが判明している
- EmptyState は SuggestionBubble に依存するため、実装順序の制約がある
- 全コンポーネントは props 駆動で設計し、Zustand Store を直接参照しない（P31 対策）

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: コンポーネントインターフェース設計

7コンポーネントの完全な Props 型定義を設計する。

#### Task 1-1: StatusIndicator インターフェース

```typescript
// apps/desktop/src/renderer/components/atoms/StatusIndicator/index.tsx

export type StatusType =
  | "running"
  | "success"
  | "error"
  | "warning"
  | "idle"
  | "offline";
export type StatusSize = "sm" | "md" | "lg";

export interface StatusIndicatorProps {
  /** 表示するステータス */
  status: StatusType;
  /** ドットサイズ（sm:8px / md:10px / lg:14px） */
  size?: StatusSize;
  /** パルスアニメーション有無（runningはデフォルトtrue、他はfalse） */
  pulse?: boolean;
  /** aria-labelの上書き値 */
  label?: string;
  /** 追加CSSクラス */
  className?: string;
}
```

**設計判断**:

- `StatusType` / `StatusSize` を named export することで、親コンポーネントが型を再利用可能にする
- `pulse` のデフォルト値は `status === "running"` の場合のみ `true`、それ以外は `false`
- `className` を追加し、親コンポーネントからのスタイル微調整を許可する

#### Task 1-2: FilterChip インターフェース

```typescript
// apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx

export interface FilterChipProps {
  /** チップに表示するラベルテキスト */
  label: string;
  /** 選択状態 */
  isSelected: boolean;
  /** ラベル右に表示するカウント値 */
  count?: number;
  /** ラベル左に表示するアイコン名（Iconコンポーネント互換） */
  icon?: string;
  /** クリック時コールバック */
  onClick: () => void;
  /** 無効化状態 */
  disabled?: boolean;
  /** 追加CSSクラス */
  className?: string;
}
```

**設計判断**:

- HTML 要素は `<button>` を使用する。`role="checkbox"` + `aria-checked` でフィルター意図を表現
- `disabled` は HTML button の `disabled` 属性としても設定し、ネイティブのフォーカス管理を活用する
- `icon` 型は `string`（IconName 互換）とし、Icon コンポーネントに委譲する

#### Task 1-3: Badge 拡張インターフェース

```typescript
// apps/desktop/src/renderer/components/atoms/Badge/index.tsx

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** バリアント（primaryを追加） */
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  /** サイズ */
  size?: "sm" | "md";
  /** 子要素（contentより優先される） */
  children?: React.ReactNode;
  /** テキストまたは数値コンテンツ（childrenが未指定時に使用） */
  content?: string | number;
}
```

**設計判断**:

- `children` を `React.ReactNode`（必須）→ `React.ReactNode`（任意）に変更
- `children` と `content` の優先順位: `children` > `content`（BD-F-05）
- `content` が `number` 型の場合、`aria-label` に `"{content}件"` を自動設定（BD-F-03）
- 既存の `React.HTMLAttributes<HTMLSpanElement>` 拡張は維持（後方互換性）

#### Task 1-4: SkeletonCard インターフェース

```typescript
// apps/desktop/src/renderer/components/atoms/SkeletonCard/index.tsx

export type SkeletonVariant = "default" | "stat" | "list-item";

export interface SkeletonCardProps {
  /** カスタム高さ（CSSユニット文字列） */
  height?: string;
  /** カスタム角丸（CSSユニット文字列） */
  borderRadius?: string;
  /** バリエーション（内部構造を決定） */
  variant?: SkeletonVariant;
  /** パルスアニメーション有無（デフォルトtrue） */
  animate?: boolean;
  /** 追加CSSクラス */
  className?: string;
}
```

**設計判断**:

- `height` / `borderRadius` は `style` 属性にインラインで適用する（Tailwind arbitrary value より柔軟性が高い）
- `variant` ごとに内部構造を条件分岐でレンダリングする（子コンポーネント分割は行わない。Atom の責務範囲内のため）
- `animate` のデフォルトは `true`

#### Task 1-5: SuggestionBubble インターフェース

```typescript
// apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx

export type SuggestionSize = "sm" | "md" | "lg";

export interface SuggestionBubbleProps {
  /** 表示ラベル */
  label: string;
  /** ラベル左に表示するアイコン名 */
  icon?: string;
  /** クリック時コールバック */
  onClick: () => void;
  /** サイズ（sm:36px / md:44px / lg:56px） */
  size?: SuggestionSize;
  /** 無効化状態 */
  disabled?: boolean;
  /** 追加CSSクラス */
  className?: string;
}
```

**設計判断**:

- HTML 要素は `<div>` + `role="button"` + `tabIndex={0}` を使用する（`<button>` ではない。理由: ピル形状のカスタムスタイリングとアニメーション制御の柔軟性を確保するため）
- `success-bounce` アニメーションは `useState` + `setTimeout` で管理する。クリック後に `isBouncing` state を `true` にし、アニメーション完了後（300ms）に `false` に戻す
- `disabled` 時は `tabIndex={-1}` にしてフォーカス対象外にする

#### Task 1-6: EmptyState 拡張インターフェース

```typescript
// apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx

export type EmptyStateMood = "welcoming" | "encouraging" | "celebrating";

export interface EmptyStateActionObject {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export interface EmptyStateSuggestion {
  label: string;
  icon?: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  /** 見出しテキスト */
  title: string;
  /** 説明文 */
  description?: string;
  /** アイコン名 */
  icon?: IconName;
  /** アクション（ReactNode またはオブジェクト形式） */
  action?: React.ReactNode | EmptyStateActionObject;
  /** サジェスト配列（SuggestionBubbleで描画） */
  suggestions?: EmptyStateSuggestion[];
  /** コンパクトモード */
  compact?: boolean;
  /** ムード（アイコンカラー・アニメーションを制御） */
  mood?: EmptyStateMood;
  /** 追加CSSクラス */
  className?: string;
}
```

**設計判断**:

- `action` の型判別: `React.isValidElement(action)` で ReactNode かオブジェクトかを判定する
- `suggestions` は SuggestionBubble コンポーネントをインポートして描画する
- `mood` 未指定時（デフォルト）はアイコンカラー `--text-muted`、背景変更なし、アニメーションなし
- `compact` は CSS クラスの切替で実現する（条件分岐でパディング・フォントサイズ・アイコンサイズを変更）

#### Task 1-7: RelativeTime インターフェース

```typescript
// apps/desktop/src/renderer/components/atoms/RelativeTime/index.tsx

export type RelativeTimeFormat = "auto" | "short" | "long";

export interface RelativeTimeProps {
  /** ISO 8601 形式のタイムスタンプ */
  timestamp: string;
  /** 表示フォーマット */
  format?: RelativeTimeFormat;
  /** 自動更新間隔（ミリ秒、デフォルト60000） */
  refreshInterval?: number;
  /** ホバー時に絶対時刻ツールチップを表示するか（デフォルトtrue） */
  showAbsoluteOnHover?: boolean;
  /** 追加CSSクラス */
  className?: string;
}
```

**設計判断**:

- HTML 要素は `<time>` + `datetime` 属性を使用する（セマンティック HTML）
- 時刻計算ロジックは `formatRelativeTime(timestamp, format, now)` 純粋関数として分離する（テスト容易性のため）
- `refreshInterval` の `setInterval` は `useEffect` 内で管理し、クリーンアップで `clearInterval` を確実に実行する
- 無効なタイムスタンプ判定: `new Date(timestamp).getTime()` が `NaN` の場合にフォールバック `"--"` を返す

### Task 2: デザイントークンマッピング設計

#### Task 2-1: ステータスカラーマッピング

**StatusIndicator カラー対応**:

| ステータス | CSS 変数                | Tailwind arbitrary value 記法                                         |
| ---------- | ----------------------- | --------------------------------------------------------------------- |
| running    | `var(--status-primary)` | `bg-[var(--status-primary)]`                                          |
| success    | `var(--status-success)` | `bg-[var(--status-success)]`                                          |
| error      | `var(--status-error)`   | `bg-[var(--status-error)]`                                            |
| warning    | `var(--status-warning)` | `bg-[var(--status-warning)]`                                          |
| idle       | `var(--text-muted)`     | `bg-[var(--text-muted)]`                                              |
| offline    | `var(--text-muted)`     | `bg-[var(--text-muted)]` + `border-dashed border-[var(--text-muted)]` |

**Badge variant カラー対応**:

| variant | 現行 Tailwind クラス | 移行先 CSS 変数                                         |
| ------- | -------------------- | ------------------------------------------------------- |
| default | `bg-gray-600`        | `bg-[var(--bg-tertiary)] text-[var(--text-secondary)]`  |
| primary | （新規追加）         | `bg-[var(--status-primary)] text-[var(--text-inverse)]` |
| success | `bg-green-500`       | `bg-[var(--status-success)] text-[var(--text-inverse)]` |
| warning | `bg-orange-400`      | `bg-[var(--status-warning)] text-[var(--text-inverse)]` |
| error   | `bg-red-500`         | `bg-[var(--status-error)] text-[var(--text-inverse)]`   |
| info    | `bg-blue-500`        | `bg-[var(--status-info)] text-[var(--text-inverse)]`    |

#### Task 2-2: サイズトークンマッピング

**StatusIndicator サイズ**:

| サイズ | ドット直径 | Tailwind クラス |
| ------ | ---------- | --------------- |
| sm     | 8px        | `w-2 h-2`       |
| md     | 10px       | `w-2.5 h-2.5`   |
| lg     | 14px       | `w-3.5 h-3.5`   |

**SuggestionBubble サイズ**:

| サイズ | 高さ | テキスト  | アイコン | Tailwind クラス  |
| ------ | ---- | --------- | -------- | ---------------- |
| sm     | 36px | text-sm   | 16px     | `h-9 text-sm`    |
| md     | 44px | text-sm   | 16px     | `h-11 text-sm`   |
| lg     | 56px | text-base | 20px     | `h-14 text-base` |

**EmptyState 通常 vs コンパクト**:

| 要素           | 通常          | コンパクト    |
| -------------- | ------------- | ------------- |
| パディング     | `p-8`（32px） | `p-5`（20px） |
| アイコンサイズ | 48px          | 32px          |
| 見出しフォント | `text-lg`     | `text-base`   |
| 説明文フォント | `text-sm`     | `text-xs`     |

### Task 3: アクセシビリティ設計

#### Task 3-1: ARIA 属性実装パターン

**StatusIndicator**:

```tsx
<span
  role="status"
  aria-label={label ?? `ステータス: ${status}`}
  className={/* ... */}
/>
```

**FilterChip**:

```tsx
<button
  role="checkbox"
  aria-checked={isSelected}
  aria-disabled={disabled || undefined}
  disabled={disabled}
  onClick={disabled ? undefined : onClick}
  className={/* ... */}
>
  {icon && <Icon name={icon} size={16} />}
  {label}
  {count !== undefined && <span>({count})</span>}
</button>
```

**Badge（拡張後）**:

```tsx
<span
  ref={ref}
  role="status"
  aria-label={
    props["aria-label"] ??
    (typeof content === "number" ? `${content}件` : undefined)
  }
  className={/* ... */}
  {...restProps}
>
  {children ?? content}
</span>
```

**SkeletonCard**:

```tsx
<div
  role="status"
  aria-label="読み込み中"
  aria-busy="true"
  className={/* ... */}
  style={{ height, borderRadius }}
>
  {/* variant に応じた内部構造 */}
</div>
```

**SuggestionBubble**:

```tsx
<div
  role="button"
  tabIndex={disabled ? -1 : 0}
  aria-disabled={disabled || undefined}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  className={/* ... */}
>
  {icon && <Icon name={icon} size={sizeConfig.iconSize} />}
  {label}
</div>
```

**RelativeTime**:

```tsx
<time
  dateTime={timestamp}
  title={showAbsoluteOnHover ? formatAbsolute(timestamp) : undefined}
  className={className}
>
  {displayText}
</time>
```

#### Task 3-2: キーボード操作設計

**SuggestionBubble のキーボードハンドラ**:

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (disabled) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault(); // Space のスクロール防止
    handleClick();
  }
};
```

**FilterChip のキーボード操作**:

- `<button>` 要素のため、Enter / Space はブラウザネイティブで `onClick` が発火する
- 追加のキーボードハンドラは不要

### Task 4: テスト設計概要

#### Task 4-1: テストカテゴリ設計

各コンポーネントのテストは以下のカテゴリで構成する:

| カテゴリ              | 内容                                  | 対象コンポーネント                                 |
| --------------------- | ------------------------------------- | -------------------------------------------------- |
| レンダリング          | 基本描画、props による出力変化        | 全7コンポーネント                                  |
| バリアント/ステータス | variant / status / format の切替検証  | StatusIndicator, Badge, SkeletonCard, RelativeTime |
| サイズ                | size props によるサイズ変更           | StatusIndicator, Badge, SuggestionBubble           |
| インタラクション      | onClick, disabled, キーボード操作     | FilterChip, SuggestionBubble                       |
| アニメーション        | pulse, success-bounce, skeleton-pulse | StatusIndicator, SuggestionBubble, SkeletonCard    |
| アクセシビリティ      | ARIA 属性、role、tabIndex             | 全7コンポーネント                                  |
| タイマー              | setInterval, clearInterval            | RelativeTime                                       |
| 後方互換性            | 既存テストの PASS 維持                | Badge, EmptyState                                  |
| テーマ横断            | 3テーマでのレンダリング               | 全7コンポーネント                                  |

#### Task 4-2: テーマテスト戦略

テーマテストは以下のパターンで実装する:

```typescript
const themes = ["kanagawa-dragon", "light", "dark"] as const;

describe.each(themes)("テーマ: %s", (theme) => {
  it("レンダリングエラーが発生しない", () => {
    const { container } = render(
      <div data-theme={theme}>
        <TargetComponent {...defaultProps} />
      </div>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
```

#### Task 4-3: テスト環境ルール

| ルール                     | 根拠           | 適用箇所                       |
| -------------------------- | -------------- | ------------------------------ |
| `fireEvent` 使用           | P39            | 全インタラクションテスト       |
| `beforeEach` リセット      | P9             | 全テストファイル               |
| `vi.advanceTimersByTime()` | P13            | RelativeTime タイマーテスト    |
| `vi.useFakeTimers()`       | タイマー制御   | RelativeTime テスト全体        |
| `vi.useRealTimers()`       | クリーンアップ | afterEach でリセット           |
| Store 直接参照禁止         | P31            | 全コンポーネント（props 駆動） |

#### Task 4-4: テスト数見積もり

| コンポーネント   | カテゴリ別テスト数                                                                                        | 合計    |
| ---------------- | --------------------------------------------------------------------------------------------------------- | ------- |
| StatusIndicator  | レンダリング2 + ステータス6 + サイズ3 + アニメーション3 + ARIA3 + テーマ3                                 | 20      |
| FilterChip       | レンダリング2 + スタイル2 + インタラクション3 + count/icon2 + ARIA3 + テーマ3                             | 15      |
| Badge            | 既存維持17（修正6含む）+ primary2 + content3 + aria-label2 + テーマ3                                      | 27      |
| SkeletonCard     | バリエーション3 + アニメーション2 + カスタム値2 + ARIA3 + テーマ3                                         | 13      |
| SuggestionBubble | レンダリング2 + サイズ3 + インタラクション4 + disabled2 + キーボード2 + アニメーション2 + ARIA3 + テーマ3 | 21      |
| EmptyState       | 既存維持6 + suggestions2 + compact2 + mood3 + action-obj2 + テーマ3                                       | 18      |
| RelativeTime     | フォーマット15 + タイマー3 + ツールチップ2 + datetime1 + フォールバック1 + テーマ3                        | 25      |
| **合計**         |                                                                                                           | **139** |

### Task 5: CSS/アニメーション設計

#### Task 5-1: StatusIndicator pulse アニメーション

```css
/* tokens.css（TASK-UI-00-TOKENS で定義済み）に pulse がある前提 */
/* コンポーネント固有のスタイルが必要な場合は Tailwind arbitrary value で対応 */

/* pulse アニメーション適用 */
.status-pulse {
  animation: pulse var(--duration-normal) var(--ease-default) infinite;
}
```

Tailwind でのアプローチ:

```tsx
// Tailwind arbitrary value で @keyframes を参照
const pulseClass = shouldPulse ? "animate-pulse" : "";
```

ただし `animate-pulse` は Tailwind 標準の opacity ベースアニメーション。ステータスドットには CSS 変数ベースの `scale` + `opacity` パルスが望ましいため、カスタム CSS クラスを使用する:

```tsx
const pulseClass = shouldPulse
  ? "animate-[pulse_1.5s_var(--ease-default)_infinite]"
  : "";
```

#### Task 5-2: SkeletonCard パルスアニメーション

```tsx
// Tailwind arbitrary value
const animateClass = animate
  ? "animate-[skeleton-pulse_1.5s_ease-in-out_infinite]"
  : "";
```

`skeleton-pulse` キーフレームは tailwind.config.ts の `extend.keyframes` に定義する:

```typescript
// tailwind.config.ts
keyframes: {
  "skeleton-pulse": {
    "0%, 100%": { opacity: "1" },
    "50%": { opacity: "0.4" },
  },
},
animation: {
  "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
},
```

#### Task 5-3: SuggestionBubble マイクロインタラクション

```tsx
// ホバー・アクティブ状態は Tailwind ユーティリティで定義
const interactionClasses = disabled
  ? "opacity-50 cursor-not-allowed"
  : clsx(
      "cursor-pointer",
      "hover:scale-[var(--scale-hover)] hover:bg-[var(--bg-elevated)] hover:shadow-[var(--shadow-sm)]",
      "active:scale-[var(--scale-active)]",
      "transition-all duration-[var(--duration-default)] ease-[var(--ease-default)]",
    );

// success-bounce 状態管理
const [isBouncing, setIsBouncing] = useState(false);

const handleClick = () => {
  if (disabled) return;
  onClick();
  setIsBouncing(true);
  setTimeout(() => setIsBouncing(false), 300);
};

const bounceClass = isBouncing
  ? "animate-[success-bounce_0.3s_var(--ease-bounce)]"
  : "";
```

#### Task 5-4: EmptyState mood グラデーション

```tsx
// welcoming: 薄い青の円形グラデーション背景
const moodStyles: Record<EmptyStateMood, string> = {
  welcoming: "bg-gradient-radial from-[var(--status-primary)]/5 to-transparent",
  encouraging: "", // スタイル変更なし
  celebrating: "", // スタイル変更なし
};
```

`welcoming` のグラデーションは Tailwind のカスタム gradient を使用するか、インラインスタイルで `radial-gradient` を設定する:

```tsx
const moodInlineStyle =
  mood === "welcoming"
    ? {
        background:
          "radial-gradient(circle at center, var(--status-primary) 0%, transparent 70%)",
        opacity: 0.05,
      }
    : undefined;
```

### Task 6: コンポーネント間依存設計

#### Task 6-1: EmptyState → SuggestionBubble 統合

EmptyState 内での SuggestionBubble 使用パターン:

```tsx
// EmptyState 内部
{
  suggestions && suggestions.length > 0 && (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion, index) => (
        <SuggestionBubble
          key={`suggestion-${index}`}
          label={suggestion.label}
          icon={suggestion.icon}
          onClick={suggestion.onClick}
          size="sm"
        />
      ))}
    </div>
  );
}
```

**設計判断**:

- SuggestionBubble のサイズは EmptyState 内では常に `"sm"` を使用する（EmptyState のレイアウト内で適切なサイズ）
- `key` は index ベース（suggestions 配列の順序が動的に変わることは想定しない）
- `flex-wrap` で複数サジェストが折り返し表示される

#### Task 6-2: EmptyState → Button 統合（action オブジェクト形式）

```tsx
// action の型判別と描画
const isActionObject = (
  action: React.ReactNode | EmptyStateActionObject,
): action is EmptyStateActionObject =>
  action !== null &&
  typeof action === "object" &&
  "label" in action &&
  "onClick" in action;

// レンダリング部分
{
  action && (
    <div className="mt-4">
      {isActionObject(action) ? (
        <Button variant={action.variant ?? "primary"} onClick={action.onClick}>
          {action.label}
        </Button>
      ) : (
        action
      )}
    </div>
  );
}
```

### Task 7: 後方互換性設計

#### Task 7-1: Badge 段階的拡張戦略

**ステップ1**: カラートークン移行

- `variantStyles` オブジェクトの値を Tailwind 標準クラスから CSS 変数ベースに変更
- テストのアサーションを新しいクラス名に更新

**ステップ2**: `primary` variant 追加

- `variantStyles` に `primary` エントリを追加

**ステップ3**: `content` props 追加

- `children` のデフォルト値を `undefined` に変更（必須 → 任意）
- レンダリング部分で `children ?? content` のフォールバックを実装
- `typeof content === "number"` 判定で `aria-label` を自動設定

**影響を受けるテスト（6件）の修正方針**:

| テスト名                                | 修正内容                                                   |
| --------------------------------------- | ---------------------------------------------------------- |
| defaultバリアントのスタイルを適用する   | `toHaveClass("bg-gray-600")` → CSS変数ベースのクラス確認   |
| successバリアントのスタイルを適用する   | `toHaveClass("bg-green-500")` → CSS変数ベースのクラス確認  |
| warningバリアントのスタイルを適用する   | `toHaveClass("bg-orange-400")` → CSS変数ベースのクラス確認 |
| errorバリアントのスタイルを適用する     | `toHaveClass("bg-red-500")` → CSS変数ベースのクラス確認    |
| infoバリアントのスタイルを適用する      | `toHaveClass("bg-blue-500")` → CSS変数ベースのクラス確認   |
| デフォルトでdefaultバリアントを使用する | `toHaveClass("bg-gray-600")` → CSS変数ベースのクラス確認   |

CSS 変数を Tailwind arbitrary value（`bg-[var(--status-success)]`）で使用する場合、テストでは `toHaveClass` でクラス名を検証する。ただしクラス名に角括弧を含むため、`toHaveClass` が正しくマッチすることを確認する。代替案として `style` 属性でインラインスタイルを検証する方法もある。

**推奨アプローチ**: Tailwind arbitrary value クラスのアサーションが不安定な場合は、`data-variant` カスタム属性をテスト用に付与し、`toHaveAttribute("data-variant", "success")` で検証する。

#### Task 7-2: EmptyState 段階的拡張戦略

**ステップ1**: デザイントークン移行

- `text-gray-400` → `text-[var(--text-primary)]`
- `text-gray-500` → `text-[var(--text-secondary)]`
- `text-gray-500`（Icon）→ `text-[var(--text-muted)]`

**ステップ2**: 新規 props 追加

- `suggestions`, `compact`, `mood` を任意 props として追加
- 全て未指定時は現行と同一の出力を保証

**ステップ3**: `action` オブジェクト形式対応

- 型ガード関数 `isActionObject` で ReactNode / オブジェクトを判別
- 既存の ReactNode 形式はそのまま通過

**既存テスト6件への影響**: なし（テキスト内容・DOM構造のアサーションのみで、クラス名アサーションなし）

### Task 8: atoms/index.ts エクスポート設計

```typescript
// apps/desktop/src/renderer/components/atoms/index.ts
// 既存エクスポート（変更なし）
export { Button, type ButtonProps } from "./Button";
export { Icon, type IconProps, type IconName } from "./Icon";
export { Badge, type BadgeProps } from "./Badge";
export { Spinner, type SpinnerProps } from "./Spinner";
export { Avatar, type AvatarProps } from "./Avatar";
export { ProgressBar, type ProgressBarProps } from "./ProgressBar";
export { Input, type InputProps } from "./Input";
export { TextArea, type TextAreaProps } from "./TextArea";
export { Checkbox, type CheckboxProps } from "./Checkbox";

// 新規エクスポート（追加）
export {
  StatusIndicator,
  type StatusIndicatorProps,
  type StatusType,
  type StatusSize,
} from "./StatusIndicator";
export { FilterChip, type FilterChipProps } from "./FilterChip";
export {
  SkeletonCard,
  type SkeletonCardProps,
  type SkeletonVariant,
} from "./SkeletonCard";
export {
  SuggestionBubble,
  type SuggestionBubbleProps,
  type SuggestionSize,
} from "./SuggestionBubble";
export {
  EmptyState,
  type EmptyStateProps,
  type EmptyStateMood,
  type EmptyStateSuggestion,
  type EmptyStateActionObject,
} from "./EmptyState";
export {
  RelativeTime,
  type RelativeTimeProps,
  type RelativeTimeFormat,
} from "./RelativeTime";
```

## 参照資料

| 参照                   | パス                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 1 要件定義       | `docs/30-workflows/completed-tasks/task-ui-00-atoms/phase-1-requirements.md`                |
| Atoms仕様書            | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` |
| 既存Badge実装          | `apps/desktop/src/renderer/components/atoms/Badge/index.tsx`                                |
| 既存Badgeテスト        | `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`                           |
| 既存EmptyState実装     | `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`                           |
| 既存EmptyStateテスト   | `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`                 |
| atoms/index.ts         | `apps/desktop/src/renderer/components/atoms/index.ts`                                       |
| UIコンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     |
| デザイン原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              |
| デザインシステム       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  |
| UIアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           |
| a11yテスト             | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| 既存コンポーネント分析 | `outputs/phase-1/existing-component-analysis.md`                                            | Phase 1 成果物 |
| コンポーネント要件定義 | `outputs/phase-1/component-requirements.md`                                                 | Phase 1 成果物 |
| アクセシビリティ要件   | `outputs/phase-1/accessibility-requirements.md`                                             | Phase 1 成果物 |
| テーマ要件             | `outputs/phase-1/theme-requirements.md`                                                     | Phase 1 成果物 |
| 後方互換性要件         | `outputs/phase-1/backward-compatibility-requirements.md`                                    | Phase 1 成果物 |

## 統合テスト連携

- EmptyState → SuggestionBubble 連携テスト: Phase 4 で `suggestions` props を渡した EmptyState のレンダリングテストとして設計
- atoms/index.ts エクスポート検証: Phase 4 で全エクスポートのインポートテストを設計
- 3テーマ横断テスト: Phase 4 で `describe.each` パターンの共通ヘルパーを設計

## 成果物

| #   | 成果物                             | パス                                      |
| --- | ---------------------------------- | ----------------------------------------- |
| 1   | インターフェース設計ドキュメント   | `outputs/phase-2/interface-design.md`     |
| 2   | トークンマッピング設計ドキュメント | `outputs/phase-2/token-mapping-design.md` |
| 3   | アクセシビリティ設計ドキュメント   | `outputs/phase-2/accessibility-design.md` |
| 4   | テスト戦略設計ドキュメント         | `outputs/phase-2/test-strategy-design.md` |
| 5   | アニメーション設計ドキュメント     | `outputs/phase-2/animation-design.md`     |

**注意**: 成果物ドキュメントは本仕様書（phase-2-design.md）に全内容が包含されているため、Phase 3 / Phase 4 / Phase 5 はこのファイルを直接参照する。

## 完了条件

- [ ] 7コンポーネントの TypeScript インターフェース（Props 型定義）を設計し、型名を named export として定義した
- [ ] StatusIndicator の6ステータス × CSS変数トークンのマッピングを確定した
- [ ] Badge の6 variant（default含む）の Tailwind 標準クラス → CSS 変数移行先を確定した
- [ ] SuggestionBubble のサイズ別高さ（sm:36px / md:44px / lg:56px）とインタラクション状態を設計した
- [ ] 全7コンポーネントの ARIA 属性実装パターンを JSX コード例付きで設計した
- [ ] SuggestionBubble / FilterChip のキーボードハンドラを設計した
- [ ] テストカテゴリ（レンダリング / バリアント / インタラクション / ARIA / テーマ）とテスト数見積もり（139件）を確定した
- [ ] SkeletonCard の skeleton-pulse アニメーション（opacity 0.4⟷1.0、1.5秒周期）を設計した
- [ ] SuggestionBubble の success-bounce アニメーション状態管理（useState + setTimeout 300ms）を設計した
- [ ] EmptyState → SuggestionBubble の統合パターン（flex-wrap、size="sm"）を設計した
- [ ] EmptyState の action 型判別（isActionObject 型ガード関数）を設計した
- [ ] Badge / EmptyState の段階的拡張戦略（3ステップ）を設計し、後方互換性を保証した
- [ ] atoms/index.ts の新規6エクスポート（StatusIndicator, FilterChip, SkeletonCard, SuggestionBubble, EmptyState拡張, RelativeTime）を設計した

## Phase末端アクション【必須】

- [ ] 本仕様書を作成し、`docs/30-workflows/completed-tasks/task-ui-00-atoms/phase-2-design.md` に配置した
- [ ] `artifacts.json` の Phase 2 ステータスを `in_progress` に更新する（Phase 3 開始時）

## 依存関係

| 依存種別     | 対象                    | 内容                                         |
| ------------ | ----------------------- | -------------------------------------------- |
| 前提Phase    | Phase 1（要件定義）     | 機能要件31件が確定済みであること             |
| ブロック対象 | Phase 3（設計レビュー） | 本 Phase の設計セットが Phase 3 の入力となる |
| ブロック対象 | Phase 4（テスト作成）   | テスト設計概要が Phase 4 の入力となる        |
| ブロック対象 | Phase 5（実装）         | インターフェース設計が Phase 5 の入力となる  |

## 次のPhase

Phase 3（設計レビュー）: 本 Phase の設計を Phase 1 の要件と照合し、Apple HIG 準拠・WCAG 2.1 AA 準拠・後方互換性の検証を行い、PASS / MINOR / MAJOR 判定を下す。
