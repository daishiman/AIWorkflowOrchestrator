import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import fs from "fs/promises";

/**
 * チャット履歴エクスポート機能のE2Eテスト
 *
 * テスト対象:
 * - セッションのMarkdown/JSONエクスポート
 * - ダウンロードファイルの検証
 * - エクスポートプレビュー機能
 * - エラーハンドリング
 * - ローディング状態
 * - アクセシビリティ
 *
 * @see docs/30-workflows/chat-history-persistence/api-design.md
 * @see docs/30-workflows/chat-history-persistence/component-design.md
 */

// ============================================================
// テストデータ
// ============================================================

const TEST_SESSION = {
  id: "01HWQV8N4G0PXRJ6K8M2Y3Z5",
  title: "React開発についての質問",
  messageCount: 24,
  totalTokens: 4520,
  messages: [
    {
      id: "msg1",
      role: "user" as const,
      content: "ReactのuseEffectフックについて教えてください。",
      timestamp: "2025-12-20T14:30:15.000Z",
    },
    {
      id: "msg2",
      role: "assistant" as const,
      content: "useEffectは副作用を扱うためのReact Hookです...",
      timestamp: "2025-12-20T14:30:18.000Z",
      llmMetadata: {
        provider: "anthropic",
        model: "claude-3-5-sonnet-20241022",
        tokenUsage: {
          inputTokens: 45,
          outputTokens: 320,
          totalTokens: 365,
        },
      },
    },
  ],
};

// ============================================================
// テストヘルパー関数
// ============================================================

/**
 * テストセッションデータをシード
 */
async function seedTestSession(page: Page): Promise<void> {
  // APIモック: セッション取得
  await page.route(`**/api/v1/sessions/${TEST_SESSION.id}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(TEST_SESSION),
    });
  });

  // APIモック: メッセージ取得
  await page.route(
    `**/api/v1/sessions/${TEST_SESSION.id}/messages`,
    (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ messages: TEST_SESSION.messages }),
      });
    },
  );
}

/**
 * ダウンロードファイルを待機して取得
 */
async function waitForDownload(
  page: Page,
  triggerAction: () => Promise<void>,
): Promise<{ content: string; filename: string }> {
  const downloadPromise = page.waitForEvent("download");
  await triggerAction();
  const download = await downloadPromise;

  const filename = download.suggestedFilename();
  const downloadPath = await download.path();

  if (!downloadPath) {
    throw new Error("Download path is null");
  }

  const content = await fs.readFile(downloadPath, "utf-8");
  return { content, filename };
}

/**
 * エクスポートダイアログを開く
 */
async function openExportDialog(page: Page): Promise<void> {
  await page.goto(`/chat/history/${TEST_SESSION.id}`);
  await page.getByRole("button", { name: /エクスポート/i }).click();
  await expect(
    page.getByRole("dialog", { name: /エクスポート/i }),
  ).toBeVisible();
}

// ============================================================
// メインテストスイート
// ============================================================

test.describe("チャット履歴エクスポート機能", () => {
  test.beforeEach(async ({ page }) => {
    await seedTestSession(page);
  });

  // ============================================================
  // 1. Markdownエクスポート
  // ============================================================

  test("全メッセージをMarkdown形式でエクスポートできる", async ({ page }) => {
    // APIモック: Markdownエクスポート
    await page.route(
      `**/api/v1/sessions/${TEST_SESSION.id}/export?format=markdown&range=all&includeMetadata=true&download=true`,
      (route) => {
        const markdownContent = `# ${TEST_SESSION.title}

**作成日**: 2025-12-20 14:30:00
**メッセージ数**: ${TEST_SESSION.messageCount}件
**総トークン数**: ${TEST_SESSION.totalTokens}

---

## ユーザー (2025-12-20 14:30:15)

${TEST_SESSION.messages[0].content}

---

## アシスタント (2025-12-20 14:30:18)

**モデル**: anthropic/claude-3-5-sonnet-20241022
**トークン**: 入力: 45, 出力: 320

${TEST_SESSION.messages[1].content}

---`;

        route.fulfill({
          status: 200,
          contentType: "text/markdown; charset=utf-8",
          headers: {
            "Content-Disposition": `attachment; filename="${TEST_SESSION.title}.md"; filename*=UTF-8''${encodeURIComponent(TEST_SESSION.title)}.md`,
            "X-Export-Format": "markdown",
            "X-Message-Count": String(TEST_SESSION.messageCount),
          },
          body: markdownContent,
        });
      },
    );

    await openExportDialog(page);

    // Markdown形式を選択
    await page.getByRole("radio", { name: /markdown/i }).click();

    // メタデータ含める
    await page.getByRole("checkbox", { name: /メタデータを含める/i }).check();

    // ダウンロード実行
    const { content, filename } = await waitForDownload(page, async () => {
      await page.getByRole("button", { name: /ダウンロード/i }).click();
    });

    // ファイル名の検証
    expect(filename).toMatch(/\.md$/);
    expect(filename).toContain(TEST_SESSION.title);

    // コンテンツの検証
    expect(content).toContain(`# ${TEST_SESSION.title}`);
    expect(content).toContain(
      `**メッセージ数**: ${TEST_SESSION.messageCount}件`,
    );
    expect(content).toContain(TEST_SESSION.messages[0].content);
    expect(content).toContain(TEST_SESSION.messages[1].content);
    expect(content).toContain("anthropic/claude-3-5-sonnet-20241022");
    expect(content).toContain("**トークン**: 入力: 45, 出力: 320");
  });

  test("メタデータなしでMarkdownエクスポートできる", async ({ page }) => {
    await page.route(
      `**/api/v1/sessions/${TEST_SESSION.id}/export?format=markdown&range=all&includeMetadata=false&download=true`,
      (route) => {
        const markdownContent = `# ${TEST_SESSION.title}

**ユーザー**: ${TEST_SESSION.messages[0].content}

**AI**: ${TEST_SESSION.messages[1].content}
`;
        route.fulfill({
          status: 200,
          contentType: "text/markdown; charset=utf-8",
          headers: {
            "Content-Disposition": `attachment; filename="${TEST_SESSION.title}.md"; filename*=UTF-8''${encodeURIComponent(TEST_SESSION.title)}.md`,
          },
          body: markdownContent,
        });
      },
    );

    await openExportDialog(page);

    await page.getByRole("radio", { name: /markdown/i }).click();
    await page.getByRole("checkbox", { name: /メタデータを含める/i }).uncheck();

    const { content } = await waitForDownload(page, async () => {
      await page.getByRole("button", { name: /ダウンロード/i }).click();
    });

    // メタデータが含まれていないことを確認
    expect(content).not.toContain("**モデル**:");
    expect(content).not.toContain("**トークン**:");
    expect(content).toContain(TEST_SESSION.messages[0].content);
    expect(content).toContain(TEST_SESSION.messages[1].content);
  });

  // ============================================================
  // 2. JSONエクスポート
  // ============================================================

  test("全メッセージをJSON形式でエクスポートできる", async ({ page }) => {
    const jsonResponse = {
      session: {
        id: TEST_SESSION.id,
        title: TEST_SESSION.title,
        createdAt: "2025-12-20T14:30:00.000Z",
        updatedAt: "2025-12-20T15:45:00.000Z",
        messageCount: TEST_SESSION.messageCount,
        totalTokens: TEST_SESSION.totalTokens,
        tags: ["react", "frontend"],
      },
      messages: TEST_SESSION.messages,
      exportMetadata: {
        exportedAt: "2025-12-20T16:00:00.000Z",
        format: "json",
        range: "all",
        version: "1.0.0",
      },
    };

    await page.route(
      `**/api/v1/sessions/${TEST_SESSION.id}/export?format=json&range=all&includeMetadata=true&download=true`,
      (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json; charset=utf-8",
          headers: {
            "Content-Disposition": `attachment; filename="${TEST_SESSION.title}.json"; filename*=UTF-8''${encodeURIComponent(TEST_SESSION.title)}.json`,
            "X-Export-Format": "json",
          },
          body: JSON.stringify(jsonResponse, null, 2),
        });
      },
    );

    await openExportDialog(page);

    // JSON形式を選択
    await page.getByRole("radio", { name: /json/i }).click();
    await page.getByRole("checkbox", { name: /メタデータを含める/i }).check();

    const { content, filename } = await waitForDownload(page, async () => {
      await page.getByRole("button", { name: /ダウンロード/i }).click();
    });

    // ファイル名の検証
    expect(filename).toMatch(/\.json$/);

    // JSONパース可能性を検証
    const parsed = JSON.parse(content);
    expect(parsed).toHaveProperty("session");
    expect(parsed).toHaveProperty("messages");
    expect(parsed).toHaveProperty("exportMetadata");
    expect(parsed.session.id).toBe(TEST_SESSION.id);
    expect(parsed.messages).toHaveLength(2);
    expect(parsed.exportMetadata.format).toBe("json");
  });

  // ============================================================
  // 3. 選択メッセージのエクスポート
  // ============================================================

  test("選択したメッセージのみエクスポートできる", async ({ page }) => {
    const selectedMessageIds = ["msg1", "msg2"];
    const selectedMessages = TEST_SESSION.messages.filter((msg) =>
      selectedMessageIds.includes(msg.id),
    );

    await page.route(
      `**/api/v1/sessions/${TEST_SESSION.id}/export?format=markdown&range=selected&messageIds=${selectedMessageIds.join(",")}&includeMetadata=true&download=true`,
      (route) => {
        const markdownContent = `# ${TEST_SESSION.title}

**選択メッセージ数**: ${selectedMessages.length}件

${selectedMessages.map((msg) => `## ${msg.role}\n\n${msg.content}`).join("\n\n---\n\n")}`;

        route.fulfill({
          status: 200,
          contentType: "text/markdown; charset=utf-8",
          headers: {
            "X-Message-Count": String(selectedMessages.length),
          },
          body: markdownContent,
        });
      },
    );

    await openExportDialog(page);

    // エクスポート範囲を「選択したメッセージ」に変更
    await page.getByRole("radio", { name: /選択したメッセージ/i }).click();

    // メッセージを選択（チェックボックス）
    for (const msgId of selectedMessageIds) {
      await page.getByTestId(`message-checkbox-${msgId}`).check();
    }

    const { content } = await waitForDownload(page, async () => {
      await page.getByRole("button", { name: /ダウンロード/i }).click();
    });

    expect(content).toContain(
      `**選択メッセージ数**: ${selectedMessages.length}件`,
    );
    expect(content).toContain(TEST_SESSION.messages[0].content);
    expect(content).toContain(TEST_SESSION.messages[1].content);
  });

  // ============================================================
  // 4. エクスポートプレビュー
  // ============================================================

  test("エクスポート前にプレビュー情報を表示できる", async ({ page }) => {
    const previewData = {
      sessionId: TEST_SESSION.id,
      title: TEST_SESSION.title,
      messageCount: TEST_SESSION.messageCount,
      totalTokens: TEST_SESSION.totalTokens,
      estimatedFileSize: {
        markdown: 15234,
        json: 28456,
      },
      dateRange: {
        firstMessage: "2025-12-20T14:30:15.000Z",
        lastMessage: "2025-12-20T15:45:00.000Z",
      },
      modelUsage: {
        "anthropic/claude-3-5-sonnet-20241022": 12,
        "openai/gpt-4": 0,
      },
    };

    await page.route(
      `**/api/v1/sessions/${TEST_SESSION.id}/preview?format=markdown`,
      (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(previewData),
        });
      },
    );

    await openExportDialog(page);

    // プレビューボタンをクリック
    await page.getByRole("button", { name: /プレビュー/i }).click();

    // プレビュー情報の表示を確認
    await expect(
      page.getByText(`メッセージ数: ${TEST_SESSION.messageCount}件`),
    ).toBeVisible();
    await expect(
      page.getByText(`総トークン数: ${TEST_SESSION.totalTokens}`),
    ).toBeVisible();
    await expect(
      page.getByText(/推定ファイルサイズ: 15,234 bytes/i),
    ).toBeVisible();
    await expect(
      page.getByText(/anthropic\/claude-3-5-sonnet-20241022: 12件/i),
    ).toBeVisible();
  });

  // ============================================================
  // 5. エラーハンドリング
  // ============================================================

  test("セッションが見つからない場合、エラーメッセージを表示する", async ({
    page,
  }) => {
    await page.route(
      `**/api/v1/sessions/${TEST_SESSION.id}/export?**`,
      (route) => {
        route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({
            type: "https://api.example.com/errors/not-found",
            title: "Session Not Found",
            status: 404,
            detail: `Session with ID '${TEST_SESSION.id}' not found`,
            instance: `/api/v1/sessions/${TEST_SESSION.id}/export`,
          }),
        });
      },
    );

    await openExportDialog(page);

    await page.getByRole("radio", { name: /markdown/i }).click();
    await page.getByRole("button", { name: /ダウンロード/i }).click();

    // エラーメッセージの表示を確認（ダイアログ内）
    const dialog = page.getByRole("dialog", { name: /エクスポート/i });
    await expect(
      dialog.getByRole("alert").getByText(/セッションが見つかりませんでした/i),
    ).toBeVisible({ timeout: 10000 });
  });

  test("エクスポート中にネットワークエラーが発生した場合、エラーメッセージを表示する", async ({
    page,
  }) => {
    await page.route(
      `**/api/v1/sessions/${TEST_SESSION.id}/export?**`,
      (route) => {
        route.abort("failed");
      },
    );

    await openExportDialog(page);

    await page.getByRole("radio", { name: /markdown/i }).click();
    await page.getByRole("button", { name: /ダウンロード/i }).click();

    // エラーメッセージの表示を確認（ダイアログ内）
    const dialog = page.getByRole("dialog", { name: /エクスポート/i });
    const alert = dialog.getByRole("alert");
    await expect(alert).toBeVisible({ timeout: 10000 });
    // ネットワークエラー時は"Failed to fetch"または"エクスポートに失敗しました"
    await expect(
      alert.locator(
        ":text-matches('(Failed to fetch|エクスポートに失敗しました)', 'i')",
      ),
    ).toBeVisible();
  });

  test("選択メッセージが不正な場合、エラーメッセージを表示する", async ({
    page,
  }) => {
    await page.route(
      `**/api/v1/sessions/${TEST_SESSION.id}/export?**`,
      (route) => {
        route.fulfill({
          status: 422,
          contentType: "application/json",
          body: JSON.stringify({
            type: "https://api.example.com/errors/unprocessable",
            title: "Invalid Message Selection",
            status: 422,
            detail:
              "One or more message IDs do not belong to the specified session",
            instance: `/api/v1/sessions/${TEST_SESSION.id}/export`,
            invalidMessageIds: ["msg999", "msg888"],
          }),
        });
      },
    );

    await openExportDialog(page);

    await page.getByRole("radio", { name: /選択したメッセージ/i }).click();
    await page.getByTestId("message-checkbox-msg999").check();

    await page.getByRole("button", { name: /ダウンロード/i }).click();

    // エラーメッセージの表示を確認
    await expect(
      page.getByRole("alert", {
        name: /選択したメッセージが不正です/i,
      }),
    ).toBeVisible();
  });

  // ============================================================
  // 6. ローディング状態
  // ============================================================

  test("エクスポート中はローディング状態を表示する", async ({ page }) => {
    let resolveExport: ((value: unknown) => void) | null = null;
    const exportPromise = new Promise((resolve) => {
      resolveExport = resolve;
    });

    await page.route(
      `**/api/v1/sessions/${TEST_SESSION.id}/export?**`,
      async (route) => {
        await exportPromise; // エクスポート完了を待機
        route.fulfill({
          status: 200,
          contentType: "text/markdown",
          body: `# ${TEST_SESSION.title}`,
        });
      },
    );

    await openExportDialog(page);

    await page.getByRole("radio", { name: /markdown/i }).click();

    // ダウンロードボタンをクリック（非同期）
    const downloadButtonClick = page
      .getByRole("button", { name: /ダウンロード/i })
      .click();

    // ローディングスピナーの表示を確認
    await expect(
      page.getByRole("status", { name: /読み込み中/i }),
    ).toBeVisible();

    // ダウンロードボタンが無効化されていることを確認
    await expect(
      page.getByRole("button", { name: /ダウンロード/i }),
    ).toBeDisabled();

    // エクスポート完了
    resolveExport?.(null);
    await downloadButtonClick;

    // ローディングスピナーが非表示になることを確認
    await expect(
      page.getByRole("status", { name: /読み込み中/i }),
    ).not.toBeVisible();
  });

  // ============================================================
  // 7. アクセシビリティ
  // ============================================================

  test("エクスポートダイアログはアクセシブルである", async ({ page }) => {
    await openExportDialog(page);

    // ダイアログロールが適切に設定されている
    const dialog = page.getByRole("dialog", { name: /エクスポート/i });
    await expect(dialog).toBeVisible();

    // フォーム要素にラベルが設定されている
    await expect(
      page.getByRole("radio", { name: /markdown/i }),
    ).toHaveAttribute("aria-label");
    await expect(page.getByRole("radio", { name: /json/i })).toHaveAttribute(
      "aria-label",
    );

    // エラーメッセージにaria-liveが設定されている（エラー発生時）
    await page.route(
      `**/api/v1/sessions/${TEST_SESSION.id}/export?**`,
      (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      },
    );

    await page.getByRole("button", { name: /ダウンロード/i }).click();

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute("aria-live", "polite");
  });

  test("キーボードのみでエクスポート操作ができる", async ({ page }) => {
    await page.route(
      `**/api/v1/sessions/${TEST_SESSION.id}/export?**`,
      (route) => {
        route.fulfill({
          status: 200,
          contentType: "text/markdown",
          body: `# ${TEST_SESSION.title}`,
        });
      },
    );

    await page.goto(`/chat/history/${TEST_SESSION.id}`);

    // エクスポートボタンにフォーカスを当てる
    const exportButton = page.getByRole("button", { name: /エクスポート/i });
    await exportButton.focus();

    // Enterキーでダイアログを開く
    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("dialog", { name: /エクスポート/i }),
    ).toBeVisible();

    // Tabキーでフォーム要素を移動
    await page.keyboard.press("Tab"); // Markdown radio
    await page.keyboard.press("Space"); // 選択
    await page.keyboard.press("Tab"); // JSON radio
    await page.keyboard.press("Tab"); // メタデータチェックボックス
    await page.keyboard.press("Tab"); // ダウンロードボタン

    // Enterキーでダウンロード実行
    await page.keyboard.press("Enter");

    // ダウンロードが開始されることを確認（モック経由）
    // 実際のダウンロード検証はwaitForDownloadで行う
  });

  test("Escキーでエクスポートダイアログを閉じることができる", async ({
    page,
  }) => {
    await openExportDialog(page);

    await expect(
      page.getByRole("dialog", { name: /エクスポート/i }),
    ).toBeVisible();

    // Escキーでダイアログを閉じる
    await page.keyboard.press("Escape");

    await expect(
      page.getByRole("dialog", { name: /エクスポート/i }),
    ).not.toBeVisible();
  });

  // ============================================================
  // 8. UI統合テスト
  // ============================================================

  test.describe("UI統合", () => {
    test("チャット履歴ページにエクスポートボタンが表示される", async ({
      page,
    }) => {
      await page.goto(`/chat/history/${TEST_SESSION.id}`);

      // エクスポートボタンの存在確認
      const exportButton = page.getByRole("button", { name: /エクスポート/i });
      await expect(exportButton).toBeVisible();

      // aria-labelの確認
      await expect(exportButton).toHaveAttribute(
        "aria-label",
        expect.stringMatching(/エクスポート/i),
      );
    });

    test("エクスポートボタンにDownloadアイコンが含まれる", async ({ page }) => {
      await page.goto(`/chat/history/${TEST_SESSION.id}`);

      const exportButton = page.getByRole("button", { name: /エクスポート/i });
      await expect(exportButton).toBeVisible();

      // アイコン要素の存在確認（SVGまたはdata-testid）
      const hasIcon = await exportButton
        .locator('svg, [data-testid="download-icon"]')
        .isVisible();
      expect(hasIcon).toBe(true);
    });

    test("エクスポートボタンクリックでダイアログが開く", async ({ page }) => {
      await page.goto(`/chat/history/${TEST_SESSION.id}`);

      // ダイアログが初期状態で非表示であることを確認
      await expect(
        page.getByRole("dialog", { name: /エクスポート/i }),
      ).not.toBeVisible();

      // エクスポートボタンをクリック
      await page.getByRole("button", { name: /エクスポート/i }).click();

      // ダイアログが表示されることを確認
      await expect(
        page.getByRole("dialog", { name: /エクスポート/i }),
      ).toBeVisible();

      // ダイアログにrole="dialog"が設定されていることを確認
      const dialog = page.getByRole("dialog", { name: /エクスポート/i });
      await expect(dialog).toHaveRole("dialog");
    });

    test("キャンセルボタンでダイアログが閉じる", async ({ page }) => {
      await openExportDialog(page);

      // キャンセルボタンをクリック
      await page.getByRole("button", { name: /キャンセル/i }).click();

      // ダイアログが閉じることを確認
      await expect(
        page.getByRole("dialog", { name: /エクスポート/i }),
      ).not.toBeVisible();
    });

    test("ダイアログにセッション情報が正しく渡される", async ({ page }) => {
      await openExportDialog(page);

      const dialog = page.getByRole("dialog", { name: /エクスポート/i });

      // セッションタイトルがダイアログ内に表示されることを確認
      await expect(dialog.getByText(TEST_SESSION.title)).toBeVisible();

      // メッセージ数がダイアログ内に表示されることを確認
      await expect(
        dialog.getByText(`${TEST_SESSION.messageCount}件`),
      ).toBeVisible();
    });

    test("エクスポート成功後にダイアログが自動的に閉じる", async ({ page }) => {
      // エクスポートAPIモック
      await page.route(
        `**/api/v1/sessions/${TEST_SESSION.id}/export?**`,
        (route) => {
          route.fulfill({
            status: 200,
            contentType: "text/markdown; charset=utf-8",
            headers: {
              "Content-Disposition": `attachment; filename="${TEST_SESSION.title}.md"; filename*=UTF-8''${encodeURIComponent(TEST_SESSION.title)}.md`,
            },
            body: `# ${TEST_SESSION.title}`,
          });
        },
      );

      await openExportDialog(page);

      // Markdown形式を選択
      await page.getByRole("radio", { name: /markdown/i }).click();

      // ダウンロード実行
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: /ダウンロード/i }).click();
      await downloadPromise;

      // ダイアログが自動的に閉じることを確認
      await expect(
        page.getByRole("dialog", { name: /エクスポート/i }),
      ).not.toBeVisible();
    });

    test("エクスポートボタンはセッションが選択されていない場合は無効", async ({
      page,
    }) => {
      // セッションなしのチャット履歴ページ
      await page.goto("/chat/history");

      const exportButton = page.getByRole("button", { name: /エクスポート/i });

      // エクスポートボタンが無効化されていることを確認
      await expect(exportButton).toBeDisabled();
    });

    test("ダイアログのオーバーレイクリックでダイアログが閉じる", async ({
      page,
    }) => {
      await openExportDialog(page);

      // オーバーレイをクリック（ダイアログの外側の左上隅）
      await page
        .locator('[data-testid="dialog-overlay"]')
        .click({ position: { x: 10, y: 10 } });

      // ダイアログが閉じることを確認
      await expect(
        page.getByRole("dialog", { name: /エクスポート/i }),
      ).not.toBeVisible();
    });

    test("複数回ダイアログを開閉できる", async ({ page }) => {
      await page.goto(`/chat/history/${TEST_SESSION.id}`);

      // 1回目: 開く → 閉じる
      await page.getByRole("button", { name: /エクスポート/i }).click();
      await expect(
        page.getByRole("dialog", { name: /エクスポート/i }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("dialog", { name: /エクスポート/i }),
      ).not.toBeVisible();

      // 2回目: 開く → 閉じる
      await page.getByRole("button", { name: /エクスポート/i }).click();
      await expect(
        page.getByRole("dialog", { name: /エクスポート/i }),
      ).toBeVisible();
      await page.getByRole("button", { name: /キャンセル/i }).click();
      await expect(
        page.getByRole("dialog", { name: /エクスポート/i }),
      ).not.toBeVisible();

      // 3回目: 開く → 閉じる
      await page.getByRole("button", { name: /エクスポート/i }).click();
      await expect(
        page.getByRole("dialog", { name: /エクスポート/i }),
      ).toBeVisible();
      await page
        .locator('[data-testid="dialog-overlay"]')
        .click({ position: { x: 10, y: 10 } });
      await expect(
        page.getByRole("dialog", { name: /エクスポート/i }),
      ).not.toBeVisible();
    });

    test("ダイアログが開いている間はページスクロールが無効になる", async ({
      page,
    }) => {
      await openExportDialog(page);

      // body要素にoverflow: hiddenが設定されていることを確認
      const bodyOverflow = await page.evaluate(() => {
        return window.getComputedStyle(document.body).overflow;
      });
      expect(bodyOverflow).toBe("hidden");

      // ダイアログを閉じる
      await page.keyboard.press("Escape");

      // スクロールが有効に戻ることを確認
      const bodyOverflowAfter = await page.evaluate(() => {
        return window.getComputedStyle(document.body).overflow;
      });
      expect(bodyOverflowAfter).not.toBe("hidden");
    });
  });
});
