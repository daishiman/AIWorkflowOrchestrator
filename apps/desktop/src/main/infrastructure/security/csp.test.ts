/**
 * CSPモジュール テスト
 *
 * TDD Red Phase: これらのテストは実装前に作成され、
 * 実装が完了するまで失敗する（Red状態）
 */

import { describe, it, expect } from "vitest";
import {
  generateCSP,
  getProductionDirectives,
  getDevelopmentDirectives,
  buildCSPString,
  type CSPDirectiveMap,
} from "./csp";

describe("CSPモジュール", () => {
  describe("generateCSP", () => {
    it("本番環境ではunsafe-evalを含まない", () => {
      const result = generateCSP({ isDev: false });

      expect(result.policy).not.toContain("unsafe-eval");
    });

    it("開発環境ではunsafe-evalを含む", () => {
      const result = generateCSP({ isDev: true });

      expect(result.policy).toContain("unsafe-eval");
    });

    it("SUPABASE_URL指定時はconnect-srcにSupabase URLが含まれる", () => {
      const result = generateCSP({
        isDev: false,
        supabaseUrl: "https://abc123.supabase.co",
      });

      expect(result.policy).toContain("https://abc123.supabase.co");
    });

    it("SUPABASE_URL指定時はconnect-srcにワイルドカードsupabase.coが含まれる", () => {
      const result = generateCSP({
        isDev: false,
        supabaseUrl: "https://abc123.supabase.co",
      });

      expect(result.policy).toContain("https://*.supabase.co");
    });

    it("SUPABASE_URL未指定時はconnect-srcは'self'のみ", () => {
      const result = generateCSP({ isDev: false });

      // connect-srcに'self'が含まれる
      expect(result.directives["connect-src"]).toContain("'self'");
      // supabase.coは含まれない
      expect(result.policy).not.toContain("supabase.co");
    });

    it("不正なSUPABASE_URLはエラーにならず無視される", () => {
      const result = generateCSP({
        isDev: false,
        supabaseUrl: "not-a-valid-url",
      });

      // エラーにならない
      expect(result.policy).toBeDefined();
      // 不正なURLは含まれない
      expect(result.policy).not.toContain("not-a-valid-url");
    });

    it("CSP結果にdirectivesとpolicyの両方が含まれる", () => {
      const result = generateCSP({ isDev: false });

      expect(result).toHaveProperty("policy");
      expect(result).toHaveProperty("directives");
      expect(typeof result.policy).toBe("string");
      expect(typeof result.directives).toBe("object");
    });
  });

  describe("getProductionDirectives", () => {
    it("frame-ancestorsが'none'である", () => {
      const directives = getProductionDirectives();

      expect(directives["frame-ancestors"]).toEqual(["'none'"]);
    });

    it("upgrade-insecure-requestsが含まれる", () => {
      const directives = getProductionDirectives();

      expect(directives["upgrade-insecure-requests"]).toBeDefined();
      expect(directives["upgrade-insecure-requests"]).toEqual([]);
    });

    it("script-srcが'self'のみである（unsafe-evalなし）", () => {
      const directives = getProductionDirectives();

      expect(directives["script-src"]).toEqual(["'self'"]);
    });

    it("object-srcが'none'である", () => {
      const directives = getProductionDirectives();

      expect(directives["object-src"]).toEqual(["'none'"]);
    });

    it("frame-srcが'none'である", () => {
      const directives = getProductionDirectives();

      expect(directives["frame-src"]).toEqual(["'none'"]);
    });

    it("base-uriが'self'である", () => {
      const directives = getProductionDirectives();

      expect(directives["base-uri"]).toEqual(["'self'"]);
    });

    it("form-actionが'self'である", () => {
      const directives = getProductionDirectives();

      expect(directives["form-action"]).toEqual(["'self'"]);
    });

    it("style-srcに'unsafe-inline'が含まれる（Tailwind CSS用）", () => {
      const directives = getProductionDirectives();

      expect(directives["style-src"]).toContain("'self'");
      expect(directives["style-src"]).toContain("'unsafe-inline'");
    });

    it("img-srcにdata:とhttps:が含まれる", () => {
      const directives = getProductionDirectives();

      expect(directives["img-src"]).toContain("'self'");
      expect(directives["img-src"]).toContain("data:");
      expect(directives["img-src"]).toContain("https:");
    });

    it("Supabase URL指定時はconnect-srcにURLが含まれる", () => {
      const directives = getProductionDirectives(
        "https://myproject.supabase.co",
      );

      expect(directives["connect-src"]).toContain(
        "https://myproject.supabase.co",
      );
    });
  });

  describe("getDevelopmentDirectives", () => {
    it("script-srcに'unsafe-inline'と'unsafe-eval'が含まれる", () => {
      const directives = getDevelopmentDirectives();

      expect(directives["script-src"]).toContain("'self'");
      expect(directives["script-src"]).toContain("'unsafe-inline'");
      expect(directives["script-src"]).toContain("'unsafe-eval'");
    });

    it("connect-srcにws:とwss:が含まれる（HMR用）", () => {
      const directives = getDevelopmentDirectives();

      expect(directives["connect-src"]).toContain("ws:");
      expect(directives["connect-src"]).toContain("wss:");
    });

    it("connect-srcにhttps:が含まれる（開発時の外部API用）", () => {
      const directives = getDevelopmentDirectives();

      expect(directives["connect-src"]).toContain("https:");
    });

    it("frame-ancestorsが'none'である（開発環境でも）", () => {
      const directives = getDevelopmentDirectives();

      expect(directives["frame-ancestors"]).toEqual(["'none'"]);
    });
  });

  describe("buildCSPString", () => {
    it("ディレクティブをセミコロンで連結する", () => {
      const directives: CSPDirectiveMap = {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
      };

      const result = buildCSPString(directives);

      expect(result).toBe("default-src 'self'; script-src 'self'");
    });

    it("値なしディレクティブを正しく処理する", () => {
      const directives: CSPDirectiveMap = {
        "upgrade-insecure-requests": [],
      };

      const result = buildCSPString(directives);

      expect(result).toBe("upgrade-insecure-requests");
    });

    it("複数の値を持つディレクティブをスペースで連結する", () => {
      const directives: CSPDirectiveMap = {
        "img-src": ["'self'", "data:", "https:"],
      };

      const result = buildCSPString(directives);

      expect(result).toBe("img-src 'self' data: https:");
    });

    it("空のディレクティブマップは空文字列を返す", () => {
      const directives: CSPDirectiveMap = {};

      const result = buildCSPString(directives);

      expect(result).toBe("");
    });

    it("undefined値のディレクティブはスキップされる", () => {
      const directives: CSPDirectiveMap = {
        "default-src": ["'self'"],
        "script-src": undefined,
      };

      const result = buildCSPString(directives);

      expect(result).toBe("default-src 'self'");
      expect(result).not.toContain("script-src");
    });
  });

  describe("セキュリティ要件", () => {
    it("本番環境のCSPは十分に厳格である", () => {
      const result = generateCSP({ isDev: false });

      // 必須のセキュリティディレクティブが含まれている
      expect(result.policy).toContain("default-src 'self'");
      expect(result.policy).toContain("object-src 'none'");
      expect(result.policy).toContain("frame-ancestors 'none'");
      expect(result.policy).toContain("base-uri 'self'");
      expect(result.policy).toContain("form-action 'self'");
    });

    it("本番環境のCSPはeval系を禁止している", () => {
      const result = generateCSP({ isDev: false });

      expect(result.policy).not.toContain("unsafe-eval");
    });

    it("クリックジャッキング対策が有効である", () => {
      const result = generateCSP({ isDev: false });

      expect(result.policy).toContain("frame-ancestors 'none'");
    });
  });
});
