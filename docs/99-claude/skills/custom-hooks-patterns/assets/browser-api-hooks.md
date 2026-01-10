# ブラウザAPIフック

## useLocalStorage

```typescript
import { useState, useCallback } from "react";

/**
 * ローカルストレージと同期する状態を管理するフック
 *
 * @param key - ストレージキー
 * @param initialValue - 初期値
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
```

## useMediaQuery

```typescript
import { useState, useEffect } from "react";

/**
 * メディアクエリの状態を監視するフック
 *
 * @param query - メディアクエリ文字列
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);

    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}
```

## 使用例

```typescript
function ThemeToggle() {
  const [theme, setTheme, removeTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <button onClick={removeTheme}>
        Reset to Default
      </button>
    </div>
  );
}

function ResponsiveLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div className={prefersDark ? 'dark-mode' : 'light-mode'}>
      {isMobile ? (
        <MobileNavigation />
      ) : isTablet ? (
        <TabletNavigation />
      ) : (
        <DesktopNavigation />
      )}

      <main style={{
        transition: prefersReducedMotion ? 'none' : 'all 0.3s ease',
      }}>
        <Content />
      </main>
    </div>
  );
}

function UserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    notifications: true,
    autoSave: true,
    language: 'ja',
  });

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={preferences.notifications}
          onChange={(e) =>
            setPreferences((prev) => ({
              ...prev,
              notifications: e.target.checked,
            }))
          }
        />
        Enable notifications
      </label>

      <label>
        <input
          type="checkbox"
          checked={preferences.autoSave}
          onChange={(e) =>
            setPreferences((prev) => ({
              ...prev,
              autoSave: e.target.checked,
            }))
          }
        />
        Auto-save
      </label>

      <select
        value={preferences.language}
        onChange={(e) =>
          setPreferences((prev) => ({
            ...prev,
            language: e.target.value,
          }))
        }
      >
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
```
