/**
 * エンティティ抽出ユーティリティ関数
 * @description 共通処理の切り出し
 */

import type { Mention, EntityExtractionOptionsInput } from "./types";
import { DEFAULT_EXTRACTION_OPTIONS } from "./types";

/**
 * エンティティ名を正規化
 * @param name - 正規化前の名前
 * @returns 正規化後の名前
 */
export function normalizeEntityName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * 正規表現の特殊文字をエスケープ
 * @param str - エスケープ前の文字列
 * @returns エスケープ後の文字列
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * オプションをデフォルト値とマージ
 * @param options - ユーザー指定オプション
 * @returns マージ後のオプション
 */
export function mergeOptions(options?: EntityExtractionOptionsInput): Required<
  Omit<EntityExtractionOptionsInput, "types">
> & {
  types?: EntityExtractionOptionsInput["types"];
} {
  return {
    ...DEFAULT_EXTRACTION_OPTIONS,
    ...options,
  };
}

/**
 * テキスト内のエンティティ出現位置を検出
 * @param entityName - エンティティ名
 * @param content - 検索対象テキスト
 * @param chunkId - チャンクID
 * @returns メンション配列
 */
export function findMentionsInText(
  entityName: string,
  content: string,
  chunkId: string,
): Mention[] {
  // 空文字列や空白のみの場合は空配列を返す（無限ループ防止）
  if (!entityName || entityName.trim() === "") {
    return [];
  }

  const mentions: Mention[] = [];
  const escapedName = escapeRegex(entityName);
  const regex = new RegExp(escapedName, "gi");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const startPosition = match.index;
    const endPosition = startPosition + match[0].length;

    // コンテキスト抽出（前後100文字）
    const contextStart = Math.max(0, startPosition - 100);
    const contextEnd = Math.min(content.length, endPosition + 100);
    const context = content.slice(contextStart, contextEnd);

    mentions.push({
      chunkId,
      startPosition,
      endPosition,
      context: context.slice(0, 200), // 最大200文字
    });
  }

  return mentions;
}

/**
 * 重複エンティティを正規化名でマージ
 * @param entities - マージ前のエンティティ配列
 * @returns マージ後のエンティティ配列
 */
export function deduplicateEntities<
  T extends {
    normalizedName: string;
    confidence: number;
    aliases: string[];
    mentions: Mention[];
    description?: string;
  },
>(entities: T[]): T[] {
  const entityMap = new Map<string, T>();

  for (const entity of entities) {
    const existing = entityMap.get(entity.normalizedName);
    if (existing) {
      // マージ: 信頼度は最大値、エイリアスと言及は結合
      entityMap.set(entity.normalizedName, {
        ...existing,
        confidence: Math.max(existing.confidence, entity.confidence),
        aliases: [...new Set([...existing.aliases, ...entity.aliases])],
        mentions: [...existing.mentions, ...entity.mentions],
        description:
          (existing.description?.length ?? 0) >=
          (entity.description?.length ?? 0)
            ? existing.description
            : entity.description,
      });
    } else {
      entityMap.set(entity.normalizedName, entity);
    }
  }

  return Array.from(entityMap.values());
}
