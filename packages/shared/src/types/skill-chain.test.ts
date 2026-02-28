import { describe, it, expect } from "vitest";
import type {
  SkillChainDefinition,
  InputMapping,
  SkillChainCondition,
  SkillChainResult,
  StepResult,
  SkillChainErrorStrategy,
  InputMappingType,
  SkillChainConditionType,
} from "./skill-chain";

describe("skill-chain types", () => {
  it("SkillChainDefinition 型が必須フィールドを持つ", () => {
    const def: SkillChainDefinition = {
      id: "test-id",
      name: "Test Chain",
      description: "A test chain",
      steps: [],
      variables: {},
      errorHandling: "stop",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    expect(def.id).toBe("test-id");
    expect(def.name).toBe("Test Chain");
    expect(def.steps).toEqual([]);
    expect(def.errorHandling).toBe("stop");
  });

  it("InputMapping の type は4つのリテラル型のみ許可する", () => {
    const types: InputMappingType[] = [
      "literal",
      "variable",
      "template",
      "previousOutput",
    ];
    expect(types).toHaveLength(4);
    const mapping: InputMapping = { type: "literal", value: "test" };
    expect(mapping.type).toBe("literal");
  });

  it("SkillChainCondition の type は4つのリテラル型のみ許可する", () => {
    const types: SkillChainConditionType[] = [
      "always",
      "ifVariable",
      "ifPreviousSuccess",
      "expression",
    ];
    expect(types).toHaveLength(4);
    const cond: SkillChainCondition = { type: "always" };
    expect(cond.type).toBe("always");
  });

  it("errorHandling は3つのリテラル型のみ許可する", () => {
    const strategies: SkillChainErrorStrategy[] = ["stop", "skip", "retry"];
    expect(strategies).toHaveLength(3);
  });

  it("SkillChainResult が必須フィールドを持つ", () => {
    const result: SkillChainResult = {
      chainId: "chain-1",
      success: true,
      results: [],
      finalVariables: {},
      totalDuration: 100,
    };
    expect(result.chainId).toBe("chain-1");
    expect(result.success).toBe(true);
    expect(result.totalDuration).toBe(100);
  });

  it("StepResult の success と skipped はオプショナルである", () => {
    const result: StepResult = { stepId: "step-1" };
    expect(result.stepId).toBe("step-1");
    expect(result.success).toBeUndefined();
    expect(result.skipped).toBeUndefined();
  });

  it("createdAt と updatedAt は ISO 8601 文字列型である", () => {
    const def: SkillChainDefinition = {
      id: "id",
      name: "name",
      description: "",
      steps: [],
      variables: {},
      errorHandling: "stop",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(typeof def.createdAt).toBe("string");
    expect(typeof def.updatedAt).toBe("string");
    expect(() => new Date(def.createdAt)).not.toThrow();
  });
});
