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
