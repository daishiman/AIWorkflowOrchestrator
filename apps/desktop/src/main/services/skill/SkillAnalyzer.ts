/**
 * SkillAnalyzer - スキル分析サービス
 * TASK-9C: スキル改善・自動修正機能
 *
 * スキルの静的分析とAI分析を実行し、改善提案を生成する
 */
import * as fs from "fs/promises";
import * as path from "path";
import log from "electron-log";
import type {
  ImportedSkill,
  SkillAnalysis,
  AnalysisCategory,
  Suggestion,
  Risk,
} from "@repo/shared";

/**
 * SDK応答のAI分析結果型
 */
interface AIAnalysisResult {
  categories: AnalysisCategory[];
  suggestions: Suggestion[];
  risks: Risk[];
}

/**
 * スキル分析サービス
 */
export class SkillAnalyzer {
  private skillsDir: string;
  private queryFn: (prompt: string) => Promise<{ content: string }>;

  /**
   * @param skillsDir スキルディレクトリのベースパス
   * @param queryFn Claude Agent SDKのquery関数（DI用）
   */
  constructor(
    skillsDir: string,
    queryFn?: (prompt: string) => Promise<{ content: string }>,
  ) {
    this.skillsDir = skillsDir;
    // デフォルトのquery関数（テスト時にモック可能）
    this.queryFn = queryFn ?? this.defaultQuery;
  }

  /**
   * デフォルトのquery関数
   */
  private async defaultQuery(prompt: string): Promise<{ content: string }> {
    // 実際の実装ではClaude Agent SDKを使用
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { query } = require("@anthropic-ai/claude-agent-sdk");
    return query(prompt);
  }

  /**
   * スキルを分析する
   * @param skill 分析対象のスキル
   * @returns 分析結果
   */
  async analyze(skill: ImportedSkill): Promise<SkillAnalysis> {
    // バリデーション
    this.validateSkill(skill);

    // スキルディレクトリの存在確認
    const skillPath = path.dirname(skill.path);
    await this.verifySkillDirectory(skillPath);

    // SKILL.mdの存在確認と読み込み
    const skillMdPath = skill.path;
    const skillMdContent = await this.readSkillMd(skillMdPath);

    // 静的分析を実行
    const staticAnalysis = await this.performStaticAnalysis(
      skill,
      skillMdContent,
    );

    // AI分析を実行
    const aiAnalysis = await this.performAIAnalysis(skill, skillMdContent);

    // 結果をマージ
    return this.mergeAnalysisResults(skill.name, staticAnalysis, aiAnalysis);
  }

  /**
   * スキルのバリデーション
   */
  private validateSkill(skill: ImportedSkill): void {
    if (!skill.name || skill.name.trim() === "") {
      throw new Error("スキル名が空です");
    }

    // 特殊文字チェック
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(skill.name)) {
      throw new Error("スキル名に無効な文字が含まれています");
    }
  }

  /**
   * スキルディレクトリの存在確認
   */
  private async verifySkillDirectory(skillPath: string): Promise<void> {
    try {
      const stat = await fs.stat(skillPath);
      if (!stat.isDirectory()) {
        throw new Error(`スキルパスがディレクトリではありません: ${skillPath}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`スキルディレクトリが存在しません: ${skillPath}`);
      }
      throw error;
    }
  }

  /**
   * SKILL.mdを読み込む
   */
  private async readSkillMd(skillMdPath: string): Promise<string> {
    try {
      return await fs.readFile(skillMdPath, "utf-8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`SKILL.mdが見つかりません: ${skillMdPath}`);
      }
      throw error;
    }
  }

  /**
   * 静的分析を実行
   */
  private async performStaticAnalysis(
    skill: ImportedSkill,
    content: string,
  ): Promise<Partial<AIAnalysisResult>> {
    const suggestions: Suggestion[] = [];
    const issues: string[] = [];

    // Frontmatterチェック
    if (!content.startsWith("---")) {
      suggestions.push({
        type: "structure",
        priority: "high",
        description: "SKILL.mdにFrontmatterがありません",
        autoFixable: true,
      });
      issues.push("Frontmatterが存在しない");
    }

    // 必須セクションチェック
    const requiredSections = ["# ", "## 概要", "## 使い方"];
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        suggestions.push({
          type: "documentation",
          priority: "medium",
          description: `推奨セクション「${section}」がありません`,
          autoFixable: false,
        });
      }
    }

    // 空のスキルディレクトリチェック
    const skillDir = path.dirname(skill.path);
    const files = await fs.readdir(skillDir);
    if (files.length <= 1) {
      // SKILL.mdのみ
      suggestions.push({
        type: "structure",
        priority: "low",
        description: "スキルディレクトリにSKILL.md以外のファイルがありません",
        autoFixable: false,
      });
    }

    return {
      categories: [
        {
          name: "structure",
          score:
            suggestions.length === 0
              ? 100
              : Math.max(0, 100 - suggestions.length * 15),
          details:
            suggestions.length === 0
              ? "構造は適切です"
              : "構造に改善の余地があります",
          issues,
        },
      ],
      suggestions,
      risks: [],
    };
  }

  /**
   * AI分析を実行
   */
  private async performAIAnalysis(
    skill: ImportedSkill,
    content: string,
  ): Promise<AIAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(skill, content);

    try {
      const response = await this.queryFn(prompt);
      return this.parseAIResponse(response.content);
    } catch (error) {
      // SDK障害時はデフォルト結果を返す
      log.error("[SkillAnalyzer] AI分析中にエラーが発生しました:", error);
      return {
        categories: [],
        suggestions: [],
        risks: [],
      };
    }
  }

  /**
   * AI分析用プロンプトを構築
   */
  private buildAnalysisPrompt(skill: ImportedSkill, content: string): string {
    return `以下のスキル定義を分析し、改善提案を生成してください。

スキル名: ${skill.name}
説明: ${skill.description}

SKILL.md内容:
\`\`\`markdown
${content}
\`\`\`

以下のJSON形式で回答してください：
{
  "categories": [
    {
      "name": "prompt",
      "score": 0-100,
      "details": "分析の詳細",
      "issues": ["問題点1", "問題点2"]
    }
  ],
  "suggestions": [
    {
      "type": "prompt|structure|documentation|security|performance",
      "priority": "high|medium|low",
      "description": "改善提案の説明",
      "autoFixable": true/false
    }
  ],
  "risks": [
    {
      "category": "security|compatibility|performance|maintenance",
      "level": "critical|high|medium|low",
      "description": "リスクの説明",
      "impact": "影響範囲",
      "mitigation": "緩和策"
    }
  ]
}`;
  }

  /**
   * AI応答をパース
   */
  private parseAIResponse(content: string): AIAnalysisResult {
    try {
      // JSON部分を抽出（マークダウンコードブロック対応）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("JSONが見つかりません");
      }

      const parsed = JSON.parse(jsonMatch[0]) as AIAnalysisResult;

      // バリデーション
      if (!Array.isArray(parsed.categories)) {
        parsed.categories = [];
      }
      if (!Array.isArray(parsed.suggestions)) {
        parsed.suggestions = [];
      }
      if (!Array.isArray(parsed.risks)) {
        parsed.risks = [];
      }

      return parsed;
    } catch (error) {
      throw new Error(
        `AI応答のパースに失敗しました: ${(error as Error).message}`,
      );
    }
  }

  /**
   * 分析結果をマージ
   */
  private mergeAnalysisResults(
    skillName: string,
    staticAnalysis: Partial<AIAnalysisResult>,
    aiAnalysis: AIAnalysisResult,
  ): SkillAnalysis {
    const allCategories = [
      ...(staticAnalysis.categories ?? []),
      ...aiAnalysis.categories,
    ];

    const allSuggestions = [
      ...(staticAnalysis.suggestions ?? []),
      ...aiAnalysis.suggestions,
    ];

    const allRisks = [...(staticAnalysis.risks ?? []), ...aiAnalysis.risks];

    // 総合スコアを計算
    const overallScore =
      allCategories.length > 0
        ? Math.round(
            allCategories.reduce((sum, cat) => sum + cat.score, 0) /
              allCategories.length,
          )
        : 50;

    return {
      skillName,
      overallScore,
      categories: allCategories,
      suggestions: allSuggestions,
      risks: allRisks,
      analyzedAt: new Date(),
    };
  }
}
