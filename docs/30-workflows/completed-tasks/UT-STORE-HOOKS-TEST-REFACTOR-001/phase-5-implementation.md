# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 5                                |
| Phase名    | 実装                             |
| 前提Phase  | Phase 4                          |
| 後続Phase  | Phase 6                          |
| ステータス | 未実施                           |
| 作成日     | 2026-02-12                       |
| 機能名     | UT-STORE-HOOKS-TEST-REFACTOR-001 |

---

## 目的

Phase 4で作成したrenderHookテストが全てPASSするように、agentSlice.selectors.test.tsのテストコードを実装する（Green状態にする）。

## 背景

本タスクはテストリファクタリングのため、「実装」はテストコード自体の完成を意味する。プロダクションコードの変更は不要。

---

## 実行タスク

### タスク1: agentSlice.selectors.test.tsのrenderHook完全移行

**目的**: getState()パターンを完全にrenderHookパターンに置換

> **注記**: テストIDはTS-STORE-01〜TS-STORE-48（合計48テスト）。ファイルヘッダのID範囲が実際と異なる場合は実測値を優先すること。

**実行手順**:

1. CAT-01（状態セレクタ初期値）: 13テストケースをrenderHookに移行
2. CAT-02（状態セレクタ値取得）: 7テストケースをrenderHookに移行
3. CAT-03（アクションセレクタ存在）: 10テストケースをrenderHookに移行
4. CAT-04（アクション実行）: 3テストケースをrenderHook + act()に移行
5. CAT-05（参照安定性）: 4テストケースをrenderHook + rerenderに移行
6. CAT-06（再レンダー最適化）: 2テストケースを維持・強化
7. CAT-07（無限ループ防止）: 3テストケースをrenderHookパターンで強化
8. CAT-08（非同期アクション）: 4テストケースをrenderHook + act() + waitForに移行
9. CAT-09（エラーハンドリング）: 2テストケースをrenderHook + act()に移行

### タスク2: Store初期化パターンの統一

**目的**: resetStore() と mockElectronAPI のセットアップをauthMode/llmパターンに統一

**実行手順**:

1. beforeEach を authMode/llm テストと同様のパターンに更新
2. `create()` で独自テストストアを生成するパターンから `useAppStore` を使用するパターンに移行
3. mockElectronAPI のセットアップを `createMockElectronAPI()` 関数に統一
4. electronAPI mockのスコープを拡張
   - `window.electronAPI.skill` に加え、`window.electronAPI.auth` と `window.electronAPI.llm` セクションも含むmockを設定
   - `createMockElectronAPI()` ユーティリティ関数で3セクション全体を生成

### タスク3: テスト実行と全PASSの確認

**実行手順**:

```bash
# agentSliceテストのみ実行
pnpm --filter @repo/desktop test -- --run agentSlice.selectors

# 関連テスト全体実行
pnpm --filter @repo/desktop test -- --run authModeSlice.selectors llmSlice.selectors agentSlice.selectors
```

---

## 既知のPitfall対策

| Pitfall                              | 対策                                         |
| ------------------------------------ | -------------------------------------------- |
| P9: テスト間のState共有              | beforeEachでresetStore()実行                 |
| P31: Zustand Hook無限ループ          | 個別セレクタ使用、アクション参照安定性テスト |
| P13: タイマーテストの無限ループ      | advanceTimersByTimeで1ステップずつ           |
| P11: PostToolUseフックによるEdit失敗 | 大量編集後はgit diff --statで変更数を検証    |

---

## TDD検証

```bash
pnpm --filter @repo/desktop test -- --run agentSlice.selectors
```

**確認項目**:

- [ ] 全テストがPASS（Green状態）

---

## 参照資料

| 参照資料       | パス                                                                               | 内容             |
| -------------- | ---------------------------------------------------------------------------------- | ---------------- |
| Phase 4テスト  | Phase 4で作成したテストコード                                                      | テスト設計       |
| authModeテスト | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` | 手本パターン     |
| llmSliceテスト | `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`      | 手本パターン     |
| 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md`                                               | P9, P31, P13対策 |

---

## アーキテクチャ層別確認

### 状態管理層

- [ ] Zustand subscribeパターンがrenderHookで正しく動作
- [ ] 個別セレクタHookの参照安定性が維持されている

---

## 統合テスト連携

- agentSliceテストのrenderHookパターン移行実装
- 全Sliceテストの統一パターンの確認

---

## 成果物

| 成果物                   | パス                                                                            | 説明                           |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------ |
| 移行済みagentSliceテスト | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts` | renderHookパターン完全移行済み |

---

## 完了条件

- [ ] CAT-01〜CAT-09の全カテゴリがrenderHookパターンに移行完了
- [ ] Store初期化パターンがauthMode/llmと統一されている
- [ ] 全テストがPASS（Green状態）
- [ ] getState()呼び出しが0件であることを確認（`grep -c "getState()" agentSlice.selectors.test.ts` が0）
- [ ] TypeScript型エラーが0件
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

完了後、以下のファイルを実行してください:
`docs/30-workflows/UT-STORE-HOOKS-TEST-REFACTOR-001/phase-6-test-expansion.md`
