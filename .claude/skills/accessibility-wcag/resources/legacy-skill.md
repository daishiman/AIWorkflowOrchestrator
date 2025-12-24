---
name: .claude/skills/accessibility-wcag/SKILL.md
description: |
  Webアクセシビリティ（WCAG）ガイドラインとインクルーシブデザイン実装の専門知識

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/accessibility-wcag/resources/aria-patterns.md`: WAI-ARIA実装パターン集（アコーディオン・モーダル・タブ・メニュー・コンボボックス等のウィジェット、ライブリージョン、フォーカス管理）
  - `.claude/skills/accessibility-wcag/resources/testing-guide.md`: アクセシビリティテストガイド
  - `.claude/skills/accessibility-wcag/resources/wcag-checklist.md`: WCAGチェックリスト
  - `.claude/skills/accessibility-wcag/templates/accessible-form-template.tsx`: アクセシブルフォームテンプレート
  - `.claude/skills/accessibility-wcag/scripts/a11y-audit.mjs`: アクセシビリティ監査スクリプト

  専門分野:
  - WCAG準拠: レベルA/AA/AAA基準
  - ARIAパターン: 支援技術対応
  - キーボードアクセシビリティ: 完全なキーボード操作
  - スクリーンリーダー対応: 音声読み上げ最適化

  使用タイミング:
  - アクセシブルなUIコンポーネントを設計する時
  - WCAG準拠を確認する時
  - スクリーンリーダー対応を実装する時
  - アクセシビリティテストを実施する時

  Use proactively when designing accessible UI components, implementing WCAG compliance,
  or conducting accessibility testing.
version: 1.0.0
---

# .claude/skills/accessibility-wcag/SKILL.md

Webアクセシビリティ（WCAG）ガイドラインとインクルーシブデザイン実装の専門知識

---

## 概要

### 目的

WCAG（Web Content Accessibility Guidelines）に準拠した
アクセシブルなUIコンポーネント設計と実装を支援する。

### 対象者

- フロントエンドエンジニア
- UIデザイナー
- プロダクトマネージャー

---

## WCAG 2.1 概要

### 4つの原則（POUR）

| 原則                           | 説明                 | 例                         |
| ------------------------------ | -------------------- | -------------------------- |
| **Perceivable（知覚可能）**    | 情報を知覚できる     | 代替テキスト、キャプション |
| **Operable（操作可能）**       | 操作できる           | キーボード操作、十分な時間 |
| **Understandable（理解可能）** | 理解できる           | 一貫したナビ、エラー説明   |
| **Robust（堅牢）**             | 支援技術で解釈できる | 適切なセマンティクス       |

### 適合レベル

| レベル  | 説明         | 要件                       |
| ------- | ------------ | -------------------------- |
| **A**   | 最低限の適合 | 基本的なアクセシビリティ   |
| **AA**  | 推奨レベル   | 法的要件によく使用される   |
| **AAA** | 最高レベル   | すべてのコンテンツには困難 |

---

## 実装ガイドライン

### 1. セマンティックHTML

```tsx
// ❌ Bad: 非セマンティック
<div onClick={handleClick}>クリック</div>
<div className="heading">見出し</div>

// ✅ Good: セマンティック
<button onClick={handleClick}>クリック</button>
<h2>見出し</h2>
```

### 2. キーボードアクセシビリティ

```tsx
// 基本的なキーボードサポート
function InteractiveCard({ onActivate }) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
    >
      カード内容
    </div>
  );
}
```

### 3. フォーカス管理

```tsx
// フォーカス可視化
.focus-visible {
  outline: 2px solid var(--focus-ring-color);
  outline-offset: 2px;
}

// フォーカストラップ（モーダル用）
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      // 最初の要素にフォーカス
      (focusableElements?.[0] as HTMLElement)?.focus();
    }
  }, [isOpen]);

  // ... フォーカストラップロジック
}
```

### 4. カラーコントラスト

| 用途                    | WCAG AA | WCAG AAA |
| ----------------------- | ------- | -------- |
| 通常テキスト            | 4.5:1   | 7:1      |
| 大きなテキスト（18pt+） | 3:1     | 4.5:1    |
| UI要素                  | 3:1     | -        |

```tsx
// コントラスト確認ユーティリティ
function getContrastRatio(fg: string, bg: string): number {
  const getLuminance = (color: string) => {
    // 相対輝度計算
  };

  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);

  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
```

### 5. フォームアクセシビリティ

```tsx
// アクセシブルなフォームフィールド
function FormField({ id, label, error, required, children }) {
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = `${id}-description`;

  return (
    <div>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true">*</span>}
        {required && <span className="sr-only">（必須）</span>}
      </label>
      {React.cloneElement(children, {
        id,
        "aria-required": required,
        "aria-invalid": !!error,
        "aria-describedby": error ? errorId : descriptionId,
      })}
      {error && (
        <p id={errorId} role="alert" className="text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## ARIAの使用

### 基本ルール

1. **セマンティックHTMLを優先** - ARIAは最後の手段
2. **ネイティブセマンティクスを変更しない**
3. **インタラクティブ要素はキーボード操作可能に**

### よく使うARIA属性

| 属性               | 用途                     | 例                     |
| ------------------ | ------------------------ | ---------------------- |
| `aria-label`       | ラベルのない要素         | アイコンボタン         |
| `aria-labelledby`  | 別要素をラベルとして参照 | モーダルタイトル       |
| `aria-describedby` | 追加説明を参照           | フォームヘルプテキスト |
| `aria-expanded`    | 展開状態                 | アコーディオン         |
| `aria-hidden`      | 支援技術から隠す         | 装飾的要素             |
| `aria-live`        | 動的コンテンツの通知     | トースト通知           |
| `aria-busy`        | 処理中状態               | ローディング           |

### ライブリージョン

```tsx
// 動的更新の通知
<div aria-live="polite" aria-atomic="true">
  {message}
</div>

// 重要な通知
<div role="alert">
  エラーが発生しました
</div>

// ステータス更新
<div role="status">
  保存しました
</div>
```

---

## コンポーネントパターン

### ボタン

```tsx
// アイコンのみボタン
<button aria-label="閉じる">
  <CloseIcon aria-hidden="true" />
</button>

// トグルボタン
<button
  aria-pressed={isActive}
  onClick={() => setIsActive(!isActive)}
>
  {isActive ? 'アクティブ' : '非アクティブ'}
</button>
```

### モーダル

```tsx
function Modal({ isOpen, onClose, title, children }) {
  const titleId = useId();

  return (
    <dialog
      open={isOpen}
      aria-modal="true"
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <h2 id={titleId}>{title}</h2>
      {children}
      <button onClick={onClose}>閉じる</button>
    </dialog>
  );
}
```

### タブ

```tsx
function Tabs({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <div role="tablist">
        {items.map((item, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={activeIndex === i}
            aria-controls={`panel-${i}`}
            tabIndex={activeIndex === i ? 0 : -1}
            onClick={() => setActiveIndex(i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          id={`panel-${i}`}
          role="tabpanel"
          hidden={activeIndex !== i}
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

---

## テスト

### 自動テスト

```tsx
// jest-axe
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("アクセシビリティ違反がないこと", async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 手動テスト

1. **キーボードナビゲーション**
   - Tab/Shift+Tabで移動
   - Enter/Spaceで操作
   - Escapeでクローズ

2. **スクリーンリーダー**
   - VoiceOver（Mac）
   - NVDA（Windows）
   - JAWS（Windows）

3. **ブラウザツール**
   - Chrome DevTools Accessibility
   - Firefox Accessibility Inspector

---

## リソース

- `resources/wcag-checklist.md` - WCAGチェックリスト
- `resources/aria-patterns.md` - ARIAパターン集
- `resources/testing-guide.md` - アクセシビリティテストガイド
- `templates/accessible-form-template.tsx` - フォームテンプレート
- `scripts/a11y-audit.mjs` - 監査スクリプト

---

## 関連スキル

- `.claude/skills/headless-ui-principles/SKILL.md` - ヘッドレスUIの実装
- `.claude/skills/component-composition-patterns/SKILL.md` - コンポーネント設計
- `.claude/skills/design-system-architecture/SKILL.md` - デザインシステム

---

## バージョン情報

- 作成日: 2025-01-13
- 最終更新: 2025-01-13
- バージョン: 1.0.0
