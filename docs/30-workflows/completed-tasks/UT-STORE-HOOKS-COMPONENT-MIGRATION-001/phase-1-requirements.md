# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 1                                      |
| 機能名   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| タスクID | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| タスク名 | Store Hooks コンポーネント移行         |
| 作成日   | 2026-02-12                             |

## 目的

合成Store Hook（useLLMStore(), useSkillStore(), useAuthModeStore()）を個別セレクタHookに移行し、useEffect依存配列の無限ループ問題（P31）を根本的に解決する。

## 背景

### 問題の概要（P31: Zustand Store Hooks無限ループ）

合成Store Hookが毎回新しいオブジェクトを返すため、その中の関数を`useEffect`の依存配列に含めると無限ループが発生する。

**現状の短期解決策**:

- useRefガードパターンを適用済み
- 空の依存配列を使用
- ESLint警告を抑制するコメントを追加

**短期解決策の問題点**:

- ESLint `react-hooks/exhaustive-deps` ルールの警告抑制が必要
- コードの可読性が低下
- 将来の開発者への教育コストが発生
- 依存配列の意図が不明確になりやすい

### 長期解決策: 個別セレクタベースの再設計

Store Hookを分解し、個別セレクタを提供することで、関数の参照安定性を確保する。

## 参照資料

| 資料名            | パス                                                                         | 説明                               |
| ----------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| P31既知の落とし穴 | `.claude/rules/06-known-pitfalls.md#P31`                                     | 無限ループ問題の詳細               |
| 状態管理パターン  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustand設計原則・P31対策セクション |
| store/index.ts    | `apps/desktop/src/renderer/store/index.ts`                                   | 現行Store定義                      |

## 対象コンポーネント

| コンポーネント     | ファイルパス                                                    | 使用する合成Hook     | 現状                 |
| ------------------ | --------------------------------------------------------------- | -------------------- | -------------------- |
| `LLMSelectorPanel` | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | `useLLMStore()`      | useRefガード適用済み |
| `SkillSelector`    | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | `useSkillStore()`    | useRefガード適用済み |
| `SettingsView`     | `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | `useAuthModeStore()` | useRefガード適用済み |

## 機能要件（FR）

### FR-1: 個別セレクタHookの提供

各合成Store Hookに対して、以下のパターンで個別セレクタHookを提供する:

| 合成Hook             | 提供する個別セレクタ                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `useLLMStore()`      | `useProviders()`, `useSelectedProviderId()`, `useFetchProviders()`, `useSelectProvider()`, `useSelectModel()`, `useCheckHealth()` 等 |
| `useSkillStore()`    | `useAvailableSkillsMetadata()`, `useImportedSkills()`, `useSelectedSkillName()`, `useSelectSkillByName()`, `useRescanSkills()` 等    |
| `useAuthModeStore()` | `useAuthMode()`, `useSetAuthMode()`, `useInitializeAuthMode()`, `useAuthModeStatus()` 等                                             |

### FR-2: コンポーネントの移行

対象コンポーネントを個別セレクタHook使用に移行する:

| コンポーネント     | 移行内容                                                                             |
| ------------------ | ------------------------------------------------------------------------------------ |
| `LLMSelectorPanel` | `useLLMStore()` → 個別セレクタ（`useProviders()`, `useFetchProviders()` 等）         |
| `SkillSelector`    | `useSkillStore()` → 個別セレクタ（`useImportedSkills()`, `useRescanSkills()` 等）    |
| `SettingsView`     | `useAuthModeStore()` → 個別セレクタ（`useAuthMode()`, `useInitializeAuthMode()` 等） |

### FR-3: useRefガードの除去

個別セレクタHook移行後、不要になったuseRefガードパターンを除去する:

- `providersFetchedRef` の除去（LLMSelectorPanel）
- `prevProviderIdRef` の除去（LLMSelectorPanel）
- 空の依存配列コメント（`// P31対策`）の除去
- ESLint disable コメントの除去

### FR-4: 後方互換性の維持

合成Store Hook（`useLLMStore()`, `useSkillStore()`, `useAuthModeStore()`）は削除せず、内部で個別セレクタを使用するように再実装する。

## 非機能要件（NFR）

### NFR-1: 無限ループ発生なし

- 個別セレクタHookを`useEffect`の依存配列に含めても無限ループが発生しないこと
- DevToolsでStateの連続更新が発生しないこと

### NFR-2: ESLint警告なし

- `react-hooks/exhaustive-deps` ルールの警告が発生しないこと
- eslint-disable コメントが不要になること

### NFR-3: パフォーマンス

- 個別セレクタによる不要な再レンダリングが発生しないこと
- shallow比較による最適化が適切に機能すること

### NFR-4: テストカバレッジ

| 指標              | 基準 |
| ----------------- | ---- |
| Line Coverage     | 80%+ |
| Branch Coverage   | 60%+ |
| Function Coverage | 80%+ |

## 受け入れ基準（AC）

### AC-1: 個別セレクタHookの実装

- [ ] `useLLMStore()`に対応する個別セレクタHookが提供されている
- [ ] `useSkillStore()`に対応する個別セレクタHookが提供されている
- [ ] `useAuthModeStore()`に対応する個別セレクタHookが提供されている
- [ ] 各個別セレクタHookのユニットテストが存在する

### AC-2: コンポーネント移行

- [ ] `LLMSelectorPanel`が個別セレクタHookを使用している
- [ ] `SkillSelector`が個別セレクタHookを使用している
- [ ] `SettingsView`が個別セレクタHookを使用している
- [ ] 各コンポーネントからuseRefガードが除去されている

### AC-3: 品質基準

- [ ] 全テストがPASS
- [ ] ESLint警告なし（react-hooks/exhaustive-deps含む）
- [ ] TypeScript型チェックPASS
- [ ] 無限ループが発生しないことをDevToolsで確認

### AC-4: 後方互換性

- [ ] 合成Store Hookが引き続き使用可能
- [ ] 既存の機能が正常に動作

## スコープ

### 対象範囲

- 個別セレクタHookの新規実装（store/index.ts または専用ファイル）
- 対象3コンポーネントの移行
- 関連テストの作成・更新

### 対象外

- 他のコンポーネントへの個別セレクタHook適用（本タスク完了後の展開）
- Store構造の大規模リファクタリング
- 新機能の追加

## アーキテクチャ層別要件

| 層                         | 要件                                                   |
| -------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | コンポーネントの個別セレクタHook移行、useRefガード除去 |
| 状態管理（Zustand）        | 個別セレクタHookの提供、shallow比較による最適化        |

## 統合テスト連携

| 接続要件カテゴリ | 記載内容                                             |
| ---------------- | ---------------------------------------------------- |
| Store接続        | 個別セレクタHookがStoreから正しく値を取得できること  |
| コンポーネント   | 移行後のコンポーネントが正常にレンダリングされること |
| 状態更新         | 状態変更が正しくUIに反映されること                   |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 本ドキュメント   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義（本文内） |

## 完了条件

- [x] 全要件が抽出されている
- [x] 各要件に受け入れ基準がある
- [x] FR/NFRが分類されている
- [x] 対象コンポーネントが特定されている
- [x] アーキテクチャ層別の要件が整理されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
