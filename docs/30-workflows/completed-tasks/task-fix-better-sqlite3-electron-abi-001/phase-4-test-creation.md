# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 4                                        |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 目的

`better-sqlite3` が Node/Vitest で安全に読み込めることと、基本的な CRUD が壊れていないことを確認する smoke test を作成する。
Electron の実ランタイム ABI 確認は Phase 11 の手動テストで行う。

## テスト観点

### テスト対象

| 観点               | テスト内容                                                 | AC との対応 |
| ------------------ | ---------------------------------------------------------- | ----------- |
| Node/Vitest ロード | `better-sqlite3` を `require` してインメモリ DB を開けるか | AC-2 の補助 |
| DB 接続            | インメモリ DB を開いて CRUD が正常動作するか               | AC-2 の補助 |

### テスト戦略の方針

- Vitest で実施できるのは「Node/Vitest でのロード確認とインメモリ DB 操作の正常系」に限定する
- Electron 実行時の ABI 一致確認は Phase 11 の手動起動ログで実施する

## 作成するテストファイル

### `apps/desktop/src/__tests__/native/better-sqlite3-abi.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";

describe("better-sqlite3 ABI 互換性テスト", () => {
  it("インメモリ DB を開いて CRUD が正常動作すること", () => {
    // Node/Vitest で addon を読み込み、基本操作が壊れていないことを確認する
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
```

### テスト実行コマンド

```bash
# better-sqlite3 ABI テストのみ実行
pnpm --filter @repo/desktop test:run src/__tests__/native/better-sqlite3-abi.test.ts --reporter=verbose

# desktop パッケージ全テスト実行
pnpm --filter @repo/desktop test:run
```

## 実装前の期待動作（RED フェーズ）

ABI 不一致の状態（`rebuild:native` 未実行）では:

- Vitest（Node.js プロセス）上では `better-sqlite3` がロードできる場合がある（Node 側の ABI と一致しているため）
- Electron 起動時には別 ABI を要求して `ERR_DLOPEN_FAILED` / `NODE_MODULE_VERSION mismatch` が発生する場合がある
- したがって、このテストの RED/GREEN は Vitest レベルでは判断できない

**結論**: Vitest テストは ABI 確認の補助的な位置付けとし、真の RED → GREEN 確認は Phase 11 の手動 Electron 起動テストで実施する。

## Electron 起動ログによる確認観点（Phase 11 向けの事前定義）

Electron 起動時に確認すべきログの観点を事前に定義しておく:

| ログパターン                                          | 意味                           | 期待値         |
| ----------------------------------------------------- | ------------------------------ | -------------- |
| `ERR_DLOPEN_FAILED`                                   | ABI 不一致でバイナリロード失敗 | 出ないこと     |
| `[DB] Failed to initialize conversation database`     | DB 初期化失敗                  | 出ないこと     |
| `[DB] Conversation database initialized`              | DB 初期化成功                  | 出ること       |
| `[IPC] Handler registration completed` に続く失敗件数 | IPC ハンドラ登録の失敗数       | `0` であること |

## 成果物

| 成果物             | パス                                                           | 説明                      |
| ------------------ | -------------------------------------------------------------- | ------------------------- |
| ABI テストファイル | `apps/desktop/src/__tests__/native/better-sqlite3-abi.test.ts` | インメモリ DB CRUD テスト |

## 完了条件

- [ ] `better-sqlite3` を `require` してインメモリ DB を操作するテストが作成されている
- [ ] テスト実行コマンドが確認されている（`pnpm --filter @repo/desktop test:run`）
- [ ] Electron 起動ログの確認観点（4パターン）が定義されている
- [ ] Vitest テストと Electron 手動テストの役割分担が明確になっている
