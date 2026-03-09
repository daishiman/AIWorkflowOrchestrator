/**
 * agentSlice 同時実行ガードテスト (T-01〜T-05)
 *
 * isExecuting フラグによる executeSkill の二重実行防止を検証する。
 * Red Phase: ガード未実装のため T-02〜T-05 は FAIL が期待される。
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createAgentSlice, type AgentSlice } from "../agentSlice";

// ============================================
// Store ヘルパー
// ============================================

function createStore(): { getState: () => AgentSlice } {
  let store = {} as AgentSlice;
  const state = {} as Partial<AgentSlice>;
  const set = (
    fn: ((current: AgentSlice) => Partial<AgentSlice>) | Partial<AgentSlice>,
  ) => {
    const partial =
      typeof fn === "function" ? fn(store) : (fn as Partial<AgentSlice>);
    Object.assign(state, partial);
    store = { ...store, ...state } as AgentSlice;
  };
  const get = () => store;
  store = createAgentSlice(set as never, get as never, {} as never);
  return { getState: () => store };
}

// ============================================
// electronAPI モック
// ============================================

function mockElectronAPI(executeMock: ReturnType<typeof vi.fn>) {
  Object.defineProperty(window, "electronAPI", {
    configurable: true,
    value: {
      authKey: { exists: vi.fn().mockResolvedValue({ exists: true }) },
      skill: { execute: executeMock },
    },
  });
}

function cleanupElectronAPI() {
  if ("electronAPI" in window) {
    delete (window as any).electronAPI;
  }
}

/**
 * microtask を1つ進めるヘルパー。
 * executeSkill 内部の await preflightSkillExecutionAuth() を通過させ、
 * set({ isExecuting: true }) に到達させるために使用する。
 */
function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

// ============================================
// テスト本体
// ============================================

describe("agentSlice concurrency guard", () => {
  let executeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    cleanupElectronAPI();

    // execute は Promise を返す（解決を遅延可能にする）
    executeMock = vi.fn().mockResolvedValue({ executionId: "exec-001" });
    mockElectronAPI(executeMock);
  });

  // ------------------------------------------
  // T-01: isExecuting === false で正常に実行開始する (AC-01)
  // ------------------------------------------
  it("T-01: isExecuting === false で executeSkill が正常に実行開始する", async () => {
    const { getState } = createStore();

    // スキルを選択
    getState().selectSkillByName("test-skill");

    // 実行前は isExecuting === false
    expect(getState().isExecuting).toBe(false);

    // executeSkill を呼び出し
    await getState().executeSkill("hello");

    // executeMock が1回呼ばれる
    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(executeMock).toHaveBeenCalledWith({
      skillName: "test-skill",
      prompt: "hello",
    });
  });

  // ------------------------------------------
  // T-02: isExecuting === true で executeSkill が即座に return する (AC-01)
  // ------------------------------------------
  it("T-02: isExecuting === true で executeSkill が即座にreturnする", async () => {
    const { getState } = createStore();

    // スキルを選択
    getState().selectSkillByName("test-skill");

    // 1回目の execute を開始し、IPC resolve を遅延させる
    let resolveFirst!: (value: { executionId: string }) => void;
    executeMock.mockImplementationOnce(
      () =>
        new Promise<{ executionId: string }>((resolve) => {
          resolveFirst = resolve;
        }),
    );

    // 1回目を開始（await しない）
    const firstCall = getState().executeSkill("first");

    // preflightSkillExecutionAuth の await を通過させる
    await flushMicrotasks();

    // isExecuting が true になっているはず
    expect(getState().isExecuting).toBe(true);
    expect(getState().skillExecutionStatus).toBe("running");

    // 2回目を呼び出し — ガードにより即座に return すべき
    await getState().executeSkill("second");

    // executeMock は1回目だけ呼ばれるべき
    expect(executeMock).toHaveBeenCalledTimes(1);

    // 1回目を解決してクリーンアップ
    resolveFirst({ executionId: "exec-001" });
    await firstCall;
  });

  // ------------------------------------------
  // T-03: ガード拒否時、streamingMessages が変更されない (AC-02)
  // ------------------------------------------
  it("T-03: ガード拒否時、streamingMessages が変更されない", async () => {
    const { getState } = createStore();

    // スキルを選択
    getState().selectSkillByName("test-skill");

    // 1回目を開始して isExecuting = true にする
    let resolveFirst!: (value: { executionId: string }) => void;
    executeMock.mockImplementationOnce(
      () =>
        new Promise<{ executionId: string }>((resolve) => {
          resolveFirst = resolve;
        }),
    );

    const firstCall = getState().executeSkill("first");

    // preflight を通過させる
    await flushMicrotasks();

    // streamingMessages に手動でメッセージを追加
    // （1回目の executeSkill 内で [] にリセットされた後に追加）
    getState()._handleStreamMessage({
      type: "text",
      content: "existing message",
    });
    const messagesBeforeSecondCall = [...getState().streamingMessages];
    expect(messagesBeforeSecondCall).toHaveLength(1);

    // 2回目を呼び出し — ガードにより拒否されるべき
    await getState().executeSkill("second");

    // streamingMessages が変更されていないことを検証
    expect(getState().streamingMessages).toEqual(messagesBeforeSecondCall);

    // クリーンアップ
    resolveFirst({ executionId: "exec-001" });
    await firstCall;
  });

  // ------------------------------------------
  // T-04: ガード拒否時、executionId が上書きされない (AC-03)
  // ------------------------------------------
  it("T-04: ガード拒否時、executionId が上書きされない", async () => {
    const { getState } = createStore();

    // スキルを選択
    getState().selectSkillByName("test-skill");

    // 1回目を開始して isExecuting = true にする
    let resolveFirst!: (value: { executionId: string }) => void;
    executeMock.mockImplementationOnce(
      () =>
        new Promise<{ executionId: string }>((resolve) => {
          resolveFirst = resolve;
        }),
    );

    const firstCall = getState().executeSkill("first");

    // preflight を通過させ、set({ isExecuting: true, executionId: ... }) まで到達
    await flushMicrotasks();

    // 1回目で設定された executionId を記録
    const executionIdAfterFirst = getState().executionId;
    expect(executionIdAfterFirst).toBeTruthy();

    // 2回目を呼び出し — ガードにより拒否されるべき
    await getState().executeSkill("second");

    // executionId が上書きされていないことを検証
    expect(getState().executionId).toBe(executionIdAfterFirst);

    // クリーンアップ
    resolveFirst({ executionId: "exec-001" });
    await firstCall;
  });

  // ------------------------------------------
  // T-05: executeSkill を連続2回呼び出した場合、2回目がガードされる (AC-01)
  // ------------------------------------------
  it("T-05: executeSkill を連続2回呼び出した場合、2回目がガードされる", async () => {
    const { getState } = createStore();

    // スキルを選択
    getState().selectSkillByName("test-skill");

    // execute を遅延させる
    let resolveFirst!: (value: { executionId: string }) => void;
    executeMock.mockImplementationOnce(
      () =>
        new Promise<{ executionId: string }>((resolve) => {
          resolveFirst = resolve;
        }),
    );

    // 1回目を呼び出し（await しない）
    const call1 = getState().executeSkill("first");

    // preflight を通過させ isExecuting = true にする
    await flushMicrotasks();

    // 2回目を呼び出し — ガードにより拒否されるべき
    const call2 = getState().executeSkill("second");

    // 両方を待つ
    resolveFirst({ executionId: "exec-001" });
    await Promise.all([call1, call2]);

    // executeMock は1回のみ呼ばれるべき
    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(executeMock).toHaveBeenCalledWith({
      skillName: "test-skill",
      prompt: "first",
    });
  });
});

// ============================================
// Phase 6: テスト拡充 (T-09〜T-12)
// ============================================

describe("agentSlice concurrency guard - extended", () => {
  let executeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    cleanupElectronAPI();
    executeMock = vi.fn().mockResolvedValue({ executionId: "exec-001" });
    mockElectronAPI(executeMock);
  });

  // ------------------------------------------
  // T-09: エラー後に isExecuting が false に戻る
  // ------------------------------------------
  it("T-09: executeSkill がエラーで終了した後、isExecuting が false に戻る", async () => {
    const { getState } = createStore();
    getState().selectSkillByName("test-skill");

    // execute がエラーを投げるようモック
    executeMock.mockRejectedValueOnce(new Error("IPC error"));

    await getState().executeSkill("hello");

    // エラー後に isExecuting が false に戻ることを検証
    expect(getState().isExecuting).toBe(false);
    expect(getState().skillExecutionStatus).toBe("error");
    expect(getState().skillError).toBeTruthy();
  });

  // ------------------------------------------
  // T-10: 完了後に再度 executeSkill が実行可能
  // ------------------------------------------
  it("T-10: executeSkill 完了後に再度 executeSkill を呼ぶと正常に実行される", async () => {
    const { getState } = createStore();
    getState().selectSkillByName("test-skill");

    // 1回目の実行・完了
    await getState().executeSkill("first");
    expect(executeMock).toHaveBeenCalledTimes(1);

    // _handleComplete で isExecuting を false に戻す
    getState()._handleComplete("exec-001");
    expect(getState().isExecuting).toBe(false);

    // 2回目の実行
    await getState().executeSkill("second");
    expect(executeMock).toHaveBeenCalledTimes(2);
  });

  // ------------------------------------------
  // T-11: selectedSkillName 未設定時は isExecuting ガード前に return
  // ------------------------------------------
  it("T-11: selectedSkillName 未設定の場合、isExecuting ガード前に return する", async () => {
    const { getState } = createStore();
    // selectedSkillName を設定しない

    await getState().executeSkill("hello");

    expect(executeMock).not.toHaveBeenCalled();
    expect(getState().isExecuting).toBe(false);
  });

  // ------------------------------------------
  // T-12: 3回連続呼び出しで2回目と3回目がガードされる
  // ------------------------------------------
  it("T-12: 3回連続呼び出しで2回目と3回目がガードされる", async () => {
    const { getState } = createStore();
    getState().selectSkillByName("test-skill");

    // execute を遅延させる
    let resolveFirst!: (value: { executionId: string }) => void;
    executeMock.mockImplementationOnce(
      () =>
        new Promise<{ executionId: string }>((resolve) => {
          resolveFirst = resolve;
        }),
    );

    // 1回目を開始（await しない）
    const p1 = getState().executeSkill("first");
    await flushMicrotasks();

    // 2回目・3回目（ガードにより拒否されるべき）
    const p2 = getState().executeSkill("second");
    const p3 = getState().executeSkill("third");

    resolveFirst({ executionId: "exec-001" });
    await Promise.all([p1, p2, p3]);

    // execute は1回のみ呼ばれる
    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(executeMock).toHaveBeenCalledWith({
      skillName: "test-skill",
      prompt: "first",
    });
  });
});
