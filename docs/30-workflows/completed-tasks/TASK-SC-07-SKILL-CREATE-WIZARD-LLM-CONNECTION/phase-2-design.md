# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 2                                             |
| Phase名    | 設計                                          |
| 前提Phase  | Phase 1                                       |
| 後続Phase  | Phase 3                                       |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

Phase 1 で確定した要件・受入条件に基づき、SkillCreateWizard への LLM 生成フロー接続の詳細設計を行う。コンポーネントトポロジ、データフロー、型定義、状態管理パターンを設計する。

## 背景

Phase 1 で AC-1〜AC-10 を確定し、スコープを明確にした。SkillLifecyclePanel（TASK-SC-06）の実装パターンを参考に、ウィザードコンテキストに最適化した設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コンポーネントトポロジ設計

**目的**: 変更対象コンポーネントの責務分担と接続関係を設計する

**実行手順**:

1. 以下のコンポーネントフロー図を作成する

```
SkillCreateWizard（状態オーナー）
├─ DescribeStep
│   ├─ description テキストエリア（既存）
│   └─ generationMode セレクター（新規: "llm" | "template"）
├─ ConfigureStep（template モード時のみ表示）
│   └─ WizardOptions チェックボックス群（既存）
├─ GenerateStep
│   ├─ ローディング表示（既存 + generationProgress 追加）
│   ├─ plan 結果表示パネル（新規）
│   │   ├─ type 表示
│   │   ├─ estimatedSteps 表示
│   │   └─ guidance 表示（type === "terminal_handoff" 時）
│   ├─ 「実行する」ボタン（新規）
│   ├─ 「キャンセル」ボタン（新規）
│   └─ エラー表示（既存 + generationError 対応）
└─ CompleteStep（既存）
```

2. 各コンポーネントの責務を記録する:
   - **SkillCreateWizard**: 全状態の管理、planSkill/executePlan ハンドラの定義、ステップ遷移制御
   - **DescribeStep**: 説明入力 + 生成モード選択（UI のみ、ロジックなし）
   - **ConfigureStep**: テンプレートオプション設定（LLM モード時はスキップ）
   - **GenerateStep**: 生成進捗表示 / plan 結果表示 / 実行・キャンセルボタン（UI のみ）
   - **CompleteStep**: 完了表示（変更なし）

3. 結果を `outputs/phase-2/component-topology.md` に記録する

**期待される成果物**:

- `outputs/phase-2/component-topology.md`

---

### タスク2: データフロー設計

**目的**: LLM 生成フローの完全なデータフローを設計する

**実行手順**:

1. 以下の2つのフローを設計する

**フロー A: LLM 生成フロー**

```
DescribeStep[generationMode="llm", onNext]
  → SkillCreateWizard.handleLlmGenerate()
    → goToStep(2)  // GenerateStep へ直接遷移（ConfigureStep スキップ）
    → setIsGenerating(true)
    → setGenerationProgress("計画を生成中...")
    → getSkillCreatorApi().planSkill(description)
    → 成功時:
      → setLocalPlanResult(planResult.data)
      → setCurrentPlanResult(planResult.data)
      → setCurrentPlanId(planResult.data.planId)
      → setIsGenerating(false)
      → GenerateStep で plan 結果表示
    → 失敗時:
      → setGenerationError(error.message)
      → setIsGenerating(false)
      → GenerateStep でエラー表示

GenerateStep[「実行する」ボタン]
  → SkillCreateWizard.handleExecutePlan()
    → setIsGenerating(true)
    → getSkillCreatorApi().executePlan(planId, description)
    → 成功時:
      → setSkillPath(result.data.skillPath)
      → setLocalPlanResult(null)
      → clearGenerationState()
      → goToStep(3)  // CompleteStep へ遷移
    → 失敗時:
      → setGenerationError(error.message)
      → setIsGenerating(false)

GenerateStep[「キャンセル」ボタン]
  → SkillCreateWizard.handleCancelPlan()
    → setLocalPlanResult(null)
    → clearGenerationState()
    → goToStep(0)  // DescribeStep へ戻る
```

**フロー B: テンプレート生成フロー（既存・非破壊）**

```
DescribeStep[generationMode="template", onNext]
  → goNext()  // ConfigureStep へ遷移（既存フロー）
ConfigureStep[onGenerate]
  → SkillCreateWizard.handleGenerate()  // 既存ロジックそのまま
```

2. 結果を `outputs/phase-2/data-flow.md` に記録する

**期待される成果物**:

- `outputs/phase-2/data-flow.md`

---

### タスク3: 型定義・Props 設計

**目的**: 変更・追加する型定義と Props インターフェースを設計する

**実行手順**:

1. 以下の型定義を設計する

**新規型: GenerationMode**

```typescript
// SkillCreateWizard.tsx または wizard/index.ts
export type GenerationMode = "llm" | "template";
```

**DescribeStep Props 拡張**

```typescript
export interface DescribeStepProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  generationMode: GenerationMode; // 新規
  onGenerationModeChange: (mode: GenerationMode) => void; // 新規
  onNext: () => void;
}
```

**GenerateStep Props 拡張**

```typescript
import type { PlanResult } from "../../../store/slices/agentSlice";

export interface GenerateStepProps {
  isGenerating: boolean;
  error: Error | null;
  // 以下すべて新規
  generationMode: GenerationMode;
  generationProgress: string | null;
  planResult: PlanResult | null;
  onExecutePlan: () => void;
  onCancelPlan: () => void;
}
```

**SkillCreateWizard 新規状態**

```typescript
// 既存状態に追加
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

2. 結果を `outputs/phase-2/type-definitions.md` に記録する

**期待される成果物**:

- `outputs/phase-2/type-definitions.md`

---

### タスク4: getSkillCreatorApi 共通化設計

**目的**: SkillLifecyclePanel と共通の API アクセスパターンを設計する

**実行手順**:

1. SkillLifecyclePanel（L131-142）の `getSkillCreatorApi()` 関数を確認する
2. SkillCreateWizard でも同一パターンを使用する設計を行う
3. 共通化の判断:
   - **Option A**: 同一の `getSkillCreatorApi` 関数を SkillCreateWizard にも定義する（コピー）
   - **Option B**: 共通ユーティリティとして抽出する
   - **推奨**: Phase 5 時点では Option A（コピー）。Phase 8（リファクタリング）で共通化を検討する
4. ローカル型 `SkillCreatorRuntimeApi` の設計（TASK-SC-06 C-1 回避のため Preload API シグネチャと完全一致させる）

```typescript
// SkillCreateWizard.tsx 内に定義
type SkillCreatorRuntimeApi = {
  planSkill?: (
    prompt: string,
    authMode?: string,
    apiKey?: string,
  ) => Promise<IpcResult<PlanResult>>;
  executePlan?: (
    planId: string,
    skillSpec: string, // 必須（optional ではない！C-1 回避）
    authMode?: string,
    apiKey?: string,
  ) => Promise<IpcResult<{ skillName: string; skillPath: string }>>;
};
```

5. 結果を `outputs/phase-2/api-access-pattern.md` に記録する

**期待される成果物**:

- `outputs/phase-2/api-access-pattern.md`

---

### タスク5: ステップ遷移ロジック設計

**目的**: generationMode に応じたステップ遷移を設計する

### ステップ番号参照テーブル

| ステップ番号 | ステップ名    | コンポーネント  | 備考                         |
| ------------ | ------------- | --------------- | ---------------------------- |
| 0            | DescribeStep  | `DescribeStep`  | 説明入力・モード選択         |
| 1            | ConfigureStep | `ConfigureStep` | テンプレートモード時のみ表示 |
| 2            | GenerateStep  | `GenerateStep`  | LLM 生成中・plan 結果表示    |
| 3            | CompleteStep  | `CompleteStep`  | 生成完了                     |

> **注意**: `goToStep(N)` のステップ番号はこのテーブルに準拠する。LLM モードでは ConfigureStep（ステップ1）をスキップし、DescribeStep（0）→ GenerateStep（2）→ CompleteStep（3）と遷移する。

**実行手順**:

1. 以下の遷移マトリクスを設計する

| 現在のステップ | generationMode | アクション           | 遷移先        |
| -------------- | -------------- | -------------------- | ------------- |
| DescribeStep   | template       | onNext               | ConfigureStep |
| DescribeStep   | llm            | onNext               | GenerateStep  |
| ConfigureStep  | template       | onGenerate           | GenerateStep  |
| ConfigureStep  | -              | onBack               | DescribeStep  |
| GenerateStep   | llm            | onExecutePlan (成功) | CompleteStep  |
| GenerateStep   | llm            | onCancelPlan         | DescribeStep  |
| GenerateStep   | template       | (自動遷移)           | CompleteStep  |

2. `goToStep` vs `goNext` の使い分け:
   - LLM モードでは ConfigureStep（step=1）をスキップするため `goToStep(2)` を使用
   - テンプレートモードでは既存の `goNext()` をそのまま使用

3. 結果を `outputs/phase-2/step-transition.md` に記録する

**期待される成果物**:

- `outputs/phase-2/step-transition.md`

---

## 参照資料

| 参照資料                        | パス                                                                 | 内容                               |
| ------------------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| Phase 1 成果物                  | `outputs/phase-1/`                                                   | 要件定義・AC・スコープ             |
| SkillLifecyclePanel（参考実装） | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | Hybrid State Pattern の実装例      |
| Preload API                     | `apps/desktop/src/preload/skill-creator-api.ts`                      | planSkill/executePlan 実シグネチャ |
| agentSlice                      | `apps/desktop/src/renderer/store/slices/agentSlice.ts`               | PlanResult 型定義（L34-39）        |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料              | パス                                                                              | 内容                       |
| --------------------- | --------------------------------------------------------------------------------- | -------------------------- |
| UI コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components-core.md`    | wizard コンポーネント設計  |
| 状態管理仕様          | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Zustand store 設計         |
| IPC Agent API         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         | planSkill/executePlan 契約 |

---

## 成果物

| 成果物                 | パス                                    | 内容                        |
| ---------------------- | --------------------------------------- | --------------------------- |
| コンポーネントトポロジ | `outputs/phase-2/component-topology.md` | 責務分担・接続関係          |
| データフロー設計       | `outputs/phase-2/data-flow.md`          | LLM / テンプレート 両フロー |
| 型定義・Props 設計     | `outputs/phase-2/type-definitions.md`   | GenerationMode, Props 拡張  |
| API アクセスパターン   | `outputs/phase-2/api-access-pattern.md` | getSkillCreatorApi / 型一致 |
| ステップ遷移ロジック   | `outputs/phase-2/step-transition.md`    | 遷移マトリクス              |

---

## 統合テスト連携（Phase 2）

統合ポイント/契約（API・スキーマ）を設計に反映:

- planSkill の入出力契約: `(prompt, authMode?, apiKey?) => IpcResult<RuntimeSkillCreatorPlanResponse>`
- executePlan の入出力契約: `(planId, skillSpec, authMode?, apiKey?) => IpcResult<RuntimeSkillCreatorExecuteResult>`
- SkillCreateWizard → Preload API → Main Process の IPC チェーン
- PlanResult 型と RuntimeSkillCreatorPlanResponse 型のマッピング

---

## 完了条件

- [ ] コンポーネントトポロジ図が作成されている
- [ ] LLM 生成フロー / テンプレート生成フローの両方のデータフローが設計されている
- [ ] GenerationMode, DescribeStepProps, GenerateStepProps の型定義が設計されている
- [ ] getSkillCreatorApi のアクセスパターンが設計されている（C-1 回避含む）
- [ ] ステップ遷移マトリクスが作成されている
- [ ] 全5成果物が outputs/phase-2/ に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-3-design-review.md`
