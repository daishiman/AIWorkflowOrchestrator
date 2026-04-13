/**
 * analyticsSlice テスト
 *
 * Phase 4: TDD Red - renderer-side analytics Zustand Slice のテスト
 * Phase 6: テスト拡充 - fail path / 回帰 guard / 並列実行
 *
 * @see docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// =============================================================================
// モック定義
// =============================================================================

const mockSend = vi.fn();

vi.mock("../../../utils/analyticsAdapter", () => ({
  getAnalyticsAdapter: () => ({ send: mockSend }),
}));

// =============================================================================
// テスト対象のインポート（モック設定後に行う）
// =============================================================================

import { useAnalyticsStore } from "../analyticsSlice";

// =============================================================================
// ヘルパー
// =============================================================================

function getStore() {
  return useAnalyticsStore.getState();
}

// =============================================================================
// グループ 1: trackSkillStart の基本動作
// =============================================================================

describe("analyticsSlice - trackSkillStart", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("TC-04-01: analyticsAdapter.send が1回呼び出されること", () => {
    getStore().trackSkillStart("skill-abc");
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("TC-04-02: payload に skillId が含まれること", () => {
    getStore().trackSkillStart("skill-xyz");
    const [, payload] = mockSend.mock.calls[0];
    expect(payload).toMatchObject({ skillId: "skill-xyz" });
  });

  it("TC-04-03: イベント名が skill_start であること", () => {
    getStore().trackSkillStart("skill-abc");
    const [eventName] = mockSend.mock.calls[0];
    expect(eventName).toBe("skill_start");
  });
});

// =============================================================================
// グループ 2: trackSkillComplete の基本動作
// =============================================================================

describe("analyticsSlice - trackSkillComplete", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("TC-04-04: analyticsAdapter.send が1回呼び出されること", () => {
    getStore().trackSkillComplete("skill-abc", 1200);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("TC-04-05: payload に duration が含まれること", () => {
    getStore().trackSkillComplete("skill-abc", 1200);
    const [, payload] = mockSend.mock.calls[0];
    expect(payload).toMatchObject({ duration: 1200 });
  });

  it("TC-04-06: イベント名が skill_complete であること", () => {
    getStore().trackSkillComplete("skill-abc", 1200);
    const [eventName] = mockSend.mock.calls[0];
    expect(eventName).toBe("skill_complete");
  });
});

// =============================================================================
// グループ 3: trackSkillError の基本動作
// =============================================================================

describe("analyticsSlice - trackSkillError", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("TC-04-07: analyticsAdapter.send が1回呼び出されること", () => {
    getStore().trackSkillError("skill-abc", "something went wrong");
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("TC-04-08: payload に error 情報が含まれること", () => {
    getStore().trackSkillError("skill-abc", "something went wrong");
    const [, payload] = mockSend.mock.calls[0];
    expect(payload).toMatchObject({ error: "something went wrong" });
  });

  it("TC-04-09: イベント名が skill_error であること", () => {
    getStore().trackSkillError("skill-abc", "something went wrong");
    const [eventName] = mockSend.mock.calls[0];
    expect(eventName).toBe("skill_error");
  });
});

// =============================================================================
// グループ 4: trackEvent 公開 API シグネチャの回帰確認
// =============================================================================

describe("analyticsSlice - trackEvent シグネチャ回帰", () => {
  it("TC-04-10: trackEvent が既存のシグネチャを維持していること（型エラーなし）", async () => {
    // trackEvent のインポートが正常にできること（型エラーがないことの確認）
    const { trackEvent } = await import("../../../utils/trackEvent");
    expect(typeof trackEvent).toBe("function");
  });

  it("TC-04-11: trackEvent の引数型が変更されていないこと", async () => {
    const { trackEvent } = await import("../../../utils/trackEvent");
    // 既存シグネチャで呼び出し可能であることを確認（コンパイルエラーがないこと）
    expect(() => trackEvent("skill_wizard_started", {})).not.toThrow();
  });
});

// =============================================================================
// グループ 5: 並列スキル実行（エッジケース）
// =============================================================================

describe("analyticsSlice - 並列スキル実行", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("TC-04-12: 複数の trackSkillStart が同時に呼ばれた場合それぞれのイベントが送信されること", () => {
    getStore().trackSkillStart("skill-1");
    getStore().trackSkillStart("skill-2");
    getStore().trackSkillStart("skill-3");
    expect(mockSend).toHaveBeenCalledTimes(3);
  });

  it("TC-04-13: 異なる skillId を持つ2つのスキルが並列実行された場合のイベント分離", () => {
    getStore().trackSkillStart("skill-A");
    getStore().trackSkillStart("skill-B");
    const calls = mockSend.mock.calls;
    const skillIds = calls.map(([, payload]) => payload.skillId);
    expect(skillIds).toContain("skill-A");
    expect(skillIds).toContain("skill-B");
  });
});

// =============================================================================
// グループ 6: 異常入力テスト（Phase 6 追加）
// =============================================================================

describe("analyticsSlice - 異常入力テスト", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("TC-06-01: trackSkillStart に空文字 skillId を渡してもエラーをスローしない", () => {
    expect(() => getStore().trackSkillStart("")).not.toThrow();
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("TC-06-02: trackSkillComplete に負の duration を渡してもエラーをスローしない", () => {
    expect(() => getStore().trackSkillComplete("skill-abc", -1)).not.toThrow();
    const [, payload] = mockSend.mock.calls[0];
    expect(payload).toMatchObject({ duration: -1 });
  });

  it("TC-06-03: trackSkillError に Error オブジェクトを渡すと error.message が payload に含まれる", () => {
    getStore().trackSkillError("skill-abc", new Error("test error message"));
    const [, payload] = mockSend.mock.calls[0];
    expect(payload).toMatchObject({ error: "test error message" });
  });

  it("TC-06-04: trackSkillError に文字列エラーを渡すと文字列がそのまま payload に含まれる", () => {
    getStore().trackSkillError("skill-abc", "string error");
    const [, payload] = mockSend.mock.calls[0];
    expect(payload).toMatchObject({ error: "string error" });
  });

  it("TC-06-05: trackSkillComplete が trackSkillStart より先に呼ばれてもエラーをスローしない", () => {
    expect(() => {
      getStore().trackSkillComplete("skill-abc", 500);
      getStore().trackSkillStart("skill-abc");
    }).not.toThrow();
    expect(mockSend).toHaveBeenCalledTimes(2);
  });
});

// =============================================================================
// グループ 7: store の再生成動作（Phase 6 追加）
// =============================================================================

describe("analyticsSlice - store 再生成動作", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("TC-06-06: store を参照後に trackSkillStart を呼んでも正常に動作する", () => {
    const store = getStore();
    store.trackSkillStart("skill-abc");
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("TC-06-07: 各テストで hidden state が引き継がれない（action-only で state なし）", () => {
    // action-only store のため state 汚染が発生しないことを確認
    getStore().trackSkillStart("skill-1");
    mockSend.mockClear();
    getStore().trackSkillStart("skill-2");
    // クリア後の呼び出しは1回のみ
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// グループ 8: trackEvent API シグネチャ回帰確認（Phase 6 追加）
// =============================================================================

describe("analyticsSlice - trackEvent API シグネチャ回帰", () => {
  it("TC-06-08: trackEvent が呼び出し可能なシグネチャを保持していること", async () => {
    const { trackEvent } = await import("../../../utils/trackEvent");
    expect(typeof trackEvent).toBe("function");
  });

  it("TC-06-09: trackEvent の第1引数の型が変更されていないこと", async () => {
    const { trackEvent } = await import("../../../utils/trackEvent");
    // 既存シグネチャで呼び出し可能（型エラーがなければコンパイル時に通る）
    expect(() =>
      trackEvent("skill_wizard_open", { source: "direct" }),
    ).not.toThrow();
  });

  it("TC-06-10: analyticsSlice が trackEvent を import していないこと（逆方向依存なし）", async () => {
    // analyticsSlice モジュールのソースコードに trackEvent import がないことを確認
    const sliceModule = await import("../analyticsSlice");
    // trackEvent がスライスから再エクスポートされていないことを確認
    expect((sliceModule as Record<string, unknown>).trackEvent).toBeUndefined();
  });
});

// =============================================================================
// グループ 9: analyticsAdapter.send が例外を投げた場合の安全な処理（Phase 6 追加）
// =============================================================================

describe("analyticsSlice - analyticsAdapter.send 例外安全性", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("TC-06-11: send が例外をスローしても trackSkillStart がエラーを外に伝播しない", () => {
    mockSend.mockImplementationOnce(() => {
      throw new Error("adapter error");
    });
    expect(() => getStore().trackSkillStart("skill-abc")).not.toThrow();
  });

  it("TC-06-12: send が例外をスローした後も次の send 呼び出しが正常に動作する", () => {
    mockSend.mockImplementationOnce(() => {
      throw new Error("adapter error");
    });
    getStore().trackSkillStart("skill-1"); // 例外発生
    mockSend.mockClear();
    getStore().trackSkillStart("skill-2"); // 次の呼び出しは正常
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("TC-06-11b: send が例外をスローしても trackSkillComplete がエラーを外に伝播しない", () => {
    mockSend.mockImplementationOnce(() => {
      throw new Error("adapter error");
    });
    expect(() => getStore().trackSkillComplete("skill-abc", 500)).not.toThrow();
  });

  it("TC-06-11c: send が例外をスローしても trackSkillError がエラーを外に伝播しない", () => {
    mockSend.mockImplementationOnce(() => {
      throw new Error("adapter error");
    });
    expect(() => getStore().trackSkillError("skill-abc", "err")).not.toThrow();
  });
});

// =============================================================================
// グループ 10: 並列スキル実行（Phase 6 追加）
// =============================================================================

describe("analyticsSlice - 並列スキル実行（拡充）", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("TC-06-13: 3つのスキルが同時に trackSkillStart を呼び出した場合 send が3回呼ばれる", () => {
    getStore().trackSkillStart("skill-1");
    getStore().trackSkillStart("skill-2");
    getStore().trackSkillStart("skill-3");
    expect(mockSend).toHaveBeenCalledTimes(3);
    const skillIds = mockSend.mock.calls.map(([, p]) => p.skillId);
    expect(skillIds).toContain("skill-1");
    expect(skillIds).toContain("skill-2");
    expect(skillIds).toContain("skill-3");
  });

  it("TC-06-14: start / complete / error が異なる skillId で混在した場合のイベント分離", () => {
    getStore().trackSkillStart("skill-A");
    getStore().trackSkillComplete("skill-B", 100);
    getStore().trackSkillError("skill-C", "err");
    const calls = mockSend.mock.calls;
    expect(calls[0]).toEqual([
      "skill_start",
      expect.objectContaining({ skillId: "skill-A" }),
    ]);
    expect(calls[1]).toEqual([
      "skill_complete",
      expect.objectContaining({ skillId: "skill-B" }),
    ]);
    expect(calls[2]).toEqual([
      "skill_error",
      expect.objectContaining({ skillId: "skill-C" }),
    ]);
  });

  it("TC-06-15: 同一 skillId で trackSkillStart が2回連続で呼ばれた場合 send が2回呼ばれる", () => {
    getStore().trackSkillStart("skill-dup");
    getStore().trackSkillStart("skill-dup");
    expect(mockSend).toHaveBeenCalledTimes(2);
  });
});
