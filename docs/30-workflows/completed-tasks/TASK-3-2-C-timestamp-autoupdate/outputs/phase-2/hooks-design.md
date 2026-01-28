# カスタムフック設計: TASK-3-2-C タイムスタンプ自動更新

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| タスク | TASK-3-2-C-timestamp-autoupdate |
| Phase  | 2                               |
| 作成日 | 2026-01-28                      |

---

## 1. useInterval フック

### 1.1 概要

動的な間隔で関数を実行する再利用可能なカスタムフック。

### 1.2 インターフェース

```typescript
/**
 * 動的な間隔で関数を実行するカスタムフック
 *
 * @param callback - 実行する関数
 * @param delay - 実行間隔（ミリ秒）。nullの場合は停止
 */
function useInterval(callback: () => void, delay: number | null): void;
```

### 1.3 設計詳細

```typescript
import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void>();

  // コールバックを保存（最新の関数を参照するため）
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // インターバルを設定
  useEffect(() => {
    // delay === null で停止
    if (delay === null) {
      return;
    }

    const tick = () => {
      savedCallback.current?.();
    };

    const id = setInterval(tick, delay);

    // クリーンアップ
    return () => clearInterval(id);
  }, [delay]);
}
```

### 1.4 使用例

```typescript
// 1秒ごとに更新
useInterval(() => {
  setCurrentTime(Date.now());
}, 1000);

// 停止
useInterval(() => {
  // 実行されない
}, null);

// 動的な間隔
useInterval(
  () => {
    setCurrentTime(Date.now());
  },
  isVisible ? interval : null,
);
```

### 1.5 テストケース

| テストID | シナリオ                   | 期待結果                    |
| -------- | -------------------------- | --------------------------- |
| UI-1     | delay=1000で初期化         | 1秒ごとにcallbackが呼ばれる |
| UI-2     | delay=nullで初期化         | callbackは呼ばれない        |
| UI-3     | delay変更（1000→2000）     | 2秒間隔に変更される         |
| UI-4     | delay変更（1000→null）     | タイマーが停止する          |
| UI-5     | コンポーネントアンマウント | clearIntervalが呼ばれる     |
| UI-6     | callback変更               | 新しいcallbackが使用される  |

---

## 2. usePageVisibility フック

### 2.1 概要

Page Visibility APIを使用してページの可視状態を監視するカスタムフック。

### 2.2 インターフェース

```typescript
/**
 * ページの可視状態を監視するカスタムフック
 *
 * @returns isVisible - ページが可視状態かどうか
 */
function usePageVisibility(): boolean;
```

### 2.3 設計詳細

```typescript
import { useEffect, useState } from "react";

export function usePageVisibility(): boolean {
  // SSR対応: document未定義時はtrueを返す
  const [isVisible, setIsVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true,
  );

  useEffect(() => {
    // SSR対応
    if (typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // クリーンアップ
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
```

### 2.4 使用例

```typescript
const isVisible = usePageVisibility();

// 可視状態に応じてタイマーを制御
useInterval(
  () => {
    setCurrentTime(Date.now());
  },
  isVisible ? 1000 : null,
);
```

### 2.5 テストケース

| テストID | シナリオ           | 期待結果             |
| -------- | ------------------ | -------------------- |
| PV-1     | 初期状態（表示中） | isVisible = true     |
| PV-2     | タブ非表示         | isVisible = false    |
| PV-3     | タブ再表示         | isVisible = true     |
| PV-4     | アンマウント       | リスナーが解除される |
| PV-5     | SSR環境            | isVisible = true     |

---

## 3. useTimestampContext フック

### 3.1 概要

TimestampContextから現在時刻を取得するカスタムフック。

### 3.2 インターフェース

```typescript
/**
 * TimestampContextから現在時刻を取得
 *
 * @returns currentTime - 現在時刻（ミリ秒）
 */
function useTimestampContext(): number;
```

### 3.3 設計詳細

```typescript
import { createContext, useContext } from "react";

interface TimestampContextValue {
  currentTime: number;
}

const TimestampContext = createContext<TimestampContextValue>({
  currentTime: Date.now(),
});

export function useTimestampContext(): number {
  return useContext(TimestampContext).currentTime;
}

export { TimestampContext };
```

### 3.4 使用例

```typescript
// MessageTimestamp内で使用
const MessageTimestamp = React.memo(function MessageTimestamp({
  timestamp,
  messageId,
}: MessageTimestampProps) {
  const currentTime = useTimestampContext();

  return (
    <span data-testid={`message-timestamp-${messageId}`}>
      {formatRelativeTime(timestamp, currentTime)}
    </span>
  );
});
```

---

## 4. TimestampProvider コンポーネント

### 4.1 概要

現在時刻を管理し、子コンポーネントに配信するコンテキストプロバイダー。

### 4.2 インターフェース

```typescript
interface TimestampProviderProps {
  children: React.ReactNode;
  timestamps?: number[]; // 更新間隔最適化用
}

function TimestampProvider(props: TimestampProviderProps): JSX.Element;
```

### 4.3 設計詳細

```typescript
import React, { useState, useMemo } from "react";
import { useInterval } from "../hooks/useInterval";
import { usePageVisibility } from "../hooks/usePageVisibility";
import { TimestampContext } from "./TimestampContext";
import { calculateMinUpdateInterval } from "../utils/formatTime";

export function TimestampProvider({
  children,
  timestamps = [],
}: TimestampProviderProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const isVisible = usePageVisibility();

  // 更新間隔を計算
  const updateInterval = useMemo(() => {
    if (!isVisible) {
      return null; // 非表示時は停止
    }
    return calculateMinUpdateInterval(timestamps, currentTime);
  }, [isVisible, timestamps, currentTime]);

  // 定期更新
  useInterval(() => {
    setCurrentTime(Date.now());
  }, updateInterval);

  // Context value
  const contextValue = useMemo(
    () => ({ currentTime }),
    [currentTime]
  );

  return (
    <TimestampContext.Provider value={contextValue}>
      {children}
    </TimestampContext.Provider>
  );
}
```

### 4.4 テストケース

| テストID | シナリオ                       | 期待結果                    |
| -------- | ------------------------------ | --------------------------- |
| TP-1     | 初期化                         | currentTimeが設定される     |
| TP-2     | 1秒経過（全メッセージ1分未満） | currentTimeが更新される     |
| TP-3     | タブ非表示                     | タイマーが停止する          |
| TP-4     | タブ再表示                     | タイマーが再開する          |
| TP-5     | timestampsが空                 | デフォルト間隔（1分）で更新 |

---

## 5. 更新間隔計算ユーティリティ

### 5.1 calculateUpdateInterval

```typescript
/**
 * タイムスタンプに基づいて適切な更新間隔を計算
 *
 * @param timestamp - メッセージのタイムスタンプ
 * @param now - 現在時刻
 * @returns 更新間隔（ミリ秒）
 */
export function calculateUpdateInterval(
  timestamp: number,
  now: number,
): number {
  const diff = now - timestamp;
  const minutes = diff / (1000 * 60);
  const hours = minutes / 60;

  if (hours >= 1) {
    return 60 * 60 * 1000; // 1時間
  }
  if (minutes >= 1) {
    return 60 * 1000; // 1分
  }
  return 1000; // 1秒
}
```

### 5.2 calculateMinUpdateInterval

```typescript
/**
 * メッセージリストから最短の更新間隔を計算
 *
 * @param timestamps - メッセージのタイムスタンプ配列
 * @param now - 現在時刻
 * @returns 最短の更新間隔（ミリ秒）
 */
export function calculateMinUpdateInterval(
  timestamps: number[],
  now: number,
): number {
  if (timestamps.length === 0) {
    return 60 * 1000; // デフォルト1分
  }

  return Math.min(...timestamps.map((ts) => calculateUpdateInterval(ts, now)));
}
```

---

## 変更履歴

| 日付       | 変更内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-28 | 初版作成 | AI   |
