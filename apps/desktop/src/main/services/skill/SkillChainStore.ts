/**
 * SkillChainStore - チェーン定義の永続化
 * TASK-9D: JSON ファイルベースのチェーン定義ストレージ
 */
import * as fs from "fs";
import * as path from "path";
import log from "electron-log";
import type { SkillChainDefinition } from "@repo/shared";

export class SkillChainStore {
  private readonly storagePath: string;

  constructor(storagePath: string) {
    this.storagePath = storagePath;
    this.ensureStorageDirectory();
  }

  /**
   * チェーン定義を保存する（新規作成 or 更新）
   * updatedAt を現在時刻の ISO 8601 文字列で更新
   */
  async save(definition: SkillChainDefinition): Promise<SkillChainDefinition> {
    const chains = await this.readStorage();
    const now = new Date().toISOString();
    const existingIndex = chains.findIndex((c) => c.id === definition.id);

    const updated: SkillChainDefinition = {
      ...definition,
      updatedAt: now,
      createdAt:
        existingIndex >= 0
          ? chains[existingIndex].createdAt
          : definition.createdAt || now,
    };

    if (existingIndex >= 0) {
      chains[existingIndex] = updated;
    } else {
      chains.push(updated);
    }

    await this.writeStorage(chains);
    return updated;
  }

  /**
   * chainId 指定でチェーン定義を取得する
   * @returns 見つからない場合は null
   */
  async get(chainId: string): Promise<SkillChainDefinition | null> {
    const chains = await this.readStorage();
    return chains.find((c) => c.id === chainId) ?? null;
  }

  /**
   * 保存済み全チェーン定義を取得する
   */
  async list(): Promise<SkillChainDefinition[]> {
    return this.readStorage();
  }

  /**
   * chainId 指定でチェーン定義を削除する
   */
  async delete(chainId: string): Promise<boolean> {
    const chains = await this.readStorage();
    const filtered = chains.filter((c) => c.id !== chainId);
    const wasDeleted = filtered.length < chains.length;
    await this.writeStorage(filtered);
    return wasDeleted;
  }

  private ensureStorageDirectory(): void {
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private async readStorage(): Promise<SkillChainDefinition[]> {
    try {
      if (!fs.existsSync(this.storagePath)) {
        return [];
      }
      const content = await fs.promises.readFile(this.storagePath, "utf-8");
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        log.warn("SkillChainStore: storage file corrupted, resetting");
        return [];
      }
      return parsed;
    } catch (error) {
      log.warn("SkillChainStore: failed to read storage, resetting", error);
      return [];
    }
  }

  private async writeStorage(chains: SkillChainDefinition[]): Promise<void> {
    await fs.promises.writeFile(
      this.storagePath,
      JSON.stringify(chains, null, 2),
      "utf-8",
    );
  }
}
