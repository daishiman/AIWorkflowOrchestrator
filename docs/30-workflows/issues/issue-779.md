# [#779] "[UT-STORE-HOOKS-TEST-REFACTOR-001] Store Hooks テストをrenderHookパターンに移行" No.778の後に実行する

## メタ情報

```yaml
task_id: UT-STORE-HOOKS-TEST-REFACTOR-001
task_name: Store Hooks テストをrenderHookパターンに移行
category: リファクタリング
target_feature: Zustand Store Hooks テスト
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 12（UT-STORE-HOOKS-REFACTOR-001）
created_date: 2026-02-11
dependencies: []
spec_path: docs/30-workflows/completed-tasks/UT-STORE-HOOKS-REFACTOR-001/unassigned-tasks/task-ut-store-hooks-test-refactor-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-STORE-HOOKS-REFACTOR-001で作成されたテストは、`useAppStore.getState()`を使用してStoreの状態を直接検証している。しかし、P34で指摘されているように、これはReact Hookの実際の動作とは異なる。

### 1.2 問題点・課題

現在のテストパターンには以下の問題がある：

1. **getState()パターンの限界**
   - `getState()`はStoreの状態を同期的に取得するが、React Hookはsubscribeパターンで動作する
   - Hookの参照安定性（同じ関数参照を返すか）はgetState()では検証できない
   - 再レンダリング時の動作は検証されない

2. **テストと実際の動作の乖離**
   - テストはパスするが、実際のReactコンポーネントでは期待通りに動作しない可能性
   - 無限ループ問題がテストで検出されない

3. **対象テストファイル**
   - `apps/desktop/src/renderer/store/__tests__/infiniteLoopPrevention.test.ts`
   - `apps/desktop/src/renderer/store/slices/__tests__/authModeSelectors.test.ts`
   - `apps/desktop/src/renderer/store/slices/__tests__/llmSelectors.test.ts`
   - `apps/desktop/src/renderer/store/slices/__tests__/skillSelectors.test.ts`

### 1.3 放置した場合の影響

- Hookの参照安定性がテストで検証されないため、無限ループ問題が本番環境で発生する可能性
- テストの信頼性低下
- 将来のリファクタリング時にリグレッションを検出できない

---

## 2. 何を達成するか（What）

### 2.1 目的

既存のStore HooksテストをrenderHookパターンに移行し、React Hookの実際の動作を検証できるようにする。

### 2.2 最終ゴール

- 全ての個別セレクタHookがrenderHookでテストされている
- Hookの参照安定性がテストで検証されている
- 再レンダリング時の動作がテストで検証されている
- テストがReact Hookの実際の動作を反映している

### 2.3 スコープ

#### 含むもの

- 既存テストのrenderHookパターンへの移行
- 参照安定性テストの追加
- 再レンダリングテストの追加

#### 含まないもの

- 新規セレクタHookの作成
- Storeロジックの変更
- コンポーネントの移行

### 2.4 成果物

| 成果物                                 | パス                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------- |
| リファクタリング済みinfiniteLoopテスト | apps/desktop/src/renderer/store/**tests**/infiniteLoopPrevention.test.ts   |
| リファクタリング済みauthModeテスト     | apps/desktop/src/renderer/store/slices/**tests**/authModeSelectors.test.ts |
| リファクタリング済みllmテスト          | apps/desktop/src/renderer/store/slices/**tests**/llmSelectors.test.ts      |
| リファクタリング済みskillテスト        | apps/desktop/src/renderer/store/slices/**tests**/skillSelectors.test.ts    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-STORE-HOOKS-REFACTOR-001が完了していること
- `@testing-library/react`がインストールされていること
- happy-dom環境でテストが実行可能なこと

### 3.2 依存タスク

| タスクID                    | 状態 | 依存内容               |
| --------------------------- | ---- | ---------------------- |
| UT-STORE-HOOKS-REFACTOR-001 | 完了 | 個別セレクタHookの作成 |

### 3.3 必要な知識

- `@testing-library/react`のrenderHook API
- React Hookのライフサイクル
- Zustandのsubscribeパターン

### 3.4 推奨アプローチ

1. 各テストファイルでrenderHookパターンに移行
2. 参照安定性テストを追加
3. 再レンダリングテストを追加
4. テスト実行して動作確認

---

## 4. 実行手順

### Phase構成

本タスクは小規模のため、単一Phaseで実行可能。

### Phase 1: テストリファクタリング

#### Step 1: テストユーティリティのセットアップ

```typescript
import { renderHook, act } from "@testing-library/react";
```

#### Step 2: getState()パターンをrenderHookパターンに置換

```typescript
// Before: getState()パターン
it("TS-AM-001: 現在のモード値を返す", () => {
  const state = useAppStore.getState();
  expect(state.mode).toBe("subscription");
});

// After: renderHookパターン
it("TS-AM-001: 現在のモード値を返す", () => {
  const { result } = renderHook(() => useAuthMode());
  expect(result.current).toBe("subscription");
});
```

#### Step 3: 参照安定性テストの追加

```typescript
it("TS-AM-NEW: Hookは再レンダリング時も安定した参照を返す", () => {
  const { result, rerender } = renderHook(() => useAuthModeActions());
  const firstRef = result.current;
  rerender();
  const secondRef = result.current;
  expect(firstRef).toBe(secondRef);
});
```

#### Step 4: 状態変更時のテスト追加

```typescript
it("TS-AM-NEW: 状態変更時にHookが正しく再レンダリングされる", () => {
  const { result } = renderHook(() => useAuthMode());
  expect(result.current).toBe("subscription");

  act(() => {
    useAppStore.setState({ mode: "api-key" });
  });

  expect(result.current).toBe("api-key");
});
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] infiniteLoopPrevention.test.tsがrenderHookパターンに移行
- [ ] authModeSelectors.test.tsがrenderHookパターンに移行
- [ ] llmSelectors.test.tsがrenderHookパターンに移行
- [ ] skillSelectors.test.tsがrenderHookパターンに移行
- [ ] 参照安定性テストが追加されている

### 品質要件

- [ ] 全テストがPASS
- [ ] カバレッジが低下していない
- [ ] TypeScriptの型エラーがない

### ドキュメント要件

- [ ] テストコメントが更新されている
- [ ] 移行完了記録がLOGS.mdに追加されている

---

## 6. 検証方法

### 6.1 自動テスト

```bash
# 対象テストファイルを実行
pnpm --filter @repo/desktop test -- --run infiniteLoopPrevention
pnpm --filter @repo/desktop test -- --run authModeSelectors
pnpm --filter @repo/desktop test -- --run llmSelectors
pnpm --filter @repo/desktop test -- --run skillSelectors
```

### 6.2 カバレッジ確認

```bash
pnpm --filter @repo/desktop test -- --run --coverage
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                        |
| ------------------------------ | ------ | -------- | --------------------------- |
| テスト移行による既存テスト破壊 | 中     | 中       | 段階的移行（1ファイルずつ） |
| renderHook環境でのモック問題   | 中     | 低       | happy-dom環境の設定を確認   |
| テスト実行時間の増加           | 低     | 中       | 必要最小限のテストに絞る    |

---

## 8. 参照情報

### 関連ドキュメント

| 資料                            | パス                                                                  |
| ------------------------------- | --------------------------------------------------------------------- |
| P34: テスト乖離問題             | .claude/rules/06-known-pitfalls.md                                    |
| testing-library公式ドキュメント | https://testing-library.com/docs/react-testing-library/api#renderhook |
| Zustand Testing Guide           | https://github.com/pmndrs/zustand#testing                             |

---

## 9. 備考

### 発見元の原文

P34: React HookテストにおけるgetState()とrenderHookの乖離

```
getState()でStoreの状態を直接テストしていたが、これはReact Hookの実際の動作とは異なる。
特に、セレクタの参照安定性をテストするにはrenderHookが必要
```

### 補足事項

- 既存のgetState()テストも一部は残す価値がある（Storeロジック自体のテスト）
- renderHookテストはHookの動作検証に特化する
- 両アプローチの併用を検討すること
