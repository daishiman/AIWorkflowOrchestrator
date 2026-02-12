# Phase 4: テスト仕様書

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| タスクID   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| タスク名   | Store Hooks コンポーネント移行         |
| Phase      | 4                                      |
| 作成日     | 2026-02-12                             |
| ステータス | 完了                                   |

---

## 1. テスト対象

### 1.1 対象ファイル

| ファイル                                                        | テスト観点               |
| --------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/renderer/store/index.ts`                      | 個別セレクタの参照安定性 |
| `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | 移行後の動作確認         |
| `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | 移行後の動作確認         |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | 移行後の動作確認         |

### 1.2 テストファイル

| テストファイル                                                | 説明                     |
| ------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/renderer/store/__tests__/selectors.test.ts` | 個別セレクタの参照安定性 |

---

## 2. テストケース一覧

### 2.1 LLM個別セレクタ テスト

#### 状態セレクタ

| テストID       | テストケース名                                                | 期待結果   |
| -------------- | ------------------------------------------------------------- | ---------- |
| TC-SEL-LLM-001 | useLLMProviders は providers が変更されない限り同じ参照を返す | 参照が同一 |
| TC-SEL-LLM-002 | useLLMSelectedProviderId は安定した参照を返す                 | 参照が同一 |
| TC-SEL-LLM-003 | useLLMHealthStatus は安定した参照を返す                       | 参照が同一 |

#### アクションセレクタ

| テストID       | テストケース名                                | 期待結果       |
| -------------- | --------------------------------------------- | -------------- |
| TC-SEL-LLM-004 | useLLMFetchProviders は安定した関数参照を返す | 関数参照が同一 |
| TC-SEL-LLM-005 | useLLMSelectProvider は安定した関数参照を返す | 関数参照が同一 |
| TC-SEL-LLM-006 | useLLMSelectModel は安定した関数参照を返す    | 関数参照が同一 |
| TC-SEL-LLM-007 | useLLMCheckHealth は安定した関数参照を返す    | 関数参照が同一 |
| TC-SEL-LLM-008 | useLLMResetSelection は安定した関数参照を返す | 関数参照が同一 |
| TC-SEL-LLM-009 | useLLMClearError は安定した関数参照を返す     | 関数参照が同一 |

#### 状態変更後

| テストID       | テストケース名                                     | 期待結果       |
| -------------- | -------------------------------------------------- | -------------- |
| TC-SEL-LLM-010 | 状態が変更されてもアクション関数の参照は維持される | 関数参照が同一 |

### 2.2 Skill個別セレクタ テスト

#### 状態セレクタ

| テストID      | テストケース名                                  | 期待結果   |
| ------------- | ----------------------------------------------- | ---------- |
| TC-SEL-SK-001 | useAvailableSkillsMetadata は安定した参照を返す | 参照が同一 |
| TC-SEL-SK-002 | useImportedSkills は安定した参照を返す          | 参照が同一 |
| TC-SEL-SK-003 | useSelectedSkillName は安定した参照を返す       | 参照が同一 |
| TC-SEL-SK-004 | useIsScanning は安定した参照を返す              | 参照が同一 |

#### アクションセレクタ

| テストID      | テストケース名                                | 期待結果       |
| ------------- | --------------------------------------------- | -------------- |
| TC-SEL-SK-005 | useRescanSkills は安定した関数参照を返す      | 関数参照が同一 |
| TC-SEL-SK-006 | useSelectSkillByName は安定した関数参照を返す | 関数参照が同一 |
| TC-SEL-SK-007 | useFetchSkills は安定した関数参照を返す       | 関数参照が同一 |
| TC-SEL-SK-008 | useImportSkill は安定した関数参照を返す       | 関数参照が同一 |
| TC-SEL-SK-009 | useRemoveSkill は安定した関数参照を返す       | 関数参照が同一 |
| TC-SEL-SK-010 | useExecuteSkill は安定した関数参照を返す      | 関数参照が同一 |
| TC-SEL-SK-011 | useClearSkillError は安定した関数参照を返す   | 関数参照が同一 |

#### 状態変更後

| テストID      | テストケース名                                     | 期待結果       |
| ------------- | -------------------------------------------------- | -------------- |
| TC-SEL-SK-012 | 状態が変更されてもアクション関数の参照は維持される | 関数参照が同一 |

### 2.3 AuthMode追加セレクタ テスト

#### アクションセレクタ

| テストID      | テストケース名                                 | 期待結果       |
| ------------- | ---------------------------------------------- | -------------- |
| TC-SEL-AM-001 | useSetAuthMode は安定した関数参照を返す        | 関数参照が同一 |
| TC-SEL-AM-002 | useInitializeAuthMode は安定した関数参照を返す | 関数参照が同一 |
| TC-SEL-AM-003 | useFetchAuthMode は安定した関数参照を返す      | 関数参照が同一 |

#### 状態変更後

| テストID      | テストケース名                                     | 期待結果       |
| ------------- | -------------------------------------------------- | -------------- |
| TC-SEL-AM-004 | 状態が変更されてもアクション関数の参照は維持される | 関数参照が同一 |

### 2.4 無限ループ防止テスト

| テストID    | テストケース名                                                                      | 期待結果     |
| ----------- | ----------------------------------------------------------------------------------- | ------------ |
| TC-LOOP-001 | 個別セレクタで取得したアクション関数をuseEffectの依存配列に含めても無限ループしない | ループしない |
| TC-LOOP-002 | Skill系セレクタでも無限ループしない                                                 | ループしない |
| TC-LOOP-003 | AuthMode系セレクタでも無限ループしない                                              | ループしない |

### 2.5 合成Hook vs 個別セレクタ比較テスト

| テストID    | テストケース名                         | 期待結果                           |
| ----------- | -------------------------------------- | ---------------------------------- |
| TC-COMP-001 | 合成Hookは毎回新しいオブジェクトを返す | オブジェクト参照が異なる可能性あり |
| TC-COMP-002 | 個別セレクタは安定した参照を返す       | 参照が同一                         |

---

## 3. テスト設計の原則

### 3.1 参照安定性の検証方法

```typescript
// rerenderしても同じ参照を返すことを確認
const { result, rerender } = renderHook(() => useXxxSelector());
const firstRef = result.current;
rerender();
const secondRef = result.current;
expect(firstRef).toBe(secondRef);
```

### 3.2 状態変更後の参照安定性

```typescript
// 状態変更後も関数参照が維持されることを確認
const { result, rerender } = renderHook(() => useXxxAction());
const refBefore = result.current;

act(() => {
  useAppStore.setState({ someState: newValue });
});

rerender();
expect(result.current).toBe(refBefore);
```

### 3.3 無限ループ検出

```typescript
// レンダー回数をカウントして上限を超えないことを確認
let renderCount = 0;
const maxRenders = 10;

const { rerender } = renderHook(() => {
  renderCount++;
  if (renderCount > maxRenders) {
    throw new Error("Infinite loop detected!");
  }
  return useXxxAction();
});

rerender();
rerender();
expect(renderCount).toBeLessThanOrEqual(maxRenders);
```

---

## 4. TDD Red フェーズの確認

### 4.1 テスト実行コマンド

```bash
# セレクタテストのみ実行
pnpm --filter @repo/desktop test -- apps/desktop/src/renderer/store/__tests__/selectors.test.ts
```

### 4.2 期待結果

テストはすべて **PASS** することが期待されます。

理由:

- テストファイル内で個別セレクタを直接定義しているため、Zustandの参照安定性が保たれる
- 実際のPhase 5では、これらのセレクタをstore/index.tsにエクスポートとして追加する

### 4.3 Red フェーズの意図

本タスクの「Red」状態は以下を意味します:

- **コンポーネント移行テスト**: 移行後のコンポーネントが存在しないためFAIL（Phase 5で作成）
- **セレクタテスト**: セレクタパターンの検証のためPASS可能

Phase 5では:

1. store/index.tsに個別セレクタをエクスポートとして追加
2. コンポーネントを個別セレクタ使用に移行
3. コンポーネント移行テストを追加

---

## 5. テストカバレッジ目標

| 指標              | 目標値 |
| ----------------- | ------ |
| Line Coverage     | 90%    |
| Branch Coverage   | 70%    |
| Function Coverage | 90%    |

---

## 6. 関連ドキュメント

| ドキュメント       | パス                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| P31既知の落とし穴  | `.claude/rules/06-known-pitfalls.md`                                                              |
| アーキテクチャ設計 | `docs/30-workflows/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/outputs/phase-2/architecture-design.md` |
| Phase 4仕様書      | `docs/30-workflows/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/phase-4-test-creation.md`               |

---

## 7. 次のフェーズ

Phase 5: 実装（TDD Green）

- store/index.ts に個別セレクタをエクスポート追加
- コンポーネントを個別セレクタ使用に移行
- すべてのテストがPASSすることを確認
