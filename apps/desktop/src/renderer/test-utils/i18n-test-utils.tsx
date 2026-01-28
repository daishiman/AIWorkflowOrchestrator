/**
 * i18n Test Utilities
 *
 * TASK-3-2-B: SkillStreamDisplay i18n対応
 * テスト用のi18nセットアップとヘルパー関数を提供
 *
 * @module @repo/desktop/renderer/test-utils/i18n-test-utils
 */

import React from "react";
import { render, type RenderResult } from "@testing-library/react";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

// 日本語翻訳リソース
const jaResources = {
  status: {
    idle: "待機中",
    running: "実行中",
    completed: "完了",
    error: "エラー",
    aborted: "中断",
  },
  time: {
    justNow: "たった今",
    secondsAgo: "{{count}}秒前",
    minutesAgo: "{{count}}分前",
    hoursAgo: "{{count}}時間前",
    daysAgo: "{{count}}日前",
  },
  feedback: {
    copied: "コピーしました",
  },
  button: {
    abort: "中断",
    reset: "リセット",
  },
  message: {
    startPrompt: "スキル実行を開始してください",
    executing: "実行中...",
  },
  aria: {
    loading: "実行中",
    copyMessage: "メッセージをコピー",
    abortExecution: "スキル実行を中断",
    resetState: "状態をリセット",
  },
};

// 英語翻訳リソース
const enResources = {
  status: {
    idle: "Idle",
    running: "Running",
    completed: "Completed",
    error: "Error",
    aborted: "Aborted",
  },
  time: {
    justNow: "Just now",
    secondsAgo_one: "{{count}} second ago",
    secondsAgo_other: "{{count}} seconds ago",
    minutesAgo_one: "{{count}} minute ago",
    minutesAgo_other: "{{count}} minutes ago",
    hoursAgo_one: "{{count}} hour ago",
    hoursAgo_other: "{{count}} hours ago",
    daysAgo_one: "{{count}} day ago",
    daysAgo_other: "{{count}} days ago",
  },
  feedback: {
    copied: "Copied",
  },
  button: {
    abort: "Abort",
    reset: "Reset",
  },
  message: {
    startPrompt: "Start skill execution",
    executing: "Executing...",
  },
  aria: {
    loading: "Loading",
    copyMessage: "Copy message",
    abortExecution: "Abort skill execution",
    resetState: "Reset state",
  },
};

/**
 * テスト用i18nインスタンスを作成
 * initImmediateオプションで同期的に初期化
 */
export function createTestI18n(locale: string = "ja") {
  const testI18n = i18n.createInstance();
  testI18n.use(initReactI18next).init({
    lng: locale,
    fallbackLng: "ja",
    ns: ["skill-stream"],
    defaultNS: "skill-stream",
    resources: {
      ja: { "skill-stream": jaResources },
      en: { "skill-stream": enResources },
    },
    interpolation: {
      escapeValue: false,
    },
    initImmediate: false, // 同期的に初期化
  });
  return testI18n;
}

/**
 * i18nプロバイダー付きでコンポーネントをレンダリング
 *
 * @param ui - レンダリングするReact要素
 * @param locale - ロケール（デフォルト: "ja"）
 * @returns RenderResult
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
 * expect(getByText("Running")).toBeInTheDocument();
 * ```
 */
export function renderWithI18n(
  ui: React.ReactElement,
  locale: string = "ja",
): RenderResult {
  const testI18n = createTestI18n(locale);

  return render(<I18nextProvider i18n={testI18n}>{ui}</I18nextProvider>);
}

/**
 * モック翻訳関数
 * テストでuseTranslationをモックする際に使用
 *
 * @param locale - ロケール
 * @returns モックされたt関数
 */
export function createMockT(locale: string = "ja") {
  const resources = locale === "en" ? enResources : jaResources;

  return (key: string, options?: { count?: number }): string => {
    const keys = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = resources;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // キーが見つからない場合はキー名を返す
      }
    }

    if (typeof value === "string") {
      // 複数形対応（英語）
      if (options?.count !== undefined && locale === "en") {
        const pluralKey = options.count === 1 ? `${key}_one` : `${key}_other`;
        const pluralValue = createMockT(locale)(pluralKey, options);
        if (pluralValue !== pluralKey) {
          value = pluralValue;
        }
      }

      // 補間処理
      if (options?.count !== undefined) {
        value = value.replace("{{count}}", String(options.count));
      }

      return value;
    }

    return key;
  };
}

/**
 * テスト用の翻訳リソースをエクスポート
 */
export const testResources = {
  ja: jaResources,
  en: enResources,
};
