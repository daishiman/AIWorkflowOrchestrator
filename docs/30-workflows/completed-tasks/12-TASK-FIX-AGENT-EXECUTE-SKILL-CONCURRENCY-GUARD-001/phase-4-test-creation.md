# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 4                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

Phase 2の設計に基づき、Store層ガード（AC-01〜AC-03）とUI層disabled制御（AC-04〜AC-05）のテストケースを設計し、テストコードを先行作成する（Red Phase）。

## 実行タスク

- テストケース設計: AC-01〜AC-06に対応するテストケースを設計
- Store層テスト作成: `executeSkill` の並行実行ガードを検証するユニットテストを作成
- UI層回帰テスト作成: 既存の実行中UIガード面の回帰を検証するテストを拡張する

## 参照資料

| 資料名             | パス                                                                                                        | 説明                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 2 設計       | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-2-design.md` | ガード設計詳細                     |
| agentSlice実装     | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                      | テスト対象（L742-797）             |
| ChatPanel          | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                                   | `skill-management-toggle` 回帰対象 |
| ExecuteButton      | `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`                                | 実行ボタンの既存ガード面           |
| AgentExecutionView | `apps/desktop/src/renderer/views/AgentExecutionView/AgentExecutionView.tsx`                                 | 入力 disabled の既存ガード面       |
| 既存テスト         | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice*.test.ts`                                      | 既存のagentSliceテスト             |
| preflight テスト   | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.executeSkill.preflight.test.ts`                | executeSkill テストの参考パターン  |
| skill listener     | `apps/desktop/src/renderer/store/setupSkillListeners.ts`                                                    | 完了・エラー時の状態復元経路       |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                 | TDD / coverage /性能下限           |
| fixture 指針       | `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`                                     | fixture 再利用とモック方針         |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                                        | P39（happy-dom/userEvent）         |
| 要件定義書         | `outputs/phase-1/requirements-analysis.md`                                                                  | Phase 1 成果物                     |
| 設計書             | `outputs/phase-2/design-document.md`                                                                        | Phase 2 成果物                     |
| 設計レビュー書     | `outputs/phase-3/design-review.md`                                                                          | Phase 3 成果物                     |

### 前提Phase成果物

| 資料名           | パス                                                                                                               | 用途                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| Phase 1 要件     | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-1-requirements.md`  | 受入基準 AC-01〜AC-06    |
| Phase 2 設計     | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-2-design.md`        | ガード設計詳細           |
| Phase 3 レビュー | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-3-design-review.md` | 設計レビュー結果（PASS） |

## 実行手順

### ステップ1: 既存テスト構造の確認

1. `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.executeSkill.preflight.test.ts` を参照し、`createStore()` パターンを把握する
2. 既存テストのセットアップ: `createAgentSlice` から `set`/`get` をシミュレーションする `createStore()` ヘルパーを使用
3. `window.electronAPI` を `Object.defineProperty` でモックし、IPC呼び出しを制御
4. `setupSkillListeners.ts` を読み、成功・失敗後にどの action が `isExecuting` を戻すかを把握してテストケースへ反映する

**既存テストの createStore パターン:**

```typescript
import { createAgentSlice, type AgentSlice } from "../agentSlice";

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
  return {
    getState: () => store,
  };
}
```

### ステップ2: Store層ガードテストの設計と作成

**テストケース一覧:**

| テストID | テスト内容                                                          | 対応AC |
| -------- | ------------------------------------------------------------------- | ------ |
| T-01     | `isExecuting === false` の場合、`executeSkill` が正常に実行開始する | AC-01  |
| T-02     | `isExecuting === true` の場合、`executeSkill` が即座にreturnする    | AC-01  |
| T-03     | ガード拒否時、`streamingMessages` が変更されない                    | AC-02  |
| T-04     | ガード拒否時、`executionId` が上書きされない                        | AC-03  |
| T-05     | `executeSkill` を連続2回呼び出した場合、2回目がガードされる         | AC-01  |

**テストコード配置先:**

```
apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts
```

**テストコード例:**

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAgentSlice, type AgentSlice } from "../agentSlice";

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

function mockElectronAPI(executeMock: ReturnType<typeof vi.fn>) {
  Object.defineProperty(window, "electronAPI", {
    configurable: true,
    value: {
      authKey: { exists: vi.fn().mockResolvedValue({ exists: true }) },
      skill: { execute: executeMock },
    },
  });
}

describe("executeSkill concurrency guard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("T-01: isExecuting === false で executeSkill が正常に実行開始する", async () => {
    const executeMock = vi.fn().mockResolvedValue({ executionId: "exec-1" });
    mockElectronAPI(executeMock);
    const store = createStore();
    store.getState().selectSkillByName("test-skill");

    await store.getState().executeSkill("hello");

    expect(executeMock).toHaveBeenCalledTimes(1);
    expect(store.getState().skillExecutionStatus).toBe("running");
  });

  it("T-02: isExecuting === true で executeSkill が即座にreturnする", async () => {
    const executeMock = vi.fn().mockResolvedValue({ executionId: "exec-1" });
    mockElectronAPI(executeMock);
    const store = createStore();
    store.getState().selectSkillByName("test-skill");

    // isExecuting を true に設定する（1回目の実行開始をシミュレーション）
    // set() で直接状態を書き換えるか、1回目の実行を開始して await しない
    // 具体的な方法は createStore の set を拡張して外部から状態注入するか検討
    // ...

    expect(executeMock).not.toHaveBeenCalled();
  });

  // T-03〜T-05 は同様のパターンで作成
});
```

### ステップ3: UI層テストの設計と作成

**テストケース一覧:**

| テストID | テスト内容                                                            | 対応AC |
| -------- | --------------------------------------------------------------------- | ------ |
| T-06     | `ExecuteButton` が `isExecuting === true` で非表示になる              | AC-04  |
| T-07     | `AgentExecutionView` の入力が `isExecuting === true` でdisabledになる | AC-04  |
| T-08     | `ChatPanel` の `skill-management-toggle` が `isExecuting` に追従する  | AC-05  |

**テストコード配置先:**

```
apps/desktop/src/renderer/components/organisms/AgentView/__tests__/ExecuteButton.test.tsx
apps/desktop/src/renderer/views/AgentExecutionView/__tests__/AgentExecutionView.test.tsx
apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

**注意事項:**

- P39準拠: happy-dom環境では `userEvent` ではなく `fireEvent` を使用する
- P40準拠: テスト実行は `apps/desktop/` ディレクトリから行う
- ChatPanel は現状のプリミティブ直接セレクタを維持して問題ない。P31観点では合成Hookを導入しないことを確認する
- `testing-fixtures.md` の方針に従い、既存 `createStore()` / `window.electronAPI` モックを再利用して新規 fixture 乱立を避ける

**UI層テストコード例（P39準拠 — fireEvent使用）:**

```tsx
describe("existing UI guard surfaces", () => {
  it("T-06: ExecuteButton は isExecuting=true で null render", () => {
    // components/organisms/AgentView/__tests__/ExecuteButton.test.tsx を拡張
  });

  it("T-07: AgentExecutionView は isExecuting=true で入力が disabled", () => {
    // views/AgentExecutionView/__tests__/AgentExecutionView.test.tsx を拡張
  });

  it("T-08: ChatPanel の skill-management-toggle は isExecuting に追従", () => {
    // components/chat/__tests__/ChatPanel.skill-management.test.tsx を拡張
  });
});
```

### ステップ4: テストの実行確認（Red Phase）

```bash
# Store層テスト
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts

# UI層テスト
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/__tests__/ExecuteButton.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/views/AgentExecutionView/__tests__/AgentExecutionView.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

- 全テストが FAIL することを確認（ガード未実装のため）
- テスト自体のシンタックスエラーや環境エラーがないことを確認
- T-01〜T-08 に加え、listener 復元経路の前提が Phase 6 で検証できるようテスト名と責務境界を明確化する

## 統合テスト連携（Phase 1〜11は必須）

- T-05（連続呼び出しテスト）は統合テスト的な性質を持つ
- Phase 6でガード+IPC呼び出しの結合テストに拡充する

## 多角的チェック観点（AIが判断）

| 観点       | 適用 | チェック内容                                                               |
| ---------- | ---- | -------------------------------------------------------------------------- |
| テスト設計 | 該当 | AC全件（AC-01〜AC-06）に対応するテストケースが存在すること                 |
| テスト環境 | 該当 | P39準拠（happy-dom + fireEvent）、P40準拠（テスト実行ディレクトリ）        |
| 状態管理   | 該当 | createStore パターン（set/get シミュレーション）が正しく使用されていること |

## 成果物

| 成果物              | パス                                                                                                               | 説明                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| テスト設計書        | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-4-test-creation.md` | 本ドキュメント                 |
| Store層ガードテスト | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts`                            | 並行実行ガードのユニットテスト |
| UI層回帰テスト      | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/ExecuteButton.test.tsx`                        | 実行ボタンの既存ガード回帰     |
| UI層回帰テスト      | `apps/desktop/src/renderer/views/AgentExecutionView/__tests__/AgentExecutionView.test.tsx`                         | 実行中入力 disabled 回帰       |
| UI層回帰テスト      | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`                          | ChatPanel toggle 回帰          |

## 完了条件

- [ ] T-01〜T-05のStore層テストコードが作成されている
- [ ] T-06〜T-08のUI層回帰テストが既存テストへ反映されている
- [ ] 全テストがFAIL（Red Phase）であることを確認済み
- [ ] テスト自体にシンタックスエラーがないことを確認済み
- [ ] AC-01〜AC-06の全受け入れ基準に対応するテストが存在する
- [ ] createStore パターンが既存テスト（`agentSlice.executeSkill.preflight.test.ts`）と整合している
- [ ] `quality-requirements.md` / `testing-fixtures.md` / `setupSkillListeners.ts` の前提がテスト設計へ反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装
