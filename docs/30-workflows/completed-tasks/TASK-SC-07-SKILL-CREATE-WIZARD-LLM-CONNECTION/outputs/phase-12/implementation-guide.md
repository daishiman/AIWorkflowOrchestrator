# Phase 12: 実装ガイド

## Part 1: この機能を日常の言葉で理解する

### 何をする機能？

スキル作成ウィザードに「AI に自動で作ってもらう」オプションを追加しました。

今までは「テンプレートから作る」方法しかなかったのが、「AI（LLM）に説明を書いて作ってもらう」方法も選べるようになりました。

### 画面の流れ

1. **説明を書く画面（DescribeStep）**: 「このスキルは○○をする」と説明を書く。ここで「テンプレートから作る」か「AI で作る」かを選べるラジオボタンが新しく追加された。

2. **AI で作る場合**: 「次へ」を押すと、AI が「こういう計画で作りますよ」という提案を見せてくれる（GenerateStep）。「実行する」を押すと実際に作り始め、「キャンセル」を押すと最初の画面に戻る。

3. **テンプレートから作る場合**: 今まで通りの流れで動く（設定画面→生成→完了）。

### Hybrid State Pattern を日常で例えると

これは「メモ帳を2冊使う」パターンです：

- **手元のメモ帳（localPlanResult）**: AI の提案結果をすぐに表示するためのメモ。画面に素早く反映される。
- **共有のノート（storePlanResult）**: チーム全体（他のコンポーネント）と共有するノート。少し遅いけど、みんなが見られる。

大事なルール：「実行する」時も「キャンセルする」時も、**必ず両方のメモを消す**（対称クリア）。片方だけ消すと、古い情報が残ってバグになります。

---

## Part 2: 技術者向け実装詳細

## TASK-SC-07 実装概要

### 目的

SkillCreateWizard の4段階ウィザードフローに planSkill/executePlan LLM 生成ルートを追加する。

### アーキテクチャ

```
DescribeStep (mode選択)
  ├─ template → ConfigureStep → GenerateStep (template) → CompleteStep
  └─ llm → GenerateStep (planSkill→plan表示→executePlan) → CompleteStep
```

### Hybrid State Pattern

```typescript
// ローカル状態（即座のUIフィードバック）
const [localPlanResult, setLocalPlanResult] = useState<PlanResult | null>(null);

// ストア状態（グローバル一貫性）
const storePlanResult = useCurrentPlanResult();

// JSX での合成
planResult={localPlanResult ?? storePlanResult}
```

### 対称クリアパターン

```typescript
// executePlan 成功時
setLocalPlanResult(null);
clearGenerationState();

// cancel 時
setLocalPlanResult(null);
clearGenerationState();
```

### API アクセスパターン

```typescript
const getSkillCreatorApi = (): SkillCreatorRuntimeApi => {
  const api = (
    window as Window & {
      electronAPI?: { skillCreator?: SkillCreatorRuntimeApi };
    }
  ).electronAPI?.skillCreator;
  return api ?? {};
};
```

## テスト戦略

- SkillCreateWizard.llm-generation.test.tsx: E2E的な統合テスト
- DescribeStep.test.tsx / GenerateStep.test.tsx: コンポーネント単体テスト
- Store モック拡張: 既存テストの非破壊性保証
