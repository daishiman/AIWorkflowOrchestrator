# アクセシビリティ設計書

## 1. 概要

WCAG 2.1 AA準拠のアクセシビリティ実装設計。

## 2. キーボードナビゲーション設計

### キー割り当てマトリクス

| コンポーネント       | Tab        | Enter          | Space          | Delete | Escape   |
| -------------------- | ---------- | -------------- | -------------- | ------ | -------- |
| FileAttachmentButton | フォーカス | ダイアログ起動 | ダイアログ起動 | -      | -        |
| FileContextList      | 次へ移動   | -              | -              | -      | -        |
| FileContextBadge     | フォーカス | 選択           | 選択           | 削除   | 選択解除 |

### 実装コード

#### FileAttachmentButton

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case "Enter":
    case " ":
      e.preventDefault();
      handleClick();
      break;
  }
};
```

#### FileContextBadge

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case "Enter":
    case " ":
      e.preventDefault();
      onSelect?.();
      break;
    case "Delete":
    case "Backspace":
      e.preventDefault();
      onRemove?.();
      break;
    case "Escape":
      e.preventDefault();
      // 選択解除（フォーカスは維持）
      break;
  }
};
```

## 3. ARIA属性設計

### FileAttachmentButton

```tsx
<button
  type="button"
  role="button"
  aria-label={ariaLabel || "ファイルを添付"}
  aria-disabled={disabled || !canAddContext}
  aria-busy={isLoading}
  tabIndex={disabled ? -1 : 0}
  {...props}
>
```

### FileContextList

```tsx
<div
  role="list"
  aria-label="添付ファイル一覧"
  aria-describedby={isEmpty ? "file-context-empty" : undefined}
>
  {isEmpty && (
    <p id="file-context-empty" role="status">
      {emptyMessage}
    </p>
  )}
</div>
```

### FileContextBadge

```tsx
<div
  role="listitem"
  aria-label={`${context.fileName}、添付ファイル`}
  aria-selected={isActive}
  tabIndex={0}
>
  <button
    type="button"
    aria-label={`${context.fileName}を削除`}
    tabIndex={-1} // 親要素でフォーカス管理
  >
    <CloseIcon />
  </button>
</div>
```

## 4. ライブリージョン設計

### 実装パターン

```tsx
// カスタムフック
const useA11yAnnounce = () => {
  const [announcement, setAnnouncement] = useState("");

  const announce = useCallback((message: string) => {
    setAnnouncement(""); // リセット
    requestAnimationFrame(() => {
      setAnnouncement(message);
    });
  }, []);

  return { announcement, announce };
};

// コンポーネント内
const LiveRegion: FC<{ message: string }> = ({ message }) => (
  <div aria-live="polite" aria-atomic="true" className="sr-only">
    {message}
  </div>
);
```

### 通知メッセージ一覧

| イベント     | メッセージ                     | aria-live |
| ------------ | ------------------------------ | --------- |
| ファイル追加 | `"{fileName}を添付しました"`   | polite    |
| ファイル削除 | `"{fileName}を削除しました"`   | polite    |
| エラー発生   | `"エラー: {errorMessage}"`     | assertive |
| 最大数到達   | `"最大ファイル数に達しました"` | polite    |

## 5. フォーカス管理設計

### フォーカストラップ（モーダル用）

```typescript
const useFocusTrap = (containerRef: RefObject<HTMLElement>) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [containerRef]);
};
```

### フォーカス復帰

```typescript
const useFocusReturn = (
  isOpen: boolean,
  triggerRef: RefObject<HTMLElement>,
) => {
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
    } else if (previousFocus.current) {
      previousFocus.current.focus();
      previousFocus.current = null;
    }
  }, [isOpen]);
};
```

## 6. 色コントラスト設計

### カラーパレット（WCAG AAコンプライアンス）

| 用途       | ライトモード        | ダークモード        | コントラスト比 |
| ---------- | ------------------- | ------------------- | -------------- |
| 本文       | slate-700 (#334155) | slate-300 (#cbd5e1) | 7:1+           |
| 副文       | slate-500 (#64748b) | slate-400 (#94a3b8) | 4.5:1+         |
| ボタン背景 | blue-500 (#3b82f6)  | blue-600 (#2563eb)  | 4.5:1+         |
| ボタン文字 | white (#ffffff)     | white (#ffffff)     | 4.5:1+         |
| エラー     | red-600 (#dc2626)   | red-400 (#f87171)   | 4.5:1+         |
| フォーカス | blue-500 (#3b82f6)  | blue-400 (#60a5fa)  | 3:1+           |

### Tailwind設定

```typescript
// フォーカスリング
"focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

// ダークモード対応
"text-slate-700 dark:text-slate-300";
"bg-slate-100 dark:bg-slate-800";
```

## 7. スクリーンリーダーテスト計画

### VoiceOver (macOS)

1. Tab でフォーカス移動、要素名読み上げ確認
2. ボタン操作後の状態変化通知確認
3. リスト項目数の読み上げ確認

### NVDA (Windows)

1. ブラウズモードでのナビゲーション
2. フォームモードでの操作
3. ライブリージョン通知

### テストシナリオ

```gherkin
Scenario: ファイル添付操作
  Given スクリーンリーダーが有効
  When "ファイルを添付"ボタンにフォーカス
  Then "ファイルを添付、ボタン"と読み上げられる
  When Enterキーを押す
  Then ファイル選択ダイアログが開く
  When ファイルを選択
  Then "{fileName}を添付しました"と読み上げられる
```

## 8. axe-core統合

### Vitest設定

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('FileAttachmentButton has no violations', async () => {
    const { container } = render(<FileAttachmentButton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 除外ルール（必要な場合のみ）

```typescript
const results = await axe(container, {
  rules: {
    // モーダル外のコンテンツは意図的に非表示
    "aria-hidden-focus": { enabled: false },
  },
});
```

## 9. 完了条件

- [x] キーボードナビゲーション設計
- [x] ARIA属性設計
- [x] ライブリージョン設計
- [x] フォーカス管理設計
- [x] 色コントラスト設計
- [x] スクリーンリーダーテスト計画
- [x] axe-core統合設計
