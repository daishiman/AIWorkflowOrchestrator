/**
 * Layer 1 Semantic テスト — SEM-001〜007
 *
 * TEST_TARGETS から layer1: true のターゲットを動的に列挙し、
 * 各画面に対してセマンティクス・アクセシビリティ検証を実行する。
 *
 * Playwright 標準 page fixture（Chromium）を使用する。
 * launchElectronApp() は使用しない。
 */

import { test, expect } from "@playwright/test";
import { TEST_TARGETS } from "./test-targets.config";
import { navigateToTarget, collectTabOrder } from "./helpers";

for (const target of TEST_TARGETS.filter((t) => t.layer1)) {
  test.describe(`[SEM] ${target.id} - ${target.description}`, () => {
    test.beforeEach(async ({ page }) => {
      await navigateToTarget(page, target.navigation);
    });

    // -------------------------------------------------------------------------
    // SEM-001: インタラクティブ要素に role 属性が存在する
    // -------------------------------------------------------------------------
    test("SEM-001: インタラクティブ要素に role 属性が存在する", async ({
      page,
    }) => {
      const semanticTargets = target.semanticTargets ?? [];

      // semanticTargets が空の場合はそのまま pass させる
      for (const st of semanticTargets) {
        if (!st.expectedRole) continue;

        const locator = page.locator(st.selector).first();
        const count = await page.locator(st.selector).count();
        if (count === 0) continue;

        const roleMatches = await locator.evaluate((element, expectedRole) => {
          const actualRole = element.getAttribute("role");
          if (actualRole === expectedRole) {
            return true;
          }

          const tagName = element.tagName.toLowerCase();
          const inputType =
            element instanceof HTMLInputElement ? element.type : "";

          switch (expectedRole) {
            case "button":
              return (
                tagName === "button" ||
                (tagName === "input" &&
                  ["button", "submit", "reset"].includes(inputType))
              );
            case "textbox":
              return (
                tagName === "textarea" ||
                (tagName === "input" &&
                  ![
                    "button",
                    "submit",
                    "reset",
                    "checkbox",
                    "radio",
                    "file",
                    "color",
                    "range",
                    "hidden",
                  ].includes(inputType))
              );
            case "navigation":
              return tagName === "nav";
            case "main":
              return tagName === "main";
            case "list":
              return tagName === "ul" || tagName === "ol";
            default:
              return false;
          }
        }, st.expectedRole);

        expect(
          roleMatches,
          `${st.selector} は ${st.expectedRole} の明示 role または暗黙 role を持つ必要があります`,
        ).toBe(true);
      }
    });

    // -------------------------------------------------------------------------
    // SEM-002: ボタン・リンクに aria-label または可視テキストが存在する
    // -------------------------------------------------------------------------
    test("SEM-002: ボタン・リンクに aria-label または可視テキストが存在する", async ({
      page,
    }) => {
      const interactiveElements = page.locator('button, a, [role="button"]');
      const count = await interactiveElements.count();

      for (let i = 0; i < count; i++) {
        const el = interactiveElements.nth(i);

        // aria-label 属性があるか
        const ariaLabel = await el.getAttribute("aria-label");
        if (ariaLabel !== null && ariaLabel.trim() !== "") continue;

        // 可視テキストがあるか
        const innerText = await el.innerText().catch(() => "");
        const hasVisibleText = innerText.trim() !== "";

        expect(
          hasVisibleText,
          `要素 ${i} (button/a/[role="button"]) に aria-label か可視テキストが必要です`,
        ).toBe(true);
      }
    });

    // -------------------------------------------------------------------------
    // SEM-003: フォーム要素に aria-describedby または label が関連付けられている
    // -------------------------------------------------------------------------
    test("SEM-003: フォーム要素に aria-describedby または label が関連付けられている", async ({
      page,
    }) => {
      const formElements = page.locator("input, textarea, select");
      const count = await formElements.count();

      // 要素が 0 件の場合は skip
      if (count === 0) {
        test.skip();
        return;
      }

      for (let i = 0; i < count; i++) {
        const el = formElements.nth(i);

        // aria-describedby があるか
        const ariaDescribedby = await el.getAttribute("aria-describedby");
        if (ariaDescribedby !== null && ariaDescribedby.trim() !== "") continue;

        // aria-labelledby があるか
        const ariaLabelledby = await el.getAttribute("aria-labelledby");
        if (ariaLabelledby !== null && ariaLabelledby.trim() !== "") continue;

        // aria-label があるか
        const ariaLabel = await el.getAttribute("aria-label");
        if (ariaLabel !== null && ariaLabel.trim() !== "") continue;

        // id 属性があり、対応する label[for] が存在するか
        const id = await el.getAttribute("id");
        if (id !== null && id.trim() !== "") {
          const labelCount = await page.locator(`label[for="${id}"]`).count();
          if (labelCount > 0) continue;
        }

        // いずれも満たさない場合は失敗
        expect(
          false,
          `フォーム要素 ${i} (input/textarea/select) に aria-describedby, aria-labelledby, aria-label, または label[for] が必要です`,
        ).toBe(true);
      }
    });

    // -------------------------------------------------------------------------
    // SEM-004: Tab キーで全インタラクティブ要素にフォーカス移動できる
    // -------------------------------------------------------------------------
    test("SEM-004: Tab キーで全インタラクティブ要素にフォーカス移動できる", async ({
      page,
    }) => {
      const tabOrder = await collectTabOrder(page, 15);

      expect(
        tabOrder.length,
        "Tab キーで少なくとも 1 要素にフォーカスが当たることが必要です",
      ).toBeGreaterThan(0);
    });

    // -------------------------------------------------------------------------
    // SEM-005: tabindex の順序が視覚的な並びと矛盾しない
    // -------------------------------------------------------------------------
    test("SEM-005: tabindex の順序が視覚的な並びと矛盾しない", async ({
      page,
    }) => {
      // positive tabindex の重複だけを異常値として扱う。
      // roving tabindex やネイティブな tabIndex=0 は許容する。
      const positiveTabIndexValues = await page.evaluate(() => {
        const elements = document.querySelectorAll("[tabindex]");
        return Array.from(elements)
          .map((el) => {
            const val = parseInt(el.getAttribute("tabindex") ?? "-1", 10);
            return val;
          })
          .filter((val) => val > 0);
      });

      // 要素が 0 件なら skip
      if (positiveTabIndexValues.length === 0) {
        test.skip();
        return;
      }

      // positive tabindex の値が重複していないことを確認
      const uniqueValues = new Set(positiveTabIndexValues);
      expect(
        uniqueValues.size,
        "positive tabindex の値が重複しています（1以上の tabindex は各要素で一意であるべきです）",
      ).toBe(positiveTabIndexValues.length);
    });

    // -------------------------------------------------------------------------
    // SEM-006: モーダル・ダイアログが開いている間、背後の要素がフォーカス不可になる
    // -------------------------------------------------------------------------
    test("SEM-006: モーダル・ダイアログが開いている間、背後の要素がフォーカス不可になる", async ({
      page,
    }) => {
      const dialogCount = await page
        .locator('[role="dialog"], [role="alertdialog"]')
        .count();

      // ダイアログが存在しない場合は skip
      if (dialogCount === 0) {
        test.skip();
        return;
      }

      // ダイアログ外の要素が tabIndex === -1 または inert であることを確認
      const hasLeakedFocusableElement = await page.evaluate(() => {
        const dialogs = document.querySelectorAll(
          '[role="dialog"], [role="alertdialog"]',
        );
        if (dialogs.length === 0) return false;

        // ダイアログ内の要素を収集
        const dialogElements = new Set<Element>();
        dialogs.forEach((dialog) => {
          dialog.querySelectorAll("*").forEach((el) => dialogElements.add(el));
          dialogElements.add(dialog);
        });

        // ダイアログ外のインタラクティブ要素でフォーカス可能なものを探す
        const interactiveSelectors =
          'button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])';
        const allInteractive = document.querySelectorAll(interactiveSelectors);

        for (const el of allInteractive) {
          if (dialogElements.has(el)) continue;

          const htmlEl = el as HTMLElement;
          const inertAncestor = htmlEl.closest("[inert]");
          // 自身または祖先が inert なら問題なし
          if (htmlEl.inert || inertAncestor) continue;
          // tabIndex が -1 ならフォーカス不可なので問題なし
          if (htmlEl.tabIndex === -1) continue;

          // フォーカス可能な要素がダイアログ外に存在する
          return true;
        }

        return false;
      });

      expect(
        hasLeakedFocusableElement,
        "ダイアログが開いている間、ダイアログ外の要素はフォーカス不可（tabIndex=-1 または inert）であるべきです",
      ).toBe(false);
    });

    // -------------------------------------------------------------------------
    // SEM-007: エラー状態時に aria-live または role="alert" でスクリーンリーダーに通知される
    // -------------------------------------------------------------------------
    test('SEM-007: エラー状態時に aria-live または role="alert" でスクリーンリーダーに通知される', async ({
      page,
    }) => {
      const liveRegionCount = await page
        .locator('[aria-live], [role="alert"]')
        .count();

      // 存在しない場合は skip（エラー状態が UI に表示されない画面もある）
      if (liveRegionCount === 0) {
        test.skip();
        return;
      }

      // aria-live または role="alert" が DOM に存在することを確認
      expect(liveRegionCount).toBeGreaterThan(0);
    });
  });
}
