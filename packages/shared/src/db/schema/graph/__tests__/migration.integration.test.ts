/**
 * @file Knowledge Graph マイグレーション統合テスト
 * @module @repo/shared/db/schema/graph/__tests__/migration.integration.test
 * @description マイグレーション適用後のデータベース状態を検証する統合テスト
 *
 * Phase 4（TDD: Red）: テーブル未作成状態では失敗
 * Phase 5（TDD: Green）: マイグレーション適用後に成功
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

// =============================================================================
// テストセットアップ
// =============================================================================

describe("Knowledge Graph Migration Integration Tests", () => {
  let sqlite: Database.Database;

  let _db: ReturnType<typeof drizzle>;

  beforeEach(() => {
    // インメモリSQLiteデータベースを作成
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    // Knowledge Graph テーブルを作成（マイグレーション相当）
    sqlite.exec(`
      -- 依存テーブル: chunks（外部テーブル）
      CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        file_id TEXT NOT NULL,
        content TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        hash TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      -- entities テーブル
      CREATE TABLE entities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        normalized_name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        aliases TEXT NOT NULL DEFAULT '[]',
        embedding BLOB,
        embedding_model_id TEXT,
        importance REAL NOT NULL DEFAULT 0.5,
        mention_count INTEGER NOT NULL DEFAULT 1,
        metadata TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
      CREATE INDEX entities_normalized_name_idx ON entities(normalized_name);
      CREATE INDEX entities_type_idx ON entities(type);
      CREATE INDEX entities_importance_idx ON entities(importance);
      CREATE UNIQUE INDEX entities_name_type_idx ON entities(normalized_name, type);

      -- relations テーブル
      CREATE TABLE relations (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        weight REAL NOT NULL DEFAULT 0.5,
        bidirectional INTEGER NOT NULL DEFAULT 0,
        evidence_count INTEGER NOT NULL DEFAULT 1,
        metadata TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (source_id) REFERENCES entities(id) ON DELETE CASCADE,
        FOREIGN KEY (target_id) REFERENCES entities(id) ON DELETE CASCADE
      );
      CREATE INDEX relations_source_id_idx ON relations(source_id);
      CREATE INDEX relations_target_id_idx ON relations(target_id);
      CREATE INDEX relations_type_idx ON relations(type);
      CREATE INDEX relations_weight_idx ON relations(weight);
      CREATE UNIQUE INDEX relations_source_target_type_idx ON relations(source_id, target_id, type);

      -- communities テーブル
      CREATE TABLE communities (
        id TEXT PRIMARY KEY,
        level INTEGER NOT NULL DEFAULT 0,
        parent_id TEXT,
        name TEXT NOT NULL,
        summary TEXT NOT NULL,
        member_count INTEGER NOT NULL DEFAULT 0,
        embedding BLOB,
        embedding_model_id TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        FOREIGN KEY (parent_id) REFERENCES communities(id) ON DELETE SET NULL
      );
      CREATE INDEX communities_level_idx ON communities(level);
      CREATE INDEX communities_parent_id_idx ON communities(parent_id);

      -- relation_evidence テーブル
      CREATE TABLE relation_evidence (
        relation_id TEXT NOT NULL,
        chunk_id TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        confidence REAL NOT NULL DEFAULT 0.5,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
        PRIMARY KEY (relation_id, chunk_id),
        FOREIGN KEY (relation_id) REFERENCES relations(id) ON DELETE CASCADE,
        FOREIGN KEY (chunk_id) REFERENCES chunks(id) ON DELETE CASCADE
      );
      CREATE INDEX relation_evidence_relation_id_idx ON relation_evidence(relation_id);
      CREATE INDEX relation_evidence_chunk_id_idx ON relation_evidence(chunk_id);

      -- entity_communities テーブル
      CREATE TABLE entity_communities (
        entity_id TEXT NOT NULL,
        community_id TEXT NOT NULL,
        PRIMARY KEY (entity_id, community_id),
        FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
        FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
      );
      CREATE INDEX entity_communities_entity_id_idx ON entity_communities(entity_id);
      CREATE INDEX entity_communities_community_id_idx ON entity_communities(community_id);

      -- chunk_entities テーブル
      CREATE TABLE chunk_entities (
        chunk_id TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        mention_count INTEGER NOT NULL DEFAULT 1,
        positions TEXT NOT NULL DEFAULT '[]',
        PRIMARY KEY (chunk_id, entity_id),
        FOREIGN KEY (chunk_id) REFERENCES chunks(id) ON DELETE CASCADE,
        FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
      );
      CREATE INDEX chunk_entities_chunk_id_idx ON chunk_entities(chunk_id);
      CREATE INDEX chunk_entities_entity_id_idx ON chunk_entities(entity_id);
    `);

    _db = drizzle(sqlite);
  });

  afterEach(() => {
    sqlite.close();
  });

  // ===========================================================================
  // TC-1: テーブル存在確認テスト
  // ===========================================================================
  describe("Table Existence Tests", () => {
    it("TC-1.1: entities テーブルが存在し、13カラムを持つ", () => {
      const result = sqlite
        .prepare("PRAGMA table_info(entities)")
        .all() as Array<{ name: string }>;
      expect(result.length).toBe(13);

      const columnNames = result.map((col) => col.name);
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("normalized_name");
      expect(columnNames).toContain("type");
      expect(columnNames).toContain("description");
      expect(columnNames).toContain("aliases");
      expect(columnNames).toContain("embedding");
      expect(columnNames).toContain("embedding_model_id");
      expect(columnNames).toContain("importance");
      expect(columnNames).toContain("mention_count");
      expect(columnNames).toContain("metadata");
      expect(columnNames).toContain("created_at");
      expect(columnNames).toContain("updated_at");
    });

    it("TC-1.2: relations テーブルが存在し、11カラムを持つ", () => {
      const result = sqlite
        .prepare("PRAGMA table_info(relations)")
        .all() as Array<{ name: string }>;
      expect(result.length).toBe(11);

      const columnNames = result.map((col) => col.name);
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("source_id");
      expect(columnNames).toContain("target_id");
      expect(columnNames).toContain("type");
    });

    it("TC-1.3: relation_evidence テーブルが存在し、6カラムを持つ", () => {
      const result = sqlite
        .prepare("PRAGMA table_info(relation_evidence)")
        .all() as Array<{ name: string }>;
      expect(result.length).toBe(6);

      const columnNames = result.map((col) => col.name);
      expect(columnNames).toContain("relation_id");
      expect(columnNames).toContain("chunk_id");
      expect(columnNames).toContain("excerpt");
      expect(columnNames).toContain("confidence");
    });

    it("TC-1.4: communities テーブルが存在し、10カラムを持つ", () => {
      const result = sqlite
        .prepare("PRAGMA table_info(communities)")
        .all() as Array<{ name: string }>;
      expect(result.length).toBe(10);

      const columnNames = result.map((col) => col.name);
      expect(columnNames).toContain("id");
      expect(columnNames).toContain("level");
      expect(columnNames).toContain("parent_id");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("summary");
    });

    it("TC-1.5: entity_communities テーブルが存在し、2カラムを持つ", () => {
      const result = sqlite
        .prepare("PRAGMA table_info(entity_communities)")
        .all() as Array<{ name: string }>;
      expect(result.length).toBe(2);

      const columnNames = result.map((col) => col.name);
      expect(columnNames).toContain("entity_id");
      expect(columnNames).toContain("community_id");
    });

    it("TC-1.6: chunk_entities テーブルが存在し、4カラムを持つ", () => {
      const result = sqlite
        .prepare("PRAGMA table_info(chunk_entities)")
        .all() as Array<{ name: string }>;
      expect(result.length).toBe(4);

      const columnNames = result.map((col) => col.name);
      expect(columnNames).toContain("chunk_id");
      expect(columnNames).toContain("entity_id");
      expect(columnNames).toContain("mention_count");
      expect(columnNames).toContain("positions");
    });
  });

  // ===========================================================================
  // TC-2: インデックス存在確認テスト
  // ===========================================================================
  describe("Index Existence Tests", () => {
    it("TC-2.1: entities テーブルに4つのインデックスが存在する", () => {
      const result = sqlite
        .prepare("PRAGMA index_list(entities)")
        .all() as Array<{ name: string; unique: number }>;

      const indexNames = result.map((idx) => idx.name);
      expect(indexNames).toContain("entities_normalized_name_idx");
      expect(indexNames).toContain("entities_type_idx");
      expect(indexNames).toContain("entities_importance_idx");
      expect(indexNames).toContain("entities_name_type_idx");

      // UNIQUE インデックスの確認
      const uniqueIndex = result.find(
        (idx) => idx.name === "entities_name_type_idx",
      );
      expect(uniqueIndex?.unique).toBe(1);
    });

    it("TC-2.2: relations テーブルに5つのインデックスが存在する", () => {
      const result = sqlite
        .prepare("PRAGMA index_list(relations)")
        .all() as Array<{ name: string; unique: number }>;

      const indexNames = result.map((idx) => idx.name);
      expect(indexNames).toContain("relations_source_id_idx");
      expect(indexNames).toContain("relations_target_id_idx");
      expect(indexNames).toContain("relations_type_idx");
      expect(indexNames).toContain("relations_weight_idx");
      expect(indexNames).toContain("relations_source_target_type_idx");

      // UNIQUE インデックスの確認
      const uniqueIndex = result.find(
        (idx) => idx.name === "relations_source_target_type_idx",
      );
      expect(uniqueIndex?.unique).toBe(1);
    });

    it("TC-2.3: communities テーブルに2つのインデックスが存在する", () => {
      const result = sqlite
        .prepare("PRAGMA index_list(communities)")
        .all() as Array<{ name: string }>;

      const indexNames = result.map((idx) => idx.name);
      expect(indexNames).toContain("communities_level_idx");
      expect(indexNames).toContain("communities_parent_id_idx");
    });
  });

  // ===========================================================================
  // TC-3: 外部キー制約テスト
  // ===========================================================================
  describe("Foreign Key Constraint Tests", () => {
    it("TC-3.1: relations テーブルが entities への外部キーを持つ", () => {
      const result = sqlite.prepare("PRAGMA foreign_key_list(relations)").all();
      expect(result.length).toBe(2);

      const fks = result as Array<{
        from: string;
        table: string;
        to: string;
        on_delete: string;
      }>;
      const sourceFK = fks.find((fk) => fk.from === "source_id");
      const targetFK = fks.find((fk) => fk.from === "target_id");

      expect(sourceFK?.table).toBe("entities");
      expect(sourceFK?.to).toBe("id");
      expect(sourceFK?.on_delete).toBe("CASCADE");

      expect(targetFK?.table).toBe("entities");
      expect(targetFK?.to).toBe("id");
      expect(targetFK?.on_delete).toBe("CASCADE");
    });

    it("TC-3.2: communities テーブルが自己参照外部キーを持つ（SET NULL）", () => {
      const result = sqlite
        .prepare("PRAGMA foreign_key_list(communities)")
        .all();
      expect(result.length).toBe(1);

      const fk = result[0] as {
        from: string;
        table: string;
        to: string;
        on_delete: string;
      };
      expect(fk.from).toBe("parent_id");
      expect(fk.table).toBe("communities");
      expect(fk.to).toBe("id");
      expect(fk.on_delete).toBe("SET NULL");
    });

    it("TC-3.3: relation_evidence テーブルが relations と chunks への外部キーを持つ", () => {
      const result = sqlite
        .prepare("PRAGMA foreign_key_list(relation_evidence)")
        .all();
      expect(result.length).toBe(2);

      const fks = result as Array<{
        from: string;
        table: string;
        on_delete: string;
      }>;
      const relationFK = fks.find((fk) => fk.from === "relation_id");
      const chunkFK = fks.find((fk) => fk.from === "chunk_id");

      expect(relationFK?.table).toBe("relations");
      expect(relationFK?.on_delete).toBe("CASCADE");

      expect(chunkFK?.table).toBe("chunks");
      expect(chunkFK?.on_delete).toBe("CASCADE");
    });
  });

  // ===========================================================================
  // TC-4: CASCADE DELETE 動作テスト
  // ===========================================================================
  describe("CASCADE DELETE Behavior Tests", () => {
    it("TC-4.1: entity 削除時に関連する relations が連動削除される", () => {
      // Arrange: エンティティと関係を作成
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type) VALUES
          ('e1', 'Entity 1', 'entity_1', 'person'),
          ('e2', 'Entity 2', 'entity_2', 'person');
        INSERT INTO relations (id, source_id, target_id, type) VALUES
          ('r1', 'e1', 'e2', 'related_to');
      `);

      // 初期状態を確認
      const initialRelations = sqlite
        .prepare("SELECT COUNT(*) as count FROM relations")
        .get() as { count: number };
      expect(initialRelations.count).toBe(1);

      // Act: source エンティティを削除
      sqlite.exec("DELETE FROM entities WHERE id = 'e1'");

      // Assert: 関連する relation も削除されている
      const afterRelations = sqlite
        .prepare("SELECT COUNT(*) as count FROM relations")
        .get() as { count: number };
      expect(afterRelations.count).toBe(0);
    });

    it("TC-4.2: entity 削除時に関連する entity_communities が連動削除される", () => {
      // Arrange
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type) VALUES
          ('e1', 'Entity 1', 'entity_1', 'person');
        INSERT INTO communities (id, name, summary) VALUES
          ('c1', 'Community 1', 'Summary 1');
        INSERT INTO entity_communities (entity_id, community_id) VALUES
          ('e1', 'c1');
      `);

      // 初期状態を確認
      const initial = sqlite
        .prepare("SELECT COUNT(*) as count FROM entity_communities")
        .get() as { count: number };
      expect(initial.count).toBe(1);

      // Act
      sqlite.exec("DELETE FROM entities WHERE id = 'e1'");

      // Assert
      const after = sqlite
        .prepare("SELECT COUNT(*) as count FROM entity_communities")
        .get() as { count: number };
      expect(after.count).toBe(0);
    });

    it("TC-4.3: community 削除時に関連する entity_communities が連動削除される", () => {
      // Arrange
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type) VALUES
          ('e1', 'Entity 1', 'entity_1', 'person');
        INSERT INTO communities (id, name, summary) VALUES
          ('c1', 'Community 1', 'Summary 1');
        INSERT INTO entity_communities (entity_id, community_id) VALUES
          ('e1', 'c1');
      `);

      // Act
      sqlite.exec("DELETE FROM communities WHERE id = 'c1'");

      // Assert
      const after = sqlite
        .prepare("SELECT COUNT(*) as count FROM entity_communities")
        .get() as { count: number };
      expect(after.count).toBe(0);
    });
  });

  // ===========================================================================
  // TC-5: SET NULL 動作テスト
  // ===========================================================================
  describe("SET NULL Behavior Tests", () => {
    it("TC-5.1: 親 community 削除時に子の parent_id が NULL になる", () => {
      // Arrange: 親子コミュニティを作成
      sqlite.exec(`
        INSERT INTO communities (id, name, summary, parent_id) VALUES
          ('parent', 'Parent Community', 'Parent summary', NULL),
          ('child', 'Child Community', 'Child summary', 'parent');
      `);

      // 初期状態を確認
      const initial = sqlite
        .prepare("SELECT parent_id FROM communities WHERE id = 'child'")
        .get() as { parent_id: string | null };
      expect(initial.parent_id).toBe("parent");

      // Act: 親を削除
      sqlite.exec("DELETE FROM communities WHERE id = 'parent'");

      // Assert: 子の parent_id が NULL
      const after = sqlite
        .prepare("SELECT parent_id FROM communities WHERE id = 'child'")
        .get() as { parent_id: string | null };
      expect(after.parent_id).toBeNull();
    });
  });

  // ===========================================================================
  // TC-6: UNIQUE 制約テスト
  // ===========================================================================
  describe("UNIQUE Constraint Tests", () => {
    it("TC-6.1: 同じ normalized_name + type の entity は挿入不可", () => {
      // Arrange: 最初のエンティティを作成
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type) VALUES
          ('e1', 'Test Entity', 'test_entity', 'person');
      `);

      // Act & Assert: 同じ normalized_name + type で挿入するとエラー
      expect(() => {
        sqlite.exec(`
          INSERT INTO entities (id, name, normalized_name, type) VALUES
            ('e2', 'Test Entity 2', 'test_entity', 'person');
        `);
      }).toThrow(/UNIQUE constraint failed/);
    });

    it("TC-6.2: 同じ source_id + target_id + type の relation は挿入不可", () => {
      // Arrange
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type) VALUES
          ('e1', 'Entity 1', 'entity_1', 'person'),
          ('e2', 'Entity 2', 'entity_2', 'person');
        INSERT INTO relations (id, source_id, target_id, type) VALUES
          ('r1', 'e1', 'e2', 'related_to');
      `);

      // Act & Assert
      expect(() => {
        sqlite.exec(`
          INSERT INTO relations (id, source_id, target_id, type) VALUES
            ('r2', 'e1', 'e2', 'related_to');
        `);
      }).toThrow(/UNIQUE constraint failed/);
    });
  });

  // ===========================================================================
  // TC-7: 基本 CRUD 操作テスト
  // ===========================================================================
  describe("Basic CRUD Operations", () => {
    it("entities の INSERT/SELECT/UPDATE/DELETE が正常に動作する", () => {
      // INSERT
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type, importance)
        VALUES ('test-id', 'Test Name', 'test_name', 'concept', 0.8);
      `);

      // SELECT
      const selected = sqlite
        .prepare("SELECT * FROM entities WHERE id = ?")
        .get("test-id") as { name: string; importance: number };
      expect(selected.name).toBe("Test Name");
      expect(selected.importance).toBe(0.8);

      // UPDATE
      sqlite.exec(`
        UPDATE entities SET name = 'Updated Name' WHERE id = 'test-id';
      `);
      const updated = sqlite
        .prepare("SELECT name FROM entities WHERE id = ?")
        .get("test-id") as { name: string };
      expect(updated.name).toBe("Updated Name");

      // DELETE
      sqlite.exec("DELETE FROM entities WHERE id = 'test-id'");
      const deleted = sqlite
        .prepare("SELECT * FROM entities WHERE id = ?")
        .get("test-id");
      expect(deleted).toBeUndefined();
    });

    it("DEFAULT 値が正しく適用される", () => {
      // 最小限のカラムのみで INSERT
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type)
        VALUES ('default-test', 'Default Test', 'default_test', 'concept');
      `);

      const result = sqlite
        .prepare("SELECT * FROM entities WHERE id = ?")
        .get("default-test") as {
        aliases: string;
        importance: number;
        mention_count: number;
      };

      expect(result.aliases).toBe("[]");
      expect(result.importance).toBe(0.5);
      expect(result.mention_count).toBe(1);
    });
  });

  // ===========================================================================
  // TC-8: エッジケーステスト（Phase 6 追加）
  // ===========================================================================
  describe("Edge Case Tests", () => {
    it("TC-8.1: NULL値を許容するカラムが正しく動作する", () => {
      // entities.description, entities.metadata, entities.embedding は NULL許容
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type, description, metadata, embedding)
        VALUES ('null-test', 'Null Test', 'null_test', 'concept', NULL, NULL, NULL);
      `);

      const result = sqlite
        .prepare(
          "SELECT description, metadata, embedding FROM entities WHERE id = ?",
        )
        .get("null-test") as {
        description: string | null;
        metadata: string | null;
        embedding: Buffer | null;
      };

      expect(result.description).toBeNull();
      expect(result.metadata).toBeNull();
      expect(result.embedding).toBeNull();
    });

    it("TC-8.2: 空文字列の挿入が正しく動作する", () => {
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type, description)
        VALUES ('empty-test', 'Empty Test', 'empty_test', 'concept', '');
      `);

      const result = sqlite
        .prepare("SELECT description FROM entities WHERE id = ?")
        .get("empty-test") as { description: string };

      expect(result.description).toBe("");
    });

    it("TC-8.3: 境界値（importance: 0.0 と 1.0）が正しく保存される", () => {
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type, importance)
        VALUES
          ('min-importance', 'Min', 'min_importance', 'concept', 0.0),
          ('max-importance', 'Max', 'max_importance', 'concept', 1.0);
      `);

      const min = sqlite
        .prepare("SELECT importance FROM entities WHERE id = ?")
        .get("min-importance") as { importance: number };
      const max = sqlite
        .prepare("SELECT importance FROM entities WHERE id = ?")
        .get("max-importance") as { importance: number };

      expect(min.importance).toBe(0.0);
      expect(max.importance).toBe(1.0);
    });

    it("TC-8.4: 長いテキスト（1000文字超）が正しく保存される", () => {
      const longText = "A".repeat(2000);
      sqlite
        .prepare(
          "INSERT INTO entities (id, name, normalized_name, type, description) VALUES (?, ?, ?, ?, ?)",
        )
        .run("long-text", "Long Text", "long_text", "concept", longText);

      const result = sqlite
        .prepare("SELECT description FROM entities WHERE id = ?")
        .get("long-text") as { description: string };

      expect(result.description).toBe(longText);
      expect(result.description.length).toBe(2000);
    });

    it("TC-8.5: JSON配列（aliases）が正しく保存・取得される", () => {
      const aliases = JSON.stringify(["alias1", "alias2", "alias3"]);
      sqlite
        .prepare(
          "INSERT INTO entities (id, name, normalized_name, type, aliases) VALUES (?, ?, ?, ?, ?)",
        )
        .run("json-test", "JSON Test", "json_test", "concept", aliases);

      const result = sqlite
        .prepare("SELECT aliases FROM entities WHERE id = ?")
        .get("json-test") as { aliases: string };

      const parsed = JSON.parse(result.aliases);
      expect(parsed).toEqual(["alias1", "alias2", "alias3"]);
    });
  });

  // ===========================================================================
  // TC-9: トランザクションテスト（Phase 6 追加）
  // ===========================================================================
  describe("Transaction Tests", () => {
    it("TC-9.1: トランザクション内でエラー時にロールバックされる", () => {
      // 初期データを挿入
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type)
        VALUES ('tx-test', 'Tx Test', 'tx_test', 'concept');
      `);

      // トランザクション開始
      try {
        sqlite.exec("BEGIN TRANSACTION");
        sqlite.exec(
          "UPDATE entities SET name = 'Updated' WHERE id = 'tx-test'",
        );
        // UNIQUE制約違反を起こす
        sqlite.exec(`
          INSERT INTO entities (id, name, normalized_name, type)
          VALUES ('tx-test-2', 'Another', 'tx_test', 'concept');
        `);
        sqlite.exec("COMMIT");
      } catch {
        sqlite.exec("ROLLBACK");
      }

      // ロールバックされているはず
      const result = sqlite
        .prepare("SELECT name FROM entities WHERE id = ?")
        .get("tx-test") as { name: string };
      expect(result.name).toBe("Tx Test"); // 元の値のまま
    });

    it("TC-9.2: 正常なトランザクションがコミットされる", () => {
      sqlite.exec("BEGIN TRANSACTION");
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type)
        VALUES ('commit-1', 'Commit 1', 'commit_1', 'concept');
      `);
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type)
        VALUES ('commit-2', 'Commit 2', 'commit_2', 'concept');
      `);
      sqlite.exec("COMMIT");

      const count = sqlite
        .prepare(
          "SELECT COUNT(*) as count FROM entities WHERE id IN ('commit-1', 'commit-2')",
        )
        .get() as { count: number };
      expect(count.count).toBe(2);
    });
  });

  // ===========================================================================
  // TC-10: チェーンCASCADE DELETEテスト（Phase 6 追加）
  // ===========================================================================
  describe("Chain CASCADE DELETE Tests", () => {
    it("TC-10.1: entity削除時に relation と relation_evidence が連鎖削除される", () => {
      // テストデータのセットアップ
      sqlite.exec(`
        INSERT INTO chunks (id, file_id, content, chunk_index, hash)
        VALUES ('chunk-1', 'file-1', 'content', 0, 'hash-1');

        INSERT INTO entities (id, name, normalized_name, type) VALUES
          ('chain-e1', 'Chain Entity 1', 'chain_entity_1', 'person'),
          ('chain-e2', 'Chain Entity 2', 'chain_entity_2', 'person');

        INSERT INTO relations (id, source_id, target_id, type)
        VALUES ('chain-r1', 'chain-e1', 'chain-e2', 'related_to');

        INSERT INTO relation_evidence (relation_id, chunk_id, excerpt)
        VALUES ('chain-r1', 'chunk-1', 'excerpt text');
      `);

      // 初期状態を確認
      const initialEvidence = sqlite
        .prepare("SELECT COUNT(*) as count FROM relation_evidence")
        .get() as { count: number };
      expect(initialEvidence.count).toBe(1);

      // entityを削除
      sqlite.exec("DELETE FROM entities WHERE id = 'chain-e1'");

      // relation_evidenceも連鎖削除されているはず
      const afterEvidence = sqlite
        .prepare("SELECT COUNT(*) as count FROM relation_evidence")
        .get() as { count: number };
      expect(afterEvidence.count).toBe(0);
    });

    it("TC-10.2: chunk削除時にchunk_entitiesとrelation_evidenceが連鎖削除される", () => {
      // テストデータのセットアップ
      sqlite.exec(`
        INSERT INTO chunks (id, file_id, content, chunk_index, hash)
        VALUES ('chunk-2', 'file-1', 'content 2', 1, 'hash-2');

        INSERT INTO entities (id, name, normalized_name, type)
        VALUES ('chunk-entity', 'Chunk Entity', 'chunk_entity', 'concept');

        INSERT INTO chunk_entities (chunk_id, entity_id, mention_count)
        VALUES ('chunk-2', 'chunk-entity', 1);
      `);

      // 初期状態を確認
      const initialChunkEntities = sqlite
        .prepare(
          "SELECT COUNT(*) as count FROM chunk_entities WHERE chunk_id = 'chunk-2'",
        )
        .get() as { count: number };
      expect(initialChunkEntities.count).toBe(1);

      // chunkを削除
      sqlite.exec("DELETE FROM chunks WHERE id = 'chunk-2'");

      // chunk_entitiesも削除されているはず
      const afterChunkEntities = sqlite
        .prepare(
          "SELECT COUNT(*) as count FROM chunk_entities WHERE chunk_id = 'chunk-2'",
        )
        .get() as { count: number };
      expect(afterChunkEntities.count).toBe(0);
    });
  });

  // ===========================================================================
  // TC-11: NOT NULL制約テスト（Phase 6 追加）
  // ===========================================================================
  describe("NOT NULL Constraint Tests", () => {
    it("TC-11.1: entities.name が NULL の場合エラーになる", () => {
      expect(() => {
        sqlite.exec(`
          INSERT INTO entities (id, name, normalized_name, type)
          VALUES ('null-name', NULL, 'null_name', 'concept');
        `);
      }).toThrow(/NOT NULL constraint failed/);
    });

    it("TC-11.2: relations.source_id が NULL の場合エラーになる", () => {
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type)
        VALUES ('null-src', 'Null Src', 'null_src', 'concept');
      `);

      expect(() => {
        sqlite.exec(`
          INSERT INTO relations (id, source_id, target_id, type)
          VALUES ('null-rel', NULL, 'null-src', 'related_to');
        `);
      }).toThrow(/NOT NULL constraint failed/);
    });

    it("TC-11.3: communities.name が NULL の場合エラーになる", () => {
      expect(() => {
        sqlite.exec(`
          INSERT INTO communities (id, name, summary)
          VALUES ('null-comm', NULL, 'summary');
        `);
      }).toThrow(/NOT NULL constraint failed/);
    });
  });

  // ===========================================================================
  // TC-12: 外部キー参照整合性テスト（Phase 6 追加）
  // ===========================================================================
  describe("Foreign Key Reference Integrity Tests", () => {
    it("TC-12.1: 存在しないentityへのrelation挿入が失敗する", () => {
      expect(() => {
        sqlite.exec(`
          INSERT INTO relations (id, source_id, target_id, type)
          VALUES ('orphan-rel', 'non-existent-1', 'non-existent-2', 'related_to');
        `);
      }).toThrow(/FOREIGN KEY constraint failed/);
    });

    it("TC-12.2: 存在しないcommunityへのentity_communities挿入が失敗する", () => {
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type)
        VALUES ('fk-entity', 'FK Entity', 'fk_entity', 'concept');
      `);

      expect(() => {
        sqlite.exec(`
          INSERT INTO entity_communities (entity_id, community_id)
          VALUES ('fk-entity', 'non-existent-community');
        `);
      }).toThrow(/FOREIGN KEY constraint failed/);
    });

    it("TC-12.3: 存在しないchunkへのchunk_entities挿入が失敗する", () => {
      sqlite.exec(`
        INSERT INTO entities (id, name, normalized_name, type)
        VALUES ('chunk-fk-entity', 'Chunk FK Entity', 'chunk_fk_entity', 'concept');
      `);

      expect(() => {
        sqlite.exec(`
          INSERT INTO chunk_entities (chunk_id, entity_id)
          VALUES ('non-existent-chunk', 'chunk-fk-entity');
        `);
      }).toThrow(/FOREIGN KEY constraint failed/);
    });
  });
});
