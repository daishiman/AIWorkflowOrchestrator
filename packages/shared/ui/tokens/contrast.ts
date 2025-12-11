/**
 * WCAG 2.1 準拠のコントラスト比計算ユーティリティ
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

/**
 * WCAG 2.1 基準値
 */
export const WCAG_THRESHOLDS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const;

/**
 * sRGB成分を線形RGB成分に変換
 * WCAG 2.1仕様に基づく変換
 *
 * @param value - sRGB成分値（0-255）
 * @returns 線形RGB成分値（0-1）
 */
function sRGBToLinear(value: number): number {
  const sRGB = value / 255;
  if (sRGB <= 0.04045) {
    return sRGB / 12.92;
  }
  return Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

/**
 * 16進数カラーコードをRGB成分に分解
 *
 * @param color - 16進数カラーコード（#付きまたは#なし、3桁または6桁）
 * @returns RGB成分配列 [R, G, B]（各0-255）
 * @throws {Error} 無効なカラーコードの場合
 */
function hexToRGB(color: string): [number, number, number] {
  // #を除去
  let hex = color.replace(/^#/, "");

  // 3桁の場合は6桁に拡張
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // 6桁でない場合はエラー
  if (hex.length !== 6) {
    throw new Error(
      `Invalid color format: ${color}. Expected 3 or 6 hex digits.`,
    );
  }

  // 16進数として有効かチェック
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error(
      `Invalid hex color: ${color}. Contains non-hex characters.`,
    );
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return [r, g, b];
}

/**
 * 16進数カラーコードを相対輝度に変換
 *
 * WCAG 2.1仕様:
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 *
 * @param color - 16進数カラーコード（#付きまたは#なし）
 * @returns 相対輝度（0-1）
 */
export function calculateRelativeLuminance(color: string): number {
  const [r, g, b] = hexToRGB(color);

  const rLinear = sRGBToLinear(r);
  const gLinear = sRGBToLinear(g);
  const bLinear = sRGBToLinear(b);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * 2色間のコントラスト比を計算
 *
 * WCAG 2.1仕様:
 * contrast ratio = (L1 + 0.05) / (L2 + 0.05)
 * where L1 is the lighter and L2 is the darker
 *
 * @param foreground - 前景色（16進数）
 * @param background - 背景色（16進数）
 * @returns コントラスト比（1-21）
 */
export function calculateContrastRatio(
  foreground: string,
  background: string,
): number {
  const luminance1 = calculateRelativeLuminance(foreground);
  const luminance2 = calculateRelativeLuminance(background);

  // L1は明るい方、L2は暗い方
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  // 小数点以下2桁に丸める（WCAG推奨）
  return Math.round(ratio * 100) / 100;
}

/**
 * WCAG 2.1 AA基準を満たすか判定
 *
 * - 通常テキスト: 4.5:1以上
 * - 大テキスト（18pt以上、または14pt太字以上）: 3:1以上
 *
 * @param ratio - コントラスト比
 * @param size - テキストサイズ（'normal' | 'large'）
 * @returns AA基準を満たすか
 */
export function meetsWCAGAA(
  ratio: number,
  size: "normal" | "large" = "normal",
): boolean {
  const threshold =
    size === "large" ? WCAG_THRESHOLDS.AA_LARGE : WCAG_THRESHOLDS.AA_NORMAL;
  return ratio >= threshold;
}

/**
 * WCAG 2.1 AAA基準を満たすか判定
 *
 * - 通常テキスト: 7:1以上
 * - 大テキスト（18pt以上、または14pt太字以上）: 4.5:1以上
 *
 * @param ratio - コントラスト比
 * @param size - テキストサイズ（'normal' | 'large'）
 * @returns AAA基準を満たすか
 */
export function meetsWCAGAAA(
  ratio: number,
  size: "normal" | "large" = "normal",
): boolean {
  const threshold =
    size === "large" ? WCAG_THRESHOLDS.AAA_LARGE : WCAG_THRESHOLDS.AAA_NORMAL;
  return ratio >= threshold;
}

/**
 * 色のコントラスト情報を一括取得
 *
 * @param foreground - 前景色（16進数）
 * @param background - 背景色（16進数）
 * @returns コントラスト情報オブジェクト
 */
export function getContrastInfo(
  foreground: string,
  background: string,
): {
  ratio: number;
  AA: { normal: boolean; large: boolean };
  AAA: { normal: boolean; large: boolean };
} {
  const ratio = calculateContrastRatio(foreground, background);

  return {
    ratio,
    AA: {
      normal: meetsWCAGAA(ratio, "normal"),
      large: meetsWCAGAA(ratio, "large"),
    },
    AAA: {
      normal: meetsWCAGAAA(ratio, "normal"),
      large: meetsWCAGAAA(ratio, "large"),
    },
  };
}

/**
 * 推奨される前景色を判定（白または黒）
 *
 * @param background - 背景色（16進数）
 * @returns 推奨前景色（'#FFFFFF' または '#000000'）
 */
export function getRecommendedForeground(
  background: string,
): "#FFFFFF" | "#000000" {
  const luminance = calculateRelativeLuminance(background);
  // 輝度0.179を境界として白黒を判定（WCAG推奨値）
  return luminance > 0.179 ? "#000000" : "#FFFFFF";
}
