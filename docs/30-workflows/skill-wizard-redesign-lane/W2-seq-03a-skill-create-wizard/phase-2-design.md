# Phase 2: 設計

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                 |
| 機能名     | SkillCreateWizard オーケストレーション更新 |
| 前提Phase  | Phase 1                                    |
| 後続Phase  | Phase 3                                    |
| 作成日     | 2026-04-07                                 |
| ステータス | pending                                    |

## 目的

`SkillCreateWizard.tsx` の新アーキテクチャを設計し、スマートデフォルト推論ロジックのフローチャートを確定する。

## 新 state 設計

| state名                  | 型                           | 初期値       | 役割                       |
| ------------------------ | ---------------------------- | ------------ | -------------------------- |
| `currentStep`            | `number`                     | `0`          | 現在のステップ番号         |
| `formData`               | `SkillInfoFormData`          | `{}`         | Step 0 のフォーム入力値    |
| `answers`                | `ConversationAnswers`        | `{}`         | Step 1 の会話回答          |
| `smartDefaults`          | `SmartDefaultResult \| null` | `null`       | 推論済みデフォルト値       |
| `generationMethod`       | `"complete" \| "skip"`       | `"complete"` | 生成方式フラグ             |
| `isGenerating`           | `boolean`                    | `false`      | LLM生成中フラグ            |
| `skillPath`              | `string \| null`             | `null`       | 生成完了後のスキルパス     |
| `hasExternalIntegration` | `boolean`                    | `false`      | 完了画面の外部連携表示制御 |
| `externalToolName`       | `string \| null`             | `null`       | 完了画面の外部ツール名     |

## スマートデフォルト推論ロジック フローチャート

```
inferSmartDefaults(formData: SkillInfoFormData): SmartDefaultResult
│
├─ 入力: formData.purpose（目的テキスト）
│   ├─ "Slack" を含む → tool = "slack"
│   ├─ "GitHub" を含む → tool = "github"
│   ├─ "Notion" を含む → tool = "notion"
│   └─ その他 → tool = null（未推論）
│
├─ 入力: formData.purpose（目的テキスト）
│   ├─ "毎日" / "毎週" / "定期" / "スケジュール" を含む → timing = "scheduled"
│   ├─ "リアルタイム" / "即座" / "すぐに" を含む → timing = "realtime"
│   └─ その他 → timing = null（未推論）
│
├─ 入力: formData.category（カテゴリ）
│   ├─ "code-support" → format = "code"
│   ├─ "data-analysis" → format = "structured"
│   └─ その他 → format = null（未推論）
│
└─ 出力: SmartDefaultResult {
     who: null,
     input: null,
     timing: "scheduled" | "realtime" | null,
     output: null,
     tool: "slack" | "github" | "notion" | null,
     format: "code" | "structured" | null,
     inferenceLog: string[]  // 推論根拠の記録
   }
```

## ハンドラ設計

### handleStep0Next()

```
handleStep0Next(data: SkillInfoFormData)
│
├─ setFormData(data)
├─ defaults = inferSmartDefaults(data)
├─ setSmartDefaults(defaults)
└─ setCurrentStep(1)  // Step 1（ConversationRoundStep）へ遷移
```

### handleGenerate(method: "complete" | "skip")

```
handleGenerate(method)
│
├─ setGenerationMethod(method)
├─ setCurrentStep(2)
├─ setIsGenerating(true)
├─ result = await llmGenerateSkill({ formData, answers, smartDefaults, method })
├─ setSkillPath(result.skillPath ?? null)
├─ setHasExternalIntegration(result.hasExternalIntegration ?? false)
├─ setExternalToolName(result.externalToolName ?? null)
├─ setIsGenerating(false)
└─ setCurrentStep(3)  // 完了Stepへ遷移
```

### handleQualityFeedback(satisfied: boolean)

```
handleQualityFeedback(satisfied)
│
└─ trackEvent("skill_skeleton_quality_feedback", {
     satisfied,
     generationMethod
   })
```

### handleRetry()

```
handleRetry()
│
├─ setSkillPath(null)
├─ setHasExternalIntegration(false)
├─ setExternalToolName(null)
└─ setCurrentStep(0)  // Step 0 に戻して前回入力を再利用
```

## STEPS配列設計

```typescript
const STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"];
// インデックス: 0=SkillInfoStep, 1=ConversationRoundStep, 2=GenerateStep, 3=CompleteStep
```

## レンダリング設計

| currentStep | レンダリングコンポーネント | 受け取るprops主要項目                                                                                                                                                                |
| ----------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0           | `<SkillInfoStep>`          | `onNext={handleStep0Next}`                                                                                                                                                           |
| 1           | `<ConversationRoundStep>`  | `formData`, `smartDefaults`, `answers`, `onAnswersChange={setAnswers}`, `onBack={goBack}`, `onGenerate={handleGenerate}`                                                             |
| 2           | `<GenerateStep>`           | `isGenerating`, `generationProgress`, `planResult`, `generationMode` なし                                                                                                            |
| 3           | `<CompleteStep>`           | `skillPath`, `hasExternalIntegration`, `externalToolName`, `onExecuteNow`, `onOpenInEditor`, `onCreateAnother`, `onQualityFeedback={handleQualityFeedback}`, `onRetry={handleRetry}` |

## 参照資料

| 資料名                    | パス                                         | 用途                     |
| ------------------------- | -------------------------------------------- | ------------------------ |
| 要件定義書                | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物           |
| 受け入れ基準              | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物           |
| 影響範囲マップ            | `outputs/phase-1/impact-scope-map.md`        | Phase 1 成果物           |
| 型定義（W0-seq-01成果物） | `packages/shared/src/types/skillCreator.ts`  | SmartDefaultResult等の型 |

## 実行手順

1. Phase 1 成果物を確認し、設計の前提を固める。
2. state設計テーブルを確定する。
3. スマートデフォルト推論フローチャートを詳細化する。
4. ハンドラ設計を擬似コードで記述する。
5. レンダリング設計テーブルを完成させる。

## 成果物

| 成果物             | パス                                     | 説明                            |
| ------------------ | ---------------------------------------- | ------------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | state/ハンドラ/レンダリング設計 |
| 推論フローチャート | `outputs/phase-2/inference-flowchart.md` | スマートデフォルト推論詳細      |
| テスト戦略         | `outputs/phase-2/test-strategy.md`       | テスト方針と対象ケース          |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] スマートデフォルト推論フローチャートが全推論ルールを網羅していること
- [ ] 全ハンドラの擬似コードが記述されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. state設計の確定
3. 推論フローチャートの詳細化
4. ハンドラ設計の記述
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
