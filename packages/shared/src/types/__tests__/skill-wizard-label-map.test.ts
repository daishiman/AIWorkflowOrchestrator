import { describe, expect, it } from "vitest";
import {
  SEMANTIC_LABEL_MAP,
  resolveLabelEntry,
  resolveSemanticLabel,
} from "../skill-wizard-label-map";

describe("resolveLabelEntry", () => {
  describe("q5（外部ツール連携）の変換", () => {
    it("notion を 'その他' ラベルと 'Notion' freeText に変換する", () => {
      // AC-1: notion 変換が SEMANTIC_LABEL_MAP 経由で動作すること
      expect(resolveLabelEntry("notion", "q5")).toEqual({
        label: "その他",
        freeText: "Notion",
      });
    });

    it("slack を 'Slack' ラベルに変換する（freeText なし）", () => {
      expect(resolveLabelEntry("slack", "q5")).toEqual({
        label: "Slack",
      });
    });

    it("github を 'GitHub' ラベルに変換する（freeText なし）", () => {
      expect(resolveLabelEntry("github", "q5")).toEqual({
        label: "GitHub",
      });
    });

    it("未登録の値はラベルとしてそのまま返す", () => {
      expect(resolveLabelEntry("zapier", "q5")).toEqual({
        label: "zapier",
      });
    });

    it("未登録の大文字表記は元の表記を保って返す", () => {
      expect(resolveLabelEntry("Jira", "q5")).toEqual({
        label: "Jira",
      });
    });
  });

  describe("undefined / 未登録ケース", () => {
    it("undefined を渡した場合は undefined を返す", () => {
      expect(resolveLabelEntry(undefined, "q5")).toBeUndefined();
    });

    it("未登録の questionId の場合はラベルとしてそのまま返す", () => {
      expect(resolveLabelEntry("some-value", "q99")).toEqual({
        label: "some-value",
      });
    });
  });

  describe("カスタム labelMap", () => {
    it("カスタム labelMap を受け取り変換する", () => {
      const customMap = {
        q99: { "test-value": { label: "テスト", freeText: "TestFree" } },
      };
      expect(resolveLabelEntry("test-value", "q99", customMap)).toEqual({
        label: "テスト",
        freeText: "TestFree",
      });
    });
  });
});

describe("resolveSemanticLabel", () => {
  describe("既存変換の後方互換性", () => {
    it("q1 の '自分だけ' を '自分のみ' ラベルに変換する", () => {
      expect(resolveSemanticLabel("自分だけ", "q1")).toBe("自分のみ");
    });

    it("q3 の 'scheduled' を '定期実行' ラベルに変換する", () => {
      expect(resolveSemanticLabel("scheduled", "q3")).toBe("定期実行");
    });

    it("q6 の '週次' を '週に1回' ラベルに変換する", () => {
      expect(resolveSemanticLabel("週次", "q6")).toBe("週に1回");
    });

    it("notion を 'その他' ラベルに変換する（freeText は含まない）", () => {
      expect(resolveSemanticLabel("notion", "q5")).toBe("その他");
    });

    it("未登録の大文字表記は元の表記を保って返す", () => {
      expect(resolveSemanticLabel("Jira", "q5")).toBe("Jira");
    });

    it("undefined を渡した場合は undefined を返す", () => {
      expect(resolveSemanticLabel(undefined, "q1")).toBeUndefined();
    });
  });
});

describe("SEMANTIC_LABEL_MAP", () => {
  it("q5.notion が { label, freeText } オブジェクト型エントリを持つ", () => {
    expect(SEMANTIC_LABEL_MAP.q5.notion).toEqual({
      label: "その他",
      freeText: "Notion",
    });
  });

  it("q5.slack が string エントリを持つ", () => {
    expect(SEMANTIC_LABEL_MAP.q5.slack).toBe("Slack");
  });
});
