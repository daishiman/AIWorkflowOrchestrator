# Phase 5: 実装

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| Phase名    | 実装                                      |
| タスクID   | UT-SKILL-WIZARD-W1-COMPLETE-STEP-001      |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | Phase 4: テスト作成                       |
| 次Phase    | Phase 6: テスト拡充                       |
| ステータス | pending                                   |
| 作成日     | 2026-04-07                                |

## 目的

Phase 2 の設計と Phase 4 のテストに基づき、`CompleteStep.tsx` を実装する。

## 実行手順

### Step 0: 現行ファイルのバックアップ確認

```bash
# 現行実装を確認
cat apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx
```

### Step 1: 削除対象の除去

現行ファイルから以下を削除する:

- 「スキルが作成されました」テキスト
- スキルパス表示 UI
- 「閉じる」ボタン単体構成
- 旧 Props インターフェース定義

### Step 2: 新 Props インターフェースの実装

```typescript
interface CompleteStepProps {
  generatedSkill: GeneratedSkill | null; // 親から受け取る生成結果コンテキスト。表示文言は変えない
  hasExternalIntegration: boolean;
  externalToolName?: string;
  onExecuteNow?: () => void;
  onOpenInEditor?: () => void;
  onCreateAnother?: () => void;
  onQualityFeedback: (satisfied: boolean) => void;
  onRetry?: () => void;
}
```

### Step 3: 内部状態の実装

```typescript
const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
const [webhookChecked, setWebhookChecked] = useState(false);
const [testRunChecked, setTestRunChecked] = useState(false);
```

### Step 4: CompleteHeader の実装

```tsx
<div data-testid="complete-step-header" role="status">
  <span aria-hidden="true">✓</span>
  <h2>スキルの骨格を生成しました</h2>
  <p className="text-[var(--text-secondary)]">
    ※ これは骨格です。完全に動作するまでには設定が必要な場合があります。
  </p>
</div>
```

### Step 5: QualityFeedback の実装

```tsx
<section>
  <p>この骨格は期待通りでしたか？</p>
  <button
    type="button"
    data-testid="complete-step-feedback-satisfied"
    aria-label="期待通り"
    disabled={feedbackSubmitted}
    onClick={() => {
      if (feedbackSubmitted) return;
      setFeedbackSubmitted(true);
      onQualityFeedback(true);
    }}
  >
    👍 はい
  </button>
  <button
    type="button"
    data-testid="complete-step-feedback-unsatisfied"
    aria-label="イメージと違う、やり直す"
    disabled={feedbackSubmitted}
    onClick={() => {
      if (feedbackSubmitted) return;
      setFeedbackSubmitted(true);
      onQualityFeedback(false);
      onRetry?.();
    }}
  >
    👎 イメージと違う → やり直す
  </button>
</section>
```

### Step 6: NextActionCards の実装

```tsx
<div className="grid grid-cols-3 gap-4">
  <button
    type="button"
    data-testid="complete-step-action-execute"
    aria-label="今すぐ実行する"
    disabled={!onExecuteNow}
    onClick={() => onExecuteNow?.()}
  >
    <span aria-hidden="true">▶</span>
    <span>今すぐ実行する</span>
  </button>

  <button
    type="button"
    data-testid="complete-step-action-open-editor"
    aria-label="エディタで開く"
    disabled={!onOpenInEditor}
    onClick={() => onOpenInEditor?.()}
  >
    <span aria-hidden="true">✏</span>
    <span>エディタで開く</span>
  </button>

  <button
    type="button"
    data-testid="complete-step-action-create-another"
    aria-label="別のスキルを作る"
    disabled={!onCreateAnother}
    onClick={() => onCreateAnother?.()}
  >
    <span aria-hidden="true">＋</span>
    <span>別のスキルを作る</span>
  </button>
</div>
```

### Step 7: ExternalIntegrationChecklist の実装（条件付き）

```tsx
{
  hasExternalIntegration && (
    <section data-testid="complete-step-external-checklist">
      <h3>動作確認チェック</h3>
      <label>
        <input
          type="checkbox"
          data-testid="complete-step-check-webhook"
          checked={webhookChecked}
          onChange={(e) => setWebhookChecked(e.target.checked)}
          aria-checked={webhookChecked}
        />
        {externalToolName ?? "外部ツール"} Webhook URLを設定する
      </label>
      <label>
        <input
          type="checkbox"
          data-testid="complete-step-check-test-run"
          checked={testRunChecked}
          onChange={(e) => setTestRunChecked(e.target.checked)}
          aria-checked={testRunChecked}
        />
        テスト実行で動作確認する
      </label>
    </section>
  );
}
```

### Step 8: テストの実行

```bash
pnpm --filter @repo/desktop vitest run -- CompleteStep
```

## 参照資料

| 資料名         | パス                                                                                | 説明         |
| -------------- | ----------------------------------------------------------------------------------- | ------------ |
| 設計書         | `outputs/phase-2/design.md`                                                         | 実装の根拠   |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` | 実装検証基準 |

## 成果物

| 成果物       | パス                                                                 | 説明                  |
| ------------ | -------------------------------------------------------------------- | --------------------- |
| 実装ファイル | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | 改修完了ファイル      |
| 実装記録     | `outputs/phase-5/implementation-record.md`                           | 変更内容・diff サマリ |

## 完了条件

- [ ] 旧UIが全て削除されている
- [ ] 新Propsインターフェースが実装されている
- [ ] CompleteHeaderが実装されている
- [ ] QualityFeedback（👍/👎）が実装されている
- [ ] NextActionCards（3カード）が実装されている
- [ ] ExternalIntegrationChecklistが条件付きで実装されている
- [ ] リカバリーフロー（👎→onRetry）が実装されている
- [ ] Phase 4 のテストが全てpass している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
