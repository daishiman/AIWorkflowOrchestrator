/**
 * SkillDocGenerator - スキルドキュメント自動生成サービス (TASK-9I)
 *
 * LLM を使用してスキルの構造を解析し、ドキュメントを自動生成する。
 * Constructor Injection パターンで LLM query 関数を受け取り、テスト時にモック差し替えが可能。
 */
import * as path from "path";
import * as fs from "fs/promises";
import type {
  DocGenerationRequest,
  GeneratedDoc,
  DocSection,
  DocTemplate,
  TemplateSection,
} from "@repo/shared";
import type { SkillFileManager } from "./SkillFileManager";

/** LLM query 関数の型（DI用） */
export type LLMQueryFn = (prompt: string) => Promise<{ content: string }>;

/** デフォルトテンプレート（FR-09）— 7セクション構成 */
export const DEFAULT_DOC_TEMPLATE: DocTemplate = {
  id: "default",
  name: "Standard Documentation",
  description: "7セクション構成のスキルドキュメント標準テンプレート",
  sections: [
    {
      id: "overview",
      title: "概要",
      prompt:
        "このスキルの目的、主要機能、対象ユーザーを200文字以内で説明してください。SKILL.md の内容を要約してください。",
      required: true,
    },
    {
      id: "getting-started",
      title: "はじめに",
      prompt:
        "このスキルの基本的な使用手順をステップバイステップで説明してください。トリガーキーワードと典型的なワークフローを含めてください。",
      required: true,
    },
    {
      id: "configuration",
      title: "設定",
      prompt:
        "このスキルで利用可能な設定項目（Anchors、パラメータ、環境変数）を一覧テーブル形式で説明してください。設定項目がない場合は「設定項目なし」と記載してください。",
      required: false,
    },
    {
      id: "api",
      title: "API リファレンス",
      prompt:
        "このスキルが公開するインターフェース（入力/出力フォーマット、コマンド、IPC チャネル）を技術的に説明してください。",
      required: false,
    },
    {
      id: "examples",
      title: "使用例",
      prompt:
        "このスキルの具体的な使用例を3件以上、入力と期待される出力のペアで記載してください。",
      required: false,
    },
    {
      id: "troubleshooting",
      title: "トラブルシューティング",
      prompt:
        "このスキルで発生しうる一般的なエラーと解決策を3件以上挙げてください。エラーメッセージ、原因、解決手順の3列テーブル形式で記載してください。",
      required: false,
    },
    {
      id: "changelog",
      title: "変更履歴",
      prompt:
        "SKILL.md の変更履歴セクションから主要な変更を日付・バージョン・内容のテーブル形式で抽出してください。変更履歴がない場合は「変更履歴なし」と記載してください。",
      required: false,
    },
  ],
};

const VALID_OUTPUT_FORMATS = ["markdown", "html"] as const;
const LLM_TIMEOUT_MS = 30_000;

export class SkillDocGenerator {
  private readonly queryFn: LLMQueryFn;
  private readonly skillFileManager: SkillFileManager;

  constructor(queryFn: LLMQueryFn, skillFileManager: SkillFileManager) {
    this.queryFn = queryFn;
    this.skillFileManager = skillFileManager;
  }

  async generate(request: DocGenerationRequest): Promise<GeneratedDoc> {
    // outputFormat バリデーション
    if (
      !VALID_OUTPUT_FORMATS.includes(
        request.outputFormat as (typeof VALID_OUTPUT_FORMATS)[number],
      )
    ) {
      throw new Error(
        `outputFormat must be one of: ${VALID_OUTPUT_FORMATS.join(", ")}`,
      );
    }

    // スキル存在確認
    const skillStructure = await this.analyzeSkillStructure(request.skillName);

    // テンプレートセクション決定
    const template = DEFAULT_DOC_TEMPLATE;
    const sectionsToGenerate: TemplateSection[] = [];

    for (const section of template.sections) {
      // examples セクション
      if (section.id === "examples" && !request.includeExamples) {
        continue;
      }
      // api セクション
      if (section.id === "api" && !request.includeApiReference) {
        continue;
      }
      sectionsToGenerate.push(section);
    }

    // カスタムセクション追加 (FR-06)
    if (request.customSections) {
      for (const customName of request.customSections) {
        sectionsToGenerate.push({
          id: customName.toLowerCase().replace(/\s+/g, "-"),
          title: customName,
          prompt: `「${customName}」セクションの内容を生成してください。スキルの構造情報を参考にしてください。`,
          required: false,
        });
      }
    }

    // セクション逐次生成
    const sections: DocSection[] = [];
    for (let i = 0; i < sectionsToGenerate.length; i++) {
      const section = await this.generateSection(
        skillStructure,
        sectionsToGenerate[i],
        request.language,
      );
      sections.push({ ...section, order: i });
    }

    // コンテンツ構築
    let content = sections
      .map((s) => `## ${s.title}\n\n${s.content}`)
      .join("\n\n");

    // HTML 変換
    if (request.outputFormat === "html") {
      content = this.convertToHtml(content);
    }

    // wordCount 算出
    const wordCount = sections.reduce((sum, s) => sum + s.content.length, 0);

    return {
      skillName: request.skillName,
      format: request.outputFormat,
      content,
      sections,
      generatedAt: new Date().toISOString(),
      wordCount,
    };
  }

  async preview(
    skillName: string,
    template?: DocTemplate,
  ): Promise<GeneratedDoc> {
    const effectiveTemplate = template ?? DEFAULT_DOC_TEMPLATE;

    // スキル存在確認
    const skillStructure = await this.analyzeSkillStructure(skillName);

    // テンプレートのセクションに従って生成
    const sections: DocSection[] = [];
    for (let i = 0; i < effectiveTemplate.sections.length; i++) {
      const section = await this.generateSection(
        skillStructure,
        effectiveTemplate.sections[i],
        "ja",
      );
      sections.push({ ...section, order: i });
    }

    const content = sections
      .map((s) => `## ${s.title}\n\n${s.content}`)
      .join("\n\n");

    const wordCount = sections.reduce((sum, s) => sum + s.content.length, 0);

    return {
      skillName,
      format: "markdown",
      content,
      sections,
      generatedAt: new Date().toISOString(),
      wordCount,
    };
  }

  async exportToFile(doc: GeneratedDoc, outputPath: string): Promise<void> {
    this.validateOutputPath(outputPath);
    await fs.writeFile(outputPath, doc.content, "utf-8");
  }

  private async analyzeSkillStructure(skillName: string): Promise<string> {
    try {
      const skillMd = await this.skillFileManager.readFile(
        skillName,
        "SKILL.md",
      );
      let fileList: string[] = [];
      try {
        fileList = await this.skillFileManager.listSkillFiles(skillName);
      } catch {
        // listSkillFiles が存在しない場合はファイル一覧なしで続行
      }
      return `# Skill: ${skillName}\n\n## SKILL.md\n\n${skillMd}\n\n## Files\n\n${fileList.join("\n")}`;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("not found") ||
          error.message.includes("ENOENT") ||
          error.name === "SkillNotFoundError")
      ) {
        throw new Error(`Skill not found: ${skillName}`);
      }
      throw error;
    }
  }

  private async generateSection(
    skillStructure: string,
    sectionConfig: TemplateSection,
    language: "ja" | "en",
  ): Promise<DocSection> {
    const langInstruction =
      language === "ja"
        ? "日本語で回答してください。"
        : "Please respond in English.";

    const prompt = `${langInstruction}\n\nスキル情報:\n${skillStructure}\n\n指示: ${sectionConfig.prompt}`;

    // LLM query with timeout
    const result = await Promise.race([
      this.queryFn(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("LLM query timeout")),
          LLM_TIMEOUT_MS,
        ),
      ),
    ]);

    return {
      id: sectionConfig.id,
      title: sectionConfig.title,
      content: result.content,
      order: 0, // will be overwritten by caller
    };
  }

  private convertToHtml(markdownContent: string): string {
    // Simple markdown to HTML conversion
    const htmlBody = markdownContent
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>");

    return `<html><head><meta charset="utf-8"></head><body>${htmlBody}</body></html>`;
  }

  private validateOutputPath(outputPath: string): void {
    const resolved = path.resolve(outputPath);
    if (resolved.includes("..") || outputPath.includes("..")) {
      throw new Error("Invalid output path: path traversal detected");
    }
  }
}
