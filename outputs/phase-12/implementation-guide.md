# Phase 12: 実装ガイド - UT-SKILL-WIZARD-W2-seq-03a

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | UT-SKILL-WIZARD-W2-seq-03a                 |
| 作成日   | 2026-04-11                                 |
| 対象     | SkillCreateWizard オーケストレーション更新 |
| 状態     | completed（Phase 12 完了 / PR 未作成）     |

---

## Part 1: 中学生向け説明

### SkillCreateWizard のオーケストレーション更新とは何か？

スキルを作るための「ウィザード（案内役）」を大幅に改良した話です。

以前は「テンプレートで作る方法」と「AIに考えてもらう方法」の2択がありました。でも2択があると使う人が迷ってしまいます。今回は「AIに考えてもらう方法」だけに統一しました。

また、AIにスキルを作ってもらうとき、ユーザーが入力した「スキル名」「目的」「カテゴリ」から、AIへの質問の答えを自動で予測する「スマートデフォルト」機能を追加しました。たとえば「目的に `slack` / `Slack` / `SLACK` のどれが書かれていても、Q5の答え候補を `slack` として推論する」という感じです。これで、ユーザーが同じことを何度も入力する手間を省けます。

完了画面では、生成したスキルのパスを見ながら品質フィードバックを送り、イメージと違ったら Step 0 に戻ってやり直せます。前回の入力は残るので、毎回最初から入力し直す必要はありません。

**例えば：**

- 「毎日Slackに通知を送る」と入力すると、自動で「タイミング：定期実行」「ツール：Slack」が選ばれる
- カテゴリを「code-support（コードサポート）」にすると、自動で「出力形式：コード」が選ばれる

**専門用語の説明：**

- **ウィザード**：複数の画面を順番に案内してくれる入力フォームのこと
- **オーケストレーション**：複数のコンポーネント（部品）を指揮して動かす役割
- **スマートデフォルト**：ユーザーの入力から自動で答えを予測する仕組み
- **state（ステート）**：コンポーネントが持っている「今の状態」の情報

---

## Part 2: 技術者向け説明

### 変更概要

`SkillCreateWizard.tsx` から `description` / `options` / `generationMode` state と関連する全 `template` 分岐を除去し、LLM 専用化した。新たに `formData`/`answers`/`smartDefaults`/`generationMethod`/`skillPath`/`hasExternalIntegration`/`externalToolName` の state を追加し、`handleRetry` で Step 0 への復帰を接続する。`inferSmartDefaults` は `purpose` を小文字化して判定し、`slack`/`github`/`notion` を大小文字不問で推論する。生成開始時は `generationLockRef` と `clearGenerationState()` で再入とストア残留を抑える。

### STEPS 配列変更

```typescript
// 変更前
["説明入力", "設定", "生成", "完了"];

// 変更後
["スキル情報入力", "詳細設定", "生成", "完了"];
```

### inferSmartDefaults 関数（分離先: `wizard/utils/inferSmartDefaults.ts`）

```typescript
export function inferSmartDefaults(
  data: SkillInfoFormData,
): SmartDefaultResult {
  // purpose テキストからツール・タイミングを推論（大小文字不問）
  // category から出力フォーマットを推論
  // inferenceLog に推論根拠を記録
}
```

**推論ルール**:

| 条件                                     | 結果                  |
| ---------------------------------------- | --------------------- |
| purpose に "slack"（大小文字不問）       | tool = "slack"        |
| purpose に "github"（大小文字不問）      | tool = "github"       |
| purpose に "notion"（大小文字不問）      | tool = "notion"       |
| purpose に "毎日/毎週/定期/スケジュール" | timing = "scheduled"  |
| purpose に "リアルタイム/即座/すぐに"    | timing = "realtime"   |
| category === "code-support"              | format = "code"       |
| category === "data-analysis"             | format = "structured" |

### API シグネチャ

```typescript
handleStep0Next(): void
handleGenerate(method: "complete" | "skip"): Promise<void>
handleQualityFeedback(satisfied: boolean): void
handleRetry(): void
handleCancelGeneration(): void
```

### エッジケース

- LLM 生成失敗時: `isGenerating=false` + エラー state で UI フィードバック
- 二重呼び出し: `generationLockRef` + `isGenerating` で防止
- 推論0件: `inferenceLog` が空配列で返る（エラーにならない）
- `handleRetry`: `formData` を保持し、`answers` / `smartDefaults` / `skillPath` / `hasExternalIntegration` / `externalToolName` / `error` / `generationMethod` / `isGenerating` をリセット

### 変更ファイル一覧

| ファイル                                                                                         | 変更内容                                                              |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                               | generationMode 削除、新 state/ハンドラ追加、Step 0/2 レンダリング修正 |
| `apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts`                  | 新規作成（分離）                                                      |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | inferSmartDefaults / STEPS 単体テスト追加                             |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | describe.skip（削除対象 TASK-SC-07 テスト）                           |

### Phase 11 visual evidence

Phase 11 のスクリーンショットは、Step 0〜3 の見た目と回復導線が仕様どおりかを最終確認する根拠として参照した。

| 画面                  | 参照先                                                                                                                                       | 確認観点                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Step 0                | [TC-11-01-step0-description-category.png](../phase-11/screenshots/TC-11-01-step0-description-category.png)                                   | 初期入力とカテゴリ表示   |
| Step 1                | [TC-11-02-step1-page1-defaults.png](../phase-11/screenshots/TC-11-02-step1-page1-defaults.png)                                               | smartDefaults の初期反映 |
| Step 1 エラー         | [TC-11-03-step1-cron-error.png](../phase-11/screenshots/TC-11-03-step1-cron-error.png)                                                       | cron バリデーション表示  |
| Step 2                | [TC-11-04-step2-required-q5.png](../phase-11/screenshots/TC-11-04-step2-required-q5.png)                                                     | Q5 必須表示              |
| Step 3                | [TC-11-05-summary-card-warning.png](../phase-11/screenshots/TC-11-05-summary-card-warning.png)                                               | サマリー警告             |
| Lifecycle panel light | [skill-lifecycle-panel-light.png](../phase-11/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/screenshots/skill-lifecycle-panel-light.png) | ウィザード導線の初期状態 |
| Lifecycle panel dark  | [skill-lifecycle-panel-dark.png](../phase-11/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/screenshots/skill-lifecycle-panel-dark.png)   | 同上のダーク表示         |
