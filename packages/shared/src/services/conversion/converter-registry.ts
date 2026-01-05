/**
 * @file コンバーターレジストリ
 * @module @repo/shared/services/conversion/converter-registry
 * @description 利用可能なコンバーターを管理し、入力に応じて最適なコンバーターを選択する
 */

// =============================================================================
// インポート
// =============================================================================

import type { IConverter, ConverterInput } from "./types";
import type { Result, RAGError } from "../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../types/rag";

// =============================================================================
// ConverterRegistryクラス
// =============================================================================

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
 *
 * @example
 * ```typescript
 * const registry = new ConverterRegistry();
 * registry.register(new PlainTextConverter());
 * registry.register(new MarkdownConverter());
 *
 * const result = registry.findConverter(input);
 * if (result.success) {
 *   await result.data.convert(input);
 * }
 * ```
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
          createRAGError(
            ErrorCodes.VALIDATION_ERROR,
            "Converter ID is required",
            {
              converterId: converter.id,
            },
          ),
        );
      }

      if (converter.supportedMimeTypes.length === 0) {
        return err(
          createRAGError(
            ErrorCodes.VALIDATION_ERROR,
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
            ErrorCodes.CONVERTER_NOT_FOUND,
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
          ErrorCodes.CONVERTER_NOT_FOUND,
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

// =============================================================================
// グローバルインスタンス
// =============================================================================

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
 *
 * @example
 * ```typescript
 * // アプリケーション起動時
 * initializeGlobalRegistry();
 * ```
 */
export function initializeGlobalRegistry(): void {
  // 標準コンバーターを登録
  // （実際のコンバーター実装は後続タスクCONV-02-02, CONV-02-03で追加）
  // 例: globalConverterRegistry.register(new PlainTextConverter());
  // 例: globalConverterRegistry.register(new MarkdownConverter());
}

/**
 * テスト用レジストリインスタンスを生成
 *
 * グローバルインスタンスに影響を与えずにテスト可能。
 *
 * @returns 新しいレジストリインスタンス
 *
 * @example
 * ```typescript
 * // ユニットテスト内
 * const registry = createTestRegistry();
 * registry.register(new MockConverter());
 * ```
 */
export function createTestRegistry(): ConverterRegistry {
  return new ConverterRegistry();
}
