/**
 * PKCE生成モジュール テスト
 * Phase 4: TDD Red - 実装前のテスト作成
 *
 * テストID: PKCE-01 ~ PKCE-07
 */

import { describe, it, expect } from "vitest";
import {
  generatePKCEPair,
  generateCodeVerifier,
  calculateCodeChallenge,
} from "../pkce";

describe("PKCE生成モジュール", () => {
  describe("generateCodeVerifier", () => {
    it("PKCE-01: デフォルト長さのcode_verifierを生成する", () => {
      const verifier = generateCodeVerifier();
      // RFC 7636 Section 4.1: 43-128文字
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier.length).toBeLessThanOrEqual(128);
    });

    it("PKCE-02: Base64URL文字種のみで構成される", () => {
      const verifier = generateCodeVerifier();
      // RFC 7636 Section 4.1: unreserved characters
      // [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
      expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
    });

    it("PKCE-05: カスタム長さ指定で生成される", () => {
      const short = generateCodeVerifier(43);
      expect(short.length).toBe(43);

      const long = generateCodeVerifier(128);
      expect(long.length).toBe(128);
    });

    it("PKCE-06: 連続呼び出しで異なるcode_verifierが生成される", () => {
      const v1 = generateCodeVerifier();
      const v2 = generateCodeVerifier();
      expect(v1).not.toBe(v2);
    });
  });

  describe("calculateCodeChallenge", () => {
    it("PKCE-03: RFC 7636 Appendix Bの検証ベクトルと一致する", () => {
      // RFC 7636 Appendix B の公式テストベクトル
      const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
      const expectedChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
      expect(calculateCodeChallenge(verifier)).toBe(expectedChallenge);
    });

    it("PKCE-07: パディング文字（=）が含まれない", () => {
      const verifier = generateCodeVerifier();
      const challenge = calculateCodeChallenge(verifier);
      expect(challenge).not.toContain("=");
      expect(challenge).not.toContain("+");
      expect(challenge).not.toContain("/");
    });
  });

  describe("generatePKCEPair", () => {
    it("PKCE-04: codeVerifierとcodeChallengeのペアを返す", () => {
      const pair = generatePKCEPair();
      expect(pair).toHaveProperty("codeVerifier");
      expect(pair).toHaveProperty("codeChallenge");
      expect(pair.codeVerifier.length).toBeGreaterThanOrEqual(43);
      expect(pair.codeVerifier.length).toBeLessThanOrEqual(128);
      expect(pair.codeChallenge.length).toBeGreaterThan(0);
    });

    it("PKCE-04b: codeVerifierからcodeChallengeが正しく導出される", () => {
      const pair = generatePKCEPair();
      const recomputedChallenge = calculateCodeChallenge(pair.codeVerifier);
      expect(pair.codeChallenge).toBe(recomputedChallenge);
    });
  });

  // === Phase 6: セキュリティテスト ===

  describe("セキュリティ", () => {
    it("SEC-07: RFC 7636範囲外のcode_verifier長でRangeErrorが発生する", () => {
      // RFC 7636 Section 4.1: 43-128文字が規定範囲
      expect(() => generateCodeVerifier(42)).toThrow(RangeError);
      expect(() => generateCodeVerifier(129)).toThrow(RangeError);
      expect(() => generateCodeVerifier(0)).toThrow(RangeError);

      // 境界値: 43と128はRFC準拠
      expect(() => generateCodeVerifier(43)).not.toThrow();
      expect(() => generateCodeVerifier(128)).not.toThrow();

      // デフォルト値（64）はRFC準拠範囲
      const defaultVerifier = generateCodeVerifier();
      expect(defaultVerifier.length).toBeGreaterThanOrEqual(43);
      expect(defaultVerifier.length).toBeLessThanOrEqual(128);
    });
  });
});
