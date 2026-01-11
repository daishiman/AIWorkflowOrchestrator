/**
 * コミュニティ要約プロンプト テスト
 *
 * @description
 * buildCommunitySummaryPrompt関数のユニットテスト
 * TDD Green Phase: 実装後のテスト
 */

import { describe, it, expect } from "vitest";
import { buildCommunitySummaryPrompt } from "../prompts/community-summary-prompt";
import type {
  StoredEntity,
  StoredRelation,
  CommunitySummary,
  CommunitySummarizationOptions,
} from "../types";
import type {
  EntityId,
  CommunityId,
  RelationId,
} from "../../../types/rag/branded";

// Branded Type Creators
const createEntityId = (id: string): EntityId => id as EntityId;
const createCommunityId = (id: string): CommunityId => id as CommunityId;
const createRelationId = (id: string): RelationId => id as RelationId;

// Mock Data
const createMockEntity = (
  id: string,
  name: string,
  importance: number,
): StoredEntity => ({
  id: createEntityId(id),
  name,
  normalizedName: name.toLowerCase(),
  type: "technology" as any,
  description: `${name}の説明`,
  aliases: [],
  chunkIds: [],
  mentionCount: 10,
  importance,
  embedding: null,
  attributes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createMockRelation = (
  id: string,
  sourceId: string,
  targetId: string,
  relationType: string,
  weight: number,
): StoredRelation => ({
  id: createRelationId(id),
  sourceEntityId: createEntityId(sourceId),
  targetEntityId: createEntityId(targetId),
  relationType: relationType as any,
  description: `${sourceId}と${targetId}の関係`,
  weight,
  bidirectional: false,
  evidence: [],
  attributes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockEntity1 = createMockEntity("entity-1", "TypeScript", 0.9);
const mockEntity2 = createMockEntity("entity-2", "JavaScript", 0.85);

const mockRelation1 = createMockRelation(
  "relation-1",
  "entity-1",
  "entity-2",
  "SUPERSET_OF",
  0.95,
);

const mockChildSummary: CommunitySummary = {
  communityId: createCommunityId("child-1"),
  level: 0,
  summary: "子コミュニティの要約テキスト",
  keywords: ["child", "keyword"],
  mainEntities: ["ChildEntity"],
  mainRelations: ["ChildRelation"],
  sentiment: "neutral",
  confidence: 0.8,
  tokenCount: 50,
  embedding: undefined,
  createdAt: new Date(),
};

const defaultOptions: CommunitySummarizationOptions = {
  maxSummaryTokens: 200,
  maxKeywords: 10,
  summaryStyle: "concise",
  generateEmbedding: true,
  useChildSummaries: true,
};

describe("buildCommunitySummaryPrompt", () => {
  describe("エンティティリスト構築", () => {
    it("TC-P-01: エンティティリストを含むプロンプトを生成する", () => {
      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1, mockEntity2],
        [mockRelation1],
        [],
        defaultOptions,
      );

      expect(prompt).toContain("TypeScript");
      expect(prompt).toContain("JavaScript");
      expect(prompt).toContain("エンティティ一覧");
    });

    it("TC-P-02: エンティティ数が上位20件に制限される", () => {
      // 25件のエンティティを作成
      const manyEntities = Array.from({ length: 25 }, (_, i) =>
        createMockEntity(`entity-${i}`, `Entity${i}`, 1 - i * 0.01),
      );

      const prompt = buildCommunitySummaryPrompt(
        manyEntities,
        [],
        [],
        defaultOptions,
      );

      // 上位20件のみ含まれることを確認
      expect(prompt).toContain("Entity0");
      expect(prompt).toContain("Entity19");
      expect(prompt).not.toContain("Entity20");
      expect(prompt).not.toContain("Entity24");
    });

    it("エンティティがimportance降順でソートされる", () => {
      const entities = [
        createMockEntity("low", "Low", 0.3),
        createMockEntity("high", "High", 0.9),
        createMockEntity("mid", "Mid", 0.6),
      ];

      const prompt = buildCommunitySummaryPrompt(
        entities,
        [],
        [],
        defaultOptions,
      );

      const highIndex = prompt.indexOf("High");
      const midIndex = prompt.indexOf("Mid");
      const lowIndex = prompt.indexOf("Low");
      expect(highIndex).toBeLessThan(midIndex);
      expect(midIndex).toBeLessThan(lowIndex);
    });
  });

  describe("関係リスト構築", () => {
    it("TC-P-03: 関係リストを含むプロンプトを生成する", () => {
      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1, mockEntity2],
        [mockRelation1],
        [],
        defaultOptions,
      );

      expect(prompt).toContain("関係一覧");
      expect(prompt).toContain("SUPERSET_OF");
      expect(prompt).toContain("TypeScript");
      expect(prompt).toContain("JavaScript");
    });

    it("TC-P-04: 関係数が上位30件に制限される", () => {
      // 40件の関係を作成
      const manyRelations = Array.from({ length: 40 }, (_, i) =>
        createMockRelation(
          `relation-${i}`,
          "entity-1",
          "entity-2",
          `TYPE_${i}`,
          1 - i * 0.01,
        ),
      );

      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1, mockEntity2],
        manyRelations,
        [],
        defaultOptions,
      );

      // 上位30件のみ含まれることを確認
      expect(prompt).toContain("TYPE_0");
      expect(prompt).toContain("TYPE_29");
      expect(prompt).not.toContain("TYPE_30");
      expect(prompt).not.toContain("TYPE_39");
    });

    it("関係がweight降順でソートされる", () => {
      const relations = [
        createMockRelation("r1", "entity-1", "entity-2", "LOW_CONF", 0.5),
        createMockRelation("r2", "entity-1", "entity-2", "HIGH_CONF", 0.95),
        createMockRelation("r3", "entity-1", "entity-2", "MID_CONF", 0.75),
      ];

      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1, mockEntity2],
        relations,
        [],
        defaultOptions,
      );

      const highIndex = prompt.indexOf("HIGH_CONF");
      const midIndex = prompt.indexOf("MID_CONF");
      const lowIndex = prompt.indexOf("LOW_CONF");
      expect(highIndex).toBeLessThan(midIndex);
      expect(midIndex).toBeLessThan(lowIndex);
    });
  });

  describe("子コミュニティ要約セクション", () => {
    it("TC-P-05: 子コミュニティ要約を含むプロンプトを生成する", () => {
      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        [mockChildSummary],
        defaultOptions,
      );

      expect(prompt).toContain("子コミュニティの要約");
      expect(prompt).toContain("子コミュニティの要約テキスト");
    });

    it("TC-P-06: 子要約なし時はセクションを省略する", () => {
      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        [],
        defaultOptions,
      );

      expect(prompt).not.toContain("子コミュニティの要約");
    });

    it("複数の子要約が列挙される", () => {
      const childSummaries = [
        { ...mockChildSummary, summary: "子要約1" },
        {
          ...mockChildSummary,
          communityId: createCommunityId("child-2"),
          summary: "子要約2",
        },
      ];

      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        childSummaries,
        defaultOptions,
      );

      expect(prompt).toContain("子要約1");
      expect(prompt).toContain("子要約2");
    });
  });

  describe("スタイルガイド", () => {
    it("TC-P-07: detailedスタイルを適用できる", () => {
      const options: CommunitySummarizationOptions = {
        ...defaultOptions,
        summaryStyle: "detailed",
      };

      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        [],
        options,
      );

      expect(prompt).toContain("詳細で包括的な");
    });

    it("TC-P-08: conciseスタイルを適用できる", () => {
      const options: CommunitySummarizationOptions = {
        ...defaultOptions,
        summaryStyle: "concise",
      };

      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        [],
        options,
      );

      expect(prompt).toContain("簡潔で要点を押さえた");
    });

    it("TC-P-09: technicalスタイルを適用できる", () => {
      const options: CommunitySummarizationOptions = {
        ...defaultOptions,
        summaryStyle: "technical",
      };

      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        [],
        options,
      );

      expect(prompt).toContain("技術的な観点から");
    });

    it("デフォルトでconciseスタイルが適用される", () => {
      const options: CommunitySummarizationOptions = {
        ...defaultOptions,
        summaryStyle: undefined,
      };

      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        [],
        options,
      );

      expect(prompt).toContain("簡潔で要点を押さえた");
    });
  });

  describe("出力形式とオプション", () => {
    it("TC-P-10: JSON出力形式指定を含む", () => {
      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        [],
        defaultOptions,
      );

      expect(prompt).toContain("JSON形式で出力");
      expect(prompt).toContain("summary");
      expect(prompt).toContain("keywords");
      expect(prompt).toContain("mainEntities");
      expect(prompt).toContain("mainRelations");
      expect(prompt).toContain("sentiment");
      expect(prompt).toContain("confidence");
    });

    it("TC-P-11: maxSummaryTokensがプロンプトに反映される", () => {
      const options: CommunitySummarizationOptions = {
        ...defaultOptions,
        maxSummaryTokens: 300,
      };

      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        [],
        options,
      );

      expect(prompt).toContain("300トークン以内");
    });

    it("TC-P-12: maxKeywordsがプロンプトに反映される", () => {
      const options: CommunitySummarizationOptions = {
        ...defaultOptions,
        maxKeywords: 15,
      };

      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        [],
        options,
      );

      expect(prompt).toContain("最大15個");
    });
  });

  describe("注意事項", () => {
    it("注意事項セクションを含む", () => {
      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        [],
        defaultOptions,
      );

      expect(prompt).toContain("注意");
      expect(prompt).toContain("グループ全体のテーマや特徴");
      expect(prompt).toContain("キーワードは検索に使用");
    });
  });

  describe("エッジケース", () => {
    it("空のエンティティリストでもプロンプトを生成できる", () => {
      const prompt = buildCommunitySummaryPrompt(
        [],
        [mockRelation1],
        [],
        defaultOptions,
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain("エンティティ一覧");
      expect(prompt).toContain("エンティティなし");
    });

    it("空の関係リストでもプロンプトを生成できる", () => {
      const prompt = buildCommunitySummaryPrompt(
        [mockEntity1],
        [],
        [],
        defaultOptions,
      );

      expect(prompt).toBeDefined();
      expect(prompt).toContain("関係一覧");
      expect(prompt).toContain("関係なし");
    });

    it("説明なしのエンティティを適切に処理する", () => {
      const entityWithoutDescription: StoredEntity = {
        ...mockEntity1,
        description: null,
      };

      const prompt = buildCommunitySummaryPrompt(
        [entityWithoutDescription],
        [],
        [],
        defaultOptions,
      );

      expect(prompt).toContain("説明なし");
    });
  });
});
