/**
 * Phase 12 ガードスクリプト共通型定義
 *
 * na-log-validator, triple-check-validator, audit-output-parser で
 * 共有する型を一元管理する。
 */

/** 違反ブロック（current / baseline 共通構造） */
export interface ViolationBlock {
  /** 違反の総数（0以上の整数） */
  total: number;
  /** 違反の詳細メッセージ配列 */
  details: string[];
}

/** 監査結果の型（current/baseline 分離構造） */
export interface AuditResult {
  /** 本タスクで発生した違反 */
  currentViolations: ViolationBlock;
  /** 既存の未解決違反（本タスクのスコープ外） */
  baselineViolations: ViolationBlock;
}
