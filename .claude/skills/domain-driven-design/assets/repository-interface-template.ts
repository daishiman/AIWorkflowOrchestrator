/**
 * リポジトリインターフェーステンプレート
 *
 * このテンプレートは、DDDのリポジトリパターンに従った
 * インターフェース設計のガイドラインを提供します。
 *
 * 使用方法:
 * 1. {{EntityName}} を実際のエンティティ名に置換
 * 2. {{EntityName}}Id を識別子の型名に置換
 * 3. 必要なクエリメソッドを追加
 */

// ============================================
// インポート（ドメイン層の型のみ）
// ============================================

// import { {{EntityName}}, {{EntityName}}Id } from '../entities/{{EntityName}}';

// ============================================
// ページネーション用の型定義（共通で使用）
// ============================================

/**
 * ページネーションオプション
 */
export interface PaginationOptions {
  /** ページ番号（1始まり） */
  page: number;
  /** 1ページあたりの件数 */
  limit: number;
  /** ソートキー */
  sortBy?: string;
  /** ソート順序 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * ページネーション結果
 */
export interface PaginatedResult<T> {
  /** 取得したアイテム */
  items: T[];
  /** 総件数 */
  total: number;
  /** 現在のページ */
  page: number;
  /** 総ページ数 */
  totalPages: number;
}

// ============================================
// 検索条件の型定義（エンティティ固有）
// ============================================

/**
 * {{EntityName}} 検索条件
 *
 * 複雑な検索条件をカプセル化
 */
export interface {{EntityName}}SearchCriteria {
  // 検索条件を追加
  // userId?: UserId;
  // status?: {{EntityName}}Status;
  // createdAfter?: Date;
  // createdBefore?: Date;
}

// ============================================
// リポジトリインターフェース
// ============================================

/**
 * {{EntityName}} リポジトリインターフェース
 *
 * 責務:
 * - {{EntityName}} 集約の永続化と取得を抽象化
 * - コレクション風のインターフェースを提供
 * - 実装の詳細（SQL等）を隠蔽
 *
 * 配置: src/shared/core/interfaces/I{{EntityName}}Repository.ts
 * 実装: src/shared/infrastructure/repositories/{{EntityName}}Repository.ts
 */
export interface I{{EntityName}}Repository {
  // ============================================
  // 基本CRUD操作
  // ============================================

  /**
   * エンティティを追加（新規作成）
   *
   * @param entity 追加するエンティティ
   */
  add(entity: {{EntityName}}): Promise<void>;

  /**
   * エンティティを更新
   *
   * @param entity 更新するエンティティ
   */
  update(entity: {{EntityName}}): Promise<void>;

  /**
   * エンティティを削除
   *
   * @param entity 削除するエンティティ
   */
  remove(entity: {{EntityName}}): Promise<void>;

  // ============================================
  // 検索操作（単一取得）
  // ============================================

  /**
   * IDでエンティティを検索
   *
   * @param id エンティティのID
   * @returns エンティティ、見つからない場合はnull
   */
  findById(id: {{EntityName}}Id): Promise<{{EntityName}} | null>;

  /**
   * IDでエンティティを取得（存在が前提）
   *
   * @param id エンティティのID
   * @returns エンティティ
   * @throws EntityNotFoundError 見つからない場合
   */
  getById(id: {{EntityName}}Id): Promise<{{EntityName}}>;

  // ============================================
  // 検索操作（複数取得）
  // ============================================

  /**
   * 条件に一致するエンティティを検索
   *
   * @param criteria 検索条件
   * @returns 一致するエンティティの配列
   */
  findByCriteria(criteria: {{EntityName}}SearchCriteria): Promise<{{EntityName}}[]>;

  /**
   * 全件取得（ページネーション付き）
   *
   * @param options ページネーションオプション
   * @returns ページネーション結果
   */
  findAll(options: PaginationOptions): Promise<PaginatedResult<{{EntityName}}>>;

  // ============================================
  // 存在確認
  // ============================================

  /**
   * 指定されたIDのエンティティが存在するか確認
   *
   * @param id エンティティのID
   * @returns 存在する場合true
   */
  exists(id: {{EntityName}}Id): Promise<boolean>;

  // ============================================
  // カウント
  // ============================================

  /**
   * 条件に一致するエンティティの件数を取得
   *
   * @param criteria 検索条件
   * @returns 件数
   */
  count(criteria?: {{EntityName}}SearchCriteria): Promise<number>;

  // ============================================
  // ドメイン固有のクエリメソッド（必要に応じて追加）
  // ============================================

  // 例: ユーザーに紐づくエンティティを取得
  // findByUserId(userId: UserId): Promise<{{EntityName}}[]>;

  // 例: 特定のステータスのエンティティを取得
  // findByStatus(status: {{EntityName}}Status): Promise<{{EntityName}}[]>;

  // 例: 期間内に作成されたエンティティを取得
  // findByCreatedDateRange(from: Date, to: Date): Promise<{{EntityName}}[]>;
}

// ============================================
// ドメイン固有のエラー定義
// ============================================

/**
 * エンティティが見つからない場合のエラー
 */
export class {{EntityName}}NotFoundError extends Error {
  constructor(id: {{EntityName}}Id) {
    super(`{{EntityName}} not found: ${id.toString()}`);
    this.name = '{{EntityName}}NotFoundError';
  }
}
