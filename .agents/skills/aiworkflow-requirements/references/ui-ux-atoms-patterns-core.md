# Atoms コンポーネント実装パターンガイド / core specification

> 親仕様書: [ui-ux-atoms-patterns.md](ui-ux-atoms-patterns.md)
> 役割: core specification

## 概要

7つのAtoms（StatusIndicator, FilterChip, Badge, SkeletonCard, SuggestionBubble, EmptyState, RelativeTime）の実装から抽出したパターン集。新規5コンポーネント + 既存2拡張、156テスト全PASS、カバレッジ100%を達成した知見をまとめた。

## 1. コンポーネント設計パターン

### 1.1 Props駆動設計（P31対策）

**原則**: Atoms層はZustand Storeに依存しない。全ての状態とハンドラーはPropsで受け取る。

```typescript
// ✅ Props駆動（推奨）
export interface StatusIndicatorProps {
  status: "running" | "success" | "error" | "warning" | "idle" | "offline";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  label?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, size = "md", ... }) => {
  // Store参照なし。全てPropsから受け取る
  return <span role="status" aria-label={label ?? `ステータス: ${status}`} />;
};

// ❌ Store依存（非推奨）
const StatusIndicator = () => {
  const { status } = useStatusStore(); // Atoms層でStore参照は禁止
  return <span>{status}</span>;
};
```

**メリット**:
- P31（合成Store Hook無限ループ）を回避
- 再利用性向上（任意のデータソースから利用可能）
- テスト容易性向上（Store モックが不要）

### 1.2 Record型バリアント定義

**パターン**: `Record<NonNullable<Props["variant"]>, string>` で全バリアントを網羅する。

```typescript
export interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

// ✅ Record型で全バリアント網羅
const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
  primary: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  success: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  warning: "bg-[var(--status-warning)] text-[var(--text-inverse)]",
  error: "bg-[var(--status-error)] text-[var(--text-inverse)]",
  info: "bg-[var(--status-info)] text-[var(--text-inverse)]",
};

const sizeStyles: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-2 py-0.5 text-xs h-5",
  md: "px-2.5 py-1 text-sm h-6",
};
```

**メリット**:
- TypeScriptが不足バリアントを検出（コンパイル時にエラー）
- `variantStyles[variant]` で安全にアクセス可能
- メンテナンス性向上（バリアント追加時に型エラーで気付ける）

### 1.3 モジュールスコープ定数抽出

**パターン**: スタイルマッピングはコンポーネント外で定義し、テストからも参照可能にする。

```typescript
// ✅ モジュールスコープ定数（コンポーネント外）
const statusColorMap: Record<StatusIndicatorProps["status"], string> = {
  running: "bg-[var(--status-primary)]",
  success: "bg-[var(--status-success)]",
  // ...
};

const sizeMap: Record<NonNullable<StatusIndicatorProps["size"]>, string> = {
  sm: "w-2 h-2",
  md: "w-[10px] h-[10px]",
  lg: "w-[14px] h-[14px]",
};

// コンポーネント内で参照
const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, size = "md" }) => {
  return <span className={clsx(statusColorMap[status], sizeMap[size])} />;
};
```

**テストでの活用**:

```typescript
// テスト側でも同じ定数を参照（DRY原則）
import { statusColorMap } from "./StatusIndicator";

it("正しいstatusカラーを適用する", () => {
  render(<StatusIndicator status="success" />);
  const span = screen.getByRole("status");
  expect(span).toHaveClass(statusColorMap["success"]); // "bg-[var(--status-success)]"
});
```

**メリット**:
- React再レンダー時にオブジェクト再生成を回避（パフォーマンス向上）
- テストコードで長いCSS変数文字列をハードコード不要
- 単一責務原則に準拠（スタイルマッピングロジックをコンポーネントから分離）

### 1.4 React.memo + forwardRef + displayName

**パターン**: 全Atomsコンポーネントは`React.memo`でメモ化し、`forwardRef`でref転送をサポートし、DevTools用の`displayName`を設定する。

```typescript
// ✅ 完全なパターン（Badge の例）
import React, { forwardRef, memo } from "react";

export interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  children?: React.ReactNode;
  content?: string | number;
}

export const Badge = memo(
  forwardRef<HTMLSpanElement, BadgeProps>(
    ({ variant = "default", size = "md", className, children, content, ...props }, ref) => {
      return (
        <span ref={ref} className={clsx(variantStyles[variant], sizeStyles[size], className)} {...props}>
          {children ?? (content !== undefined ? String(content) : undefined)}
        </span>
      );
    },
  ),
);

Badge.displayName = "Badge";
```

**メリット**:
- `memo`: Props不変時の再レンダー防止
- `forwardRef`: 親コンポーネントからref経由でDOM要素にアクセス可能
- `displayName`: React DevToolsで「ForwardRef(Component)」ではなく「Badge」と表示

### 1.5 Props命名の仕様-実装間ドリフト防止

**教訓**: Phase 3設計レビューでProps命名を仕様書と実装で突合チェックする。

**失敗事例**: RelativeTime で仕様書 `updateInterval` vs 実装 `refreshInterval` の不整合が発生。

**対策**:
- Phase 3チェックリストに「Props命名突合」項目を追加
- 仕様書の型定義と実装のinterface定義を並べて比較
- TypeScriptコンパイルだけでは検出不可能な命名ドリフトを目視確認

## 2. デザイントークン連携パターン

### 2.1 CSS変数 + Tailwind Arbitrary Values

**パターン**: ハードコードカラーを全廃し、CSS変数を`bg-[var(--token)]`形式で参照する。

```typescript
// ❌ ハードコードカラー（非推奨）
const variantStyles = {
  primary: "bg-blue-600 text-white",
  success: "bg-green-600 text-white",
};

// ✅ CSS変数参照（推奨）
const variantStyles = {
  primary: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  success: "bg-[var(--status-success)] text-[var(--text-inverse)]",
};
```

**メリット**:
- テーマ切替（kanagawa-dragon/light/dark/system）がCSS変数の値変更のみで完結
- TypeScriptコードにテーマ固有ロジック0件を達成
- デザイントークンの単一責務原則に準拠

### 2.2 StatusIndicator カラーマッピング

| status    | CSS変数              | 用途                                   |
| --------- | -------------------- | -------------------------------------- |
| running   | `--status-primary`   | 実行中（パルスアニメーション付き）     |
| success   | `--status-success`   | 成功                                   |
| error     | `--status-error`     | エラー                                 |
| warning   | `--status-warning`   | 警告                                   |
| idle      | `--text-muted`       | 待機                                   |
| offline   | `--text-muted`       | オフライン（破線ボーダー付き）         |

### 2.3 EmptyState mood機能のSemanticトークン

```typescript
const moodStyles = {
  welcoming: { icon: "var(--accent)", bg: "var(--bg-secondary)" },
  encouraging: { icon: "var(--status-info)", bg: "var(--bg-secondary)" },
  celebrating: { icon: "var(--status-success)", bg: "var(--bg-secondary)" },
};
```

**実装**: `mood="celebrating"` 時はアイコンに `animate-bounce` を追加し、成功体験を視覚化する。

## 3. 苦戦箇所と解決策

### 3.1 HTMLAttributes Props型衝突（P46）

**症状**: `content` が HTML標準の `string` と カスタムの `string | number` で衝突し、TS2430エラーが発生する。

```typescript
// ❌ TS2430エラー
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  content?: string | number; // HTML標準の content: string と衝突
}

// ✅ Omit で衝突属性を除外
interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  content?: string | number;
}
```

**衝突しやすい属性リスト**:
- `content` (HTMLElement全般)
- `color` (HTMLFontElement等)
- `translate` (HTMLElement全般)
- `hidden` (HTMLElement全般、boolean型と衝突)
- `title` (独自の複雑な型定義を持つ場合)
- `dir`, `slot` (HTMLElement全般)

**対策**:
- Phase 3設計レビュー時にHTMLAttributes継承コンポーネントのProps名をチェック
- HTML標準属性一覧（MDN参照）と突合
- コンパイルエラーが出た時点で即座にOmitで除外

### 3.2 Props命名の仕様-実装間ドリフト

**症状**: Phase 4仕様書に `updateInterval` と記載したが、Phase 5実装時に `refreshInterval` と命名し、ドキュメント不整合が発生。

**解決策**:
- Phase 3設計レビューでProps命名を最終確定し、仕様書に明記
- Phase 5実装時は仕様書の型定義をコピー&ペーストして使用
- Phase 10最終レビューでProps命名の一致を確認

### 3.3 CSS変数ベースのテストアサーション

**症状**: `expect(element).toHaveClass("bg-[var(--status-primary)]")` のような長い文字列比較が必要になり、テストコードが冗長化。

**解決策**: モジュールスコープ定数をテスト側でもimportして参照する（セクション1.3参照）。

```typescript
import { statusColorMap } from "./StatusIndicator";

it("running ステータスは --status-primary を参照する", () => {
  render(<StatusIndicator status="running" />);
  expect(screen.getByRole("status")).toHaveClass(statusColorMap["running"]);
});
```

### 3.4 happy-dom環境での userEvent 非互換（P39再確認）

**症状**: `@testing-library/user-event` の `userEvent.setup()` が Symbol 操作エラー（`Symbol(Node prepared with document state workarounds)`）を起こし、49/53テストが一斉に失敗。

**解決策**: happy-dom環境では `fireEvent` を使用し、非同期ハンドラは `act` で包む。

```typescript
import { fireEvent } from "@testing-library/react";
import { act } from "react";

// ❌ happy-domで失敗
const user = userEvent.setup();
await user.click(element);

// ✅ happy-domで安定
fireEvent.click(element);

// ✅ 非同期ハンドラ
await act(async () => {
  fireEvent.click(element);
});
```

**再発防止**: テスト追加時は必ず `pnpm vitest run` で実行確認。happy-dom環境では `userEvent` 使用禁止。

### 3.5 タイマーテストの無限ループ（P13再確認）

**症状**: `vi.runAllTimers()` で `setInterval` + Promise + 再スケジュールのパターンが無限ループする（RelativeTime テスト）。

**解決策**: `vi.advanceTimersByTime(ms)` で指定時間ずつ進行する。

```typescript
import { vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("60秒後に表示が更新される", () => {
  render(<RelativeTime timestamp="2026-02-23T10:00:00Z" refreshInterval={60000} />);

  // ❌ 無限ループ
  vi.runAllTimers();

  // ✅ 60秒だけ進める
  act(() => {
    vi.advanceTimersByTime(60000);
  });

  expect(screen.getByText(/1分前/)).toBeInTheDocument();
});
```

**cleanup必須**: `setInterval` を登録するコンポーネントは `afterEach` で `cleanup()` を呼び出す。

### 3.6 テスト実行ディレクトリ依存（P40再確認）

**症状**: プロジェクトルートから `pnpm vitest run apps/desktop/src/...` を実行すると、`apps/desktop/vitest.config.ts` の `environment: "happy-dom"` 設定が読み込まれず `document is not defined` エラーが発生。

**解決策**: テストは必ず `apps/desktop` ディレクトリから実行する。

```bash
# ❌ プロジェクトルートから実行（失敗）
pnpm vitest run apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx

# ✅ apps/desktop から実行（成功）
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/Badge/Badge.test.tsx

# ✅ pnpm --filter による実行（代替）
pnpm --filter @repo/desktop exec vitest run src/renderer/components/atoms/Badge/Badge.test.tsx
```

## 4. アクセシビリティ実装知見

### 4.1 aria-label自動生成パターン

**Badge**: `content` が `number` 型の場合、`aria-label="${content}件"` を自動付与する。

```typescript
const ariaProps: Record<string, string> = {};
if (typeof content === "number" && !props["aria-label"]) {
  ariaProps["aria-label"] = `${content}件`;
}

return <span role="status" {...ariaProps} {...props}>{displayContent}</span>;
```

**メリット**:
- スクリーンリーダーが「42」ではなく「42件」と読み上げ
- ユーザー側で明示的に `aria-label` を渡した場合は上書き可能

### 4.2 role="status" + aria-busy

**SkeletonCard**: ローディング状態を `role="status"` + `aria-busy="true"` で伝達する。

```typescript
<div role="status" aria-label="読み込み中" aria-busy="true" className={clsx("animate-pulse")}>
  {/* skeleton UI */}
</div>
```

### 4.3 キーボード操作

**FilterChip**: `<button role="checkbox">` を使用して標準動作を活用。

```typescript
<button
  role="checkbox"
  aria-checked={isSelected}
  aria-disabled={disabled}
  onClick={onClick}
>
  {label}
</button>
```

**SuggestionBubble**: `<div role="button">` + `onKeyDown` でEnter/Spaceキー対応。

```typescript
<div
  role="button"
  tabIndex={disabled ? -1 : 0}
  aria-disabled={disabled}
  onClick={disabled ? undefined : onClick}
  onKeyDown={(e) => {
    if (!disabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  }}
>
  {label}
</div>
```

### 4.4 コントラスト比判断

**判断基準**: WCAG 2.1 AA
- 通常テキスト（14px未満）: 4.5:1 以上
- 大きいテキスト（18px以上）: 3:1 以上
- UIコンポーネント（アイコン・ボーダー）: 3:1 以上

**検証方法**: Chrome DevTools Lighthouse または WebAIM Contrast Checker で確認。

