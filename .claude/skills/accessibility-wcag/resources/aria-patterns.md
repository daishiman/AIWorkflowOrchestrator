# ARIAパターン集

## 概要

WAI-ARIA（Web Accessibility Initiative - Accessible Rich Internet Applications）の
主要なパターンと実装例をまとめています。

---

## 基本原則

### ARIAの5つのルール

1. **ネイティブHTML要素を優先** - ARIAは最後の手段
2. **ネイティブセマンティクスを変更しない** - `<h2 role="tab">`は避ける
3. **インタラクティブ要素はキーボード操作可能に**
4. **フォーカス可能な要素を隠さない** - `aria-hidden="true"` + `tabindex="0"`は矛盾
5. **アクセシブルな名前を確保** - すべてのインタラクティブ要素に

---

## ウィジェットパターン

### 1. アコーディオン

```tsx
function Accordion({ items }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isExpanded = expandedIndex === index;
        const headerId = `accordion-header-${index}`;
        const panelId = `accordion-panel-${index}`;

        return (
          <div key={index} className="accordion-item">
            <h3>
              <button
                id={headerId}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                {item.title}
                <ChevronIcon aria-hidden="true" />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isExpanded}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### 2. モーダルダイアログ

```tsx
function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // 現在のフォーカスを保存
      previousFocusRef.current = document.activeElement as HTMLElement;
      // モーダルにフォーカス
      dialogRef.current?.focus();
    } else {
      // フォーカスを戻す
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Escapeで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal>
      {/* オーバーレイ */}
      <div className="overlay" aria-hidden="true" onClick={onClose} />
      {/* ダイアログ */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="dialog"
      >
        <h2 id={titleId}>{title}</h2>
        {children}
        <button onClick={onClose}>閉じる</button>
      </div>
    </Portal>
  );
}
```

### 3. タブ

```tsx
function Tabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<HTMLButtonElement[]>([]);

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (e.key) {
      case "ArrowRight":
        newIndex = (index + 1) % tabs.length;
        break;
      case "ArrowLeft":
        newIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setActiveIndex(newIndex);
    tabRefs.current[newIndex]?.focus();
  };

  return (
    <div className="tabs">
      <div role="tablist" aria-label="タブナビゲーション">
        {tabs.map((tab, index) => (
          <button
            key={index}
            ref={(el) => (tabRefs.current[index] = el!)}
            role="tab"
            id={`tab-${index}`}
            aria-selected={activeIndex === index}
            aria-controls={`panel-${index}`}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          id={`panel-${index}`}
          role="tabpanel"
          aria-labelledby={`tab-${index}`}
          hidden={activeIndex !== index}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

### 4. メニュー

```tsx
function Menu({ trigger, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case "Escape":
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case "Enter":
      case " ":
        if (activeIndex >= 0) {
          e.preventDefault();
          items[activeIndex].onClick();
          setIsOpen(false);
        }
        break;
    }
  };

  return (
    <div className="menu-container">
      <button
        ref={buttonRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
          setActiveIndex(0);
        }}
      >
        {trigger}
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-activedescendant={
            activeIndex >= 0 ? `menu-item-${activeIndex}` : undefined
          }
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {items.map((item, index) => (
            <div
              key={index}
              id={`menu-item-${index}`}
              role="menuitem"
              tabIndex={-1}
              className={activeIndex === index ? "active" : ""}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 5. コンボボックス（オートコンプリート）

```tsx
function Combobox({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        setActiveIndex((prev) =>
          Math.min(prev + 1, filteredOptions.length - 1),
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        if (activeIndex >= 0) {
          e.preventDefault();
          selectOption(filteredOptions[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const selectOption = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div className="combobox">
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? `option-${activeIndex}` : undefined
        }
        aria-autocomplete="list"
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul id={listboxId} role="listbox">
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              id={`option-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              onClick={() => selectOption(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## ライブリージョン

### 通知パターン

```tsx
// ステータスメッセージ（控えめ）
<div role="status" aria-live="polite">
  変更が保存されました
</div>

// アラート（重要）
<div role="alert" aria-live="assertive">
  エラーが発生しました
</div>

// ログ（履歴）
<div role="log" aria-live="polite">
  {messages.map((msg) => (
    <p key={msg.id}>{msg.text}</p>
  ))}
</div>

// タイマー
<div role="timer" aria-live="off" aria-atomic="true">
  残り時間: {timeLeft}秒
</div>
```

### aria-liveの値

| 値          | 説明                   | 使用場面       |
| ----------- | ---------------------- | -------------- |
| `off`       | 通知しない             | デフォルト     |
| `polite`    | 現在の作業終了後に通知 | ステータス更新 |
| `assertive` | 即座に通知             | 重要なエラー   |

---

## フォーカス管理

### フォーカストラップ

```tsx
function useFocusTrap(containerRef: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = container.querySelectorAll(focusableSelector);
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

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

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, isActive]);
}
```

---

## チェックリスト

- [ ] インタラクティブ要素にアクセシブルな名前があるか
- [ ] キーボードで操作可能か
- [ ] 状態の変化が通知されるか
- [ ] フォーカス管理が適切か
- [ ] セマンティクスが正しいか
