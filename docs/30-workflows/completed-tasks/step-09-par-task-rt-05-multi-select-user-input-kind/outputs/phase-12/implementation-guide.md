# TASK-RT-05 Phase 12 Implementation Guide

## Part 1: 初学者向け説明

### 複数選択とは

今まで、スキル作成の途中でユーザーに質問するとき、選べる答えは「1つだけ選ぶ」か「自由に文字を入力する」か「はい/いいえ」のどれかでした。

でも「好きな教科を1つだけ選んでね」と聞くのと「好きな教科を全部選んでね」と聞くのは違いますよね。今回の変更は、まさにその「全部選べる」質問を追加したものです。

技術的には、`single_select`（1つだけ選ぶ）に加えて `multi_select`（いくつでも選べる）という新しい種類を追加しました。画面では、ラジオボタン（丸い選択肢）の代わりにチェックボックス（四角い選択肢）が表示され、複数にチェックを入れられます。

### 何が変わったか

1. **質問の種類**が 4 種類から 5 種類に増えた（`multi_select` 追加）
2. **回答の送り方**に「選んだものの一覧」(`selectedOptionIds`)が追加された
3. **画面**にチェックボックス群が追加された
4. **検証ルール**として「1つ以上選ぶこと」「知らない選択肢を送らないこと」が追加された

### スクリーンショット証跡

- 保存先予定: `outputs/phase-11/`
- 状態: 2026-03-30 時点では未取得。UI 起動後に checkbox host 表示状態を追加取得する

## Part 2: 技術詳細

### 型定義の変更

`packages/shared/src/types/skillCreator.ts`:

```ts
// SkillCreatorUserInputKind に "multi_select" を追加
export type SkillCreatorUserInputKind =
  | "single_select"
  | "multi_select" // NEW
  | "free_text"
  | "secret"
  | "confirm";

// SkillCreatorUserInputSubmission に selectedOptionIds を追加
export interface SkillCreatorUserInputSubmission {
  planId: string;
  requestId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[]; // NEW
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}
```

**設計判断**: `selectedOptionIds` を `selectedOptionId` とは別フィールドにした理由は、既存の `single_select` 送信経路を一切変更しないため。union 型で統合する方法もあるが、既存 4 kind の非破壊を最優先した。

### Engine Validation

`apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`:

```ts
case "multi_select":
  if (!Array.isArray(submission.selectedOptionIds) || submission.selectedOptionIds.length === 0) {
    throw new Error("selectedOptionIds must be a non-empty array");
  }
  for (const id of submission.selectedOptionIds) {
    if (!request.options?.some((option) => option.id === id)) {
      throw new Error("selectedOptionIds contains unknown option id");
    }
  }
  return;
```

**設計判断**: `verification_review` の unknown option fallback は `single_select` のみ維持し、`multi_select` には拡張しない。理由は、multi_select は将来の interview フロー（TASK-P0-06）向けであり、verification_review で使用される想定がないため。

### Renderer State と Submit

`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`:

- `const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])` を追加
- submit 分岐に `multi_select` → `selectedOptionIds` を追加
- submit 後の reset に `setSelectedOptionIds([])` を追加
- request kind 切替時にも `selectedOptionIds` / `textAnswer` / `secretAnswer` を reset
- 未入力時の submit を kind ごとに disable
- checkbox host JSX を `single_select` 直後に配置

### テスト観点

| テスト ID | 観点                        | ファイル                                    |
| --------- | --------------------------- | ------------------------------------------- |
| T4-2      | 空配列 reject               | SkillCreatorWorkflowEngine.test.ts          |
| T4-3      | 未知 option id reject       | SkillCreatorWorkflowEngine.test.ts          |
| T4-4      | 正常な配列 pass             | SkillCreatorWorkflowEngine.test.ts          |
| T4-5      | checkbox 群の描画           | SkillLifecyclePanel.llm-generation.test.tsx |
| T4-6      | selectedOptionIds の submit | SkillLifecyclePanel.llm-generation.test.tsx |
| T4-7      | submit disable 条件         | SkillLifecyclePanel.llm-generation.test.tsx |
| T4-8      | kind 切替時の state reset   | SkillLifecyclePanel.llm-generation.test.tsx |
| T4-9      | 既存 4 kind の回帰          | 既存テスト群                                |
