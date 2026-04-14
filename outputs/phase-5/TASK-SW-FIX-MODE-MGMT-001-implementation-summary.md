# Phase 5 成果物: 実装サマリー

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 変更ファイル一覧

| ファイル                                                                          | 変更内容                                                                                 | 実施タスク   |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------ |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                | generationMode/hasActivatedLlmMode state 削除・handleStep0Next 修正・handleGenerate 修正 | Wave A       |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`             | ラジオボタン UI 削除・props 整理                                                         | Wave A       |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | TC-06 追加                                                                               | **本タスク** |

## 実装変更詳細

### SkillCreateWizard.tsx（Wave A 完了済み）

**削除した state:**

- `const [generationMode, setGenerationMode] = useState<"template" | "llm">("template")`
- `const [hasActivatedLlmMode, setHasActivatedLlmMode] = useState(false)`

**修正した handleStep0Next:**

- 変更前: template/llm 分岐あり、handleGenerate 直接呼び出し
- 変更後: `goNext()` のみ（常に Step 1 へ）

**修正した handleGenerate:**

- Step 0 からの直接呼び出しを除去
- ConversationRoundStep の onGenerate 経由のみに統一

### SkillInfoStep.tsx（Wave A 完了済み）

**削除した UI:**

- ラジオボタン JSX（「テンプレートから作成」「LLMで生成」）

**削除した props:**

- `generationMode: "template" | "llm"`
- `onGenerationModeChange: (mode: "template" | "llm") => void`

### SkillCreateWizard.test.tsx（本タスク）

**追加したテスト:**

- TC-06: 旧フラグ残骸ゼロ確認

## 確認済み受け入れ基準

- [x] AC-1: ラジオボタン削除確認（TC-01, TC-02）
- [x] AC-2: state 廃止確認（grep 0件）
- [x] AC-3: Step 0→1 正規遷移（TC-03, TC-04）
- [x] AC-4: Step 1 スキップ禁止（TC-05, TC-06）
- [x] AC-5: テスト全件 PASS（36/36 PASS）
