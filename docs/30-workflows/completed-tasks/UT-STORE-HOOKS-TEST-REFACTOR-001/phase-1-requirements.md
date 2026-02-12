# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 1                                |
| Phase名    | 要件定義                         |
| 前提Phase  | -                                |
| 後続Phase  | Phase 2                          |
| ステータス | 未実施                           |
| 作成日     | 2026-02-12                       |
| 機能名     | UT-STORE-HOOKS-TEST-REFACTOR-001 |

---

## 目的

既存Store Hooksテストの移行対象を正確に特定し、renderHookパターンへの移行要件と受け入れ基準を定義する。

## 背景

UT-STORE-HOOKS-REFACTOR-001で作成された53個の個別セレクタHookのテストの一部は、`useAppStore.getState()`を使用した直接状態検証パターンを使用している。このパターンではReact HookのsubscribeメカニズムやreferentialStabilityが検証されない。P31（無限ループ問題）の再発防止のためにも、renderHookパターンへの移行が必要。

---

## 実行タスク

### タスク1: 移行対象の正確な特定

**目的**: Issue記載のファイル名と実際のファイル名の差異を踏まえ、移行対象を正確に特定する

**実行手順**:

1. Issue #779記載のファイル名と実際のファイル名のマッピングを作成
2. 各テストファイルの現在のパターン（getState() vs renderHook）を調査
3. 移行が必要なファイルと、既にrenderHookを使用しているファイルを分類

**ファイル名マッピング（調査結果）**:

| Issue記載名                    | 実際のファイル名                      | 現在のパターン | 移行必要 |
| ------------------------------ | ------------------------------------- | -------------- | -------- |
| infiniteLoopPrevention.test.ts | （独立ファイルなし、各Slice内で検証） | -              | 確認要   |
| authModeSelectors.test.ts      | authModeSlice.selectors.test.ts       | renderHook     | 不要     |
| llmSelectors.test.ts           | llmSlice.selectors.test.ts            | renderHook     | 不要     |
| skillSelectors.test.ts         | agentSlice.selectors.test.ts          | getState()     | **必要** |

**agentSliceテスト統計**:

- 既存テスト数: 48件（CAT-01:13, CAT-02:7, CAT-03:10, CAT-04:3, CAT-05:4, CAT-06:2, CAT-07:3, CAT-08:4, CAT-09:2）
- getState()呼び出し数: 約172箇所
- 個別セレクタHook数: 23個（状態13 + アクション10）

### タスク2: 機能要件（FR）定義

**目的**: renderHookパターン移行の機能要件を定義する

**機能要件**:

| FR ID  | 要件                                                | 優先度 | 状態   |
| ------ | --------------------------------------------------- | ------ | ------ |
| FR-001 | agentSlice.selectors.test.tsのrenderHook移行        | 高     | 未実施 |
| FR-002 | 全Sliceテストで参照安定性テストが実施されている     | 高     | 未実施 |
| FR-003 | 全Sliceテストで再レンダリングテストが実施されている | 中     | 未実施 |
| FR-004 | 既存テストの全PASSが維持されている                  | 高     | 未実施 |
| FR-005 | テストパターンの統一（3ファイル間の一貫性）         | 中     | 未実施 |

### タスク2.5: agentSlice個別セレクタの完全リスト作成

**目的**: arch-state-management.mdの個別セレクタカタログと実装を照合し、テスト対象を完全に列挙する

**agentSlice個別セレクタ一覧（23個 = 13状態 + 10アクション）**:

| #   | Hook名                        | 種別       | 対応するStore状態/アクション |
| --- | ----------------------------- | ---------- | ---------------------------- |
| 1   | `useSkills()`                 | 状態       | `skills`                     |
| 2   | `useSelectedSkillId()`        | 状態       | `selectedSkillId`            |
| 3   | `useSkillImporting()`         | 状態       | `isImporting`                |
| 4   | `useSkillExecuting()`         | 状態       | `isExecuting`                |
| 5   | `useSkillError()`             | 状態       | `skillError`                 |
| 6   | `useAgentMessages()`          | 状態       | `agentMessages`              |
| 7   | `useAgentStreaming()`         | 状態       | `isAgentStreaming`           |
| 8   | `useAgentError()`             | 状態       | `agentError`                 |
| 9   | `useAgentSessionId()`         | 状態       | `agentSessionId`             |
| 10  | `useAgentPermissionRequest()` | 状態       | `agentPermissionRequest`     |
| 11  | `useAbortController()`        | 状態       | `abortController`            |
| 12  | `useStreamingContent()`       | 状態       | `streamingContent`           |
| 13  | `useToolUseBlocks()`          | 状態       | `toolUseBlocks`              |
| 14  | `useFetchSkills()`            | アクション | `fetchSkills`                |
| 15  | `useImportSkill()`            | アクション | `importSkill`                |
| 16  | `useDeleteSkill()`            | アクション | `deleteSkill`                |
| 17  | `useSelectSkill()`            | アクション | `selectSkill`                |
| 18  | `useExecuteSkill()`           | アクション | `executeSkill`               |
| 19  | `useSendAgentMessage()`       | アクション | `sendAgentMessage`           |
| 20  | `useAbortAgentStream()`       | アクション | `abortAgentStream`           |
| 21  | `useClearAgentMessages()`     | アクション | `clearAgentMessages`         |
| 22  | `useRespondToPermission()`    | アクション | `respondToPermission`        |
| 23  | `useResetAgentState()`        | アクション | `resetAgentState`            |

**設計原則（lessons-learned.md由来）**: 「1 selector = 1 field」-- 各セレクタHookは単一の状態フィールドまたはアクションを返す。これによりZustandのsubscribeが最小限の再レンダリングで動作する。

### タスク3: 非機能要件（NFR）定義

| NFR ID  | 要件                                         | 優先度 | 状態   |
| ------- | -------------------------------------------- | ------ | ------ |
| NFR-001 | カバレッジが移行前と同等以上                 | 高     | 未実施 |
| NFR-002 | テスト実行時間が大幅に増加しない（±20%以内） | 中     | 未実施 |
| NFR-003 | TypeScript型エラーが0件                      | 高     | 未実施 |
| NFR-004 | happy-dom環境で全テスト正常動作              | 高     | 未実施 |

### タスク4: 受け入れ基準（AC）定義

**AC-1: agentSliceテストのrenderHook移行**

```
Given agentSlice.selectors.test.tsが存在する
When getState()パターンをrenderHookパターンに移行する
Then 全ての個別セレクタHookがrenderHookでテストされ、全テストがPASSする
```

**AC-2: 参照安定性の検証**

```typescript
// 期待されるテストパターン
it("Hookは再レンダリング時も安定した参照を返す", () => {
  const { result, rerender } = renderHook(() => useSkillActions());
  const firstRef = result.current;
  rerender();
  expect(result.current).toBe(firstRef);
});
```

**AC-3: 状態変更時の再レンダリング検証**

```typescript
it("状態変更時にHookが正しく新しい値を返す", () => {
  const { result } = renderHook(() => useSkillImporting());
  expect(result.current).toBe(false);
  act(() => {
    useAppStore.setState({ isImporting: true });
  });
  expect(result.current).toBe(true);
});
```

**AC-4: 既存テストの互換性**

```
Given 全てのStore Hooksテストファイル
When pnpm --filter @repo/desktop test -- --run を実行する
Then 全テストがPASSし、カバレッジが移行前と同等以上
```

---

## 参照資料

| 参照資料                     | パス                                                                               | 内容                              |
| ---------------------------- | ---------------------------------------------------------------------------------- | --------------------------------- |
| 既知の落とし穴（P31）        | `.claude/rules/06-known-pitfalls.md`                                               | Zustand Store Hooks無限ループ問題 |
| 状態管理ルール               | `.claude/rules/03-state-management.md`                                             | Zustand設計原則                   |
| agentSliceテスト（移行対象） | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`    | getState()パターン使用中          |
| authModeSliceテスト（手本）  | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` | renderHookパターン使用中          |
| llmSliceテスト（手本）       | `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`      | renderHookパターン使用中          |
| テストカバレッジ基準         | `.claude/skills/task-specification-creator/references/coverage-standards.md`       | カバレッジ基準                    |
| 過去の教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`             | 1 selector = 1 field の設計原則   |
| 状態管理仕様                 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`       | 個別セレクタカタログ              |

---

## 統合テスト連携

- renderHookテスト環境の依存関係（@testing-library/react, happy-dom）が利用可能であることを確認
- Zustand StoreのsubscribeパターンがrenderHook環境で正しく動作することを確認

---

## アーキテクチャ層別要件

### フロントエンド層（Renderer）

- Zustand個別セレクタHookのテスト環境要件
- React Hookライフサイクルの検証方法

### 状態管理層

- Zustand subscribeパターンの動作検証
- getState() vs renderHook の検証範囲の違い

---

## 成果物

| 成果物         | パス                                     | 説明                     |
| -------------- | ---------------------------------------- | ------------------------ |
| 要件定義書     | `outputs/phase-1/requirements.md`        | FR/NFR定義と移行対象一覧 |
| 受け入れ基準書 | `outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-4の詳細定義     |

---

## 完了条件

- [ ] 移行対象ファイルが正確に特定されている
- [ ] Issue記載のファイル名と実際のファイル名のマッピングが完了
- [ ] FR-001〜FR-005が定義されている
- [ ] NFR-001〜NFR-004が定義されている
- [ ] AC-1〜AC-4が定義されている
- [ ] 参照資料が全て正しいパスで記載されている
- [ ] agentSliceの23個の個別セレクタが全てリストアップされている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

完了後、以下のファイルを実行してください:
`docs/30-workflows/UT-STORE-HOOKS-TEST-REFACTOR-001/phase-2-design.md`
