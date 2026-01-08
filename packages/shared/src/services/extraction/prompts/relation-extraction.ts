/**
 * 関係抽出用プロンプトビルダー
 * @description LLMへの関係抽出プロンプト生成 (CONV-06-05)
 */

import type { ExtractedEntity, RelationType } from "../types";
import { RelationTypes } from "../types";

/**
 * 全関係タイプの配列
 */
const ALL_RELATION_TYPES = Object.values(RelationTypes);

/**
 * 関係タイプの説明マッピング
 */
export const RELATION_TYPE_DESCRIPTIONS: Record<RelationType, string> = {
  belongs_to:
    "A belongs to or is a member of B (e.g., employee belongs_to company)",
  related_to: "A is generally related to B (bidirectional)",
  causes: "A causes or leads to B (e.g., bug causes crash)",
  depends_on: "A depends on or requires B (e.g., app depends_on library)",
  created_by: "A was created by B (e.g., TypeScript created_by Microsoft)",
  uses: "A uses or utilizes B (e.g., project uses React)",
  part_of: "A is a part or component of B (e.g., module part_of package)",
  located_in: "A is located in B (e.g., team located_in Tokyo)",
  succeeds: "A succeeds or comes after B (e.g., v2 succeeds v1)",
  precedes: "A precedes or comes before B (e.g., v1 precedes v2)",
  competes_with:
    "A competes with B (bidirectional, e.g., React competes_with Vue)",
  collaborates_with:
    "A collaborates with B (bidirectional, e.g., teamA collaborates_with teamB)",
  implements: "A implements B (e.g., class implements interface)",
  extends: "A extends or inherits from B (e.g., TypeScript extends JavaScript)",
  other: "Other relationship that doesn't fit above categories",
};

/**
 * 関係抽出プロンプトオプション
 */
interface RelationExtractionPromptOptions {
  types?: RelationType[];
  extractEvidence?: boolean;
}

/**
 * 関係抽出プロンプトを生成
 */
export function buildRelationExtractionPrompt(
  text: string,
  entities: ExtractedEntity[],
  options?: RelationExtractionPromptOptions,
): string {
  const typeList = options?.types ?? ALL_RELATION_TYPES;
  const extractEvidence = options?.extractEvidence ?? true;

  // エンティティリストを生成
  const entityListStr = entities
    .map((e) => `- ${e.name} (${e.type})`)
    .join("\n");

  // 関係タイプの説明を生成
  const typeDescriptions = typeList
    .map((t) => `- ${t}: ${RELATION_TYPE_DESCRIPTIONS[t]}`)
    .join("\n");

  return `You are a relation extraction expert. Extract relationships between the given entities from the following text.

## Instructions
1. Analyze the text to identify relationships between the provided entities
2. Classify each relationship into one of the allowed relation types
3. Assign a confidence score (0.0 to 1.0) based on how certain you are
4. Mark bidirectional relationships when the relationship is symmetric
5. ${extractEvidence ? "Extract the text evidence that supports each relationship" : "Do not include evidence"}
6. Only extract relationships between the entities listed below
7. Do NOT extract self-referential relationships (entity related to itself)

## Entities to Consider
${entityListStr}

## Allowed Relation Types
${typeDescriptions}

## Bidirectional Relations
The following relation types are typically bidirectional:
- related_to: General associations are bidirectional
- competes_with: Competition is mutual
- collaborates_with: Collaboration is mutual

## Output Format
Respond with a valid JSON object in the following format:
\`\`\`json
{
  "relations": [
    {
      "sourceEntity": "Entity A Name",
      "targetEntity": "Entity B Name",
      "relationType": "relation_type",
      "description": "Brief description of the relationship",
      "confidence": 0.9,
      "bidirectional": false${
        extractEvidence
          ? `,
      "evidence": {
        "text": "The exact text from the source that indicates this relationship",
        "startPosition": 0,
        "endPosition": 50
      }`
          : ""
      }
    }
  ]
}
\`\`\`

## Examples
- If the text says "TypeScript was developed by Microsoft", extract:
  - sourceEntity: "TypeScript", targetEntity: "Microsoft", relationType: "created_by"

- If the text says "React and Vue are competing frameworks", extract:
  - sourceEntity: "React", targetEntity: "Vue", relationType: "competes_with", bidirectional: true

- If the text says "The app uses Express for the backend", extract:
  - sourceEntity: "app", targetEntity: "Express", relationType: "uses"

## Text to Analyze
${text}

## Response (JSON only)`;
}

/**
 * 関係抽出用システムプロンプト
 */
export const RELATION_SYSTEM_PROMPT = `You are a precise relation extraction (RE) system.
Your task is to identify and classify relationships between named entities in text.
Always respond with valid JSON. Do not include any explanations outside the JSON.
Only extract relationships that are explicitly stated or strongly implied in the text.
Do not invent relationships that cannot be supported by the text.`;
