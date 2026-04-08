# Phase 5: 実装

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 5                                          |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                 |
| 機能名     | SkillCreateWizard オーケストレーション更新 |
| 前提Phase  | Phase 4                                    |
| 後続Phase  | Phase 6                                    |
| 作成日     | 2026-04-07                                 |
| ステータス | pending                                    |

## 目的

Phase 4 で定義した Red テストを Green へ移行する最小実装を行う。

## 実装手順

### Step 1: 削除作業

以下を `SkillCreateWizard.tsx` から削除する。

```typescript
// 削除する state
const [description, setDescription] = useState("");
const [options, setOptions] = useState<WizardOptions>(DEFAULT_OPTIONS);
const [generationMode, setGenerationMode] = useState<"template" | "llm">("template");

// 削除するハンドラ
const handleGenerate = () => { /* description/options ベースのテンプレート生成ロジック */ };
const handleDescribeNext = () => {
  if (generationMode === "template") { /* ... */ }  // template 分岐を削除
};
const createSkill = async (description: string, options: WizardOptions) => {
  /* 旧入力引数での生成 */
};

// 削除する JSX 条件分岐
{generationMode === "template" && <TemplateSection />}
{generationMode === "llm" && <LLMSection />}
// → LLMSection のみに統一

// 削除する GenerateStep への prop
<GenerateStep mode={generationMode} ... />
// → mode prop を削除
```

### Step 2: 新 state 追加

```typescript
const [formData, setFormData] = useState<SkillInfoFormData>(
  {} as SkillInfoFormData,
);
const [answers, setAnswers] = useState<ConversationAnswers>(
  {} as ConversationAnswers,
);
const [smartDefaults, setSmartDefaults] = useState<SmartDefaultResult | null>(
  null,
);
const [generationMethod, setGenerationMethod] = useState<"complete" | "skip">(
  "complete",
);
const [skillPath, setSkillPath] = useState<string | null>(null);
const [hasExternalIntegration, setHasExternalIntegration] = useState(false);
const [externalToolName, setExternalToolName] = useState<string | null>(null);
```

### Step 3: STEPS 配列更新

```typescript
// 変更前
const STEPS = ["説明入力", "設定", "生成", "完了"];
// 変更後
const STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"];
```

### Step 4: inferSmartDefaults 関数実装

```typescript
function inferSmartDefaults(data: SkillInfoFormData): SmartDefaultResult {
  const result: SmartDefaultResult = {
    who: null,
    input: null,
    timing: null,
    output: null,
    tool: null,
    format: null,
  };
  const inferenceLog: string[] = [];
  const purpose = data.purpose ?? "";

  // ツール推論
  if (purpose.includes("Slack")) {
    result.tool = "slack";
    inferenceLog.push("purpose に 'Slack' を検出 → tool = 'slack'");
  } else if (purpose.includes("GitHub")) {
    result.tool = "github";
    inferenceLog.push("purpose に 'GitHub' を検出 → tool = 'github'");
  } else if (purpose.includes("Notion")) {
    result.tool = "notion";
    inferenceLog.push("purpose に 'Notion' を検出 → tool = 'notion'");
  }

  // タイミング推論
  if (/毎日|毎週|定期|スケジュール/.test(purpose)) {
    result.timing = "scheduled";
    inferenceLog.push(
      "purpose に定期実行キーワードを検出 → timing = 'scheduled'",
    );
  } else if (/リアルタイム|即座|すぐに/.test(purpose)) {
    result.timing = "realtime";
    inferenceLog.push(
      "purpose にリアルタイムキーワードを検出 → timing = 'realtime'",
    );
  }

  // フォーマット推論
  if (data.category === "code-support") {
    result.format = "code";
    inferenceLog.push("category = 'code-support' → format = 'code'");
  } else if (data.category === "data-analysis") {
    result.format = "structured";
    inferenceLog.push("category = 'data-analysis' → format = 'structured'");
  }

  return { ...result, inferenceLog };
}
```

### Step 5: ハンドラ実装

```typescript
const handleStep0Next = (data: SkillInfoFormData) => {
  setFormData(data);
  const defaults = inferSmartDefaults(data);
  setSmartDefaults(defaults);
  setCurrentStep(1);
};

const handleGenerate = async (method: "complete" | "skip") => {
  setGenerationMethod(method);
  setCurrentStep(2);
  setIsGenerating(true);
  const result = await llmGenerateSkill({
    formData,
    answers,
    smartDefaults,
    method,
  });
  setSkillPath(result.skillPath ?? null);
  setHasExternalIntegration(result.hasExternalIntegration ?? false);
  setExternalToolName(result.externalToolName ?? null);
  setIsGenerating(false);
  setCurrentStep(3);
};

const handleQualityFeedback = (satisfied: boolean) => {
  trackEvent("skill_skeleton_quality_feedback", {
    satisfied,
    generationMethod,
  });
};

const handleRetry = () => {
  setSkillPath(null);
  setHasExternalIntegration(false);
  setExternalToolName(null);
  setCurrentStep(0);
};

const handleExecuteNow = () => {
  // W1-par-02c の今すぐ実行するカードを起動する
};

const handleOpenInEditor = () => {
  // W1-par-02c のエディタで開くカードを起動する
};

const handleCreateAnother = () => {
  handleRetry();
};
```

### Step 6: レンダリング更新

```typescript
{currentStep === 0 && (
  <SkillInfoStep onNext={handleStep0Next} />
)}
{currentStep === 1 && (
  <ConversationRoundStep
    formData={formData}
    smartDefaults={smartDefaults}
    answers={answers}
    onAnswersChange={setAnswers}
    onBack={goBack}
    onGenerate={handleGenerate}
  />
)}
{currentStep === 2 && (
  <GenerateStep
    isGenerating={isGenerating}
    // 既存の進捗 props は維持し、generationMode だけ渡さない
  />
)}
{currentStep === 3 && (
  <CompleteStep
    skillPath={skillPath}
    hasExternalIntegration={hasExternalIntegration}
    externalToolName={externalToolName}
    onExecuteNow={handleExecuteNow}
    onOpenInEditor={handleOpenInEditor}
    onCreateAnother={handleCreateAnother}
    onQualityFeedback={handleQualityFeedback}
    onRetry={handleRetry}
  />
)}
```

## 参照資料

| 資料名             | パス                                       | 用途           |
| ------------------ | ------------------------------------------ | -------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`    | Phase 4 成果物 |
| Red テスト結果     | `outputs/phase-4/red-test-result.md`       | Phase 4 成果物 |
| 統合テスト計画     | `outputs/phase-4/integration-test-plan.md` | Phase 4 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`   | Phase 2 成果物 |
| 推論フローチャート | `outputs/phase-2/inference-flowchart.md`   | Phase 2 成果物 |

## 実行手順

1. Phase 4 成果物を確認する。
2. Step 1〜6 の順に実装する。
3. 実装後に全 Red テストが Green に変わることを確認する。
4. 変更ファイル一覧と契約差分を記録する。

## 成果物

| 成果物           | パス                                        | 説明             |
| ---------------- | ------------------------------------------- | ---------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容の要約   |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイル |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | props/state 差分 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `generationMode` state が完全に削除されていること
- [ ] `description` / `options` state が完全に削除されていること
- [ ] `inferSmartDefaults` が実装されていること
- [ ] `skillPath` state と `handleRetry` が実装されていること
- [ ] `hasExternalIntegration` / `externalToolName` state が実装されていること
- [ ] `GenerateStep` への `generationMode` prop が完全に削除されていること
- [ ] `CompleteStep` の action cards が接続されていること
- [ ] STEPS 配列が `["スキル情報入力", "詳細設定", "生成", "完了"]` になっていること
- [ ] Phase 4 の全テストが Green になっていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 削除作業（Step 1）
3. 新 state・ハンドラ・レンダリング実装（Step 2〜6）
4. テスト Green 確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
