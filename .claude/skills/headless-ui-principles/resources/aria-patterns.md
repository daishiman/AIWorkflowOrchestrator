# WAI-ARIA パターン実装ガイド

## 概要

WAI-ARIA（Web Accessibility Initiative - Accessible Rich Internet Applications）は、
アクセシブルなWebコンテンツを作成するためのW3C仕様です。

---

## 主要なARIAパターン

### 1. Dialog（モーダル）

```tsx
interface UseDialogReturn {
  dialogProps: {
    role: 'dialog';
    'aria-modal': boolean;
    'aria-labelledby': string;
    'aria-describedby'?: string;
  };
  titleProps: {
    id: string;
  };
  descriptionProps: {
    id: string;
  };
}

function useDialog(): UseDialogReturn {
  const titleId = useId();
  const descriptionId = useId();

  // Escapeキーでクローズ
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // フォーカストラップ
  useFocusTrap(dialogRef);

  // 背景スクロール防止
  useScrollLock(isOpen);

  return {
    dialogProps: {
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId,
    },
    titleProps: { id: titleId },
    descriptionProps: { id: descriptionId },
  };
}
```

### 2. Menu（ドロップダウン）

```tsx
function useMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuId = useId();

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(0);
        } else {
          setActiveIndex(prev => Math.min(prev + 1, itemCount - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(itemCount - 1);
        break;
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Enter':
      case ' ':
        if (activeIndex >= 0) {
          selectItem(activeIndex);
          setIsOpen(false);
        }
        break;
    }
  };

  return {
    isOpen,
    buttonProps: {
      'aria-haspopup': 'menu' as const,
      'aria-expanded': isOpen,
      'aria-controls': menuId,
      onClick: () => setIsOpen(!isOpen),
    },
    menuProps: {
      id: menuId,
      role: 'menu' as const,
      'aria-activedescendant': activeIndex >= 0
        ? `${menuId}-item-${activeIndex}`
        : undefined,
      onKeyDown: handleKeyDown,
    },
    getItemProps: (index: number) => ({
      id: `${menuId}-item-${index}`,
      role: 'menuitem' as const,
      tabIndex: -1,
    }),
  };
}
```

### 3. Tabs（タブ）

```tsx
function useTabs({ defaultValue, orientation = 'horizontal' }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const tablistId = useId();

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const isHorizontal = orientation === 'horizontal';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    switch (e.key) {
      case prevKey:
        e.preventDefault();
        focusPreviousTab(index);
        break;
      case nextKey:
        e.preventDefault();
        focusNextTab(index);
        break;
      case 'Home':
        e.preventDefault();
        focusFirstTab();
        break;
      case 'End':
        e.preventDefault();
        focusLastTab();
        break;
    }
  };

  return {
    activeTab,
    tablistProps: {
      role: 'tablist' as const,
      'aria-orientation': orientation,
    },
    getTabProps: (value: string, index: number) => ({
      role: 'tab' as const,
      id: `${tablistId}-tab-${value}`,
      'aria-selected': activeTab === value,
      'aria-controls': `${tablistId}-panel-${value}`,
      tabIndex: activeTab === value ? 0 : -1,
      onClick: () => setActiveTab(value),
      onKeyDown: (e: KeyboardEvent) => handleKeyDown(e, index),
    }),
    getPanelProps: (value: string) => ({
      role: 'tabpanel' as const,
      id: `${tablistId}-panel-${value}`,
      'aria-labelledby': `${tablistId}-tab-${value}`,
      tabIndex: 0,
      hidden: activeTab !== value,
    }),
  };
}
```

### 4. Accordion

```tsx
function useAccordion({ type = 'single', collapsible = false }) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);

      if (next.has(id)) {
        if (collapsible || type === 'multiple') {
          next.delete(id);
        }
      } else {
        if (type === 'single') {
          next.clear();
        }
        next.add(id);
      }

      return next;
    });
  };

  return {
    getHeaderProps: (id: string) => ({
      role: 'heading' as const,
      'aria-level': 3,
    }),
    getTriggerProps: (id: string) => ({
      'aria-expanded': expandedItems.has(id),
      'aria-controls': `panel-${id}`,
      onClick: () => toggleItem(id),
    }),
    getPanelProps: (id: string) => ({
      id: `panel-${id}`,
      role: 'region' as const,
      'aria-labelledby': `trigger-${id}`,
      hidden: !expandedItems.has(id),
    }),
  };
}
```

### 5. Combobox（オートコンプリート）

```tsx
function useCombobox<T>({ items, filter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();

  const filteredItems = useMemo(
    () => filter(items, inputValue),
    [items, inputValue, filter]
  );

  const handleInputKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setActiveIndex(prev =>
          Math.min(prev + 1, filteredItems.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (activeIndex >= 0) {
          selectItem(filteredItems[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  return {
    inputProps: {
      role: 'combobox' as const,
      'aria-expanded': isOpen,
      'aria-haspopup': 'listbox' as const,
      'aria-controls': listboxId,
      'aria-activedescendant': activeIndex >= 0
        ? `${listboxId}-option-${activeIndex}`
        : undefined,
      'aria-autocomplete': 'list' as const,
      value: inputValue,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setIsOpen(true);
      },
      onKeyDown: handleInputKeyDown,
    },
    listboxProps: {
      id: listboxId,
      role: 'listbox' as const,
    },
    getOptionProps: (index: number) => ({
      id: `${listboxId}-option-${index}`,
      role: 'option' as const,
      'aria-selected': activeIndex === index,
    }),
  };
}
```

---

## ユーティリティフック

### フォーカストラップ

```tsx
function useFocusTrap(containerRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef]);
}
```

### スクロールロック

```tsx
function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
}
```

### クリック外検出

```tsx
function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
```

---

## ARIA属性リファレンス

### ロール

| ロール | 用途 | 例 |
|--------|------|-----|
| `dialog` | モーダルダイアログ | モーダル、アラート |
| `menu` | メニュー | ドロップダウンメニュー |
| `menuitem` | メニュー項目 | メニューオプション |
| `tab` | タブ | タブナビゲーション |
| `tabpanel` | タブパネル | タブコンテンツ |
| `tablist` | タブリスト | タブコンテナ |
| `listbox` | リストボックス | 選択リスト |
| `option` | オプション | リスト項目 |
| `combobox` | コンボボックス | オートコンプリート |

### 状態属性

| 属性 | 型 | 用途 |
|------|-----|------|
| `aria-expanded` | boolean | 展開状態 |
| `aria-selected` | boolean | 選択状態 |
| `aria-checked` | boolean/mixed | チェック状態 |
| `aria-disabled` | boolean | 無効状態 |
| `aria-hidden` | boolean | 非表示状態 |
| `aria-pressed` | boolean/mixed | 押下状態 |

### 関係属性

| 属性 | 型 | 用途 |
|------|-----|------|
| `aria-labelledby` | ID参照 | ラベル要素 |
| `aria-describedby` | ID参照 | 説明要素 |
| `aria-controls` | ID参照 | 制御対象 |
| `aria-owns` | ID参照 | 所有要素 |
| `aria-activedescendant` | ID参照 | アクティブな子要素 |

---

## チェックリスト

### 必須要件
- [ ] 適切なロールが設定されているか
- [ ] キーボード操作が実装されているか
- [ ] フォーカス管理が適切か
- [ ] スクリーンリーダーでテストしたか

### 推奨事項
- [ ] ライブリージョンが必要か検討したか
- [ ] エラーメッセージがアクセシブルか
- [ ] カラーコントラストが十分か
- [ ] タッチターゲットが適切なサイズか
