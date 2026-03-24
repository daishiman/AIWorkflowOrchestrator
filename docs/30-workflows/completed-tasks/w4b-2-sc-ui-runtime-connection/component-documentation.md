# TASK-SC-06-UI-RUNTIME-CONNECTION コンポーネントドキュメント

## SkillLifecyclePanel

**ファイルパス**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

スキルの作成・実行・改善を一画面で完結させる単一ライフサイクル導線コンポーネント。
TASK-SC-06-UI-RUNTIME-CONNECTION では、Runtime Skill Creator との IPC 接続（detectMode / planSkill / executePlan）を追加した。

---

### Props

```typescript
export interface SkillLifecyclePanelProps {
  onClose: () => void; // 必須: パネルを閉じる（一覧へ戻る）
  onOpenWizard?: () => void; // 任意: 詳細ウィザードを開く
  skillName?: string; // 任意: 初期選択スキル名（現在は _skillName として受け取るのみ）
}
```

---

### SkillCreatorMode

TASK-SC-06 で `"plan"` を追加。

```typescript
type SkillCreatorMode =
  | "collaborative"
  | "orchestrate"
  | "create"
  | "update"
  | "improve-prompt"
  | "plan"; // TASK-SC-06 で追加
```

**modeLabels**（表示用ラベル）:

```typescript
const modeLabels: Record<SkillCreatorMode, string> = {
  collaborative: "共同設計",
  orchestrate: "実行分担",
  create: "直作成",
  update: "更新",
  "improve-prompt": "プロンプト改善",
  plan: "計画生成", // TASK-SC-06 で追加
};
```

---

### ローカル State

| 変数名                  | 型                         | 初期値                   | 説明                                       |
| ----------------------- | -------------------------- | ------------------------ | ------------------------------------------ |
| `localPlanResult`       | `PlanResult \| null`       | `null`                   | 計画結果のローカルコピー（即時 UI 更新用） |
| `request`               | `string`                   | `""`                     | スキル依頼文の入力値                       |
| `detectedMode`          | `SkillCreatorMode \| null` | `null`                   | detectMode で判定されたモード              |
| `createdSkillPath`      | `string \| null`           | `null`                   | 作成されたスキルのパス                     |
| `createdSkillName`      | `string \| null`           | `null`                   | 作成されたスキルの名前                     |
| `executionPrompt`       | `string`                   | `defaultExecutionPrompt` | スキル実行時のプロンプト                   |
| `creatorImproveResult`  | `ImproveResult \| null`    | `null`                   | 改善提案の結果                             |
| `showDetailedAnalysis`  | `boolean`                  | `false`                  | 詳細分析パネルの表示フラグ                 |
| `isPreparing`           | `boolean`                  | `false`                  | mode 判定処理中フラグ                      |
| `isCreating`            | `boolean`                  | `false`                  | スキル作成処理中フラグ                     |
| `isPlanningImprovement` | `boolean`                  | `false`                  | 改善計画処理中フラグ                       |
| `localError`            | `string \| null`           | `null`                   | ローカルエラーメッセージ                   |
| `sessionEntries`        | `SessionEntry[]`           | ガイドエントリ1件        | セッション履歴エントリ一覧                 |

**派生値**:

```typescript
// ローカル状態を優先し、なければ Store 状態を使用
const activePlanResult = localPlanResult ?? storePlanResult;

// 生成エラーはStore状態をそのまま参照
const activeGenerationError = generationError;

// 表面エラー: ローカルエラーを優先
const currentSurfaceError = localError ?? skillError;
```

---

### ハンドラ一覧

#### handlePrepare

「方針を決める」ボタン押下時に実行される主要ハンドラ。

**前提条件**

- `request.trim()` が空の場合: エラーを設定して終了
- `isGenerating === true` の場合: 即座に return（R-1 二重呼出防止ガード）

**処理フロー**

1. `getSkillCreatorApi()` で Runtime API を取得（null の場合は "create" モードにフォールバック）
2. `detectMode(trimmedRequest)` を呼出し
3. `result.data === "plan"` の場合:
   - `setIsGenerating(true)` + `setGenerationProgress("計画を生成中...")`
   - `planSkill(trimmedRequest, "", "")` を呼出し
   - 成功: `setLocalPlanResult` + `setCurrentPlanResult` + `setCurrentPlanId`
   - 失敗: `setGenerationError`
   - finally: `setIsGenerating(false)` + `setGenerationProgress(null)`
4. 他モードの場合: `setDetectedMode` + セッションエントリ追加

#### handleExecutePlan

計画結果パネルの「実行する」ボタン押下時に実行される。

**前提条件**

- `planId = storePlanId ?? activePlanResult?.planId` が `null` の場合: return
- `skillCreatorApi?.executePlan` が存在しない場合: return

**処理フロー**

1. `setIsGenerating(true)`
2. `executePlan(planId, request.trim())` を IPC 呼出し（`skillSpec` に依頼文を渡す）
3. 成功:
   - `fetchSkills()` でスキル一覧を更新
   - `result.data.skillName` が存在する場合のみ `selectSkillByName()` で自動選択
   - `setLocalPlanResult(null)` でローカル状態クリア
   - `clearGenerationState()` で Store の 5 フィールドをリセット
4. 失敗: `setGenerationError`
5. finally: `setIsGenerating(false)`

#### handleCancelPlan

計画結果パネルの「キャンセル」ボタン押下時に実行される。

```typescript
const handleCancelPlan = () => {
  setLocalPlanResult(null); // ローカル状態をクリア
  clearGenerationState(); // Store の 5 フィールドを一括リセット
};
```

---

### JSX 表示条件

#### Plan 結果表示（integrated_api）

**表示条件**: `activePlanResult?.type === "integrated_api"` かつ `currentPlanResult !== null`

```typescript
{activePlanResult?.type === "integrated_api" ? (
  <div>
    <h3>生成計画</h3>
    <p>推定ステップ数: {activePlanResult.estimatedSteps}</p>
    <div>
      <button
        onClick={handleExecutePlan}
        disabled={isGenerating} // isGenerating === true のとき disabled
      >
        実行する
      </button>
      <button onClick={handleCancelPlan}>キャンセル</button>
    </div>
  </div>
) : null}
```

**「実行する」ボタンの disabled 条件**: `isGenerating === true` の間は disabled になり、二重実行を防止する。

#### Terminal Handoff 表示

**表示条件**: `activePlanResult?.type === "terminal_handoff"` かつ `activePlanResult.guidance` が存在する

```typescript
{activePlanResult?.type === "terminal_handoff" && activePlanResult.guidance ? (
  <div>
    <h3>ターミナルハンドオフ</h3>
    <p>{activePlanResult.guidance.reason}</p>
    {activePlanResult.guidance.command ? (
      <code>{activePlanResult.guidance.command}</code>
    ) : null}
  </div>
) : null}
```

`guidance` オブジェクトが存在しない場合（`type` が `terminal_handoff` でも `guidance` が `undefined`）はパネル全体を非表示にする。

#### 生成エラーの表示

**表示条件**: `activeGenerationError` が truthy

```typescript
{activeGenerationError ? (
  <div role="alert">{activeGenerationError}</div>
) : null}
```

---

## agentSlice.ts

**ファイルパス**: `apps/desktop/src/renderer/store/slices/agentSlice.ts`

### PlanResult 型（L34-L39）

```typescript
export interface PlanResult {
  type: "integrated_api" | "terminal_handoff";
  planId?: string;
  estimatedSteps?: number;
  guidance?: { reason: string; command: string };
}
```

| フィールド       | 型                                       | 説明                                                                                      |
| ---------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `type`           | `"integrated_api" \| "terminal_handoff"` | 実行方式。`integrated_api` はアプリ内で完結、`terminal_handoff` は CLI での手動実行が必要 |
| `planId`         | `string?`                                | 計画 ID。`executePlan` の引数として使用する                                               |
| `estimatedSteps` | `number?`                                | 推定生成ステップ数。`integrated_api` 時に表示する                                         |
| `guidance`       | `{ reason: string; command: string }?`   | `terminal_handoff` 時の案内。`reason` に理由、`command` に実行コマンドが入る              |

### 追加フィールド（AgentState, L216-L226）

| フィールド           | 型                   | 初期値  | 説明                                  |
| -------------------- | -------------------- | ------- | ------------------------------------- |
| `isGenerating`       | `boolean`            | `false` | LLM 生成中フラグ                      |
| `generationProgress` | `string \| null`     | `null`  | 進捗メッセージ（null は非表示）       |
| `generationError`    | `string \| null`     | `null`  | エラーメッセージ（null はエラーなし） |
| `currentPlanId`      | `string \| null`     | `null`  | 計画 ID                               |
| `currentPlanResult`  | `PlanResult \| null` | `null`  | 計画結果                              |

### 追加アクション（AgentActions, L384-L396）

| アクション名            | 引数                                   | 説明                                            |
| ----------------------- | -------------------------------------- | ----------------------------------------------- |
| `setIsGenerating`       | `(isGenerating: boolean) => void`      | LLM 生成中フラグを更新                          |
| `setGenerationProgress` | `(progress: string \| null) => void`   | 進捗メッセージを更新                            |
| `setGenerationError`    | `(error: string \| null) => void`      | エラーメッセージを更新                          |
| `setCurrentPlanId`      | `(planId: string \| null) => void`     | 計画 ID を更新                                  |
| `setCurrentPlanResult`  | `(result: PlanResult \| null) => void` | 計画結果を更新                                  |
| `clearGenerationState`  | `() => void`                           | 上記 5 フィールドを一括リセット（初期値に戻す） |

### clearGenerationState の実装（L1216-L1223）

```typescript
clearGenerationState: () =>
  set({
    isGenerating: false,
    generationProgress: null,
    generationError: null,
    currentPlanId: null,
    currentPlanResult: null,
  }),
```

---

## store/index.ts

**ファイルパス**: `apps/desktop/src/renderer/store/index.ts`

### 追加された 11 個の個別セレクタ（L840-L879）

P31 対策として、合成 Hook ではなく個別セレクタのみを提供する。

#### 状態セレクタ（5個）

| セレクタ名              | 戻り値型             | 説明                 |
| ----------------------- | -------------------- | -------------------- |
| `useIsSkillGenerating`  | `boolean`            | LLM 生成中フラグ     |
| `useGenerationProgress` | `string \| null`     | 生成進捗メッセージ   |
| `useGenerationError`    | `string \| null`     | 生成エラーメッセージ |
| `useCurrentPlanId`      | `string \| null`     | 現在の計画 ID        |
| `useCurrentPlanResult`  | `PlanResult \| null` | 現在の計画結果       |

#### アクションセレクタ（6個）

| セレクタ名                 | 戻り値型                               | 説明                       |
| -------------------------- | -------------------------------------- | -------------------------- |
| `useSetIsSkillGenerating`  | `(flag: boolean) => void`              | 生成中フラグを設定         |
| `useSetGenerationProgress` | `(msg: string \| null) => void`        | 進捗メッセージを設定       |
| `useSetGenerationError`    | `(msg: string \| null) => void`        | エラーメッセージを設定     |
| `useSetCurrentPlanId`      | `(id: string \| null) => void`         | 計画 ID を設定             |
| `useSetCurrentPlanResult`  | `(result: PlanResult \| null) => void` | 計画結果を設定             |
| `useClearGenerationState`  | `() => void`                           | 5 フィールドを一括リセット |

---

### SkillCreatorRuntimeApi（内部型）

コンポーネント内で定義されている Runtime API の型定義。`window.electronAPI?.skillCreator` または `window.skillCreatorAPI` から取得する。

```typescript
type SkillCreatorRuntimeApi = {
  detectMode?: (request: string) => Promise<IpcResult<SkillCreatorMode>>;
  planSkill?: (
    prompt: string,
    authMode?: string,
    apiKey?: string,
  ) => Promise<IpcResult<PlanResult>>;
  executePlan?: (
    planId: string,
    skillSpec?: unknown,
    authMode?: string,
    apiKey?: string,
  ) => Promise<IpcResult<{ skillName: string; skillPath: string }>>;
  improveSkill?: (
    skillName: string,
    options?: { autoApply?: boolean },
  ) => Promise<IpcResult<ImproveResult>>;
};
```

**取得方法**（`getSkillCreatorApi()` 関数）:

```typescript
function getSkillCreatorApi(): SkillCreatorRuntimeApi | null {
  const runtimeWindow = window as Window & {
    electronAPI?: { skillCreator?: SkillCreatorRuntimeApi };
    skillCreatorAPI?: SkillCreatorRuntimeApi;
  };
  return (
    runtimeWindow.electronAPI?.skillCreator ??
    runtimeWindow.skillCreatorAPI ??
    null
  );
}
```

API が存在しない場合（`null`）は Graceful Degradation: 既存の "create" モードにフォールバックする。

---

### テストファイル

| ファイルパス                                                                                       | 対象                                                              |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                | 基本機能・R-1 ガード・モードフォールバック                        |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | planSkill / executePlan / terminal_handoff の各シナリオ           |
| `apps/desktop/src/renderer/store/__tests__/agentSlice.generation.test.ts`                          | Store の LLM Generation state フィールドと `clearGenerationState` |
