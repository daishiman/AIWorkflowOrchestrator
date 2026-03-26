# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 5                                             |
| Phase名    | 実装                                          |
| 前提Phase  | Phase 4                                       |
| 後続Phase  | Phase 6                                       |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

Phase 4 で作成した Red（失敗）テストを全て Green（成功）にする実装を行う。DescribeStep / GenerateStep / SkillCreateWizard の3ファイルを変更し、LLM 生成フローを接続する。TASK-SC-06 の苦戦箇所（C-1〜C-4）を事前回避しながら実装する。

## 背景

Phase 4 で AC-1〜AC-10 をカバーするテストが作成された（Red 状態）。本 Phase では設計（Phase 2）と型定義に従い、テストを通す実装を行う。SkillLifecyclePanel（TASK-SC-06）の実装パターンを参考に、ウィザードコンテキストに最適化した形で接続する。

---

## TASK-SC-06 苦戦箇所の事前回避【必読】

以下の4点は実装前に必ず確認し、設計通りに実装すること。

| 苦戦箇所                       | 問題                                                   | 本 Phase での回避策                                                                |
| ------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| C-1: executePlan 引数不足      | Preload API の `skillSpec` は必須（optional ではない） | `SkillCreatorRuntimeApi` の `executePlan` を `skillSpec: string`（必須）で定義する |
| C-2: generationProgress 未表示 | `setGenerationProgress()` を呼ぶが JSX で表示しない    | `useGenerationProgress` の import・変数宣言・JSX 表示をセットで追加する            |
| C-4: PlanResult 二重定義       | ローカル型とシャドウイングが起きる                     | `PlanResult` は `agentSlice.ts` からのみ import。ローカル型定義は一切作らない      |
| 非対称クリア                   | キャンセル/成功どちらかでしかクリアされないリスク      | `handleCancelPlan` / `handleExecutePlan` 両方に対称クリアを実装する                |

---

## 実行タスク

### タスク1: wizard/index.ts の更新（GenerationMode export 追加）

**目的**: `GenerationMode` 型を wizard モジュールの公開 API に追加する

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/wizard/index.ts` を読み込む
2. 以下を追加する

```typescript
// GenerationMode 型の追加
export type GenerationMode = "llm" | "template";
```

3. 既存の export を壊さないことを確認する

**確認観点**:

- `StepIndicator`, `DescribeStep`, `ConfigureStep`, `GenerateStep`, `CompleteStep` の既存 export が維持されていること
- `WizardOptions` 型が引き続き export されていること

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/index.ts`（更新済み）

---

### タスク2: DescribeStep.tsx の更新（AC-1 実装）

**目的**: 生成モード選択 UI を DescribeStep に追加する

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` を読み込む
2. Props インターフェースを以下の通り拡張する（既存 Props は変更しない）

```typescript
import type { GenerationMode } from "./index";

export interface DescribeStepProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  generationMode?: GenerationMode; // optional（後方互換）
  onGenerationModeChange?: (mode: GenerationMode) => void; // optional（後方互換）
  onNext: () => void;
}
```

3. JSX に生成モード選択ラジオボタングループを追加する

```tsx
{
  /* 生成モード選択（AC-1） */
}
<fieldset>
  <legend>生成方法を選択</legend>
  <label>
    <input
      type="radio"
      name="generationMode"
      value="template"
      checked={generationMode === "template"}
      onChange={() => onGenerationModeChange?.("template")}
    />
    テンプレートから作成
  </label>
  <label>
    <input
      type="radio"
      name="generationMode"
      value="llm"
      checked={generationMode === "llm"}
      onChange={() => onGenerationModeChange?.("llm")}
    />
    LLM で生成
  </label>
</fieldset>;
```

4. デフォルト値: `generationMode` が undefined の場合は `"template"` 相当の挙動とする

**回避観点**:

- `generationMode` / `onGenerationModeChange` を optional にすることで、既存の `DescribeStep` 呼び出し（`SkillCreateWizard.test.tsx` 等）が型エラーなく動作し続けること（AC-8）

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`（更新済み）

---

### タスク3: GenerateStep.tsx の更新（AC-3, AC-4, AC-5, AC-6 実装）

**目的**: plan 結果表示・実行/キャンセルボタン・generationProgress 表示を GenerateStep に追加する

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` を読み込む
2. `agentSlice.ts` から `PlanResult` 型を import する（C-4 回避）

```typescript
import type { PlanResult } from "../../../store/slices/agentSlice";
import type { GenerationMode } from "./index";
```

3. Props インターフェースを以下の通り拡張する

```typescript
export interface GenerateStepProps {
  isGenerating: boolean;
  error: Error | null;
  // 以下 TASK-SC-07 で追加
  generationMode?: GenerationMode;
  generationProgress?: string | null; // C-2 回避: Props に追加
  planResult?: PlanResult | null; // AC-9: agentSlice 由来
  onExecutePlan?: () => void;
  onCancelPlan?: () => void;
}
```

4. JSX に以下を追加する

**generationProgress 表示（C-2 回避・AC-6）**:

```tsx
{
  generationProgress && <p aria-live="polite">{generationProgress}</p>;
}
```

**plan 結果表示（AC-3）**:

```tsx
{
  planResult && (
    <section>
      <h3>生成計画</h3>
      <p>種別: {planResult.type}</p>
      {planResult.estimatedSteps !== undefined && (
        <p>推定ステップ数: {planResult.estimatedSteps}</p>
      )}
      {planResult.type === "terminal_handoff" && planResult.guidance && (
        <div>
          <p>{planResult.guidance.reason}</p>
          <code>{planResult.guidance.command}</code>
        </div>
      )}
    </section>
  );
}
```

**実行/キャンセルボタン（AC-4, AC-5）**:

```tsx
{
  generationMode === "llm" && planResult && (
    <div>
      <button onClick={onExecutePlan} disabled={isGenerating}>
        実行する
      </button>
      <button onClick={onCancelPlan}>キャンセル</button>
    </div>
  );
}
```

5. 既存の isGenerating スピナー・エラー表示は削除せず維持する（AC-8）

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`（更新済み）

---

### タスク4: SkillCreateWizard.tsx の更新（AC-2, AC-4, AC-5, AC-9, AC-10 実装）

**目的**: 状態追加・ハンドラ実装・遷移ロジックを SkillCreateWizard に実装する

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` を読み込む

2. **import の追加**

```typescript
import type { PlanResult } from "../../store/slices/agentSlice"; // AC-9, C-4 回避
import type { GenerationMode } from "./wizard";
import {
  useIsSkillGenerating,
  useGenerationProgress,
  useGenerationError,
  useCurrentPlanResult,
  useCurrentPlanId,
  useSetIsSkillGenerating,
  useSetGenerationProgress,
  useSetGenerationError,
  useSetCurrentPlanResult,
  useSetCurrentPlanId,
  useClearGenerationState,
} from "../../store";
```

3. **ローカル型定義（C-1 回避）**

```typescript
type SkillCreatorRuntimeApi = {
  planSkill?: (
    prompt: string,
    authMode?: string,
    apiKey?: string,
  ) => Promise<{ success: boolean; data?: PlanResult; error?: string }>;
  executePlan?: (
    planId: string,
    skillSpec: string, // 必須（C-1 回避: optional にしない）
    authMode?: string,
    apiKey?: string,
  ) => Promise<{
    success: boolean;
    data?: { skillName: string; skillPath: string };
    error?: string;
  }>;
};

const getSkillCreatorApi = (): SkillCreatorRuntimeApi => {
  const api = (
    window as Window & {
      electronAPI?: { skillCreator?: SkillCreatorRuntimeApi };
    }
  ).electronAPI?.skillCreator;
  return api ?? {};
};
```

4. **状態の追加**

```typescript
const [generationMode, setGenerationMode] =
  useState<GenerationMode>("template");
const [localPlanResult, setLocalPlanResult] = useState<PlanResult | null>(null);
// store hooks
const isSkillGenerating = useIsSkillGenerating();
const generationProgress = useGenerationProgress();
const generationError = useGenerationError();
const storePlanResult = useCurrentPlanResult();
const storePlanId = useCurrentPlanId();
const setIsGenerating = useSetIsSkillGenerating();
const setGenerationProgress = useSetGenerationProgress();
const setGenerationError = useSetGenerationError();
const setCurrentPlanResult = useSetCurrentPlanResult();
const setCurrentPlanId = useSetCurrentPlanId();
const clearGenerationState = useClearGenerationState();
```

5. **handleLlmGenerate の実装（AC-2）**

```typescript
const handleLlmGenerate = async () => {
  if (!description.trim()) return;
  if (isSkillGenerating) return; // 二重呼出防止
  goToStep(2); // ConfigureStep をスキップ（step=2 が GenerateStep）
  setIsGenerating(true);
  setGenerationProgress("計画を生成中...");
  setGenerationError(null);
  try {
    const api = getSkillCreatorApi();
    if (!api.planSkill) {
      throw new Error("planSkill API が利用できません");
    }
    const result = await api.planSkill(description);
    if (result.success && result.data) {
      setLocalPlanResult(result.data);
      setCurrentPlanResult(result.data);
      if (result.data.planId) {
        setCurrentPlanId(result.data.planId);
      }
    } else {
      setGenerationError(result.error ?? "計画生成に失敗しました");
    }
  } catch (err) {
    setGenerationError(
      err instanceof Error ? err.message : "計画生成に失敗しました",
    );
  } finally {
    setIsGenerating(false);
    setGenerationProgress(null);
  }
};
```

6. **handleExecutePlan の実装（AC-4, AC-10）**

```typescript
const handleExecutePlan = async () => {
  if (!storePlanId || !localPlanResult) return;
  setIsGenerating(true);
  setGenerationError(null);
  try {
    const api = getSkillCreatorApi();
    if (!api.executePlan) {
      throw new Error("executePlan API が利用できません");
    }
    // C-1 回避: skillSpec は必須引数として渡す
    const result = await api.executePlan(storePlanId, description);
    if (result.success && result.data) {
      setSkillPath(result.data.skillPath);
      // AC-10: 対称クリア
      setLocalPlanResult(null);
      clearGenerationState();
      goToStep(3); // CompleteStep へ遷移
    } else {
      setGenerationError(result.error ?? "スキル生成に失敗しました");
    }
  } catch (err) {
    setGenerationError(
      err instanceof Error ? err.message : "スキル生成に失敗しました",
    );
  } finally {
    setIsGenerating(false);
  }
};
```

7. **handleCancelPlan の実装（AC-5, AC-10）**

```typescript
const handleCancelPlan = () => {
  // AC-10: 対称クリア（handleExecutePlan と対称）
  setLocalPlanResult(null);
  clearGenerationState();
  goToStep(0); // DescribeStep へ戻る
};
```

8. **DescribeStep の onNext ロジック修正（AC-2, AC-8）**

```typescript
const handleDescribeNext = () => {
  if (generationMode === "llm") {
    void handleLlmGenerate();
  } else {
    goNext(); // 既存テンプレートフロー（AC-8）
  }
};
```

9. **JSX の更新**

```tsx
// DescribeStep に generationMode を渡す（AC-1）
<DescribeStep
  description={description}
  onDescriptionChange={setDescription}
  generationMode={generationMode}
  onGenerationModeChange={setGenerationMode}
  onNext={handleDescribeNext}
/>

// GenerateStep に新規 Props を渡す（AC-3, AC-4, AC-5, AC-6）
<GenerateStep
  isGenerating={isSkillGenerating || isGenerating}
  error={generationError ? new Error(generationError) : error}
  generationMode={generationMode}
  generationProgress={generationProgress}
  planResult={localPlanResult ?? storePlanResult}
  onExecutePlan={handleExecutePlan}
  onCancelPlan={handleCancelPlan}
/>
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（更新済み）

---

### タスク5: TDD Green 状態確認

**目的**: Phase 4 で作成したテストが全て成功（Green）になっていることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop vitest run -- \
  DescribeStep.test \
  GenerateStep.test \
  SkillCreateWizard.llm-generation.test \
  SkillCreateWizard.test
```

2. 全テストが `PASS` であることを確認する
3. 既存テスト（`SkillCreateWizard.test.tsx` 等）が引き続き `PASS` であることを確認する（AC-8 テンプレートフロー非破壊）
4. 結果を `outputs/phase-5/green-state-confirmation.md` に記録する

**型チェック確認**:

```bash
pnpm --filter @repo/desktop typecheck
```

**期待される成果物**:

- `outputs/phase-5/green-state-confirmation.md`（テスト全 PASS ログ）

---

### タスク6: 実装チェックリスト確認

**目的**: 苦戦箇所の回避が実装レベルで確認されていることを確認する

**実行手順**:

1. 以下のチェックリストを実装コードと照合する

| チェック項目                      | 確認内容                                                                         | 確認済み |
| --------------------------------- | -------------------------------------------------------------------------------- | -------- |
| C-1 回避: executePlan 引数        | `skillSpec: string`（必須、optional でない）が `executePlan` に渡されているか    | -        |
| C-2 回避: generationProgress 表示 | `generationProgress` が JSX で表示されているか（`<p>` または同等の要素）         | -        |
| C-4 回避: PlanResult 型           | `PlanResult` が `agentSlice.ts` からのみ import されているか（ローカル定義なし） | -        |
| AC-10 対称クリア（executePlan）   | `handleExecutePlan` 内で `setLocalPlanResult(null)` + `clearGenerationState()`   | -        |
| AC-10 対称クリア（cancel）        | `handleCancelPlan` 内で `setLocalPlanResult(null)` + `clearGenerationState()`    | -        |
| AC-8 テンプレート非破壊           | `generationMode === "template"` 時に既存の `goNext()` が呼ばれるか               | -        |

2. 結果を `outputs/phase-5/implementation-checklist.md` に記録する

**期待される成果物**:

- `outputs/phase-5/implementation-checklist.md`

---

## 参照資料

| 参照資料                     | パス                                                                                             | 内容                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Phase 2 型定義設計           | `outputs/phase-2/type-definitions.md`                                                            | GenerationMode, Props 拡張設計        |
| Phase 2 データフロー設計     | `outputs/phase-2/data-flow.md`                                                                   | LLM / テンプレート 両フロー設計       |
| Phase 2 API アクセスパターン | `outputs/phase-2/api-access-pattern.md`                                                          | getSkillCreatorApi / 型一致設計       |
| Phase 4 テスト（Red）        | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 実装の契約（通すべきテスト）          |
| SkillLifecyclePanel 参考実装 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                             | Hybrid State Pattern 参考（L131-200） |
| agentSlice PlanResult 型     | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                           | PlanResult 型（L34-39）               |
| Preload API シグネチャ       | `apps/desktop/src/preload/skill-creator-api.ts`                                                  | planSkill/executePlan 実シグネチャ    |
| store index                  | `apps/desktop/src/renderer/store/index.ts`                                                       | hooks export 確認                     |

---

## 成果物

| 成果物                        | パス                                                                 | 内容                          |
| ----------------------------- | -------------------------------------------------------------------- | ----------------------------- |
| wizard/index.ts（更新）       | `apps/desktop/src/renderer/components/skill/wizard/index.ts`         | GenerationMode export 追加    |
| DescribeStep.tsx（更新）      | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` | 生成モード選択 UI 追加        |
| GenerateStep.tsx（更新）      | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | plan 結果/ボタン/進捗表示追加 |
| SkillCreateWizard.tsx（更新） | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | LLM フロー統合実装            |
| Green 状態確認                | `outputs/phase-5/green-state-confirmation.md`                        | テスト全 PASS ログ            |
| 実装チェックリスト            | `outputs/phase-5/implementation-checklist.md`                        | 苦戦箇所回避確認              |

---

## 統合テスト連携

- `getSkillCreatorApi()` は `window.electronAPI.skillCreator` を経由して IPC を呼び出す
- `planSkill` / `executePlan` の呼び出しは store 経由ではなく Preload API 経由（SkillLifecyclePanel と同一パターン）
- store の状態更新（`setCurrentPlanResult` 等）は Preload API 呼び出し完了後に行う

---

## 完了条件

- [ ] `wizard/index.ts` に `GenerationMode` が export されている
- [ ] `DescribeStep.tsx` に生成モード選択ラジオが追加されている（`generationMode` / `onGenerationModeChange` Props 対応）
- [ ] `GenerateStep.tsx` に plan 結果表示・実行/キャンセルボタン・generationProgress 表示が追加されている
- [ ] `SkillCreateWizard.tsx` に `handleLlmGenerate` / `handleExecutePlan` / `handleCancelPlan` が実装されている
- [ ] C-1: `executePlan` の `skillSpec` が必須引数として渡されている
- [ ] C-2: `generationProgress` が JSX で表示されている
- [ ] C-4: `PlanResult` がローカル定義なく `agentSlice.ts` から import されている
- [ ] AC-10: 対称クリアが `handleExecutePlan` / `handleCancelPlan` 両方に実装されている
- [ ] Phase 4 で作成した全テストが Green（PASS）になっている
- [ ] 既存の `SkillCreateWizard.test.tsx` が引き続き全 PASS（テンプレートフロー非破壊）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなく完了する
- [ ] 全成果物が `outputs/phase-5/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了し、Red 状態が確認されていること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-6-test-expansion.md`
