/**
 * Skill Scanner - Skill Discovery and Parsing
 * Phase 5: TDD Green - Implementation
 *
 * @see docs/30-workflows/claude-code-cli-integration/outputs/phase-2/architecture-design.md
 */

import { readdir, readFile, stat, access } from "fs/promises";
import { join, resolve, normalize, relative } from "path";
import grayMatter from "gray-matter";
import type {
  ClaudeCliSkillMetadata,
  ScanResult,
  ClaudeCliSkillDetail,
  FilterCriteria,
  ScanError,
  ScriptInfo,
} from "@repo/shared";

export interface SkillScannerConfig {
  basePath: string;
  maxDepth?: number;
  includeDisabled?: boolean;
}

export interface ScanOptions {
  forceRefresh?: boolean;
}

export interface GetSkillDetailOptions {
  includeScripts?: boolean;
  includeReferences?: boolean;
}

/**
 * Skill name validation pattern (kebab-case)
 */
const SKILL_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Maximum skill name length
 */
const MAX_SKILL_NAME_LENGTH = 64;

/**
 * Scans and filters skills from the skills directory
 */
export class SkillScanner {
  private config: SkillScannerConfig;
  private cache: ScanResult | null = null;

  constructor(config: SkillScannerConfig) {
    this.config = config;
  }

  /**
   * Scan all skills in the base directory
   */
  async scan(options?: ScanOptions): Promise<ScanResult> {
    // Return cached result if available and not forcing refresh
    if (this.cache && !options?.forceRefresh) {
      return this.cache;
    }

    const skills: ClaudeCliSkillMetadata[] = [];
    const errors: ScanError[] = [];
    const scannedAt = Date.now();

    try {
      // Check if base path exists
      await access(this.config.basePath);

      // Read skill directories
      const entries = await readdir(this.config.basePath, {
        withFileTypes: true,
      });

      // Process each skill directory
      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const skillName = entry.name;
        const skillPath = join(this.config.basePath, skillName);

        try {
          const skillMetadata = await this.parseSkillDirectory(
            skillName,
            skillPath,
          );
          if (skillMetadata) {
            skills.push(skillMetadata);
          } else {
            errors.push({
              path: skillPath,
              error: "SKILL.md not found or invalid",
            });
          }
        } catch (error) {
          errors.push({
            path: skillPath,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } catch (error) {
      // Base directory doesn't exist or can't be accessed
      errors.push({
        path: this.config.basePath,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Cache the result
    this.cache = {
      skills,
      errors,
      scannedAt,
    };

    return this.cache;
  }

  /**
   * Filter skills based on criteria
   */
  filter(criteria: FilterCriteria): ClaudeCliSkillMetadata[] {
    if (!this.cache) {
      throw new Error("Scan must be performed before filtering");
    }

    let filtered = [...this.cache.skills];

    // Filter by name
    if (criteria.name) {
      const nameLower = criteria.name.toLowerCase();
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(nameLower),
      );
    }

    // Filter by tags
    if (criteria.tags && criteria.tags.length > 0) {
      filtered = filtered.filter((s) =>
        criteria.tags!.some((tag) => s.tags.includes(tag)),
      );
    }

    // Filter by keyword (searches description and content)
    if (criteria.keyword) {
      const keywordLower = criteria.keyword.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.description.toLowerCase().includes(keywordLower) ||
          s.name.toLowerCase().includes(keywordLower),
      );
    }

    return filtered;
  }

  /**
   * Get detailed skill information
   */
  async getSkillDetail(
    skillName: string,
    options?: GetSkillDetailOptions,
  ): Promise<ClaudeCliSkillDetail | null> {
    if (!this.cache) {
      throw new Error("Scan must be performed before getting skill detail");
    }

    const skillMetadata = this.cache.skills.find((s) => s.name === skillName);
    if (!skillMetadata) {
      return null;
    }

    const skillPath = join(this.config.basePath, skillName);
    const skillMdPath = join(skillPath, "SKILL.md");

    try {
      const skillMdContent = await readFile(skillMdPath, "utf-8");
      const { content } = grayMatter(skillMdContent);

      const detail: ClaudeCliSkillDetail = {
        ...skillMetadata,
        content,
      };

      // Include scripts if requested
      if (options?.includeScripts && skillMetadata.hasScripts) {
        detail.scripts = await this.getScripts(skillPath);
      }

      // Include references if requested
      if (options?.includeReferences) {
        detail.references = await this.getReferences(skillPath);
      }

      return detail;
    } catch {
      return null;
    }
  }

  /**
   * Resolve skill path from name
   */
  resolveSkillPath(skillName: string): string {
    // Validate skill name for security
    if (!SkillScanner.validateSkillName(skillName)) {
      throw new Error(`Invalid skill name: ${skillName}`);
    }

    // Check if skill exists in cache
    if (this.cache) {
      const skill = this.cache.skills.find((s) => s.name === skillName);
      if (!skill) {
        throw new Error(`Skill not found: ${skillName}`);
      }
    }

    // Construct path
    const skillPath = join(this.config.basePath, skillName);

    // Verify the path is within base directory (prevent traversal)
    const normalizedPath = normalize(resolve(skillPath));
    const normalizedBase = normalize(resolve(this.config.basePath));

    if (!normalizedPath.startsWith(normalizedBase)) {
      throw new Error("Path traversal detected");
    }

    // Return relative path from base
    const relPath = relative(this.config.basePath, normalizedPath);
    if (relPath.startsWith("..")) {
      throw new Error("Path traversal detected");
    }

    return skillPath;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache = null;
  }

  /**
   * Validate a skill name
   */
  static validateSkillName(name: string): boolean {
    // Check for empty name
    if (!name || name.length === 0) {
      return false;
    }

    // Check for max length
    if (name.length > MAX_SKILL_NAME_LENGTH) {
      return false;
    }

    // Check for path traversal
    if (name.includes("..") || name.includes("/") || name.includes("\\")) {
      return false;
    }

    // Check pattern (kebab-case)
    return SKILL_NAME_PATTERN.test(name);
  }

  /**
   * Parse a skill directory
   */
  private async parseSkillDirectory(
    skillName: string,
    skillPath: string,
  ): Promise<ClaudeCliSkillMetadata | null> {
    const skillMdPath = join(skillPath, "SKILL.md");

    // Check if SKILL.md exists
    try {
      const skillStat = await stat(skillMdPath);
      if (!skillStat.isFile()) {
        return null;
      }
    } catch {
      return null;
    }

    // Read and parse SKILL.md
    const skillMdContent = await readFile(skillMdPath, "utf-8");
    const { data: frontmatter } = grayMatter(skillMdContent);

    // Check if scripts directory exists
    const hasScripts = await this.hasScriptsDirectory(skillPath);

    // Check if references exist
    const hasReferences = await this.hasReferencesDirectory(skillPath);

    return {
      name: skillName,
      path: skillPath,
      description: (frontmatter.description as string) || "",
      tags: (frontmatter.tags as string[]) || [],
      triggers: (frontmatter.triggers as string[]) || [],
      dependencies: (frontmatter.dependencies as string[]) || [],
      allowedTools: (frontmatter["allowed-tools"] as string[]) || [],
      hasScripts,
      hasReferences,
    };
  }

  /**
   * Check if scripts directory exists
   */
  private async hasScriptsDirectory(skillPath: string): Promise<boolean> {
    const scriptsPath = join(skillPath, "scripts");
    try {
      const scriptsStat = await stat(scriptsPath);
      return scriptsStat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Check if references directory exists
   */
  private async hasReferencesDirectory(skillPath: string): Promise<boolean> {
    const referencesPath = join(skillPath, "references");
    try {
      const referencesStat = await stat(referencesPath);
      return referencesStat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Get scripts from skill directory
   */
  private async getScripts(skillPath: string): Promise<ScriptInfo[]> {
    const scriptsPath = join(skillPath, "scripts");
    const scripts: ScriptInfo[] = [];

    try {
      const entries = await readdir(scriptsPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isFile()) continue;

        const scriptType = this.getScriptType(entry.name);
        if (scriptType) {
          scripts.push({
            name: entry.name,
            path: join(scriptsPath, entry.name),
            type: scriptType,
          });
        }
      }
    } catch {
      // Scripts directory doesn't exist
    }

    return scripts;
  }

  /**
   * Get references from skill directory
   */
  private async getReferences(skillPath: string): Promise<string[]> {
    const referencesPath = join(skillPath, "references");
    const references: string[] = [];

    try {
      const entries = await readdir(referencesPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile()) {
          references.push(join(referencesPath, entry.name));
        }
      }
    } catch {
      // References directory doesn't exist
    }

    return references;
  }

  /**
   * Determine script type from filename
   */
  private getScriptType(filename: string): "node" | "shell" | "python" | null {
    const lower = filename.toLowerCase();
    if (
      lower.endsWith(".mjs") ||
      lower.endsWith(".js") ||
      lower.endsWith(".ts")
    ) {
      return "node";
    }
    if (lower.endsWith(".sh")) {
      return "shell";
    }
    if (lower.endsWith(".py")) {
      return "python";
    }
    return null;
  }
}
