# W2-seq-03a 実装ガイド

## タスクID: W2-seq-03a

## 作成日: 2026-04-08

---

## Part 1: 中学生向けの概念説明

### 何が変わったの？

「スキルを作るウィザード」を、テンプレートから選ぶ方式をやめて、AIが全部考えてくれる方式（LLM専用）に変えました。

- まず Step 0 で「このスキルは何をする？」という説明文を書きます
- コンピューターが説明文を読んで「SlackとかGitHubとか使いそうだな」と自動で判断します（スマートデフォルト）
- 次に Step 1 で会話しながら詳細を決めます
- Step 2 でAIがスキルを作ります
- Step 3 で完成！「今すぐ実行」「エディタで開く」などのボタンが出ます

### テンプレートモードをやめた理由は？

前は「テンプレートを選ぶ」か「AIに作ってもらう」かを選べました。でも、テンプレートを選ぶ機能はほとんど使われていなかったので、AIに作ってもらう方法だけに絞りました。シンプルにすることで、使いやすくなります。

### スマートデフォルト（inferSmartDefaults）って何？

説明文（purpose）やカテゴリから、よくある設定を「先読み」して入れておく仕組みです。

例:

- 説明文に「Slack」が入っていれば「外部ツール連携あり」「ツール名: Slack」と自動判断
- カテゴリが「スケジュール」なら「詳細生成モード」を推奨
- カテゴリが「コードサポート」なら「スキップして生成モード」を推奨

ただし、これはあくまで「助け」なので、Step 1 でユーザーが自由に変えられます。

### 「やり直す」ボタンって何をするの？

Step 3（完成画面）で「やり直す」を押すと、Step 0 に戻ります。このとき、前に入力したスキル名や説明文はそのまま残っています。最初から全部入力し直さなくていいので、少しだけ変えて再生成したいときに便利です。

---

## Part 2: 技術者向けの説明

### 目的と変更点（要約）

- `SkillCreateWizard.tsx` からテンプレート生成モード（`generationMode` state）を完全削除し、LLM生成専用のオーケストレーションに更新する
- `formData` / `answers` / `smartDefaults` / `generationMethod` / `skillPath` / `hasExternalIntegration` / `externalToolName` の7つの state を追加する
- `inferSmartDefaults` 純粋関数を実装し、purpose テキストとカテゴリからスマートデフォルトを推論する
- `handleStep0Next` / `handleGenerate(method)` / `handleQualityFeedback` / `handleRetry` の4つのハンドラを追加する
- STEPS配列を `["スキル情報入力", "詳細設定", "生成", "完了"]` に更新する

### 主な実装ファイル

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
  - 主要な変更対象。State・ハンドラ・レンダリングを全面更新
- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`
  - `skillPath` / `hasExternalIntegration` / `externalToolName` / action cards / `onRetry` props を追加
  - `onClose` を optional に変更
- `apps/desktop/src/renderer/components/skill/wizard/index.ts`
  - `SkillInfoStep` の export を追加

### inferSmartDefaults の実装方針

```typescript
const EXTERNAL_TOOL_KEYWORDS = [
  { keyword: "slack", toolName: "Slack" },
  { keyword: "github", toolName: "GitHub" },
  { keyword: "notion", toolName: "Notion" },
];

const SKIP_CATEGORIES: SkillCategory[] = ["code-support", "data-analysis"];

function inferSmartDefaults(formData: SkillFormData): SmartDefaultResult {
  const purposeLower = formData.purpose.toLowerCase();
  // ツール名はループで後勝ち（複数一致時は最後のものが有効）
  // カテゴリは SKIP_CATEGORIES に含まれれば 'skip'、それ以外は 'complete'
}
```

- 純粋関数として実装し、副作用を持たない
- `inferenceLog` に推論過程を記録し、テスト・デバッグに活用する

### handleRetry の重要な挙動

```typescript
function handleRetry() {
  setCurrentStep(0);
  // formData は保持（setFormData を呼ばない）
  setAnswers([]);
  setSmartDefaults(null);
  setSkillPath(null);
  setHasExternalIntegration(false);
  setExternalToolName(null);
}
```

`formData` を保持することで、Step 0 の `SkillInfoStep` に `initialData={formData}` を渡し、前回入力を復元する。

### 型（shared contracts）

以下は `packages/shared/src/types/skillCreator.ts` の「Skill Wizard Shared Contracts」セクションを参照する。

- `SkillCategory`
- `SkillFormData`（または `SkillInfoFormData`）
- `SmartDefaultResult`（`inferenceLog?: string[]` を含む）
- `QualityFeedback`

### 仕様上の重要な挙動

- `inferSmartDefaults` は Step 0 完了時（`handleStep0Next`）に1回だけ実行される
- Step 1 で回答を変えても `inferSmartDefaults` は再実行しない（ユーザー入力優先）
- `handleGenerate(method)` の `method` は `'complete'`（詳細生成）または `'skip'`（スキップ生成）のいずれか
- `generationMode` prop は `GenerateStep` から完全削除し、後方互換性を持たせない

### Phase 11 証跡

Phase 11 の視覚証跡は `outputs/phase-11/` 配下に保存する。

- `outputs/phase-11/screenshot-plan.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/evidence-index.md`
- `outputs/phase-11/screenshots/`（Step 0〜3 の UI 状態を示す PNG 群）
