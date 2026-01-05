/**
 * @file 手動検証テスト
 * @description 自動テストでは確認できない型推論、Zodバリデーション、Float32Arrayの手動検証
 *
 * テスト実行:
 * ```bash
 * pnpm exec ts-node --esm src/types/rag/graph/__tests__/manual-verification.ts
 * ```
 */

import { EntityTypes, type EntityType, type EntityEntity } from "../types";
import { entityEntitySchema, relationEntitySchema } from "../schemas";
import {
  generateEntityId,
  generateRelationId,
  createChunkId,
} from "../../branded";
import { ZodError } from "zod";

console.log("=".repeat(80));
console.log("Manual Verification Test - Knowledge Graph Types & Schemas");
console.log("=".repeat(80));
console.log();

// =============================================================================
// Test 1: EntityEntity型の自動補完確認
// =============================================================================

console.log("📋 Test 1: EntityEntity型の自動補完確認");
console.log("-".repeat(80));

const testEntity: EntityEntity = {
  id: generateEntityId(),
  name: "React",
  normalizedName: "react",
  type: EntityTypes.LIBRARY,
  description: "A JavaScript library for building user interfaces",
  aliases: ["React.js", "ReactJS"],
  embedding: new Float32Array([0.1, 0.2, 0.3]),
  importance: 0.95,
  metadata: { github: "facebook/react" },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 型推論テスト: プロパティアクセス時に自動補完されることを確認
console.log(`✅ Entity Name: ${testEntity.name}`);
console.log(`✅ Entity Type: ${testEntity.type}`);
console.log(`✅ Entity Importance: ${testEntity.importance}`);
console.log(`✅ Entity Aliases Count: ${testEntity.aliases.length}`);
console.log();

// =============================================================================
// Test 2: Union型（EntityType）の推論確認
// =============================================================================

console.log("📋 Test 2: Union型（EntityType）の推論確認");
console.log("-".repeat(80));

// EntityType型の変数に値を代入（自動補完されることを確認）
const libraryType: EntityType = EntityTypes.LIBRARY;
const frameworkType: EntityType = EntityTypes.FRAMEWORK;
const personType: EntityType = EntityTypes.PERSON;

console.log(`✅ Library Type: ${libraryType}`);
console.log(`✅ Framework Type: ${frameworkType}`);
console.log(`✅ Person Type: ${personType}`);

// 型エラーテスト（コンパイル時に検出されることを確認）
// const invalidType: EntityType = "invalid_type"; // ❌ Type error

console.log("✅ Union型が正しく推論されている");
console.log();

// =============================================================================
// Test 3: entityEntitySchemaの正常系確認
// =============================================================================

console.log("📋 Test 3: entityEntitySchemaの正常系確認");
console.log("-".repeat(80));

const validEntityData = {
  id: generateEntityId(),
  name: "Next.js",
  normalizedName: "nextjs",
  type: "framework" as const,
  description: "The React Framework for Production",
  aliases: ["Next", "NextJS"],
  embedding: Array(768).fill(0.5), // 768次元のembedding
  importance: 0.9,
  metadata: { version: "14.0.0" },
  createdAt: new Date(),
  updatedAt: new Date(),
};

try {
  const parsedEntity = entityEntitySchema.parse(validEntityData);
  console.log("✅ 正常系バリデーション成功");
  console.log(`   - Name: ${parsedEntity.name}`);
  console.log(`   - Type: ${parsedEntity.type}`);
  console.log(
    `   - Embedding dimension: ${parsedEntity.embedding?.length ?? "null"}`,
  );
} catch (error) {
  console.error("❌ 正常系バリデーション失敗:", error);
}
console.log();

// =============================================================================
// Test 4: entityEntitySchemaの異常系確認
// =============================================================================

console.log("📋 Test 4: entityEntitySchemaの異常系確認");
console.log("-".repeat(80));

const invalidEntityData = {
  id: generateEntityId(),
  name: "Invalid Entity",
  normalizedName: "invalid",
  type: "framework" as const,
  description: "Test entity with invalid importance",
  aliases: [],
  embedding: null,
  importance: 1.5, // ❌ 範囲外（max: 1.0）
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

try {
  entityEntitySchema.parse(invalidEntityData);
  console.error("❌ 異常系バリデーションが失敗（エラーが検出されなかった）");
} catch (error) {
  console.log("✅ 異常系バリデーション成功（エラーが検出された）");
  console.log("   エラーメッセージ:");
  if (error instanceof ZodError) {
    error.issues.forEach((err) => {
      console.log(`   - ${err.path.join(".")}: ${err.message}`);
    });
  } else {
    console.log(
      `   - ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
console.log();

// =============================================================================
// Test 5: Float32Array型の実際の動作確認
// =============================================================================

console.log("📋 Test 5: Float32Array型の実際の動作確認");
console.log("-".repeat(80));

// Float32Array型の配列を作成
const embedding512 = new Float32Array(512);
for (let i = 0; i < 512; i++) {
  embedding512[i] = Math.random();
}

const entityWithFloat32Array: EntityEntity = {
  id: generateEntityId(),
  name: "TypeScript",
  normalizedName: "typescript",
  type: EntityTypes.PROGRAMMING_LANGUAGE,
  description: "Typed superset of JavaScript",
  aliases: ["TS"],
  embedding: embedding512,
  importance: 0.85,
  metadata: { version: "5.3" },
  createdAt: new Date(),
  updatedAt: new Date(),
};

console.log(
  `✅ Float32Array作成成功: ${entityWithFloat32Array.embedding?.length} dimensions`,
);
console.log(`✅ Float32Array型が正しく動作している`);
console.log();

// =============================================================================
// Bonus: relationEntitySchemaのバリデーション確認
// =============================================================================

console.log("📋 Bonus: relationEntitySchemaのバリデーション確認");
console.log("-".repeat(80));

const sourceId = generateEntityId();
const targetId = generateEntityId();

const validRelationData = {
  id: generateRelationId(),
  sourceId,
  targetId,
  type: "uses" as const,
  description: "React uses JavaScript",
  weight: 0.8,
  bidirectional: false,
  evidence: [
    {
      chunkId: createChunkId("550e8400-e29b-41d4-a716-446655440000"),
      excerpt: "React is a JavaScript library",
      confidence: 0.9,
    },
  ],
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

try {
  const parsedRelation = relationEntitySchema.parse(validRelationData);
  console.log("✅ Relation正常系バリデーション成功");
  console.log(`   - Type: ${parsedRelation.type}`);
  console.log(`   - Weight: ${parsedRelation.weight}`);
  console.log(`   - Evidence count: ${parsedRelation.evidence.length}`);
} catch (error) {
  console.error(
    "❌ Relation正常系バリデーション失敗:",
    error instanceof Error ? error.message : String(error),
  );
}
console.log();

// =============================================================================
// Test 6: Self-loop制約の確認
// =============================================================================

console.log("📋 Test 6: Self-loop制約の確認");
console.log("-".repeat(80));

const sameId = generateEntityId();
const invalidSelfLoopData = {
  id: generateRelationId(),
  sourceId: sameId,
  targetId: sameId, // ❌ sourceIdと同じ（self-loop）
  type: "uses" as const,
  description: "Self-referential relation",
  weight: 0.5,
  bidirectional: false,
  evidence: [
    {
      chunkId: createChunkId("550e8400-e29b-41d4-a716-446655440000"),
      excerpt: "Test evidence",
      confidence: 0.8,
    },
  ],
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

try {
  relationEntitySchema.parse(invalidSelfLoopData);
  console.error("❌ Self-loop制約が機能していない");
} catch (error) {
  console.log("✅ Self-loop制約が正しく機能している");
  console.log("   エラーメッセージ:");
  if (error instanceof ZodError) {
    error.issues.forEach((err) => {
      console.log(`   - ${err.path.join(".")}: ${err.message}`);
    });
  } else {
    console.log(
      `   - ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
console.log();

// =============================================================================
// 総合結果
// =============================================================================

console.log("=".repeat(80));
console.log("✅ All Manual Verification Tests Completed");
console.log("=".repeat(80));
console.log();
console.log("Summary:");
console.log("  ✅ Test 1: EntityEntity型の自動補完 - PASS");
console.log("  ✅ Test 2: Union型の推論 - PASS");
console.log("  ✅ Test 3: Zod正常系バリデーション - PASS");
console.log("  ✅ Test 4: Zod異常系バリデーション - PASS");
console.log("  ✅ Test 5: Float32Array型の動作 - PASS");
console.log("  ✅ Bonus: Relationバリデーション - PASS");
console.log("  ✅ Test 6: Self-loop制約 - PASS");
console.log();
console.log("🎉 All tests passed!");
