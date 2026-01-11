/**
 * @file コミュニティ要約プロンプト生成
 * @module @repo/shared/services/graph/prompts/community-summary-prompt
 * @description コミュニティ要約生成用のLLMプロンプトを構築する
 */

import type {
  StoredEntity,
  StoredRelation,
  CommunitySummary,
  CommunitySummarizationOptions,
} from "../types";

/**
 * スタイルガイドの定義
 */
const STYLE_GUIDES: Record<string, string> = {
  detailed: "詳細で包括的な要約を作成してください。",
  concise: "簡潔で要点を押さえた要約を作成してください。",
  technical: "技術的な観点から専門的な要約を作成してください。",
};

/**
 * プロンプトの制限値
 */
const LIMITS = {
  /** エンティティの最大数 */
  MAX_ENTITIES: 20,
  /** 関係の最大数 */
  MAX_RELATIONS: 30,
} as const;

/**
 * エンティティリストを構築する
 *
 * @param entities エンティティ配列
 * @returns フォーマットされたエンティティリスト文字列
 */
function buildEntityList(entities: readonly StoredEntity[]): string {
  if (entities.length === 0) {
    return "（エンティティなし）";
  }

  return [...entities]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, LIMITS.MAX_ENTITIES)
    .map((e) => `- ${e.name} (${e.type}): ${e.description ?? "説明なし"}`)
    .join("\n");
}

/**
 * 関係リストを構築する
 *
 * @param relations 関係配列
 * @param entities エンティティ配列（名前解決用）
 * @returns フォーマットされた関係リスト文字列
 */
function buildRelationList(
  relations: readonly StoredRelation[],
  entities: readonly StoredEntity[],
): string {
  if (relations.length === 0) {
    return "（関係なし）";
  }

  const entityMap = new Map(entities.map((e) => [e.id, e.name]));

  return [...relations]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, LIMITS.MAX_RELATIONS)
    .map((r) => {
      const source = entityMap.get(r.sourceEntityId) ?? "不明";
      const target = entityMap.get(r.targetEntityId) ?? "不明";
      return `- ${source} → ${r.relationType} → ${target}`;
    })
    .join("\n");
}

/**
 * 子コミュニティ要約セクションを構築する
 *
 * @param childSummaries 子コミュニティの要約配列
 * @returns フォーマットされた子コミュニティ要約セクション
 */
function buildChildSummarySection(
  childSummaries: readonly CommunitySummary[],
): string {
  if (childSummaries.length === 0) {
    return "";
  }

  const summaryList = childSummaries.map((s) => `- ${s.summary}`).join("\n");
  return `\n子コミュニティの要約:\n${summaryList}\n`;
}

/**
 * JSON出力形式の指定を構築する
 *
 * @param maxSummaryTokens 最大要約トークン数
 * @param maxKeywords 最大キーワード数
 * @returns JSON出力形式の指定文字列
 */
function buildJsonFormatInstruction(
  maxSummaryTokens: number,
  maxKeywords: number,
): string {
  return `{
  "summary": "グループの特徴を説明する要約文（${maxSummaryTokens}トークン以内）",
  "keywords": ["キーワード1", "キーワード2", ...（最大${maxKeywords}個）],
  "mainEntities": ["主要エンティティ1", "主要エンティティ2", ...（最大5個）],
  "mainRelations": ["主要関係1（AとBの関係）", ...（最大5個）],
  "sentiment": "positive/negative/neutral",
  "confidence": 0.0-1.0の信頼度
}`;
}

/**
 * 注意事項セクションを構築する
 *
 * @returns 注意事項文字列
 */
function buildNotesSection(): string {
  return `注意:
- 要約はグループ全体のテーマや特徴を表現
- キーワードは検索に使用されるため、具体的な用語を選択
- 主要エンティティ・関係はグループを代表するもの
- sentimentは内容の全体的な傾向`;
}

/**
 * コミュニティ要約生成用のLLMプロンプトを構築する
 *
 * @param entities - コミュニティ内のエンティティ（上位20件のみ使用）
 * @param relations - コミュニティ内の関係（上位30件のみ使用）
 * @param childSummaries - 子コミュニティの要約（useChildSummaries=true時）
 * @param options - 要約生成オプション
 * @returns LLMに送信するプロンプト文字列
 */
export function buildCommunitySummaryPrompt(
  entities: readonly StoredEntity[],
  relations: readonly StoredRelation[],
  childSummaries: readonly CommunitySummary[],
  options: CommunitySummarizationOptions,
): string {
  const style = options.summaryStyle ?? "concise";
  const maxSummaryTokens = options.maxSummaryTokens ?? 200;
  const maxKeywords = options.maxKeywords ?? 10;

  const styleGuide = STYLE_GUIDES[style] ?? STYLE_GUIDES.concise;
  const entityList = buildEntityList(entities);
  const relationList = buildRelationList(relations, entities);
  const childSummarySection = buildChildSummarySection(childSummaries);
  const jsonFormat = buildJsonFormatInstruction(maxSummaryTokens, maxKeywords);
  const notes = buildNotesSection();

  return `以下のエンティティと関係のグループについて要約を作成してください。

${styleGuide}

エンティティ一覧:
${entityList}

関係一覧:
${relationList}
${childSummarySection}
JSON形式で出力してください:
${jsonFormat}

${notes}`;
}
