/**
 * SkillImprover - スキル改善サービス
 * TASK-9C: スキル改善・自動修正機能
 *
 * 分析結果に基づいてスキルの改善を実行する
 */
import * as fs from "fs/promises";
import * as path from "path";
import type {
  SkillAnalysis,
  Suggestion,
  SuggestionType,
  SuggestionPriority,
  ImprovementOptions,
  ImprovementResult,
  AppliedImprovement,
} from "@repo/shared";

/**
 * 優先度の重み付け
 */
const PRIORITY_ORDER: Record<SuggestionPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * 構造改善のSDK応答型
 */
interface StructureImprovementResult {
  create: Array<{ path: string; content: string }>;
  modify: Array<{ path: string; content: string }>;
  delete: string[];
}

/**
 * スキル改善サービス
 */
export class SkillImprover {
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
    this.queryFn = queryFn ?? this.defaultQuery;
  }

  /**
   * デフォルトのquery関数
   */
  private async defaultQuery(prompt: string): Promise<{ content: string }> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { query } = require("@anthropic-ai/claude-agent-sdk");
    return query(prompt);
  }

  /**
   * 改善を適用する
   */
  async applyImprovements(
    skillName: string,
    analysis: SkillAnalysis,
    options: ImprovementOptions = {},
  ): Promise<ImprovementResult> {
    const skillPath = path.join(this.skillsDir, skillName);

    // バックアップ作成（デフォルトで有効）
    let backupPath: string | undefined;
    if (options.createBackup !== false) {
      backupPath = await this.createBackup(skillPath, skillName);
    }

    // 適用対象の提案をフィルタリング
    const targetSuggestions = this.filterSuggestions(
      analysis.suggestions,
      options,
    );

    const applied: AppliedImprovement[] = [];
    const skipped: Suggestion[] = [];
    const errors: Array<{ suggestion: Suggestion; error: string }> = [];

    for (const suggestion of analysis.suggestions) {
      // フィルタリングで除外された場合はスキップ
      if (!targetSuggestions.includes(suggestion)) {
        skipped.push(suggestion);
        continue;
      }

      // autoFix=trueかつautoFixable=falseの場合もスキップ
      if (options.autoFix && !suggestion.autoFixable) {
        skipped.push(suggestion);
        continue;
      }

      // ドライランの場合は実際に適用しない
      if (options.dryRun) {
        applied.push({
          suggestion,
          result: "success",
          changes: ["[ドライラン] 変更は適用されません"],
        });
        continue;
      }

      try {
        const result = await this.applySingleImprovement(skillPath, suggestion);
        applied.push(result);
      } catch (error) {
        errors.push({
          suggestion,
          error: error instanceof Error ? error.message : "不明なエラー",
        });
      }
    }

    return {
      skillName,
      applied,
      skipped,
      errors,
      backupPath,
      executedAt: new Date(),
    };
  }

  /**
   * バックアップを作成
   */
  private async createBackup(
    skillPath: string,
    skillName: string,
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(
      this.skillsDir,
      ".backups",
      `${skillName}.backup.${timestamp}`,
    );

    await fs.mkdir(path.dirname(backupDir), { recursive: true });
    await fs.cp(skillPath, backupDir, { recursive: true });

    return backupDir;
  }

  /**
   * バックアップから復元
   */
  async restoreFromBackup(skillName: string): Promise<void> {
    const backupsDir = path.join(this.skillsDir, ".backups");
    const skillPath = path.join(this.skillsDir, skillName);

    try {
      const backups = await fs.readdir(backupsDir);
      const skillBackups = backups
        .filter((b) => b.startsWith(`${skillName}.backup.`))
        .sort()
        .reverse();

      if (skillBackups.length === 0) {
        throw new Error(`スキル「${skillName}」のバックアップが見つかりません`);
      }

      const latestBackup = path.join(backupsDir, skillBackups[0]);

      // 現在のスキルディレクトリを削除
      await fs.rm(skillPath, { recursive: true, force: true });

      // バックアップから復元
      await fs.cp(latestBackup, skillPath, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`スキル「${skillName}」のバックアップが見つかりません`);
      }
      throw error;
    }
  }

  /**
   * 提案をフィルタリング
   */
  private filterSuggestions(
    suggestions: Suggestion[],
    options: ImprovementOptions,
  ): Suggestion[] {
    let filtered = [...suggestions];

    // 種別でフィルタ
    if (options.types && options.types.length > 0) {
      filtered = filtered.filter((s) =>
        options.types!.includes(s.type as SuggestionType),
      );
    }

    // 優先度でフィルタ
    if (options.minPriority) {
      const minOrder = PRIORITY_ORDER[options.minPriority];
      filtered = filtered.filter((s) => PRIORITY_ORDER[s.priority] >= minOrder);
    }

    return filtered;
  }

  /**
   * 単一の改善を適用
   */
  private async applySingleImprovement(
    skillPath: string,
    suggestion: Suggestion,
  ): Promise<AppliedImprovement> {
    switch (suggestion.type) {
      case "prompt":
        return this.applyPromptImprovement(skillPath, suggestion);
      case "structure":
        return this.applyStructureImprovement(skillPath, suggestion);
      case "documentation":
        return this.applyDocumentationImprovement(skillPath, suggestion);
      default:
        return {
          suggestion,
          result: "partial",
          changes: [`${suggestion.type}タイプの改善は手動で適用してください`],
        };
    }
  }

  /**
   * プロンプト改善を適用
   */
  private async applyPromptImprovement(
    skillPath: string,
    suggestion: Suggestion,
  ): Promise<AppliedImprovement> {
    const skillMdPath = path.join(skillPath, "SKILL.md");
    const currentContent = await fs.readFile(skillMdPath, "utf-8");

    // AIに改善を依頼
    const prompt = `以下のSKILL.mdを改善してください。
改善提案: ${suggestion.description}

現在の内容:
\`\`\`markdown
${currentContent}
\`\`\`

改善後のSKILL.md全文のみを出力してください（マークダウンコードブロックなし）。`;

    const response = await this.queryFn(prompt);
    const improvedContent = response.content.trim();

    await fs.writeFile(skillMdPath, improvedContent, "utf-8");

    return {
      suggestion,
      result: "success",
      changes: ["SKILL.mdを更新しました"],
    };
  }

  /**
   * 構造改善を適用
   */
  private async applyStructureImprovement(
    skillPath: string,
    suggestion: Suggestion,
  ): Promise<AppliedImprovement> {
    const changes: string[] = [];

    // AIに構造改善を依頼
    const prompt = `以下のスキルの構造を改善してください。
改善提案: ${suggestion.description}
スキルパス: ${skillPath}

以下のJSON形式で回答してください：
{
  "create": [{"path": "相対パス", "content": "ファイル内容"}],
  "modify": [{"path": "相対パス", "content": "新しい内容"}],
  "delete": ["相対パス"]
}`;

    const response = await this.queryFn(prompt);

    try {
      const result = JSON.parse(response.content) as StructureImprovementResult;

      // ファイル作成
      for (const file of result.create ?? []) {
        const filePath = path.join(skillPath, file.path);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, file.content, "utf-8");
        changes.push(`作成: ${file.path}`);
      }

      // ファイル修正
      for (const file of result.modify ?? []) {
        const filePath = path.join(skillPath, file.path);
        await fs.writeFile(filePath, file.content, "utf-8");
        changes.push(`修正: ${file.path}`);
      }

      // ファイル削除
      for (const filePath of result.delete ?? []) {
        const fullPath = path.join(skillPath, filePath);
        await fs.rm(fullPath, { force: true });
        changes.push(`削除: ${filePath}`);
      }

      return {
        suggestion,
        result: changes.length > 0 ? "success" : "partial",
        changes:
          changes.length > 0 ? changes : ["構造の変更は不要と判断されました"],
      };
    } catch {
      return {
        suggestion,
        result: "failed",
        changes: [],
        error: "構造改善の応答をパースできませんでした",
      };
    }
  }

  /**
   * ドキュメント改善を適用
   */
  private async applyDocumentationImprovement(
    skillPath: string,
    suggestion: Suggestion,
  ): Promise<AppliedImprovement> {
    // ドキュメント改善はプロンプト改善と同様に処理
    return this.applyPromptImprovement(skillPath, suggestion);
  }
}
