/**
 * @file contrast.test.ts
 * @description コントラスト比計算ユーティリティのテスト（TDD: Red）
 * WCAG 2.1仕様に基づく
 * @see https://www.w3.org/TR/WCAG21/#contrast-minimum
 */

import { describe, it, expect } from "vitest";

describe("contrast utility", () => {
  describe("calculateRelativeLuminance", () => {
    it("should calculate relative luminance for black (#000000)", async () => {
      // Arrange
      const color = "#000000";

      // Act
      const { calculateRelativeLuminance } = await import("../contrast");
      const luminance = calculateRelativeLuminance(color);

      // Assert
      expect(luminance).toBe(0);
    });

    it("should calculate relative luminance for white (#FFFFFF)", async () => {
      // Arrange
      const color = "#FFFFFF";

      // Act
      const { calculateRelativeLuminance } = await import("../contrast");
      const luminance = calculateRelativeLuminance(color);

      // Assert
      expect(luminance).toBe(1);
    });

    it("should calculate relative luminance for mid-gray (#808080)", async () => {
      // Arrange
      const color = "#808080";

      // Act
      const { calculateRelativeLuminance } = await import("../contrast");
      const luminance = calculateRelativeLuminance(color);

      // Assert
      // Mid-gray should have luminance around 0.216 (sRGB formula)
      expect(luminance).toBeCloseTo(0.216, 2);
    });

    it("should handle lowercase hex colors", async () => {
      // Arrange
      const color = "#ffffff";

      // Act
      const { calculateRelativeLuminance } = await import("../contrast");
      const luminance = calculateRelativeLuminance(color);

      // Assert
      expect(luminance).toBe(1);
    });

    it("should handle colors without # prefix", async () => {
      // Arrange
      const color = "000000";

      // Act
      const { calculateRelativeLuminance } = await import("../contrast");
      const luminance = calculateRelativeLuminance(color);

      // Assert
      expect(luminance).toBe(0);
    });
  });

  describe("calculateContrastRatio", () => {
    it("should calculate maximum contrast ratio for black and white", async () => {
      // Arrange
      const foreground = "#FFFFFF";
      const background = "#000000";

      // Act
      const { calculateContrastRatio } = await import("../contrast");
      const ratio = calculateContrastRatio(foreground, background);

      // Assert
      expect(ratio).toBe(21); // Maximum contrast ratio
    });

    it("should calculate minimum contrast ratio for identical colors", async () => {
      // Arrange
      const foreground = "#808080";
      const background = "#808080";

      // Act
      const { calculateContrastRatio } = await import("../contrast");
      const ratio = calculateContrastRatio(foreground, background);

      // Assert
      expect(ratio).toBe(1); // Minimum contrast ratio
    });

    it("should calculate contrast ratio for Kanagawa dragonWhite on dragonBlack1", async () => {
      // Arrange
      const foreground = "#C5C9C5"; // dragonWhite
      const background = "#12120F"; // dragonBlack1

      // Act
      const { calculateContrastRatio } = await import("../contrast");
      const ratio = calculateContrastRatio(foreground, background);

      // Assert
      expect(ratio).toBeGreaterThanOrEqual(10); // Expected: ~11.2:1 (WCAG AA基準を大幅に上回る)
      expect(ratio).toBeLessThan(12);
    });

    it("should handle reversed colors (commutative property)", async () => {
      // Arrange
      const color1 = "#FFFFFF";
      const color2 = "#000000";

      // Act
      const { calculateContrastRatio } = await import("../contrast");
      const ratio1 = calculateContrastRatio(color1, color2);
      const ratio2 = calculateContrastRatio(color2, color1);

      // Assert
      expect(ratio1).toBe(ratio2);
    });
  });

  describe("meetsWCAGAA", () => {
    it("should pass for 4.5:1 ratio (normal text)", async () => {
      // Arrange
      const ratio = 4.5;

      // Act
      const { meetsWCAGAA } = await import("../contrast");
      const result = meetsWCAGAA(ratio, "normal");

      // Assert
      expect(result).toBe(true);
    });

    it("should pass for 3:1 ratio (large text)", async () => {
      // Arrange
      const ratio = 3.0;

      // Act
      const { meetsWCAGAA } = await import("../contrast");
      const result = meetsWCAGAA(ratio, "large");

      // Assert
      expect(result).toBe(true);
    });

    it("should fail for 4.49:1 ratio (normal text)", async () => {
      // Arrange
      const ratio = 4.49;

      // Act
      const { meetsWCAGAA } = await import("../contrast");
      const result = meetsWCAGAA(ratio, "normal");

      // Assert
      expect(result).toBe(false);
    });

    it("should fail for 2.99:1 ratio (large text)", async () => {
      // Arrange
      const ratio = 2.99;

      // Act
      const { meetsWCAGAA } = await import("../contrast");
      const result = meetsWCAGAA(ratio, "large");

      // Assert
      expect(result).toBe(false);
    });

    it("should default to normal text when size is not specified", async () => {
      // Arrange
      const ratio = 4.5;

      // Act
      const { meetsWCAGAA } = await import("../contrast");
      const result = meetsWCAGAA(ratio);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("meetsWCAGAAA", () => {
    it("should pass for 7:1 ratio (normal text)", async () => {
      // Arrange
      const ratio = 7.0;

      // Act
      const { meetsWCAGAAA } = await import("../contrast");
      const result = meetsWCAGAAA(ratio, "normal");

      // Assert
      expect(result).toBe(true);
    });

    it("should pass for 4.5:1 ratio (large text)", async () => {
      // Arrange
      const ratio = 4.5;

      // Act
      const { meetsWCAGAAA } = await import("../contrast");
      const result = meetsWCAGAAA(ratio, "large");

      // Assert
      expect(result).toBe(true);
    });

    it("should fail for 6.99:1 ratio (normal text)", async () => {
      // Arrange
      const ratio = 6.99;

      // Act
      const { meetsWCAGAAA } = await import("../contrast");
      const result = meetsWCAGAAA(ratio, "normal");

      // Assert
      expect(result).toBe(false);
    });
  });
});
