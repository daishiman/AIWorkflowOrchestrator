/**
 * SkillChainExecutor - チェーン実行エンジン
 * TASK-9D: ステップ順次実行、入出力マッピング、条件評価、テンプレート展開、エラーハンドリング
 */
import type {
  SkillChainDefinition,
  SkillChainResult,
  StepResult,
  InputMapping,
  OutputMapping,
  SkillChainCondition,
} from "@repo/shared";

/** チェーン実行コンテキスト（内部型） */
interface ChainExecutionContext {
  variables: Record<string, unknown>;
  previousOutput: unknown;
  previousSuccess: boolean;
  stepResults: StepResult[];
}

/** デフォルトステップタイムアウト（30秒） */
const DEFAULT_STEP_TIMEOUT = 30000;

export class SkillChainExecutor {
  constructor(
    private readonly skillExecuteFn: (
      skillName: string,
      input: unknown,
    ) => Promise<unknown>,
  ) {}

  /**
   * チェーンを実行し、全ステップの結果を返す
   */
  async executeChain(
    definition: SkillChainDefinition,
    initialVariables?: Record<string, unknown>,
  ): Promise<SkillChainResult> {
    const startTime = Date.now();
    const context: ChainExecutionContext = {
      variables: {
        ...(definition.variables ?? {}),
        ...(initialVariables ?? {}),
      },
      previousOutput: undefined,
      previousSuccess: true,
      stepResults: [],
    };

    let overallSuccess = true;

    for (const step of definition.steps) {
      const previousResult =
        context.stepResults.length > 0
          ? context.stepResults[context.stepResults.length - 1]
          : undefined;

      // 条件評価
      const shouldRun = this.evaluateCondition(
        step.condition,
        context.variables,
        previousResult,
      );

      if (!shouldRun) {
        context.stepResults.push({ stepId: step.stepId, skipped: true });
        continue;
      }

      // エラーハンドリング戦略に基づく実行
      const maxAttempts =
        definition.errorHandling === "retry" ? (step.retryCount ?? 0) + 1 : 1;

      let stepSuccess = false;
      let lastError: string | undefined;
      let stepOutput: unknown;
      const stepStartTime = Date.now();

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const input = this.buildStepInput(
            step.inputMapping,
            context.variables,
            context.previousOutput,
          );

          // タイムアウト付きスキル実行
          stepOutput = await this.executeWithTimeout(
            step.skillName,
            input,
            step.timeout ?? DEFAULT_STEP_TIMEOUT,
          );

          stepSuccess = true;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
        }
      }

      const stepDuration = Date.now() - stepStartTime;

      if (stepSuccess) {
        // 出力マッピング
        this.extractOutput(step.outputMapping, stepOutput, context.variables);
        context.previousOutput = stepOutput;
        context.previousSuccess = true;

        context.stepResults.push({
          stepId: step.stepId,
          success: true,
          output: stepOutput,
          duration: stepDuration,
        });
      } else {
        context.previousSuccess = false;
        context.stepResults.push({
          stepId: step.stepId,
          success: false,
          error: lastError,
          duration: stepDuration,
        });

        switch (definition.errorHandling) {
          case "stop":
            overallSuccess = false;
            return {
              chainId: definition.id,
              success: false,
              results: context.stepResults,
              finalVariables: { ...context.variables },
              totalDuration: Date.now() - startTime,
            };
          case "skip":
            // continue to next step
            continue;
          case "retry":
            // all retries exhausted → stop
            overallSuccess = false;
            return {
              chainId: definition.id,
              success: false,
              results: context.stepResults,
              finalVariables: { ...context.variables },
              totalDuration: Date.now() - startTime,
            };
        }
      }
    }

    return {
      chainId: definition.id,
      success: overallSuccess,
      results: context.stepResults,
      finalVariables: { ...context.variables },
      totalDuration: Date.now() - startTime,
    };
  }

  /**
   * ステップの入力を構築する
   */
  buildStepInput(
    inputMapping: Record<string, InputMapping>,
    variables: Record<string, unknown>,
    previousOutput: unknown,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, mapping] of Object.entries(inputMapping)) {
      switch (mapping.type) {
        case "literal":
          result[key] = mapping.value;
          break;
        case "variable":
          result[key] = variables[mapping.value as string];
          break;
        case "template":
          result[key] = this.renderTemplate(mapping.template ?? "", variables);
          break;
        case "previousOutput":
          result[key] = previousOutput;
          break;
      }
    }
    return result;
  }

  /**
   * ステップの実行条件を評価する
   */
  evaluateCondition(
    condition: SkillChainCondition | undefined,
    variables: Record<string, unknown>,
    previousResult: StepResult | undefined,
  ): boolean {
    if (!condition) return true;

    switch (condition.type) {
      case "always":
        return true;
      case "ifVariable":
        return variables[condition.variable ?? ""] === condition.expectedValue;
      case "ifPreviousSuccess":
        return previousResult?.success === true;
      case "expression":
        return this.evaluateSimpleExpression(
          condition.expression ?? "",
          variables,
        );
      default:
        return true;
    }
  }

  /**
   * ステップ出力から指定パスの値を抽出して変数に格納する
   */
  extractOutput(
    outputMapping: OutputMapping | undefined,
    output: unknown,
    variables: Record<string, unknown>,
  ): void {
    if (!outputMapping) return;

    const value = outputMapping.extractPath
      ? this.getNestedValue(output, outputMapping.extractPath)
      : output;

    variables[outputMapping.variableName] = value;
  }

  /**
   * Mustache テンプレートを展開する
   * eval/Function コンストラクタは使用しない（CSP 準拠）
   */
  renderTemplate(template: string, variables: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = variables[key];
      return value !== undefined && value !== null ? String(value) : "";
    });
  }

  /**
   * タイムアウト付きスキル実行
   */
  private async executeWithTimeout(
    skillName: string,
    input: unknown,
    timeout: number,
  ): Promise<unknown> {
    return Promise.race([
      this.skillExecuteFn(skillName, input),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Step timed out after ${timeout}ms`)),
          timeout,
        ),
      ),
    ]);
  }

  /**
   * 安全な式評価（eval/Function 不使用）
   * 単純な比較式のみサポート: "variable > value", "variable === value" 等
   */
  private evaluateSimpleExpression(
    expression: string,
    variables: Record<string, unknown>,
  ): boolean {
    // テンプレート変数を展開
    const rendered = this.renderTemplate(expression, variables);

    // 単純な比較式のパース
    const comparisonMatch = rendered.match(
      /^\s*(.+?)\s*(===|!==|>=|<=|>|<|==|!=)\s*(.+?)\s*$/,
    );
    if (!comparisonMatch) {
      // 単一値の truthy 評価
      const trimmed = rendered.trim();
      return (
        trimmed !== "" &&
        trimmed !== "0" &&
        trimmed !== "false" &&
        trimmed !== "null" &&
        trimmed !== "undefined"
      );
    }

    const [, leftStr, operator, rightStr] = comparisonMatch;
    const left = this.parseExpressionValue(leftStr);
    const right = this.parseExpressionValue(rightStr);

    switch (operator) {
      case "===":
      case "==":
        return left === right;
      case "!==":
      case "!=":
        return left !== right;
      case ">":
        return Number(left) > Number(right);
      case "<":
        return Number(left) < Number(right);
      case ">=":
        return Number(left) >= Number(right);
      case "<=":
        return Number(left) <= Number(right);
      default:
        return false;
    }
  }

  private parseExpressionValue(str: string): string | number {
    const trimmed = str.trim();
    const num = Number(trimmed);
    if (!isNaN(num) && trimmed !== "") {
      return num;
    }
    // 引用符を除去
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  /**
   * ドット記法でネストされた値を取得する
   * JSONPath 形式: "data.result" or "$.data.items"
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    // $.prefix を除去
    const cleanPath = path.startsWith("$.") ? path.slice(2) : path;
    const keys = cleanPath.split(".");

    let current: unknown = obj;
    for (const key of keys) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== "object") return undefined;
      current = (current as Record<string, unknown>)[key];
    }
    return current;
  }
}
