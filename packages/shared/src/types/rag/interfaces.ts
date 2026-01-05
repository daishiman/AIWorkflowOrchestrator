/**
 * @file 共通インターフェース定義
 * @module @repo/shared/types/rag/interfaces
 * @description RAGパイプラインの各コンポーネントが実装すべき共通インターフェース
 */

import type { Result } from "./result";
import type { RAGError } from "./errors";

// =============================================================================
// 共通ミックスイン
// =============================================================================

/**
 * タイムスタンプを持つエンティティ用ミックスイン
 * @example
 * interface User extends Timestamped {
 *   id: string;
 *   name: string;
 * }
 */
export interface Timestamped {
  /** 作成日時 */
  readonly createdAt: Date;
  /** 更新日時 */
  readonly updatedAt: Date;
}

/**
 * メタデータを持つエンティティ用ミックスイン
 * @example
 * interface Document extends WithMetadata {
 *   id: string;
 *   content: string;
 * }
 */
export interface WithMetadata {
  /** 任意のメタデータ */
  readonly metadata: Record<string, unknown>;
}

// =============================================================================
// ページネーション
// =============================================================================

/**
 * ページネーションパラメータ
 * @example
 * const params: PaginationParams = { limit: 20, offset: 0 };
 */
export interface PaginationParams {
  /** 1ページあたりの件数 */
  readonly limit: number;
  /** スキップする件数 */
  readonly offset: number;
}

/**
 * ページネーション結果
 * @template T アイテムの型
 * @example
 * const result: PaginatedResult<User> = {
 *   items: users,
 *   total: 100,
 *   limit: 20,
 *   offset: 0,
 *   hasMore: true
 * };
 */
export interface PaginatedResult<T> {
  /** 取得したアイテム */
  readonly items: T[];
  /** 総件数 */
  readonly total: number;
  /** 1ページあたりの件数 */
  readonly limit: number;
  /** スキップした件数 */
  readonly offset: number;
  /** 次のページが存在するか */
  readonly hasMore: boolean;
}

// =============================================================================
// 非同期ステータス
// =============================================================================

/**
 * 非同期処理のステータス
 * - pending: 処理待ち
 * - processing: 処理中
 * - completed: 完了
 * - failed: 失敗
 */
export type AsyncStatus = "pending" | "processing" | "completed" | "failed";

// =============================================================================
// Repository パターン
// =============================================================================

/**
 * リポジトリインターフェース
 * DIP準拠: ドメイン層がインフラ層に依存しないための抽象
 *
 * @template T エンティティの型
 * @template ID エンティティのID型
 *
 * @example
 * interface UserRepository extends Repository<User, UserId> {
 *   findByEmail(email: string): Promise<Result<User | null, RAGError>>;
 * }
 */
export interface Repository<T, ID> {
  /**
   * IDによるエンティティ取得
   * @param id エンティティID
   * @returns エンティティまたはnull
   */
  findById(id: ID): Promise<Result<T | null, RAGError>>;

  /**
   * 全エンティティ取得（ページネーション付き）
   * @param params ページネーションパラメータ（オプション）
   * @returns ページネーション結果
   */
  findAll(
    params?: PaginationParams,
  ): Promise<Result<PaginatedResult<T>, RAGError>>;

  /**
   * エンティティ作成
   * @param entity 作成するエンティティ（ID、タイムスタンプを除く）
   * @returns 作成されたエンティティ
   */
  create(
    entity: Omit<T, "id" | "createdAt" | "updatedAt">,
  ): Promise<Result<T, RAGError>>;

  /**
   * エンティティ更新
   * @param id 更新対象のID
   * @param entity 更新内容（部分更新）
   * @returns 更新されたエンティティ
   */
  update(id: ID, entity: Partial<T>): Promise<Result<T, RAGError>>;

  /**
   * エンティティ削除
   * @param id 削除対象のID
   * @returns void（成功時）
   */
  delete(id: ID): Promise<Result<void, RAGError>>;
}

// =============================================================================
// Converter パターン
// =============================================================================

/**
 * コンバーターインターフェース
 * ファイル変換や形式変換の抽象
 *
 * @template TInput 入力型
 * @template TOutput 出力型
 *
 * @example
 * interface PDFConverter extends Converter<PDFInput, TextOutput> {
 *   extractImages(): Promise<Result<Image[], RAGError>>;
 * }
 */
export interface Converter<TInput, TOutput> {
  /**
   * サポートするファイル拡張子のリスト
   * @example ["pdf", "docx", "txt"]
   */
  readonly supportedTypes: readonly string[];

  /**
   * 入力が変換可能かどうかを判定
   * @param input 入力データ
   * @returns 変換可能ならtrue
   */
  canConvert(input: TInput): boolean;

  /**
   * 変換実行
   * @param input 入力データ
   * @returns 変換結果
   */
  convert(input: TInput): Promise<Result<TOutput, RAGError>>;
}

// =============================================================================
// SearchStrategy パターン
// =============================================================================

/**
 * 検索戦略インターフェース
 * 様々な検索アルゴリズムを抽象化
 *
 * @template TQuery 検索クエリの型
 * @template TResult 検索結果の型
 *
 * @example
 * interface VectorSearchStrategy extends SearchStrategy<VectorQuery, VectorResult> {
 *   setIndex(index: VectorIndex): void;
 * }
 */
export interface SearchStrategy<TQuery, TResult> {
  /**
   * 検索戦略の名前
   * @example "vector-search", "full-text-search", "hybrid-search"
   */
  readonly name: string;

  /**
   * 検索実行
   * @param query 検索クエリ
   * @returns 検索結果の配列
   */
  search(query: TQuery): Promise<Result<TResult[], RAGError>>;
}
