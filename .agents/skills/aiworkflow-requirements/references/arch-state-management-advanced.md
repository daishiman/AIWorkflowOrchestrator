# 状態管理パターン（Desktop Renderer） / advanced specification

> 親仕様書: [arch-state-management.md](arch-state-management.md)
> 役割: advanced specification

## P31対策: Store Hooks無限ループ防止パターン

> 参照: [06-known-pitfalls.md#P31](../../../rules/06-known-pitfalls.md#p31-zustand-store-hooks無限ループ)

### 問題の概要

合成Store Hook（`useAuthModeStore()`等）が毎回新しいオブジェクトを返すため、その中の関数を`useEffect`の依存配列に含めると無限ループが発生する。

### 症状

- 設定画面がぐるぐる回り続ける
- LLM/スキル選択が無限実行される
- DevToolsでStateの更新が連続発生

### 対象コンポーネント

| コンポーネント     | ファイルパス                                                              | 影響するHook         |
| ------------------ | ------------------------------------------------------------------------- | -------------------- |
| `SettingsView`     | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                  | `useInitializeAuthMode()`（現行は個別セレクタへ移行済み） |
| `LLMSelectorPanel` | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`           | `useFetchProviders()` / `useCheckLLMHealth()`（個別セレクタ） |
| `SkillSelector`    | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`            | `useRescanSkills()`（個別セレクタ） |
| `AgentView`        | `apps/desktop/src/renderer/views/AgentView/index.tsx`                     | `useAppStore()` のインラインセレクタ + ローカル `fetchSkills` |
| `SkillCenterView`  | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | `useAvailableSkillsMetadata()` など個別セレクタ + `useSkillCenter` ローカル状態（`navigateToSkillCreate` / `navigateToWorkspace` / `navigateToSkillAnalysis` ナビゲーション関数3つ: TASK-SKILL-LIFECYCLE-02） |

### 歴史的な短期回避策: useRefガードパターン

初期リリースでは useRef ガードを一時的に採用したが、現在の標準実装は個別セレクタ + 安定参照の依存配列である。

**アンチパターン（無限ループ発生）**:

```typescript
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 毎回新しい関数参照 → 無限ループ
```

**旧パターン（現在は非推奨）**:

```typescript
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []); // 依存配列は空
```

### 依存配列設計のベストプラクティス

| ケース                         | 依存配列                     | 備考                                   |
| ------------------------------ | ---------------------------- | -------------------------------------- |
| 初期化処理（一度だけ実行）     | `[stableAction]`             | 個別セレクタの安定参照を前提とする     |
| プリミティブ値の変化で再実行   | `[primitiveValue]`           | 安全                                   |
| 合成Hookから取り出した関数     | 使用禁止                     | 毎回新しい参照となり無限ループの原因   |
| 外部から受け取ったコールバック | `[callback]`                 | useCallbackでメモ化されていれば安全    |

### 個別セレクタHookパターン（推奨）

> **P31対策として確立** (UT-STORE-HOOKS-COMPONENT-MIGRATION-001)

合成Hook（`useLLMStore()`等）の代わりに、個別セレクタHookを使用する。

**推奨パターン**:

```typescript
// ✅ 推奨: 個別セレクタ
const providers = useLLMProviders();
const fetchProviders = useLLMFetchProviders();

useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 参照安定 → 安全

// ❌ 非推奨: 合成Hook
const { providers, fetchProviders } = useLLMStore();

useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 毎回新参照 → 無限ループ
```

**個別セレクタの定義パターン**:

```typescript
// State セレクタ（値を返す）
export const useLLMProviders = () => useAppStore((state) => state.providers);

// Action セレクタ（関数を返す - 参照安定）
export const useLLMFetchProviders = () => useAppStore((state) => state.fetchProviders);
```

**個別セレクタの命名規約**:

| ルール | 命名パターン | 例 |
| --- | --- | --- |
| 状態セレクタ | `use` + 状態名 + 機能ドメインサフィックス | `useIsAnalyzingSkill()` (`useIsAnalyzing()` は不可) |
| アクションセレクタ | `use` + 動詞 + 対象 + 機能ドメインサフィックス | `useAnalyzeSkill()`, `useApplySkillImprovements()` |
| 汎用名の回避 | 複数Sliceで同名になりうる場合はドメインを明示 | `useSkillError()` (`useError()` は不可) |

> **TASK-10A-D教訓**: agentSlice に `isAnalyzing` / `isImproving` を追加した際、LLMSlice の `useIsLLMLoading()` と類似する汎用名になるリスクがあった。ドメインサフィックス（`Skill`）を付与して衝突を防止。

**現行 AuthMode セレクタ**: `apps/desktop/src/renderer/store/index.ts` に状態 7 個 + アクション 10 個を配置し、`useAuthModeStore()` は互換用 deprecated helper として残す。
（UT-FIX-AGENTVIEW-INFINITE-LOOP-001でAgentView向け個別セレクタも追加し、P31適用範囲を拡張）
**提供済み個別セレクタ**: LLM系12個、Skill系15個、AuthMode系3個、AgentView Enhancement系5個（計35個）
（UT-FIX-AGENTVIEW-INFINITE-LOOP-001でAgentView向け15個を追加し、P31適用範囲を拡張）
（TASK-UI-03で実行履歴・詳細設定パネル向け5個を追加: `useRecentExecutions`, `useAddExecutionToHistory`, `useIsAdvancedSettingsOpen`, `useSetAdvancedSettingsOpen`, `useClearExecutionHistory`）

### 長期解決策: 個別セレクタベースの再設計

> **✅ 実装完了** (2026-02-12): UT-STORE-HOOKS-COMPONENT-MIGRATION-001 にて個別セレクタパターンを実装。LLM系12個・Skill系15個・AuthMode系3個の計30個の個別セレクタHookを `store/index.ts` に追加。LLMSelectorPanel、SkillSelector、SettingsView の3コンポーネントを移行し、useRefガードを削除。71テスト全PASS。

Store Hookを分解し、個別セレクタを提供することで、関数の参照安定性を確保する。

| 現行パターン                                         | 推奨パターン                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| `const { authMode, setAuthMode } = useAuthModeStore()` | `const authMode = useAuthMode()`<br>`const setAuthMode = useSetAuthMode()`     |
| オブジェクト全体を返す                               | 個別の値/関数を返す                                                              |
| 毎回新しい参照                                       | 安定した参照（shallow比較可能）                                                  |

### AgentView適用拡張（UT-FIX-AGENTVIEW-INFINITE-LOOP-001）

> **✅ 実装完了** (2026-02-12): AgentViewでP31パターンを適用。`useAppStore((state) => ...)` のインラインセレクタ群を `store/index.ts` の個別セレクタHookへ移行し、ローカル `fetchSkills` の `useCallback` を廃止。

| 項目 | 変更内容 |
| ---- | -------- |
| 状態取得 | `skills/error/isLoading` 系を `useImportedSkills/useSkillError/useIsLoadingSkills` へ移行 |
| アクション | `selectSkill/setSkillFilter/openImportDialog` 等を個別セレクタHook経由へ統一 |
| 取得処理 | コンポーネント内の独自 `fetchSkills` 実装を削除し、Sliceの `useFetchSkills` に統一 |
| 品質 | デバッグ `console.log` を削除し、再レンダリング安定性テストを追加 |

#### 実装時の苦戦箇所と再発防止（UT-FIX-AGENTVIEW-INFINITE-LOOP-001）

| 苦戦箇所 | 原因 | 再発防止 |
| --- | --- | --- |
| 単体テスト対象を指定したつもりが広範囲テスト実行に拡大 | `pnpm --filter @repo/desktop run test:run -- <file>` が環境依存で全体実行に流れるケースがある | 単体再検証は `pnpm --filter @repo/desktop exec vitest run <file>` を標準化 |
| 未タスクID参照に対して指示書実体が欠落しやすい | `task-workflow.md` 更新と `unassigned-task/` 実ファイル配置の同期漏れ | Phase 12で「参照パスの物理ファイル存在確認」を必須化（`ls docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/<file>.md`） |
| 長時間テストで性能閾値テストが一時的に不安定化 | 高負荷時にミリ秒閾値テストが揺らぐ | 失敗検知後に対象ファイル単体で再実行し、再現性を確認してから判断する |

**推奨実装パターン**:

```typescript
// store/index.ts
export const useAuthMode = () => useAppStore((state) => state.mode);
export const useAuthModeStatus = () => useAppStore((state) => state.status);
export const useSetAuthMode = () => useAppStore((state) => state.setMode);
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);

// コンポーネント側
const authMode = useAuthMode();
const authModeStatus = useAuthModeStatus();
const initializeAuthMode = useInitializeAuthMode();

useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 安定した参照のため無限ループしない
```

### Slide slice runtime alignment（TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001）

> **ステータス**: `spec_created`（2026-03-19 再監査同期）

slide store は `syncStatus` だけでは task 09 の runtime/auth-mode alignment を表現できない。正本では以下の state を持つ。

| フィールド | 型 | 役割 |
| --- | --- | --- |
| `syncStatus` | `SyncStatus` | `idle` / `syncing` / `synced` / `error` |
| `syncDirection` | `SyncDirection` | `forward` / `reverse` |
| `syncProgress` | `{ percent, message } \| null` | sync 進捗 |
| `syncError` | `{ code, message } \| null` | degraded reason |
| `isHandoff` | `boolean` | terminal handoff 必須か |
| `handoffGuidance` | `HandoffGuidance \| null` | terminal launcher 用 DTO |
| `isWatching` | `boolean` | watcher 接続状態 |

#### selector 方針

- scalar state は個別 selector を使う
- object payload は `useShallow` を使う
- `useSlideProject()` で store 全体参照を保持しない

#### current drift（2026-03-21）

| 項目 | 現状 |
| --- | --- |
| store fields | `syncDirection` / `syncProgress` / `syncError` / `isHandoff` / `handoffGuidance` が slide 専用 store へは未追加 |
| UI mapping | `out-of-sync` は shared 型として存在するが、Slide UI では `synced` シェルへ吸収される |

#### follow-up

| 未タスクID | 内容 |
| --- | --- |
| `UT-SLIDE-IMPL-001` | slide store 契約と runtime 契約を正本へ揃える |

### 実装済み個別セレクタ一覧（UT-STORE-HOOKS-REFACTOR-001）

個別セレクタは `apps/desktop/src/renderer/store/index.ts` を正本とする。

**AuthMode Store（現行 17 + 互換 helper 1）**: `apps/desktop/src/renderer/store/index.ts`

| カテゴリ | セレクタ名 | 戻り値型 |
| -------- | ---------- | -------- |
| 状態 | `useAuthMode` | `AuthMode` |
| 状態 | `useAuthModeStatus` | `AuthModeStatus \| null` |
| 状態 | `useAuthModeLoading` | `boolean` |
| 状態 | `useAuthModeError` | `string \| null` |
| 派生 | `useIsAuthModeValid` | `boolean` |
| 状態 | `useIsConfirmDialogOpen` | `boolean` |
| 状態 | `usePendingMode` | `AuthMode \| null` |
| アクション | `useSetAuthMode` | `(mode: AuthMode) => Promise<void>` |
| アクション | `useInitializeAuthMode` | `() => Promise<void>` |
| アクション | `useFetchAuthMode` | `() => Promise<void>` |
| アクション | `useFetchAuthModeStatus` | `() => Promise<void>` |
| アクション | `useValidateAuthMode` | `(mode?: AuthMode) => Promise<AuthModeStatus>` |
| アクション | `useOpenConfirmDialog` | `(targetMode: AuthMode) => void` |
| アクション | `useCloseConfirmDialog` | `() => void` |
| アクション | `useConfirmModeChange` | `() => Promise<void>` |
| アクション | `useClearAuthModeError` | `() => void` |
| アクション | `useResetAuthMode` | `() => void` |
| 非推奨 | `useAuthModeStore` | 合成オブジェクト（**非推奨**） |

**LLM Store（16個）**: `apps/desktop/src/renderer/store/hooks/useLLMStore.ts`

| カテゴリ | セレクタ名 | 戻り値型 |
| -------- | ---------- | -------- |
| 状態 | `useSelectedLLM` | `LLMProvider \| null` |
| 状態 | `useAvailableLLMs` | `LLMProvider[]` |
| 状態 | `useIsLLMLoading` | `boolean` |
| 状態 | `useLLMError` | `string \| null` |
| 状態 | `useIsLLMInitialized` | `boolean` |
| アクション | `useSelectLLM` | `(llm: LLMProvider \| null) => void` |
| アクション | `useSetAvailableLLMs` | `(llms: LLMProvider[]) => void` |
| アクション | `useSetLLMLoading` | `(loading: boolean) => void` |
| アクション | `useSetLLMError` | `(error: string \| null) => void` |
| アクション | `useClearLLMError` | `() => void` |
| アクション | `useInitializeLLMs` | `() => Promise<void>` |
| アクション | `useSetLLMInitialized` | `(initialized: boolean) => void` |
| アクション | `useRefreshLLMs` | `() => Promise<void>` |
| 派生 | `useHasValidLLMSelection` | `boolean` |
| 派生 | `useLLMDisplayName` | `string` |
| 非推奨 | `useLLMStore` | 合成オブジェクト（**非推奨**） |

**Agent Store（25個）**: `apps/desktop/src/renderer/store/hooks/useAgentStore.ts`

| カテゴリ | セレクタ名 | 戻り値型 |
| -------- | ---------- | -------- |
| スキル状態 | `useSkills` | `Skill[]` |
| スキル状態 | `useSelectedSkill` | `Skill \| null` |
| スキル状態 | `useSkillFilter` | `string` |
| スキル状態 | `useSkillCategory` | `string \| null` |
| スキル状態 | `useIsLoadingSkills` | `boolean` |
| スキル状態 | `useSkillError` | `string \| null` |
| 実行状態 | `useIsExecuting` | `boolean` |
| 実行状態 | `useExecutionStatus` | `AgentExecutionStatus` |
| 実行状態 | `useCurrentExecutionId` | `string \| null` |
| 実行状態 | `useExecutionOutput` | `string[]` |
| 権限状態 | `usePendingPermission` | `SkillPermissionRequest \| null` |
| スキルアクション | `useSetSkills` | `(skills: Skill[]) => void` |
| スキルアクション | `useSelectSkill` | `(skill: Skill \| null) => void` |
| スキルアクション | `useSetSkillFilter` | `(filter: string) => void` |
| スキルアクション | `useSetSkillCategory` | `(category: string \| null) => void` |
| スキルアクション | `useFetchSkills` | `() => Promise<void>` |
| スキルアクション | `useRescanSkills` | `() => Promise<void>` |
| スキルアクション | `useClearSkillError` | `() => void` |
| 実行アクション | `useExecuteSkill` | `(prompt: string) => Promise<void>` |
| 実行アクション | `useAbortExecution` | `() => void` |
| 実行アクション | `useClearExecution` | `() => void` |
| 権限アクション | `useRespondToPermission` | `(approved: boolean, remember?: boolean) => void` |
| 内部ハンドラ | `useHandleStreamMessage` | `(msg: SkillStreamMessage) => void` |
| 内部ハンドラ | `useHandleComplete` | `(executionId: string) => void` |
| 非推奨 | `useSkillStore` | 合成オブジェクト（**非推奨**） |

### 合成Hook非推奨化（@deprecated）

以下の合成Hookは非推奨となりました。個別セレクタへの移行を推奨します。

| 非推奨Hook | 移行先 | 理由 |
| ---------- | ------ | ---- |
| `useAuthModeStore()` | `useAuthMode()`, `useSetAuthMode()` 等 | 毎回新しいオブジェクトを返し無限ループの原因となる |
| `useLLMStore()` | `useSelectedLLM()`, `useSelectLLM()` 等 | 同上 |
| `useSkillStore()` | `useSkills()`, `useSelectSkill()` 等 | 同上 |

**移行パターン**:

```typescript
// 非推奨（無限ループのリスク）
const { authMode, setAuthMode, initializeAuthMode } = useAuthModeStore();

// 推奨（安定した参照）
const authMode = useAuthMode();
const setAuthMode = useSetAuthMode();
const initializeAuthMode = useInitializeAuthMode();
```

### 関連タスク

| タスクID                             | 内容                          | ステータス |
| ------------------------------------ | ----------------------------- | ---------- |
| UT-STORE-HOOKS-REFACTOR-001          | Store Hooks個別セレクタ再設計 | **完了**（UT-STORE-HOOKS-COMPONENT-MIGRATION-001で実施、2026-02-12） |
| UT-STORE-HOOKS-REFACTOR-002          | 状態セレクタのJSDoc追加       | 未実施     |
| UT-STORE-HOOKS-REFACTOR-003          | 合成Hook移行                  | 未実施     |
| UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 | 無限ループ根本対策            | **完了**（UT-STORE-HOOKS-COMPONENT-MIGRATION-001で根本対策実施、2026-02-12） |
| UT-STORE-HOOKS-TEST-REFACTOR-001         | Store HooksテストのrenderHookパターン移行 | **完了**（agentSlice 114テスト移行、2026-02-12） |
| UT-FIX-AGENTVIEW-INFINITE-LOOP-001 | AgentView無限ループ修正 | **完了**（個別セレクタ15個追加、2026-02-12） |
| task-imp-store-hooks-remaining-migration | 残コンポーネントの個別セレクタ移行 | 未実施（[指示書](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-store-hooks-remaining-migration.md)） |
| task-ref-store-hooks-deprecate-composite | 合成Store Hookの非推奨化       | 未実施（[指示書](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ref-store-hooks-deprecate-composite.md)） |

### 実装詳細（TASK-UT-AUTH-MODE-UI-INTEGRATION）

当初は useRef ガードで暫定回避したが、現行実装では個別セレクタ + 安定参照の依存配列へ移行済みである。

#### SettingsView

**ファイル**: `apps/desktop/src/renderer/views/SettingsView/index.tsx`

**変更内容**:

| 観点 | 現行実装 |
| ---- | -------- |
| 状態取得 | `useAuthMode()`, `useAuthModeStatus()`, `useAuthModeLoading()` |
| アクション取得 | `useSetAuthMode()`, `useInitializeAuthMode()` |
| 初期化 | `useEffect(() => { initializeAuthMode(); }, [initializeAuthMode])` |
| 表示契約 | `status.message`, `status.errorCode`, `status.guidance` をそのまま描画 |

**適用パターン**:

```typescript
const authMode = useAuthMode();
const authModeStatus = useAuthModeStatus();
const authModeLoading = useAuthModeLoading();
const setAuthMode = useSetAuthMode();
const initializeAuthMode = useInitializeAuthMode();

useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]);
```

#### SkillSelector

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`

**変更内容**:

| 観点 | 現行実装 |
| ---- | -------- |
| 状態取得 | `useAvailableSkillsMetadata()` など個別セレクタ |
| 再読込 | `useRescanSkills()` |
| 依存配列 | `useCallback(..., [rescanSkills])` を維持可能（参照安定） |

**適用パターン**:

```typescript
const handleRescan = useCallback(() => {
  rescanSkills();
}, [rescanSkills]);
```

### 実装時の課題と解決策

#### 課題1: ESLintキャッシュによる誤検出

**症状**: `react-hooks/exhaustive-deps` ルールが未定義として扱われ、eslint-disable コメントが認識されない

**原因**: ESLintのキャッシュが古い設定を参照していた

**解決策**:

```bash
# ESLintキャッシュをクリア
pnpm --filter @repo/desktop lint -- --cache-location node_modules/.cache/eslint
# または
rm -rf node_modules/.cache/eslint
```

**教訓**: ESLint設定変更後はキャッシュクリアが必要な場合がある

#### 課題2: Zustand合成Hookの参照不安定性

**症状**: `useAuthModeStore()` や `useSkillStore()` から取得した関数を依存配列に含めると無限ループが発生

**原因**: 合成Hookが毎回新しいオブジェクトを生成し、その中の関数参照も毎回変わる

**根本原因分析**:

| Hook種別                     | 参照安定性 | 依存配列に含めた場合 |
| ---------------------------- | ---------- | -------------------- |
| プリミティブ値セレクタ       | 安定       | 安全                 |
| 個別関数セレクタ             | 安定       | 安全                 |
| オブジェクト全体返却（現行） | 不安定     | 無限ループ発生       |

**旧短期解決策**: useRefガード + 空の依存配列（現在は新規採用しない）

**長期解決策**: 個別セレクタベースの再設計（UT-STORE-HOOKS-REFACTOR-001）

#### 課題3: コメントフォーマットの統一

**症状**: P31対策コメントの書式がファイル間で不統一

**解決策**: 以下のコメントフォーマットを標準化

```typescript
// P31対策: [理由の説明]
// 意図的に空の依存配列: [関数名]は1回だけ実行（P31対策）
```

#### 課題4: useEffect依存配列の設計判断

**症状**: ESLint `react-hooks/exhaustive-deps` ルールとP31対策が競合

**判断基準**:

| ケース                               | 推奨対応                                                    |
| ------------------------------------ | ----------------------------------------------------------- |
| 初期化処理（マウント時1回のみ）      | 個別セレクタを使い、安定した action を依存配列に含める      |
| 合成Hookから取り出した関数を使用中   | まず個別セレクタへ移行。移行完了までのみ暫定ガードを検討    |
| プリミティブ値の変化で再実行が必要   | 通常どおり依存配列に含める                                  |

**eslint-disableコメントの書き方**:

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps -- P31対策: initializeAuthModeは1回のみ実行
```

#### 課題5: Phase 12ドキュメント更新漏れ（UT-STORE-HOOKS-REFACTOR-001）

**症状**: タスク完了後のシステム仕様書更新が不完全だった

**発生した漏れ**:

| 漏れ項目 | 対象ファイル | 影響 |
| -------- | ------------ | ---- |
| SKILL.md 2ファイル更新 | `aiworkflow-requirements/SKILL.md`, `task-specification-creator/SKILL.md` | 変更履歴の不整合 |
| topic-map.md 再生成 | `references/topic-map.md` | インデックスの古い状態 |

**根本原因**: Phase 12チェックリストの確認が不十分だった

**解決策**:

1. Phase 12仕様書のチェックリストを**全項目逐次確認**してから完了とする
2. 特に以下の2点は必ず確認:
   - LOGS.md は `aiworkflow-requirements/` と `task-specification-creator/` の **2ファイル両方**を更新
   - 仕様書に変更があれば `node generate-index.js` で topic-map.md を**必ず再生成**

**教訓**: Phase 12は漏れが最も発生しやすい Phase。チェックリストを「完了」と記載する前に全項目を確認する。

> 参照: [05-task-execution.md#Phase 12 必須チェックリスト](../../../rules/05-task-execution.md#phase-12-必須チェックリスト)
