/**
 * ResourceLoader - リソース遅延読み込み基盤
 * TASK-9B-G: skill-creator-service
 *
 * Progressive Disclosure原則に基づき、リソースを遅延読み込みする
 */

import fs from "fs/promises";
import path from "path";

export type ResourceCategory = "agents" | "references" | "assets" | "schemas";

export class ResourceLoader {
  private readonly basePath: string;
  private cache: Map<string, string> = new Map();

  constructor(skillCreatorPath: string) {
    this.basePath = skillCreatorPath;
  }

  /**
   * リソースを読み込む（キャッシュ優先）
   *
   * @param category - リソースカテゴリ（agents, references, assets, schemas）
   * @param name - リソース名（ファイル名）
   * @returns リソース内容（文字列）
   */
  async load(category: ResourceCategory, name: string): Promise<string> {
    const key = `${category}/${name}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const resourcePath = path.join(this.basePath, category, name);
    const content = await fs.readFile(resourcePath, "utf-8");
    this.cache.set(key, content);
    return content;
  }

  /**
   * エージェントプロンプトを読み込む
   *
   * @param agentName - エージェント名（拡張子なし）
   * @returns エージェントプロンプト内容
   */
  async loadAgent(agentName: string): Promise<string> {
    return this.load("agents", `${agentName}.md`);
  }

  /**
   * JSONスキーマを読み込んでパース
   *
   * @param schemaName - スキーマ名（拡張子なし）
   * @returns パースされたスキーマオブジェクト
   */
  async loadSchema(schemaName: string): Promise<object> {
    const content = await this.load("schemas", `${schemaName}.json`);
    return JSON.parse(content);
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear();
  }
}
