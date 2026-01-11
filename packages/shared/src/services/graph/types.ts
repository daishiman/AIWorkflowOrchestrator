/**
 * @file Knowledge Graph Store 型定義
 * @module @repo/shared/services/graph/types
 * @description Knowledge Graphストアのドメイン型定義
 */

import type {
  EntityId,
  RelationId,
  ChunkId,
  CommunityId,
} from "../../types/rag/branded";
import type { EntityType, RelationType } from "../../types/rag/graph/types";

// =============================================================================
// Entity Types
// =============================================================================

/**
 * 永続化されたエンティティ
 *
 * @description
 * DBに格納されたエンティティの状態を表現。
 * ExtractedEntityから変換され、追加のメタデータを持つ。
 */
export interface StoredEntity {
  /** エンティティ一意識別子 */
  readonly id: EntityId;

  /** エンティティ名（元の表記） */
  readonly name: string;

  /** 正規化名（小文字・特殊文字除去） */
  readonly normalizedName: string;

  /** エンティティタイプ */
  readonly type: EntityType;

  /** 説明文（オプション） */
  readonly description: string | null;

  /** 別名リスト */
  readonly aliases: readonly string[];

  /** 埋め込みベクトル（オプション） */
  readonly embedding: number[] | null;

  /** 関連チャンクIDリスト */
  readonly chunkIds: readonly ChunkId[];

  /** 出現回数 */
  readonly mentionCount: number;

  /** 重要度スコア (0.0-1.0) */
  readonly importance: number;

  /** 追加属性（JSON） */
  readonly attributes: Record<string, unknown> | null;

  /** 作成日時 */
  readonly createdAt: Date;

  /** 更新日時 */
  readonly updatedAt: Date;
}

/**
 * エンティティメンション位置
 */
export interface EntityMention {
  readonly startChar: number;
  readonly endChar: number;
  readonly surfaceForm: string;
}

/**
 * 抽出されたエンティティ（入力型）
 *
 * @description
 * エンティティ抽出サービスから渡されるデータ。
 * StoredEntityに変換して永続化される。
 */
export interface ExtractedEntity {
  /** エンティティ名 */
  readonly name: string;

  /** エンティティタイプ */
  readonly type: EntityType;

  /** 信頼度 (0.0-1.0) */
  readonly confidence: number;

  /** 説明文（オプション） */
  readonly description?: string;

  /** 別名リスト */
  readonly aliases?: readonly string[];

  /** 埋め込みベクトル（オプション） */
  readonly embedding?: readonly number[];

  /** 抽出元チャンクID */
  readonly chunkId?: ChunkId;

  /** メンション情報（オプション） */
  readonly mentions?: readonly EntityMention[];
}

// =============================================================================
// Relation Types
// =============================================================================

/**
 * 関係の証拠
 *
 * @description
 * 関係が抽出されたチャンクと抜粋テキストを保持。
 */
export interface RelationEvidence {
  /** 証拠となるチャンクID */
  readonly chunkId: ChunkId;

  /** 抜粋テキスト (1-500文字) */
  readonly text: string;

  /** 信頼度 (0.0-1.0) */
  readonly confidence: number;
}

/**
 * 永続化された関係
 *
 * @description
 * エンティティ間の関係をエッジとして表現。
 * 重み付きで、証拠情報を保持。
 */
export interface StoredRelation {
  /** 関係一意識別子 */
  readonly id: RelationId;

  /** ソースエンティティID */
  readonly sourceEntityId: EntityId;

  /** ターゲットエンティティID */
  readonly targetEntityId: EntityId;

  /** 関係タイプ */
  readonly relationType: RelationType;

  /** 説明文（オプション） */
  readonly description: string | null;

  /** 関係の強さ (累積重み) */
  readonly weight: number;

  /** 証拠リスト */
  readonly evidence: readonly RelationEvidence[];

  /** 双方向フラグ */
  readonly bidirectional: boolean;

  /** 追加属性（JSON） */
  readonly attributes: Record<string, unknown> | null;

  /** 作成日時 */
  readonly createdAt: Date;

  /** 更新日時 */
  readonly updatedAt: Date;
}

/**
 * 抽出された関係（入力型）
 */
export interface ExtractedRelation {
  /** ソースエンティティ名または正規化名 */
  readonly sourceName: string;

  /** ターゲットエンティティ名または正規化名 */
  readonly targetName: string;

  /** 関係タイプ */
  readonly type: RelationType;

  /** 説明文（オプション） */
  readonly description?: string;

  /** 信頼度 */
  readonly confidence: number;

  /** 双方向フラグ */
  readonly bidirectional?: boolean;

  /** 証拠情報 */
  readonly evidence: RelationEvidence;
}

// =============================================================================
// Graph Types
// =============================================================================

/**
 * グラフノード
 *
 * @description
 * エンティティとその入出力関係をまとめたビュー。
 */
export interface GraphNode {
  /** エンティティ本体 */
  readonly entity: StoredEntity;

  /** 入力方向の関係（このノードがtarget） */
  readonly inRelations: readonly StoredRelation[];

  /** 出力方向の関係（このノードがsource） */
  readonly outRelations: readonly StoredRelation[];
}

/**
 * グラフパス
 *
 * @description
 * エンティティの連なりと、その間の関係を表現。
 */
export interface GraphPath {
  /** パス上のエンティティリスト（順序付き） */
  readonly entities: readonly StoredEntity[];

  /** パス上の関係リスト（entities間） */
  readonly relations: readonly StoredRelation[];

  /** パスの総重み（関係weightの合計） */
  readonly totalWeight: number;
}

/**
 * グラフトラバーサル結果
 */
export interface GraphTraversalResult {
  /** 開始エンティティ */
  readonly startEntity: StoredEntity;

  /** 発見されたパスリスト */
  readonly paths: readonly GraphPath[];

  /** 訪問したエンティティリスト */
  readonly visitedEntities: readonly StoredEntity[];

  /** 到達した最大深度 */
  readonly maxDepthReached: number;
}

/**
 * グラフ統計情報
 */
export interface GraphStats {
  /** エンティティ総数 */
  readonly entityCount: number;

  /** 関係総数 */
  readonly relationCount: number;

  /** エンティティタイプ別分布 */
  readonly entityTypeDistribution: Readonly<Record<string, number>>;

  /** 関係タイプ別分布 */
  readonly relationTypeDistribution: Readonly<Record<string, number>>;

  /** エンティティあたり平均関係数 */
  readonly averageRelationsPerEntity: number;

  /** グラフ密度 (0.0-1.0) */
  readonly graphDensity: number;
}

// =============================================================================
// Query Types
// =============================================================================

/**
 * エンティティ検索条件
 */
export interface EntityQuery {
  /** タイプフィルタ */
  readonly types?: readonly EntityType[];

  /** 名前パターン (LIKE検索用) */
  readonly namePattern?: string;

  /** 最小出現回数 */
  readonly minMentionCount?: number;

  /** チャンクIDフィルタ */
  readonly chunkIds?: readonly ChunkId[];

  /** 取得件数上限 */
  readonly limit?: number;

  /** オフセット（ページネーション） */
  readonly offset?: number;
}

/**
 * トラバーサルオプション
 */
export interface TraversalOptions {
  /** 最大探索深度 */
  readonly maxDepth: number;

  /** 関係タイプフィルタ */
  readonly relationTypes?: readonly RelationType[];

  /** 探索方向 */
  readonly direction?: "in" | "out" | "both";

  /** 最大ノード数 */
  readonly maxNodes?: number;

  /** 最小関係重み */
  readonly minRelationWeight?: number;
}

/**
 * 関係取得オプション
 */
export interface RelationQueryOptions {
  /** 方向フィルタ */
  readonly direction?: "in" | "out" | "both";

  /** 関係タイプフィルタ */
  readonly types?: readonly RelationType[];
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * エンティティ名の正規化
 *
 * @param name 元のエンティティ名
 * @returns 正規化された名前
 *
 * @example
 * normalizeEntityName("TypeScript 5.x") // "typescript 5x"
 * normalizeEntityName("React.js") // "reactjs"
 */
export function normalizeEntityName(name: string): string {
  return name
    .toLowerCase() // 小文字化
    .trim() // 前後空白除去
    .replace(/[^\w\s]/g, "") // 特殊文字除去
    .replace(/\s+/g, " "); // 連続空白を単一に
}

// =============================================================================
// Community Types (Leiden Algorithm)
// =============================================================================

/**
 * グラフエッジ（コミュニティ検出用）
 *
 * @description
 * Leidenアルゴリズムの入力となるエッジ表現。
 * StoredRelationから変換して使用する。
 */
export interface GraphEdge {
  /** ソースノードID */
  readonly source: EntityId;

  /** ターゲットノードID */
  readonly target: EntityId;

  /** エッジの重み (0より大きい正の実数) */
  readonly weight: number;
}

/**
 * コミュニティ
 *
 * @description
 * Leidenアルゴリズムで検出されたコミュニティ。
 * 階層構造を持ち、複数レベルで存在可能。
 */
export interface Community {
  /** コミュニティ一意識別子 */
  readonly id: CommunityId;

  /** 階層レベル (0が最下層) */
  readonly level: number;

  /** このコミュニティに直接属するエンティティID */
  readonly memberEntityIds: readonly EntityId[];

  /** 子コミュニティID (上位レベルのコミュニティのみ) */
  readonly childCommunityIds: readonly CommunityId[];

  /** 親コミュニティID (最上位以外) */
  readonly parentCommunityId?: CommunityId;

  /** コミュニティサイズ (直接または間接メンバー数) */
  readonly size: number;

  /** 内部エッジ数 */
  readonly internalEdges: number;

  /** 外部エッジ数 */
  readonly externalEdges: number;

  /** このコミュニティのモジュラリティ貢献 */
  readonly modularity: number;

  /** サマリー（LLM生成、オプション） */
  readonly summary?: string;

  /** 作成日時 */
  readonly createdAt: Date;

  /** 更新日時 */
  readonly updatedAt: Date;
}

/**
 * コミュニティ構造
 *
 * @description
 * Leidenアルゴリズムの出力。
 * 全コミュニティと階層情報を含む。
 */
export interface CommunityStructure {
  /** 検出された全コミュニティ */
  readonly communities: readonly Community[];

  /** 階層レベル数 */
  readonly levels: number;

  /** グラフ全体のモジュラリティ */
  readonly totalModularity: number;

  /** エンティティ→コミュニティのマッピング */
  readonly entityToCommunity: ReadonlyMap<EntityId, readonly CommunityId[]>;
}

/**
 * コミュニティ検出オプション
 *
 * @description
 * Leidenアルゴリズムのパラメータ。
 */
export interface CommunityDetectionOptions {
  /** 解像度パラメータ (デフォルト: 1.0) */
  readonly resolution?: number;

  /** 最大階層レベル数 (デフォルト: 3) */
  readonly maxLevels?: number;

  /** 最小コミュニティサイズ (デフォルト: 2) */
  readonly minCommunitySize?: number;

  /** 最大イテレーション数 (デフォルト: 100) */
  readonly maxIterations?: number;

  /** 乱数シード (再現性確保用) */
  readonly seed?: number;
}

/**
 * コミュニティ検出結果
 *
 * @description
 * Leidenアルゴリズムの実行結果。
 * 構造情報と処理メタデータを含む。
 */
export interface CommunityDetectionResult {
  /** コミュニティ構造 */
  readonly structure: CommunityStructure;

  /** 処理時間（ミリ秒） */
  readonly processingTimeMs: number;

  /** 使用したオプション */
  readonly options: Required<CommunityDetectionOptions>;

  /** 処理統計 */
  readonly stats: CommunityDetectionStats;
}

/**
 * コミュニティ検出統計
 */
export interface CommunityDetectionStats {
  /** 入力ノード数 */
  readonly nodeCount: number;

  /** 入力エッジ数 */
  readonly edgeCount: number;

  /** 検出されたコミュニティ数 */
  readonly communityCount: number;

  /** 実行イテレーション数 */
  readonly iterationsRun: number;

  /** 収束したかどうか */
  readonly converged: boolean;
}

/**
 * コミュニティエラーコード
 */
export enum CommunityErrorCode {
  /** グラフ読み込み失敗 */
  GRAPH_LOAD_FAILED = "GRAPH_LOAD_FAILED",

  /** 検出処理失敗 */
  DETECTION_FAILED = "DETECTION_FAILED",

  /** 保存失敗 */
  SAVE_FAILED = "SAVE_FAILED",

  /** コミュニティが見つからない */
  NOT_FOUND = "NOT_FOUND",

  /** 無効なパラメータ */
  INVALID_PARAMETER = "INVALID_PARAMETER",
}

/**
 * コミュニティ検出エラー
 */
export class CommunityDetectionError extends Error {
  constructor(
    message: string,
    public readonly code: CommunityErrorCode,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "CommunityDetectionError";
  }
}

// =============================================================================
// Community Summarization Types (CONV-08-03)
// =============================================================================

/**
 * コミュニティ要約
 *
 * @description
 * LLMによって生成されたコミュニティの要約情報。
 * グローバルクエリへの回答やセマンティック検索に使用。
 */
export interface CommunitySummary {
  /** 対象コミュニティID */
  readonly communityId: CommunityId;

  /** コミュニティの階層レベル */
  readonly level: number;

  /** 要約テキスト */
  readonly summary: string;

  /** キーワードリスト（検索用） */
  readonly keywords: readonly string[];

  /** 主要エンティティ名（最大5件） */
  readonly mainEntities: readonly string[];

  /** 主要関係の説明（最大5件） */
  readonly mainRelations: readonly string[];

  /** 全体的な傾向（positive/negative/neutral） */
  readonly sentiment: "positive" | "negative" | "neutral";

  /** 信頼度 (0.0-1.0) */
  readonly confidence: number;

  /** 要約トークン数 */
  readonly tokenCount: number;

  /** 埋め込みベクトル（セマンティック検索用） */
  readonly embedding?: readonly number[];

  /** 作成日時 */
  readonly createdAt: Date;
}

/**
 * コミュニティ要約生成オプション
 */
export interface CommunitySummarizationOptions {
  /** 要約の最大トークン数 (デフォルト: 200) */
  readonly maxSummaryTokens?: number;

  /** キーワードの最大数 (デフォルト: 10) */
  readonly maxKeywords?: number;

  /** 子コミュニティの要約を使用 (デフォルト: true) */
  readonly useChildSummaries?: boolean;

  /** 埋め込みを生成 (デフォルト: true) */
  readonly generateEmbedding?: boolean;

  /** 並列処理の最大数 (デフォルト: 5) */
  readonly maxConcurrency?: number;

  /** 要約スタイル (デフォルト: "concise") */
  readonly summaryStyle?: "detailed" | "concise" | "technical";
}

/**
 * コミュニティ一括要約生成結果
 */
export interface CommunitySummarizationResult {
  /** 生成された要約リスト */
  readonly summaries: readonly CommunitySummary[];

  /** 失敗したコミュニティID */
  readonly failedCommunities: readonly CommunityId[];

  /** 使用した総トークン数 */
  readonly totalTokensUsed: number;

  /** 処理時間（ミリ秒） */
  readonly processingTimeMs: number;
}

/**
 * コミュニティ要約エラーコード
 */
export enum CommunitySummarizationErrorCode {
  /** LLM呼び出し失敗 */
  LLM_GENERATION_FAILED = "LLM_GENERATION_FAILED",

  /** JSONパース失敗 */
  JSON_PARSE_FAILED = "JSON_PARSE_FAILED",

  /** 埋め込み生成失敗 */
  EMBEDDING_FAILED = "EMBEDDING_FAILED",

  /** コミュニティが見つからない */
  COMMUNITY_NOT_FOUND = "COMMUNITY_NOT_FOUND",

  /** グラフデータ読み込み失敗 */
  GRAPH_DATA_LOAD_FAILED = "GRAPH_DATA_LOAD_FAILED",

  /** DB保存失敗 */
  DB_SAVE_FAILED = "DB_SAVE_FAILED",
}

/**
 * コミュニティ要約エラー
 */
export class CommunitySummarizationError extends Error {
  constructor(
    message: string,
    public readonly code: CommunitySummarizationErrorCode,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "CommunitySummarizationError";
  }
}
