/**
 * スキルチェーン型定義
 * TASK-9D: 複数スキルをパイプラインとして連携させるスキルチェーン機能の型定義
 *
 * @module skill-chain
 */

/** エラーハンドリング戦略 */
export type SkillChainErrorStrategy = "stop" | "skip" | "retry";

/** 入力マッピング種別 */
export type InputMappingType =
  | "literal"
  | "variable"
  | "template"
  | "previousOutput";

/** 条件種別 */
export type SkillChainConditionType =
  | "always"
  | "ifVariable"
  | "ifPreviousSuccess"
  | "expression";

/**
 * スキルチェーン定義
 * チェーンの全体構造を定義する最上位型
 */
export interface SkillChainDefinition {
  /** チェーン識別子（UUID v4） */
  id: string;
  /** チェーン名（表示用、1〜100文字） */
  name: string;
  /** チェーンの説明（0〜500文字） */
  description: string;
  /** 実行ステップ配列（順序保持、1ステップ以上） */
  steps: SkillChainStep[];
  /** テンプレート変数の初期値 */
  variables: Record<string, unknown>;
  /** エラー発生時の振る舞い */
  errorHandling: SkillChainErrorStrategy;
  /** 作成日時（ISO 8601 文字列） */
  createdAt: string;
  /** 更新日時（ISO 8601 文字列） */
  updatedAt: string;
}

/**
 * チェーン内の1ステップ
 */
export interface SkillChainStep {
  /** ステップ識別子（UUID v4） */
  stepId: string;
  /** 実行対象スキル名 */
  skillName: string;
  /** 入力マッピング定義（キー: 入力パラメータ名、値: マッピング定義） */
  inputMapping: Record<string, InputMapping>;
  /** 出力マッピング定義（任意） */
  outputMapping?: OutputMapping;
  /** 実行条件（未指定時は常に実行） */
  condition?: SkillChainCondition;
  /** タイムアウト（ミリ秒、未指定時は 30000ms） */
  timeout?: number;
  /** リトライ回数（未指定時は 0、errorHandling="retry" 時のみ有効） */
  retryCount?: number;
}

/**
 * 入力マッピング定義
 * ステップへの入力値の取得方法を指定する
 */
export interface InputMapping {
  /** 入力値の取得方法 */
  type: InputMappingType;
  /** literal: リテラル値、variable: 変数名 */
  value?: unknown;
  /** template: Mustache テンプレート文字列 */
  template?: string;
}

/**
 * 出力マッピング定義
 * ステップ出力から値を抽出して変数に格納する
 */
export interface OutputMapping {
  /** JSONPath 形式の出力抽出パス（未指定時は出力全体） */
  extractPath?: string;
  /** 抽出結果を格納する変数名 */
  variableName: string;
}

/**
 * ステップ実行条件
 */
export interface SkillChainCondition {
  /** 条件種別 */
  type: SkillChainConditionType;
  /** expression 時の評価式（Mustache 変数参照可能） */
  expression?: string;
  /** ifVariable 時の変数名 */
  variable?: string;
  /** ifVariable 時の期待値 */
  expectedValue?: unknown;
}

/**
 * チェーン実行結果
 */
export interface SkillChainResult {
  /** 実行したチェーンの ID */
  chainId: string;
  /** チェーン全体の成否 */
  success: boolean;
  /** 各ステップの実行結果 */
  results: StepResult[];
  /** 最終的な変数状態 */
  finalVariables: Record<string, unknown>;
  /** 合計実行時間（ミリ秒） */
  totalDuration: number;
}

/**
 * 個別ステップの実行結果
 */
export interface StepResult {
  /** ステップ識別子 */
  stepId: string;
  /** 成否（skipped 時は undefined） */
  success?: boolean;
  /** 条件不一致でスキップされたか */
  skipped?: boolean;
  /** ステップ出力 */
  output?: unknown;
  /** エラーメッセージ */
  error?: string;
  /** 実行時間（ミリ秒） */
  duration?: number;
}
