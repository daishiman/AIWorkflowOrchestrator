# ConverterRegistry - レジストリ詳細設計書

## 1. 概要

### 1.1 目的

ConverterRegistryクラスの詳細設計を提供し、複数のコンバーターを管理し、MIMEタイプに応じて最適なコンバーターを選択する仕組みを確立する。

### 1.2 設計原則

| 原則                 | 適用内容                                                         |
| -------------------- | ---------------------------------------------------------------- |
| リポジトリパターン   | コンバーターのコレクション管理と検索を抽象化                     |
| ファクトリパターン   | 適切なコンバーターの選択と提供                                   |
| 単一責任原則         | コンバーター管理のみを担当（変換処理は担当しない）               |
| Open/Closed原則      | 新しいコンバーター追加時にレジストリコード変更不要               |
| シングルトンパターン | グローバルインスタンスを提供（テスト用に独立インスタンスも可能） |

### 1.3 責務

| 責務カテゴリ     | 責務内容                                           |
| ---------------- | -------------------------------------------------- |
| コレクション管理 | コンバーターの登録・登録解除・一覧取得             |
| 検索・選択       | MIMEタイプに基づく最適なコンバーターの選択         |
| 優先度管理       | 複数の候補から優先度順にソート                     |
| メタデータ提供   | サポートMIMEタイプ一覧の提供                       |
| インスタンス管理 | グローバルインスタンスとテスト用インスタンスの管理 |

### 1.4 非責務（他コンポーネントの責務）

| 非責務             | 担当コンポーネント                          |
| ------------------ | ------------------------------------------- |
| ファイル変換処理   | IConverter実装（BaseConverter、サブクラス） |
| 同時実行制御       | ConversionService                           |
| タイムアウト管理   | ConversionService                           |
| ユーザー認証・認可 | 上位レイヤー（RAGService等）                |

---

## 2. クラス構造

### 2.1 クラス定義

```typescript
/**
 * コンバーターレジストリ
 *
 * 利用可能なコンバーターを管理し、入力に応じて最適なコンバーターを選択する。
 * リポジトリパターンとファクトリパターンを適用。
 *
 * 機能:
 * - コンバーターの登録・登録解除
 * - MIMEタイプによる検索
 * - 優先度ベースのソート
 * - グローバルインスタンスの提供
 */
export class ConverterRegistry {
  // ========================================
  // プライベートフィールド
  // ========================================

  /**
   * 登録されたコンバーターのマップ
   *
   * Key: コンバーターID
   * Value: IConverterインスタンス
   */
  private readonly converters: Map<string, IConverter>;

  /**
   * MIMEタイプごとのコンバーターIDリスト
   *
   * Key: MIMEタイプ（例: "text/plain"）
   * Value: コンバーターIDの配列（優先度順にソート済み）
   *
   * キャッシュとして使用し、検索を高速化。
   */
  private readonly mimeTypeIndex: Map<string, string[]>;

  // ========================================
  // コンストラクタ
  // ========================================

  /**
   * コンストラクタ
   *
   * 空のレジストリを生成。
   * グローバルインスタンスとテスト用インスタンスの両方で使用。
   */
  constructor() {
    this.converters = new Map();
    this.mimeTypeIndex = new Map();
  }

  // ========================================
  // 登録・登録解除
  // ========================================

  /**
   * コンバーターを登録
   *
   * 登録後、MIMEタイプインデックスを更新。
   * 同じIDのコンバーターが既に登録されている場合は上書き。
   *
   * @param converter - 登録するコンバーター
   * @returns 登録結果（成功時: void、失敗時: エラー）
   */
  register(converter: IConverter): Result<void, RAGError> {
    try {
      // バリデーション
      if (!converter.id) {
        return err(
          createRAGError(ErrorCodes.INVALID_INPUT, "Converter ID is required", {
            converterId: converter.id,
          }),
        );
      }

      if (converter.supportedMimeTypes.length === 0) {
        return err(
          createRAGError(
            ErrorCodes.INVALID_INPUT,
            "Converter must support at least one MIME type",
            { converterId: converter.id },
          ),
        );
      }

      // 登録
      this.converters.set(converter.id, converter);

      // MIMEタイプインデックスを更新
      this.updateMimeTypeIndex();

      return ok(undefined);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.INTERNAL_ERROR,
          "Failed to register converter",
          { converterId: converter.id },
          error as Error,
        ),
      );
    }
  }

  /**
   * コンバーターを登録解除
   *
   * 登録解除後、MIMEタイプインデックスを更新。
   *
   * @param converterId - 登録解除するコンバーターID
   * @returns 登録解除結果（成功時: void、失敗時: エラー）
   */
  unregister(converterId: string): Result<void, RAGError> {
    try {
      if (!this.converters.has(converterId)) {
        return err(
          createRAGError(
            ErrorCodes.NOT_FOUND,
            `Converter not found: ${converterId}`,
            { converterId },
          ),
        );
      }

      // 登録解除
      this.converters.delete(converterId);

      // MIMEタイプインデックスを更新
      this.updateMimeTypeIndex();

      return ok(undefined);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.INTERNAL_ERROR,
          "Failed to unregister converter",
          { converterId },
          error as Error,
        ),
      );
    }
  }

  /**
   * 複数のコンバーターを一括登録
   *
   * エラーが発生した場合も継続し、すべての登録を試行。
   * 結果を集約して返す。
   *
   * @param converters - 登録するコンバーターの配列
   * @returns 登録結果（成功数、失敗数、エラー詳細）
   */
  registerAll(converters: IConverter[]): {
    success: number;
    failed: number;
    errors: RAGError[];
  } {
    const errors: RAGError[] = [];
    let successCount = 0;

    for (const converter of converters) {
      const result = this.register(converter);
      if (result.success) {
        successCount++;
      } else {
        errors.push(result.error);
      }
    }

    return {
      success: successCount,
      failed: errors.length,
      errors,
    };
  }

  // ========================================
  // 検索・取得
  // ========================================

  /**
   * IDでコンバーターを取得
   *
   * @param converterId - 取得するコンバーターID
   * @returns コンバーターまたはエラー
   */
  get(converterId: string): Result<IConverter, RAGError> {
    const converter = this.converters.get(converterId);

    if (!converter) {
      return err(
        createRAGError(
          ErrorCodes.NOT_FOUND,
          `Converter not found: ${converterId}`,
          { converterId },
        ),
      );
    }

    return ok(converter);
  }

  /**
   * 入力に対して最適なコンバーターを検索
   *
   * アルゴリズム:
   * 1. input.mimeTypeに対応するコンバーター候補を取得
   * 2. 各候補でcanConvert(input)を呼び出し
   * 3. 変換可能なコンバーターを優先度順にソート
   * 4. 最高優先度のコンバーターを返す
   *
   * @param input - 変換対象の入力データ
   * @returns 最適なコンバーターまたはエラー
   */
  findConverter(input: ConverterInput): Result<IConverter, RAGError> {
    try {
      // MIMEタイプによる候補取得
      const candidates = this.findByMimeType(input.mimeType);

      if (candidates.length === 0) {
        return err(
          createRAGError(
            ErrorCodes.CONVERTER_NOT_FOUND,
            `No converter found for MIME type: ${input.mimeType}`,
            { mimeType: input.mimeType },
          ),
        );
      }

      // canConvert()で絞り込み
      const validConverters = candidates.filter((converter) =>
        converter.canConvert(input),
      );

      if (validConverters.length === 0) {
        return err(
          createRAGError(
            ErrorCodes.CONVERTER_NOT_FOUND,
            `No converter can handle the input`,
            {
              mimeType: input.mimeType,
              fileId: input.fileId,
              candidates: candidates.map((c) => c.id),
            },
          ),
        );
      }

      // 優先度順にソート（降順）
      const sorted = this.sortByPriority(validConverters);

      // 最高優先度のコンバーターを返す
      return ok(sorted[0]);
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.INTERNAL_ERROR,
          "Failed to find converter",
          { mimeType: input.mimeType },
          error as Error,
        ),
      );
    }
  }

  /**
   * MIMEタイプに対応するコンバーターを取得
   *
   * @param mimeType - MIMEタイプ
   * @returns コンバーターの配列（優先度順）
   */
  findByMimeType(mimeType: string): IConverter[] {
    const converterIds = this.mimeTypeIndex.get(mimeType) || [];
    return converterIds
      .map((id) => this.converters.get(id))
      .filter((converter): converter is IConverter => converter !== undefined);
  }

  /**
   * すべてのコンバーターを取得
   *
   * @returns コンバーターの配列
   */
  getAll(): IConverter[] {
    return Array.from(this.converters.values());
  }

  // ========================================
  // メタデータ取得
  // ========================================

  /**
   * サポートしているMIMEタイプ一覧を取得
   *
   * @returns MIMEタイプの配列（重複なし、ソート済み）
   */
  getSupportedMimeTypes(): string[] {
    return Array.from(this.mimeTypeIndex.keys()).sort();
  }

  /**
   * 登録されているコンバーター数を取得
   *
   * @returns コンバーター数
   */
  get size(): number {
    return this.converters.size;
  }

  /**
   * 特定のMIMEタイプをサポートするコンバーター数を取得
   *
   * @param mimeType - MIMEタイプ
   * @returns コンバーター数
   */
  getConverterCountByMimeType(mimeType: string): number {
    return this.mimeTypeIndex.get(mimeType)?.length || 0;
  }

  // ========================================
  // プライベートメソッド
  // ========================================

  /**
   * MIMEタイプインデックスを更新
   *
   * すべてのコンバーターを走査し、MIMEタイプごとのマップを再構築。
   * 各MIMEタイプのコンバーターリストを優先度順にソート。
   */
  private updateMimeTypeIndex(): void {
    // インデックスをクリア
    this.mimeTypeIndex.clear();

    // すべてのコンバーターを走査
    for (const converter of this.converters.values()) {
      for (const mimeType of converter.supportedMimeTypes) {
        // 既存のリストを取得または新規作成
        const converterIds = this.mimeTypeIndex.get(mimeType) || [];

        // IDを追加（重複チェック）
        if (!converterIds.includes(converter.id)) {
          converterIds.push(converter.id);
        }

        this.mimeTypeIndex.set(mimeType, converterIds);
      }
    }

    // 各MIMEタイプのリストを優先度順にソート
    for (const [mimeType, converterIds] of this.mimeTypeIndex.entries()) {
      const sorted = converterIds.sort((a, b) => {
        const converterA = this.converters.get(a);
        const converterB = this.converters.get(b);

        if (!converterA || !converterB) return 0;

        // 優先度降順（高い優先度が先）
        return converterB.priority - converterA.priority;
      });

      this.mimeTypeIndex.set(mimeType, sorted);
    }
  }

  /**
   * コンバーターを優先度順にソート
   *
   * @param converters - ソート対象のコンバーター配列
   * @returns ソート済みコンバーター配列（優先度降順）
   */
  private sortByPriority(converters: IConverter[]): IConverter[] {
    return [...converters].sort((a, b) => b.priority - a.priority);
  }

  // ========================================
  // デバッグ・ユーティリティ
  // ========================================

  /**
   * レジストリの内部状態をダンプ（デバッグ用）
   *
   * @returns レジストリの状態
   */
  dump(): {
    converterCount: number;
    converters: Array<{
      id: string;
      name: string;
      priority: number;
      mimeTypes: readonly string[];
    }>;
    mimeTypeIndex: Record<string, string[]>;
  } {
    return {
      converterCount: this.size,
      converters: this.getAll().map((c) => ({
        id: c.id,
        name: c.name,
        priority: c.priority,
        mimeTypes: c.supportedMimeTypes,
      })),
      mimeTypeIndex: Object.fromEntries(this.mimeTypeIndex),
    };
  }

  /**
   * レジストリをクリア（テスト用）
   *
   * すべてのコンバーターを登録解除。
   */
  clear(): void {
    this.converters.clear();
    this.mimeTypeIndex.clear();
  }
}
```

---

## 3. グローバルインスタンス管理

### 3.1 グローバルインスタンスの提供

```typescript
/**
 * グローバルコンバーターレジストリ
 *
 * アプリケーション全体で共有されるシングルトンインスタンス。
 * 起動時に標準コンバーターを自動登録。
 */
export const globalConverterRegistry = new ConverterRegistry();

/**
 * グローバルレジストリを初期化
 *
 * 標準コンバーターを登録。
 * アプリケーション起動時に1回だけ呼び出す。
 */
export function initializeGlobalRegistry(): void {
  // 標準コンバーターを登録
  // （実際のコンバーター実装は後続タスクで追加）
  // 例: globalConverterRegistry.register(new PlainTextConverter());
  // 例: globalConverterRegistry.register(new MarkdownConverter());
}
```

### 3.2 テスト用インスタンス

```typescript
/**
 * テスト用レジストリインスタンスを生成
 *
 * グローバルインスタンスに影響を与えずにテスト可能。
 *
 * @returns 新しいレジストリインスタンス
 */
export function createTestRegistry(): ConverterRegistry {
  return new ConverterRegistry();
}
```

### 3.3 使い分けガイドライン

| 用途                 | 使用するインスタンス                  | 理由                       |
| -------------------- | ------------------------------------- | -------------------------- |
| 本番アプリケーション | `globalConverterRegistry`             | すべてのコンバーターを共有 |
| ユニットテスト       | `createTestRegistry()`                | テスト間の独立性を保証     |
| 統合テスト           | `globalConverterRegistry`（初期化後） | 本番環境と同じ設定でテスト |

---

## 4. 検索・選択アルゴリズム

### 4.1 検索フロー図

```mermaid
flowchart TD
    Start[findConverter開始]
    GetCandidates[MIMEタイプで候補取得]
    CheckCandidates{候補あり?}
    FilterByCanConvert[canConvert()で絞り込み]
    CheckValid{有効なコンバーターあり?}
    Sort[優先度順にソート]
    ReturnFirst[最高優先度を返す]
    ErrorNoCandidates[エラー: 候補なし]
    ErrorNoValid[エラー: 有効なコンバーターなし]
    End[終了]

    Start --> GetCandidates
    GetCandidates --> CheckCandidates
    CheckCandidates -->|No| ErrorNoCandidates
    CheckCandidates -->|Yes| FilterByCanConvert
    FilterByCanConvert --> CheckValid
    CheckValid -->|No| ErrorNoValid
    CheckValid -->|Yes| Sort
    Sort --> ReturnFirst
    ReturnFirst --> End
    ErrorNoCandidates --> End
    ErrorNoValid --> End
```

### 4.2 優先度管理アルゴリズム

#### 4.2.1 優先度の定義

| 優先度範囲 | 用途                   | 例                           |
| ---------- | ---------------------- | ---------------------------- |
| 50 ~ 100   | 高優先度コンバーター   | 最適化された専用コンバーター |
| 10 ~ 49    | 標準優先度コンバーター | 一般的なコンバーター         |
| 0 ~ 9      | デフォルト優先度       | 基本的なコンバーター         |
| -10 ~ -1   | フォールバック用       | 汎用コンバーター（最終手段） |

#### 4.2.2 ソートロジック

```typescript
// 優先度降順（高い優先度が先）
converters.sort((a, b) => b.priority - a.priority);
```

### 4.3 キャッシュ戦略

#### 4.3.1 MIMEタイプインデックス

```typescript
// インデックス例
{
  "text/plain": ["plain-text-converter", "generic-text-converter"],
  "text/markdown": ["markdown-converter", "plain-text-converter"],
  "application/pdf": ["pdf-converter"]
}
```

**メリット**:

- O(1)での候補取得
- 登録時にソート済み（検索時の再ソート不要）

**更新タイミング**:

- コンバーター登録時
- コンバーター登録解除時

---

## 5. 使用例

### 5.1 基本的な使用例

```typescript
import { globalConverterRegistry } from "./converter-registry";
import { PlainTextConverter } from "./converters/plain-text-converter";
import { MarkdownConverter } from "./converters/markdown-converter";

// 1. コンバーターを登録
globalConverterRegistry.register(new PlainTextConverter());
globalConverterRegistry.register(new MarkdownConverter());

// 2. 変換対象の入力を準備
const input: ConverterInput = {
  fileId: "file_123" as FileId,
  filePath: "/path/to/file.md",
  mimeType: "text/markdown",
  content: "# Hello, World!",
  encoding: "utf-8",
};

// 3. 最適なコンバーターを検索
const result = globalConverterRegistry.findConverter(input);

if (result.success) {
  console.log(`Found converter: ${result.data.name}`);

  // 4. 変換実行
  const conversionResult = await result.data.convert(input);

  if (conversionResult.success) {
    console.log("Conversion successful:", conversionResult.data);
  }
} else {
  console.error("No converter found:", result.error);
}
```

### 5.2 複数コンバーター一括登録

```typescript
import { globalConverterRegistry } from "./converter-registry";
import { PlainTextConverter } from "./converters/plain-text-converter";
import { MarkdownConverter } from "./converters/markdown-converter";
import { PDFConverter } from "./converters/pdf-converter";

// 一括登録
const converters = [
  new PlainTextConverter(),
  new MarkdownConverter(),
  new PDFConverter(),
];

const result = globalConverterRegistry.registerAll(converters);

console.log(`Registered: ${result.success}, Failed: ${result.failed}`);

if (result.errors.length > 0) {
  console.error("Registration errors:", result.errors);
}
```

### 5.3 MIMEタイプによる検索

```typescript
// MIMEタイプに対応するすべてのコンバーターを取得
const markdownConverters =
  globalConverterRegistry.findByMimeType("text/markdown");

console.log(`Found ${markdownConverters.length} converters for Markdown:`);
markdownConverters.forEach((converter) => {
  console.log(`- ${converter.name} (priority: ${converter.priority})`);
});
```

### 5.4 レジストリ情報の取得

```typescript
// サポートMIMEタイプ一覧
const supportedTypes = globalConverterRegistry.getSupportedMimeTypes();
console.log("Supported MIME types:", supportedTypes);

// 登録コンバーター数
console.log(`Total converters: ${globalConverterRegistry.size}`);

// 特定MIMEタイプのコンバーター数
const count = globalConverterRegistry.getConverterCountByMimeType("text/plain");
console.log(`Converters for text/plain: ${count}`);
```

### 5.5 デバッグ情報の出力

```typescript
// レジストリの内部状態をダンプ
const state = globalConverterRegistry.dump();
console.log(JSON.stringify(state, null, 2));
```

---

## 6. テスト戦略

### 6.1 レジストリのテスト

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { ConverterRegistry, createTestRegistry } from "./converter-registry";
import type { IConverter, ConverterInput } from "./types";

// モックコンバーター
class MockConverter implements IConverter {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly supportedMimeTypes: readonly string[],
    public readonly priority: number,
  ) {}

  canConvert(input: ConverterInput): boolean {
    return this.supportedMimeTypes.includes(input.mimeType);
  }

  async convert(input: ConverterInput) {
    // モック実装
    return ok({
      convertedContent: "mock",
      extractedMetadata: {},
      processingTime: 0,
    });
  }

  estimateProcessingTime(): number {
    return 10;
  }
}

describe("ConverterRegistry", () => {
  let registry: ConverterRegistry;

  beforeEach(() => {
    registry = createTestRegistry();
  });

  describe("register()", () => {
    it("should register a converter", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
      );

      const result = registry.register(converter);

      expect(result.success).toBe(true);
      expect(registry.size).toBe(1);
    });

    it("should reject converter without ID", () => {
      const converter = new MockConverter(
        "",
        "Test Converter",
        ["text/plain"],
        0,
      );

      const result = registry.register(converter);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.INVALID_INPUT);
      }
    });

    it("should reject converter without supported MIME types", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        [],
        0,
      );

      const result = registry.register(converter);

      expect(result.success).toBe(false);
    });

    it("should overwrite existing converter with same ID", () => {
      const converter1 = new MockConverter(
        "test-converter",
        "Test Converter v1",
        ["text/plain"],
        0,
      );
      const converter2 = new MockConverter(
        "test-converter",
        "Test Converter v2",
        ["text/plain"],
        10,
      );

      registry.register(converter1);
      registry.register(converter2);

      const retrieved = registry.get("test-converter");
      expect(retrieved.success).toBe(true);
      if (retrieved.success) {
        expect(retrieved.data.name).toBe("Test Converter v2");
        expect(retrieved.data.priority).toBe(10);
      }
    });
  });

  describe("unregister()", () => {
    it("should unregister a converter", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
      );

      registry.register(converter);
      const result = registry.unregister("test-converter");

      expect(result.success).toBe(true);
      expect(registry.size).toBe(0);
    });

    it("should return error for non-existent converter", () => {
      const result = registry.unregister("non-existent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.NOT_FOUND);
      }
    });
  });

  describe("findConverter()", () => {
    it("should find converter by MIME type", () => {
      const converter = new MockConverter(
        "text-converter",
        "Text Converter",
        ["text/plain"],
        0,
      );

      registry.register(converter);

      const input: ConverterInput = {
        fileId: "file_123" as FileId,
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "Hello",
        encoding: "utf-8",
      };

      const result = registry.findConverter(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("text-converter");
      }
    });

    it("should return highest priority converter", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain"],
        5,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["text/plain"],
        10,
      );
      const converter3 = new MockConverter(
        "converter-3",
        "Converter 3",
        ["text/plain"],
        3,
      );

      registry.register(converter1);
      registry.register(converter2);
      registry.register(converter3);

      const input: ConverterInput = {
        fileId: "file_123" as FileId,
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "Hello",
        encoding: "utf-8",
      };

      const result = registry.findConverter(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("converter-2"); // 優先度10が最高
      }
    });

    it("should return error for unsupported MIME type", () => {
      const input: ConverterInput = {
        fileId: "file_123" as FileId,
        filePath: "/test.unknown",
        mimeType: "application/unknown",
        content: "Hello",
        encoding: "utf-8",
      };

      const result = registry.findConverter(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.CONVERTER_NOT_FOUND);
      }
    });
  });

  describe("getSupportedMimeTypes()", () => {
    it("should return all supported MIME types", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain", "text/markdown"],
        0,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["application/pdf"],
        0,
      );

      registry.register(converter1);
      registry.register(converter2);

      const mimeTypes = registry.getSupportedMimeTypes();

      expect(mimeTypes).toEqual([
        "application/pdf",
        "text/markdown",
        "text/plain",
      ]);
    });
  });
});
```

---

## 7. パフォーマンス考慮事項

### 7.1 時間計算量

| 操作                    | 時間計算量 | 理由                                         |
| ----------------------- | ---------- | -------------------------------------------- |
| register()              | O(n log n) | MIMEタイプインデックス再構築＋ソート         |
| unregister()            | O(n log n) | MIMEタイプインデックス再構築＋ソート         |
| get()                   | O(1)       | Map.get()                                    |
| findConverter()         | O(m)       | m = MIMEタイプ対応コンバーター数（通常は小） |
| findByMimeType()        | O(1)       | Map.get()でインデックス取得                  |
| getSupportedMimeTypes() | O(k log k) | k = MIMEタイプ数（ソート）                   |

### 7.2 最適化戦略

#### 7.2.1 インデックスキャッシュ

```typescript
// ✓ 良い例: インデックスをキャッシュ
private readonly mimeTypeIndex: Map<string, string[]>;

// ✗ 悪い例: 毎回計算
findByMimeType(mimeType: string): IConverter[] {
  // 毎回すべてのコンバーターを走査（O(n)）
  return this.getAll().filter(c => c.supportedMimeTypes.includes(mimeType));
}
```

#### 7.2.2 登録時のソート

```typescript
// ✓ 良い例: 登録時にソート（1回だけ）
private updateMimeTypeIndex(): void {
  // 登録・登録解除時に実行
  for (const [mimeType, converterIds] of this.mimeTypeIndex.entries()) {
    const sorted = converterIds.sort(/* ... */);
    this.mimeTypeIndex.set(mimeType, sorted);
  }
}

// ✗ 悪い例: 検索時にソート（毎回）
findConverter(input: ConverterInput): Result<IConverter, RAGError> {
  const candidates = this.findByMimeType(input.mimeType);
  const sorted = this.sortByPriority(candidates); // 毎回ソート
  return ok(sorted[0]);
}
```

### 7.3 メモリ効率

```typescript
// コンバーター参照のみを保持（実体は1つ）
private readonly converters: Map<string, IConverter>; // O(n)
private readonly mimeTypeIndex: Map<string, string[]>; // O(k×m), k=MIMEタイプ数, m=平均コンバーター数
```

---

## 8. エラーハンドリング

### 8.1 エラーコード一覧

| エラーコード        | 発生条件                                 | 対応方法                         |
| ------------------- | ---------------------------------------- | -------------------------------- |
| INVALID_INPUT       | コンバーターIDが空、またはMIMEタイプが空 | バリデーションエラーとして返す   |
| NOT_FOUND           | IDでの取得時、コンバーターが存在しない   | エラーを返す                     |
| CONVERTER_NOT_FOUND | 入力に対応するコンバーターが見つからない | エラーを返す                     |
| INTERNAL_ERROR      | 予期しないエラー                         | エラーログを出力し、エラーを返す |

### 8.2 エラーハンドリングのベストプラクティス

```typescript
// ✓ 良い例: Result型で返す
register(converter: IConverter): Result<void, RAGError> {
  if (!converter.id) {
    return err(createRAGError(/* ... */));
  }
  // ...
  return ok(undefined);
}

// ✗ 悪い例: 例外をスロー
register(converter: IConverter): void {
  if (!converter.id) {
    throw new Error("Converter ID is required");
  }
  // ...
}
```

---

## 9. 実装ガイドライン

### 9.1 ファイル構成

```
packages/shared/src/services/conversion/
├── converter-registry.ts          # ConverterRegistry実装
├── converter-registry.test.ts     # ConverterRegistryテスト
└── index.ts                        # バレルエクスポート
```

### 9.2 インポート順序

```typescript
// 1. 外部依存
import type { Result } from "../../types/rag/result";
import type { RAGError } from "../../types/rag/errors";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";

// 2. 内部依存
import type { IConverter, ConverterInput } from "./types";

// 3. クラス定義
export class ConverterRegistry {
  /* ... */
}

// 4. グローバルインスタンス
export const globalConverterRegistry = new ConverterRegistry();

// 5. ヘルパー関数
export function initializeGlobalRegistry(): void {
  /* ... */
}
export function createTestRegistry(): ConverterRegistry {
  /* ... */
}
```

### 9.3 命名規約

| 要素                   | 規約                       | 例                          |
| ---------------------- | -------------------------- | --------------------------- |
| クラス名               | PascalCase                 | `ConverterRegistry`         |
| メソッド               | camelCase                  | `register`, `findConverter` |
| プライベートメソッド   | camelCase                  | `updateMimeTypeIndex`       |
| グローバルインスタンス | camelCase + Registry接尾辞 | `globalConverterRegistry`   |

---

## 10. 変更履歴

| 日付       | バージョン | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 2025-12-20 | 1.0.0      | AI     | 初版作成 |

---

## 11. 完了条件チェックリスト

- [ ] コンバーター登録・登録解除の仕組みが設計されている
- [ ] 優先度ベースの選択アルゴリズムが設計されている
- [ ] MIMEタイプによる検索機能が設計されている
- [ ] グローバルインスタンスとテスト用インスタンスの使い分けが明確
- [ ] パフォーマンス最適化戦略が提供されている
- [ ] エラーハンドリングが適切に設計されている
- [ ] テスト戦略が明確
