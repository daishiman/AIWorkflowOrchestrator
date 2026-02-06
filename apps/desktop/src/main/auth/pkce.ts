/**
 * PKCE (Proof Key for Code Exchange) 生成モジュール
 * RFC 7636準拠
 *
 * @module pkce
 */

import crypto from "node:crypto";
import type { PKCEPair } from "@repo/shared/types/auth";

export type { PKCEPair };

/** RFC 7636 Section 4.1: code_verifierの長さ制約 */
const CODE_VERIFIER_MIN_LENGTH = 43;
const CODE_VERIFIER_MAX_LENGTH = 128;
const DEFAULT_CODE_VERIFIER_LENGTH = 64;

/** RFC 7636 Section 4.1準拠のcode_verifier長を検証 */
function validateVerifierLength(length: number): void {
  if (length < CODE_VERIFIER_MIN_LENGTH || length > CODE_VERIFIER_MAX_LENGTH) {
    throw new RangeError(
      `code_verifier length must be between ${CODE_VERIFIER_MIN_LENGTH} and ${CODE_VERIFIER_MAX_LENGTH}, got ${length}`,
    );
  }
}

/**
 * Base64URLエンコード（RFC 4648 Section 5 / RFC 7636 Appendix A準拠）
 * '+' → '-', '/' → '_', '=' 除去
 */
export function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * PKCE code_verifierを生成する（RFC 7636 Section 4.1）
 *
 * @param length 生成する文字列の長さ（43-128、デフォルト64）
 * @returns Base64URL文字種のみで構成される文字列
 */
export function generateCodeVerifier(
  length: number = DEFAULT_CODE_VERIFIER_LENGTH,
): string {
  validateVerifierLength(length);
  // 長さ分のランダムバイトを生成し、Base64URLエンコード後にtruncate
  const buffer = crypto.randomBytes(Math.ceil((length * 3) / 4));
  return base64URLEncode(buffer).slice(0, length);
}

/**
 * PKCE code_challengeを算出する（RFC 7636 Section 4.2）
 * code_challenge = BASE64URL(SHA256(code_verifier))
 *
 * @param verifier code_verifier文字列
 * @returns SHA-256ハッシュのBase64URLエンコード文字列
 */
export function calculateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return base64URLEncode(hash);
}

/**
 * PKCEペア（code_verifier + code_challenge）を生成する
 *
 * @param length code_verifierの長さ（デフォルト64）
 * @returns PKCEPair
 */
export function generatePKCEPair(length?: number): PKCEPair {
  const codeVerifier = generateCodeVerifier(length);
  const codeChallenge = calculateCodeChallenge(codeVerifier);
  return { codeVerifier, codeChallenge };
}
