/**
 * ローカルHTTPサーバー - OAuth認証コールバック受信
 *
 * 127.0.0.1の動的ポートでHTTPサーバーを起動し、
 * OAuth認証プロバイダーからのコールバック（authorization_code + state）を受信する。
 *
 * @module authCallbackServer
 */

import http from "node:http";
import { URL } from "node:url";
import type { AuthCallbackResult } from "@repo/shared/types/auth";

export type { AuthCallbackResult };

export interface AuthCallbackServerOptions {
  host?: string;
  timeoutMs?: number;
}

export interface AuthCallbackServer {
  start(): Promise<{ port: number }>;
  stop(): Promise<void>;
  waitForCallback(): Promise<AuthCallbackResult>;
  readonly isRunning: boolean;
}

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_TIMEOUT_MS = 300_000; // 5分

const SUCCESS_HTML = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>認証完了</title></head>
<body style="font-family:system-ui;text-align:center;padding:60px">
  <h1>認証が完了しました</h1>
  <p>このタブを閉じてアプリケーションに戻ってください。</p>
  <script>setTimeout(()=>{window.close()},2000)</script>
</body>
</html>`;

/** HTMLエスケープ（XSS防止） */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const ERROR_HTML = (message: string) => `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>認証エラー</title></head>
<body style="font-family:system-ui;text-align:center;padding:60px">
  <h1>認証に失敗しました</h1>
  <p>エラー: ${escapeHtml(message)}</p>
  <p>アプリケーションに戻って再度お試しください。</p>
</body>
</html>`;

/**
 * ローカルHTTPサーバーを作成する
 */
export function createAuthCallbackServer(
  options?: AuthCallbackServerOptions,
): AuthCallbackServer {
  const host = options?.host ?? DEFAULT_HOST;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let server: http.Server | null = null;
  let port = 0;
  let callbackResolve: ((result: AuthCallbackResult) => void) | null = null;
  let callbackReject: ((error: Error) => void) | null = null;
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  const instance: AuthCallbackServer = {
    get isRunning(): boolean {
      return server?.listening ?? false;
    },

    async start(): Promise<{ port: number }> {
      return new Promise((resolve, reject) => {
        server = http.createServer(
          (req: http.IncomingMessage, res: http.ServerResponse) => {
            const requestUrl = new URL(
              req.url ?? "/",
              `http://${host}:${port}`,
            );

            if (requestUrl.pathname !== "/auth/callback") {
              res.writeHead(404, { "Content-Type": "text/plain" });
              res.end("Not Found");
              return;
            }

            const code = requestUrl.searchParams.get("code");
            const state = requestUrl.searchParams.get("state");

            if (!code || !state) {
              res.writeHead(400, {
                "Content-Type": "text/html; charset=utf-8",
              });
              res.end(ERROR_HTML("必要なパラメータが不足しています"));
              return;
            }

            // 成功レスポンス
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(SUCCESS_HTML);

            // コールバック結果を通知
            if (callbackResolve) {
              callbackResolve({ code, state });
              callbackResolve = null;
              callbackReject = null;
              if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
              }
            }
          },
        );

        server.listen(0, host, () => {
          const addr = server!.address();
          if (addr && typeof addr === "object") {
            port = addr.port;
            resolve({ port });
          } else {
            reject(new Error("Failed to get server address"));
          }
        });

        server.on("error", (err: Error) => {
          reject(err);
        });
      });
    },

    async waitForCallback(): Promise<AuthCallbackResult> {
      return new Promise((resolve, reject) => {
        callbackResolve = resolve;
        callbackReject = reject;

        timeoutHandle = setTimeout(() => {
          callbackReject = null;
          callbackResolve = null;
          timeoutHandle = null;
          reject(new Error("Callback timeout: no response received"));

          // タイムアウト時にサーバーも停止
          instance.stop().catch(() => {});
        }, timeoutMs);
      });
    },

    async stop(): Promise<void> {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }

      if (callbackReject) {
        callbackReject(new Error("Server stopped"));
        callbackResolve = null;
        callbackReject = null;
      }

      return new Promise((resolve) => {
        if (!server) {
          resolve();
          return;
        }
        server.close(() => {
          server = null;
          resolve();
        });
      });
    },
  };

  return instance;
}
