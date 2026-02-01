/**
 * @file permissionHistory データモデル・ユーティリティテスト
 * @description TDD Red Phase - Permission履歴エントリの作成・安全化テスト
 * @feature task-imp-permission-history-001
 */

import { describe, it, expect } from "vitest";
import {
  safeArgsSnapshot,
  createHistoryEntry,
  PERMISSION_HISTORY_MAX_ENTRIES,
  ARGS_SNAPSHOT_MAX_LENGTH,
  type PermissionDecision,
} from "../permissionHistory";

// ==========================================================================
// safeArgsSnapshot テスト
// ==========================================================================

describe("safeArgsSnapshot", () => {
  it("単純な引数オブジェクトを文字列に変換する", () => {
    const args = { command: "ls -la" };
    const result = safeArgsSnapshot(args);
    expect(result).toContain("ls -la");
    expect(typeof result).toBe("string");
  });

  it("空オブジェクトを処理する", () => {
    const result = safeArgsSnapshot({});
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it("200文字を超える引数を切り詰める", () => {
    const longValue = "a".repeat(300);
    const args = { command: longValue };
    const result = safeArgsSnapshot(args);
    expect(result.length).toBeLessThanOrEqual(ARGS_SNAPSHOT_MAX_LENGTH + 3); // +3 for "..."
  });

  it("HTMLタグを除去する（XSS防止）", () => {
    const args = { command: '<script>alert("xss")</script>' };
    const result = safeArgsSnapshot(args);
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("</script>");
  });

  it("制御文字を除去する", () => {
    const args = { command: "test\x00\x01\x02value" };
    const result = safeArgsSnapshot(args);
    // eslint-disable-next-line no-control-regex
    expect(result).not.toMatch(/[\x00-\x1f]/);
  });

  it("ネストされたオブジェクトを処理する", () => {
    const args = { nested: { deep: { value: "test" } } };
    const result = safeArgsSnapshot(args);
    expect(typeof result).toBe("string");
    expect(result).toContain("test");
  });

  it("配列を含む引数を処理する", () => {
    const args = { items: [1, 2, 3] };
    const result = safeArgsSnapshot(args);
    expect(typeof result).toBe("string");
  });

  it("null/undefinedの値を安全に処理する", () => {
    const args = { value: null, other: undefined } as Record<string, unknown>;
    const result = safeArgsSnapshot(args);
    expect(typeof result).toBe("string");
  });

  it("JSON.stringify失敗時（循環参照）に'{}'を返す", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const result = safeArgsSnapshot(circular);
    expect(result).toBe("{}");
  });
});

// ==========================================================================
// createHistoryEntry テスト
// ==========================================================================

describe("createHistoryEntry", () => {
  it("approvedエントリを正しく作成する", () => {
    const entry = createHistoryEntry({
      toolName: "Bash",
      args: { command: "ls -la" },
      decision: "approved",
    });

    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
    expect(entry.toolName).toBe("Bash");
    expect(entry.decision).toBe("approved");
    expect(typeof entry.argsSnapshot).toBe("string");
  });

  it("deniedエントリを正しく作成する", () => {
    const entry = createHistoryEntry({
      toolName: "Write",
      args: { file_path: "/etc/passwd" },
      decision: "denied",
    });

    expect(entry.decision).toBe("denied");
    expect(entry.toolName).toBe("Write");
  });

  it("approved_onceエントリを正しく作成する", () => {
    const entry = createHistoryEntry({
      toolName: "Read",
      args: { file_path: "/tmp/test.txt" },
      decision: "approved_once",
    });

    expect(entry.decision).toBe("approved_once");
  });

  it("一意のIDをcrypto.randomUUIDで生成する", () => {
    const entry1 = createHistoryEntry({
      toolName: "Bash",
      args: {},
      decision: "approved",
    });
    const entry2 = createHistoryEntry({
      toolName: "Bash",
      args: {},
      decision: "approved",
    });

    expect(entry1.id).not.toBe(entry2.id);
    expect(entry1.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("ISO8601形式のタイムスタンプを設定する", () => {
    const entry = createHistoryEntry({
      toolName: "Bash",
      args: {},
      decision: "approved",
    });

    expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
  });

  it("argsをsafeArgsSnapshotで安全化する", () => {
    const entry = createHistoryEntry({
      toolName: "Bash",
      args: { command: '<script>alert("xss")</script>' },
      decision: "approved",
    });

    expect(entry.argsSnapshot).not.toContain("<script>");
  });

  it("長いargsSnapshotを200文字以内に制限する", () => {
    const longCommand = "x".repeat(500);
    const entry = createHistoryEntry({
      toolName: "Bash",
      args: { command: longCommand },
      decision: "approved",
    });

    expect(entry.argsSnapshot.length).toBeLessThanOrEqual(
      ARGS_SNAPSHOT_MAX_LENGTH + 3,
    );
  });

  it("sessionIdを設定できる", () => {
    const entry = createHistoryEntry({
      toolName: "Bash",
      args: {},
      decision: "approved",
      sessionId: "session-123",
    });

    expect(entry.sessionId).toBe("session-123");
  });

  it("sessionIdが未指定の場合undefinedになる", () => {
    const entry = createHistoryEntry({
      toolName: "Bash",
      args: {},
      decision: "approved",
    });

    expect(entry.sessionId).toBeUndefined();
  });
});

// ==========================================================================
// 定数テスト
// ==========================================================================

describe("定数", () => {
  it("PERMISSION_HISTORY_MAX_ENTRIESが1000である", () => {
    expect(PERMISSION_HISTORY_MAX_ENTRIES).toBe(1000);
  });

  it("ARGS_SNAPSHOT_MAX_LENGTHが200である", () => {
    expect(ARGS_SNAPSHOT_MAX_LENGTH).toBe(200);
  });
});

// ==========================================================================
// 型テスト（コンパイル時に検証）
// ==========================================================================

describe("型定義", () => {
  it("PermissionDecisionが3つの値を持つ", () => {
    const decisions: PermissionDecision[] = [
      "approved",
      "denied",
      "approved_once",
    ];
    expect(decisions).toHaveLength(3);
  });

  it("PermissionHistoryFilterがオプショナルフィールドを持つ", () => {
    const filter1: PermissionHistoryFilter = {};
    const filter2: PermissionHistoryFilter = { toolName: "Bash" };
    const filter3: PermissionHistoryFilter = { decision: "approved" };
    const filter4: PermissionHistoryFilter = {
      toolName: "Bash",
      decision: "denied",
    };

    expect(filter1).toBeDefined();
    expect(filter2.toolName).toBe("Bash");
    expect(filter3.decision).toBe("approved");
    expect(filter4.toolName).toBe("Bash");
  });
});
