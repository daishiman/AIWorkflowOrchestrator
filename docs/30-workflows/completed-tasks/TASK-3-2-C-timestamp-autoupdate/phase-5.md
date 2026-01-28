# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 5                               |
| 機能名 | TASK-3-2-C-timestamp-autoupdate |
| 作成日 | 2026-01-28                      |

---

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。

---

## 実行タスク

- **Task 1**: useIntervalフック実装
- **Task 2**: usePageVisibilityフック実装
- **Task 3**: calculateUpdateInterval関数実装
- **Task 4**: TimestampContext実装
- **Task 5**: MessageTimestamp改善実装

---

## 参照資料

| 資料名       | パス                                     | 説明          |
| ------------ | ---------------------------------------- | ------------- |
| 設計書       | `outputs/phase-2/architecture-design.md` | Phase 2成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`  | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 説明                   |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------- |
| 機能別コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | SkillStreamDisplay仕様 |

---

## 実行手順

### Task 1: useIntervalフック実装

ファイル: `apps/desktop/src/renderer/hooks/useInterval.ts`

```typescript
/**
 * useInterval - 動的な間隔で関数を実行するカスタムフック
 *
 * TASK-3-2-C: SkillStreamDisplay タイムスタンプ自動更新
 *
 * @module @repo/desktop/renderer/hooks/useInterval
 */

import { useEffect, useRef } from "react";

/**
 * 動的な間隔で関数を実行するカスタムフック
 *
 * @param callback - 実行する関数
 * @param delay - 実行間隔（ミリ秒）。nullの場合は停止
 *
 * @example
 * // 1秒ごとに実行
 * useInterval(() => console.log('tick'), 1000);
 *
 * // 動的に間隔を変更
 * useInterval(callback, isActive ? 1000 : null);
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void>();

  // コールバックを保存（最新の参照を維持）
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // インターバルを設定
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const tick = () => {
      savedCallback.current?.();
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

### Task 2: usePageVisibilityフック実装

ファイル: `apps/desktop/src/renderer/hooks/usePageVisibility.ts`

```typescript
/**
 * usePageVisibility - ページの可視状態を監視するカスタムフック
 *
 * TASK-3-2-C: SkillStreamDisplay タイムスタンプ自動更新
 *
 * @module @repo/desktop/renderer/hooks/usePageVisibility
 */

import { useState, useEffect } from "react";

/**
 * ページの可視状態を監視するカスタムフック
 *
 * @returns isVisible - ページが可視状態かどうか
 *
 * @example
 * const isVisible = usePageVisibility();
 * // タブが非表示になるとfalseになる
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true,
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
```

### Task 3: calculateUpdateInterval関数実装

ファイル: `apps/desktop/src/renderer/utils/formatTime.ts`（追加）

```typescript
// 既存のformatRelativeTime関数の後に追加

/**
 * 更新間隔定数
 */
export const UPDATE_INTERVALS = {
  SECOND: 1000, // 1秒
  MINUTE: 60 * 1000, // 1分
  HOUR: 60 * 60 * 1000, // 1時間
} as const;

/**
 * タイムスタンプに基づいて適切な更新間隔を計算
 *
 * - 1分未満: 1秒ごとに更新
 * - 1分〜1時間: 1分ごとに更新
 * - 1時間以上: 1時間ごとに更新
 *
 * @param timestamp - メッセージのタイムスタンプ（ミリ秒）
 * @param now - 現在時刻（ミリ秒）
 * @returns 更新間隔（ミリ秒）
 *
 * @example
 * const interval = calculateUpdateInterval(Date.now() - 30000, Date.now());
 * // => 1000 (1秒)
 */
export function calculateUpdateInterval(
  timestamp: number,
  now: number,
): number {
  const diff = now - timestamp;
  const minutes = diff / UPDATE_INTERVALS.MINUTE;
  const hours = minutes / 60;

  if (hours >= 1) {
    return UPDATE_INTERVALS.HOUR;
  }
  if (minutes >= 1) {
    return UPDATE_INTERVALS.MINUTE;
  }
  return UPDATE_INTERVALS.SECOND;
}

/**
 * メッセージリストから最短の更新間隔を計算
 *
 * @param timestamps - メッセージのタイムスタンプ配列
 * @param now - 現在時刻
 * @returns 最短の更新間隔（ミリ秒）
 *
 * @example
 * const interval = calculateMinUpdateInterval([ts1, ts2, ts3], Date.now());
 */
export function calculateMinUpdateInterval(
  timestamps: number[],
  now: number,
): number {
  if (timestamps.length === 0) {
    return UPDATE_INTERVALS.MINUTE; // デフォルト1分
  }

  return Math.min(...timestamps.map((ts) => calculateUpdateInterval(ts, now)));
}
```

### Task 4: TimestampContext実装

ファイル: `apps/desktop/src/renderer/contexts/TimestampContext.tsx`

```typescript
/**
 * TimestampContext - タイムスタンプ更新用コンテキスト
 *
 * TASK-3-2-C: SkillStreamDisplay タイムスタンプ自動更新
 *
 * 全MessageTimestampコンポーネントが単一タイマーで更新される
 * バッチ更新によりパフォーマンスを最適化
 *
 * @module @repo/desktop/renderer/contexts/TimestampContext
 */

import React, { createContext, useContext, useState } from "react";
import { useInterval } from "../hooks/useInterval";
import { usePageVisibility } from "../hooks/usePageVisibility";
import { UPDATE_INTERVALS } from "../utils/formatTime";

/**
 * コンテキスト値の型
 */
interface TimestampContextValue {
  /** 現在時刻（ミリ秒） */
  currentTime: number;
}

/**
 * デフォルト値
 */
const defaultValue: TimestampContextValue = {
  currentTime: Date.now(),
};

/**
 * タイムスタンプコンテキスト
 */
const TimestampContext = createContext<TimestampContextValue>(defaultValue);

/**
 * 現在時刻を取得するフック
 *
 * @returns 現在時刻（ミリ秒）
 *
 * @example
 * const currentTime = useTimestampContext();
 * const relativeTime = formatRelativeTime(timestamp, currentTime);
 */
export function useTimestampContext(): number {
  return useContext(TimestampContext).currentTime;
}

/**
 * TimestampProvider Props
 */
interface TimestampProviderProps {
  /** 子コンポーネント */
  children: React.ReactNode;
  /** 更新間隔（テスト用、オプション） */
  updateInterval?: number;
}

/**
 * タイムスタンプ更新プロバイダー
 *
 * 全てのMessageTimestampコンポーネントを単一タイマーで更新する
 * ページが非表示の時は更新を停止する
 *
 * @example
 * <TimestampProvider>
 *   <MessageList />
 * </TimestampProvider>
 */
export function TimestampProvider({
  children,
  updateInterval = UPDATE_INTERVALS.SECOND,
}: TimestampProviderProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const isVisible = usePageVisibility();

  // ページが可視の時のみ更新
  const activeInterval = isVisible ? updateInterval : null;

  useInterval(() => {
    setCurrentTime(Date.now());
  }, activeInterval);

  return (
    <TimestampContext.Provider value={{ currentTime }}>
      {children}
    </TimestampContext.Provider>
  );
}
```

### Task 5: MessageTimestamp改善実装

ファイル: `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`（変更箇所）

```typescript
// インポート追加
import { useTimestampContext, TimestampProvider } from "../../contexts/TimestampContext";

// MessageTimestampコンポーネントの変更
/**
 * R2: タイムスタンプコンポーネント（自動更新対応）
 *
 * TASK-3-2-C: タイムスタンプ自動更新
 */
const MessageTimestamp = React.memo(function MessageTimestamp({
  timestamp,
  messageId,
}: {
  timestamp: number;
  messageId: string;
}) {
  // TimestampContextから現在時刻を取得（バッチ更新用）
  const currentTime = useTimestampContext();

  return (
    <span
      data-testid={`message-timestamp-${messageId}`}
      className="text-xs text-gray-400 flex-shrink-0"
    >
      {formatRelativeTime(timestamp, currentTime)}
    </span>
  );
});

// SkillStreamDisplayコンポーネントのreturn部分をTimestampProviderでラップ
export function SkillStreamDisplay(props: SkillStreamDisplayProps) {
  // ... 既存のロジック ...

  return (
    <TimestampProvider>
      {/* 既存のJSX */}
    </TimestampProvider>
  );
}
```

---

## アーキテクチャ層別実装

このタスクはフロントエンド（Renderer Process）のみに影響する。

| 層         | 実装内容                                            | ファイル                                          |
| ---------- | --------------------------------------------------- | ------------------------------------------------- |
| Hooks      | useInterval、usePageVisibility                      | `apps/desktop/src/renderer/hooks/`                |
| Contexts   | TimestampProvider、useTimestampContext              | `apps/desktop/src/renderer/contexts/`             |
| Utils      | calculateUpdateInterval、calculateMinUpdateInterval | `apps/desktop/src/renderer/utils/formatTime.ts`   |
| Components | MessageTimestamp、SkillStreamDisplay                | `apps/desktop/src/renderer/components/AgentView/` |

---

## 成果物

| 成果物                         | パス                                                                    |
| ------------------------------ | ----------------------------------------------------------------------- |
| useInterval.ts                 | `apps/desktop/src/renderer/hooks/useInterval.ts`                        |
| usePageVisibility.ts           | `apps/desktop/src/renderer/hooks/usePageVisibility.ts`                  |
| TimestampContext.tsx           | `apps/desktop/src/renderer/contexts/TimestampContext.tsx`               |
| formatTime.ts（更新）          | `apps/desktop/src/renderer/utils/formatTime.ts`                         |
| SkillStreamDisplay.tsx（更新） | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` |

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] useIntervalのテストが全てPASS（Green状態）
# - [ ] usePageVisibilityのテストが全てPASS
# - [ ] TimestampContextのテストが全てPASS
# - [ ] MessageTimestamp自動更新のテストが全てPASS
# - [ ] calculateUpdateIntervalのテストが全てPASS
# - [ ] 既存テストが全てPASS
```

---

## 完了条件

- [ ] useIntervalフックが実装されている
- [ ] usePageVisibilityフックが実装されている
- [ ] calculateUpdateInterval関数が実装されている
- [ ] calculateMinUpdateInterval関数が実装されている
- [ ] TimestampContextが実装されている
- [ ] MessageTimestampがTimestampContextを使用している
- [ ] SkillStreamDisplayがTimestampProviderでラップされている
- [ ] すべてのテストが成功状態（Green）
- [ ] 既存テストが全てPASS
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 6: テスト拡充
