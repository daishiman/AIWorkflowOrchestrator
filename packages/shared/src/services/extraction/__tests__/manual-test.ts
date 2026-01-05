/**
 * 手動テスト用スクリプト
 * @description RuleBasedEntityExtractor の動作確認
 *
 * 実行方法:
 * npx ts-node src/services/extraction/__tests__/manual-test.ts
 * または vitest で実行
 */

import { describe, it, expect } from "vitest";
import { RuleBasedEntityExtractor } from "../rule-based-extractor";
import type { Chunk } from "../../chunking/types";

// テスト用チャンク生成
const createChunk = (content: string, id: string = "test-chunk-1"): Chunk => ({
  id,
  content,
  tokenCount: content.split(/\s+/).length,
  position: { start: 0, end: content.length },
  metadata: { strategy: "fixed" as const },
});

describe("手動テスト - RuleBasedEntityExtractor", () => {
  const extractor = new RuleBasedEntityExtractor();

  describe("技術系テキストからの抽出", () => {
    it("プログラミング言語とフレームワークを抽出", async () => {
      const chunk = createChunk(`
        このプロジェクトではTypeScriptとReactを使用しています。
        バックエンドはNode.jsで構築し、データベースにはPostgreSQLを採用しました。
        テストフレームワークはVitest、ビルドツールにはViteを使用しています。
      `);

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        console.log("\n=== 技術系テキスト抽出結果 ===");
        console.log(`抽出エンティティ数: ${result.data.entities.length}`);
        result.data.entities.forEach((e) => {
          console.log(`  - ${e.name} (${e.type}, confidence: ${e.confidence})`);
        });

        const names = result.data.entities.map((e) => e.normalizedName);
        expect(names).toContain("typescript");
        expect(names).toContain("react");
        expect(names).toContain("node.js");
        expect(names).toContain("postgresql");
      }
    });
  });

  describe("組織名の抽出", () => {
    it("テック企業名を抽出", async () => {
      const chunk = createChunk(`
        MicrosoftはTypeScriptを開発しました。
        GoogleはAngularを、MetaはReactを開発しています。
        OpenAIとAnthropicはAI研究で知られています。
      `);

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        console.log("\n=== 組織名抽出結果 ===");
        const orgs = result.data.entities.filter(
          (e) => e.type === "organization",
        );
        console.log(`抽出組織数: ${orgs.length}`);
        orgs.forEach((e) => {
          console.log(`  - ${e.name} (mentions: ${e.mentions.length})`);
        });

        const names = orgs.map((e) => e.normalizedName);
        expect(names).toContain("microsoft");
        expect(names).toContain("google");
      }
    });
  });

  describe("日付の抽出", () => {
    it("複数形式の日付を抽出", async () => {
      const chunk = createChunk(`
        プロジェクトは2024-01-15に開始しました。
        次のマイルストーンは2024年3月31日です。
        最終リリースは2024/12/25を予定しています。
      `);

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        console.log("\n=== 日付抽出結果 ===");
        const dates = result.data.entities.filter((e) => e.type === "date");
        console.log(`抽出日付数: ${dates.length}`);
        dates.forEach((e) => {
          console.log(
            `  - ${e.name} (position: ${e.mentions[0]?.startPosition})`,
          );
        });

        expect(dates.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe("メンション情報", () => {
    it("同一エンティティの複数出現を追跡", async () => {
      const chunk = createChunk(`
        ReactはUIライブラリです。Reactは2013年にリリースされました。
        多くの企業がReactを採用しています。
      `);

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        console.log("\n=== メンション追跡結果 ===");
        const react = result.data.entities.find(
          (e) => e.normalizedName === "react",
        );
        if (react) {
          console.log(`React の出現回数: ${react.mentions.length}`);
          react.mentions.forEach((m, i) => {
            console.log(
              `  ${i + 1}. 位置: ${m.startPosition}-${m.endPosition}`,
            );
            console.log(`     コンテキスト: "${m.context.slice(0, 50)}..."`);
          });
        }

        expect(react?.mentions.length).toBe(3);
      }
    });
  });

  describe("フィルタリング機能", () => {
    it("タイプフィルタで技術のみ抽出", async () => {
      const chunk = createChunk(`
        MicrosoftがTypeScriptを2024-01-15にリリース。
        GoogleはReact代替としてAngularを提供。
      `);

      const result = await extractor.extract(chunk, { types: ["technology"] });

      expect(result.success).toBe(true);
      if (result.success) {
        console.log("\n=== タイプフィルタ結果（技術のみ） ===");
        console.log(`抽出数: ${result.data.entities.length}`);
        result.data.entities.forEach((e) => {
          console.log(`  - ${e.name} (${e.type})`);
        });

        expect(result.data.entities.every((e) => e.type === "technology")).toBe(
          true,
        );
      }
    });
  });

  describe("パフォーマンス", () => {
    it("処理時間が記録される", async () => {
      const chunk = createChunk("TypeScript and React development.");

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        console.log("\n=== パフォーマンス計測 ===");
        console.log(`処理時間: ${result.data.processingTimeMs.toFixed(2)}ms`);
        console.log(`使用モデル: ${result.data.modelUsed}`);

        expect(result.data.processingTimeMs).toBeGreaterThanOrEqual(0);
        expect(result.data.processingTimeMs).toBeLessThan(1000); // 1秒以内
      }
    });
  });
});
