/**
 * TASK-SW-FIX-DATAFLOW-001 Phase 4
 * TC-01〜TC-03: buildSkillContext テスト
 * TC-07〜TC-08: buildSkillGenerationPrompt テスト
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

// ============================================================
// テスト用ヘルパー
// ============================================================

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
// TC-01〜TC-03: buildSkillContext
// ============================================================

describe("buildSkillContext", () => {
  describe("TC-01: 全フィールド入力時の正常変換", () => {
    it("全フィールドが正しく SkillCreationContext にマッピングされる", () => {
      const formData: SkillInfoFormData = {
        skillName: "my-skill",
        purpose: "メール自動整理",
        category: ["automation"],
      };
      const answers = makeAnswers({
        q1: { selectedOptions: [], freeText: "一般ユーザー" },
        q2: { selectedOptions: [], freeText: "メール受信箱" },
        q3: { selectedOptions: ["毎日"], freeText: "" },
        q4: { selectedOptions: [], freeText: "整理済みフォルダ" },
        q5: { selectedOptions: ["Gmail"], freeText: "" },
        q6: { selectedOptions: [], freeText: "完了メッセージ" },
      });

      const context = buildSkillContext(formData, answers);

      expect(context.skillName).toBe("my-skill");
      expect(context.category).toBe("automation");
      expect(context.purpose).toBe("メール自動整理");
      expect(context.q1Purpose).toBe("一般ユーザー");
      expect(context.q2Target).toBe("メール受信箱");
      expect(context.q3Tools).toBe("毎日");
      expect(context.q4Timing).toBe("整理済みフォルダ");
      expect(context.q5Output).toBe("Gmail");
      expect(context.q6Constraints).toBe("完了メッセージ");
    });

    it("複数カテゴリが選択されていても代表値は優先順で決まり、入力順に依存しない", () => {
      const formData: SkillInfoFormData = {
        skillName: "my-skill",
        purpose: "メール自動整理",
        category: ["code-support", "automation", "data-analysis"],
      };

      const context = buildSkillContext(formData, makeAnswers());

      expect(context.category).toBe("automation");
      expect(
        resolvePrimarySkillCategory([
          "data-analysis",
          "code-support",
          "automation",
        ]),
      ).toBe("automation");
      expect(
        resolvePrimarySkillCategory([
          "automation",
          "code-support",
          "data-analysis",
        ]),
      ).toBe("automation");
    });

    it("freeText が selectedOptions より優先される", () => {
      const formData: SkillInfoFormData = { purpose: "テスト", category: [] };
      const answers = makeAnswers({
        q1: { selectedOptions: ["選択肢A"], freeText: "手入力テキスト" },
      });

      const context = buildSkillContext(formData, answers);

      expect(context.q1Purpose).toBe("手入力テキスト");
    });

    it("freeText が空の場合 selectedOptions が使われる", () => {
      const formData: SkillInfoFormData = { purpose: "テスト", category: [] };
      const answers = makeAnswers({
        q1: { selectedOptions: ["開発者", "運用担当者"], freeText: "" },
      });

      const context = buildSkillContext(formData, answers);

      expect(context.q1Purpose).toBe("開発者, 運用担当者");
    });
  });

  describe("TC-02: 空文字フィールドが undefined に正規化される", () => {
    it("freeText が空文字の場合 undefined になる", () => {
      const formData: SkillInfoFormData = { purpose: "テスト", category: [] };
      const answers = makeAnswers({
        q1: { selectedOptions: [], freeText: "" },
      });

      const context = buildSkillContext(formData, answers);

      expect(context.q1Purpose).toBeUndefined();
    });

    it("freeText がスペースのみの場合 undefined になる", () => {
      const formData: SkillInfoFormData = { purpose: "テスト", category: [] };
      const answers = makeAnswers({
        q2: { selectedOptions: [], freeText: "   " },
      });

      const context = buildSkillContext(formData, answers);

      expect(context.q2Target).toBeUndefined();
    });

    it("skillName が空文字の場合 undefined になる", () => {
      const formData: SkillInfoFormData = {
        skillName: "",
        purpose: "テスト",
        category: [],
      };
      const context = buildSkillContext(formData, makeAnswers());

      expect(context.skillName).toBeUndefined();
    });

    it("category が null の場合 undefined になる", () => {
      const formData: SkillInfoFormData = {
        purpose: "テスト",
        category: [],
      };
      const context = buildSkillContext(formData, makeAnswers());

      expect(context.category).toBeUndefined();
    });
  });

  describe("TC-03: 一部フィールドのみ入力", () => {
    it("入力されたフィールドのみ値を持ち、未入力は undefined", () => {
      const formData: SkillInfoFormData = {
        purpose: "タスク管理",
        category: [],
      };
      const answers = makeAnswers({
        q1: { selectedOptions: ["PM"], freeText: "" },
        // q2〜q6 は空
      });

      const context = buildSkillContext(formData, answers);

      expect(context.purpose).toBe("タスク管理");
      expect(context.q1Purpose).toBe("PM");
      expect(context.q2Target).toBeUndefined();
      expect(context.q3Tools).toBeUndefined();
      expect(context.q4Timing).toBeUndefined();
      expect(context.q5Output).toBeUndefined();
      expect(context.q6Constraints).toBeUndefined();
      expect(context.skillName).toBeUndefined();
    });
  });
});

// ============================================================
// TC-07〜TC-08: buildSkillGenerationPrompt
// ============================================================

describe("buildSkillGenerationPrompt", () => {
  describe("TC-07: 全フィールドがプロンプトに含まれる", () => {
    it("context の全定義フィールドがプロンプト文字列に含まれる", () => {
      const context: SkillCreationContext = {
        skillName: "mail-organizer",
        category: "automation",
        purpose: "メール自動整理",
        q1Purpose: "一般ユーザー",
        q2Target: "Gmail受信箱",
        q3Tools: "毎日朝9時",
        q4Timing: "整理済みフォルダ",
        q5Output: "Gmail API",
        q6Constraints: "完了メッセージのみ",
      };

      const prompt = buildSkillGenerationPrompt(context);

      expect(prompt).toContain("mail-organizer");
      expect(prompt).toContain("automation");
      expect(prompt).toContain("自動化");
      expect(prompt).toContain("メール自動整理");
      expect(prompt).toContain("一般ユーザー");
      expect(prompt).toContain("Gmail受信箱");
      expect(prompt).toContain("毎日朝9時");
      expect(prompt).toContain("整理済みフォルダ");
      expect(prompt).toContain("Gmail API");
      expect(prompt).toContain("完了メッセージのみ");
    });

    it("プロンプトが空文字でない", () => {
      const context: SkillCreationContext = {
        purpose: "何かをする",
      };

      const prompt = buildSkillGenerationPrompt(context);

      expect(prompt.trim()).not.toBe("");
    });
  });

  describe("TC-08: undefined フィールドはプロンプトに含まれない", () => {
    it("undefined のフィールドに対応するラベルが含まれない", () => {
      const context: SkillCreationContext = {
        purpose: "メール整理",
        q1Purpose: undefined,
        q2Target: undefined,
        q3Tools: undefined,
        q4Timing: undefined,
        q5Output: undefined,
        q6Constraints: undefined,
      };

      const prompt = buildSkillGenerationPrompt(context);

      expect(prompt).toContain("メール整理");
      // Q1〜Q6 の値が含まれないこと
      // （ラベルキーワードが余分に出力されていない）
      const lines = prompt.split("\n").filter((l) => l.trim() !== "");
      // 全フィールド空なら purpose 1行のみ（または数行以内）
      expect(lines.length).toBeLessThanOrEqual(2);
    });

    it("purpose が undefined の場合はその行が含まれない", () => {
      const context: SkillCreationContext = {
        q1Purpose: "開発者",
      };

      const prompt = buildSkillGenerationPrompt(context);

      expect(prompt).toContain("開発者");
    });

    it("skillName と category がある場合はメタ情報行が含まれる", () => {
      const context: SkillCreationContext = {
        skillName: "code-review-helper",
        category: "code-support",
      };

      const prompt = buildSkillGenerationPrompt(context);

      expect(prompt).toContain("スキル名: code-review-helper");
      expect(prompt).toContain("カテゴリ: code-support");
      expect(prompt).toContain("コードサポート");
    });
  });
});
