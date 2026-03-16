/**
 * Skill Document Generation Types (TASK-9I)
 *
 * スキルドキュメント自動生成機能の共有型定義
 */

/**
 * ドキュメント生成リクエスト（FR-01〜FR-06）
 */
export interface DocGenerationRequest {
  /** 対象スキル名（P42準拠: 空文字列・スペースのみ不可） */
  skillName: string;
  /** 出力形式 */
  outputFormat: "markdown" | "html";
  /** 使用例セクションを含めるか（FR-04） */
  includeExamples: boolean;
  /** API リファレンスセクションを含めるか（FR-05） */
  includeApiReference: boolean;
  /** ドキュメント言語（FR-03） */
  language: "ja" | "en";
  /** 追加セクション名（FR-06, 任意） */
  customSections?: string[];
}

/**
 * 生成済みドキュメント（FR-01）
 */
export interface GeneratedDoc {
  /** 対象スキル名 */
  skillName: string;
  /** 出力形式 */
  format: "markdown" | "html";
  /** ドキュメント全文（format に応じた形式） */
  content: string;
  /** セクション一覧 */
  sections: DocSection[];
  /** 生成日時（ISO 8601 文字列, NFR-07） */
  generatedAt: string;
  /** 総文字数 */
  wordCount: number;
}

/**
 * ドキュメントセクション
 */
export interface DocSection {
  /** セクション識別子 */
  id: string;
  /** セクションタイトル */
  title: string;
  /** セクション本文 */
  content: string;
  /** 表示順序（0始まり） */
  order: number;
}

/**
 * ドキュメントテンプレート（FR-09, FR-10）
 */
export interface DocTemplate {
  /** テンプレート識別子 */
  id: string;
  /** テンプレート名 */
  name: string;
  /** テンプレート説明 */
  description: string;
  /** テンプレートセクション定義 */
  sections: TemplateSection[];
}

/**
 * テンプレートセクション定義
 */
export interface TemplateSection {
  /** セクション識別子 */
  id: string;
  /** セクションタイトル */
  title: string;
  /** LLM に渡すプロンプト */
  prompt: string;
  /** 必須セクションか（NFR-09） */
  required: boolean;
}

// ============================================================
// Runtime Integration Types (TASK-04 Phase 4-5)
// ============================================================

/** エラーガイダンス情報 */
export interface DocErrorGuidance {
  /** 失敗理由の説明 */
  reason: string;
  /** 推奨アクション */
  action: string;
  /** Terminal Handoff が利用可能か */
  handoffAvailable: boolean;
}

/** エラー分類カテゴリ */
export type DocErrorCategory =
  | "VALIDATION"
  | "BUSINESS"
  | "EXTERNAL_SERVICE"
  | "INFRASTRUCTURE"
  | "INTERNAL";

/** 構造化エラー情報 */
export interface DocError {
  /** エラーコード (1001-5001) */
  code: number;
  /** エラーカテゴリ */
  category: DocErrorCategory;
  /** エラーメッセージ */
  message: string;
  /** リトライ可能かどうか */
  retryable: boolean;
  /** ユーザー向けガイダンス */
  guidance?: DocErrorGuidance;
}

/** docs操作の結果型 */
export interface DocOperationResult<T> {
  success: boolean;
  data?: T;
  error?: DocError;
}

/** Skill Docs の capability パス */
export type SkillDocsCapability =
  | "integrated-api"
  | "guidance-only"
  | "terminal-handoff";

/** Capability 解決結果 */
export interface SkillDocsCapabilityResult {
  capability: SkillDocsCapability;
  provider?: string;
  guidance?: string;
  reason?: string;
}
