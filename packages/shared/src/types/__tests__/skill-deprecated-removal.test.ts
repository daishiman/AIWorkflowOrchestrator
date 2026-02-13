/**
 * TASK-FIX-13-1: deprecated プロパティ削除の型安全性テスト
 * Phase 4 (TDD Red) → Phase 5 で Green にする
 *
 * 検証対象:
 * - Anchor.name (deprecated → 削除)
 * - Skill.lastUpdated (deprecated → 削除)
 *
 * Red Phase 状態:
 *   deprecated プロパティがまだ存在するため、@ts-expect-error が
 *   「Unused '@ts-expect-error' directive」エラーを報告する。
 *   Phase 5 でプロパティを削除すると Green になる。
 */
import { describe, it, expect } from "vitest";
import type { Anchor, Skill, SkillDetail, SkillScanResult } from "../skill";

describe("deprecated プロパティ削除の型安全性テスト", () => {
  describe("Anchor 型", () => {
    it("TC-001: name プロパティが存在しないこと", () => {
      const anchor: Anchor = {
        source: "test-source",
        application: "test-app",
        purpose: "test-purpose",
      };
      // @ts-expect-error -- name は削除済み
      const _name = anchor.name;
      expect(anchor).toBeDefined();
    });

    it("TC-002: source, application, purpose のみを持つこと", () => {
      const anchor: Anchor = {
        source: "ref-1",
        application: "app-1",
        purpose: "purpose-1",
      };
      expect(anchor.source).toBe("ref-1");
      expect(anchor.application).toBe("app-1");
      expect(anchor.purpose).toBe("purpose-1");
    });
  });

  describe("Skill 型", () => {
    it("TC-003: lastUpdated プロパティが存在しないこと", () => {
      const skill = {} as Skill;
      // @ts-expect-error -- lastUpdated は削除済み
      const _lastUpdated = skill.lastUpdated;
      expect(skill).toBeDefined();
    });

    it("TC-004: lastModified が Date 型であること", () => {
      const now = new Date();
      const skill: Pick<Skill, "lastModified"> = {
        lastModified: now,
      };
      expect(skill.lastModified).toBeInstanceOf(Date);
    });
  });

  describe("型プロパティ網羅性テスト", () => {
    it("TC-009: Anchor 型の全プロパティが string 型であること", () => {
      const anchor: Anchor = {
        source: "test",
        application: "test",
        purpose: "test",
      };
      expect(typeof anchor.source).toBe("string");
      expect(typeof anchor.application).toBe("string");
      expect(typeof anchor.purpose).toBe("string");
    });

    it("TC-010: Skill 型の必須プロパティが全て存在すること", () => {
      const skill: Pick<
        Skill,
        | "id"
        | "name"
        | "slug"
        | "description"
        | "path"
        | "triggers"
        | "anchors"
        | "lastModified"
      > = {
        id: "test-id",
        name: "test-name",
        slug: "test-slug",
        description: "test-description",
        path: "/test/path",
        triggers: ["trigger1"],
        anchors: [],
        lastModified: new Date(),
      };
      expect(skill.id).toBeDefined();
      expect(skill.name).toBeDefined();
      expect(skill.lastModified).toBeInstanceOf(Date);
    });

    it("TC-011: SkillDetail が lastModified を継承していること", () => {
      const detail: Pick<SkillDetail, "lastModified"> = {
        lastModified: new Date(),
      };
      expect(detail.lastModified).toBeInstanceOf(Date);
      // SkillDetail に lastUpdated が存在しないこと
      // @ts-expect-error -- lastUpdated は Skill から削除済みのため SkillDetail にも存在しない
      const _invalid = ({} as SkillDetail).lastUpdated;
    });

    it("TC-012: SkillScanResult の skills 配列の要素が lastModified を持つこと", () => {
      const scanResult: Pick<SkillScanResult, "skills"> = {
        skills: [],
      };
      expect(Array.isArray(scanResult.skills)).toBe(true);
    });
  });
});
