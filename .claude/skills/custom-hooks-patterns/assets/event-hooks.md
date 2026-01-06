# イベントフック

## useEventListener

```typescript
import { useEffect, useRef } from "react";

/**
 * イベントリスナーを管理するフック
 *
 * @param eventName - イベント名
 * @param handler - イベントハンドラ
 * @param element - 対象要素（デフォルト: window）
 *
 * @example
 * useEventListener('keydown', (e) => {
 *   if (e.key === 'Escape') closeModal();
 * });
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | null = typeof window !== "undefined" ? window : null,
  options?: AddEventListenerOptions,
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element) return;

    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K]);
    };

    element.addEventListener(eventName, eventListener, options);

    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}
```

## useClickOutside

```typescript
import { useEffect, useRef, RefObject } from "react";

/**
 * 要素外クリックを検出するフック
 *
 * @param callback - 要素外クリック時のコールバック
 * @returns 対象要素に設定するref
 *
 * @example
 * const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
 * <div ref={ref}>...</div>
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [callback]);

  return ref;
}
```

## 使用例

```typescript
function KeyboardShortcuts() {
  const [lastKey, setLastKey] = useState('');

  useEventListener('keydown', (e) => {
    // Cmd/Ctrl + S で保存
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      saveDocument();
    }

    // Escape でモーダルを閉じる
    if (e.key === 'Escape') {
      closeModal();
    }

    setLastKey(e.key);
  });

  return <p>Last key pressed: {lastKey}</p>;
}

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  return (
    <div ref={ref} className="dropdown">
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle Dropdown
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      )}
    </div>
  );
}

function WindowResize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEventListener('resize', () => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  });

  return (
    <p>
      Window size: {size.width} x {size.height}
    </p>
  );
}
```
