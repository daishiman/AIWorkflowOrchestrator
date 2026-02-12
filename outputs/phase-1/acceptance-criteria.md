# Phase 1: 受け入れ基準書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-STORE-HOOKS-TEST-REFACTOR-001 |
| Phase      | 1                                |
| 作成日     | 2026-02-12                       |
| ステータス | 完了                             |

---

## AC-1: agentSliceテストのrenderHook移行

### 条件

```
Given agentSlice.selectors.test.tsが48件のテストを持ち、全てgetState()パターンを使用している
When 全テストをrenderHookパターンに移行する
Then 以下の全条件を満たす:
  - 全48件のテストがrenderHookパターンで書き直されている
  - `create<AgentSlice>()` による独立ストア生成が `useAppStore` に置き換わっている
  - `testStore.getState().xxx` が `renderHook(() => useAppStore(s => s.xxx))` に置き換わっている
  - electronAPIモックが authMode + llm + skill の3セクション全体をカバーしている
  - afterEachで `cleanup()` と `vi.restoreAllMocks()` が実行されている
  - 全テストがPASSする
```

### 検証方法

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts
```

### 検証基準

- テスト結果: 48/48 PASS
- `getState()` の直接呼び出しが0箇所（ただし `useAppStore.getState()` による状態確認は許容）

---

## AC-2: 参照安定性の検証

### 条件

```
Given agentSliceの全アクションセレクタ（10個）がrenderHookでテストされている
When renderHookのrerender()を実行する
Then アクション関数の参照が再レンダリング前後で同一（toBe）である
```

### 期待されるテストパターン

```typescript
it("fetchSkillsの参照が再レンダリング間で安定している", () => {
  const { result, rerender } = renderHook(() =>
    useAppStore((state) => state.fetchSkills),
  );
  const firstRef = result.current;

  rerender();

  expect(result.current).toBe(firstRef);
});
```

### 検証基準

- 全10個のアクションセレクタに対して参照安定性テストが存在する
- 状態変更後もアクション参照が変わらないことを検証するテストが存在する

---

## AC-3: 状態変更時の再レンダリング検証

### 条件

```
Given agentSliceの状態セレクタがrenderHookでテストされている
When act()内でuseAppStore.setState()により状態を変更する
Then result.currentが変更後の値を正しく返す
```

### 期待されるテストパターン

```typescript
it("状態変更時にHookが正しく新しい値を返す", () => {
  const { result } = renderHook(() =>
    useAppStore((state) => state.isImporting),
  );
  expect(result.current).toBe(false);

  act(() => {
    useAppStore.setState({ isImporting: true });
  });

  expect(result.current).toBe(true);
});
```

### 検証基準

- CAT-02（状態セレクタ値取得）の7件全てが act + setState パターンで書き直されている
- act() の使用によりReactの状態更新が正しくバッチ処理されている

---

## AC-4: 既存テストの互換性

### 条件

```
Given 全てのStore Hooksテストファイル（3ファイル）が存在する
  - authModeSlice.selectors.test.ts
  - llmSlice.selectors.test.ts
  - agentSlice.selectors.test.ts（移行後）
When pnpm --filter @repo/desktop vitest run を実行する
Then 以下の全条件を満たす:
  - 3ファイル全てのテストがPASSする
  - カバレッジが移行前と同等以上（Line 80%以上、Branch 60%以上）
  - TypeScript型エラーが0件
  - テスト実行時間が移行前比 +20% 以内
```

### 検証方法

```bash
# 全Sliceテスト実行
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/store/slices/__tests__/ --reporter=verbose

# カバレッジ確認
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/store/slices/__tests__/ --coverage

# 型チェック
pnpm --filter @repo/desktop typecheck
```

### 検証基準

| 基準                 | 期待値             |
| -------------------- | ------------------ |
| authModeSlice テスト | 全PASS（変更なし） |
| llmSlice テスト      | 全PASS（変更なし） |
| agentSlice テスト    | 48/48 PASS         |
| Line Coverage        | 80% 以上           |
| Branch Coverage      | 60% 以上           |
| TypeScript エラー    | 0件                |
| テスト実行時間       | 移行前比 +20% 以内 |
