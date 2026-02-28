import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { SkillChainStore } from "./SkillChainStore";
import type { SkillChainDefinition } from "@repo/shared";

function createTestChain(
  overrides?: Partial<SkillChainDefinition>,
): SkillChainDefinition {
  return {
    id: overrides?.id ?? "test-chain-1",
    name: overrides?.name ?? "Test Chain",
    description: overrides?.description ?? "A test chain",
    steps: overrides?.steps ?? [],
    variables: overrides?.variables ?? {},
    errorHandling: overrides?.errorHandling ?? "stop",
    createdAt: overrides?.createdAt ?? "2026-01-01T00:00:00.000Z",
    updatedAt: overrides?.updatedAt ?? "2026-01-01T00:00:00.000Z",
  };
}

describe("SkillChainStore", () => {
  let store: SkillChainStore;
  let tempDir: string;
  let storagePath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "skill-chain-test-"));
    storagePath = path.join(tempDir, "chains.json");
    store = new SkillChainStore(storagePath);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("save", () => {
    it("新規チェーン定義を保存し、保存された定義を返す", async () => {
      const chain = createTestChain();
      const saved = await store.save(chain);
      expect(saved.id).toBe("test-chain-1");
      expect(saved.name).toBe("Test Chain");
    });

    it("既存のチェーン定義を上書き保存する（同一 id）", async () => {
      const chain = createTestChain();
      await store.save(chain);
      const updated = createTestChain({ name: "Updated Chain" });
      const saved = await store.save(updated);
      expect(saved.name).toBe("Updated Chain");
      const fetched = await store.get("test-chain-1");
      expect(fetched?.name).toBe("Updated Chain");
    });

    it("updatedAt が保存時に更新される", async () => {
      const chain = createTestChain({ updatedAt: "2020-01-01T00:00:00.000Z" });
      const saved = await store.save(chain);
      expect(saved.updatedAt).not.toBe("2020-01-01T00:00:00.000Z");
      expect(() => new Date(saved.updatedAt)).not.toThrow();
    });
  });

  describe("get", () => {
    it("指定 chainId のチェーン定義を取得する", async () => {
      await store.save(createTestChain());
      const result = await store.get("test-chain-1");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("test-chain-1");
    });

    it("存在しない chainId の場合、null を返す", async () => {
      const result = await store.get("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("list", () => {
    it("保存済みの全チェーン定義を配列で返す", async () => {
      await store.save(createTestChain({ id: "chain-1" }));
      await store.save(createTestChain({ id: "chain-2" }));
      const result = await store.list();
      expect(result).toHaveLength(2);
    });

    it("チェーンが0件の場合、空配列を返す", async () => {
      const result = await store.list();
      expect(result).toEqual([]);
    });

    it("複数チェーンが保存されている場合、全件を返す", async () => {
      for (let i = 0; i < 5; i++) {
        await store.save(createTestChain({ id: `chain-${i}` }));
      }
      const result = await store.list();
      expect(result).toHaveLength(5);
    });
  });

  describe("delete", () => {
    it("指定 chainId のチェーン定義を削除する", async () => {
      await store.save(createTestChain());
      const deleted = await store.delete("test-chain-1");
      expect(deleted).toBe(true);
      const result = await store.get("test-chain-1");
      expect(result).toBeNull();
    });

    it("存在しない chainId を削除してもエラーを投げない", async () => {
      const deleted = await store.delete("non-existent");
      expect(deleted).toBe(false);
    });

    it("削除後に list の件数が減少する", async () => {
      await store.save(createTestChain({ id: "chain-1" }));
      await store.save(createTestChain({ id: "chain-2" }));
      await store.delete("chain-1");
      const result = await store.list();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("chain-2");
    });
  });

  describe("boundary cases", () => {
    it("ストレージファイルが破損（不正JSON）の場合、空配列を返す", async () => {
      await fs.promises.writeFile(storagePath, "INVALID JSON", "utf-8");
      const result = await store.list();
      expect(result).toEqual([]);
    });

    it("variables が深くネストしたオブジェクトでも保存・復元する", async () => {
      const chain = createTestChain({
        variables: { a: { b: { c: { d: { e: "deep" } } } } },
      });
      await store.save(chain);
      const result = await store.get(chain.id);
      expect((result?.variables as Record<string, unknown>)?.a).toEqual({
        b: { c: { d: { e: "deep" } } },
      });
    });
  });
});
