/**
 * TASK-SW-FIX-DATAFLOW-001 Phase 6 テスト拡充
 * TC-11〜TC-16: フェイルパス・エッジケース
 * TC-17〜TC-18: 後方互換回帰
 */
import { describe, it, expect } from "vitest";
import {
  buildSkillContext,
  buildSkillGenerationPrompt,
  resolvePrimarySkillCategory,
} from "../skillCreator";
import type {
  ConversationAnswers,
  SkillCreationContext,
  SkillInfoFormData,
} from "../skillCreator";

function makeAnswers(
  overrides: Partial<ConversationAnswers> = {},
): ConversationAnswers {
  const empty = { selectedOptions: [] as string[], freeText: "" };
  return {
    q1: empty,
    q2: empty,
    q3: empty,
    q4: empty,
    q5: empty,
    q6: empty,
    ...overrides,
  };
}

// ============================================================
// TC-11: フェイルパス — undefined ハンドリング
// ============================================================

describe("TC-11: buildSkillContext undefined ハンドリング", () => {
  it("skillName が undefined の場合 context.skillName も undefined", () => {
    const formData: SkillInfoFormData = { purpose: "テスト", category: [] };
    const context = buildSkillContext(formData, makeAnswers());
    expect(context.skillName).toBeUndefined();
  });

  it("全 Q が空でも buildSkillContext はエラーなく空コンテキストを返す", () => {
    const formData: SkillInfoFormData = { purpose: "テスト", category: [] };
    const context = buildSkillContext(formData, makeAnswers());
    expect(context).toMatchObject({ purpose: "テスト" });
    expect(context.q1Purpose).toBeUndefined();
    expect(context.q6Constraints).toBeUndefined();
  });
});

// ============================================================
// TC-12: 全フィールド undefined のコンテキスト
// ============================================================

describe("TC-12: buildSkillGenerationPrompt 全フィールド undefined", () => {
  it("全フィールド undefined でも空文字または最低限の文字列を返す", () => {
    const context: SkillCreationContext = {};
    const prompt = buildSkillGenerationPrompt(context);
    expect(typeof prompt).toBe("string");
    // エラーにならないこと
  });

  it("purpose のみ設定した場合 purpose が含まれる", () => {
    const context: SkillCreationContext = { purpose: "テスト目的" };
    const prompt = buildSkillGenerationPrompt(context);
    expect(prompt).toContain("テスト目的");
  });

  it("未知の category はそのままプロンプトに残る", () => {
    const context: SkillCreationContext = {
      category: "custom-category",
    };
    const prompt = buildSkillGenerationPrompt(context);
    expect(prompt).toContain("custom-category");
  });
});

// ============================================================
// TC-14: エッジケース — 空白正規化
// ============================================================

describe("TC-14: 空白正規化エッジケース", () => {
  it("タブ文字を含む freeText も trim される", () => {
    const formData: SkillInfoFormData = {
      purpose: "\tメール整理\t",
      category: [],
    };
    const context = buildSkillContext(formData, makeAnswers());
    expect(context.purpose).toBe("メール整理");
  });

  it("改行を含む freeText は trim で除去される", () => {
    const formData: SkillInfoFormData = {
      purpose: "\nテスト\n",
      category: [],
    };
    const context = buildSkillContext(formData, makeAnswers());
    expect(context.purpose).toBe("テスト");
  });

  it("selectedOptions が空配列の場合 freeText が空なら undefined", () => {
    const formData: SkillInfoFormData = { purpose: "テスト", category: [] };
    const answers = makeAnswers({
      q1: { selectedOptions: [], freeText: "   " },
    });
    const context = buildSkillContext(formData, answers);
    expect(context.q1Purpose).toBeUndefined();
  });
});

// ============================================================
// TC-15: エッジケース — 複数 selectedOptions
// ============================================================

describe("TC-15: selectedOptions 複数選択", () => {
  it("selectedOptions が複数の場合 カンマ区切りで結合される", () => {
    const formData: SkillInfoFormData = { purpose: "テスト", category: [] };
    const answers = makeAnswers({
      q5: { selectedOptions: ["GitHub", "Slack", "Notion"], freeText: "" },
    });
    const context = buildSkillContext(formData, answers);
    expect(context.q5Output).toBe("GitHub, Slack, Notion");
  });
});

// ============================================================
// TC-15b: エッジケース — 複数カテゴリの代表値決定
// ============================================================

describe("TC-15b: 複数カテゴリの代表値決定", () => {
  it("入力順が異なっても同じ代表カテゴリが返る", () => {
    expect(
      resolvePrimarySkillCategory(["code-support", "external-integration"]),
    ).toBe("external-integration");
    expect(
      resolvePrimarySkillCategory(["external-integration", "code-support"]),
    ).toBe("external-integration");
  });

  it("選択カテゴリがない場合は undefined を返す", () => {
    expect(resolvePrimarySkillCategory([])).toBeUndefined();
  });
});

// ============================================================
// TC-16: エッジケース — 長大入力
// ============================================================

describe("TC-16: 長大入力の処理", () => {
  it("1000文字の purpose が切り捨てられずにコンテキストに格納される", () => {
    const longPurpose = "あ".repeat(1000);
    const formData: SkillInfoFormData = {
      purpose: longPurpose,
      category: [],
    };
    const context = buildSkillContext(formData, makeAnswers());
    expect(context.purpose).toBe(longPurpose);
  });

  it("1000文字の purpose がプロンプトに含まれる", () => {
    const longPurpose = "あ".repeat(1000);
    const context: SkillCreationContext = { purpose: longPurpose };
    const prompt = buildSkillGenerationPrompt(context);
    expect(prompt).toContain(longPurpose);
  });
});

// ============================================================
// TC-17: 後方互換回帰 — buildSkillContext は純粋関数
// ============================================================

describe("TC-17: buildSkillContext が純粋関数であること", () => {
  it("同じ入力で常に同じ結果を返す（参照透過性）", () => {
    const formData: SkillInfoFormData = {
      purpose: "テスト",
      category: ["automation"],
    };
    const answers = makeAnswers({
      q1: { selectedOptions: ["user"], freeText: "" },
    });

    const ctx1 = buildSkillContext(formData, answers);
    const ctx2 = buildSkillContext(formData, answers);

    expect(ctx1).toEqual(ctx2);
  });

  it("buildSkillContext が元の formData・answers を変更しない（副作用なし）", () => {
    const formData: SkillInfoFormData = { purpose: "テスト", category: [] };
    const answers = makeAnswers({
      q1: { selectedOptions: ["user"], freeText: "" },
    });
    const originalPurpose = formData.purpose;
    const originalQ1Options = [...answers.q1.selectedOptions];

    buildSkillContext(formData, answers);

    expect(formData.purpose).toBe(originalPurpose);
    expect(answers.q1.selectedOptions).toEqual(originalQ1Options);
  });
});

// ============================================================
// TC-18: 後方互換回帰 — buildSkillGenerationPrompt は純粋関数
// ============================================================

describe("TC-18: buildSkillGenerationPrompt が純粋関数であること", () => {
  it("同じ context で常に同じプロンプトを返す", () => {
    const context: SkillCreationContext = {
      purpose: "メール整理",
      q1Purpose: "ユーザー",
    };

    const p1 = buildSkillGenerationPrompt(context);
    const p2 = buildSkillGenerationPrompt(context);

    expect(p1).toBe(p2);
  });

  it("buildSkillGenerationPrompt が context オブジェクトを変更しない", () => {
    const context: SkillCreationContext = {
      purpose: "テスト",
      q1Purpose: "開発者",
    };
    const originalPurpose = context.purpose;

    buildSkillGenerationPrompt(context);

    expect(context.purpose).toBe(originalPurpose);
  });
});
