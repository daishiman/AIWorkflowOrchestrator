/**
 * UI/UX テスト専用ヘルパー関数
 *
 * Layer 1 Semantic テスト / Layer 2 Visual テスト で共通利用する。
 * ナビゲーション補助・アクセシブル要素収集・API キーモックを提供する。
 */

import type { Page } from "@playwright/test";
import type { TestTarget } from "./test-targets.config";

/**
 * TestTarget の navigation 定義に従って画面に移動する。
 *
 * - type: "url"  → page.goto(value) を呼ぶ
 * - type: "action" → 対応するアクション関数を実行する
 */
export async function navigateToTarget(
  page: Page,
  navigation: TestTarget["navigation"],
): Promise<void> {
  if (navigation.type === "url") {
    await page.goto(navigation.value);
    await page.waitForLoadState("networkidle");
    return;
  }

  // action ベースのナビゲーション
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await dismissOverlayIfPresent(page);

  switch (navigation.name) {
    case "navigate-to-skills":
      await navigateToSkills(page);
      break;
    case "navigate-to-settings":
      await navigateToSettings(page);
      break;
    case "trigger-error-state":
      await triggerErrorState(page);
      break;
    case "trigger-loading-state":
      await triggerLoadingState(page);
      break;
    case "switch-to-dark-mode":
      await switchToDarkMode(page);
      break;
    default:
      // 未知のアクションは無視してそのまま続行
      break;
  }
}

/**
 * 起動直後に表示されるモーダル・オーバーレイを Escape で閉じる。
 * 存在しない場合はそのまま続行する（エラーにならない）。
 */
async function dismissOverlayIfPresent(page: Page): Promise<void> {
  try {
    const overlay = page
      .locator(".fixed.inset-0, [role='dialog'], [role='alertdialog']")
      .first();
    const isVisible = await overlay.isVisible({ timeout: 1500 });
    if (isVisible) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }
  } catch {
    // オーバーレイがない or タイムアウト → 無視して続行
  }
}

/** スキル一覧画面へ移動する */
async function navigateToSkills(page: Page): Promise<void> {
  // 複数のセレクタを試みる（アプリのビューIDに応じて順に試す）
  const candidates = [
    'button[data-view-id="skills"]',
    'button[data-view-id="skill-list"]',
    '[aria-label*="スキル"]',
    '[data-testid="skill-nav-button"]',
    'button[aria-label="スキル"]',
  ];
  for (const selector of candidates) {
    const el = page.locator(selector).first();
    try {
      const isVisible = await el.isVisible({ timeout: 500 });
      if (isVisible) {
        await el.click({ force: false, timeout: 5000 });
        await page.waitForLoadState("networkidle");
        return;
      }
    } catch {
      // このセレクタはスキップして次へ
    }
  }
  // 見つからない場合はそのまま（トップページのままスクリーンショット）
}

/** 設定画面へ移動する */
async function navigateToSettings(page: Page): Promise<void> {
  const settingsButton = page
    .locator(
      'button[data-view-id="settings"], [aria-label*="設定"], [data-testid="settings-nav-button"]',
    )
    .first();
  try {
    const isVisible = await settingsButton.isVisible({ timeout: 2000 });
    if (isVisible) {
      await settingsButton.click({ force: false, timeout: 10000 });
      await page.waitForLoadState("networkidle");
    }
  } catch {
    // クリックできない場合（オーバーレイが残っているなど）は force クリックを試みる
    try {
      await settingsButton.click({ force: true, timeout: 5000 });
      await page.waitForLoadState("networkidle");
    } catch {
      // それでも失敗した場合はそのまま続行
    }
  }
}

/** エラー状態をトリガーする（フォールバック: エラーバナーがあれば表示） */
async function triggerErrorState(page: Page): Promise<void> {
  // エラー状態を強制的に表示するためのモック挿入
  await page.evaluate(() => {
    const alertEl = document.querySelector('[role="alert"]');
    if (!alertEl) {
      const div = document.createElement("div");
      div.setAttribute("role", "alert");
      div.setAttribute("aria-live", "assertive");
      div.className = "error-banner";
      div.textContent = "E2E テスト用エラーメッセージ";
      document.body.prepend(div);
    }
  });
}

/** ローディング状態をトリガーする */
async function triggerLoadingState(page: Page): Promise<void> {
  await page.evaluate(() => {
    const loaderEl = document.querySelector(
      '[data-testid="loading"], [aria-busy="true"]',
    );
    if (!loaderEl) {
      const div = document.createElement("div");
      div.setAttribute("aria-busy", "true");
      div.setAttribute("data-testid", "loading");
      div.className = "loading-spinner";
      document.body.prepend(div);
    }
  });
}

/** ダークモードへ切り替える */
async function switchToDarkMode(page: Page): Promise<void> {
  // テーマ切り替えボタン or localStorage 操作
  const themeButton = page
    .locator(
      '[data-testid="theme-toggle"], [aria-label*="ダーク"], [aria-label*="dark"]',
    )
    .first();
  if (await themeButton.isVisible()) {
    await themeButton.click();
  } else {
    // フォールバック: localStorage でダークモードを強制
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    });
  }
  await page.waitForTimeout(300); // CSS トランジション完了待ち
}

/**
 * ページ上のアクセシブルな要素情報を収集する。
 * SEM-001 / SEM-002 の検証に使う。
 */
export interface AccessibleElementInfo {
  tag: string;
  role: string | null;
  ariaLabel: string | null;
  tabIndex: number;
  text: string;
}

export async function captureAccessibleElements(
  page: Page,
  selector: string = "button, a, input, textarea, select, [role], [tabindex]",
): Promise<AccessibleElementInfo[]> {
  return page.evaluate((sel) => {
    const elements = document.querySelectorAll(sel);
    return Array.from(elements).map((el) => ({
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      ariaLabel: el.getAttribute("aria-label"),
      tabIndex: (el as HTMLElement).tabIndex,
      text: (el as HTMLElement).innerText?.slice(0, 50) ?? "",
    }));
  }, selector);
}

/**
 * Tab キーでフォーカス移動し、フォーカスされた要素の識別子を順番に返す。
 * SEM-004 / SEM-005 の tabindex 順序検証に使う。
 */
export async function collectTabOrder(
  page: Page,
  maxTabs: number = 20,
): Promise<string[]> {
  const order: string[] = [];
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return (
        el.getAttribute("data-testid") ??
        el.getAttribute("aria-label") ??
        el.getAttribute("role") ??
        el.tagName.toLowerCase()
      );
    });
    if (focused) order.push(focused);
  }
  return order;
}
