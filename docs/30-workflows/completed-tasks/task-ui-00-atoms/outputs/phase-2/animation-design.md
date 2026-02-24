# アニメーション設計 — Phase 2 成果物

## 概要

4コンポーネント（StatusIndicator, SkeletonCard, SuggestionBubble, EmptyState）のアニメーション設計。CSS キーフレーム、Tailwind 設定、状態管理パターンを定義する。

## 1. StatusIndicator pulse アニメーション

### 仕様

| 項目             | 値                                          |
| ---------------- | ------------------------------------------- |
| アニメーション名 | `pulse`                                     |
| 周期             | 1.5秒                                       |
| イージング       | `var(--ease-default)`                       |
| 繰り返し         | 無限（`infinite`）                          |
| デフォルト有効   | `status === "running"` の場合のみ           |
| props 制御       | `pulse` props で明示的に有効/無効を切替可能 |

### @keyframes 定義

```css
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.15);
  }
}
```

### 実装コード

```typescript
// pulse の判定ロジック
const shouldPulse = pulse ?? status === "running";

// Tailwind arbitrary value でアニメーション適用
const pulseClass = shouldPulse
  ? "animate-[pulse_1.5s_var(--ease-default)_infinite]"
  : "";
```

### tailwind.config.ts 設定

```typescript
// tailwind.config.ts - extend セクション
keyframes: {
  pulse: {
    "0%, 100%": { opacity: "1", transform: "scale(1)" },
    "50%": { opacity: "0.6", transform: "scale(1.15)" },
  },
},
animation: {
  pulse: "pulse 1.5s var(--ease-default) infinite",
},
```

> 注: Tailwind 標準の `animate-pulse` は opacity のみのアニメーション。StatusIndicator では `scale` + `opacity` の組み合わせが望ましいため、カスタム定義を使用する。

### テスト検証

```typescript
it("running ステータスでデフォルト pulse アニメーションが適用される", () => {
  render(<StatusIndicator status="running" />);
  const dot = screen.getByRole("status");
  expect(dot.className).toContain("animate-");
});

it("pulse={false} でアニメーションが無効化される", () => {
  render(<StatusIndicator status="running" pulse={false} />);
  const dot = screen.getByRole("status");
  expect(dot.className).not.toContain("animate-");
});
```

---

## 2. SkeletonCard skeleton-pulse アニメーション

### 仕様

| 項目             | 値                                    |
| ---------------- | ------------------------------------- |
| アニメーション名 | `skeleton-pulse`                      |
| 周期             | 1.5秒                                 |
| イージング       | `ease-in-out`                         |
| 繰り返し         | 無限（`infinite`）                    |
| opacity 範囲     | 0.4 から 1.0                          |
| デフォルト有効   | `animate` props のデフォルト値 `true` |
| 無効化           | `animate={false}` で停止              |

### @keyframes 定義

```css
@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
```

### tailwind.config.ts 設定

```typescript
// tailwind.config.ts - extend セクション
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

### 実装コード

```typescript
// animate の判定ロジック
const animateClass = animate !== false ? "animate-skeleton-pulse" : "";
```

または Tailwind arbitrary value を使用:

```typescript
const animateClass =
  animate !== false ? "animate-[skeleton-pulse_1.5s_ease-in-out_infinite]" : "";
```

### テスト検証

```typescript
it("デフォルトでアニメーションクラスが適用される", () => {
  render(<SkeletonCard />);
  const skeleton = screen.getByRole("status");
  expect(skeleton.className).toContain("animate-");
});

it("animate={false} でアニメーションが無効化される", () => {
  render(<SkeletonCard animate={false} />);
  const skeleton = screen.getByRole("status");
  expect(skeleton.className).not.toContain("animate-");
});
```

---

## 3. SuggestionBubble アニメーション

### 3-1. success-bounce アニメーション

#### 仕様

| 項目             | 値                        |
| ---------------- | ------------------------- |
| アニメーション名 | `success-bounce`          |
| 持続時間         | 300ms                     |
| イージング       | `var(--ease-bounce)`      |
| トリガー         | `onClick` 発火後          |
| 状態管理         | `useState` + `setTimeout` |

#### @keyframes 定義

```css
@keyframes success-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
```

#### tailwind.config.ts 設定

```typescript
// tailwind.config.ts - extend セクション
keyframes: {
  "success-bounce": {
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.1)" },
    "100%": { transform: "scale(1)" },
  },
},
animation: {
  "success-bounce": "success-bounce 0.3s var(--ease-bounce)",
},
```

#### 状態管理コード

```typescript
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

#### テスト検証

```typescript
it("クリック後に bounce アニメーションクラスが適用される", () => {
  vi.useFakeTimers();
  render(<SuggestionBubble label="テスト" onClick={vi.fn()} />);
  const bubble = screen.getByRole("button");

  fireEvent.click(bubble);
  expect(bubble.className).toContain("animate-");

  vi.advanceTimersByTime(300);
  expect(bubble.className).not.toContain("success-bounce");
  vi.useRealTimers();
});
```

### 3-2. ホバー・アクティブ状態

#### 仕様

| 状態       | 変換                         | 追加スタイル                                            |
| ---------- | ---------------------------- | ------------------------------------------------------- |
| 通常       | なし                         | `bg-[var(--bg-tertiary)]`                               |
| ホバー     | `scale(var(--scale-hover))`  | `bg-[var(--bg-elevated)]` + `shadow-[var(--shadow-sm)]` |
| アクティブ | `scale(var(--scale-active))` | -                                                       |
| disabled   | なし                         | `opacity-50` + `cursor-not-allowed`                     |

#### 実装コード

```typescript
const interactionClasses = disabled
  ? "opacity-50 cursor-not-allowed"
  : clsx(
      "cursor-pointer",
      "hover:scale-[var(--scale-hover)] hover:bg-[var(--bg-elevated)] hover:shadow-[var(--shadow-sm)]",
      "active:scale-[var(--scale-active)]",
      "transition-all duration-[var(--duration-default)] ease-[var(--ease-default)]",
    );
```

### 3-3. トランジション

| プロパティ                   | 値                        | 説明                             |
| ---------------------------- | ------------------------- | -------------------------------- |
| `transition-property`        | `all`                     | 全プロパティにトランジション適用 |
| `transition-duration`        | `var(--duration-default)` | デザイントークンの標準期間       |
| `transition-timing-function` | `var(--ease-default)`     | デザイントークンの標準イージング |

---

## 4. EmptyState mood アニメーション

### 4-1. welcoming グラデーション

#### 仕様

| 項目           | 値                                     |
| -------------- | -------------------------------------- |
| mood           | `welcoming`                            |
| 効果           | 薄い青の円形グラデーション背景         |
| アイコンカラー | `var(--status-primary)`                |
| 実装方式       | インラインスタイルで `radial-gradient` |

#### 実装コード

```typescript
const moodInlineStyle =
  mood === "welcoming"
    ? {
        background:
          "radial-gradient(circle at center, var(--status-primary) 0%, transparent 70%)",
        opacity: 0.05,
      }
    : undefined;
```

> `radial-gradient` は Tailwind のユーティリティクラスでは表現が困難なため、インラインスタイルを使用する。

### 4-2. encouraging

#### 仕様

| 項目           | 値                                   |
| -------------- | ------------------------------------ |
| mood           | `encouraging`                        |
| 効果           | スタイル変更なし（ニュートラル背景） |
| アイコンカラー | `var(--status-info)`                 |
| アニメーション | なし                                 |

### 4-3. celebrating

#### 仕様

| 項目           | 値                                                            |
| -------------- | ------------------------------------------------------------- |
| mood           | `celebrating`                                                 |
| 効果           | `success-bounce` アニメーション                               |
| アイコンカラー | `var(--status-success)`                                       |
| アニメーション | SuggestionBubble と同じ `success-bounce` キーフレームを再利用 |

#### 実装コード

```typescript
const celebratingClass =
  mood === "celebrating"
    ? "animate-[success-bounce_0.3s_var(--ease-bounce)]"
    : "";
```

### 4-4. mood カラーマッピング

```typescript
const moodIconColorMap: Record<EmptyStateMood, string> = {
  welcoming: "text-[var(--status-primary)]",
  encouraging: "text-[var(--status-info)]",
  celebrating: "text-[var(--status-success)]",
};

// mood 未指定時
const defaultIconColor = "text-[var(--text-muted)]";
```

---

## 5. tailwind.config.ts 追加設定まとめ

Phase 5 で `tailwind.config.ts` に追加するキーフレームとアニメーションの全量:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "success-bounce": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        pulse: "pulse 1.5s var(--ease-default) infinite",
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
        "success-bounce": "success-bounce 0.3s var(--ease-bounce)",
      },
    },
  },
};
```

> 注: 既存の Tailwind 標準 `pulse` アニメーションを上書きする。既存コードで `animate-pulse` を使用している箇所がある場合は影響を確認すること。

---

## 6. アニメーション仕様一覧

| コンポーネント   | アニメーション名           | 周期/持続時間                        | トリガー                             | 状態管理                  |
| ---------------- | -------------------------- | ------------------------------------ | ------------------------------------ | ------------------------- |
| StatusIndicator  | `pulse`                    | 1.5s infinite                        | `pulse` props / `running` デフォルト | props                     |
| SkeletonCard     | `skeleton-pulse`           | 1.5s infinite                        | `animate` props（デフォルト true）   | props                     |
| SuggestionBubble | `success-bounce`           | 0.3s once                            | `onClick` 発火後                     | `useState` + `setTimeout` |
| SuggestionBubble | hover/active               | `var(--duration-default)` transition | CSS `:hover` / `:active`             | CSS のみ                  |
| EmptyState       | `success-bounce`（再利用） | 0.3s once                            | `mood="celebrating"`                 | props                     |
| EmptyState       | welcoming gradient         | 静的                                 | `mood="welcoming"`                   | インラインスタイル        |
