import { describe, expect, it } from "vitest";
import { inferSmartDefaults, type SkillInfoFormData } from "@repo/shared";

const base: SkillInfoFormData = {
  skillName: "テストスキル",
  purpose: "",
  category: null,
};

describe("inferSmartDefaults", () => {
  // --- ツール推論 ---
  describe("ツール推論", () => {
    it("purpose に 'Slack' を含む場合、tool = 'slack' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "Slack通知を送る",
      });
      expect(result.tool).toBe("slack");
    });

    it("purpose に 'GitHub' を含む場合、tool = 'github' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "GitHubのPRをレビューする",
      });
      expect(result.tool).toBe("github");
    });

    it("purpose に 'Notion' を含む場合、tool = 'notion' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "Notionにページを作成する",
      });
      expect(result.tool).toBe("notion");
    });

    it("ツール名が含まれない場合、tool = null を返すこと（AC-4 フォールバック）", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "汎用的なタスクを実行する",
      });
      expect(result.tool).toBeNull();
    });

    // エッジケース（Phase 6 で追加）
    it("purpose に 'Slack' と 'GitHub' 両方含む場合、先に一致した 'slack' が採用されること（先勝ちルール）", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "Slack と GitHub を使う",
      });
      expect(result.tool).toBe("slack");
    });

    it("purpose に 'slack'（小文字）が含まれる場合、tool = null を返すこと（大文字小文字を区別する）", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "slack通知を送る",
      });
      expect(result.tool).toBeNull();
    });

    it("purpose に 'SlackBot' が含まれる場合、tool = 'slack' を返すこと（部分一致）", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "SlackBotを作成する",
      });
      expect(result.tool).toBe("slack");
    });

    it("purpose が null の場合、tool = null を返すこと（エラーにならない）", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: null as unknown as string,
      });
      expect(result.tool).toBeNull();
    });
  });

  // --- タイミング推論 ---
  describe("タイミング推論", () => {
    it("purpose に '毎日' を含む場合、timing = 'scheduled' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "毎日レポートを生成する",
      });
      expect(result.timing).toBe("scheduled");
    });

    it("purpose に '毎週' を含む場合、timing = 'scheduled' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "毎週サマリーを送る",
      });
      expect(result.timing).toBe("scheduled");
    });

    it("purpose に '定期' を含む場合、timing = 'scheduled' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "定期的に実行する",
      });
      expect(result.timing).toBe("scheduled");
    });

    it("purpose に 'スケジュール' を含む場合、timing = 'scheduled' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "スケジュール実行する",
      });
      expect(result.timing).toBe("scheduled");
    });

    it("purpose に 'リアルタイム' を含む場合、timing = 'realtime' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "リアルタイムで通知する",
      });
      expect(result.timing).toBe("realtime");
    });

    it("purpose に '即座' を含む場合、timing = 'realtime' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "即座に処理する",
      });
      expect(result.timing).toBe("realtime");
    });

    it("purpose に 'すぐに' を含む場合、timing = 'realtime' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "すぐに実行する",
      });
      expect(result.timing).toBe("realtime");
    });

    it("タイミングキーワードが含まれない場合、timing = null を返すこと（AC-4 フォールバック）", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "コードを解析する",
      });
      expect(result.timing).toBeNull();
    });

    it("purpose に '毎日' と 'リアルタイム' 両方含む場合、先に一致した 'scheduled' が採用されること（先勝ちルール）", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "毎日リアルタイムで処理する",
      });
      expect(result.timing).toBe("scheduled");
    });
  });

  // --- フォーマット推論 ---
  describe("フォーマット推論", () => {
    it("category = 'code-support' の場合、format = 'code' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        category: "code-support",
      });
      expect(result.format).toBe("code");
    });

    it("category = 'data-analysis' の場合、format = 'structured' を推論すること", () => {
      const result = inferSmartDefaults({
        ...base,
        category: "data-analysis",
      });
      expect(result.format).toBe("structured");
    });

    it("category が null の場合、format = null を返すこと（AC-4 フォールバック）", () => {
      const result = inferSmartDefaults({ ...base, category: null });
      expect(result.format).toBeNull();
    });

    it("category が undefined の場合、format = null を返すこと", () => {
      const result = inferSmartDefaults({
        ...base,
        category: undefined as unknown as null,
      });
      expect(result.format).toBeNull();
    });

    it("category が 'automation' の場合、format = null を返すこと", () => {
      const result = inferSmartDefaults({
        ...base,
        category: "automation",
      });
      expect(result.format).toBeNull();
    });

    it("category が '' 空文字の場合、format = null を返すこと", () => {
      const result = inferSmartDefaults({
        ...base,
        category: "" as unknown as null,
      });
      expect(result.format).toBeNull();
    });
  });

  // --- inferenceLog ---
  describe("inferenceLog", () => {
    it("推論が1件の場合、inferenceLog に1件の記録が含まれること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "Slack通知を送る",
      });
      expect(result.inferenceLog).toHaveLength(1);
      expect(result.inferenceLog?.[0]).toContain("slack");
    });

    it("推論が0件の場合、inferenceLog は空配列 [] を返すこと（AC-4 フォールバック）", () => {
      const result = inferSmartDefaults({ ...base, purpose: "" });
      expect(result.inferenceLog).toEqual([]);
    });

    it("ツール+タイミング+フォーマット全て推論できた場合、inferenceLog に3件の記録が含まれること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "毎日Slackに通知を送る",
        category: "code-support",
      });
      expect(result.inferenceLog).toHaveLength(3);
    });

    it("inferenceLog の各エントリが対応するフィールド名を含むこと", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "毎日Slackに通知を送る",
        category: "data-analysis",
      });
      const log = result.inferenceLog ?? [];
      expect(log.some((entry) => entry.includes("slack"))).toBe(true);
      expect(log.some((entry) => entry.includes("scheduled"))).toBe(true);
      expect(log.some((entry) => entry.includes("structured"))).toBe(true);
    });
  });

  // --- フォールバック（AC-4） ---
  describe("フォールバック（AC-4）", () => {
    it("purpose が空文字の場合、tool/timing が null を返すこと（category は独立推論を継続）", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "",
        category: "code-support",
      });
      expect(result.tool).toBeNull();
      expect(result.timing).toBeNull();
      expect(result.format).toBe("code");
      expect(result.inferenceLog).toEqual([
        "category = 'code-support' → format = 'code'",
      ]);
    });

    it("purpose が undefined の場合、全フィールドが null を返すこと", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: undefined as unknown as string,
      });
      expect(result.tool).toBeNull();
      expect(result.timing).toBeNull();
      expect(result.format).toBeNull();
    });

    it("purpose が空白のみの場合、空文字と同様に tool/timing は null で category は独立推論されること", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "   ",
        category: "code-support",
      });
      expect(result.tool).toBeNull();
      expect(result.timing).toBeNull();
      expect(result.format).toBe("code");
      expect(result.inferenceLog).toEqual([
        "category = 'code-support' → format = 'code'",
      ]);
    });
  });

  // --- 組み合わせテスト（AC-2） ---
  describe("組み合わせテスト（AC-2）", () => {
    it("purpose='毎日Slackに通知を送る', category='automation' → tool='slack', timing='scheduled', format=null", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "毎日Slackに通知を送る",
        category: "automation",
      });
      expect(result.tool).toBe("slack");
      expect(result.timing).toBe("scheduled");
      expect(result.format).toBeNull();
    });

    it("purpose='コードをリアルタイムでレビューする', category='code-support' → tool=null, timing='realtime', format='code'", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "コードをリアルタイムでレビューする",
        category: "code-support",
      });
      expect(result.tool).toBeNull();
      expect(result.timing).toBe("realtime");
      expect(result.format).toBe("code");
    });

    it("purpose='Notionにデータを毎週記録する', category='data-analysis' → tool='notion', timing='scheduled', format='structured'", () => {
      const result = inferSmartDefaults({
        ...base,
        purpose: "Notionにデータを毎週記録する",
        category: "data-analysis",
      });
      expect(result.tool).toBe("notion");
      expect(result.timing).toBe("scheduled");
      expect(result.format).toBe("structured");
    });
  });
});
