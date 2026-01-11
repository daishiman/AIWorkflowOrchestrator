/**
 * SkillParser - SKILL.mdファイルを解析してSkillオブジェクトを生成する
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import * as yaml from "yaml";
import type { Skill, Anchor, EnvironmentConfig } from "@repo/shared";

interface SkillFrontmatter {
  name?: string;
  description?: string;
  license?: string;
  "allowed-tools"?: string[];
  tags?: string[];
  dependencies?: string[];
}

const DEFAULT_SKILL: Partial<Skill> = {
  name: "", // Will use slug as fallback
  description: "",
  triggers: [],
  anchors: [],
};

export class SkillParser {
  /**
   * SKILL.mdファイルを解析してSkillオブジェクトを返す
   */
  async parse(skillMdPath: string): Promise<Skill> {
    const content = await fs.readFile(skillMdPath, "utf-8");
    const stats = await fs.stat(skillMdPath);
    const slug = path.basename(path.dirname(skillMdPath));

    const frontmatter = this.parseFrontmatter(content);
    const description = frontmatter.description || DEFAULT_SKILL.description!;

    return {
      id: this.generateId(skillMdPath),
      name: frontmatter.name || slug, // Use directory name as fallback
      slug,
      description,
      path: skillMdPath,
      triggers: this.parseTriggers(description),
      anchors: this.parseAnchors(description),
      category: this.inferCategory(frontmatter.tags),
      environment: this.parseEnvironment(content),
      license: frontmatter.license,
      allowedTools: frontmatter["allowed-tools"],
      tags: frontmatter.tags,
      dependencies: frontmatter.dependencies,
      lastModified: stats.mtime,
    };
  }

  /**
   * YAML frontmatterを解析する
   */
  private parseFrontmatter(content: string): SkillFrontmatter {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    try {
      return yaml.parse(match[1]) || {};
    } catch {
      throw new Error("Invalid YAML frontmatter");
    }
  }

  /**
   * 説明文からAnchorsを解析する
   * Format: • {{source}} / 適用: {{application}} / 目的: {{purpose}}
   */
  parseAnchors(description: string): Anchor[] {
    const anchors: Anchor[] = [];
    const anchorsMatch = description.match(
      /Anchors:\n([\s\S]*?)(?=\n\n|Trigger:|$)/,
    );

    if (!anchorsMatch) return anchors;

    const lines = anchorsMatch[1].split("\n");
    for (const line of lines) {
      // Format: • {{source}} / 適用: {{application}} / 目的: {{purpose}}
      const match = line.match(
        /[•-]\s*(.+?)\s*\/\s*適用:\s*(.+?)\s*\/\s*目的:\s*(.+)/,
      );
      if (match) {
        anchors.push({
          source: match[1].trim(),
          application: match[2].trim(),
          purpose: match[3].trim(),
        });
      }
    }

    return anchors;
  }

  /**
   * 説明文からTriggersを解析する
   */
  parseTriggers(description: string): string[] {
    const triggerMatch = description.match(/Trigger:\n(.+?)(?:\n\n|$)/s);
    if (!triggerMatch) return [];

    return triggerMatch[1]
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  /**
   * 環境設定を解析する（将来拡張用）
   */
  private parseEnvironment(_content: string): EnvironmentConfig | undefined {
    // Environmentセクションの解析（将来拡張）
    return undefined;
  }

  /**
   * タグからカテゴリを推論する
   */
  private inferCategory(tags?: string[]): string | undefined {
    if (!tags || tags.length === 0) return undefined;
    return tags[0];
  }

  /**
   * ファイルパスからIDを生成する
   */
  private generateId(filePath: string): string {
    return crypto
      .createHash("sha256")
      .update(filePath)
      .digest("hex")
      .slice(0, 16);
  }
}
