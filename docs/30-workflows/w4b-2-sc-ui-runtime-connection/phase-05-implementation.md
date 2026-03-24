# Phase 5: 実装

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 5                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

Phase 4 のテスト（U-1〜U-12、U-S-1〜U-S-7）を Green にする実装を行う。AgentSlice への生成状態追加、個別セレクタのエクスポート、SkillLifecyclePanel への handlePlanSkill / handleExecutePlan 実装、plan 結果表示 UI の追加を実装順序に従って進める。

## 依存成果物

- Phase 4 テストファイル（Red 状態で完了）
- Phase 2 設計書（コード片の参照元）
- Phase 3 設計レビュー（R-1 指摘事項: isGenerating ガード）

## 実装順序（依存関係を考慮）

```
Step 1: 型定義追加（agentSlice.ts の AgentState / AgentActions）
    ↓
Step 2: Zustand アクション実装（agentSlice.ts）
    ↓
Step 3: 個別セレクタのエクスポート（store/index.ts）
    ↓
Step 4: SkillLifecyclePanel に handlePlanSkill / handleExecutePlan 追加
    ↓
Step 5: Plan 結果表示 UI の追加（JSX 変更）
    ↓
Step 6: テスト Green 確認
```

## 実行タスク

### Step 1: AgentSlice 型定義追加

**対象ファイル**: `apps/desktop/src/renderer/store/slices/agentSlice.ts`

#### AgentState インターフェースへの追加

`handoffGuidance: HandoffGuidance | null;` の直後、または `// === Terminal Handoff ===` セクションの後に追加する:

```typescript
// === LLM 生成状態（TASK-SC-06-UI-RUNTIME-CONNECTION） ===
/** plan/executePlan 実行中フラグ */
isGenerating: boolean;
/** 生成プログレスメッセージ */
generationProgress: string | null;
/** 生成エラーメッセージ */
generationError: string | null;
/** planSkill から返された planId */
currentPlanId: string | null;
/** plan 結果全体（UI 表示用） */
currentPlanResult: RuntimeSkillCreatorPlanResponse | null;
```

**型のインポート追加**: `RuntimeSkillCreatorPlanResponse` は `apps/desktop/src/preload/skill-creator-api.ts` で定義されている。agentSlice.ts からは以下のいずれかで参照する:

- `apps/desktop/src/preload/types.ts` または `apps/desktop/src/renderer/features/workspace-chat-edit/types.ts` に型が再エクスポートされている場合はそこから import
- ない場合は `../../preload/skill-creator-api` から直接 import するか、`agentSlice.ts` に局所的な型定義を追加する

**局所的な型定義（型の所在が不明な場合の代替）**:

```typescript
// agentSlice.ts 内に定義
export interface PlanResult {
  type: "integrated_api" | "terminal_handoff";
  planId?: string;
  estimatedSteps?: number;
  guidance?: {
    reason: string;
    command: string;
  };
}
```

以降の実装では `PlanResult` として参照する（`RuntimeSkillCreatorPlanResponse` の代わり）。

#### AgentActions インターフェースへの追加

`clearHandoffGuidance: () => void;` の後に追加する:

```typescript
// === LLM 生成状態アクション（TASK-SC-06-UI-RUNTIME-CONNECTION） ===
/** isGenerating フラグを設定 */
setIsGenerating: (value: boolean) => void;
/** generationProgress を設定 */
setGenerationProgress: (value: string | null) => void;
/** generationError を設定 */
setGenerationError: (value: string | null) => void;
/** currentPlanId を設定 */
setCurrentPlanId: (value: string | null) => void;
/** currentPlanResult を設定 */
setCurrentPlanResult: (value: PlanResult | null) => void;
/** 生成状態をすべてリセット */
clearGenerationState: () => void;
```

#### initialAgentState への追加

`handoffGuidance: null,` の直後に追加する:

```typescript
// === LLM 生成状態初期値（TASK-SC-06-UI-RUNTIME-CONNECTION） ===
isGenerating: false,
generationProgress: null,
generationError: null,
currentPlanId: null,
currentPlanResult: null,
```

### Step 2: Zustand アクション実装

**対象ファイル**: `apps/desktop/src/renderer/store/slices/agentSlice.ts`

`clearHandoffGuidance: () => set({ handoffGuidance: null }),` の後に以下を追加する:

```typescript
// === LLM 生成状態アクション（TASK-SC-06-UI-RUNTIME-CONNECTION） ===

setIsGenerating: (value) => set({ isGenerating: value }),

setGenerationProgress: (value) => set({ generationProgress: value }),

setGenerationError: (value) => set({ generationError: value }),

setCurrentPlanId: (value) => set({ currentPlanId: value }),

setCurrentPlanResult: (value) => set({ currentPlanResult: value }),

clearGenerationState: () =>
  set({
    isGenerating: false,
    generationProgress: null,
    generationError: null,
    currentPlanId: null,
    currentPlanResult: null,
  }),
```

### Step 3: 個別セレクタのエクスポート

**対象ファイル**: `apps/desktop/src/renderer/store/index.ts`

既存の Terminal Handoff セレクタ（`useHandoffGuidance`, `useSetHandoffGuidance`, `useClearHandoffGuidance`）の直後に追加する:

```typescript
// === LLM 生成状態 個別セレクタ（TASK-SC-06-UI-RUNTIME-CONNECTION, P31 対策） ===

/** plan/executePlan 実行中フラグを取得 */
export const useIsSkillGenerating = () =>
  useAppStore((state) => state.isGenerating);

/** 生成プログレスメッセージを取得 */
export const useGenerationProgress = () =>
  useAppStore((state) => state.generationProgress);

/** 生成エラーメッセージを取得 */
export const useGenerationError = () =>
  useAppStore((state) => state.generationError);

/** 現在の planId を取得 */
export const useCurrentPlanId = () =>
  useAppStore((state) => state.currentPlanId);

/** plan 結果全体を取得 */
export const useCurrentPlanResult = () =>
  useAppStore((state) => state.currentPlanResult);

/** isGenerating セッタを取得（P31 対策: アクション参照は安定） */
export const useSetIsSkillGenerating = () =>
  useAppStore((state) => state.setIsGenerating);

/** 生成状態を全クリアするアクションを取得（P31 対策） */
export const useClearGenerationState = () =>
  useAppStore((state) => state.clearGenerationState);
```

**P48 対策**: 上記セレクタはすべてプリミティブ値またはアクション参照を返す。`currentPlanResult` はオブジェクトだが、同一参照が維持される限り再レンダーしないため `useShallow` は不要。

### Step 4: SkillLifecyclePanel への handlePlanSkill / handleExecutePlan 追加

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

#### セレクタのインポート追加

既存の store import 文（`import { useCreateSkill, useExecuteSkill, ... } from "../../../store";` 相当）に追加する:

```typescript
import {
  // 既存セレクタ（変更なし）
  // ...
  // 追加セレクタ
  useIsSkillGenerating,
  useGenerationProgress,
  useGenerationError,
  useCurrentPlanId,
  useCurrentPlanResult,
  useSetIsSkillGenerating,
  useClearGenerationState,
  useFetchSkills,
  useSelectSkillByName,
} from "../../../store";
```

#### コンポーネント関数内でセレクタを展開

既存の `const isExecuting = useIsSkillExecuting();` 等と同じ場所に追加する:

```typescript
const isGenerating = useIsSkillGenerating();
const generationProgress = useGenerationProgress();
const generationError = useGenerationError();
const currentPlanId = useCurrentPlanId();
const currentPlanResult = useCurrentPlanResult();
const setIsGenerating = useSetIsSkillGenerating();
const clearGenerationState = useClearGenerationState();
const fetchSkills = useFetchSkills();
const selectSkillByName = useSelectSkillByName();
```

#### handlePlanSkill の実装（新規追加）

既存の `handlePrepare` 関数の直後に追加する:

```typescript
const handlePlanSkill = async (description: string) => {
  // R-1（Phase 3 レビュー指摘）: isGenerating ガードで二重呼び出し防止
  if (isGenerating) return;

  // P42 準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
  if (typeof description !== "string" || description.trim() === "") {
    return;
  }

  setIsGenerating(true);
  setGenerationError(null);
  setGenerationProgress("計画を生成中...");

  try {
    const skillCreatorApi = (
      window as Window & {
        electronAPI?: {
          skillCreator?: {
            planSkill?: (
              prompt: string,
              authMode?: string,
              apiKey?: string,
            ) => Promise<{
              success: boolean;
              data?: {
                type: "integrated_api" | "terminal_handoff";
                planId?: string;
                estimatedSteps?: number;
                guidance?: { reason: string; command: string };
              };
              error?: string;
            }>;
          };
        };
      }
    ).electronAPI?.skillCreator;

    if (!skillCreatorApi?.planSkill) {
      throw new Error("planSkill API が利用できません");
    }

    const result = await skillCreatorApi.planSkill(
      description.trim(),
      // authMode / apiKey は既存の認証状態から取得（実装時に既存の取得パターンを参照）
    );

    if (!result.success || !result.data) {
      throw new Error(result.error ?? "計画生成に失敗しました");
    }

    if (result.data.type === "terminal_handoff") {
      // Terminal Handoff: 既存の handoffGuidance UI を活用
      if (result.data.guidance) {
        setHandoffGuidance(result.data.guidance);
      }
    } else {
      // Integrated API: plan 結果を Zustand に保存
      setCurrentPlanId(result.data.planId ?? null);
      setCurrentPlanResult(result.data);
    }
  } catch (error) {
    setGenerationError(
      error instanceof Error ? error.message : "計画生成に失敗しました",
    );
  } finally {
    setIsGenerating(false);
    setGenerationProgress(null);
  }
};
```

#### handleExecutePlan の実装（新規追加）

`handlePlanSkill` の直後に追加する:

```typescript
const handleExecutePlan = async () => {
  if (!currentPlanId || !currentPlanResult) return;
  // R-1 準拠: isGenerating ガード
  if (isGenerating) return;

  setIsGenerating(true);
  setGenerationProgress("スキルを生成中...");

  try {
    const skillCreatorApi = (
      window as Window & {
        electronAPI?: {
          skillCreator?: {
            executePlan?: (
              planId: string,
              skillSpec: string,
              authMode?: string,
              apiKey?: string,
            ) => Promise<{
              success: boolean;
              data?: { skillName?: string; skillPath?: string };
              error?: string;
            }>;
          };
        };
      }
    ).electronAPI?.skillCreator;

    if (!skillCreatorApi?.executePlan) {
      throw new Error("executePlan API が利用できません");
    }

    const result = await skillCreatorApi.executePlan(
      currentPlanId,
      request.trim(), // リクエスト（description）を skillSpec として渡す
    );

    if (!result.success || !result.data) {
      throw new Error(result.error ?? "スキル生成に失敗しました");
    }

    // 成功: スキル一覧を更新し新規スキルを選択
    await fetchSkills();
    if (result.data.skillName) {
      selectSkillByName(result.data.skillName);
    }

    // 生成状態をクリア
    clearGenerationState();
  } catch (error) {
    setGenerationError(
      error instanceof Error ? error.message : "スキル生成に失敗しました",
    );
  } finally {
    setIsGenerating(false);
    setGenerationProgress(null);
  }
};
```

#### handlePrepare の拡張

既存の `handlePrepare` 関数内の `detectMode` 呼び出し後に以下を追加する（`setDetectedMode(result.data);` の直後）:

```typescript
// detectMode の結果が plan または improve の場合、planSkill を自動呼出
if (result.data === "plan" || result.data === "improve") {
  await handlePlanSkill(trimmedRequest);
}
```

**重要**: `handlePrepare` は `handlePlanSkill` を参照するため、`handlePlanSkill` を先に定義しておく必要がある（JavaScript の関数巻き上げの注意点）。`const` で定義する場合は `handlePlanSkill` を `handlePrepare` の前に定義する。

### Step 5: Plan 結果表示 UI の追加

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

Step 1「依頼をまとめる」の JSX 内、リクエストテキストエリアの後（「方針を決める」ボタンの下）に追加する:

```tsx
{
  /* 生成エラー表示 */
}
{
  generationError && (
    <div
      role="alert"
      className="rounded-lg border border-[var(--status-error)] bg-[var(--status-error)]/10 p-3 mt-3 text-sm text-[var(--status-error)]"
    >
      {generationError}
    </div>
  );
}

{
  /* 生成プログレス表示 */
}
{
  isGenerating && generationProgress && (
    <div
      aria-live="polite"
      className="text-sm text-[var(--text-secondary)] mt-3"
    >
      {generationProgress}
    </div>
  );
}

{
  /* Plan 結果表示（currentPlanResult が integrated_api の場合） */
}
{
  currentPlanResult && currentPlanResult.type === "integrated_api" && (
    <div className="rounded-lg border border-[var(--border)] p-4 mt-4">
      <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
        生成計画
      </h4>
      {currentPlanResult.estimatedSteps !== undefined && (
        <p className="text-sm text-[var(--text-secondary)]">
          推定ステップ数: {currentPlanResult.estimatedSteps}
        </p>
      )}
      <div className="flex justify-end mt-3 gap-2">
        <button
          onClick={clearGenerationState}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--secondary-bg)] transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={handleExecutePlan}
          disabled={isGenerating}
          className="px-3 py-1.5 text-sm rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          実行する
        </button>
      </div>
    </div>
  );
}
```

### Step 6: テスト Green 確認

実装完了後、以下のコマンドでテストが Green になることを確認する:

```bash
# P40 対策: apps/desktop ディレクトリから実行
cd apps/desktop && pnpm vitest run src/renderer/store/__tests__/agentSlice.generation.test.ts
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

## 変更ファイル一覧

| ファイル                                                             | 変更種別 | 変更内容                                                                                  |
| -------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`               | 変更     | AgentState / AgentActions への5フィールド + 6アクション追加、initialAgentState 初期値追加 |
| `apps/desktop/src/renderer/store/index.ts`                           | 変更     | 7つの個別セレクタを追加エクスポート                                                       |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 変更     | handlePlanSkill / handleExecutePlan 追加、handlePrepare 拡張、plan 結果表示 UI 追加       |

**変更なし（後方互換）**:

- `SkillCreateWizard.tsx`（スコープ外）
- `DescribeStep.tsx`（スコープ外）
- `GenerateStep.tsx`（スコープ外）
- `agentSlice.ts` の既存アクション（handleCreate / createSkill 等）

## R-1 実装確認チェック

Phase 3 レビュー R-1（isGenerating ガード）が正しく実装されているか確認:

```typescript
// handlePlanSkill の冒頭に必ず含まれていること
if (isGenerating) return; // 二重呼び出し防止
```

```typescript
// handleExecutePlan の冒頭に必ず含まれていること
if (isGenerating) return; // 二重呼び出し防止
```

## 参照資料

- Phase 4 テストファイル（Green にする対象）
- Phase 2 設計書（コード片の参照元）
- Phase 3 設計レビュー（R-1 指摘事項）
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`（既存実装のパターン参照）
- `apps/desktop/src/renderer/store/index.ts`（既存セレクタのパターン参照）
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（変更対象）
- `.claude/rules/06-known-pitfalls.md` P31（個別セレクタ）、P42（3段バリデーション）、P48（useShallow 要否）

## 実行手順

### ステップ1: AgentSlice 型定義・初期値追加

`agentSlice.ts` の AgentState / AgentActions に5フィールド + 6アクションの型定義と initialAgentState の初期値を追加する。

### ステップ2: Zustand アクション実装

createAgentSlice 内に setIsGenerating / setGenerationProgress / setGenerationError / setCurrentPlanId / setCurrentPlanResult / clearGenerationState を実装する。

### ステップ3: 個別セレクタのエクスポート

`store/index.ts` に7個の個別セレクタを追加エクスポートする（P31 対策）。

### ステップ4: SkillLifecyclePanel にロジック追加

handlePlanSkill / handleExecutePlan を実装し、handlePrepare を拡張する。isGenerating ガードを含む（R-1 対応）。

### ステップ5: Plan 結果表示 UI 追加

JSX に generationError 表示、generationProgress 表示、Plan 結果表示セクションを追加する。

### ステップ6: テスト Green 確認

`cd apps/desktop && pnpm vitest run` で Phase 4 テストが全て Green になることを確認する。

## 統合テスト連携

- 既存の `SkillLifecyclePanel.test.tsx` テストが引き続き PASS することを確認（リグレッション防止）
- `agentSlice.ts` の既存アクション（createSkill, executeSkill 等）が変更されていないことを確認
- `store/index.ts` の既存セレクタエクスポートが壊れていないことを確認

## 多角的チェック観点

| 観点         | 適用判断 | 確認内容                                                 |
| ------------ | -------- | -------------------------------------------------------- |
| 型安全       | 該当     | PlanResult 型定義の正確性、any 型不使用                  |
| 後方互換     | 該当     | 既存 handleCreate / SkillCreateWizard が変更なし（AC-7） |
| セキュリティ | 該当     | P42 3段バリデーション、IPC 引数の安全性                  |
| P31 対策     | 該当     | 個別セレクタの使用、合成 Hook 不使用                     |

## サブタスク管理

| サブタスク                       | 担当           | 状態   | 備考                    |
| -------------------------------- | -------------- | ------ | ----------------------- |
| Step 1: AgentSlice 型定義追加    | Phase 5 実行者 | 未着手 | agentSlice.ts           |
| Step 2: Zustand アクション実装   | Phase 5 実行者 | 未着手 | agentSlice.ts           |
| Step 3: 個別セレクタエクスポート | Phase 5 実行者 | 未着手 | store/index.ts          |
| Step 4: SLP ロジック追加         | Phase 5 実行者 | 未着手 | SkillLifecyclePanel.tsx |
| Step 5: Plan 結果表示 UI         | Phase 5 実行者 | 未着手 | SkillLifecyclePanel.tsx |
| Step 6: テスト Green 確認        | Phase 5 実行者 | 未着手 | P40 対策                |

## 成果物

- 変更済み `agentSlice.ts`（5フィールド + 6アクション + 初期値）
- 変更済み `store/index.ts`（7セレクタ追加）
- 変更済み `SkillLifecyclePanel.tsx`（handlePlanSkill / handleExecutePlan / UI 追加）

## 完了条件

- [ ] AgentState に isGenerating / generationProgress / generationError / currentPlanId / currentPlanResult を追加した
- [ ] AgentActions に setIsGenerating / setGenerationProgress / setGenerationError / setCurrentPlanId / setCurrentPlanResult / clearGenerationState を追加した
- [ ] initialAgentState に5フィールドの初期値を追加した
- [ ] createAgentSlice に6アクションの実装を追加した
- [ ] store/index.ts に7個の個別セレクタをエクスポートした（P31 対策）
- [ ] handlePlanSkill を実装した（isGenerating ガード = R-1 対策を含む）
- [ ] handleExecutePlan を実装した（isGenerating ガード含む）
- [ ] handlePrepare を拡張した（detectMode 結果が "plan"/"improve" のとき handlePlanSkill を呼ぶ）
- [ ] plan 結果表示 UI（生成計画セクション、「実行する」「キャンセル」ボタン）を追加した
- [ ] generationError 表示 UI を追加した
- [ ] generationProgress 表示 UI を追加した
- [ ] SkillCreateWizard / handleCreate が変更なし（後方互換 AC-7 を維持）であることを確認した
- [ ] Phase 4 テスト（U-1〜U-12、U-S-1〜U-S-7）が全て Green になった

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」の全チェックボックスが ON であることを確認した
- [ ] 「実行手順」の全ステップを実行した
- [ ] 「サブタスク管理」の全タスクが完了状態である
- [ ] 「統合テスト連携」の全項目を確認した
- [ ] 「多角的チェック観点」の全観点を確認した
- [ ] 成果物が全て生成されている

## 次のPhase

Phase 6: テスト拡充
