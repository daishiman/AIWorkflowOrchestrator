# Phase 12 成果物: 実装ガイド

## タスクID: TASK-SW-FIX-MODE-MGMT-001

---

## Part 1: 中学生向け説明

### generationModeラジオボタン廃止・LLM専用化とは何か？

スキルを作るための「ウィザード（案内役）」を修正した話です。

たとえば、案内板に「AかBかを選んでください」と書いてあっても、実際にはAしか使わないなら、その選択肢はかえって迷いの元になります。

以前は、スキルウィザードを開くと「テンプレートから作る」か「AIに考えてもらう」か、どちらか選ぶボタン（ラジオボタン）が表示されていました。でも本当はAIに考えてもらう方法だけを使うことが決まっていたので、このボタンは不要でした。今回はこのボタンを削除しました。

また、もう1つ問題がありました。「AIに考えてもらう」を選んだとき、本来はQ1〜Q6の6つの質問に答えてもらうページ（Step 1）を通るはずなのに、そのページを飛ばして直接生成ページ（Step 2）に移動してしまっていました。これを修正し、必ずStep 1の質問を通るようにしました。

これで、ウィザードは「スキル情報入力（Step 0）→ 質問（Step 1）→ 生成（Step 2）→ 完了（Step 3）」という正しい順番で動くようになりました。

**修正前後の比較：**

- 修正前：ウィザードを開くと「テンプレートで作る / AIで作る」の選択肢が表示されていた
- 修正後：選択肢がなく、すぐにスキル名・目的・カテゴリの入力フォームが表示される
- 修正前：AIモードを選ぶとQ1〜Q6をスキップして生成が始まってしまっていた
- 修正後：必ずQ1〜Q6の質問を経由してから生成が始まる

**専門用語の説明：**

- **ラジオボタン**：複数の選択肢から1つを選ぶUI部品（丸いボタン）
- **ウィザード**：複数の画面を順番に案内してくれる入力フォームのこと
- **state（ステート）**：コンポーネントが持っている「今の状態」の情報
- **LLM専用化**：AIによる生成のみに一本化すること

---

## Part 2: 技術者向け説明

### 変更概要

`SkillCreateWizard.tsx` から `generationMode`（`"template" | "llm"`）state と `hasActivatedLlmMode` state、および関連する `template` 分岐を除去し、LLM専用化した。Step 0 から生成へ直行していた旧ルーティングを整理し、`handleStep0Next` が常に Step 1 へ進み、Step 1 側の `handleGenerate` が Step 2 で生成を開始する構成に統一した。`SkillInfoStep.tsx` からラジオボタンUIと関連 props（`generationMode` / `onGenerationModeChange`）を削除した。

### 修正後フロー

```
Step 0（SkillInfoStep）→ handleStep0Next → goToStep(1)
→ Step 1（ConversationRoundStep）→ handleGenerate → goToStep(2)
→ Step 2（GenerateStep）→ 生成完了後に goToStep(3)
→ Step 3（CompleteStep）
```

### このタスクで直接削除・整理した要素

| 対象                                          | 種別         | 理由                                          |
| --------------------------------------------- | ------------ | --------------------------------------------- |
| `generationMode` state                        | useState     | LLM専用化により不要                           |
| `hasActivatedLlmMode` state                   | useState     | `generationMode` との二重管理を廃止           |
| Step 0 のラジオボタンUI                       | UI           | 選択肢が不要で仕様と矛盾していたため          |
| `SkillInfoStep` の `generationMode` 関連props | props        | Step 0 が常に LLM 専用フローになったため      |
| Step 0 → Step 2 の直行分岐                    | ルーティング | Q1〜Q6 を必ず経由する正規フローへ統一するため |

### APIシグネチャ変更

```typescript
// SkillInfoStep props（変更前）
interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  generationMode: "template" | "llm";
  onGenerationModeChange: (mode: "template" | "llm") => void;
  onNext: () => void;
}

// SkillInfoStep props（変更後）
interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}
```

### 使用例

```typescript
// Step 0 JSX（変更後）
{currentStep === 0 && (
  <div data-testid="wizard-step-info">
    <SkillInfoStep
      formData={formData}
      onFormDataChange={setFormData}
      onNext={handleStep0Next}
    />
  </div>
)}
```

### 画面証跡

Phase 11 の current-build capture は以下のファイルに保存済み。

- `docs/30-workflows/WB-par-02a-fix-mode-mgmt/outputs/phase-11/screenshots/step0-no-radio-button.png`
- `docs/30-workflows/WB-par-02a-fix-mode-mgmt/outputs/phase-11/screenshots/step0-filled.png`
- `docs/30-workflows/WB-par-02a-fix-mode-mgmt/outputs/phase-11/screenshots/step-indicator-stepN.png`
- `docs/30-workflows/WB-par-02a-fix-mode-mgmt/outputs/phase-11/screenshots/step1-conversation.png`
- `docs/30-workflows/WB-par-02a-fix-mode-mgmt/outputs/phase-11/screenshots/step2-generating.png`
- `docs/30-workflows/WB-par-02a-fix-mode-mgmt/outputs/phase-11/screenshots/step3-complete.png`

### 設定/定数一覧

| 項目                  | 内容                                                    |
| --------------------- | ------------------------------------------------------- |
| `onNext`              | Step 0 から Step 1 へ進むための callback                |
| `goToStep(1)`         | 正規フローへ進める固定遷移。Step 1 スキップを防ぐ       |
| `generationMode`      | 削除済み state。LLM 専用化により不要                    |
| `hasActivatedLlmMode` | 削除済み補助 state。`generationMode` との二重管理を解消 |

### エッジケース

- `generationMode` 参照箇所の削除漏れ: `pnpm typecheck` で検出可能
- `hasActivatedLlmMode` 参照箇所の削除漏れ: ESLint未使用変数チェックで検出可能
- Step 1スキップ再発: Phase 4/6の自動テスト（TC-04）で検出可能

### 残存技術的負債

なし。
