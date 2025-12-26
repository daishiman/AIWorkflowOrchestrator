/**
 * 数学ユーティリティ
 *
 * @description ベクトル計算などの数学関数を提供
 */

/**
 * コサイン類似度を計算
 *
 * @param vec1 - ベクトル1
 * @param vec2 - ベクトル2
 * @returns コサイン類似度 (0-1)
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length || vec1.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * コンテンツのハッシュを計算
 *
 * @param content - ハッシュ対象コンテンツ
 * @returns ハッシュ文字列
 */
export function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
