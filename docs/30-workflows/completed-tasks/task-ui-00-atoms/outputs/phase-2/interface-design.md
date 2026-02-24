# インターフェース設計 — Phase 2 成果物

## 概要

7コンポーネント（新規5 + 拡張2）の TypeScript インターフェース設計。全型定義は named export とし、親コンポーネントからの再利用を可能にする。

## 1. StatusIndicator

### ファイルパス

`apps/desktop/src/renderer/components/atoms/StatusIndicator/index.tsx`

### 型定義

```typescript
/**
 * StatusIndicator が描画する6種のステータスを定義する。
 * running: 実行中（pulse デフォルト有効）
 * success: 完了
 * error: エラー
 * warning: 警告
 * idle: 待機中
 * offline: オフライン（破線ボーダー付き）
 */
export type StatusType =
  | "running"
  | "success"
  | "error"
  | "warning"
  | "idle"
  | "offline";

/**
 * StatusIndicator のドットサイズ。
 * sm: 8px (w-2 h-2)
 * md: 10px (w-2.5 h-2.5)
 * lg: 14px (w-3.5 h-3.5)
 */
export type StatusSize = "sm" | "md" | "lg";

export interface StatusIndicatorProps {
  /** 表示するステータス */
  status: StatusType;
  /** ドットサイズ（sm:8px / md:10px / lg:14px）。デフォルト: "md" */
  size?: StatusSize;
  /** パルスアニメーション有無。デフォルト: status === "running" 時のみ true */
  pulse?: boolean;
  /** aria-label の上書き値。未指定時は "ステータス: {status}" */
  label?: string;
  /** 追加 CSS クラス */
  className?: string;
}
```

### 設計判断

| 項目                                        | 判断内容                                                     |
| ------------------------------------------- | ------------------------------------------------------------ |
| `StatusType` / `StatusSize` の named export | 親コンポーネントが型を再利用可能にするため                   |
| `pulse` デフォルト値                        | `status === "running"` の場合のみ `true`、それ以外は `false` |
| `className` 追加                            | 親コンポーネントからのスタイル微調整を許可する               |
| HTML 要素                                   | `<span>` + `role="status"`                                   |

---

## 2. FilterChip

### ファイルパス

`apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`

### 型定義

```typescript
export interface FilterChipProps {
  /** チップに表示するラベルテキスト */
  label: string;
  /** 選択状態 */
  isSelected: boolean;
  /** ラベル右に表示するカウント値 */
  count?: number;
  /** ラベル左に表示するアイコン名（Icon コンポーネント互換） */
  icon?: string;
  /** クリック時コールバック */
  onClick: () => void;
  /** 無効化状態。デフォルト: false */
  disabled?: boolean;
  /** 追加 CSS クラス */
  className?: string;
}
```

### 設計判断

| 項目           | 判断内容                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------- |
| HTML 要素      | `<button>` を使用。`role="checkbox"` + `aria-checked` でフィルター意図を表現                   |
| `disabled`     | HTML button の `disabled` 属性としても設定し、ネイティブのフォーカス管理を活用する             |
| `icon` 型      | `string`（IconName 互換）とし、Icon コンポーネントに委譲する                                   |
| キーボード操作 | `<button>` 要素のため、Enter / Space はブラウザネイティブで `onClick` が発火。追加ハンドラ不要 |

---

## 3. Badge 拡張

### ファイルパス

`apps/desktop/src/renderer/components/atoms/Badge/index.tsx`

### 型定義

```typescript
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** バリアント（primary を追加）。デフォルト: "default" */
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  /** サイズ。デフォルト: "md" */
  size?: "sm" | "md";
  /** 子要素（content より優先される） */
  children?: React.ReactNode;
  /** テキストまたは数値コンテンツ（children が未指定時に使用） */
  content?: string | number;
}
```

### 設計判断

| 項目                                         | 判断内容                                                      |
| -------------------------------------------- | ------------------------------------------------------------- |
| `children` 変更                              | `React.ReactNode`（必須）から `React.ReactNode`（任意）に変更 |
| `children` vs `content` 優先順位             | `children` > `content`（BD-F-05）                             |
| `content` が `number` 型の場合               | `aria-label` に `"{content}件"` を自動設定（BD-F-03）         |
| 明示的 `aria-label`                          | 自動設定を上書き可能（BD-F-04）                               |
| `React.HTMLAttributes<HTMLSpanElement>` 拡張 | 既存の拡張を維持（後方互換性）                                |
| HTML 要素                                    | `<span>` + `role="status"`                                    |

### 後方互換性への影響

- `children` が任意に変わるため、`content` を指定しない既存使用箇所は `children` を必ず渡していることを確認済み
- 既存5 variant の視覚的挙動は維持（カラートークン移行あり、レイアウト変更なし）

---

## 4. SkeletonCard

### ファイルパス

`apps/desktop/src/renderer/components/atoms/SkeletonCard/index.tsx`

### 型定義

```typescript
/**
 * SkeletonCard の3バリエーション。
 * default: ヘッダーライン + ボディ2本
 * stat: 数値プレースホルダー + ラベル
 * list-item: アイコン円 + テキスト2本
 */
export type SkeletonVariant = "default" | "stat" | "list-item";

export interface SkeletonCardProps {
  /** カスタム高さ（CSS ユニット文字列、例: "120px"） */
  height?: string;
  /** カスタム角丸（CSS ユニット文字列、例: "8px"） */
  borderRadius?: string;
  /** バリエーション（内部構造を決定）。デフォルト: "default" */
  variant?: SkeletonVariant;
  /** パルスアニメーション有無。デフォルト: true */
  animate?: boolean;
  /** 追加 CSS クラス */
  className?: string;
}
```

### 設計判断

| 項目                      | 判断内容                                                                    |
| ------------------------- | --------------------------------------------------------------------------- |
| `height` / `borderRadius` | `style` 属性にインラインで適用（Tailwind arbitrary value より柔軟性が高い） |
| `variant` ごとの描画      | 条件分岐でレンダリング（子コンポーネント分割なし。Atom の責務範囲内）       |
| `animate` デフォルト      | `true`                                                                      |
| HTML 要素                 | `<div>` + `role="status"` + `aria-busy="true"`                              |

### バリエーション内部構造

| variant     | 内部構造                                                      |
| ----------- | ------------------------------------------------------------- |
| `default`   | ヘッダーライン（幅60%, h12px）+ ボディ2本（幅80%/100%, h8px） |
| `stat`      | 数値プレースホルダー（幅40%, h24px）+ ラベル（幅60%, h8px）   |
| `list-item` | アイコン円（32px）+ テキスト2本（幅70%/50%, h8px）            |

---

## 5. SuggestionBubble

### ファイルパス

`apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx`

### 型定義

```typescript
/**
 * SuggestionBubble のサイズ。
 * sm: 高さ36px (h-9 text-sm)、アイコン16px
 * md: 高さ44px (h-11 text-sm)、アイコン16px
 * lg: 高さ56px (h-14 text-base)、アイコン20px
 */
export type SuggestionSize = "sm" | "md" | "lg";

export interface SuggestionBubbleProps {
  /** 表示ラベル */
  label: string;
  /** ラベル左に表示するアイコン名 */
  icon?: string;
  /** クリック時コールバック */
  onClick: () => void;
  /** サイズ。デフォルト: "md" */
  size?: SuggestionSize;
  /** 無効化状態。デフォルト: false */
  disabled?: boolean;
  /** 追加 CSS クラス */
  className?: string;
}
```

### 設計判断

| 項目                       | 判断内容                                                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTML 要素                  | `<div>` + `role="button"` + `tabIndex={0}` を使用（`<button>` ではない）。理由: ピル形状のカスタムスタイリングとアニメーション制御の柔軟性を確保するため |
| `success-bounce` 管理      | `useState` + `setTimeout` で管理。クリック後に `isBouncing` state を `true` にし、300ms 後に `false` に戻す                                              |
| `disabled` 時の `tabIndex` | `tabIndex={-1}` にしてフォーカス対象外にする                                                                                                             |
| キーボード操作             | `onKeyDown` で Enter / Space を処理。Space のスクロール防止のため `e.preventDefault()` を実行                                                            |

---

## 6. EmptyState 拡張

### ファイルパス

`apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`

### 型定義

```typescript
/**
 * EmptyState のムード。アイコンカラー・背景・アニメーションを制御する。
 * welcoming: --status-primary アイコン + 薄い青グラデーション
 * encouraging: --status-info アイコン + ニュートラル背景
 * celebrating: --status-success アイコン + success-bounce アニメーション
 */
export type EmptyStateMood = "welcoming" | "encouraging" | "celebrating";

/**
 * EmptyState の action オブジェクト形式。
 * ReactNode 形式と並行して使用可能。
 */
export interface EmptyStateActionObject {
  /** ボタンラベル */
  label: string;
  /** クリック時コールバック */
  onClick: () => void;
  /** ボタンバリアント。デフォルト: "primary" */
  variant?: "primary" | "secondary";
}

/**
 * EmptyState のサジェスト項目。SuggestionBubble で描画される。
 */
export interface EmptyStateSuggestion {
  /** サジェストラベル */
  label: string;
  /** アイコン名 */
  icon?: string;
  /** クリック時コールバック */
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
  /** サジェスト配列（SuggestionBubble で描画） */
  suggestions?: EmptyStateSuggestion[];
  /** コンパクトモード。デフォルト: false */
  compact?: boolean;
  /** ムード（アイコンカラー・アニメーションを制御）。未指定時はニュートラル */
  mood?: EmptyStateMood;
  /** 追加 CSS クラス */
  className?: string;
}
```

### 設計判断

| 項目               | 判断内容                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `action` 型判別    | `React.isValidElement(action)` ではなく、型ガード関数 `isActionObject` で `"label" in action && "onClick" in action` を検証 |
| `suggestions` 描画 | SuggestionBubble コンポーネントをインポートし、`size="sm"` 固定で描画                                                       |
| `mood` 未指定時    | アイコンカラー `--text-muted`、背景変更なし、アニメーションなし                                                             |
| `compact` 実装     | CSS クラスの切替で実現（パディング・フォントサイズ・アイコンサイズを条件分岐）                                              |

### 型ガード関数

```typescript
const isActionObject = (
  action: React.ReactNode | EmptyStateActionObject,
): action is EmptyStateActionObject =>
  action !== null &&
  typeof action === "object" &&
  "label" in action &&
  "onClick" in action;
```

### コンポーネント間依存

| 依存先           | 依存内容                         |
| ---------------- | -------------------------------- |
| SuggestionBubble | `suggestions` props の描画に使用 |
| Button（既存）   | `action` オブジェクト形式の描画  |
| Icon（既存）     | `icon` props の描画              |

---

## 7. RelativeTime

### ファイルパス

`apps/desktop/src/renderer/components/atoms/RelativeTime/index.tsx`

### 型定義

```typescript
/**
 * RelativeTime の表示フォーマット。
 * auto: <1分→"たった今", <1h→"N分前", <24h→"N時間前", <7d→"N日前", >=7d→"YYYY/MM/DD"
 * short: <1分→"今", <1h→"Nm", <24h→"Nh", <7d→"Nd", >=7d→"MM/DD"
 * long: <1分→"たった今", <1h→"N分前", <24h→"N時間前", <2d→"昨日", <7d→"N日前", >=7d→"YYYY年MM月DD日"
 */
export type RelativeTimeFormat = "auto" | "short" | "long";

export interface RelativeTimeProps {
  /** ISO 8601 形式のタイムスタンプ */
  timestamp: string;
  /** 表示フォーマット。デフォルト: "auto" */
  format?: RelativeTimeFormat;
  /** 自動更新間隔（ミリ秒）。デフォルト: 60000 */
  refreshInterval?: number;
  /** ホバー時に絶対時刻ツールチップを表示するか。デフォルト: true */
  showAbsoluteOnHover?: boolean;
  /** 追加 CSS クラス */
  className?: string;
}
```

### 設計判断

| 項目                   | 判断内容                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------- |
| HTML 要素              | `<time>` + `datetime` 属性（セマンティック HTML）                                      |
| 時刻計算ロジック       | `formatRelativeTime(timestamp, format, now)` 純粋関数として分離（テスト容易性のため）  |
| `refreshInterval` 管理 | `useEffect` 内で `setInterval` を管理し、クリーンアップで `clearInterval` を確実に実行 |
| 無効タイムスタンプ判定 | `new Date(timestamp).getTime()` が `NaN` の場合にフォールバック `"--"` を返す          |
| `title` 属性           | `showAbsoluteOnHover` が `true` の場合に `YYYY/MM/DD HH:mm:ss` 形式の絶対時刻を設定    |

### フォーマット変換テーブル

| 経過時間 | auto         | short   | long             |
| -------- | ------------ | ------- | ---------------- |
| < 1分    | "たった今"   | "今"    | "たった今"       |
| < 1時間  | "N分前"      | "Nm"    | "N分前"          |
| < 24時間 | "N時間前"    | "Nh"    | "N時間前"        |
| < 2日    | "1日前"      | "1d"    | "昨日"           |
| < 7日    | "N日前"      | "Nd"    | "N日前"          |
| >= 7日   | "YYYY/MM/DD" | "MM/DD" | "YYYY年MM月DD日" |

---

## atoms/index.ts エクスポート設計

### ファイルパス

`apps/desktop/src/renderer/components/atoms/index.ts`

### 新規追加エクスポート

```typescript
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

---

## 推奨実装順序

| 順序 | コンポーネント                                          | 理由                                 |
| ---- | ------------------------------------------------------- | ------------------------------------ |
| 1    | StatusIndicator, FilterChip, SkeletonCard, RelativeTime | 独立、並列実装可能                   |
| 2    | Badge                                                   | 独立、並列実装可能                   |
| 3    | SuggestionBubble                                        | 独立だが EmptyState の前に完了が必要 |
| 4    | EmptyState                                              | SuggestionBubble に依存              |
