/**
 * CONV-03-05: Zod Validation Manual Tests
 * Zodバリデーション手動検証テスト - エラーメッセージの確認
 *
 * @module @repo/shared/types/rag/search/__tests__/zod-validation
 */

import { describe, it, expect } from "vitest";
import {
  searchWeightsSchema,
  dateRangeSchema,
  searchQuerySchema,
  searchOptionsSchema,
  highlightOffsetSchema,
} from "../schemas";

// ==================== Manual Test Case 1: 重みの合計が1.0でない場合 ====================

describe("手動検証: searchWeightsSchema", () => {
  it("Test Case 1: 重みの合計が1.0でない場合、日本語エラーメッセージが表示される", () => {
    // Arrange: 異常データ（合計1.1）
    const invalidWeights = {
      keyword: 0.5,
      semantic: 0.3,
      graph: 0.3,
    };

    // Act: バリデーション実行
    const result = searchWeightsSchema.safeParse(invalidWeights);

    // Assert: 失敗し、日本語エラーメッセージが返される
    expect(result.success).toBe(false);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      console.log("❌ Test Case 1 エラーメッセージ:", errorMessage);

      expect(errorMessage).toBe("検索重みの合計は1.0である必要があります");

      // エラーメッセージの詳細情報を出力
      console.log("  - 入力値:", invalidWeights);
      console.log(
        "  - 合計:",
        invalidWeights.keyword + invalidWeights.semantic + invalidWeights.graph,
      );
      console.log("  - エラーパス:", result.error.issues[0].path);
    }
  });

  it("Test Case 1-2: 重みの合計が0.9の場合も同様のエラー", () => {
    const invalidWeights = {
      keyword: 0.3,
      semantic: 0.3,
      graph: 0.3,
    };

    const result = searchWeightsSchema.safeParse(invalidWeights);

    expect(result.success).toBe(false);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      console.log("❌ Test Case 1-2 エラーメッセージ:", errorMessage);
      expect(errorMessage).toBe("検索重みの合計は1.0である必要があります");
    }
  });
});

// ==================== Manual Test Case 2: start > end の場合 ====================

describe("手動検証: dateRangeSchema", () => {
  it("Test Case 2: start > end の場合、日本語エラーメッセージが表示される", () => {
    // Arrange: 異常データ（start > end）
    const invalidDateRange = {
      start: new Date("2024-01-02"),
      end: new Date("2024-01-01"),
    };

    // Act: バリデーション実行
    const result = dateRangeSchema.safeParse(invalidDateRange);

    // Assert: 失敗し、日本語エラーメッセージが返される
    expect(result.success).toBe(false);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      console.log("❌ Test Case 2 エラーメッセージ:", errorMessage);

      expect(errorMessage).toBe("開始日は終了日以前である必要があります");

      // エラーメッセージの詳細情報を出力
      console.log("  - 入力値:", invalidDateRange);
      console.log("  - start:", invalidDateRange.start.toISOString());
      console.log("  - end:", invalidDateRange.end.toISOString());
    }
  });

  it("Test Case 2-2: start == end は許可される（境界値）", () => {
    const validDateRange = {
      start: new Date("2024-01-01"),
      end: new Date("2024-01-01"),
    };

    const result = dateRangeSchema.safeParse(validDateRange);

    expect(result.success).toBe(true);
    console.log("✅ Test Case 2-2: start == end は許可される");
  });
});

// ==================== Manual Test Case 3: 空文字列をtextに投入 ====================

describe("手動検証: searchQuerySchema", () => {
  it("Test Case 3: 空文字列をtextに投入した場合、エラーメッセージが表示される", () => {
    // Arrange: 異常データ（text = ""）
    const invalidQuery = {
      text: "",
      type: "local",
      embedding: null,
      filters: {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 0.3,
      },
      options: {
        limit: 20,
        offset: 0,
        includeMetadata: true,
        includeHighlights: true,
        rerankEnabled: true,
        cragEnabled: false,
        strategies: ["hybrid"],
        weights: {
          keyword: 0.35,
          semantic: 0.35,
          graph: 0.3,
        },
      },
    };

    // Act: バリデーション実行
    const result = searchQuerySchema.safeParse(invalidQuery);

    // Assert: 失敗し、エラーメッセージが返される
    expect(result.success).toBe(false);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      console.log("❌ Test Case 3 エラーメッセージ:", errorMessage);

      // Zodのデフォルトエラーメッセージ（min(1)による）
      expect(errorMessage).toContain(">=1");

      // エラーメッセージの詳細情報を出力
      console.log("  - 入力値:", { text: invalidQuery.text });
      console.log("  - エラーパス:", result.error.issues[0].path);
      console.log("  - エラーコード:", result.error.issues[0].code);
    }
  });

  it("Test Case 3-2: 最大長超過（1001文字）の場合", () => {
    const longText = "a".repeat(1001);
    const invalidQuery = {
      text: longText,
      type: "local",
      embedding: null,
      filters: {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 0.3,
      },
      options: {
        limit: 20,
        offset: 0,
        includeMetadata: true,
        includeHighlights: true,
        rerankEnabled: true,
        cragEnabled: false,
        strategies: ["hybrid"],
        weights: {
          keyword: 0.35,
          semantic: 0.35,
          graph: 0.3,
        },
      },
    };

    const result = searchQuerySchema.safeParse(invalidQuery);

    expect(result.success).toBe(false);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      console.log("❌ Test Case 3-2 エラーメッセージ:", errorMessage);
      expect(errorMessage).toContain("<=1000");
    }
  });
});

// ==================== Manual Test Case 4: limitが範囲外（101） ====================

describe("手動検証: searchOptionsSchema", () => {
  it("Test Case 4: limitが範囲外（101）の場合、エラーメッセージが表示される", () => {
    // Arrange: 異常データ（limit = 101）
    const invalidOptions = {
      limit: 101,
      offset: 0,
      includeMetadata: true,
      includeHighlights: true,
      rerankEnabled: true,
      cragEnabled: false,
      strategies: ["hybrid"],
      weights: {
        keyword: 0.35,
        semantic: 0.35,
        graph: 0.3,
      },
    };

    // Act: バリデーション実行
    const result = searchOptionsSchema.safeParse(invalidOptions);

    // Assert: 失敗し、エラーメッセージが返される
    expect(result.success).toBe(false);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      console.log("❌ Test Case 4 エラーメッセージ:", errorMessage);

      // Zodのデフォルトエラーメッセージ（max(100)による）
      expect(errorMessage).toContain("100");

      // エラーメッセージの詳細情報を出力
      console.log("  - 入力値:", { limit: invalidOptions.limit });
      console.log("  - エラーパス:", result.error.issues[0].path);
    }
  });

  it("Test Case 4-2: limitが0の場合", () => {
    const invalidOptions = {
      limit: 0,
      offset: 0,
      includeMetadata: true,
      includeHighlights: true,
      rerankEnabled: true,
      cragEnabled: false,
      strategies: ["hybrid"],
      weights: {
        keyword: 0.35,
        semantic: 0.35,
        graph: 0.3,
      },
    };

    const result = searchOptionsSchema.safeParse(invalidOptions);

    expect(result.success).toBe(false);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      console.log("❌ Test Case 4-2 エラーメッセージ:", errorMessage);
      expect(errorMessage).toContain("1");
    }
  });

  it("Test Case 4-3: offsetが負の値の場合", () => {
    const invalidOptions = {
      limit: 20,
      offset: -1,
      includeMetadata: true,
      includeHighlights: true,
      rerankEnabled: true,
      cragEnabled: false,
      strategies: ["hybrid"],
      weights: {
        keyword: 0.35,
        semantic: 0.35,
        graph: 0.3,
      },
    };

    const result = searchOptionsSchema.safeParse(invalidOptions);

    expect(result.success).toBe(false);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      console.log("❌ Test Case 4-3 エラーメッセージ:", errorMessage);
      expect(errorMessage).toContain("0");
    }
  });
});

// ==================== Additional Test Case 5: highlightOffsetSchema ====================

describe("手動検証: highlightOffsetSchema", () => {
  it("Test Case 5: start >= end の場合、日本語エラーメッセージが表示される", () => {
    // Arrange: 異常データ（start >= end）
    const invalidOffset = {
      start: 10,
      end: 10,
    };

    // Act: バリデーション実行
    const result = highlightOffsetSchema.safeParse(invalidOffset);

    // Assert: 失敗し、日本語エラーメッセージが返される
    expect(result.success).toBe(false);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      console.log("❌ Test Case 5 エラーメッセージ:", errorMessage);

      expect(errorMessage).toBe("開始位置は終了位置より小さい必要があります");

      // エラーメッセージの詳細情報を出力
      console.log("  - 入力値:", invalidOffset);
    }
  });

  it("Test Case 5-2: start > end の場合も同じエラー", () => {
    const invalidOffset = {
      start: 15,
      end: 10,
    };

    const result = highlightOffsetSchema.safeParse(invalidOffset);

    expect(result.success).toBe(false);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      console.log("❌ Test Case 5-2 エラーメッセージ:", errorMessage);
      expect(errorMessage).toBe("開始位置は終了位置より小さい必要があります");
    }
  });
});

// ==================== Edge Case Test: 複数エラーの同時発生 ====================

describe("手動検証: 複数エラーの同時発生", () => {
  it("Test Case 6: 複数のバリデーションエラーが同時に発生する場合", () => {
    // Arrange: 複数の異常データ
    const invalidQuery = {
      text: "", // エラー1: 空文字列
      type: "invalid_type", // エラー2: 無効なenum値
      embedding: null,
      filters: {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 1.5, // エラー3: 範囲外（0-1）
      },
      options: {
        limit: 101, // エラー4: 範囲外（1-100）
        offset: -1, // エラー5: 負の値
        includeMetadata: true,
        includeHighlights: true,
        rerankEnabled: true,
        cragEnabled: false,
        strategies: ["hybrid"],
        weights: {
          keyword: 0.5,
          semantic: 0.5,
          graph: 0.5, // エラー6: 合計1.5
        },
      },
    };

    // Act: バリデーション実行
    const result = searchQuerySchema.safeParse(invalidQuery);

    // Assert: 失敗し、複数のエラーが返される
    expect(result.success).toBe(false);

    if (!result.success) {
      console.log("\n❌ Test Case 6: 複数エラー検出");
      console.log("  - エラー総数:", result.error.issues.length);

      result.error.issues.forEach((issue, index) => {
        console.log(`  - エラー${index + 1}:`, {
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        });
      });

      // 最低1つ以上のエラーがあることを確認
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});

// ==================== Success Case: 正常データの検証 ====================

describe("手動検証: 正常データの通過確認", () => {
  it("Test Case 7: 全て正常なデータは成功する", () => {
    // Arrange: 正常データ
    const validQuery = {
      text: "test query",
      type: "hybrid" as const,
      embedding: null,
      filters: {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 0.3,
      },
      options: {
        limit: 20,
        offset: 0,
        includeMetadata: true,
        includeHighlights: true,
        rerankEnabled: true,
        cragEnabled: false,
        strategies: ["hybrid" as const],
        weights: {
          keyword: 0.35,
          semantic: 0.35,
          graph: 0.3,
        },
      },
    };

    // Act: バリデーション実行
    const result = searchQuerySchema.safeParse(validQuery);

    // Assert: 成功する
    expect(result.success).toBe(true);

    if (result.success) {
      console.log("✅ Test Case 7: 正常データは成功");
      console.log("  - パース結果:", {
        text: result.data.text,
        type: result.data.type,
        weights: result.data.options.weights,
      });
    }
  });
});

// ==================== Error Message Quality Test ====================

describe("手動検証: エラーメッセージ品質", () => {
  it("Test Case 8: refineエラーのパス情報が正確", () => {
    const invalidWeights = {
      keyword: 0.4,
      semantic: 0.4,
      graph: 0.4,
    };

    const result = searchWeightsSchema.safeParse(invalidWeights);

    if (!result.success) {
      const issue = result.error.issues[0];

      console.log("❌ Test Case 8 エラー詳細:");
      console.log("  - path:", issue.path);
      console.log("  - message:", issue.message);
      console.log("  - code:", issue.code);

      // refineエラーの場合、パスは空配列または全体を指す
      expect(issue.code).toBe("custom");
      expect(issue.message).toBe("検索重みの合計は1.0である必要があります");
    }
  });

  it("Test Case 8-2: フィールドレベルエラーのパス情報", () => {
    const invalidOptions = {
      limit: 101,
      offset: 0,
      includeMetadata: true,
      includeHighlights: true,
      rerankEnabled: true,
      cragEnabled: false,
      strategies: ["hybrid"],
      weights: {
        keyword: 0.35,
        semantic: 0.35,
        graph: 0.3,
      },
    };

    const result = searchOptionsSchema.safeParse(invalidOptions);

    if (!result.success) {
      const issue = result.error.issues[0];

      console.log("❌ Test Case 8-2 エラー詳細:");
      console.log("  - path:", issue.path);
      console.log("  - message:", issue.message);
      console.log("  - code:", issue.code);

      // フィールドレベルエラーの場合、パスにフィールド名が含まれる
      expect(issue.path).toEqual(["limit"]);
      expect(issue.code).toBe("too_big");
    }
  });
});
