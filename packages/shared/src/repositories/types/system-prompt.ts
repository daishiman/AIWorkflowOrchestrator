/**
 * システムプロンプトテンプレート型定義
 *
 * @see docs/30-workflows/system-prompt-db/outputs/phase-2/repository-interface-design.md
 */

/**
 * システムプロンプトテンプレート
 */
export interface PromptTemplate {
  /** テンプレートID (UUID v4) */
  id: string;
  /** ユーザーID */
  userId: string;
  /** テンプレート名 (1〜50文字) */
  name: string;
  /** テンプレート本文 (1〜4000文字) */
  content: string;
  /** プリセットフラグ */
  isPreset: boolean;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
}

/**
 * テンプレート作成入力
 */
export interface CreatePromptTemplateInput {
  /** テンプレート名 (1〜50文字) */
  name: string;
  /** テンプレート本文 (1〜4000文字) */
  content: string;
}

/**
 * テンプレート更新入力
 */
export interface UpdatePromptTemplateInput {
  /** テンプレート名 (1〜50文字) */
  name?: string;
  /** テンプレート本文 (1〜4000文字) */
  content?: string;
}

/**
 * テンプレート一覧取得オプション
 */
export interface FindTemplatesOptions {
  /** 取得件数 (1〜100) */
  limit?: number;
  /** オフセット */
  offset?: number;
  /** プリセットを含めるか (デフォルト: true) */
  includePresets?: boolean;
  /** ソートカラム */
  orderBy?: "createdAt" | "updatedAt" | "name";
  /** ソート順序 */
  orderDirection?: "ASC" | "DESC";
}

/**
 * システムプロンプトリポジトリインターフェース
 */
export interface ISystemPromptRepository {
  /**
   * ユーザーIDでテンプレート一覧を取得
   */
  findAllByUserId(
    userId: string,
    options?: FindTemplatesOptions,
  ): Promise<PromptTemplate[]>;

  /**
   * IDでテンプレートを取得
   */
  findById(id: string): Promise<PromptTemplate | null>;

  /**
   * 全プリセットテンプレートを取得
   */
  findAllPresets(): Promise<PromptTemplate[]>;

  /**
   * テンプレートを作成
   */
  create(
    userId: string,
    data: CreatePromptTemplateInput,
  ): Promise<PromptTemplate>;

  /**
   * テンプレートを更新
   */
  update(id: string, data: UpdatePromptTemplateInput): Promise<PromptTemplate>;

  /**
   * テンプレートを削除
   */
  delete(id: string): Promise<void>;

  /**
   * プリセットテンプレートか判定
   */
  isPreset(id: string): Promise<boolean>;

  /**
   * ユーザーと名前でテンプレートが存在するか確認
   */
  existsByUserIdAndName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean>;

  /**
   * テンプレートが存在するか確認
   */
  exists(id: string): Promise<boolean>;
}
