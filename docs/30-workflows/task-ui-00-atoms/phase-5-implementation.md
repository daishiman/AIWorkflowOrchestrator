# Phase 5: 実装（TDD: Green） - TASK-UI-00-ATOMS

## メタ情報

| 項目               | 値                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| タスクID           | TASK-UI-00-ATOMS                                                                                  |
| Phase              | 5（実装）                                                                                         |
| 前提Phase          | Phase 4（テスト作成完了、全新規テスト FAIL 確認済み）                                             |
| 目的               | Phase 4 で作成した全テストを PASS させるための実装コードを作成する（TDD Green フェーズ）          |
| 成果物ディレクトリ | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/outputs/phase-5/` |

## 目的

Phase 4 で作成した全テスト（新規5コンポーネント + 既存2コンポーネント拡張）を PASS させるための実装コードを作成する。TDD Green フェーズとして、テストを通すために必要最小限の実装に集中する。全コンポーネントは Apple HIG 準拠のデザイントークンを使用し、WCAG 2.1 AA のアクセシビリティ要件を満たす。

## 背景

- Phase 4 で7コンポーネント分のテスト（合計約120件）が FAIL 状態で存在する
- 既存の Badge（Tailwind 標準カラー）と EmptyState（基本的な空状態表示）を後方互換性を維持しつつ拡張する
- 全コンポーネントは `var(--token-name)` 形式の CSS 変数を使用し、Tailwind arbitrary value（`bg-[var(--status-primary)]`）で適用する
- EmptyState は SuggestionBubble に依存するため、実装順序に制約がある

## 実装順序の制約

```
Task 5-1 ~ 5-4: 独立して並列実装可能
  ├── StatusIndicator（依存なし）
  ├── FilterChip（依存なし）
  ├── Badge拡張（依存なし）
  └── SkeletonCard（依存なし）

Task 5-5: SuggestionBubble（依存なし）
  ↓ 必須（EmptyState の suggestions が SuggestionBubble を使用）
Task 5-6: EmptyState 拡張（SuggestionBubble に依存）

Task 5-7: RelativeTime（依存なし、並列可）

Task 5-8: atoms/index.ts エクスポート追加（全コンポーネント完了後）
```

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 5-1: StatusIndicator 実装

**目的**: 6種のステータスをカラードットで表示し、pulse アニメーションと3サイズをサポートするコンポーネントを実装する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/StatusIndicator/index.tsx` を作成する
2. 以下のインターフェースとコンポーネントを実装する

**インターフェース**:

```typescript
export interface StatusIndicatorProps {
  status: "running" | "success" | "error" | "warning" | "idle" | "offline";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  label?: string;
}
```

**実装要件**:

| 要件             | 詳細                                                                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 要素             | `<span>`                                                                                                                                                                                                                              |
| 形状             | `rounded-full`（円形ドット）                                                                                                                                                                                                          |
| ステータスカラー | `running`: `bg-[var(--status-primary)]`、`success`: `bg-[var(--status-success)]`、`error`: `bg-[var(--status-error)]`、`warning`: `bg-[var(--status-warning)]`、`idle`: `bg-[var(--text-muted)]`、`offline`: `bg-[var(--text-muted)]` |
| offline追加効果  | `border border-dashed border-[var(--border-default)]`                                                                                                                                                                                 |
| サイズ           | `sm`: `w-2 h-2`（8px）、`md`（デフォルト）: `w-[10px] h-[10px]`、`lg`: `w-[14px] h-[14px]`                                                                                                                                            |
| pulse            | `running` 時デフォルトで `animate-pulse` を適用。`pulse` props で明示制御可能                                                                                                                                                         |
| ARIA             | `role="status"`、`aria-label` は `label` props 優先、未指定時は `"ステータス: {status}"`                                                                                                                                              |

**テスト通過対象**: Phase 4 Task 4-1 の17テスト

**成果物パス**: `apps/desktop/src/renderer/components/atoms/StatusIndicator/index.tsx`

---

### Task 5-2: FilterChip 実装

**目的**: 選択/非選択の切替可能なフィルターチップコンポーネントを実装する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx` を作成する
2. 以下のインターフェースとコンポーネントを実装する

**インターフェース**:

```typescript
export interface FilterChipProps {
  label: string;
  isSelected: boolean;
  count?: number;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}
```

**実装要件**:

| 要件             | 詳細                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| 要素             | `<button>`                                                                 |
| 形状             | `rounded-full`（ピル形状）                                                 |
| 非選択スタイル   | `bg-[var(--bg-tertiary)] text-[var(--text-secondary)]`                     |
| 選択スタイル     | `bg-[var(--status-primary)] text-[var(--text-inverse)]`                    |
| トランジション   | `transition-all duration-[var(--duration-fast)]`                           |
| タッチターゲット | `min-h-[36px] min-w-[36px]`                                                |
| count表示        | ラベル右に `({count})` をレンダリング                                      |
| icon表示         | ラベル左に16pxアイコンをレンダリング（`Icon` コンポーネント使用）          |
| disabled         | `opacity-50 cursor-not-allowed`、`onClick` を呼ばない                      |
| ARIA             | `role="checkbox"`、`aria-checked={isSelected}`、`aria-disabled={disabled}` |

**テスト通過対象**: Phase 4 Task 4-2 の13テスト

**成果物パス**: `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`

---

### Task 5-3: Badge 拡張

**目的**: 既存 Badge に `primary` variant と `content` props を追加し、デザイントークンに移行する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/Badge/index.tsx` を編集する
2. 既存の構造（`forwardRef` + `clsx`）を維持しつつ拡張する
3. Tailwind 標準カラーをデザイントークンに移行する

**拡張後のインターフェース**:

```typescript
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  children?: React.ReactNode;
  content?: string | number;
}
```

**実装要件**:

| 要件                 | 詳細                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| primary variant      | `bg-[var(--status-primary)] text-[var(--text-inverse)]`                                                              |
| content props        | `children` が存在する場合は `children` を優先して表示。`children` がない場合に `content` を `String(content)` で表示 |
| 数値 aria-label      | `content` が `number` 型かつ明示的な `aria-label` が未設定の場合、`aria-label="{content}件"` を自動設定              |
| デザイントークン移行 | 既存 variant のカラーマッピングを変更（下表参照）                                                                    |
| 後方互換性           | `children` が必須（required）から任意（optional）に変更。`forwardRef` パターン維持。`role="status"` 維持             |

**バリアント カラーマッピング（移行前 → 移行後）**:

| variant | 移行前（Tailwind標準）     | 移行後（デザイントークン）                              |
| ------- | -------------------------- | ------------------------------------------------------- |
| default | `bg-gray-600 text-white`   | `bg-[var(--bg-tertiary)] text-[var(--text-primary)]`    |
| primary | （新規）                   | `bg-[var(--status-primary)] text-[var(--text-inverse)]` |
| success | `bg-green-500 text-white`  | `bg-[var(--status-success)] text-[var(--text-inverse)]` |
| warning | `bg-orange-400 text-white` | `bg-[var(--status-warning)] text-[var(--text-inverse)]` |
| error   | `bg-red-500 text-white`    | `bg-[var(--status-error)] text-[var(--text-inverse)]`   |
| info    | `bg-blue-500 text-white`   | `bg-[var(--status-info)] text-[var(--text-inverse)]`    |

**既存テスト更新の必要性**: デザイントークン移行により、既存テスト17件中バリアントテスト6件（`bg-gray-600`, `bg-green-500`, `bg-orange-400`, `bg-red-500`, `bg-blue-500` をチェックする箇所）が FAIL する。これらのテストのアサーション値を新しいクラス名（`bg-[var(--bg-tertiary)]` 等）に更新する必要がある。Phase 5 で実装と同時にテストを更新する。

**テスト通過対象**: Phase 4 Task 4-3 の8テスト + 既存17テスト（アサーション更新後）= 25テスト

**成果物パス**: `apps/desktop/src/renderer/components/atoms/Badge/index.tsx`

---

### Task 5-4: SkeletonCard 実装

**目的**: 3バリエーション（default/stat/list-item）のスケルトンローディングカードを実装する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/SkeletonCard/index.tsx` を作成する
2. 以下のインターフェースとコンポーネントを実装する

**インターフェース**:

```typescript
export interface SkeletonCardProps {
  height?: string;
  borderRadius?: string;
  variant?: "default" | "stat" | "list-item";
  animate?: boolean;
}
```

**実装要件**:

| 要件                  | 詳細                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| 要素                  | `<div>`                                                                                                     |
| 背景                  | `bg-[var(--bg-tertiary)]`                                                                                   |
| パルスアニメーション  | `animate` デフォルト `true`。`true` 時に `animate-pulse` クラスを適用。opacity 0.4⟷1.0 の周期アニメーション |
| height / borderRadius | `style` 属性で適用（`style={{ height, borderRadius }}`）                                                    |
| ARIA                  | `role="status"`、`aria-label="読み込み中"`、`aria-busy="true"`                                              |

**バリエーション内部構造**:

| variant     | 内部要素                                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `default`   | ヘッダーライン: `<div>` 幅60%、高さ12px、`rounded bg-[var(--bg-tertiary)]`。ボディライン1: 幅80%、高さ8px。ボディライン2: 幅100%、高さ8px |
| `stat`      | 数値プレースホルダー: 幅40%、高さ24px。ラベルライン: 幅60%、高さ8px                                                                       |
| `list-item` | アイコン円: `w-8 h-8 rounded-full`。テキストライン1: 幅70%、高さ8px。テキストライン2: 幅50%、高さ8px                                      |

**内部要素の共通スタイル**: `rounded bg-[var(--bg-tertiary)]` に50%程度の opacity（内部ラインが外側コンテナより薄く見えるよう `opacity-60` を適用）

**テスト通過対象**: Phase 4 Task 4-4 の13テスト

**成果物パス**: `apps/desktop/src/renderer/components/atoms/SkeletonCard/index.tsx`

---

### Task 5-5: SuggestionBubble 実装

**目的**: タップ/クリック可能なサジェスチョンバブルコンポーネントを実装する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx` を作成する
2. 以下のインターフェースとコンポーネントを実装する

**インターフェース**:

```typescript
export interface SuggestionBubbleProps {
  label: string;
  icon?: string;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}
```

**実装要件**:

| 要件           | 詳細                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 要素           | `<div>`（`role="button"` でセマンティクスを補完）                                                                                                 |
| 形状           | `rounded-full`（ピル形状）                                                                                                                        |
| 背景           | `bg-[var(--bg-tertiary)]`                                                                                                                         |
| ボーダー       | `border border-[var(--border-subtle)]`                                                                                                            |
| テキスト       | `text-[var(--text-primary)]`                                                                                                                      |
| アイコン       | ラベル左に配置。カラー: `text-[var(--text-secondary)]`                                                                                            |
| サイズ         | `sm`: `h-9`（36px）, `text-sm`, icon 16px。`md`（デフォルト）: `h-11`（44px）, `text-sm`, icon 16px。`lg`: `h-14`（56px）, `text-base`, icon 20px |
| ホバー         | `hover:scale-[var(--scale-hover)] hover:bg-[var(--bg-elevated)] hover:shadow-[var(--shadow-sm)]`                                                  |
| アクティブ     | `active:scale-[var(--scale-active)]`                                                                                                              |
| disabled       | `opacity-50 cursor-not-allowed`、`onClick`/キーボードイベントを無効化                                                                             |
| キーボード     | `onKeyDown` で `Enter` / `Space` キーを検出し `onClick` を呼び出す。`Space` 時は `e.preventDefault()` でスクロール抑止                            |
| ARIA           | `role="button"`、`tabIndex={disabled ? -1 : 0}`、`aria-disabled={disabled}`                                                                       |
| トランジション | `transition-all duration-200`                                                                                                                     |

**タッチターゲット**: 全サイズで最小 44px の高さを確保。`sm`（36px）は内部高さが36pxだが、padding で44pxタッチターゲットを達成するか、`min-h-[44px]` を設定する。

**テスト通過対象**: Phase 4 Task 4-5 の19テスト

**成果物パス**: `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx`

---

### Task 5-6: EmptyState 拡張

**目的**: 既存 EmptyState に suggestions・compact・mood・action オブジェクト形式を追加する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx` を編集する
2. 既存の構造（`memo` + `Icon` 依存）を維持しつつ拡張する
3. `SuggestionBubble` と `Button` コンポーネントを import する

**拡張後のインターフェース**:

```typescript
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?:
    | React.ReactNode
    | {
        label: string;
        onClick: () => void;
        variant?: "primary" | "secondary";
      };
  suggestions?: Array<{
    label: string;
    icon?: string;
    onClick: () => void;
  }>;
  compact?: boolean;
  mood?: "welcoming" | "encouraging" | "celebrating";
  className?: string;
}
```

**実装要件**:

| 要件                    | 詳細                                                                                                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| suggestions             | `SuggestionBubble` コンポーネントの配列でレンダリング。コンテナは `flex flex-wrap justify-center gap-2`                                                                                                                                                             |
| compact モード          | `compact=true` 時: アイコン `size={32}`、見出し `text-base`、パディング `p-5`。デフォルト: アイコン `size={48}`、見出し `text-lg`、パディング `p-8`                                                                                                                 |
| mood バリアント         | `welcoming`: アイコンカラー `text-[var(--status-primary)]`。`encouraging`: アイコンカラー `text-[var(--status-info)]`。`celebrating`: アイコンカラー `text-[var(--status-success)]` + `animate-[success-bounce]`。未指定: アイコンカラー `text-[var(--text-muted)]` |
| action オブジェクト形式 | `action` が `object` で `label` プロパティを持つ場合、`Button` コンポーネントとしてレンダリング。`variant` props を Button に渡す。`React.isValidElement(action)` が `true` の場合は従来通りそのままレンダリング                                                    |
| 後方互換性              | 既存の `title`, `description`, `icon`, `action`（ReactNode形式）, `className` は全て動作を維持                                                                                                                                                                      |

**action 判定ロジック**:

```typescript
const isActionObject = (
  action: EmptyStateProps["action"],
): action is {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
} => {
  return (
    action !== null &&
    action !== undefined &&
    typeof action === "object" &&
    !React.isValidElement(action) &&
    "label" in action &&
    "onClick" in action
  );
};
```

**mood によるスタイル変化**:

| mood          | アイコンカラークラス           | 背景効果                                                                                         | アニメーション                        |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------- |
| `welcoming`   | `text-[var(--status-primary)]` | 薄い円形グラデーション背景（`bg-gradient-radial from-[var(--status-primary)]/5 to-transparent`） | なし                                  |
| `encouraging` | `text-[var(--status-info)]`    | 変更なし                                                                                         | なし                                  |
| `celebrating` | `text-[var(--status-success)]` | 変更なし                                                                                         | アイコンに `animate-[success-bounce]` |
| 未指定        | `text-[var(--text-muted)]`     | 変更なし                                                                                         | なし                                  |

**既存テスト互換性**: 現行の EmptyState テスト7件では `text-gray-400`、`text-gray-500` 等の Tailwind 標準カラーを直接アサーションしていない（テキスト内容とクラス存在のみチェック）。デザイントークン移行後もテストは PASS する見込み。ただし、`container.firstChild` で `className` をチェックする1件は、基底クラスが変わらないため影響なし。

**テスト通過対象**: Phase 4 Task 4-6 の16テスト + 既存7テスト = 23テスト

**成果物パス**: `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`

---

### Task 5-7: RelativeTime 実装

**目的**: タイムスタンプを相対時刻で表示し、自動更新するコンポーネントを実装する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/RelativeTime/index.tsx` を作成する
2. 以下のインターフェースとコンポーネントを実装する

**インターフェース**:

```typescript
export interface RelativeTimeProps {
  timestamp: string;
  format?: "auto" | "short" | "long";
  refreshInterval?: number;
  showAbsoluteOnHover?: boolean;
}
```

**実装要件**:

| 要件                 | 詳細                                                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 要素                 | `<time>`                                                                                                                                                                                         |
| datetime属性         | ISO 8601 形式のタイムスタンプ（`new Date(timestamp).toISOString()`）                                                                                                                             |
| title属性            | `showAbsoluteOnHover`（デフォルト `true`）が `true` の場合、`YYYY/MM/DD HH:mm:ss` 形式の絶対時刻を設定。`false` の場合は `title` を設定しない                                                    |
| 自動更新             | `useEffect` 内で `setInterval` を使用し `refreshInterval`（デフォルト 60000ms）ごとに `useState` のカウンタをインクリメントして再レンダリングをトリガー。クリーンアップで `clearInterval` を呼ぶ |
| 無効なタイムスタンプ | `new Date(timestamp)` が `Invalid Date` の場合、テキスト `"—"`（エムダッシュ）を表示し、`datetime` 属性は空文字列を設定                                                                          |

**相対時刻計算関数（`formatRelativeTime`）**:

```typescript
type Format = "auto" | "short" | "long";

function formatRelativeTime(timestamp: string, format: Format): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  // フォーマット別分岐（下表参照）
}
```

**フォーマット別表示ルール**:

| 経過時間 | `auto`         | `short`   | `long`             |
| -------- | -------------- | --------- | ------------------ |
| < 60秒   | `"たった今"`   | `"今"`    | `"たった今"`       |
| < 60分   | `"{N}分前"`    | `"{N}m"`  | `"{N}分前"`        |
| < 24時間 | `"{N}時間前"`  | `"{N}h"`  | `"{N}時間前"`      |
| < 2日    | `"{N}日前"`    | `"{N}d"`  | `"昨日"`           |
| < 7日    | `"{N}日前"`    | `"{N}d"`  | `"{N}日前"`        |
| >= 7日   | `"YYYY/MM/DD"` | `"MM/DD"` | `"YYYY年MM月DD日"` |

**日付フォーマットヘルパー**:

```typescript
function formatAbsolute(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const sec = String(date.getSeconds()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}:${sec}`;
}
```

**自動更新の実装パターン**:

```typescript
const [, setTick] = useState(0);

useEffect(() => {
  const intervalId = setInterval(() => {
    setTick((prev) => prev + 1);
  }, refreshInterval);
  return () => clearInterval(intervalId);
}, [refreshInterval]);
```

**テスト通過対象**: Phase 4 Task 4-7 の26テスト

**成果物パス**: `apps/desktop/src/renderer/components/atoms/RelativeTime/index.tsx`

---

### Task 5-8: atoms/index.ts エクスポート追加

**目的**: 新規5コンポーネントを `atoms/index.ts` にエクスポートとして追加する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/index.ts` を編集する
2. 以下の5行を追加する（既存エクスポートの後に追加）:

```typescript
// 既存エクスポート（9コンポーネント + EmptyState）は変更なし

// 新規追加
export { StatusIndicator, type StatusIndicatorProps } from "./StatusIndicator";
export { FilterChip, type FilterChipProps } from "./FilterChip";
export { SkeletonCard, type SkeletonCardProps } from "./SkeletonCard";
export {
  SuggestionBubble,
  type SuggestionBubbleProps,
} from "./SuggestionBubble";
export { RelativeTime, type RelativeTimeProps } from "./RelativeTime";
```

3. EmptyState のエクスポートが既存で存在しない場合は追加する（現在 `atoms/index.ts` に EmptyState のエクスポートがない）:

```typescript
export { EmptyState, type EmptyStateProps } from "./EmptyState";
```

**成果物パス**: `apps/desktop/src/renderer/components/atoms/index.ts`

## 共通実装ルール

### デザイントークン使用パターン

全コンポーネントで Tailwind arbitrary value 形式を使用する:

```typescript
// ✅ 正しいパターン
className = "bg-[var(--status-primary)] text-[var(--text-inverse)]";

// ❌ 禁止パターン（Tailwind 標準カラー直接使用）
className = "bg-blue-500 text-white";
```

### コンポーネント実装パターン

| パターン          | 使用箇所                                              | 理由                                                                    |
| ----------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `forwardRef`      | Badge（既存維持）                                     | ref 転送が必要なコンポーネント                                          |
| `React.FC + memo` | EmptyState（既存維持）、StatusIndicator、SkeletonCard | 再レンダリング最適化が有益なコンポーネント                              |
| `React.FC`        | FilterChip、SuggestionBubble、RelativeTime            | クリックハンドラ/タイマーを持ち memo のメリットが限定的なコンポーネント |

### displayName 設定

全コンポーネントに `displayName` を設定する:

```typescript
// memo の場合
const Component: React.FC<Props> = memo(({ ... }) => { ... });
Component.displayName = "Component";

// forwardRef の場合
const Component = forwardRef<HTMLElement, Props>(({ ... }, ref) => { ... });
Component.displayName = "Component";
```

### clsx の使用

条件付きクラス結合には `clsx` を使用する（既存パターン踏襲）:

```typescript
import clsx from "clsx";

const classes = clsx(
  "base-classes",
  isCondition && "conditional-class",
  variantMap[variant],
);
```

## Badge 既存テスト更新詳細

Phase 5 で Badge のデザイントークン移行を行うと、既存テスト17件中以下の6件が FAIL する。これらのアサーション値を更新する:

| テスト名                                  | 更新前のアサーション           | 更新後のアサーション                        |
| ----------------------------------------- | ------------------------------ | ------------------------------------------- |
| `defaultバリアントのスタイルを適用する`   | `toHaveClass("bg-gray-600")`   | `toHaveClass("bg-[var(--bg-tertiary)]")`    |
| `successバリアントのスタイルを適用する`   | `toHaveClass("bg-green-500")`  | `toHaveClass("bg-[var(--status-success)]")` |
| `warningバリアントのスタイルを適用する`   | `toHaveClass("bg-orange-400")` | `toHaveClass("bg-[var(--status-warning)]")` |
| `errorバリアントのスタイルを適用する`     | `toHaveClass("bg-red-500")`    | `toHaveClass("bg-[var(--status-error)]")`   |
| `infoバリアントのスタイルを適用する`      | `toHaveClass("bg-blue-500")`   | `toHaveClass("bg-[var(--status-info)]")`    |
| `デフォルトでdefaultバリアントを使用する` | `toHaveClass("bg-gray-600")`   | `toHaveClass("bg-[var(--bg-tertiary)]")`    |

**注意**: `text-white` は全 variant で `text-[var(--text-inverse)]` に変更されるが、既存テストでは `text-white` のアサーションがないため更新不要。

## 参照資料

| 参照                                     | パス                                                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------- |
| Atoms仕様書                              | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-2-atoms-components.md`                  |
| Phase 4 テスト仕様                       | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-4-test-creation.md` |
| デザイントークン                         | `apps/desktop/src/renderer/styles/tokens.css`                                                             |
| 既存Badge実装                            | `apps/desktop/src/renderer/components/atoms/Badge/index.tsx`                                              |
| 既存EmptyState実装                       | `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`                                         |
| 既存atoms/index.ts                       | `apps/desktop/src/renderer/components/atoms/index.ts`                                                     |
| テストヘルパー                           | `apps/desktop/src/renderer/tests/helpers/renderWithTheme.tsx`                                             |
| Buttonコンポーネント                     | `apps/desktop/src/renderer/components/atoms/Button/index.tsx`                                             |
| Iconコンポーネント                       | `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`                                               |
| UIコンポーネント仕様                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                   |
| UIデザインシステム                       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                |
| UIデザイン原則                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                            |
| UIアーキテクチャ                         | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                 |
| コンポーネントテストパターン             | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                         |
| テスト仕様書（7コンポーネント139テスト） | `outputs/phase-4/test-specification.md`                                                                   | Phase 4 成果物 |

## 統合テスト連携

- EmptyState は SuggestionBubble をインポートするため、Task 5-5（SuggestionBubble）が完了してから Task 5-6（EmptyState）を実装する
- EmptyState は Button をインポートするため、既存の Button コンポーネントが利用可能であることを前提とする
- atoms/index.ts のエクスポート追加（Task 5-8）は全コンポーネント実装後に実施する
- Phase 6（テスト拡充）で EmptyState + SuggestionBubble の統合テストを追加する

## 成果物

| #   | 成果物                  | パス                                                                    | 種別                              |
| --- | ----------------------- | ----------------------------------------------------------------------- | --------------------------------- |
| 1   | StatusIndicator 実装    | `apps/desktop/src/renderer/components/atoms/StatusIndicator/index.tsx`  | コード（新規）                    |
| 2   | FilterChip 実装         | `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`       | コード（新規）                    |
| 3   | Badge 実装（拡張）      | `apps/desktop/src/renderer/components/atoms/Badge/index.tsx`            | コード（編集）                    |
| 4   | Badge テスト更新        | `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`       | コード（編集: 6アサーション更新） |
| 5   | SkeletonCard 実装       | `apps/desktop/src/renderer/components/atoms/SkeletonCard/index.tsx`     | コード（新規）                    |
| 6   | SuggestionBubble 実装   | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx` | コード（新規）                    |
| 7   | EmptyState 実装（拡張） | `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`       | コード（編集）                    |
| 8   | RelativeTime 実装       | `apps/desktop/src/renderer/components/atoms/RelativeTime/index.tsx`     | コード（新規）                    |
| 9   | atoms/index.ts 更新     | `apps/desktop/src/renderer/components/atoms/index.ts`                   | コード（編集: 6エクスポート追加） |
| 10  | 実装サマリー            | `outputs/phase-5/implementation-summary.md`                             | ドキュメント                      |

## 完了条件

- [ ] StatusIndicator が6種のステータスで正しくカラードットを描画する
- [ ] StatusIndicator の pulse アニメーションが running 時にデフォルトで適用される
- [ ] StatusIndicator の3サイズ（8px/10px/14px）が正しく適用される
- [ ] FilterChip の選択/非選択切替でスタイルが変わる
- [ ] FilterChip の disabled 時に onClick が呼ばれない
- [ ] Badge に `primary` variant が追加されている
- [ ] Badge の `content` props で文字列/数値が表示される
- [ ] Badge の `content` が `number` 型の場合に `aria-label="{content}件"` が自動設定される
- [ ] Badge の既存テスト17件（アサーション更新後）が全て PASS する
- [ ] Badge の拡張テスト8件が全て PASS する
- [ ] SkeletonCard の3バリエーション（default/stat/list-item）が正しく描画される
- [ ] SkeletonCard の `animate` props でパルスアニメーションが制御できる
- [ ] SuggestionBubble の3サイズ（36px/44px/56px）が正しく適用される
- [ ] SuggestionBubble の Enter/Space キーで onClick が発火する
- [ ] SuggestionBubble の disabled 時にインタラクションが無効化される
- [ ] EmptyState の `suggestions` が SuggestionBubble 配列でレンダリングされる
- [ ] EmptyState の `compact` モードでサイズが縮小される
- [ ] EmptyState の3種 `mood` バリアントでアイコンカラーが変わる
- [ ] EmptyState の `action` オブジェクト形式で Button がレンダリングされる
- [ ] EmptyState の既存テスト7件が全て PASS する
- [ ] EmptyState の拡張テスト16件が全て PASS する
- [ ] RelativeTime が3フォーマット（auto/short/long）×5閾値で正しく表示される
- [ ] RelativeTime の setInterval 自動更新が動作する
- [ ] RelativeTime のアンマウント時に clearInterval が呼ばれる
- [ ] RelativeTime の `<time>` 要素と `datetime` 属性が設定される
- [ ] 全コンポーネントが Tailwind arbitrary value（`var(--token-name)`）でデザイントークンを参照している
- [ ] 全コンポーネントの ARIA 属性が仕様通りに設定されている
- [ ] 全コンポーネントが3テーマ（kanagawa-dragon/light/dark）でレンダリングテスト PASS する
- [ ] 新規5コンポーネント + EmptyState が `atoms/index.ts` にエクスポートされている
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/` で全テストが PASS する
- [ ] `outputs/phase-5/implementation-summary.md` が作成されている

## Phase末端アクション【必須】

1. `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/` で全 Atoms テストを実行し PASS を確認
2. Badge 既存テスト17件 + 拡張テスト8件 = 25件が全て PASS することを確認
3. EmptyState 既存テスト7件 + 拡張テスト16件 = 23件が全て PASS することを確認
4. `outputs/phase-5/implementation-summary.md` を作成し、各コンポーネントの実装ポイントとテスト結果を記録

## 依存関係

| 方向       | Phase/タスク        | 内容                                                            |
| ---------- | ------------------- | --------------------------------------------------------------- |
| 依存元     | Phase 4             | テストコードが作成済みであること                                |
| 依存元     | TASK-UI-00-TOKENS   | デザイントークン（CSS変数）が `tokens.css` に定義済みであること |
| 内部依存   | Task 5-5 → Task 5-6 | EmptyState は SuggestionBubble に依存                           |
| ブロック先 | Phase 6             | 実装が完了していないとテスト拡充に進めない                      |

## 次のPhase

Phase 6（テスト拡充）へ進む。Phase 6 では カバレッジ不足箇所の追加テスト、EmptyState + SuggestionBubble の統合テスト、エッジケーステストを追加する。
