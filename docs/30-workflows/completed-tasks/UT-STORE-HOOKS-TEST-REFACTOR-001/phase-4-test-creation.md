# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 4                                |
| Phase名    | テスト作成                       |
| 前提Phase  | Phase 3                          |
| 後続Phase  | Phase 5                          |
| ステータス | 未実施                           |
| 作成日     | 2026-02-12                       |
| 機能名     | UT-STORE-HOOKS-TEST-REFACTOR-001 |

---

## 目的

renderHookパターンを使用した新しいテストケースを作成し、テストが失敗する状態（Red）を確認する。本タスクはリファクタリングのため、既存テストの書き換えが中心だが、TDDの原則に従い、新パターンのテストが正しく動作することを先に検証する。

## 背景

Phase 2で設計したrenderHookパターンに基づき、agentSlice.selectors.test.tsのテストケースをrenderHookパターンで再作成する。

---

## 実行タスク

### タスク1: renderHookテストの基盤作成

**目的**: agentSliceテスト用のrenderHookテスト基盤をセットアップ

**実行手順**:

1. テストファイルのimport文をrenderHook対応に更新
   ```typescript
   import { renderHook, act } from "@testing-library/react";
   ```
2. beforeEachでのStore初期化をauthMode/llmパターンに統一
   ```typescript
   beforeEach(() => {
     resetStore();
     setupMockElectronAPI();
   });
   ```
   afterEachでのクリーンアップ処理を追加
   ```typescript
   afterEach(() => {
     cleanup(); // renderHookのReactツリークリーンアップ
     vi.restoreAllMocks(); // clearではなくrestoreで完全復元
   });
   ```
3. テストユーティリティ関数の整備
   - `resetStore()`: useAppStore.setState()で全フィールドを初期値にリセット
   - `createMockElectronAPI()`: electronAPI全体（authMode + llm + skill 3セクション）のmockを生成
     - **重要**: 現在のagentSliceテストは`window.electronAPI.skill`のみmockしているが、`useAppStore`経由ではelectronAPI全体が必要
   - `cleanup()`: `@testing-library/react`のcleanup関数をafterEachで実行

### タスク2: 状態セレクタテストの作成（CAT-01, CAT-02）

**目的**: 状態セレクタをrenderHookパターンでテスト

**テストパターン**:

```typescript
// CAT-01: 初期値テスト
it("初期状態でskillsが空配列を返す", () => {
  const { result } = renderHook(() => useSkills());
  expect(result.current).toEqual([]);
});

// CAT-02: 状態変更テスト
it("setState後に正しい値を返す", () => {
  const { result } = renderHook(() => useSkillImporting());
  expect(result.current).toBe(false);
  act(() => {
    useAppStore.setState({ isImporting: true });
  });
  expect(result.current).toBe(true);
});
```

### タスク3: アクションセレクタテストの作成（CAT-03, CAT-04）

**目的**: アクションセレクタをrenderHookパターンでテスト

**テストパターン**:

```typescript
// CAT-03: アクション存在確認
it("fetchSkillsアクションが関数として返される", () => {
  const { result } = renderHook(() => useFetchSkills());
  expect(typeof result.current).toBe("function");
});

// CAT-04: アクション実行テスト
it("fetchSkillsがElectron APIを呼び出す", async () => {
  const { result } = renderHook(() => useFetchSkills());
  await act(async () => {
    await result.current();
  });
  expect(window.electronAPI.skill.getSkills).toHaveBeenCalled();
});
```

### タスク4: 参照安定性・無限ループ防止テストの作成（CAT-05, CAT-07）

**目的**: 参照安定性と無限ループ防止テストをrenderHookパターンで作成

**テストパターン**:

> **CAT-07の意味的変化**: renderHook移行により、テストの検証対象が変わる。
>
> - **移行前**: Zustand API直接テスト（`getState()`で取得した関数の安定性）
> - **移行後**: Reactライフサイクルテスト（Hookが返す関数参照の安定性）
>
> テスト名を「Zustand API参照安定性」から「Hook返却参照安定性」に変更を検討すること。

```typescript
// CAT-05: 参照安定性
it("アクションセレクタは再レンダリング時も同じ参照を返す", () => {
  const { result, rerender } = renderHook(() => useFetchSkills());
  const firstRef = result.current;
  rerender();
  expect(result.current).toBe(firstRef);
});

// CAT-07: 無限ループ防止（Hook返却参照安定性）
it("状態変更してもアクション参照が安定している（P31対策）", () => {
  const { result } = renderHook(() => useFetchSkills());
  const firstRef = result.current;
  act(() => {
    useAppStore.setState({ skills: [{ id: "test" }] });
  });
  expect(result.current).toBe(firstRef);
});
```

### タスク5: 非同期・エラーハンドリングテストの作成（CAT-08, CAT-09）

**目的**: 非同期アクションとエラーハンドリングテストをrenderHookパターンで作成

### タスク6: エクスポート検証テストの作成（CAT-10相当）

**目的**: 全23個の個別セレクタHookがindex.tsからexportされていることを検証

**テストパターン**:

```typescript
// CAT-10: エクスポート検証
import * as storeExports from "../../index";

it("全ての個別セレクタHookがexportされている", () => {
  const expectedHooks = [
    "useSkills",
    "useSelectedSkillId",
    "useSkillImporting",
    "useSkillExecuting",
    "useSkillError",
    "useAgentMessages",
    "useAgentStreaming",
    "useAgentError",
    "useAgentSessionId",
    "useAgentPermissionRequest",
    "useAbortController",
    "useStreamingContent",
    "useToolUseBlocks",
    "useFetchSkills",
    "useImportSkill",
    "useDeleteSkill",
    "useSelectSkill",
    "useExecuteSkill",
    "useSendAgentMessage",
    "useAbortAgentStream",
    "useClearAgentMessages",
    "useRespondToPermission",
    "useResetAgentState",
  ];
  expectedHooks.forEach((hookName) => {
    expect(storeExports).toHaveProperty(hookName);
  });
});
```

---

## act()ワーニング対策

renderHookテストで発生しうるact()ワーニングの対処法:

| パターン            | 対処法                                                |
| ------------------- | ----------------------------------------------------- |
| 非同期状態更新      | `await act(async () => { ... })` でラップ             |
| 同期状態更新        | `act(() => { useAppStore.setState({...}) })` でラップ |
| waitFor内の状態更新 | `await waitFor(() => { expect(...) })` を使用         |

> **参考**: `@testing-library/react` v14以降、act()ワーニングは厳格化されている。全ての状態更新をact()でラップすること。

---

## TDD検証

### TDDサイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run agentSlice.selectors
```

**確認項目**:

- [ ] 新パターンのテストが正しくセットアップされている
- [ ] テスト構造がPhase 2の設計に準拠している

---

## 参照資料

| 参照資料         | パス                                                                               | 内容               |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------ |
| Phase 2設計書    | `outputs/phase-2/migration-design.md`                                              | renderHook移行設計 |
| Phase 2構造設計  | `outputs/phase-2/test-structure.md`                                                | テスト構造設計     |
| authModeテスト   | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` | 手本パターン       |
| agentSliceテスト | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`    | 移行対象           |

---

## 統合テスト連携

- renderHookテストシナリオが全カテゴリ（CAT-01〜CAT-10）をカバーしていることを確認

---

## 成果物

| 成果物                   | パス                                                                            | 説明                             |
| ------------------------ | ------------------------------------------------------------------------------- | -------------------------------- |
| 移行済みagentSliceテスト | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts` | renderHookパターンのテストコード |

---

## 完了条件

- [ ] renderHookテスト基盤がセットアップされている
- [ ] CAT-01〜CAT-10の全カテゴリにrenderHookテストが作成されている
- [ ] テスト構造がPhase 2の設計に準拠している
- [ ] テストが正しくimport・セットアップされている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

完了後、以下のファイルを実行してください:
`docs/30-workflows/UT-STORE-HOOKS-TEST-REFACTOR-001/phase-5-implementation.md`
