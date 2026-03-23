/**
 * Permission Store V2 Types Unit Tests
 *
 * UT-06-002: AllowedToolEntryV2 PermissionStore 適用
 * Phase 4: テスト作成（TDD: Red）
 *
 * calcExpiresAt 関数と V2 型定義のテスト
 */

import { describe, it, expect } from "vitest";
import {
  calcExpiresAt,
  PERMISSION_HISTORY_MAX_ENTRIES,
} from "../permission-store";
import type {
  ExpiryPolicy,
  AllowedToolEntryV2,
  AllowedToolEntry,
  PermissionStoreSchemaV2,
} from "../permission-store";

// =================================================================
// TC-CEA: calcExpiresAt テスト
// =================================================================

describe("calcExpiresAt", () => {
  const BASE_TIME = 1700000000000; // 2023-11-14T22:13:20.000Z

  // TC-CEA-01: session ポリシー
  it("session ポリシーで undefined を返す", () => {
    const result = calcExpiresAt("session", BASE_TIME);
    expect(result).toBeUndefined();
  });

  // TC-CEA-02: time_24h ポリシー
  it("time_24h ポリシーで +86400000ms を返す", () => {
    const result = calcExpiresAt("time_24h", BASE_TIME);
    expect(result).toBe(BASE_TIME + 86_400_000);
  });

  // TC-CEA-03: time_7d ポリシー
  it("time_7d ポリシーで +604800000ms を返す", () => {
    const result = calcExpiresAt("time_7d", BASE_TIME);
    expect(result).toBe(BASE_TIME + 604_800_000);
  });

  // TC-CEA-04: permanent ポリシー
  it("permanent ポリシーで undefined を返す", () => {
    const result = calcExpiresAt("permanent", BASE_TIME);
    expect(result).toBeUndefined();
  });

  // エッジケース: allowedAt = 0
  it("allowedAt が 0 でも正しく計算する", () => {
    expect(calcExpiresAt("time_24h", 0)).toBe(86_400_000);
    expect(calcExpiresAt("time_7d", 0)).toBe(604_800_000);
  });

  // 全ポリシーの網羅性テスト
  it("全 ExpiryPolicy 値が処理される", () => {
    const policies: ExpiryPolicy[] = [
      "session",
      "time_24h",
      "time_7d",
      "permanent",
    ];
    for (const policy of policies) {
      expect(() => calcExpiresAt(policy, BASE_TIME)).not.toThrow();
    }
  });
});

// =================================================================
// V2 型互換性テスト
// =================================================================

describe("AllowedToolEntryV2 型互換性", () => {
  it("V1 エントリは V2 に代入可能（後方互換性）", () => {
    const v1Entry: AllowedToolEntry = {
      toolName: "Read",
      allowedAt: "2026-01-25T12:00:00.000Z",
    };

    // V1 は V2 に代入可能（V2 の拡張フィールドは全て optional）
    const v2Entry: AllowedToolEntryV2 = v1Entry;
    expect(v2Entry.toolName).toBe("Read");
    expect(v2Entry.expiresAt).toBeUndefined();
    expect(v2Entry.skillName).toBeUndefined();
    expect(v2Entry.expiryPolicy).toBeUndefined();
  });

  it("V2 エントリの全フィールドを設定可能", () => {
    const entry: AllowedToolEntryV2 = {
      toolName: "Bash",
      allowedAt: "2026-01-25T12:00:00.000Z",
      expiresAt: 1700086400000,
      skillName: "my-skill",
      expiryPolicy: "time_24h",
    };

    expect(entry.toolName).toBe("Bash");
    expect(entry.expiresAt).toBe(1700086400000);
    expect(entry.skillName).toBe("my-skill");
    expect(entry.expiryPolicy).toBe("time_24h");
  });
});

// =================================================================
// PermissionStoreSchemaV2 テスト
// =================================================================

describe("PermissionStoreSchemaV2", () => {
  it("V2 スキーマの構造が正しい", () => {
    const schema: PermissionStoreSchemaV2 = {
      version: 2,
      allowedTools: [
        {
          toolName: "Read",
          allowedAt: "2026-01-25T12:00:00.000Z",
          expiryPolicy: "permanent",
        },
      ],
      updatedAt: "2026-01-25T12:00:00.000Z",
    };

    expect(schema.version).toBe(2);
    expect(schema.allowedTools).toHaveLength(1);
    expect(schema.allowedTools[0].expiryPolicy).toBe("permanent");
  });
});

// =================================================================
// 定数テスト
// =================================================================

describe("PERMISSION_HISTORY_MAX_ENTRIES", () => {
  it("1000 が定義されている", () => {
    expect(PERMISSION_HISTORY_MAX_ENTRIES).toBe(1000);
  });
});
