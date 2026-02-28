import { describe, it, expect, beforeEach, vi } from "vitest";
import { SkillChainExecutor } from "./SkillChainExecutor";
import type { SkillChainDefinition, SkillChainStep } from "@repo/shared";

function createStep(overrides?: Partial<SkillChainStep>): SkillChainStep {
  return {
    stepId: overrides?.stepId ?? "step-1",
    skillName: overrides?.skillName ?? "test-skill",
    inputMapping: overrides?.inputMapping ?? {},
    outputMapping: overrides?.outputMapping,
    condition: overrides?.condition,
    timeout: overrides?.timeout,
    retryCount: overrides?.retryCount,
  };
}

function createChain(
  steps: SkillChainStep[],
  overrides?: Partial<SkillChainDefinition>,
): SkillChainDefinition {
  return {
    id: overrides?.id ?? "chain-1",
    name: overrides?.name ?? "Test Chain",
    description: overrides?.description ?? "",
    steps,
    variables: overrides?.variables ?? {},
    errorHandling: overrides?.errorHandling ?? "stop",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("SkillChainExecutor", () => {
  let mockExecuteFn: ReturnType<typeof vi.fn>;
  let executor: SkillChainExecutor;

  beforeEach(() => {
    mockExecuteFn = vi.fn().mockResolvedValue({ result: "ok" });
    executor = new SkillChainExecutor(mockExecuteFn);
  });

  describe("executeChain", () => {
    it("2ステップのチェーンを順次実行し、各StepResultを含むSkillChainResultを返す", async () => {
      const chain = createChain([
        createStep({ stepId: "s1" }),
        createStep({ stepId: "s2" }),
      ]);
      const result = await executor.executeChain(chain);
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].stepId).toBe("s1");
      expect(result.results[1].stepId).toBe("s2");
      expect(result.totalDuration).toBeGreaterThanOrEqual(0);
    });

    it("前ステップの出力が次ステップの入力として渡される（previousOutput型）", async () => {
      mockExecuteFn.mockResolvedValueOnce({ data: "from-step-1" });
      const chain = createChain([
        createStep({ stepId: "s1" }),
        createStep({
          stepId: "s2",
          inputMapping: { prev: { type: "previousOutput" } },
        }),
      ]);
      const result = await executor.executeChain(chain);
      expect(result.success).toBe(true);
      expect(mockExecuteFn).toHaveBeenCalledTimes(2);
      const secondCallArgs = mockExecuteFn.mock.calls[1];
      expect(secondCallArgs[1]).toEqual({ prev: { data: "from-step-1" } });
    });

    it("errorHandling が 'stop' の場合、ステップ失敗で即座にチェーンを中断する", async () => {
      mockExecuteFn
        .mockResolvedValueOnce("ok")
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValueOnce("ok");
      const chain = createChain(
        [
          createStep({ stepId: "s1" }),
          createStep({ stepId: "s2" }),
          createStep({ stepId: "s3" }),
        ],
        { errorHandling: "stop" },
      );
      const result = await executor.executeChain(chain);
      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(2);
      expect(result.results[1].success).toBe(false);
    });

    it("errorHandling が 'skip' の場合、失敗ステップをスキップして次へ進む", async () => {
      mockExecuteFn
        .mockResolvedValueOnce("ok")
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValueOnce("ok");
      const chain = createChain(
        [
          createStep({ stepId: "s1" }),
          createStep({ stepId: "s2" }),
          createStep({ stepId: "s3" }),
        ],
        { errorHandling: "skip" },
      );
      const result = await executor.executeChain(chain);
      expect(result.results).toHaveLength(3);
      expect(result.results[1].success).toBe(false);
      expect(result.results[2].success).toBe(true);
    });

    it("errorHandling が 'retry' の場合、失敗ステップを retryCount 回まで再試行する", async () => {
      mockExecuteFn
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValueOnce("retry-ok");
      const chain = createChain([createStep({ stepId: "s1", retryCount: 2 })], {
        errorHandling: "retry",
      });
      const result = await executor.executeChain(chain);
      expect(result.success).toBe(true);
      expect(result.results[0].success).toBe(true);
      expect(mockExecuteFn).toHaveBeenCalledTimes(2);
    });

    it("空のステップ配列の場合、success: true で空の results を返す", async () => {
      const chain = createChain([]);
      const result = await executor.executeChain(chain);
      expect(result.success).toBe(true);
      expect(result.results).toEqual([]);
    });

    it("variables パラメータが finalVariables に反映される", async () => {
      const chain = createChain([], { variables: { base: "v1" } });
      const result = await executor.executeChain(chain, { override: "v2" });
      expect(result.finalVariables).toEqual({ base: "v1", override: "v2" });
    });

    it("ステップの timeout を超過した場合、そのステップを失敗として扱う", async () => {
      mockExecuteFn.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500)),
      );
      const chain = createChain([createStep({ stepId: "s1", timeout: 50 })]);
      const result = await executor.executeChain(chain);
      expect(result.success).toBe(false);
      expect(result.results[0].error).toContain("timed out");
    });
  });

  describe("buildStepInput", () => {
    it("type: 'literal' の場合、value をそのまま返す", () => {
      const result = executor.buildStepInput(
        { key: { type: "literal", value: "hello" } },
        {},
        undefined,
      );
      expect(result).toEqual({ key: "hello" });
    });

    it("type: 'variable' の場合、variables から値を取得する", () => {
      const result = executor.buildStepInput(
        { key: { type: "variable", value: "myVar" } },
        { myVar: "resolved" },
        undefined,
      );
      expect(result).toEqual({ key: "resolved" });
    });

    it("type: 'template' の場合、テンプレート内の変数を展開する", () => {
      const result = executor.buildStepInput(
        { key: { type: "template", template: "Hello {{name}}" } },
        { name: "World" },
        undefined,
      );
      expect(result).toEqual({ key: "Hello World" });
    });

    it("type: 'previousOutput' の場合、前ステップの出力を返す", () => {
      const result = executor.buildStepInput(
        { key: { type: "previousOutput" } },
        {},
        { data: "from-step-1" },
      );
      expect(result).toEqual({ key: { data: "from-step-1" } });
    });

    it("variable が存在しない場合、undefined を返す", () => {
      const result = executor.buildStepInput(
        { key: { type: "variable", value: "nonExistent" } },
        {},
        undefined,
      );
      expect(result).toEqual({ key: undefined });
    });
  });

  describe("evaluateCondition", () => {
    it("type: 'always' の場合、常に true を返す", () => {
      expect(
        executor.evaluateCondition({ type: "always" }, {}, undefined),
      ).toBe(true);
    });

    it("type: 'ifVariable' で値が一致する場合、true を返す", () => {
      expect(
        executor.evaluateCondition(
          { type: "ifVariable", variable: "mode", expectedValue: "prod" },
          { mode: "prod" },
          undefined,
        ),
      ).toBe(true);
    });

    it("type: 'ifVariable' で値が不一致の場合、false を返す", () => {
      expect(
        executor.evaluateCondition(
          { type: "ifVariable", variable: "mode", expectedValue: "prod" },
          { mode: "dev" },
          undefined,
        ),
      ).toBe(false);
    });

    it("type: 'ifPreviousSuccess' で前ステップが成功なら true", () => {
      expect(
        executor.evaluateCondition(
          { type: "ifPreviousSuccess" },
          {},
          { stepId: "prev", success: true },
        ),
      ).toBe(true);
    });

    it("type: 'ifPreviousSuccess' で前ステップが失敗の場合、false を返す", () => {
      expect(
        executor.evaluateCondition(
          { type: "ifPreviousSuccess" },
          {},
          { stepId: "prev", success: false },
        ),
      ).toBe(false);
    });

    it("type: 'expression' の場合、式を評価して結果を返す", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "{{count}} > 5" },
          { count: 10 },
          undefined,
        ),
      ).toBe(true);
    });

    it("condition が未設定の場合、true を返す", () => {
      expect(executor.evaluateCondition(undefined, {}, undefined)).toBe(true);
    });
  });

  describe("extractOutput", () => {
    it("extractPath 指定時、出力オブジェクトから該当パスの値を抽出する", () => {
      const variables: Record<string, unknown> = {};
      executor.extractOutput(
        { extractPath: "data.result", variableName: "res" },
        { data: { result: "extracted" } },
        variables,
      );
      expect(variables["res"]).toBe("extracted");
    });

    it("extractPath 未指定時、出力全体を variableName に格納する", () => {
      const variables: Record<string, unknown> = {};
      executor.extractOutput(
        { variableName: "fullOutput" },
        { key: "value" },
        variables,
      );
      expect(variables["fullOutput"]).toEqual({ key: "value" });
    });

    it("outputMapping 未設定時、変数を更新しない", () => {
      const variables: Record<string, unknown> = { existing: "keep" };
      executor.extractOutput(undefined, "output", variables);
      expect(variables).toEqual({ existing: "keep" });
    });

    it("extractPath のパスが存在しない場合、undefined を格納する", () => {
      const variables: Record<string, unknown> = {};
      executor.extractOutput(
        { extractPath: "a.b.c.d.e", variableName: "deep" },
        { a: { b: "shallow" } },
        variables,
      );
      expect(variables["deep"]).toBeUndefined();
    });
  });

  describe("renderTemplate", () => {
    it("{{variableName}} を変数値に置換する", () => {
      const result = executor.renderTemplate(
        "Skill: {{skillName}}, Version: {{version}}",
        { skillName: "test", version: "1.0" },
      );
      expect(result).toBe("Skill: test, Version: 1.0");
    });

    it("存在しない変数は空文字列に置換する", () => {
      const result = executor.renderTemplate("Hello {{unknown}}", {});
      expect(result).toBe("Hello ");
    });

    it("テンプレート構文が含まれない文字列はそのまま返す", () => {
      const result = executor.renderTemplate("no templates", {});
      expect(result).toBe("no templates");
    });

    it("null/undefined の変数は空文字列に置換する", () => {
      const result = executor.renderTemplate("{{a}} and {{b}}", {
        a: null,
        b: undefined,
      });
      expect(result).toBe(" and ");
    });
  });

  describe("evaluateCondition (extended)", () => {
    it("expression: 比較演算子 === で文字列を比較する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "{{mode}} === prod" },
          { mode: "prod" },
          undefined,
        ),
      ).toBe(true);
    });

    it("expression: 比較演算子 !== で不一致を検出する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "{{status}} !== error" },
          { status: "ok" },
          undefined,
        ),
      ).toBe(true);
    });

    it("expression: 比較演算子 < で数値を比較する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "{{count}} < 10" },
          { count: 5 },
          undefined,
        ),
      ).toBe(true);
    });

    it("expression: 比較演算子 >= で数値を比較する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "{{score}} >= 80" },
          { score: 80 },
          undefined,
        ),
      ).toBe(true);
    });

    it("expression: 比較演算子 <= で数値を比較する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "{{val}} <= 0" },
          { val: 0 },
          undefined,
        ),
      ).toBe(true);
    });

    it("expression: 比較演算子 == で値を比較する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "{{x}} == 42" },
          { x: 42 },
          undefined,
        ),
      ).toBe(true);
    });

    it("expression: 比較演算子 != で値を比較する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "{{x}} != 0" },
          { x: 1 },
          undefined,
        ),
      ).toBe(true);
    });

    it("expression: 単一値が truthy の場合 true を返す", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "{{flag}}" },
          { flag: "yes" },
          undefined,
        ),
      ).toBe(true);
    });

    it("expression: 単一値 'false' は falsy と判定する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "false" },
          {},
          undefined,
        ),
      ).toBe(false);
    });

    it("expression: 単一値 '0' は falsy と判定する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "0" },
          {},
          undefined,
        ),
      ).toBe(false);
    });

    it("expression: 単一値 'null' は falsy と判定する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "null" },
          {},
          undefined,
        ),
      ).toBe(false);
    });

    it("expression: 単一値 'undefined' は falsy と判定する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "undefined" },
          {},
          undefined,
        ),
      ).toBe(false);
    });

    it("expression: 空文字列は falsy と判定する", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: "{{empty}}" },
          { empty: "" },
          undefined,
        ),
      ).toBe(false);
    });

    it("expression: 引用符付き文字列を正しくパースする", () => {
      expect(
        executor.evaluateCondition(
          { type: "expression", expression: '{{name}} === "hello"' },
          { name: "hello" },
          undefined,
        ),
      ).toBe(true);
    });
  });

  describe("extractOutput (extended)", () => {
    it("JSONPath 形式 $.prefix のパスを正しく処理する", () => {
      const variables: Record<string, unknown> = {};
      executor.extractOutput(
        { extractPath: "$.data.items", variableName: "items" },
        { data: { items: [1, 2, 3] } },
        variables,
      );
      expect(variables["items"]).toEqual([1, 2, 3]);
    });

    it("出力が null の場合、extractPath があっても undefined を格納する", () => {
      const variables: Record<string, unknown> = {};
      executor.extractOutput(
        { extractPath: "data", variableName: "res" },
        null,
        variables,
      );
      expect(variables["res"]).toBeUndefined();
    });

    it("出力がプリミティブ値の場合、extractPath があっても undefined を格納する", () => {
      const variables: Record<string, unknown> = {};
      executor.extractOutput(
        { extractPath: "data", variableName: "res" },
        "string-output",
        variables,
      );
      expect(variables["res"]).toBeUndefined();
    });
  });

  describe("executeChain (extended error scenarios)", () => {
    it("retry で全リトライ失敗の場合、success: false を返す", async () => {
      mockExecuteFn.mockRejectedValue(new Error("persistent error"));
      const chain = createChain([createStep({ stepId: "s1", retryCount: 2 })], {
        errorHandling: "retry",
      });
      const result = await executor.executeChain(chain);
      expect(result.success).toBe(false);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toBe("persistent error");
      expect(mockExecuteFn).toHaveBeenCalledTimes(3);
    });

    it("skip モードで全ステップ失敗でも success は overallSuccess に依存する", async () => {
      mockExecuteFn.mockRejectedValue(new Error("fail"));
      const chain = createChain(
        [createStep({ stepId: "s1" }), createStep({ stepId: "s2" })],
        { errorHandling: "skip" },
      );
      const result = await executor.executeChain(chain);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(false);
      expect(result.results[1].success).toBe(false);
    });

    it("非Error型の例外もエラーメッセージとして捕捉する", async () => {
      mockExecuteFn.mockRejectedValueOnce("string error");
      const chain = createChain([createStep({ stepId: "s1" })]);
      const result = await executor.executeChain(chain);
      expect(result.success).toBe(false);
      expect(result.results[0].error).toBe("string error");
    });

    it("条件不成立でスキップされたステップは skipped: true になる", async () => {
      const chain = createChain([
        createStep({
          stepId: "s1",
          condition: {
            type: "ifVariable",
            variable: "runStep",
            expectedValue: true,
          },
        }),
      ]);
      const result = await executor.executeChain(chain, { runStep: false });
      expect(result.success).toBe(true);
      expect(result.results[0].skipped).toBe(true);
    });

    it("出力マッピングで変数に値が格納され、後続ステップで参照できる", async () => {
      mockExecuteFn
        .mockResolvedValueOnce({ key: "extracted-value" })
        .mockResolvedValueOnce("final");
      const chain = createChain([
        createStep({
          stepId: "s1",
          outputMapping: {
            extractPath: "key",
            variableName: "captured",
          },
        }),
        createStep({
          stepId: "s2",
          inputMapping: {
            input: { type: "variable", value: "captured" },
          },
        }),
      ]);
      const result = await executor.executeChain(chain);
      expect(result.success).toBe(true);
      expect(result.finalVariables["captured"]).toBe("extracted-value");
      expect(mockExecuteFn.mock.calls[1][1]).toEqual({
        input: "extracted-value",
      });
    });
  });
});
