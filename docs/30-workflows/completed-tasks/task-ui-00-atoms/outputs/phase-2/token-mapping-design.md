# デザイントークンマッピング設計 — Phase 2 成果物

## 概要

7コンポーネントが使用する CSS 変数デザイントークンと Tailwind クラスの対応関係を定義する。全コンポーネントは CSS 変数経由でカラーを参照し、3テーマ（kanagawa-dragon / light / dark）横断で動作する。

## 1. StatusIndicator カラーマッピング

### ステータス別カラー対応

| ステータス | CSS 変数                | Tailwind arbitrary value     | 備考                                             |
| ---------- | ----------------------- | ---------------------------- | ------------------------------------------------ |
| `running`  | `var(--status-primary)` | `bg-[var(--status-primary)]` | pulse アニメーション対象                         |
| `success`  | `var(--status-success)` | `bg-[var(--status-success)]` |                                                  |
| `error`    | `var(--status-error)`   | `bg-[var(--status-error)]`   |                                                  |
| `warning`  | `var(--status-warning)` | `bg-[var(--status-warning)]` |                                                  |
| `idle`     | `var(--text-muted)`     | `bg-[var(--text-muted)]`     |                                                  |
| `offline`  | `var(--text-muted)`     | `bg-[var(--text-muted)]`     | 追加: `border-dashed border-[var(--text-muted)]` |

### 実装コード例

```typescript
const statusColorMap: Record<StatusType, string> = {
  running: "bg-[var(--status-primary)]",
  success: "bg-[var(--status-success)]",
  error: "bg-[var(--status-error)]",
  warning: "bg-[var(--status-warning)]",
  idle: "bg-[var(--text-muted)]",
  offline:
    "bg-[var(--text-muted)] border border-dashed border-[var(--text-muted)]",
};
```

---

## 2. Badge variant カラーマッピング

### Tailwind 標準クラスから CSS 変数への移行

| variant   | 現行 Tailwind クラス | 移行先 CSS 変数                                         |
| --------- | -------------------- | ------------------------------------------------------- |
| `default` | `bg-gray-600`        | `bg-[var(--bg-tertiary)] text-[var(--text-secondary)]`  |
| `primary` | （新規追加）         | `bg-[var(--status-primary)] text-[var(--text-inverse)]` |
| `success` | `bg-green-500`       | `bg-[var(--status-success)] text-[var(--text-inverse)]` |
| `warning` | `bg-orange-400`      | `bg-[var(--status-warning)] text-[var(--text-inverse)]` |
| `error`   | `bg-red-500`         | `bg-[var(--status-error)] text-[var(--text-inverse)]`   |
| `info`    | `bg-blue-500`        | `bg-[var(--status-info)] text-[var(--text-inverse)]`    |

### 実装コード例

```typescript
const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
  primary: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  success: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  warning: "bg-[var(--status-warning)] text-[var(--text-inverse)]",
  error: "bg-[var(--status-error)] text-[var(--text-inverse)]",
  info: "bg-[var(--status-info)] text-[var(--text-inverse)]",
};
```

### テスト検証方針

Tailwind arbitrary value クラス（`bg-[var(--status-success)]`）のアサーションが不安定な場合は、`data-variant` カスタム属性をテスト用に付与し、以下のように検証する:

```typescript
expect(badge).toHaveAttribute("data-variant", "success");
```

---

## 3. FilterChip カラーマッピング

### 状態別カラー

| 状態     | 背景                              | テキスト                       | ボーダー |
| -------- | --------------------------------- | ------------------------------ | -------- |
| 非選択   | `bg-[var(--bg-tertiary)]`         | `text-[var(--text-secondary)]` | なし     |
| 選択     | `bg-[var(--status-primary)]`      | `text-[var(--text-inverse)]`   | なし     |
| disabled | 非選択/選択に `opacity-50` を付加 | 同上                           | なし     |

### トランジション

```
transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]
```

---

## 4. サイズトークンマッピング

### StatusIndicator サイズ

| サイズ | ドット直径 | Tailwind クラス |
| ------ | ---------- | --------------- |
| `sm`   | 8px        | `w-2 h-2`       |
| `md`   | 10px       | `w-2.5 h-2.5`   |
| `lg`   | 14px       | `w-3.5 h-3.5`   |

### 実装コード例

```typescript
const sizeMap: Record<StatusSize, string> = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3.5 h-3.5",
};
```

### SuggestionBubble サイズ

| サイズ | 高さ | テキスト    | アイコン | Tailwind クラス  |
| ------ | ---- | ----------- | -------- | ---------------- |
| `sm`   | 36px | `text-sm`   | 16px     | `h-9 text-sm`    |
| `md`   | 44px | `text-sm`   | 16px     | `h-11 text-sm`   |
| `lg`   | 56px | `text-base` | 20px     | `h-14 text-base` |

### 実装コード例

```typescript
const sizeConfig: Record<SuggestionSize, { class: string; iconSize: number }> =
  {
    sm: { class: "h-9 text-sm", iconSize: 16 },
    md: { class: "h-11 text-sm", iconSize: 16 },
    lg: { class: "h-14 text-base", iconSize: 20 },
  };
```

### EmptyState 通常 vs コンパクト

| 要素           | 通常          | コンパクト    |
| -------------- | ------------- | ------------- |
| パディング     | `p-8`（32px） | `p-5`（20px） |
| アイコンサイズ | 48px          | 32px          |
| 見出しフォント | `text-lg`     | `text-base`   |
| 説明文フォント | `text-sm`     | `text-xs`     |

### 実装コード例

```typescript
const compactStyles = compact ? "p-5" : "p-8";

const titleStyles = compact ? "text-base" : "text-lg";

const descriptionStyles = compact ? "text-xs" : "text-sm";

const iconSize = compact ? 32 : 48;
```

---

## 5. SkeletonCard トークン

### カラー

| 要素                 | CSS 変数             | 用途                     |
| -------------------- | -------------------- | ------------------------ |
| 外枠背景             | `var(--bg-tertiary)` | カード背景               |
| 内部プレースホルダー | `var(--bg-tertiary)` | 疑似テキスト・図形の背景 |
| 角丸                 | `var(--radius-md)`   | デフォルト角丸           |

---

## 6. SuggestionBubble トークン

### インタラクション状態

| 状態               | トークン                                          | 値         |
| ------------------ | ------------------------------------------------- | ---------- |
| 通常背景           | `var(--bg-tertiary)`                              | テーマ依存 |
| 通常テキスト       | `var(--text-primary)`                             | テーマ依存 |
| 通常ボーダー       | `var(--border-subtle)`                            | テーマ依存 |
| ホバー背景         | `var(--bg-elevated)`                              | テーマ依存 |
| ホバースケール     | `var(--scale-hover)`                              | 定義済み   |
| ホバー影           | `var(--shadow-sm)`                                | 定義済み   |
| アクティブスケール | `var(--scale-active)`                             | 定義済み   |
| トランジション     | `var(--duration-default)` + `var(--ease-default)` | 定義済み   |
| 角丸               | `var(--radius-full)`                              | ピル形状   |

---

## 7. EmptyState mood カラー

| mood          | アイコンカラー          | 背景                                                                            | アニメーション   |
| ------------- | ----------------------- | ------------------------------------------------------------------------------- | ---------------- |
| 未指定        | `var(--text-muted)`     | 変更なし                                                                        | なし             |
| `welcoming`   | `var(--status-primary)` | `radial-gradient(circle, var(--status-primary) 0%, transparent 70%)` opacity 5% | なし             |
| `encouraging` | `var(--status-info)`    | 変更なし                                                                        | なし             |
| `celebrating` | `var(--status-success)` | 変更なし                                                                        | `success-bounce` |

---

## 8. デザイントークン依存マトリクス

### カラートークン

| トークン           | SI  | FC  | BD  | SK  | SB  | ES  | RT  |
| ------------------ | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| `--bg-tertiary`    |     |  o  |  o  |  o  |  o  |     |     |
| `--bg-elevated`    |     |     |     |     |  o  |     |     |
| `--text-primary`   |     |     |     |     |  o  |     |  o  |
| `--text-secondary` |     |  o  |  o  |     |  o  |     |     |
| `--text-muted`     |  o  |     |     |     |     |  o  |     |
| `--text-inverse`   |     |  o  |  o  |     |     |     |     |
| `--border-subtle`  |     |     |     |     |  o  |     |     |
| `--status-primary` |  o  |  o  |  o  |     |     |  o  |     |
| `--status-success` |  o  |     |  o  |     |     |  o  |     |
| `--status-warning` |  o  |     |  o  |     |     |     |     |
| `--status-error`   |  o  |     |  o  |     |     |     |     |
| `--status-info`    |     |     |  o  |     |     |  o  |     |

凡例: SI=StatusIndicator, FC=FilterChip, BD=Badge, SK=SkeletonCard, SB=SuggestionBubble, ES=EmptyState, RT=RelativeTime

### アニメーション・レイアウトトークン

| トークン             | 使用コンポーネント                                      |
| -------------------- | ------------------------------------------------------- |
| `--radius-full`      | FilterChip, SuggestionBubble                            |
| `--radius-md`        | SkeletonCard                                            |
| `--duration-fast`    | FilterChip                                              |
| `--duration-default` | Badge, SuggestionBubble                                 |
| `--ease-default`     | FilterChip, SuggestionBubble                            |
| `--scale-hover`      | SuggestionBubble                                        |
| `--scale-active`     | SuggestionBubble                                        |
| `--shadow-sm`        | SuggestionBubble                                        |
| `success-bounce`     | SuggestionBubble（タップ後）, EmptyState（celebrating） |
