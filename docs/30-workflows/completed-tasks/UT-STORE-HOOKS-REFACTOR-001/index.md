# UT-STORE-HOOKS-REFACTOR-001: Zustand Store Hooks個別セレクタ再設計

## タスク概要

| 項目        | 内容                                        |
| ----------- | ------------------------------------------- |
| タスクID    | UT-STORE-HOOKS-REFACTOR-001                 |
| タスク名    | Zustand Store Hooks個別セレクタベース再設計 |
| 優先度      | 高                                          |
| 分類        | リファクタリング / パフォーマンス改善       |
| 作成日      | 2026-02-11                                  |
| ステータス  | 計画中                                      |
| 関連Pitfall | P31（Zustand Store Hooks無限ループ）        |

## 背景

### 問題の概要（P31: Zustand Store Hooks無限ループ）

現在の合成Store Hook（`useAuthModeStore()`, `useLLMStore()`, `useSkillStore()`）は、呼び出しのたびに新しいオブジェクトを返すため、その中の関数を`useEffect`の依存配列に含めると無限ループが発生する。

```typescript
// 問題のあるパターン
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 無限ループ発生
```

### 現状の短期対策

```typescript
// 現在の回避策（useRefでガード）
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []);
```

### 抜本的解決の必要性

短期対策は機能するが、以下の問題がある:

- ESLint `react-hooks/exhaustive-deps` 警告の抑制が必要
- コンポーネントごとに同じパターンを繰り返す必要がある
- コードの可読性・保守性が低下

## 対象ファイル

### Sliceファイル（修正対象）

| ファイルパス                                              | Slice名       | 状態数 | アクション数 |
| --------------------------------------------------------- | ------------- | ------ | ------------ |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts` | AuthModeSlice | 6      | 11           |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts`      | LLMSlice      | 6      | 11           |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`    | AgentSlice    | 26     | 42           |

### Store定義ファイル（修正対象）

| ファイルパス                               | 説明                             |
| ------------------------------------------ | -------------------------------- |
| `apps/desktop/src/renderer/store/index.ts` | 合成Store Hook定義、個別セレクタ |

### 影響を受けるコンポーネント

| ファイルパス                                                    | 使用Hook             |
| --------------------------------------------------------------- | -------------------- |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | `useAuthModeStore()` |
| `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | `useLLMStore()`      |

## Phase一覧

| Phase | 名称             | 目的                                   | 仕様書                                                                 |
| ----- | ---------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| 1     | 要件定義         | 個別セレクタの要件と受け入れ基準を定義 | [phase-1-requirements.md](./phase-1-requirements.md)                   |
| 2     | 設計             | 個別セレクタパターンの詳細設計         | [phase-2-design.md](./phase-2-design.md)                               |
| 3     | 設計レビュー     | 設計の妥当性検証                       | [phase-3-review.md](./phase-3-review.md)                               |
| 4     | テスト作成       | TDD: テストファースト開発              | [phase-4-test-creation.md](./phase-4-test-creation.md)                 |
| 5     | 実装             | 個別セレクタの実装                     | [phase-5-implementation.md](./phase-5-implementation.md)               |
| 6     | テスト拡充       | カバレッジ向上                         | [phase-6-test-enhancement.md](./phase-6-test-enhancement.md)           |
| 7     | カバレッジ確認   | カバレッジ基準の検証                   | [phase-7-coverage-verification.md](./phase-7-coverage-verification.md) |
| 8     | リファクタリング | コード品質改善                         | [phase-8-refactoring.md](./phase-8-refactoring.md)                     |
| 9     | 品質検証         | Lint/型チェック/全テスト               | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)         |
| 10    | 最終レビュー     | 多角的品質検証                         | [phase-10-final-review.md](./phase-10-final-review.md)                 |
| 11    | 手動テスト       | UI/UX確認                              | [phase-11-manual-testing.md](./phase-11-manual-testing.md)             |
| 12    | ドキュメント     | 実装ガイド・仕様書更新                 | [phase-12-documentation.md](./phase-12-documentation.md)               |
| 13    | PR作成           | Pull Request作成・CI確認               | [phase-13-pr-creation.md](./phase-13-pr-creation.md)                   |

## 参照資料

| 資料名                 | パス                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| 既知の落とし穴（P31）  | `.claude/rules/06-known-pitfalls.md#P31`                                     |
| 状態管理ルール         | `.claude/rules/03-state-management.md`                                       |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` |

## 関連タスク

| タスクID                             | 関係性 | 説明                             |
| ------------------------------------ | ------ | -------------------------------- |
| UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 | 派生元 | 無限ループ問題の短期修正タスク   |
| TASK-FIX-6-1-STATE-CENTRALIZATION    | 関連   | skillSliceからagentSliceへの統合 |
