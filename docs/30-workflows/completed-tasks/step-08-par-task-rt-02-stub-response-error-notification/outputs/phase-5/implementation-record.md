# Phase 5: 実装記録

## 変更ファイル一覧

### 1. shared types: `packages/shared/src/types/skillCreator.ts`

**追加:**

- `RuntimeSkillCreatorDegradedReason` 型（L630-632）
- `RuntimeSkillCreatorPlanErrorResponse` インターフェース（L637-643）
- `RuntimeSkillCreatorPlanResponse` に error union 追加（L677）

### 2. Facade: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**変更:**

- import に `RuntimeSkillCreatorPlanErrorResponse` 追加
- `plan()`: stub success（旧L308-328）→ explicit error に置換。`llmAdapter` 未注入時と `resourceLoader` 未注入時を分離
- `improve()`: stub `{improveId, suggestions:[]}` （旧L560-567）→ explicit error に置換。同様に分離

### 3. renderer: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**追加:**

- import に `RuntimeSkillCreatorPlanErrorResponse`, `RuntimeSkillCreatorPlanResponse` 追加
- `isRuntimePlanErrorResponse()` type guard 追加（L176-180）
- `handlePrepare` 内で plan logical error を検出し `setGenerationError()` でエラー表示（L737-740）

### 4. renderer: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

**追加:**

- import に `RuntimeSkillCreatorPlanResponse` 追加
- `handleLlmGenerate` 内で plan logical error を検出し `setStoreGenerationError()` でエラー表示（L192-196）

## AC 充足状況

| AC   | 実装                                       | 状態             |
| ---- | ------------------------------------------ | ---------------- |
| AC-1 | `plan()` が explicit error を返す          | ✅               |
| AC-2 | renderer が plan error 時に execute を抑止 | ✅               |
| AC-3 | `improve()` が explicit error を返す       | ✅               |
| AC-4 | `error.code` + `error.message` を含む      | ✅               |
| AC-5 | IPC outer wrapper は transport 専用        | ✅（変更なし）   |
| AC-6 | renderer がエラー表示                      | ✅               |
| AC-7 | 正常系・handoff 非破壊                     | ✅（テスト通過） |
