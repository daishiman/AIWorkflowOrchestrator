# アクセシビリティ設計 — Phase 2 成果物

## 概要

7コンポーネントの WCAG 2.1 AA 準拠アクセシビリティ実装パターン。ARIA 属性、キーボード操作、フォーカス管理、スクリーンリーダー対応を定義する。

## 1. ARIA 属性実装パターン

### 1-1. StatusIndicator

```tsx
<span
  role="status"
  aria-label={label ?? `ステータス: ${status}`}
  className={clsx(
    "inline-block rounded-full",
    sizeMap[size ?? "md"],
    statusColorMap[status],
    pulseClass,
    className,
  )}
/>
```

| 属性         | 値                                                 | 説明                                       |
| ------------ | -------------------------------------------------- | ------------------------------------------ |
| `role`       | `"status"`                                         | ライブリージョンとしてステータス情報を伝達 |
| `aria-label` | `label` props、未指定時は `"ステータス: {status}"` | スクリーンリーダー読み上げ用               |

### 1-2. FilterChip

```tsx
<button
  role="checkbox"
  aria-checked={isSelected}
  aria-disabled={disabled || undefined}
  disabled={disabled}
  onClick={disabled ? undefined : onClick}
  className={clsx(
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)]",
    "transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]",
    "focus-visible:outline-2 focus-visible:outline-[var(--status-primary)] focus-visible:outline-offset-2",
    isSelected
      ? "bg-[var(--status-primary)] text-[var(--text-inverse)]"
      : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
    disabled && "opacity-50 cursor-not-allowed",
    className,
  )}
>
  {icon && <Icon name={icon} size={16} />}
  {label}
  {count !== undefined && <span className="text-xs opacity-70">({count})</span>}
</button>
```

| 属性            | 値                              | 説明                                           |
| --------------- | ------------------------------- | ---------------------------------------------- |
| `role`          | `"checkbox"`                    | フィルターの選択/非選択状態を表現              |
| `aria-checked`  | `{isSelected}`                  | 選択状態をスクリーンリーダーに通知             |
| `aria-disabled` | `{disabled}` または `undefined` | 無効状態の通知（`undefined` で属性自体を省略） |
| `disabled`      | `{disabled}`                    | HTML ネイティブの無効化                        |

### 1-3. Badge（拡張後）

```tsx
<span
  ref={ref}
  role="status"
  aria-label={
    props["aria-label"] ??
    (typeof content === "number" ? `${content}件` : undefined)
  }
  data-variant={variant}
  className={clsx(
    "inline-flex items-center justify-center font-medium",
    sizeStyles[size ?? "md"],
    variantStyles[variant ?? "default"],
    className,
  )}
  {...restProps}
>
  {children ?? content}
</span>
```

| 属性           | 値                                                    | 説明                                   |
| -------------- | ----------------------------------------------------- | -------------------------------------- |
| `role`         | `"status"`                                            | バッジ情報をライブリージョンとして伝達 |
| `aria-label`   | 明示指定 > `"{content}件"`（number 時） > `undefined` | 優先順位に従い自動設定                 |
| `data-variant` | `{variant}`                                           | テスト用カスタム属性                   |

### 1-4. SkeletonCard

```tsx
<div
  role="status"
  aria-label="読み込み中"
  aria-busy="true"
  className={clsx(
    "rounded-[var(--radius-md)] bg-[var(--bg-tertiary)]",
    animateClass,
    className,
  )}
  style={{ height, borderRadius }}
>
  {renderVariant(variant ?? "default")}
</div>
```

| 属性         | 値             | 説明                                         |
| ------------ | -------------- | -------------------------------------------- |
| `role`       | `"status"`     | ローディング状態をライブリージョンとして伝達 |
| `aria-label` | `"読み込み中"` | 固定テキスト                                 |
| `aria-busy`  | `"true"`       | コンテンツがまだ準備中であることを通知       |

### 1-5. SuggestionBubble

```tsx
<div
  role="button"
  tabIndex={disabled ? -1 : 0}
  aria-disabled={disabled || undefined}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  className={clsx(
    "inline-flex items-center gap-2 px-4 rounded-[var(--radius-full)]",
    "border border-[var(--border-subtle)]",
    "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
    "focus-visible:outline-2 focus-visible:outline-[var(--status-primary)] focus-visible:outline-offset-2",
    sizeConfig[size ?? "md"].class,
    interactionClasses,
    bounceClass,
    className,
  )}
>
  {icon && <Icon name={icon} size={sizeConfig[size ?? "md"].iconSize} />}
  {label}
</div>
```

| 属性            | 値                              | 説明                                   |
| --------------- | ------------------------------- | -------------------------------------- |
| `role`          | `"button"`                      | ボタンの意図をスクリーンリーダーに伝達 |
| `tabIndex`      | `disabled ? -1 : 0`             | 無効時はフォーカス対象外               |
| `aria-disabled` | `{disabled}` または `undefined` | 無効状態の通知                         |

### 1-6. EmptyState（拡張後）

```tsx
<div
  className={clsx(
    "flex flex-col items-center justify-center text-center",
    compact ? "p-5" : "p-8",
    moodStyles[mood ?? "welcoming"] ?? "",
    className,
  )}
  style={moodInlineStyle}
>
  {icon && (
    <Icon
      name={icon}
      size={compact ? 32 : 48}
      className={clsx(
        mood === "welcoming" && "text-[var(--status-primary)]",
        mood === "encouraging" && "text-[var(--status-info)]",
        mood === "celebrating" && "text-[var(--status-success)]",
        !mood && "text-[var(--text-muted)]",
      )}
    />
  )}
  <h3 className={clsx("mt-3 font-semibold", compact ? "text-base" : "text-lg")}>
    {title}
  </h3>
  {description && (
    <p
      className={clsx(
        "mt-1 text-[var(--text-secondary)]",
        compact ? "text-xs" : "text-sm",
      )}
    >
      {description}
    </p>
  )}
  {action && (
    <div className="mt-4">
      {isActionObject(action) ? (
        <Button variant={action.variant ?? "primary"} onClick={action.onClick}>
          {action.label}
        </Button>
      ) : (
        action
      )}
    </div>
  )}
  {suggestions && suggestions.length > 0 && (
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
  )}
</div>
```

| 属性                  | 値  | 説明                                                                |
| --------------------- | --- | ------------------------------------------------------------------- |
| なし（ARIA 追加不要） | -   | 自然な文書構造（h3 + p + button）でスクリーンリーダーが読み上げ可能 |

### 1-7. RelativeTime

```tsx
<time
  dateTime={timestamp}
  title={showAbsoluteOnHover ? formatAbsolute(timestamp) : undefined}
  className={className}
>
  {displayText}
</time>
```

| 属性       | 値                                                    | 説明                                                 |
| ---------- | ----------------------------------------------------- | ---------------------------------------------------- |
| `dateTime` | `{timestamp}`                                         | ISO 8601 形式のタイムスタンプ（セマンティック HTML） |
| `title`    | `showAbsoluteOnHover` 時に `YYYY/MM/DD HH:mm:ss` 形式 | ホバー時ツールチップ                                 |

---

## 2. キーボード操作設計

### 2-1. SuggestionBubble

`<div>` + `role="button"` のため、キーボードイベントを明示的にハンドリングする必要がある。

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (disabled) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault(); // Space のスクロール防止
    handleClick();
  }
};
```

| キー  | 動作           | 補足                                  |
| ----- | -------------- | ------------------------------------- |
| Enter | `onClick` 発火 |                                       |
| Space | `onClick` 発火 | `e.preventDefault()` でスクロール防止 |
| Tab   | フォーカス移動 | ブラウザネイティブ                    |

### 2-2. FilterChip

`<button>` 要素のため、ブラウザネイティブのキーボード操作が適用される。

| キー  | 動作                       | 補足               |
| ----- | -------------------------- | ------------------ |
| Enter | `onClick` 発火（選択切替） | ブラウザネイティブ |
| Space | `onClick` 発火（選択切替） | ブラウザネイティブ |
| Tab   | フォーカス移動             | ブラウザネイティブ |

追加の `onKeyDown` ハンドラは不要。

---

## 3. フォーカス管理

### フォーカスリング仕様

全インタラクティブコンポーネント（FilterChip, SuggestionBubble）に共通のフォーカスリングスタイルを適用する。

| プロパティ       | 値                                | 説明                                               |
| ---------------- | --------------------------------- | -------------------------------------------------- |
| `outline`        | `2px solid var(--status-primary)` | アクセントカラーのフォーカスリング                 |
| `outline-offset` | `2px`                             | 要素とリングの間隔                                 |
| 適用条件         | `:focus-visible`                  | マウスクリック時は非表示、キーボード操作時のみ表示 |

### Tailwind クラス

```
focus-visible:outline-2 focus-visible:outline-[var(--status-primary)] focus-visible:outline-offset-2
```

### コンポーネント別フォーカス管理

| コンポーネント   | 要素       | tabIndex           | disabled 時                                             |
| ---------------- | ---------- | ------------------ | ------------------------------------------------------- |
| FilterChip       | `<button>` | 自動（ネイティブ） | `disabled` 属性でフォーカス除外                         |
| SuggestionBubble | `<div>`    | `0`（明示設定）    | `tabIndex={-1}` でフォーカス除外                        |
| StatusIndicator  | `<span>`   | なし               | インタラクティブでないため不要                          |
| Badge            | `<span>`   | なし               | インタラクティブでないため不要                          |
| SkeletonCard     | `<div>`    | なし               | インタラクティブでないため不要                          |
| EmptyState       | `<div>`    | なし               | 内部の SuggestionBubble / Button が個別にフォーカス管理 |
| RelativeTime     | `<time>`   | なし               | インタラクティブでないため不要                          |

---

## 4. コントラスト比要件

### WCAG 2.1 AA 準拠チェックリスト

| 組み合わせ                             | 最小コントラスト比 | 対象                                   |
| -------------------------------------- | ------------------ | -------------------------------------- |
| `--text-primary` on `--bg-primary`     | 4.5:1              | 通常テキスト                           |
| `--text-secondary` on `--bg-tertiary`  | 4.5:1              | FilterChip 非選択テキスト              |
| `--text-inverse` on `--status-primary` | 4.5:1              | FilterChip 選択テキスト、Badge primary |
| `--text-muted`（idle/offline ドット）  | 3:1                | UI 部品（StatusIndicator ドット）      |
| `--status-*` カラー                    | 3:1                | UI 部品（StatusIndicator ドット）      |

---

## 5. スクリーンリーダー対応

| コンポーネント   | 読み上げ内容                                                            |
| ---------------- | ----------------------------------------------------------------------- |
| StatusIndicator  | `label` props の値、または `"ステータス: {status}"`                     |
| FilterChip       | `"{label}"` + 選択状態（`aria-checked` による）                         |
| Badge            | `content` の値、number の場合は `"{content}件"`                         |
| SkeletonCard     | `"読み込み中"`（`aria-busy="true"` で処理中を通知）                     |
| SuggestionBubble | `{label}` テキスト内容                                                  |
| EmptyState       | 見出し（h3）+ 説明（p）+ アクション（button）が自然な文書構造で読み上げ |
| RelativeTime     | `<time>` 要素の `datetime` 属性 + テキスト内容                          |
