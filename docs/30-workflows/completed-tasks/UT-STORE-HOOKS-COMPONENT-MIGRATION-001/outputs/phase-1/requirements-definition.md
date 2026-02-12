# Phase 1: 要件定義書

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| タスクID   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| タスク名   | Store Hooks コンポーネント移行         |
| Phase      | 1                                      |
| 作成日     | 2026-02-12                             |
| ステータス | 完了                                   |

---

## 1. 背景

### 1.1 問題の概要（P31: Zustand Store Hooks無限ループ）

合成Store Hook（`useLLMStore()`, `useSkillStore()`, `useAuthModeStore()`）が毎回新しいオブジェクトを返すため、その中の関数を`useEffect`の依存配列に含めると無限ループが発生する。

### 1.2 現状の短期対策

| コンポーネント   | 使用Hook             | 対策パターン              |
| ---------------- | -------------------- | ------------------------- |
| LLMSelectorPanel | `useLLMStore()`      | useRefガード + 空依存配列 |
| SkillSelector    | `useSkillStore()`    | useCallback空依存配列     |
| SettingsView     | `useAuthModeStore()` | useRefガード + 空依存配列 |

### 1.3 短期対策の問題点

- ESLint `react-hooks/exhaustive-deps` ルールの警告抑制が必要
- コードの可読性が低下
- 将来の開発者への教育コストが発生
- 依存配列の意図が不明確

---

## 2. 目的

合成Hook（`useLLMStore()`, `useSkillStore()`, `useAuthModeStore()`）を個別セレクタHook（`useLLM()`, `useSetLLM()`等）に移行し、無限ループ問題を根本的に解決する。

---

## 3. スコープ

### 3.1 対象（In Scope）

| コンポーネント   | パス                                                            | 現在のHook           |
| ---------------- | --------------------------------------------------------------- | -------------------- |
| LLMSelectorPanel | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | `useLLMStore()`      |
| SkillSelector    | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | `useSkillStore()`    |
| SettingsView     | `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | `useAuthModeStore()` |

- LLM系個別セレクタHookの新規追加
- Skill系個別セレクタHookの新規追加
- AuthMode系アクションセレクタHookの追加（既存のstateセレクタは流用）
- 対象コンポーネントの移行
- useRefガードの削除
- 関連テストの作成・更新

### 3.2 対象外（Out of Scope）

- Store Slice自体の構造変更
- 他のコンポーネントへの展開（本タスク完了後の後続対応）
- 合成Store Hookの完全削除（後方互換性維持のため残す）

---

## 4. 機能要件（FR）

### FR-1: LLM個別セレクタHookの提供

| セレクタ                     | 戻り値                                         | 種別   |
| ---------------------------- | ---------------------------------------------- | ------ |
| `useLLMProviders()`          | `LLMProvider[]`                                | State  |
| `useLLMSelectedProviderId()` | `LLMProviderId \| null`                        | State  |
| `useLLMSelectedModelId()`    | `string \| null`                               | State  |
| `useLLMIsLoading()`          | `boolean`                                      | State  |
| `useLLMError()`              | `LLMError \| null`                             | State  |
| `useLLMHealthStatus()`       | `Record<LLMProviderId, HealthCheckResult>`     | State  |
| `useLLMFetchProviders()`     | `() => Promise<void>`                          | Action |
| `useLLMSelectProvider()`     | `(providerId: LLMProviderId) => void`          | Action |
| `useLLMSelectModel()`        | `(modelId: string) => void`                    | Action |
| `useLLMCheckHealth()`        | `(providerId: LLMProviderId) => Promise<void>` | Action |

### FR-2: Skill個別セレクタHookの提供

| セレクタ                       | 戻り値                           | 種別   |
| ------------------------------ | -------------------------------- | ------ |
| `useAvailableSkillsMetadata()` | `SkillMetadata[]`                | State  |
| `useImportedSkills()`          | `ImportedSkill[]`                | State  |
| `useSelectedSkillName()`       | `string \| null`                 | State  |
| `useIsScanning()`              | `boolean`                        | State  |
| `useIsSkillExecuting()`        | `boolean`                        | State  |
| `useSkillError()`              | `string \| null`                 | State  |
| `useRescanSkills()`            | `() => Promise<void>`            | Action |
| `useSelectSkillByName()`       | `(name: string \| null) => void` | Action |
| `useFetchSkills()`             | `() => Promise<void>`            | Action |

### FR-3: AuthMode追加セレクタHookの提供

既存セレクタ（流用）:

- `useAuthMode()` - state.mode
- `useAuthModeStatus()` - state.status
- `useAuthModeLoading()` - state.isLoading
- `useAuthModeError()` - state.error

新規追加:
| セレクタ | 戻り値 | 種別 |
| -------------------------- | ------------------------------------- | ------ |
| `useSetAuthMode()` | `(mode: AuthMode) => Promise<void>` | Action |
| `useInitializeAuthMode()` | `() => void` | Action |

### FR-4: コンポーネント移行

対象コンポーネントを個別セレクタHook使用に移行し、useRefガードを削除する。

### FR-5: 後方互換性維持

合成Store Hook（`useLLMStore()`, `useSkillStore()`, `useAuthModeStore()`）は削除せず、内部でshallow比較を使用して維持する。

---

## 5. 非機能要件（NFR）

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

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 6. 受け入れ基準（AC）

### AC-1: 個別セレクタHookの実装

- [ ] LLM系個別セレクタHook（10個）が実装されている
- [ ] Skill系個別セレクタHook（9個）が実装されている
- [ ] AuthMode追加セレクタHook（2個）が実装されている
- [ ] 各個別セレクタHookのユニットテストが存在する

### AC-2: コンポーネント移行

- [ ] `LLMSelectorPanel`が個別セレクタHookを使用している
- [ ] `SkillSelector`が個別セレクタHookを使用している
- [ ] `SettingsView`が個別セレクタHookを使用している
- [ ] 各コンポーネントからuseRefガードが除去されている
- [ ] P31対策コメントが除去されている

### AC-3: 品質基準

- [ ] 全テストがPASS
- [ ] ESLint警告なし（react-hooks/exhaustive-deps含む）
- [ ] TypeScript型チェックPASS
- [ ] 無限ループが発生しないことをDevToolsで確認

### AC-4: 後方互換性

- [ ] 合成Store Hookが引き続き使用可能
- [ ] 既存の機能が正常に動作

---

## 7. 現状分析結果

### 7.1 既存の個別セレクタHook

**AuthMode系（5個）**: 既存

- `useAuthMode()`, `useAuthModeStatus()`, `useAuthModeLoading()`, `useAuthModeError()`, `useIsAuthModeValid()`

**LLM系**: なし（新規追加必要）

**Skill系**: なし（新規追加必要）

### 7.2 テスト状況

| コンポーネント   | テスト数 | モック方式               |
| ---------------- | -------- | ------------------------ |
| LLMSelectorPanel | 20個     | useLLMStoreをモック      |
| SkillSelector    | 30個     | useSkillStoreをモック    |
| SettingsView     | 複数     | useAuthModeStoreをモック |

移行テスト（\*.migration.test.tsx）: 存在しない（新規作成必要）

---

## 8. 完了条件

- [x] 全要件が抽出されている
- [x] 各要件に受け入れ基準がある
- [x] FR/NFRが分類されている
- [x] 対象コンポーネントが特定されている
- [x] 現状分析が完了している
- [x] **本Phase内の全タスクを100%実行完了**

---

## 9. 次のPhase

Phase 2: 設計
