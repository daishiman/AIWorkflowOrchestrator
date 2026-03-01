import { describe, it, expect } from "vitest";
import {
  validateNaLogEntry,
  validateNaLogEntries,
  type NaLogEntry,
} from "../na-log-validator";

describe("na-log-validator", () => {
  // ================================================
  // validateNaLogEntry: 正常系
  // ================================================
  describe("validateNaLogEntry - 正常系", () => {
    it("status=更新 の正常エントリをPASSにする", () => {
      const entry: NaLogEntry = {
        specName: "task-workflow.md",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-A",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("status=N/A の正常エントリ（理由・代替証跡あり）をPASSにする", () => {
      const entry: NaLogEntry = {
        specName: "security-api-electron.md",
        status: "N/A",
        reason: "本タスクにセキュリティ変更なし",
        alternativeEvidence: "Phase 10レビュー結果で確認済み",
        updatedBy: "SubAgent-C",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("updatedBy=leader をPASSにする", () => {
      const entry: NaLogEntry = {
        specName: "LOGS.md",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "leader",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("全SubAgent識別子（A〜E）をPASSにする", () => {
      const agents = [
        "SubAgent-A",
        "SubAgent-B",
        "SubAgent-C",
        "SubAgent-D",
        "SubAgent-E",
      ];
      for (const agent of agents) {
        const entry: NaLogEntry = {
          specName: "test-spec.md",
          status: "更新",
          reason: "",
          alternativeEvidence: "",
          updatedBy: agent,
        };
        const result = validateNaLogEntry(entry);
        expect(result.isValid).toBe(true);
      }
    });
  });

  // ================================================
  // validateNaLogEntry: 異常系 - specName
  // ================================================
  describe("validateNaLogEntry - specName バリデーション", () => {
    it("specName が空文字列の場合にFAILする", () => {
      const entry: NaLogEntry = {
        specName: "",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-A",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining("specName"));
    });

    it("specName が空白のみの場合にFAILする（P42対策: trim）", () => {
      const entry: NaLogEntry = {
        specName: "   ",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-A",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining("specName"));
    });
  });

  // ================================================
  // validateNaLogEntry: 異常系 - status
  // ================================================
  describe("validateNaLogEntry - status バリデーション", () => {
    it("status が無効な値の場合にFAILする", () => {
      const entry = {
        specName: "test.md",
        status: "invalid" as "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-A",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining("status"));
    });
  });

  // ================================================
  // validateNaLogEntry: 異常系 - N/A の reason・alternativeEvidence
  // ================================================
  describe("validateNaLogEntry - N/A判定の必須フィールド", () => {
    it("TC-05: N/A判定で reason が空文字列の場合にFAILする", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "N/A",
        reason: "",
        alternativeEvidence: "代替証跡あり",
        updatedBy: "SubAgent-A",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining("reason"));
    });

    it("N/A判定で reason が空白のみの場合にFAILする（P42対策）", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "N/A",
        reason: "   ",
        alternativeEvidence: "代替証跡あり",
        updatedBy: "SubAgent-B",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining("reason"));
    });

    it("N/A判定で alternativeEvidence が空文字列の場合にFAILする", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "N/A",
        reason: "理由あり",
        alternativeEvidence: "",
        updatedBy: "SubAgent-C",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining("alternativeEvidence"),
      );
    });

    it("N/A判定で alternativeEvidence が空白のみの場合にFAILする（P42対策）", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "N/A",
        reason: "理由あり",
        alternativeEvidence: "   ",
        updatedBy: "SubAgent-D",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining("alternativeEvidence"),
      );
    });

    it("N/A判定で reason と alternativeEvidence の両方が空の場合に2つのエラーを返す", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "N/A",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-E",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });

    it("更新の場合は reason と alternativeEvidence が空でもPASSする", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-A",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(true);
    });
  });

  // ================================================
  // validateNaLogEntry: 異常系 - updatedBy
  // ================================================
  describe("validateNaLogEntry - updatedBy バリデーション", () => {
    it("updatedBy が許可値リストにない場合にFAILする", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-F",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining("updatedBy"),
      );
    });

    it("updatedBy が空文字列の場合にFAILする", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining("updatedBy"),
      );
    });
  });

  // ================================================
  // validateNaLogEntries: 複数エントリ
  // ================================================
  describe("validateNaLogEntries", () => {
    it("TC-01: 空配列の場合にFAILする（ログ未記載）", () => {
      const result = validateNaLogEntries([]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining("0件"));
    });

    it("全エントリが正常な場合にPASSする", () => {
      const entries: NaLogEntry[] = [
        {
          specName: "task-workflow.md",
          status: "更新",
          reason: "",
          alternativeEvidence: "",
          updatedBy: "SubAgent-D",
        },
        {
          specName: "security-api-electron.md",
          status: "N/A",
          reason: "セキュリティ変更なし",
          alternativeEvidence: "Phase 10で確認",
          updatedBy: "SubAgent-C",
        },
      ];
      const result = validateNaLogEntries(entries);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("一部エントリにエラーがある場合にFAILし、エントリ番号付きエラーを返す", () => {
      const entries: NaLogEntry[] = [
        {
          specName: "valid.md",
          status: "更新",
          reason: "",
          alternativeEvidence: "",
          updatedBy: "SubAgent-A",
        },
        {
          specName: "",
          status: "N/A",
          reason: "",
          alternativeEvidence: "",
          updatedBy: "SubAgent-B",
        },
      ];
      const result = validateNaLogEntries(entries);
      expect(result.isValid).toBe(false);
      // エントリ番号[2]が含まれること
      expect(result.errors.some((e) => e.startsWith("[2]"))).toBe(true);
    });

    it("複数エントリにエラーがある場合に全エラーを結合して返す", () => {
      const entries: NaLogEntry[] = [
        {
          specName: "",
          status: "更新",
          reason: "",
          alternativeEvidence: "",
          updatedBy: "SubAgent-A",
        },
        {
          specName: "test.md",
          status: "N/A",
          reason: "",
          alternativeEvidence: "",
          updatedBy: "invalid",
        },
      ];
      const result = validateNaLogEntries(entries);
      expect(result.isValid).toBe(false);
      // エントリ[1]と[2]のエラーが含まれる
      expect(result.errors.some((e) => e.startsWith("[1]"))).toBe(true);
      expect(result.errors.some((e) => e.startsWith("[2]"))).toBe(true);
    });
  });

  // ================================================
  // Phase 6 追加テスト: 境界値・大量データ・部分無効
  // ================================================
  describe("Phase 6 追加: 境界値テスト", () => {
    it("TC-05-B1: reason が1文字の場合にPASSする", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "N/A",
        reason: "a",
        alternativeEvidence: "証跡あり",
        updatedBy: "SubAgent-A",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("TC-05-B2: reason がスペースのみの場合にFAILする（P42対策: trim検証）", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "N/A",
        reason: "   ",
        alternativeEvidence: "証跡あり",
        updatedBy: "SubAgent-B",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining("reason"));
      expect(result.errors).toContainEqual(expect.stringContaining("空白のみ"));
    });

    it("TC-05-B3: alternativeEvidence が空白文字列のみの場合にFAILする", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "N/A",
        reason: "理由あり",
        alternativeEvidence: " \t ",
        updatedBy: "SubAgent-C",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining("alternativeEvidence"),
      );
    });

    it("TC-05-B4: status が '更新' で reason が空の場合にPASSする（更新は理由不要）", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-D",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(true);
    });

    it("TC-05-B5: specName がスペースのみの場合にFAILする（P42: trim空チェック）", () => {
      const entry: NaLogEntry = {
        specName: "   ",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-A",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining("specName"));
      expect(result.errors).toContainEqual(expect.stringContaining("空白のみ"));
    });

    it("TC-05-B6: updatedBy が不正値（SubAgent-F）の場合にFAILする", () => {
      const entry: NaLogEntry = {
        specName: "test.md",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-F",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining("updatedBy"),
      );
    });

    it("TC-05-B7: status が不正値（'スキップ'）の場合にFAILする", () => {
      const entry = {
        specName: "test.md",
        status: "スキップ" as "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "SubAgent-A",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining("status"));
      expect(result.errors).toContainEqual(expect.stringContaining("スキップ"));
    });

    it("TC-05-B8: 全フィールドが有効なN/Aエントリの場合にPASSする", () => {
      const entry: NaLogEntry = {
        specName: "architecture-overview.md",
        status: "N/A",
        reason: "本タスクにアーキテクチャ変更なし",
        alternativeEvidence: "Phase 10レビュー結果で確認済み",
        updatedBy: "SubAgent-E",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("TC-05-B9: 全フィールドが有効な更新エントリの場合にPASSする", () => {
      const entry: NaLogEntry = {
        specName: "task-workflow.md",
        status: "更新",
        reason: "",
        alternativeEvidence: "",
        updatedBy: "leader",
      };
      const result = validateNaLogEntry(entry);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("TC-05-B10: entries配列が空の場合にFAILする（少なくとも1エントリ必須）", () => {
      const result = validateNaLogEntries([]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining("0件"));
    });
  });

  describe("Phase 6 追加: 大量エントリのバリデーション", () => {
    it("10件以上の有効エントリを一括バリデーションしてPASSする", () => {
      const entries: NaLogEntry[] = Array.from({ length: 15 }, (_, i) => ({
        specName: `spec-${i + 1}.md`,
        status: i % 2 === 0 ? ("更新" as const) : ("N/A" as const),
        reason: i % 2 === 0 ? "" : `理由${i + 1}`,
        alternativeEvidence: i % 2 === 0 ? "" : `証跡${i + 1}`,
        updatedBy: `SubAgent-${String.fromCharCode(65 + (i % 5))}`,
      }));
      const result = validateNaLogEntries(entries);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("有効3件+無効1件を含む配列の場合にFAILし、無効エントリ番号を特定する", () => {
      const entries: NaLogEntry[] = [
        {
          specName: "valid-1.md",
          status: "更新",
          reason: "",
          alternativeEvidence: "",
          updatedBy: "SubAgent-A",
        },
        {
          specName: "valid-2.md",
          status: "N/A",
          reason: "理由あり",
          alternativeEvidence: "証跡あり",
          updatedBy: "SubAgent-B",
        },
        {
          specName: "",
          status: "N/A",
          reason: "",
          alternativeEvidence: "",
          updatedBy: "invalid-agent",
        },
        {
          specName: "valid-3.md",
          status: "更新",
          reason: "",
          alternativeEvidence: "",
          updatedBy: "SubAgent-C",
        },
      ];
      const result = validateNaLogEntries(entries);
      expect(result.isValid).toBe(false);
      // 3番目のエントリ（[3]）にエラーがある
      expect(result.errors.some((e) => e.startsWith("[3]"))).toBe(true);
      // 1, 2, 4番目のエントリにはエラーがない
      expect(result.errors.some((e) => e.startsWith("[1]"))).toBe(false);
      expect(result.errors.some((e) => e.startsWith("[2]"))).toBe(false);
      expect(result.errors.some((e) => e.startsWith("[4]"))).toBe(false);
    });
  });
});
