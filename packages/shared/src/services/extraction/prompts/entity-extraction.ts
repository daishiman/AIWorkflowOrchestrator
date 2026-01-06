/**
 * エンティティ抽出用プロンプトビルダー
 * @description LLMへのプロンプト生成
 */

import type { EntityExtractionOptionsInput, EntityType } from "../types";
import { EntityTypes } from "../../../types/rag/graph/types";

/**
 * 全エンティティタイプの配列
 */
const ALL_ENTITY_TYPES = Object.values(EntityTypes);

/**
 * エンティティ抽出プロンプトを生成
 */
export function buildEntityExtractionPrompt(
  text: string,
  options?: EntityExtractionOptionsInput,
): string {
  const typeList = options?.types ?? ALL_ENTITY_TYPES;
  const generateDescriptions = options?.generateDescriptions ?? true;

  return `You are an entity extraction expert. Extract named entities from the following text.

## Instructions
1. Identify all named entities in the text
2. Classify each entity into one of the allowed types
3. Assign a confidence score (0.0 to 1.0) based on how certain you are
4. ${generateDescriptions ? "Provide a brief description for each entity" : "Do not include descriptions"}
5. List any known aliases for each entity

## Allowed Entity Types
${typeList.map((t: string) => `- ${t}`).join("\n")}

## Output Format
Respond with a valid JSON object in the following format:
\`\`\`json
{
  "entities": [
    {
      "name": "Entity Name",
      "normalizedName": "entity name",
      "type": "entity_type",
      "confidence": 0.95,
      ${generateDescriptions ? '"description": "Brief description",' : ""}
      "aliases": ["alias1", "alias2"]
    }
  ]
}
\`\`\`

## Text to Analyze
${text}

## Response (JSON only)`;
}

/**
 * バリデーション用のシステムプロンプト
 */
export const SYSTEM_PROMPT = `You are a precise named entity recognition (NER) system.
Your task is to extract entities from text and classify them into predefined categories.
Always respond with valid JSON. Do not include any explanations outside the JSON.`;

/**
 * エンティティタイプの説明マッピング（52種類全対応）
 */
export const ENTITY_TYPE_DESCRIPTIONS: Partial<Record<EntityType, string>> = {
  // 1. 人物・組織カテゴリ
  person: "A named individual or character",
  organization: "A company, institution, or group",
  role: "A job title or responsibility",
  team: "A group of people working together",

  // 2. 場所・時間カテゴリ
  location: "A geographical place or address",
  date: "A specific date or time period",
  event: "A named event or occurrence",

  // 3. ビジネス・経営カテゴリ
  company: "A business entity",
  product: "A commercial product",
  service: "A provided service",
  brand: "A brand name or trademark",
  strategy: "A business or technical strategy",
  metric: "A measurement or KPI",
  business_process: "A business workflow or process",
  market: "A market or industry segment",
  customer: "A customer or client",

  // 4. 技術全般カテゴリ
  technology: "A technology or technical concept",
  tool: "A software tool or utility",
  method: "A technique or methodology",
  standard: "A technical standard or specification",
  protocol: "A communication or network protocol",

  // 5. コード・ソフトウェアカテゴリ
  programming_language: "A programming language",
  framework: "A software framework",
  library: "A software library or package",
  api: "An application programming interface",
  function: "A code function or method",
  class: "A class or type definition",
  module: "A software module or component",

  // 6. 抽象概念カテゴリ
  concept: "An abstract idea or principle",
  theory: "A theory or hypothesis",
  principle: "A fundamental principle",
  pattern: "A design or behavioral pattern",
  model: "A conceptual or data model",

  // 7. ドキュメント構造カテゴリ
  document: "A named document or publication",
  chapter: "A document chapter",
  section: "A document section",
  paragraph: "A paragraph of text",
  heading: "A heading or title",

  // 8. ドキュメント要素カテゴリ
  keyword: "A keyword or tag",
  summary: "A summary or abstract",
  figure: "A figure or illustration",
  table: "A data table",
  list: "A list or enumeration",
  quote: "A quotation or citation",
  code_snippet: "A code snippet or example",
  formula: "A mathematical formula",
  example: "An example or demonstration",

  // 9. メディアカテゴリ
  image: "An image or photograph",
  video: "A video content",
  audio: "An audio content",
  diagram: "A diagram or chart",

  // 10. その他
  other: "Other uncategorized entities",
};
