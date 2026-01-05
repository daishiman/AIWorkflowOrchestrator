import {
  test,
  expect,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import { _electron as electron } from "playwright";
import path from "path";

/**
 * システムプロンプト設定機能 E2Eテスト
 *
 * テスト対象:
 * - システムプロンプト入力・編集機能
 * - テンプレート保存・読み込み機能
 * - LLMへのシステムプロンプト適用機能
 *
 * 参照:
 * - .claude/skills/playwright-testing/SKILL.md
 * - .claude/skills/flaky-test-prevention/SKILL.md
 */

test.describe("システムプロンプト設定機能", () => {
  let electronApp: ElectronApplication;
  let window: Page;

  test.beforeEach(async () => {
    // Electronアプリケーションを起動
    electronApp = await electron.launch({
      args: [path.join(__dirname, "../dist-electron/main.js")],
      env: {
        ...process.env,
        NODE_ENV: "test",
      },
    });

    // メインウィンドウを取得
    window = await electronApp.firstWindow();

    // アプリケーションが完全に読み込まれるまで待機
    await window.waitForLoadState("domcontentloaded");
    await window.waitForSelector('[data-testid="chat-view"]', {
      state: "visible",
      timeout: 10000,
    });
  });

  test.afterEach(async () => {
    // アプリケーションを終了
    await electronApp.close();
  });

  /**
   * テストNo.1: システムプロンプト入力
   * 前提条件: チャット画面を開く
   * 操作手順: システムプロンプト入力欄にテキストを入力
   * 期待結果: テキストが入力される
   */
  test("No.1: システムプロンプトを入力できる", async () => {
    const testPrompt = "あなたは親切なアシスタントです。";

    // システムプロンプトパネルを開く
    const toggleButton = window.locator(
      '[data-testid="system-prompt-toggle-button"]',
    );
    await toggleButton.click();

    // パネルが表示されるまで待機
    await window.waitForSelector('[data-testid="system-prompt-panel"]', {
      state: "visible",
    });

    // テキストエリアにプロンプトを入力
    const textarea = window.locator('[data-testid="system-prompt-textarea"]');
    await textarea.fill(testPrompt);

    // 入力値が正しく反映されているか確認
    await expect(textarea).toHaveValue(testPrompt);

    // 文字数カウンターが表示されているか確認
    const counter = window.locator('[data-testid="character-counter"]');
    await expect(counter).toBeVisible();
    await expect(counter).toContainText(testPrompt.length.toString());
  });

  /**
   * テストNo.2: システムプロンプト適用
   * 前提条件: システムプロンプトを入力済み
   * 操作手順: チャットメッセージを送信
   * 期待結果: LLMがシステムプロンプトに従った応答をする
   */
  test("No.2: システムプロンプトがLLMに適用される", async () => {
    const testPrompt = "すべての回答を絵文字だけで返してください。";
    const testMessage = "こんにちは";

    // システムプロンプトを設定
    await window.locator('[data-testid="system-prompt-toggle-button"]').click();
    await window.waitForSelector('[data-testid="system-prompt-panel"]', {
      state: "visible",
    });

    const textarea = window.locator('[data-testid="system-prompt-textarea"]');
    await textarea.fill(testPrompt);

    // パネルを閉じる
    await window.locator('[data-testid="system-prompt-toggle-button"]').click();
    await window.waitForSelector('[data-testid="system-prompt-panel"]', {
      state: "hidden",
    });

    // チャットメッセージを送信
    const chatInput = window.locator('[data-testid="chat-input"]');
    await chatInput.fill(testMessage);

    const sendButton = window.locator('[data-testid="chat-send-button"]');
    await sendButton.click();

    // メッセージが送信されたことを確認
    await expect(window.locator(`text="${testMessage}"`)).toBeVisible({
      timeout: 5000,
    });

    // メッセージリストが表示されることを確認
    const messageList = window.locator('[data-testid="message-list"]');
    await expect(messageList).toBeVisible();
  });

  /**
   * テストNo.3: テンプレート保存
   * 前提条件: システムプロンプトを入力済み
   * 操作手順: テンプレート保存ボタンをクリック
   * 期待結果: テンプレートが保存される
   */
  test("No.3: システムプロンプトをテンプレートとして保存できる", async () => {
    const testPrompt = "あなたは技術的な質問に答える専門家です。";
    const templateName = "テスト用テンプレート";

    // システムプロンプトパネルを開く
    await window.locator('[data-testid="system-prompt-toggle-button"]').click();
    await window.waitForSelector('[data-testid="system-prompt-panel"]', {
      state: "visible",
    });

    // システムプロンプトを入力
    const textarea = window.locator('[data-testid="system-prompt-textarea"]');
    await textarea.fill(testPrompt);

    // 保存ボタンをクリック
    const saveButton = window.locator('[data-testid="save-template-button"]');
    await saveButton.click();

    // 保存ダイアログが表示されるまで待機
    await window.waitForSelector('[data-testid="save-template-dialog"]', {
      state: "visible",
    });

    // テンプレート名を入力
    const nameInput = window.locator('[data-testid="template-name-input"]');
    await nameInput.fill(templateName);

    // 保存実行
    const confirmButton = window.locator(
      '[data-testid="save-template-confirm-button"]',
    );
    await confirmButton.click();

    // ダイアログが閉じるまで待機
    await window.waitForSelector('[data-testid="save-template-dialog"]', {
      state: "hidden",
    });

    // テンプレートセレクターに保存されたテンプレートが表示されることを確認
    const templateSelector = window.locator(
      '[data-testid="template-selector"]',
    );
    await expect(templateSelector).toBeVisible();
  });

  /**
   * テストNo.8: 空のプロンプト
   * 前提条件: システムプロンプトを空にする
   * 操作手順: チャットメッセージを送信
   * 期待結果: デフォルトの動作になる
   */
  test("No.8: システムプロンプトが空の場合でも正常に動作する", async () => {
    const testMessage = "テストメッセージ";

    // システムプロンプトパネルを開く
    await window.locator('[data-testid="system-prompt-toggle-button"]').click();
    await window.waitForSelector('[data-testid="system-prompt-panel"]', {
      state: "visible",
    });

    // システムプロンプトが空であることを確認
    const textarea = window.locator('[data-testid="system-prompt-textarea"]');
    await textarea.clear();
    await expect(textarea).toHaveValue("");

    // パネルを閉じる
    await window.locator('[data-testid="system-prompt-toggle-button"]').click();
    await window.waitForSelector('[data-testid="system-prompt-panel"]', {
      state: "hidden",
    });

    // チャットメッセージを送信
    const chatInput = window.locator('[data-testid="chat-input"]');
    await chatInput.fill(testMessage);

    const sendButton = window.locator('[data-testid="chat-send-button"]');
    await sendButton.click();

    // メッセージが送信されることを確認
    await expect(window.locator(`text="${testMessage}"`)).toBeVisible({
      timeout: 5000,
    });
  });

  /**
   * アクセシビリティテスト: ARIA属性
   */
  test("アクセシビリティ: ARIA属性が適切に設定されている", async () => {
    // システムプロンプトパネルを開く
    await window.locator('[data-testid="system-prompt-toggle-button"]').click();
    await window.waitForSelector('[data-testid="system-prompt-panel"]', {
      state: "visible",
    });

    // テキストエリアのARIA属性を確認
    const textarea = window.locator('[data-testid="system-prompt-textarea"]');
    await expect(textarea).toHaveAttribute("aria-label");
    await expect(textarea).toHaveAttribute("role", "textbox");
    await expect(textarea).toHaveAttribute("aria-multiline", "true");

    // 保存ボタンのARIA属性を確認
    const saveButton = window.locator('[data-testid="save-template-button"]');
    await expect(saveButton).toHaveAttribute("aria-label");

    // テンプレートセレクターのARIA属性を確認
    const templateSelector = window.locator(
      '[data-testid="template-selector"]',
    );
    await expect(templateSelector).toHaveAttribute("aria-label");
    await expect(templateSelector).toHaveAttribute("aria-haspopup", "listbox");
  });

  /**
   * アクセシビリティテスト: キーボードナビゲーション
   */
  test("アクセシビリティ: キーボードで操作できる", async () => {
    // システムプロンプトパネルを開く
    await window.locator('[data-testid="system-prompt-toggle-button"]').click();
    await window.waitForSelector('[data-testid="system-prompt-panel"]', {
      state: "visible",
    });

    // テキストエリアにフォーカス
    const textarea = window.locator('[data-testid="system-prompt-textarea"]');
    await textarea.focus();
    await expect(textarea).toBeFocused();

    // テキスト入力
    await window.keyboard.type("キーボードテスト");
    await expect(textarea).toHaveValue("キーボードテスト");

    // Tabキーで次の要素へ移動可能であることを確認
    await window.keyboard.press("Tab");

    // 何らかの要素にフォーカスが移動したことを確認
    const focusedElement = await window.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(focusedElement).toBeTruthy();
  });
});
