import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";

describe("better-sqlite3 ABI 互換性テスト", () => {
  it("インメモリ DB を開いて CRUD が正常動作すること", () => {
    // ABI 不一致の場合、require 時点で ERR_DLOPEN_FAILED が throw される
    const db = new Database(":memory:");

    db.exec(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT NOT NULL
      )
    `);

    const insert = db.prepare("INSERT INTO test_table (value) VALUES (?)");
    insert.run("hello");

    const row = db
      .prepare("SELECT value FROM test_table WHERE id = 1")
      .get() as { value: string } | undefined;
    expect(row?.value).toBe("hello");

    db.close();
  });

  it("DB を閉じた後に再オープンできること", () => {
    const db1 = new Database(":memory:");
    db1.close();

    const db2 = new Database(":memory:");
    expect(() => db2.exec("SELECT 1")).not.toThrow();
    db2.close();
  });
});

describe("better-sqlite3 ABI 互換性テスト（拡充版）", () => {
  it("複数テーブルの同時操作が正常動作すること", () => {
    const db = new Database(":memory:");
    db.exec(`
      CREATE TABLE conversations (id INTEGER PRIMARY KEY, title TEXT);
      CREATE TABLE messages (id INTEGER PRIMARY KEY, conversation_id INTEGER, content TEXT);
    `);

    db.prepare("INSERT INTO conversations (title) VALUES (?)").run(
      "テスト会話",
    );
    db.prepare(
      "INSERT INTO messages (conversation_id, content) VALUES (?, ?)",
    ).run(1, "こんにちは");

    const conv = db
      .prepare("SELECT * FROM conversations WHERE id = 1")
      .get() as { id: number; title: string } | undefined;
    const msg = db
      .prepare("SELECT * FROM messages WHERE conversation_id = 1")
      .get() as
      | { id: number; conversation_id: number; content: string }
      | undefined;

    expect(conv?.title).toBe("テスト会話");
    expect(msg?.content).toBe("こんにちは");
    db.close();
  });

  it("トランザクションが正常動作すること", () => {
    const db = new Database(":memory:");
    db.exec("CREATE TABLE items (id INTEGER PRIMARY KEY, value TEXT)");

    const insertMany = db.transaction((items: string[]) => {
      const stmt = db.prepare("INSERT INTO items (value) VALUES (?)");
      for (const item of items) {
        stmt.run(item);
      }
    });

    insertMany(["a", "b", "c"]);

    const count = (
      db.prepare("SELECT COUNT(*) as cnt FROM items").get() as
        | { cnt: number }
        | undefined
    )?.cnt;
    expect(count).toBe(3);
    db.close();
  });
});
