# UT-STORE-HOOKS-COMPONENT-MIGRATION-001: Store Hooks コンポーネント移行

## メタ情報

```yaml
task_id: UT-STORE-HOOKS-COMPONENT-MIGRATION-001
task_name: Store Hooks コンポーネント移行
category: リファクタリング
target_feature: Zustand Store Hooks
priority: 中
scale: 小規模
status: 未着手
source_phase: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 Phase 10 最終レビュー
created_date: 2026-02-12
dependencies: []
issue: TBD
```

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| タスクID   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| 優先度     | 中                                     |
| 規模       | 小規模                                 |
| ステータス | 未着手                                 |
| GitHub     | TBD                                    |

---

## 概要

### 問題の背景

UT-FIX-STORE-HOOKS-INFINITE-LOOP-001（Zustand Store Hooks無限ループ修正）において、合成Hook（`useLLMStore()`, `useSkillStore()`, `useAuthModeStore()`）が毎回新しいオブジェクトを返すことによる無限ループ問題が発見された。短期的にはuseRefガードで対処したが、根本解決には個別セレクタHookへの移行が必要である。

### 問題点

| 箇所              | 現在のパターン                            | 問題点                                   |
| ----------------- | ----------------------------------------- | ---------------------------------------- |
| 合成Hook使用      | `const { state, action } = useXXXStore()` | 毎回新しいオブジェクト生成で依存配列問題 |
| useEffect依存配列 | `[initializeXXX]`                         | 関数が毎回新規生成されるため無限ループ   |
| 状態取得          | オブジェクト分割代入                      | 不要な再レンダリングが発生               |

### 影響

1. **パフォーマンス**: 不要な再レンダリングによるパフォーマンス低下
2. **コード品質**: useRefガードによる一時的回避は本質的解決ではない
3. **保守性**: 新規コンポーネントで同じ問題が発生するリスク

---

## 目的

合成Hook（`useLLMStore()`, `useSkillStore()`, `useAuthModeStore()`）を個別セレクタHook（`useLLM()`, `useSetLLM()`等）に移行し、無限ループ問題を根本的に解決する。

---

## スコープ

### 含むもの

- `LLMSelectorPanel.tsx` の `useLLMStore()` を個別セレクタHookに移行
- `SkillSelector.tsx` の `useSkillStore()` を個別セレクタHookに移行
- `AuthModeSelector/index.tsx` の `useAuthModeStore()` を個別セレクタHookに移行
- `SettingsView/index.tsx` の `useAuthModeStore()` を個別セレクタHookに移行
- useRefガードの削除（移行後に不要になるため）
- 移行に対応するテストケースの更新

### 含まないもの

- Store Slice自体の構造変更
- 新規個別セレクタHookの追加（既存Hookを使用）
- 他のコンポーネントの移行（本タスクは優先度の高い3コンポーネントのみ）

---

## 対象コンポーネント

| コンポーネント   | パス                                                                       | 使用Hook             | 移行先                                        |
| ---------------- | -------------------------------------------------------------------------- | -------------------- | --------------------------------------------- |
| LLMSelectorPanel | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`            | `useLLMStore()`      | `useLLM()`, `useSetLLM()` 等                  |
| SkillSelector    | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`             | `useSkillStore()`    | `useSkill()`, `useSetSkill()` 等              |
| AuthModeSelector | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` | `useAuthModeStore()` | `useAuthMode()`, `useSetAuthMode()` 等        |
| SettingsView     | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   | `useAuthModeStore()` | `useAuthMode()`, `useInitializeAuthMode()` 等 |

---

## Phase構成

| Phase | 名称                 | カテゴリ     | 仕様書                                                               |
| ----- | -------------------- | ------------ | -------------------------------------------------------------------- |
| 1     | 要件定義             | 要件         | [phase-1-requirements.md](phase-1-requirements.md)                   |
| 2     | 設計                 | 設計         | [phase-2-design.md](phase-2-design.md)                               |
| 3     | 設計レビューゲート   | ゲート       | [phase-3-design-review-gate.md](phase-3-design-review-gate.md)       |
| 4     | テスト作成           | TDD-Red      | [phase-4-test-creation.md](phase-4-test-creation.md)                 |
| 5     | 実装                 | TDD-Green    | [phase-5-implementation.md](phase-5-implementation.md)               |
| 6     | テスト拡充           | 品質         | [phase-6-test-enhancement.md](phase-6-test-enhancement.md)           |
| 7     | テストカバレッジ確認 | 品質         | [phase-7-coverage-verification.md](phase-7-coverage-verification.md) |
| 8     | リファクタリング     | TDD-Refactor | [phase-8-refactoring.md](phase-8-refactoring.md)                     |
| 9     | 品質保証             | 品質         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md)         |
| 10    | 最終レビューゲート   | ゲート       | [phase-10-final-review-gate.md](phase-10-final-review-gate.md)       |
| 11    | 手動テスト検証       | 検証         | [phase-11-manual-testing.md](phase-11-manual-testing.md)             |
| 12    | ドキュメント更新     | 文書化       | [phase-12-documentation.md](phase-12-documentation.md)               |
| 13    | PR作成               | 完了         | [phase-13-pr-creation.md](phase-13-pr-creation.md)                   |

---

## 成果物

| 成果物             | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| コンポーネント修正 | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`            |
| コンポーネント修正 | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`             |
| コンポーネント修正 | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` |
| ビュー修正         | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   |
| テスト更新         | 各コンポーネントの `__tests__` ディレクトリ内テストファイル                |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`                                 |
| ドキュメント       | `outputs/phase-12/documentation-changelog.md`                              |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名              | パス                                                                         | 内容                      |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| 状態管理仕様        | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustand設計原則と状態配置 |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | コンポーネント設計ガイド  |

### プロジェクトルール

| 資料名           | パス                                   | 内容                              |
| ---------------- | -------------------------------------- | --------------------------------- |
| 状態管理ルール   | `.claude/rules/03-state-management.md` | Zustand設計原則                   |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`   | P31 Zustand Store Hooks無限ループ |
| コード品質ルール | `.claude/rules/02-code-quality.md`     | リファクタリング原則              |

### 先行タスク

| タスクID                             | 関係 | 説明                                          | ステータス |
| ------------------------------------ | ---- | --------------------------------------------- | ---------- |
| UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 | 先行 | Zustand Store Hooks無限ループ修正（短期対処） | 完了       |

---

## 関連パターン（既知の落とし穴）

| Pitfall ID | タイトル                      | 関連性                                     |
| ---------- | ----------------------------- | ------------------------------------------ |
| P31        | Zustand Store Hooks無限ループ | 合成Hookが毎回新しいオブジェクトを返す問題 |
| P5         | リスナー二重登録              | useEffect内でのリスナー登録に注意          |

---

## 移行パターン

### Before（合成Hook）

```typescript
// 問題のあるパターン
const { authMode, initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);

useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []);
```

### After（個別セレクタHook）

```typescript
// 推奨パターン
const authMode = useAuthMode();
const initializeAuthMode = useInitializeAuthMode();

useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 関数は安定した参照
```

---

## 変更履歴

| 日付       | 変更内容 |
| ---------- | -------- |
| 2026-02-12 | 初版作成 |
