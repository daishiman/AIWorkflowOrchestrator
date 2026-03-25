/**
 * ApprovalGate ユニットテスト
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Phase 4
 * テストケース: APR-10〜APR-16
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DefaultApprovalGate } from "../ApprovalGate";

describe("DefaultApprovalGate", () => {
  let gate: DefaultApprovalGate;

  beforeEach(() => {
    gate = new DefaultApprovalGate();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // APR-10: 承認後に Main Process で approval token が有効
  it("APR-10: checkApproval returns approved after grantApproval", () => {
    const grant = gate.grantApproval("session-1", "op-1");
    expect(grant.approved).toBe(true);
    if (!grant.approved) return;

    const check = gate.checkApproval("session-1", "op-1", grant.token);
    expect(check.approved).toBe(true);
  });

  // APR-11: 承認なしで実行が拒否される
  it("APR-11: checkApproval returns not_requested without prior grant", () => {
    const check = gate.checkApproval("session-1", "op-1", "fake-token");
    expect(check.approved).toBe(false);
    if (check.approved) return;
    expect(check.reason).toBe("not_requested");
  });

  // APR-12: 期限切れ token で実行が拒否される (TTL = 300s)
  it("APR-12: checkApproval returns expired after TTL", () => {
    const grant = gate.grantApproval("session-1", "op-1");
    if (!grant.approved) return;

    // 301秒後
    vi.advanceTimersByTime(301 * 1000);

    const check = gate.checkApproval("session-1", "op-1", grant.token);
    expect(check.approved).toBe(false);
    if (check.approved) return;
    expect(check.reason).toBe("expired");
  });

  // APR-13: 別セッションの token が拒否される
  it("APR-13: checkApproval rejects token from different session", () => {
    const grant = gate.grantApproval("session-1", "op-1");
    if (!grant.approved) return;

    const check = gate.checkApproval("session-2", "op-1", grant.token);
    expect(check.approved).toBe(false);
    if (check.approved) return;
    expect(check.reason).toBe("not_requested");
  });

  // 単一操作失効: 使用済み token が拒否される
  it("rejects already-used token (single-use enforcement)", () => {
    const grant = gate.grantApproval("session-1", "op-1");
    if (!grant.approved) return;

    // 1回目: 成功
    const first = gate.checkApproval("session-1", "op-1", grant.token);
    expect(first.approved).toBe(true);

    // 2回目: already_used
    const second = gate.checkApproval("session-1", "op-1", grant.token);
    expect(second.approved).toBe(false);
    if (second.approved) return;
    expect(second.reason).toBe("already_used");
  });

  // token 不一致で拒否
  it("rejects mismatched token", () => {
    gate.grantApproval("session-1", "op-1");

    const check = gate.checkApproval("session-1", "op-1", "wrong-token");
    expect(check.approved).toBe(false);
    if (check.approved) return;
    expect(check.reason).toBe("not_requested");
  });

  // rejectApproval でエントリが削除される
  it("rejectApproval removes the entry", () => {
    const grant = gate.grantApproval("session-1", "op-1");
    if (!grant.approved) return;

    gate.rejectApproval("session-1", "op-1");

    const check = gate.checkApproval("session-1", "op-1", grant.token);
    expect(check.approved).toBe(false);
  });

  // revokeAll で全セッション token が無効化される
  it("revokeAll invalidates all tokens for a session", () => {
    const g1 = gate.grantApproval("session-1", "op-1");
    const g2 = gate.grantApproval("session-1", "op-2");
    const g3 = gate.grantApproval("session-2", "op-1");
    if (!g1.approved || !g2.approved || !g3.approved) return;

    gate.revokeAll("session-1");

    expect(gate.checkApproval("session-1", "op-1", g1.token).approved).toBe(
      false,
    );
    expect(gate.checkApproval("session-1", "op-2", g2.token).approved).toBe(
      false,
    );
    // session-2 は影響なし
    expect(gate.checkApproval("session-2", "op-1", g3.token).approved).toBe(
      true,
    );
  });

  // grantApproval は crypto-safe token を生成する
  it("generates unique tokens for different operations", () => {
    const g1 = gate.grantApproval("session-1", "op-1");
    const g2 = gate.grantApproval("session-1", "op-2");
    if (!g1.approved || !g2.approved) return;

    expect(g1.token).not.toBe(g2.token);
    expect(g1.token.length).toBe(64); // 32 bytes hex = 64 chars
  });
});
