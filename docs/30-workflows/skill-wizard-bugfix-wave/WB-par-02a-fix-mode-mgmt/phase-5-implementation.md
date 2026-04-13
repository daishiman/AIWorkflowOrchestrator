# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 5                                                             |
| タスクID   | TASK-SW-FIX-MODE-MGMT-001                                     |
| 機能名     | generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正 |
| 前提Phase  | Phase 4                                                       |
| 後続Phase  | Phase 6                                                       |
| 作成日     | 2026-04-12                                                    |
| ステータス | pending                                                       |

## 目的

Phase 4 で定義した Red テストを Green へ移行する最小実装を行う。

## 実装手順

### Step 1: state削除（SkillCreateWizard.tsx）

以下を `SkillCreateWizard.tsx` から削除する。

```typescript
// 削除する state
const [generationMode, setGenerationMode] = useState<"template" | "llm">(
  "template",
);
const [hasActivatedLlmMode, setHasActivatedLlmMode] = useState(false);

// 削除するハンドラ内の分岐
const handleLlmGenerate = async () => {
  setHasActivatedLlmMode(true);
  goToStep(2); // ← この直接呼び出しを削除してStep 1遷移に変更
};

// 削除するtemplate条件分岐
if (generationMode === "template") {
  /* ... */
}
if (generationMode === "llm") {
  /* ... */
}
```

### Step 2: handleStep0Next の修正（SkillCreateWizard.tsx）

```typescript
// 修正前: generationMode による分岐あり
const handleStep0Next = () => {
  if (generationMode === "llm") {
    handleLlmGenerate(); // goToStep(2) を呼んでStep 1スキップ
  } else {
    goToStep(1);
  }
};

// 修正後: 常にStep 1へ遷移
const handleStep0Next = () => {
  goToStep(1); // Step 1（ConversationRoundStep）へ正規遷移
};
```

### Step 3: ラジオボタンUIの削除（SkillInfoStep.tsx）

```tsx
// 削除する JSX
<RadioGroup
  value={generationMode}
  onChange={setGenerationMode}
  data-testid="generation-mode-selector"
>
  <Radio value="template" data-testid="generation-mode-template">
    テンプレートから作成
  </Radio>
  <Radio value="llm" data-testid="generation-mode-llm">
    LLMで生成
  </Radio>
</RadioGroup>

// 削除後: ラジオボタンなし・フォーム入力のみ残す
// （スキル名・目的・カテゴリの入力フォームはそのまま維持）
```

### Step 4: SkillInfoStep の props 整理

```typescript
// 修正前
interface SkillInfoStepProps {
  generationMode: "template" | "llm";
  onGenerationModeChange: (mode: "template" | "llm") => void;
  onNext: () => void;
  // ...
}

// 修正後: generationMode関連propを削除
interface SkillInfoStepProps {
  onNext: () => void;
  // ...（generationMode関連prop除去）
}
```

### Step 5: レンダリング更新（SkillCreateWizard.tsx）

```typescript
// 修正前
{currentStep === 0 && (
  <SkillInfoStep
    generationMode={generationMode}
    onGenerationModeChange={setGenerationMode}
    onNext={handleStep0Next}
  />
)}

// 修正後
{currentStep === 0 && (
  <SkillInfoStep
    onNext={handleStep0Next}
    // generationMode props 削除済み
  />
)}
```

### Step 6: 不要なインポートの削除

- `GenerationMode` 型インポートの除去
- `generationMode` / `hasActivatedLlmMode` 関連の型インポート除去
- templateモード用コンポーネントのインポート除去（存在する場合）

## 変更対象ファイル一覧

| ファイル                                                              | 変更種別 | 概要                                             |
| --------------------------------------------------------------------- | -------- | ------------------------------------------------ |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`    | 変更     | state削除・handleStep0Next修正・レンダリング更新 |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` | 変更     | ラジオボタンUI削除・props整理                    |
| 関連テストファイル（`__tests__/SkillCreateWizard.test.tsx` 等）       | 変更     | generationMode参照テストの更新                   |

## 参照資料

| 資料名           | パス                                    | 用途           |
| ---------------- | --------------------------------------- | -------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md` | Phase 4 成果物 |
| テストケース定義 | `outputs/phase-4/test-cases.md`         | Phase 4 成果物 |
| フロー比較図     | `outputs/phase-2/flow-comparison.md`    | Phase 2 成果物 |

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
- [ ] `generationMode` stateが完全に削除されていること
- [ ] `hasActivatedLlmMode` stateが完全に削除されていること
- [ ] ラジオボタンUIが`SkillInfoStep.tsx`から削除されていること
- [ ] `handleStep0Next`がStep 1へ正規遷移するよう修正されていること
- [ ] `handleLlmGenerate`内の`goToStep(2)`直接呼び出しが除去されていること
- [ ] Phase 4 の全テストが Green になっていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. state削除（Step 1）
3. handleStep0Next修正（Step 2）
4. ラジオボタンUI削除（Step 3）
5. props整理・レンダリング更新・インポート整理（Step 4〜6）
6. テスト Green 確認
7. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
