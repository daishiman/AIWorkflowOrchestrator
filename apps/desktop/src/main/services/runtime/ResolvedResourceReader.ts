import fs from "fs/promises";
import { ResourceLoader } from "../skill/ResourceLoader";
import type { PlannedSkillCreatorResource } from "./PhaseResourcePlanner";

export class ResolvedResourceReader {
  private readonly legacyLoaderCache = new Map<string, ResourceLoader>();
  private readonly textCache = new Map<string, string>();

  constructor(private readonly defaultResourceLoader?: ResourceLoader) {}

  async readText(resource: PlannedSkillCreatorResource): Promise<string> {
    if (this.textCache.has(resource.absolutePath)) {
      return this.textCache.get(resource.absolutePath)!;
    }

    let content: string;
    try {
      content = await fs.readFile(resource.absolutePath, "utf-8");
    } catch (error) {
      if (!resource.legacyCategory || !resource.legacyName) {
        throw error;
      }
      // Legacy loader is a compatibility fallback only. The selected absolute
      // path remains the primary read target for provenance correctness.
      content = await this.getLoader(resource.selectedRoot).load(
        resource.legacyCategory,
        resource.legacyName,
      );
    }

    this.textCache.set(resource.absolutePath, content);
    return content;
  }

  clearCache(): void {
    this.textCache.clear();
  }

  private getLoader(rootPath: string): ResourceLoader {
    if (
      this.defaultResourceLoader &&
      this.defaultResourceLoader.getBasePath() === rootPath
    ) {
      return this.defaultResourceLoader;
    }
    const cached = this.legacyLoaderCache.get(rootPath);
    if (cached) {
      return cached;
    }
    const loader = new ResourceLoader(rootPath);
    this.legacyLoaderCache.set(rootPath, loader);
    return loader;
  }
}
