# SkillCreateWizard 実装ガイド（W2-seq-03a）

## Part 1: 中学生レベルの説明

### これは何をするコンポーネントか

「スキル作成ウィザード」は、新しいスキル（AIの指示書）を作るための画面です。
受付スタッフのような役割で、お客さん（ユーザー）が必要なことを順番に聞いていきます。

### なぜ必要か

- 以前は「テンプレートを選ぶ」か「自由記述」という2択しかなく、迷う人が多かった
- 新しい設計では「6つの質問に答えるだけ」で自動的に良いスキルが作られる
- 過去の入力から「きっとこの設定がいいでしょう」と自動で提案してくれる（スマートデフォルト）

### 仕組みのたとえ話

ウィザードは旅館の受付係のようなもの:

1. **Step 0**: 「お名前と目的をどうぞ」（スキル情報入力）
2. **Step 1**: 「詳細をいくつか確認させてください」（6問インタビュー）
3. **Step 2**: 「準備できました！次はどうされますか？」（完了画面）

---

## Part 2: 技術者レベルの説明

### 型定義

```typescript
// Props
export interface SkillCreateWizardProps {
  onClose: () => void;
}

// 主要な state 型（@repo/shared/types/skillCreator から）
// SkillInfoFormData: { skillName: string; purpose: string; category: SkillCategory | null }
// SmartDefaultResult: { who, input, timing, output, tool, format, inferenceLog? }
// ConversationAnswers: { q1〜q6: QuestionAnswer }
```

### inferSmartDefaults API

```typescript
export function inferSmartDefaults(data: SkillInfoFormData): SmartDefaultResult;
// ルール:
// - purpose に "Slack" → tool = "slack"
// - purpose に "GitHub" → tool = "github"
// - purpose に "Notion" → tool = "notion"
// - purpose に 毎日/毎週/定期/スケジュール → timing = "scheduled"
// - purpose に リアルタイム/即座/すぐに → timing = "realtime"
// - category === "code-support" → format = "code"
// - category === "data-analysis" → format = "structured"
// - 推論根拠は inferenceLog[] に記録される
```

### ステップ遷移フロー

```
Step 0 onNext → handleStep0Next()
  → inferSmartDefaults(formData) → setSmartDefaults(result)
  → goNext() → currentStep = 1

Step 1 onGenerate(method) → handleGenerate(method)
  → trackEvent("wizard:step1:complete", { method })
  → createSkill(purpose, SKILL_GENERATION_OPTIONS) [async]
  → setSkillPath(path) → goToStep(2)  [成功時]
  → setError(err)                      [失敗時、Step 1 に留まる]

Step 2 onRetry → handleRetry()
  → setSkillPath(null) → goToStep(0)  [formData は保持]

Step 2 onCreateAnother → handleCreateAnother()
  → setFormData(DEFAULT_FORM_DATA) → setSkillPath(null) → goToStep(0)
```

### trackEvent スタブ（Wave 3 で差し替え）

```typescript
// TODO(Wave3): trackEvent 本実装に差し替え（W3-seq-04）
const trackEvent = (event: string, data?: unknown) => {
  console.log(event, data);
};
```

Wave 3 で `trackEvent` を本実装に差し替える際は、この1箇所のみ変更すればよい。

### エッジケース

| ケース                    | 挙動                                                    |
| ------------------------- | ------------------------------------------------------- |
| IPC が null を返す        | `setError(new Error("スキル生成に失敗しました"))`       |
| IPC が例外を投げる        | `setError(err instanceof Error ? err : new Error(...))` |
| formData.category が null | `isNextEnabled = false`（次へボタン無効）               |
| smartDefaults が null     | `DEFAULT_SMART_DEFAULTS` を渡す                         |
| アンマウント時            | `clearGenerationState()` を呼び出す                     |

### W2-seq-03b との連携

`wizard/index.ts` のエクスポート更新は W2-seq-03b が担当。
`SkillCreateWizard` は `./wizard` から `StepIndicator / SkillInfoStep / ConversationRoundStep / CompleteStep` をインポートし、3ステップ構成を維持する。
