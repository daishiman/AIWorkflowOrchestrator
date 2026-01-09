/**
 * @file Knowledge Graph Store エラー定義
 * @module @repo/shared/services/graph/errors
 * @description Knowledge Graphストアのカスタムエラークラス
 */

// =============================================================================
// Base Error
// =============================================================================

/**
 * Knowledge Graphストアのエラー基底クラス
 */
export class KnowledgeGraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KnowledgeGraphError";
    // Error継承時のprototype chain修正
    Object.setPrototypeOf(this, KnowledgeGraphError.prototype);
  }
}

// =============================================================================
// Entity Errors
// =============================================================================

/**
 * エンティティ未発見エラー
 */
export class EntityNotFoundError extends KnowledgeGraphError {
  readonly entityId: string;

  constructor(id: string) {
    super(`Entity not found: ${id}`);
    this.name = "EntityNotFoundError";
    this.entityId = id;
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }
}

// =============================================================================
// Relation Errors
// =============================================================================

/**
 * 関係未発見エラー
 */
export class RelationNotFoundError extends KnowledgeGraphError {
  readonly relationId: string;

  constructor(id: string) {
    super(`Relation not found: ${id}`);
    this.name = "RelationNotFoundError";
    this.relationId = id;
    Object.setPrototypeOf(this, RelationNotFoundError.prototype);
  }
}

/**
 * Self-loopエラー
 */
export class SelfLoopError extends KnowledgeGraphError {
  constructor() {
    super("Self-loop relations are not allowed");
    this.name = "SelfLoopError";
    Object.setPrototypeOf(this, SelfLoopError.prototype);
  }
}

/**
 * Evidence必須エラー
 */
export class EvidenceRequiredError extends KnowledgeGraphError {
  constructor() {
    super("At least one evidence is required for a relation");
    this.name = "EvidenceRequiredError";
    Object.setPrototypeOf(this, EvidenceRequiredError.prototype);
  }
}

// =============================================================================
// Database Errors
// =============================================================================

/**
 * データベース接続エラー
 */
export class DatabaseConnectionError extends KnowledgeGraphError {
  readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(`Database connection error: ${message}`);
    this.name = "DatabaseConnectionError";
    this.originalError = originalError;
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
}

/**
 * データベースクエリエラー
 */
export class DatabaseQueryError extends KnowledgeGraphError {
  readonly originalError?: Error;
  readonly query?: string;

  constructor(message: string, originalError?: Error, query?: string) {
    super(`Database query error: ${message}`);
    this.name = "DatabaseQueryError";
    this.originalError = originalError;
    this.query = query;
    Object.setPrototypeOf(this, DatabaseQueryError.prototype);
  }
}

// =============================================================================
// Validation Errors
// =============================================================================

/**
 * バリデーションエラー
 */
export class ValidationError extends KnowledgeGraphError {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(`Validation error: ${message}`);
    this.name = "ValidationError";
    this.field = field;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
