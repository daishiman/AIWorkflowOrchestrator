/**
 * @file LLMプロバイダー関連のZodスキーマ
 * @description プロバイダーID、モデル、設定のバリデーションスキーマ
 * @feature chat-multi-llm-switching
 */

import { z } from "zod";

/**
 * LLMプロバイダーID
 * 対応プロバイダー: OpenAI, Anthropic, Google, xAI
 */
export const LLMProviderIdSchema = z.enum([
  "openai",
  "anthropic",
  "google",
  "xai",
]);

export type LLMProviderId = z.infer<typeof LLMProviderIdSchema>;

/**
 * LLMモデル
 * 各プロバイダーが提供するモデルの定義
 */
export const LLMModelSchema = z.object({
  /** モデルID（例: gpt-4o, claude-3-opus） */
  id: z.string().min(1),

  /** 表示名 */
  name: z.string().min(1),

  /** 説明文 */
  description: z.string().optional(),

  /** コンテキストウィンドウサイズ（トークン数） */
  contextWindow: z.number().int().positive().optional(),

  /** デフォルトモデルフラグ */
  isDefault: z.boolean().default(false),
});

export type LLMModel = z.infer<typeof LLMModelSchema>;

/**
 * LLMプロバイダー
 * プロバイダーの基本情報と利用可能なモデル一覧
 */
export const LLMProviderSchema = z.object({
  /** プロバイダーID */
  id: LLMProviderIdSchema,

  /** 表示名 */
  name: z.string().min(1),

  /** アイコンURL */
  icon: z.string().url().optional(),

  /** APIキー設定済み（利用可能）フラグ */
  isAvailable: z.boolean(),

  /** 利用可能モデル一覧（最低1つ必要） */
  models: z.array(LLMModelSchema).min(1),
});

export type LLMProvider = z.infer<typeof LLMProviderSchema>;

/**
 * LLM設定
 * API接続に必要な設定情報
 */
export const LLMConfigSchema = z.object({
  /** APIキー */
  apiKey: z.string().min(1),

  /** カスタムエンドポイント（オプション） */
  baseUrl: z.string().url().optional(),

  /** タイムアウト（ミリ秒）- デフォルト30秒 */
  timeout: z.number().int().positive().default(30000),

  /** 最大リトライ回数（0-10）- デフォルト3回 */
  maxRetries: z.number().int().min(0).max(10).default(3),
});

export type LLMConfig = z.infer<typeof LLMConfigSchema>;
