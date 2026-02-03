/**
 * PromptOptimizer - プロンプト最適化サービス
 * TASK-9C: スキル改善・自動修正機能
 *
 * プロンプトの最適化、バリアント生成、評価を行う
 */
import type {
  OptimizationResult,
  OptimizationMetrics,
  PromptEvaluation,
  EvaluationBreakdown,
} from "@repo/shared";

/**
 * プロンプト最適化サービス
 */
export class PromptOptimizer {
  private queryFn: (prompt: string) => Promise<{ content: string }>;

  /**
   * @param queryFn Claude Agent SDKのquery関数（DI用）
   */
  constructor(queryFn?: (prompt: string) => Promise<{ content: string }>) {
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
   * プロンプトを最適化する
   */
  async optimize(inputPrompt: string): Promise<OptimizationResult> {
    // バリデーション
    this.validatePrompt(inputPrompt);

    const systemPrompt = `あなたはプロンプトエンジニアリングの専門家です。
与えられたプロンプトを分析し、以下の観点から最適化してください：
1. 明確さ（Clarity）- 曖昧さを排除し、意図を明確に
2. 具体性（Specificity）- 具体的な指示や例を追加
3. 完全性（Completeness）- 必要な情報をすべて含める

以下のJSON形式で回答してください：
{
  "optimized": "最適化後のプロンプト",
  "changes": ["変更点1", "変更点2"],
  "metrics": {
    "clarityScore": 0-100,
    "specificityScore": 0-100,
    "completenessScore": 0-100
  }
}`;

    const prompt = `${systemPrompt}

最適化対象のプロンプト:
"""
${inputPrompt}
"""`;

    const response = await this.queryFn(prompt);
    return this.parseOptimizationResponse(inputPrompt, response.content);
  }

  /**
   * プロンプトのバリアントを生成する
   */
  async generateVariants(
    inputPrompt: string,
    count: number = 3,
  ): Promise<string[]> {
    // バリデーション
    this.validatePrompt(inputPrompt);

    if (count <= 0) {
      throw new Error("バリアント数は1以上を指定してください");
    }

    const systemPrompt = `あなたはプロンプトエンジニアリングの専門家です。
与えられたプロンプトに対して、${count}個の異なるバリアントを生成してください。
各バリアントは異なるアプローチや表現スタイルを持つべきです：
- 簡潔版：要点を絞ったコンパクトな表現
- 詳細版：詳しい説明と具体例を含む
- 構造化版：明確なセクションや箇条書きを使用

JSON配列形式で回答してください：
["バリアント1", "バリアント2", ...]`;

    const prompt = `${systemPrompt}

元のプロンプト:
"""
${inputPrompt}
"""`;

    const response = await this.queryFn(prompt);
    return this.parseVariantsResponse(response.content, count);
  }

  /**
   * プロンプトを評価する
   */
  async evaluate(inputPrompt: string): Promise<PromptEvaluation> {
    // バリデーション
    this.validatePrompt(inputPrompt);

    const systemPrompt = `あなたはプロンプトエンジニアリングの専門家です。
与えられたプロンプトを以下の観点から評価してください：
1. 明確さ（Clarity）- 意図が明確か
2. 具体性（Specificity）- 具体的な指示があるか
3. 完全性（Completeness）- 必要な情報が含まれているか
4. 再現性（Reproducibility）- 同じ結果が得られるか
5. セキュリティ（Security）- 安全な指示か

以下のJSON形式で回答してください：
{
  "score": 0-100（総合スコア）,
  "breakdown": {
    "clarity": 0-100,
    "specificity": 0-100,
    "completeness": 0-100,
    "reproducibility": 0-100,
    "security": 0-100
  },
  "feedback": ["フィードバック1", "フィードバック2"]
}`;

    const prompt = `${systemPrompt}

評価対象のプロンプト:
"""
${inputPrompt}
"""`;

    const response = await this.queryFn(prompt);
    return this.parseEvaluationResponse(response.content);
  }

  /**
   * プロンプトのバリデーション
   */
  private validatePrompt(prompt: string): void {
    if (!prompt || prompt.trim() === "") {
      throw new Error("プロンプトが空です");
    }
  }

  /**
   * 最適化応答をパース
   */
  private parseOptimizationResponse(
    original: string,
    content: string,
  ): OptimizationResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("JSONが見つかりません");
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        optimized: string;
        changes: string[];
        metrics: OptimizationMetrics;
      };

      return {
        original,
        optimized: parsed.optimized ?? original,
        changes: parsed.changes ?? [],
        metrics: {
          clarityScore: parsed.metrics?.clarityScore ?? 50,
          specificityScore: parsed.metrics?.specificityScore ?? 50,
          completenessScore: parsed.metrics?.completenessScore ?? 50,
        },
      };
    } catch (error) {
      throw new Error(
        `最適化応答のパースに失敗しました: ${(error as Error).message}`,
      );
    }
  }

  /**
   * バリアント応答をパース
   */
  private parseVariantsResponse(
    content: string,
    expectedCount: number,
  ): string[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("JSON配列が見つかりません");
      }

      const parsed = JSON.parse(jsonMatch[0]) as string[];

      if (!Array.isArray(parsed)) {
        throw new Error("配列形式ではありません");
      }

      // 期待数に合わせて調整
      if (parsed.length > expectedCount) {
        return parsed.slice(0, expectedCount);
      }

      return parsed;
    } catch (error) {
      throw new Error(
        `バリアント応答のパースに失敗しました: ${(error as Error).message}`,
      );
    }
  }

  /**
   * 評価応答をパース
   */
  private parseEvaluationResponse(content: string): PromptEvaluation {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("JSONが見つかりません");
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        score: number;
        breakdown?: EvaluationBreakdown;
        feedback: string[];
      };

      // スコアの範囲チェック
      const score = Math.max(0, Math.min(100, parsed.score ?? 50));

      return {
        score,
        breakdown: parsed.breakdown,
        feedback: parsed.feedback ?? [],
      };
    } catch (error) {
      throw new Error(
        `評価応答のパースに失敗しました: ${(error as Error).message}`,
      );
    }
  }
}
