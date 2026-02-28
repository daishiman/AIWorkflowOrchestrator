/**
 * ローカルHTTPサーバー テスト
 * Phase 4: TDD Red - 実装前のテスト作成
 *
 * テストID: SRV-01 ~ SRV-07
 *
 * @vitest-environment node
 */

import { describe, it, expect, afterEach } from "vitest";
import { createAuthCallbackServer } from "../authCallbackServer";
import type { AuthCallbackServer } from "../authCallbackServer";

describe("ローカルHTTPサーバー", () => {
  let server: AuthCallbackServer;

  afterEach(async () => {
    if (server?.isRunning) {
      await server.stop();
    }
  });

  it("SRV-01: サーバーが起動しポート番号を返す", async () => {
    server = createAuthCallbackServer();
    const { port } = await server.start();
    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThanOrEqual(65535);
  });

  it("SRV-02: 127.0.0.1でバインドされている", async () => {
    server = createAuthCallbackServer({ host: "127.0.0.1" });
    const { port } = await server.start();
    // localhostで正常にアクセスできることを検証
    const response = await fetch(
      `http://127.0.0.1:${port}/auth/callback?code=test&state=test`,
    );
    expect(response.ok).toBe(true);
  });

  it("SRV-03: authorization_codeとstateを受信する", async () => {
    server = createAuthCallbackServer();
    const { port } = await server.start();
    const callbackPromise = server.waitForCallback();

    // コールバックリクエストを送信
    await fetch(
      `http://127.0.0.1:${port}/auth/callback?code=test_code_123&state=test_state_456`,
    );

    const result = await callbackPromise;
    expect(result.code).toBe("test_code_123");
    expect(result.state).toBe("test_state_456");
  });

  it("SRV-04: コールバック受信後に認証完了HTMLを返却する", async () => {
    server = createAuthCallbackServer();
    const { port } = await server.start();

    // waitForCallbackを開始してからリクエスト
    const callbackPromise = server.waitForCallback();
    const response = await fetch(
      `http://127.0.0.1:${port}/auth/callback?code=test&state=test`,
    );
    await callbackPromise;

    const html = await response.text();
    expect(html).toContain("認証が完了しました");
    expect(response.headers.get("content-type")).toContain("text/html");
  });

  it("SRV-05: stop()でサーバーが停止しポートが解放される", async () => {
    server = createAuthCallbackServer();
    const { port } = await server.start();
    expect(server.isRunning).toBe(true);

    await server.stop();
    expect(server.isRunning).toBe(false);

    // 停止後は接続できない
    await expect(fetch(`http://127.0.0.1:${port}/`)).rejects.toThrow();
  });

  it("SRV-06: タイムアウト時にエラーが発生する", async () => {
    server = createAuthCallbackServer({ timeoutMs: 100 });
    await server.start();

    // 100msのタイムアウトでコールバック待機
    await expect(server.waitForCallback()).rejects.toThrow(/timeout/i);

    // タイムアウト後にサーバーを確実に停止し、ワーカー終了前にクリーンアップを完了させる
    await server.stop();
  });

  it("SRV-07: codeパラメータ欠如時にエラーレスポンスを返す", async () => {
    server = createAuthCallbackServer();
    const { port } = await server.start();

    // codeパラメータなし（stateのみ）
    const response = await fetch(
      `http://127.0.0.1:${port}/auth/callback?state=test`,
    );
    expect(response.status).toBe(400);

    const html = await response.text();
    expect(html).toContain("認証コードが見つかりません");
  });

  it("SRV-08: stateなしでもcodeがあれば成功する（PKCE対応）", async () => {
    server = createAuthCallbackServer();
    const { port } = await server.start();
    const callbackPromise = server.waitForCallback();

    // Supabase PKCE フローではstateはSupabaseが内部管理するため省略可能
    const response = await fetch(
      `http://127.0.0.1:${port}/auth/callback?code=pkce_code_only`,
    );

    expect(response.ok).toBe(true);
    const result = await callbackPromise;
    expect(result.code).toBe("pkce_code_only");
    expect(result.state).toBeUndefined();
  });

  // === Phase 6: エッジケーステスト ===

  describe("エッジケース", () => {
    it("EDGE-01: 複数サーバーが異なるポートで動的割り当てされる", async () => {
      const server2 = createAuthCallbackServer();
      server = createAuthCallbackServer();
      const { port: port1 } = await server.start();
      const { port: port2 } = await server2.start();
      expect(port1).not.toBe(port2);
      expect(port1).toBeGreaterThan(0);
      expect(port2).toBeGreaterThan(0);
      await server2.stop();
    });

    it("EDGE-04: 起動直後のコールバックが正常処理される", async () => {
      server = createAuthCallbackServer();
      const { port } = await server.start();
      const callbackPromise = server.waitForCallback();
      await fetch(
        `http://127.0.0.1:${port}/auth/callback?code=immediate&state=fast`,
      );
      const result = await callbackPromise;
      expect(result.code).toBe("immediate");
      expect(result.state).toBe("fast");
    });

    it("EDGE-05: 長いauthorization_codeを処理する", async () => {
      server = createAuthCallbackServer();
      const { port } = await server.start();
      const longCode = "a".repeat(1000);
      const callbackPromise = server.waitForCallback();
      await fetch(
        `http://127.0.0.1:${port}/auth/callback?code=${longCode}&state=test`,
      );
      const result = await callbackPromise;
      expect(result.code).toBe(longCode);
      expect(result.code.length).toBe(1000);
    });

    it("EDGE-06: errorパラメータのみのコールバックに400を返す", async () => {
      server = createAuthCallbackServer();
      const { port } = await server.start();
      // error parameterのみ（code/stateなし）→ 400
      const response = await fetch(
        `http://127.0.0.1:${port}/auth/callback?error=access_denied&error_description=User+denied`,
      );
      expect(response.status).toBe(400);
    });

    it("SEC-05: HTTPサーバーが127.0.0.1のみでリッスンする", async () => {
      server = createAuthCallbackServer({ host: "127.0.0.1" });
      const { port } = await server.start();
      // 127.0.0.1でアクセス可能
      const response = await fetch(
        `http://127.0.0.1:${port}/auth/callback?code=test&state=test`,
      );
      expect(response.ok).toBe(true);
    });
  });
});
