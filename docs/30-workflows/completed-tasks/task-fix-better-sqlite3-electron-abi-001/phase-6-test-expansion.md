# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 6                                        |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 目的

Phase 4 で作成した基本テストを拡充し、`pnpm install` 後の `postinstall` 自動実行を含む CI 環境での再現確認シナリオをカバーする。

**注意**: この Phase は Vitest/Node 側の補助テスト拡充と、`postinstall` 実行有無の確認までを扱う。Electron 実行時の最終確認（`NODE_MODULE_VERSION mismatch` の不在、IPC 応答）は Phase 11 の手動テストで行う。

## テスト拡充の観点

### 追加テストケース

Phase 4 の `better-sqlite3-abi.test.ts` に以下のテストケースを追加する:

```typescript
import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";

describe("better-sqlite3 ABI 互換性テスト（拡充版）", () => {
  // Phase 4 の既存テスト（省略）

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
```

### CI 環境での postinstall 検証手順

CI（GitHub Actions 等）で `postinstall` が確実に実行されることを検証する手順:

```yaml
# .github/workflows/ci.yml（参考）
- name: pnpm install（postinstall 含む）
  run: pnpm install --frozen-lockfile
  # postinstall: pnpm rebuild:native が自動実行される

- name: テスト実行
  run: pnpm --filter @repo/desktop test:run
```

### クリーン環境での再現確認手順

```bash
# 1. node_modules をクリア
rm -rf node_modules apps/desktop/node_modules packages/shared/node_modules

# 2. pnpm install（postinstall が自動実行されることを確認）
pnpm install 2>&1 | tee /tmp/install.log

# 3. postinstall が実行されたことをログで確認
grep -E "postinstall|rebuild:native|rebuild better-sqlite3" /tmp/install.log

# 4. テスト実行
pnpm --filter @repo/desktop test:run
```

## postinstall 追加前後の動作比較

| シナリオ                                | postinstall なし（修正前）                                           | postinstall あり（修正後）                                       |
| --------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm install` 時の rebuild 取り忘れ    | 手動で `pnpm --filter @repo/desktop rebuild:native` が必要になり得る | `postinstall` で `rebuild:native` が自動実行され、取り忘れを防ぐ |
| `pnpm install --frozen-lockfile`（CI）  | `postinstall` がないため自動 rebuild されない                        | `postinstall` が実行される（ログで確認）                         |
| Electron 起動での最終確認（AC-1/AC-2）  | Phase 11 で手動確認が必要                                            | Phase 11 で手動確認が必要（本 Phase では結論を出さない）         |
| `pnpm --filter @repo/desktop add <pkg>` | add 後に手動 rebuild が必要になり得る                                | add 後に `postinstall` が走り、取り忘れを防ぐ                    |

## テスト実行確認

```bash
# 全テストケースを実行
pnpm --filter @repo/desktop test:run --reporter=verbose

# 期待される出力（抜粋）
# ✓ better-sqlite3 ABI 互換性テスト > インメモリ DB を開いて CRUD が正常動作すること
# ✓ better-sqlite3 ABI 互換性テスト > DB を閉じた後に再オープンできること
# ✓ better-sqlite3 ABI 互換性テスト（拡充版） > 複数テーブルの同時操作が正常動作すること
# ✓ better-sqlite3 ABI 互換性テスト（拡充版） > トランザクションが正常動作すること
```

## 成果物

| 成果物             | パス                                                           | 説明                                         |
| ------------------ | -------------------------------------------------------------- | -------------------------------------------- |
| 拡充テストファイル | `apps/desktop/src/__tests__/native/better-sqlite3-abi.test.ts` | トランザクション・複数テーブルのテストを追加 |

## 完了条件

- [ ] 複数テーブル同時操作のテストケースが追加されている
- [ ] トランザクションテストケースが追加されている
- [ ] CI 環境での postinstall 検証手順が記述されている
- [ ] クリーン環境での再現確認手順（`rm -rf node_modules → pnpm install`）が記述されている
- [ ] 全テストケースが通過している
