/**
 * chunks FTS5 手動テストスクリプト
 *
 * Phase 8: T-08-1 手動テスト実施
 *
 * @description
 * 実際のデータベースを使用して、以下を検証：
 * - マイグレーション実行
 * - INSERT/UPDATE/DELETEトリガー
 * - FTS5検索（keyword, phrase, NEAR）
 * - BM25スコアリング
 * - CASCADE DELETE
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import crypto from "crypto";

import { files } from "../src/db/schema/files";
import { chunks } from "../src/db/schema/chunks";
import {
  initializeChunksFts,
  checkChunksFtsIntegrity,
} from "../src/db/schema/chunks-fts";
import {
  searchChunksByKeyword,
  searchChunksByPhrase,
  searchChunksByNear,
} from "../src/db/queries/chunks-search";

// カラー出力用
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log("\n=== chunks FTS5 手動テスト開始 ===\n", "blue");

  // Step 1: テスト用データベース準備
  log("Step 1: テスト用データベース準備", "blue");
  const client = createClient({
    url: "file:./test-manual.db",
  });
  const db = drizzle(client);

  try {
    // Step 2: マイグレーション実行（手動）
    log("\nStep 2: テーブル作成とマイグレーション", "blue");

    // filesテーブル作成（完全版）
    await client.execute(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        category TEXT NOT NULL,
        size INTEGER NOT NULL,
        hash TEXT NOT NULL,
        encoding TEXT NOT NULL DEFAULT 'utf-8',
        last_modified INTEGER NOT NULL,
        metadata TEXT NOT NULL DEFAULT '{}',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        deleted_at INTEGER
      )
    `);
    log("  ✅ filesテーブル作成完了", "green");

    // chunksテーブル作成
    await client.execute(`
      CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL,
        content TEXT NOT NULL,
        contextual_content TEXT,
        chunk_index INTEGER NOT NULL,
        start_line INTEGER,
        end_line INTEGER,
        start_char INTEGER,
        end_char INTEGER,
        parent_header TEXT,
        strategy TEXT NOT NULL,
        token_count INTEGER,
        hash TEXT NOT NULL,
        prev_chunk_id TEXT,
        next_chunk_id TEXT,
        overlap_tokens INTEGER NOT NULL DEFAULT 0,
        metadata TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
      )
    `);
    log("  ✅ chunksテーブル作成完了", "green");

    // インデックス作成
    await client.execute(
      `CREATE INDEX IF NOT EXISTS idx_chunks_file_id ON chunks(file_id)`,
    );
    await client.execute(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_chunks_hash ON chunks(hash)`,
    );
    await client.execute(
      `CREATE INDEX IF NOT EXISTS idx_chunks_chunk_index ON chunks(file_id, chunk_index)`,
    );
    await client.execute(
      `CREATE INDEX IF NOT EXISTS idx_chunks_strategy ON chunks(strategy)`,
    );
    log("  ✅ インデックス作成完了", "green");

    // FTS5初期化
    await initializeChunksFts(db);
    log("  ✅ FTS5テーブルとトリガー作成完了", "green");

    // Step 3: テストデータ挿入
    log("\nStep 3: テストデータ挿入", "blue");

    const fileId = crypto.randomUUID();
    const now = new Date();
    await db.insert(files).values({
      id: fileId,
      name: "test-document.md",
      path: "/test/test-document.md",
      mimeType: "text/markdown",
      category: "document",
      size: 1024,
      hash: crypto
        .createHash("sha256")
        .update("test-document.md")
        .digest("hex"),
      encoding: "utf-8",
      lastModified: now,
      metadata: "{}",
      createdAt: now,
      updatedAt: now,
    });
    log(`  ✅ テストファイル挿入完了 (ID: ${fileId})`, "green");

    const testChunks = [
      {
        id: crypto.randomUUID(),
        fileId,
        content: "TypeScript is a typed superset of JavaScript.",
        contextualContent:
          "Programming Languages > TypeScript is a typed superset of JavaScript.",
        chunkIndex: 0,
        startLine: 1,
        endLine: 1,
        startChar: 0,
        endChar: 47,
        parentHeader: "Programming Languages",
        strategy: "sentence" as const,
        tokenCount: 9,
        hash: crypto
          .createHash("sha256")
          .update("TypeScript is a typed superset of JavaScript.")
          .digest("hex"),
      },
      {
        id: crypto.randomUUID(),
        fileId,
        content: "React is a JavaScript library for building user interfaces.",
        contextualContent:
          "Frontend Frameworks > React is a JavaScript library for building user interfaces.",
        chunkIndex: 1,
        startLine: 3,
        endLine: 3,
        startChar: 48,
        endChar: 107,
        parentHeader: "Frontend Frameworks",
        strategy: "sentence" as const,
        tokenCount: 11,
        hash: crypto
          .createHash("sha256")
          .update("React is a JavaScript library for building user interfaces.")
          .digest("hex"),
      },
      {
        id: crypto.randomUUID(),
        fileId,
        content:
          "Full-text search enables efficient keyword-based document retrieval.",
        contextualContent:
          "Search Technology > Full-text search enables efficient keyword-based document retrieval.",
        chunkIndex: 2,
        startLine: 5,
        endLine: 5,
        startChar: 108,
        endChar: 175,
        parentHeader: "Search Technology",
        strategy: "sentence" as const,
        tokenCount: 10,
        hash: crypto
          .createHash("sha256")
          .update(
            "Full-text search enables efficient keyword-based document retrieval.",
          )
          .digest("hex"),
      },
    ];

    for (const chunk of testChunks) {
      await db.insert(chunks).values(chunk);
    }
    log(`  ✅ テストチャンク挿入完了 (3件)`, "green");

    // Step 4: FTS5整合性チェック
    log("\nStep 4: FTS5整合性チェック", "blue");
    const integrity = await checkChunksFtsIntegrity(db);
    if (integrity.isConsistent) {
      log(
        `  ✅ 整合性チェック成功 (chunks: ${integrity.chunksCount}, chunks_fts: ${integrity.chunksFtsCount})`,
        "green",
      );
    } else {
      log(
        `  ❌ 整合性エラー (chunks: ${integrity.chunksCount}, chunks_fts: ${integrity.chunksFtsCount})`,
        "red",
      );
      throw new Error("FTS5整合性チェック失敗");
    }

    // Step 5: キーワード検索テスト
    log("\nStep 5: キーワード検索テスト", "blue");
    const keywordResults = await searchChunksByKeyword(db, {
      query: "TypeScript JavaScript",
      limit: 10,
      offset: 0,
    });
    log(
      `  ✅ キーワード検索成功 (${keywordResults.results.length}件ヒット)`,
      "green",
    );
    keywordResults.results.forEach((result, i) => {
      log(
        `    ${i + 1}. [Score: ${result.score}] ${result.content.substring(0, 60)}...`,
      );
    });

    // Step 6: フレーズ検索テスト
    log("\nStep 6: フレーズ検索テスト", "blue");
    const phraseResults = await searchChunksByPhrase(db, {
      query: "typed superset",
      limit: 10,
      offset: 0,
    });
    log(
      `  ✅ フレーズ検索成功 (${phraseResults.results.length}件ヒット)`,
      "green",
    );
    phraseResults.results.forEach((result, i) => {
      log(
        `    ${i + 1}. [Score: ${result.score}] ${result.content.substring(0, 60)}...`,
      );
    });

    // Step 7: NEAR検索テスト
    log("\nStep 7: NEAR検索テスト", "blue");
    const nearResults = await searchChunksByNear(
      db,
      ["JavaScript", "library"],
      {
        nearDistance: 5,
        limit: 10,
        offset: 0,
      },
    );
    log(`  ✅ NEAR検索成功 (${nearResults.results.length}件ヒット)`, "green");
    nearResults.results.forEach((result, i) => {
      log(
        `    ${i + 1}. [Score: ${result.score}] ${result.content.substring(0, 60)}...`,
      );
    });

    // Step 8: UPDATE操作とFTS自動更新
    log("\nStep 8: UPDATE操作とFTS自動更新", "blue");
    const firstChunk = testChunks[0];
    await db
      .update(chunks)
      .set({
        content: "TypeScript is a strongly typed programming language.",
        contextualContent:
          "Programming Languages > TypeScript is a strongly typed programming language.",
      })
      .where(eq(chunks.id, firstChunk.id));
    log("  ✅ チャンク更新完了", "green");

    // 更新後の整合性チェック
    const integrityAfterUpdate = await checkChunksFtsIntegrity(db);
    if (integrityAfterUpdate.isConsistent) {
      log("  ✅ UPDATE後の整合性チェック成功", "green");
    } else {
      log("  ❌ UPDATE後の整合性エラー", "red");
      throw new Error("UPDATE後のFTS5整合性チェック失敗");
    }

    // 更新内容の検索確認
    const updatedSearch = await searchChunksByKeyword(db, {
      query: "strongly typed",
      limit: 10,
      offset: 0,
    });
    if (updatedSearch.results.length > 0) {
      log("  ✅ 更新内容が検索可能", "green");
    } else {
      log("  ❌ 更新内容が検索できない", "red");
      throw new Error("UPDATE後の検索失敗");
    }

    // Step 9: DELETE操作とFTS自動削除
    log("\nStep 9: DELETE操作とFTS自動削除", "blue");
    const secondChunk = testChunks[1];
    await db.delete(chunks).where(eq(chunks.id, secondChunk.id));
    log("  ✅ チャンク削除完了", "green");

    // 削除後の整合性チェック
    const integrityAfterDelete = await checkChunksFtsIntegrity(db);
    if (integrityAfterDelete.isConsistent) {
      log(
        `  ✅ DELETE後の整合性チェック成功 (残り${integrityAfterDelete.chunksCount}件)`,
        "green",
      );
    } else {
      log("  ❌ DELETE後の整合性エラー", "red");
      throw new Error("DELETE後のFTS5整合性チェック失敗");
    }

    // Step 10: CASCADE DELETE検証
    log("\nStep 10: CASCADE DELETE検証", "blue");
    await db.delete(files).where(eq(files.id, fileId));
    log("  ✅ ファイル削除完了", "green");

    // CASCADE DELETE後の確認
    const remainingChunks = await db
      .select()
      .from(chunks)
      .where(eq(chunks.fileId, fileId));
    if (remainingChunks.length === 0) {
      log("  ✅ CASCADE DELETE成功（関連チャンクすべて削除）", "green");
    } else {
      log(`  ❌ CASCADE DELETE失敗（${remainingChunks.length}件残存）`, "red");
      throw new Error("CASCADE DELETE検証失敗");
    }

    // 最終整合性チェック
    const finalIntegrity = await checkChunksFtsIntegrity(db);
    if (finalIntegrity.isConsistent) {
      log(
        `  ✅ 最終整合性チェック成功 (chunks: ${finalIntegrity.chunksCount}, chunks_fts: ${finalIntegrity.chunksFtsCount})`,
        "green",
      );
    }

    log("\n=== ✅ すべての手動テストが成功しました ===\n", "green");
  } catch (error) {
    log(`\n❌ エラー: ${error}`, "red");
    throw error;
  } finally {
    // クリーンアップ
    client.close();
  }
}

main().catch((error) => {
  console.error("手動テスト失敗:", error);
  process.exit(1);
});
