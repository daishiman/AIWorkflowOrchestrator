# Phase 12: 実装ガイド - TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION

## メタ情報

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| タスクID | TASK-SC-07                                           |
| 作成日   | 2026-04-09                                           |
| 対象     | `SkillCreateWizard` の LLM / template 併用フロー     |
| 状態     | completed（Phase 1-12 completed / Phase 13 blocked） |

---

## Part 1: 中学生向け説明

### 何を直したのか

`SkillCreateWizard` は、スキルを作るための案内役です。今回の修正で、作り方を 2 つに分けました。

1. いつもの手順で作る道
2. AI に先に計画を作ってもらう道

どちらを選んでも、最後は同じ完了画面にたどり着きます。  
つまり、古い作り方を壊さずに、新しい AI 生成ルートを追加したということです。

### 画面の流れ

1. Step 0 で作り方を選びます。
   - `テンプレートから作成`
   - `LLM で生成`
2. テンプレート側では `SkillInfoStep` でスキル名・目的・カテゴリを入力します。
3. LLM 側では短い説明文を入力して、AI に `planSkill` をお願いします。
4. Step 1 では質問ラウンドで内容を固めます。
5. Step 2 では計画結果と進捗を見ながら、`executePlan` で実行します。
6. Step 3 では生成先のパスや次の行動を確認します。

### なぜ「メモを2冊」使うのか

今回の実装では、画面だけのメモと、みんなで共有するメモを分けています。

- 画面だけのメモ: その場で見せるための状態
- 共有するメモ: 別の画面や後続処理でも使う状態

こうすると、画面はすぐに反応し、あとから見ても同じ内容をたどれます。  
`clearGenerationState()` で共有メモを消し、ローカルの状態も合わせて初期化するので、前回の結果が残りっぱなしになりません。

---

## Part 2: 技術者向け説明

### 変更点サマリー

| ファイル                                                                                         | 変更内容                                                                                                                                        |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                               | LLM / template のモード分岐、`planSkill` / `executePlan` / `getWorkflowState` 連携、`skillSpec` の正本使用、request-id ガード、対称クリアを実装 |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                             | `generationProgress`、`planResult`、`terminal_handoff` guidance、実行ボタン/キャンセルボタンの表示条件を整理                                    |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                             | `GenerationMode` の import 元を barrel に合わせて整理。現行 Step 0 の正本は `SkillInfoStep`                                                     |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`              | `generationProgress`、`terminal_handoff`、`最初からやり直す`、`実行する` 非表示の回帰を追加                                                     |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | `skillSpec` 必須化、blank input、`getWorkflowState` failure snapshot、terminal handoff、mode switch を検証                                      |

### 実装後の current facts

- Step 0 は `generationMode` のローカル state で切り替える。
- `template` 側は `SkillInfoStep` を使う。
- `llm` 側は説明文の textarea を使う。
- `planSkill` の入力は LLM 説明文で、`PlanResult.skillSpec` が `executePlan` の正本になる。
- `executePlan(planId, skillSpec)` の `skillSpec` は必須。
- 実行後は `getWorkflowState(planId)` を再読込し、`verifyResult.status === "fail"` の snapshot をエラーとして扱う。
- `terminal_handoff` は `suggestedCommand` 付きのエラーメッセージで返す。
- `clearGenerationState()` は成功時とキャンセル時の両方で呼ぶ。

### 主要 state

| state                    | 役割                                                   |
| ------------------------ | ------------------------------------------------------ |
| `formData`               | テンプレート側のスキル基本情報                         |
| `answers`                | `ConversationRoundStep` の回答                         |
| `smartDefaults`          | 目的文とカテゴリからの推論結果                         |
| `generationMethod`       | テンプレート側の生成方法ラベル                         |
| `generationMode`         | `template` / `llm` のモード切替                        |
| `llmDescription`         | LLM モードの説明文                                     |
| `localPlanResult`        | LLM 計画結果のローカル保持                             |
| `skillPath`              | 完了後に表示する生成先パス                             |
| `persistResult`          | snapshot から復元する生成結果（`skillPath` / `files`） |
| `hasExternalIntegration` | 完了画面で外部連携チェックリストを出すか               |
| `externalToolName`       | Slack / GitHub / Notion などの表示名                   |
| `error`                  | テンプレート側の実行エラー                             |
| `isGenerating`           | テンプレート側の実行中フラグ                           |

### Store hooks

| hook                        | 役割                                                 |
| --------------------------- | ---------------------------------------------------- |
| `useIsSkillGenerating`      | 共有生成状態の参照                                   |
| `useGenerationProgress`     | 進捗メッセージの参照                                 |
| `useGenerationError`        | 共有エラーの参照                                     |
| `useCurrentPlanId`          | 実行中 planId の参照                                 |
| `useCurrentPlanResult`      | 共有 planResult の参照                               |
| `useSetIsSkillGenerating`   | 共有生成フラグの更新                                 |
| `useSetGenerationProgress`  | 共有進捗の更新                                       |
| `useSetGenerationError`     | 共有エラーの更新                                     |
| `useSetCurrentPlanId`       | planId の更新                                        |
| `useSetCurrentPlanResult`   | planResult の更新                                    |
| `useClearGenerationState`   | 共有 state の一括リセット                            |
| `useResetStreamingProgress` | `cancelled` ステージを次回生成に残さないための初期化 |

### ハンドラ仕様

| ハンドラ                 | 役割                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `handleStep0Next()`      | `inferSmartDefaults(formData)` を実行し、Step 1 に進む                                                                          |
| `handleGenerate(method)` | テンプレート側の生成を実行し、Step 2 → Step 3 を制御する                                                                        |
| `handleLlmGenerate()`    | `planSkill(description)` を呼び、`localPlanResult` と store を更新する。request-id で遅延応答を防ぐ                             |
| `handleExecutePlan()`    | `executePlan(planId, skillSpec)` を呼び、成功後に `getWorkflowState(planId)` を再読込する。`persistResult.skillPath` を反映する |
| `handleCancelPlan()`     | LLM 計画を破棄して Step 0 に戻す                                                                                                |
| `handleRetry()`          | 完了画面から Step 0 に戻し、前回の入力は保持したまま結果だけ初期化する                                                          |

- `handleCancelPlan()` では `clearGenerationState()` に加えて `resetStreamingProgress()` を呼び、`cancelled` ステージが残らないようにする。
- `handleExecutePlan()` 後は `getWorkflowState(planId)` の snapshot から `persistResult.skillPath` を復元する。
- `handleLlmGenerate()` と template 側の生成では request-id を使い、遅延した古い応答を無視する。

### API シグネチャ

```ts
planSkill(prompt: string, authMode?: string, apiKey?: string)
executePlan(planId: string, skillSpec: string, authMode?: string, apiKey?: string)
getWorkflowState(planId: string)
```

`getWorkflowState(planId)` は `persistResult?: { skillPath: string; files: string[] } | null` を返す snapshot API として扱う。

### 重要な分岐

- 空の LLM 説明文は `planSkill` を呼ばない。
- `planSkill` と `executePlan` が未接続でもクラッシュさせず、`generationError` を出す。
- `planResult.type === "integrated_api"` のときだけ `実行する` を出す。
- `planResult.type === "terminal_handoff"` のときは guidance を表示し、`実行する` は出さない。
- `getWorkflowState()` の snapshot が fail のときは `CompleteStep` に進めない。
- `persistResult.skillPath` があれば `CompleteStep` で表示する。
- request-id を使って、遅れて返ってきた古い LLM / template 応答が最新 state を壊さないようにしている。

### Phase 11 証跡

Step 0 / Step 1 / Step 3 の視覚確認は既存の Phase 11 証跡を参照する。

| 観点                      | ファイル                                                               |
| ------------------------- | ---------------------------------------------------------------------- |
| Step 0 のカテゴリ付き入力 | `outputs/phase-11/screenshots/TC-11-01-step0-description-category.png` |
| Step 1 の default 表示    | `outputs/phase-11/screenshots/TC-11-02-step1-page1-defaults.png`       |
| Step 1 の cron エラー     | `outputs/phase-11/screenshots/TC-11-03-step1-cron-error.png`           |
| Step 2 の Q5 必須表示     | `outputs/phase-11/screenshots/TC-11-04-step2-required-q5.png`          |
| summary card の警告       | `outputs/phase-11/screenshots/TC-11-05-summary-card-warning.png`       |

### 注意事項

- `DescribeStep.tsx` は現行の正本ではなく、互換性のために残る deprecated ファイル。
- `skillSpec` は `executePlan` の必須引数で、description の代用にしない。
- `clearGenerationState()` はローカル state だけでなく、共有 store も初期化する。
- `resetStreamingProgress()` で cancelled ステージを次回生成に持ち越さない。
