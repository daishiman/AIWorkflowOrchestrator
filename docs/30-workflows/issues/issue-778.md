# [#778] "[UT-STORE-HOOKS-COMPONENT-MIGRATION-001] Store Hooks コンポーネント移行"

## メタ情報

```yaml
task_id: UT-STORE-HOOKS-COMPONENT-MIGRATION-001
task_name: Store Hooks コンポーネント移行
category: リファクタリング
target_feature: Zustand Store Hooks
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 12
created_date: 2026-02-11
dependencies: []
spec_path: docs/30-workflows/completed-tasks/UT-STORE-HOOKS-REFACTOR-001/unassigned-tasks/task-ut-store-hooks-component-migration-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-STORE-HOOKS-REFACTOR-001で個別セレクタHookの作成と合成Hookの非推奨化を完了したが、既存コンポーネントの移行は本タスクのスコープ外となった。

### 1.2 問題点・課題

合成Hook（`useLLMStore()`, `useSkillStore()`, `useAuthModeStore()`）は毎回新しいオブジェクトを返すため、その中の関数を`useEffect`の依存配列に含めると無限ループが発生する可能性がある。

現在、既存コンポーネントでは以下の問題が残存している：

- `useRef`ガードによる暫定対策が必要
- ESLintの依存配列警告を無視する必要がある
- コードの可読性・保守性が低下している

### 1.3 放置した場合の影響

- 無限ループ発生リスクが残存
- 新規開発者が合成Hookを使用し、同様の問題を再発させる可能性
- コードベース全体の品質・一貫性が低下
- 将来的なリファクタリングコストの増大

---

## 2. 何を達成するか（What）

### 2.1 目的

既存コンポーネントで使用されている合成Hook（`useLLMStore()`, `useSkillStore()`, `useAuthModeStore()`）を個別セレクタHookに移行し、無限ループ問題を根本的に解決する。

### 2.2 最終ゴール

- 全ての合成Hook使用箇所が個別セレクタHookに移行されている
- `useRef`ガードなしで`useEffect`の依存配列に関数を安全に含められる
- 開発環境で非推奨警告が表示されない
- 既存機能が正常に動作する

### 2.3 スコープ

#### 含むもの

- `LLMSelectorPanel.tsx` の `useLLMStore()` 移行
- `SkillSelector.tsx` の `useSkillStore()` 移行
- `AuthModeSettings.tsx` の `useAuthModeStore()` 移行
- 移行に伴うテストの調整

#### 含まないもの

- 新規個別セレクタHookの作成（UT-STORE-HOOKS-REFACTOR-001で完了済み）
- 他のコンポーネントの移行（上記3ファイル以外）
- Store構造の変更

### 2.4 成果物

| 成果物                   | パス                                                           |
| ------------------------ | -------------------------------------------------------------- |
| 移行済みLLMSelectorPanel | apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx  |
| 移行済みSkillSelector    | apps/desktop/src/renderer/components/skill/SkillSelector.tsx   |
| 移行済みAuthModeSettings | apps/desktop/src/renderer/components/auth/AuthModeSettings.tsx |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-STORE-HOOKS-REFACTOR-001が完了していること
- 個別セレクタHook（`useLLMProviders`, `useSelectedProviderId`, `useLLMActions`等）が利用可能であること
- 対象コンポーネントのテストが存在すること

### 3.2 依存タスク

| タスクID                    | 状態 | 依存内容                     |
| --------------------------- | ---- | ---------------------------- |
| UT-STORE-HOOKS-REFACTOR-001 | 完了 | 個別セレクタHookの作成・公開 |

### 3.3 必要な知識

- Zustand の Selector パターン
- React Hooks（useEffect, useRef）の依存配列の仕組み
- 本プロジェクトの Store 構造

### 3.4 推奨アプローチ

1. 対象ファイルごとに段階的に移行（1ファイルずつ）
2. 各移行後にテストを実行して動作確認
3. 非推奨警告が表示されないことを確認

### 3.5 実装課題と解決策

UT-STORE-HOOKS-REFACTOR-001タスクで苦戦した箇所を以下に記録する。

#### P32: Actions Hookも無限ループリスク

- **問題**: 当初、状態セレクタのみを個別化すればよいと考えていたが、Actions Hook（`useLLMActions()` 等）も毎回新しいオブジェクトを返すため、同様の無限ループ問題が発生する
- **症状**: `useEffect`の依存配列に`useLLMActions()`の戻り値内の関数を含めると無限ループ
- **解決策**: Actions Hookも全て個別セレクタ化する（`useFetchProviders()`, `useSelectProvider()` 等）

```typescript
// 問題: 毎回新しいオブジェクトを返す
const { fetchProviders } = useLLMActions();

// 解決策: 個別セレクタで安定した参照を取得
const fetchProviders = useAppStore((state) => state.fetchProviders);
```

#### P33: 複数購読パターンのパフォーマンス問題

- **問題**: `useSelectedProvider`等が内部で複数回`useAppStore`を呼び出しており、不要な再計算・再レンダリングが発生
- **症状**: パフォーマンス低下、不要なコンポーネント再レンダリング
- **解決策**: 単一の`useAppStore`呼び出しで必要な値をまとめて取得

```typescript
// 問題: 複数回の購読
const useSelectedProvider = () => {
  const providers = useAppStore((s) => s.llm.providers);
  const selectedId = useAppStore((s) => s.llm.selectedProviderId);
  return providers.find((p) => p.id === selectedId);
};

// 解決策: 単一の購読で計算
const useSelectedProvider = () =>
  useAppStore((state) =>
    state.llm.providers.find((p) => p.id === state.llm.selectedProviderId),
  );
```

#### P34: React HookテストにおけるgetState()とrenderHookの乖離

- **問題**: `getState()`でテストしていたが、これはReact Hookの実際の動作とは異なる。Hookは内部でsubscribeを行い、状態変更時に再レンダリングをトリガーするが、`getState()`はこれをバイパスする
- **症状**: テストはパスするが、実際のReactコンポーネントでは期待通りに動作しない
- **解決策**: `@testing-library/react`の`renderHook`を使用してHookの実際の動作をテスト

```typescript
// 問題: getState()はReact Hookの動作と異なる
const state = useAppStore.getState();
expect(state.llm.providers).toEqual([...]);

// 解決策: renderHookで実際のHook動作をテスト
const { result } = renderHook(() => useLLMProviders());
expect(result.current).toEqual([...]);
```

### 3.6 システム仕様書参照

| 仕様書                                  | 参照セクション                        |
| --------------------------------------- | ------------------------------------- |
| arch-state-management.md                | Zustand設計原則                       |
| zustand-patterns.md                     | セレクタパターン、無限ループ防止      |
| architecture-implementation-patterns.md | S1: API二重定義の型管理、S4: 波及影響 |
| 06-known-pitfalls.md                    | P31-P34: 無限ループ防止               |
| 03-state-management.md                  | リスナー管理                          |

---

## 4. 実行手順

### Phase構成

本タスクは小規模のため、単一Phaseで実行可能。

### Phase 1: コンポーネント移行

#### Step 1: 対象ファイルの使用箇所を特定

```bash
grep -rn "useLLMStore\|useSkillStore\|useAuthModeStore" apps/desktop/src/renderer/components/
```

#### Step 2: 各コンポーネントで使用している値を分析

```typescript
// Before: 合成Hook
const { providers, fetchProviders, selectedProviderId, selectProvider } =
  useLLMStore();
```

#### Step 3: 個別セレクタHookに置換

```typescript
// After: 個別セレクタHook
import {
  useLLMProviders,
  useSelectedProviderId,
  useLLMActions,
} from "@/renderer/store";

const providers = useLLMProviders();
const selectedProviderId = useSelectedProviderId();
const { fetchProviders, selectProvider } = useLLMActions();
```

#### Step 4: useEffectの依存配列を更新

```typescript
// Before: useRefガードが必要だった
const { fetchProviders } = useLLMStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    fetchProviders();
  }
}, []);

// After: 依存配列に安全に含められる
const { fetchProviders } = useLLMActions();
useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 無限ループなし
```

#### Step 5: テスト実行

```bash
pnpm --filter @repo/desktop test -- --run
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `LLMSelectorPanel.tsx` が個別セレクタHookを使用している
- [ ] `SkillSelector.tsx` が個別セレクタHookを使用している
- [ ] `AuthModeSettings.tsx` が個別セレクタHookを使用している
- [ ] 全ての`useRef`ガードが削除されている

### 品質要件

- [ ] 既存テストが全てPASS
- [ ] 開発環境で非推奨警告が表示されない
- [ ] TypeScriptの型エラーがない
- [ ] ESLintエラーがない

### ドキュメント要件

- [ ] 移行完了記録がLOGS.mdに追加されている
- [ ] 関連する未タスクが完了としてマークされている

---

## 6. 検証方法

### 6.1 自動テスト

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- --run

# 対象コンポーネントのテスト
pnpm --filter @repo/desktop test -- --run LLMSelectorPanel
pnpm --filter @repo/desktop test -- --run SkillSelector
pnpm --filter @repo/desktop test -- --run AuthModeSettings
```

### 6.2 手動テスト

| テスト項目                             | 期待結果                         |
| -------------------------------------- | -------------------------------- |
| 設定画面が正常に動作すること           | 画面が正常に表示される           |
| LLM/スキル選択が無限ループしないこと   | 選択操作が1回で完了する          |
| 認証モード切り替えが正常に動作すること | モード切り替えが正常に反映される |
| 非推奨警告が表示されないこと           | コンソールに警告が出ない         |

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                           |
| ---------------------------- | ------ | -------- | ---------------------------------------------- |
| 移行漏れによる無限ループ残存 | 高     | 低       | grep -rnで全使用箇所を特定し、チェックリスト化 |
| 移行後のテスト失敗           | 中     | 中       | 各コンポーネント移行後に個別テスト実行         |
| 既存機能の破壊               | 高     | 低       | 段階的移行（1ファイルずつ）で影響を限定        |

---

## 8. 参照情報

### 関連ドキュメント

| 資料                | パス                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------- |
| 実装ガイド          | docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/outputs/phase-12/implementation-guide.md |
| P31: 無限ループ防止 | .claude/rules/06-known-pitfalls.md                                                     |
| 状態管理ルール      | .claude/rules/03-state-management.md                                                   |
| Store index.ts      | apps/desktop/src/renderer/store/index.ts                                               |

### 参考資料

- [Zustand公式ドキュメント - Selectors](https://github.com/pmndrs/zustand#selecting-multiple-state-slices)
- [React useEffect依存配列のベストプラクティス](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies)

---

## 9. 備考

### 発見元の原文

UT-STORE-HOOKS-REFACTOR-001 Phase 12 未タスク検出にて発見。

```
既存コンポーネントの移行は本タスクのスコープ外とし、別タスク（UT-STORE-HOOKS-COMPONENT-MIGRATION-001）として登録。
```

### 補足事項

- 対象コンポーネントの特定は`grep`コマンドで行うが、実際の使用箇所が変更されている可能性があるため、Phase実行時に再確認すること
- 移行優先度は`LLMSelectorPanel` > `SkillSelector` > `AuthModeSettings`の順を推奨
