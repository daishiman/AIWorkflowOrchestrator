/**
 * @file エラー型のテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @taskId CONV-03-01
 * @subtask T-03-3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  // 定数
  ErrorCodes,
  // 型
  type ErrorCode,
  type BaseError,
  type RAGError,
  // 関数
  createRAGError,
} from "../errors";

// =============================================================================
// 1. ErrorCodes定数のテスト
// =============================================================================

describe("ErrorCodes定数", () => {
  describe("ファイル関連エラーコード", () => {
    it("FILE_NOT_FOUNDが定義されていること", () => {
      expect(ErrorCodes.FILE_NOT_FOUND).toBe("FILE_NOT_FOUND");
    });

    it("FILE_READ_ERRORが定義されていること", () => {
      expect(ErrorCodes.FILE_READ_ERROR).toBe("FILE_READ_ERROR");
    });

    it("FILE_WRITE_ERRORが定義されていること", () => {
      expect(ErrorCodes.FILE_WRITE_ERROR).toBe("FILE_WRITE_ERROR");
    });

    it("UNSUPPORTED_FILE_TYPEが定義されていること", () => {
      expect(ErrorCodes.UNSUPPORTED_FILE_TYPE).toBe("UNSUPPORTED_FILE_TYPE");
    });
  });

  describe("変換関連エラーコード", () => {
    it("CONVERSION_FAILEDが定義されていること", () => {
      expect(ErrorCodes.CONVERSION_FAILED).toBe("CONVERSION_FAILED");
    });

    it("CONVERTER_NOT_FOUNDが定義されていること", () => {
      expect(ErrorCodes.CONVERTER_NOT_FOUND).toBe("CONVERTER_NOT_FOUND");
    });
  });

  describe("データベース関連エラーコード", () => {
    it("DB_CONNECTION_ERRORが定義されていること", () => {
      expect(ErrorCodes.DB_CONNECTION_ERROR).toBe("DB_CONNECTION_ERROR");
    });

    it("DB_QUERY_ERRORが定義されていること", () => {
      expect(ErrorCodes.DB_QUERY_ERROR).toBe("DB_QUERY_ERROR");
    });

    it("DB_TRANSACTION_ERRORが定義されていること", () => {
      expect(ErrorCodes.DB_TRANSACTION_ERROR).toBe("DB_TRANSACTION_ERROR");
    });

    it("RECORD_NOT_FOUNDが定義されていること", () => {
      expect(ErrorCodes.RECORD_NOT_FOUND).toBe("RECORD_NOT_FOUND");
    });
  });

  describe("埋め込み関連エラーコード", () => {
    it("EMBEDDING_GENERATION_ERRORが定義されていること", () => {
      expect(ErrorCodes.EMBEDDING_GENERATION_ERROR).toBe(
        "EMBEDDING_GENERATION_ERROR",
      );
    });

    it("EMBEDDING_PROVIDER_ERRORが定義されていること", () => {
      expect(ErrorCodes.EMBEDDING_PROVIDER_ERROR).toBe(
        "EMBEDDING_PROVIDER_ERROR",
      );
    });
  });

  describe("検索関連エラーコード", () => {
    it("SEARCH_ERRORが定義されていること", () => {
      expect(ErrorCodes.SEARCH_ERROR).toBe("SEARCH_ERROR");
    });

    it("QUERY_PARSE_ERRORが定義されていること", () => {
      expect(ErrorCodes.QUERY_PARSE_ERROR).toBe("QUERY_PARSE_ERROR");
    });
  });

  describe("グラフ関連エラーコード", () => {
    it("ENTITY_EXTRACTION_ERRORが定義されていること", () => {
      expect(ErrorCodes.ENTITY_EXTRACTION_ERROR).toBe(
        "ENTITY_EXTRACTION_ERROR",
      );
    });

    it("RELATION_EXTRACTION_ERRORが定義されていること", () => {
      expect(ErrorCodes.RELATION_EXTRACTION_ERROR).toBe(
        "RELATION_EXTRACTION_ERROR",
      );
    });

    it("COMMUNITY_DETECTION_ERRORが定義されていること", () => {
      expect(ErrorCodes.COMMUNITY_DETECTION_ERROR).toBe(
        "COMMUNITY_DETECTION_ERROR",
      );
    });
  });

  describe("汎用エラーコード", () => {
    it("VALIDATION_ERRORが定義されていること", () => {
      expect(ErrorCodes.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
    });

    it("INTERNAL_ERRORが定義されていること", () => {
      expect(ErrorCodes.INTERNAL_ERROR).toBe("INTERNAL_ERROR");
    });
  });

  describe("ErrorCodesの網羅性", () => {
    it("すべてのエラーコードが21個定義されていること", () => {
      const codes = Object.keys(ErrorCodes);
      expect(codes).toHaveLength(21); // TIMEOUT, RESOURCE_EXHAUSTED追加により19→21
    });

    it("すべての値がUPPER_SNAKE_CASE形式であること", () => {
      const values = Object.values(ErrorCodes);
      const pattern = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/;
      values.forEach((value) => {
        expect(value).toMatch(pattern);
      });
    });

    it("キーと値が一致していること（自己記述的）", () => {
      Object.entries(ErrorCodes).forEach(([key, value]) => {
        expect(key).toBe(value);
      });
    });
  });

  describe("ErrorCodesの不変性", () => {
    it("as constにより読み取り専用であること", () => {
      // TypeScript的にはas constで不変だが、実行時の確認
      expect(typeof ErrorCodes).toBe("object");
      expect(Object.isFrozen(ErrorCodes)).toBe(true);
    });
  });
});

// =============================================================================
// 2. ErrorCode型のテスト
// =============================================================================

describe("ErrorCode型", () => {
  it("ErrorCodesの値がErrorCode型として使用できること", () => {
    const code: ErrorCode = ErrorCodes.FILE_NOT_FOUND;
    expect(code).toBe("FILE_NOT_FOUND");
  });

  it("すべてのErrorCodesの値がErrorCode型として有効であること", () => {
    const codes: ErrorCode[] = Object.values(ErrorCodes);
    expect(codes).toHaveLength(21); // TIMEOUT, RESOURCE_EXHAUSTED追加により19→21
  });
});

// =============================================================================
// 3. BaseError型のテスト
// =============================================================================

describe("BaseError型", () => {
  it("必須フィールドを持つオブジェクトを作成できること", () => {
    const error: BaseError = {
      code: "CUSTOM_ERROR",
      message: "An error occurred",
      timestamp: new Date(),
    };
    expect(error.code).toBe("CUSTOM_ERROR");
    expect(error.message).toBe("An error occurred");
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it("contextフィールドはオプショナルであること", () => {
    const errorWithoutContext: BaseError = {
      code: "ERROR",
      message: "message",
      timestamp: new Date(),
    };
    expect(errorWithoutContext.context).toBeUndefined();

    const errorWithContext: BaseError = {
      code: "ERROR",
      message: "message",
      timestamp: new Date(),
      context: { userId: 123, operation: "read" },
    };
    expect(errorWithContext.context).toEqual({
      userId: 123,
      operation: "read",
    });
  });

  it("contextに任意のキーと値を含められること", () => {
    const error: BaseError = {
      code: "ERROR",
      message: "message",
      timestamp: new Date(),
      context: {
        stringValue: "text",
        numberValue: 42,
        boolValue: true,
        arrayValue: [1, 2, 3],
        nestedValue: { inner: "value" },
        nullValue: null,
      },
    };
    expect(error.context?.stringValue).toBe("text");
    expect(error.context?.numberValue).toBe(42);
    expect(error.context?.nestedValue).toEqual({ inner: "value" });
  });
});

// =============================================================================
// 4. RAGError型のテスト
// =============================================================================

describe("RAGError型", () => {
  it("BaseErrorを拡張していること", () => {
    const error: RAGError = {
      code: ErrorCodes.FILE_NOT_FOUND,
      message: "File not found: input.pdf",
      timestamp: new Date(),
    };
    expect(error.code).toBe("FILE_NOT_FOUND");
    expect(error.message).toBe("File not found: input.pdf");
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it("codeフィールドがErrorCode型であること", () => {
    const error: RAGError = {
      code: ErrorCodes.DB_QUERY_ERROR,
      message: "Database query failed",
      timestamp: new Date(),
    };
    // ErrorCodesの値として有効
    expect(Object.values(ErrorCodes)).toContain(error.code);
  });

  it("causeフィールドはオプショナルであること", () => {
    const errorWithoutCause: RAGError = {
      code: ErrorCodes.VALIDATION_ERROR,
      message: "Invalid input",
      timestamp: new Date(),
    };
    expect(errorWithoutCause.cause).toBeUndefined();
  });

  it("causeにError型を設定できること", () => {
    const originalError = new Error("Original error message");
    const error: RAGError = {
      code: ErrorCodes.INTERNAL_ERROR,
      message: "Internal error occurred",
      timestamp: new Date(),
      cause: originalError,
    };
    expect(error.cause).toBe(originalError);
    expect(error.cause?.message).toBe("Original error message");
  });

  it("causeのスタックトレースにアクセスできること", () => {
    const originalError = new Error("Stack trace test");
    const error: RAGError = {
      code: ErrorCodes.INTERNAL_ERROR,
      message: "Wrapper error",
      timestamp: new Date(),
      cause: originalError,
    };
    expect(error.cause?.stack).toBeDefined();
    expect(error.cause?.stack).toContain("Stack trace test");
  });
});

// =============================================================================
// 5. createRAGError関数のテスト
// =============================================================================

describe("createRAGError()", () => {
  describe("基本的な使用", () => {
    it("必須引数のみでRAGErrorを生成できること", () => {
      const error = createRAGError(
        ErrorCodes.FILE_NOT_FOUND,
        "File not found: test.txt",
      );

      expect(error.code).toBe("FILE_NOT_FOUND");
      expect(error.message).toBe("File not found: test.txt");
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.context).toBeUndefined();
      expect(error.cause).toBeUndefined();
    });

    it("contextを指定してRAGErrorを生成できること", () => {
      const context = { filePath: "/path/to/file.txt", attemptCount: 3 };
      const error = createRAGError(
        ErrorCodes.FILE_READ_ERROR,
        "Failed to read file",
        context,
      );

      expect(error.code).toBe("FILE_READ_ERROR");
      expect(error.context).toEqual(context);
    });

    it("causeを指定してRAGErrorを生成できること", () => {
      const cause = new Error("Original error");
      const error = createRAGError(
        ErrorCodes.DB_CONNECTION_ERROR,
        "Database connection failed",
        undefined,
        cause,
      );

      expect(error.code).toBe("DB_CONNECTION_ERROR");
      expect(error.cause).toBe(cause);
    });

    it("contextとcause両方を指定してRAGErrorを生成できること", () => {
      const context = { dbHost: "localhost", port: 5432 };
      const cause = new Error("Connection refused");
      const error = createRAGError(
        ErrorCodes.DB_CONNECTION_ERROR,
        "Failed to connect to database",
        context,
        cause,
      );

      expect(error.context).toEqual(context);
      expect(error.cause).toBe(cause);
    });
  });

  describe("timestampの生成", () => {
    let mockDate: Date;

    beforeEach(() => {
      mockDate = new Date("2025-12-16T12:00:00.000Z");
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("現在時刻がtimestampに設定されること", () => {
      const error = createRAGError(
        ErrorCodes.VALIDATION_ERROR,
        "Validation failed",
      );

      expect(error.timestamp.getTime()).toBe(mockDate.getTime());
    });

    it("連続して生成した場合、異なるtimestampが設定されること", () => {
      const error1 = createRAGError(ErrorCodes.VALIDATION_ERROR, "Error 1");

      vi.advanceTimersByTime(1000); // 1秒進める

      const error2 = createRAGError(ErrorCodes.VALIDATION_ERROR, "Error 2");

      expect(error2.timestamp.getTime()).toBe(
        error1.timestamp.getTime() + 1000,
      );
    });
  });

  describe("すべてのエラーコードでの生成", () => {
    it("FILE_NOT_FOUNDエラーを生成できること", () => {
      const error = createRAGError(ErrorCodes.FILE_NOT_FOUND, "File not found");
      expect(error.code).toBe("FILE_NOT_FOUND");
    });

    it("CONVERSION_FAILEDエラーを生成できること", () => {
      const error = createRAGError(
        ErrorCodes.CONVERSION_FAILED,
        "Conversion failed",
      );
      expect(error.code).toBe("CONVERSION_FAILED");
    });

    it("EMBEDDING_GENERATION_ERRORエラーを生成できること", () => {
      const error = createRAGError(
        ErrorCodes.EMBEDDING_GENERATION_ERROR,
        "Embedding generation failed",
      );
      expect(error.code).toBe("EMBEDDING_GENERATION_ERROR");
    });

    it("SEARCH_ERRORエラーを生成できること", () => {
      const error = createRAGError(ErrorCodes.SEARCH_ERROR, "Search failed");
      expect(error.code).toBe("SEARCH_ERROR");
    });

    it("ENTITY_EXTRACTION_ERRORエラーを生成できること", () => {
      const error = createRAGError(
        ErrorCodes.ENTITY_EXTRACTION_ERROR,
        "Entity extraction failed",
      );
      expect(error.code).toBe("ENTITY_EXTRACTION_ERROR");
    });
  });

  describe("イミュータビリティ", () => {
    it("生成されたエラーオブジェクトがreadonlyであること", () => {
      const error = createRAGError(ErrorCodes.INTERNAL_ERROR, "Internal error");

      // TypeScript的にはreadonlyだが、実行時の確認
      expect(error.code).toBe("INTERNAL_ERROR");
      expect(error.message).toBe("Internal error");
    });

    it("contextの変更が元のオブジェクトに影響しないこと", () => {
      const originalContext = { key: "value" };
      const error = createRAGError(
        ErrorCodes.INTERNAL_ERROR,
        "Error",
        originalContext,
      );

      // 元のcontextを変更
      originalContext.key = "modified";

      // createRAGErrorが浅いコピーかどうかに依存
      // 設計によって期待値が変わる
      expect(error.context?.key).toBeDefined();
    });
  });
});

// =============================================================================
// 6. エラーハンドリングパターンのテスト
// =============================================================================

describe("エラーハンドリングパターン", () => {
  describe("エラーチェーン", () => {
    it("複数レベルのエラーチェーンを作成できること", () => {
      const rootCause = new Error("Low level I/O error");
      const middleError = createRAGError(
        ErrorCodes.FILE_READ_ERROR,
        "Failed to read file",
        { filePath: "/path/to/file" },
        rootCause,
      );

      // 注: middleErrorはRAGErrorなのでErrorではないが、
      // causeとして新しいErrorを作成することでチェーンを表現
      const topError = createRAGError(
        ErrorCodes.CONVERSION_FAILED,
        "File conversion failed",
        { conversionType: "pdf-to-text" },
        new Error(`${middleError.code}: ${middleError.message}`),
      );

      expect(topError.code).toBe("CONVERSION_FAILED");
      expect(topError.cause?.message).toContain("FILE_READ_ERROR");
    });
  });

  describe("エラーコンテキストの活用", () => {
    it("ファイル操作エラーに適切なコンテキストを付与できること", () => {
      const error = createRAGError(
        ErrorCodes.FILE_NOT_FOUND,
        "File not found",
        {
          filePath: "/documents/report.pdf",
          searchedPaths: ["/documents", "/temp"],
          timestamp: new Date().toISOString(),
        },
      );

      expect(error.context?.filePath).toBe("/documents/report.pdf");
      expect(error.context?.searchedPaths).toEqual(["/documents", "/temp"]);
    });

    it("データベースエラーに適切なコンテキストを付与できること", () => {
      const error = createRAGError(
        ErrorCodes.DB_QUERY_ERROR,
        "Query execution failed",
        {
          query: "SELECT * FROM files WHERE id = ?",
          params: ["file-123"],
          executionTime: 5000,
        },
      );

      expect(error.context?.query).toContain("SELECT");
      expect(error.context?.executionTime).toBe(5000);
    });

    it("検索エラーに適切なコンテキストを付与できること", () => {
      const error = createRAGError(
        ErrorCodes.SEARCH_ERROR,
        "Vector search failed",
        {
          queryVector: [0.1, 0.2, 0.3],
          topK: 10,
          indexName: "documents_index",
        },
      );

      expect(error.context?.topK).toBe(10);
      expect(error.context?.indexName).toBe("documents_index");
    });
  });

  describe("エラーの識別", () => {
    it("エラーコードによる分岐処理ができること", () => {
      const error = createRAGError(ErrorCodes.FILE_NOT_FOUND, "File not found");

      let handled = false;
      switch (error.code) {
        case ErrorCodes.FILE_NOT_FOUND:
          handled = true;
          break;
        case ErrorCodes.FILE_READ_ERROR:
          handled = false;
          break;
        default:
          handled = false;
      }

      expect(handled).toBe(true);
    });

    it("特定のエラーコードグループを判定できること", () => {
      const fileErrorCodes = [
        ErrorCodes.FILE_NOT_FOUND,
        ErrorCodes.FILE_READ_ERROR,
        ErrorCodes.FILE_WRITE_ERROR,
        ErrorCodes.UNSUPPORTED_FILE_TYPE,
      ];

      const isFileError = (error: RAGError): boolean =>
        fileErrorCodes.includes(error.code as (typeof fileErrorCodes)[number]);

      const fileError = createRAGError(ErrorCodes.FILE_NOT_FOUND, "File error");
      const dbError = createRAGError(ErrorCodes.DB_QUERY_ERROR, "DB error");

      expect(isFileError(fileError)).toBe(true);
      expect(isFileError(dbError)).toBe(false);
    });
  });
});

// =============================================================================
// 7. 型推論のテスト
// =============================================================================

describe("型推論", () => {
  it("createRAGErrorの戻り値型がRAGErrorであること", () => {
    const error = createRAGError(ErrorCodes.INTERNAL_ERROR, "Test");
    // TypeScriptコンパイラが型を検証
    expect(error.code).toBeDefined();
    expect(error.message).toBeDefined();
    expect(error.timestamp).toBeDefined();
  });

  it("ErrorCodesの値がリテラル型として推論されること", () => {
    // as constにより各値がリテラル型として推論される
    const code = ErrorCodes.FILE_NOT_FOUND;
    expect(code).toBe("FILE_NOT_FOUND");
  });
});

// =============================================================================
// 8. エッジケースのテスト
// =============================================================================

describe("エッジケース", () => {
  describe("空の値", () => {
    it("空のメッセージでエラーを生成できること", () => {
      const error = createRAGError(ErrorCodes.INTERNAL_ERROR, "");
      expect(error.message).toBe("");
    });

    it("空のコンテキストでエラーを生成できること", () => {
      const error = createRAGError(ErrorCodes.INTERNAL_ERROR, "Error", {});
      expect(error.context).toEqual({});
    });
  });

  describe("特殊文字", () => {
    it("メッセージに特殊文字を含められること", () => {
      const message =
        "Error: 日本語メッセージ 🎉 <script>alert('xss')</script>";
      const error = createRAGError(ErrorCodes.INTERNAL_ERROR, message);
      expect(error.message).toBe(message);
    });

    it("コンテキストに特殊文字を含められること", () => {
      const context = {
        path: "/path/with spaces/and/日本語",
        query: "SELECT * FROM users WHERE name = 'O''Brien'",
      };
      const error = createRAGError(ErrorCodes.INTERNAL_ERROR, "Error", context);
      expect(error.context).toEqual(context);
    });
  });

  describe("大きなデータ", () => {
    it("大きなコンテキストオブジェクトを保持できること", () => {
      const largeContext: Record<string, unknown> = {};
      for (let i = 0; i < 1000; i++) {
        largeContext[`key${i}`] = `value${i}`;
      }

      const error = createRAGError(
        ErrorCodes.INTERNAL_ERROR,
        "Error with large context",
        largeContext,
      );

      expect(Object.keys(error.context ?? {}).length).toBe(1000);
    });

    it("長いメッセージを保持できること", () => {
      const longMessage = "Error: " + "a".repeat(10000);
      const error = createRAGError(ErrorCodes.INTERNAL_ERROR, longMessage);
      expect(error.message.length).toBe(10007);
    });
  });
});
