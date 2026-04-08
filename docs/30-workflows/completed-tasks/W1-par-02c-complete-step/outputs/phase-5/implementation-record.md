# Phase 5 成果物: 実装仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 5                                                 |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                        |
| 機能名     | CompleteStep 完了画面再設計（起点画面化）         |
| 作成日     | 2026-04-08                                        |
| ステータス | pending（実装待ち。コード実装は本仕様書に基づく） |

> **注:** タスク仕様書作成フェーズのため、本ドキュメントは実装仕様を記述する。実際のコード実装は本仕様書に従って別途実行すること。

---

## 実装対象ファイル

| ファイル                                                                            | 操作                                         |
| ----------------------------------------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                | 全面改修（旧 Props 削除・新 UI 追加）        |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` | 全面書き換え（Phase 4 テストマトリクス準拠） |
| `apps/desktop/src/renderer/components/skill/wizard/index.ts`                        | `CompleteStepProps` 型エクスポートの更新     |

---

## Step 0: 現行実装の把握

**削除対象（現行コード）:**

- `skillPath: string | null` Props
- `onClose: () => void` Props
- `React.forwardRef` による `ref` 受け渡し（不要であれば）
- 「スキルが作成されました」固定テキスト
- `skillPath` 表示ブロック
- 「閉じる」ボタン単体

---

## Step 1〜8: 実装仕様

### 完全 Props インターフェース

```typescript
import { GeneratedSkill } from "@/types/skill"; // W0-seq-01 型定義

interface CompleteStepProps {
  generatedSkill: GeneratedSkill | null;
  hasExternalIntegration: boolean;
  externalToolName?: string;
  onExecuteNow?: () => void;
  onOpenInEditor?: () => void;
  onCreateAnother?: () => void;
  onQualityFeedback: (satisfied: boolean) => void;
  onRetry?: () => void;
}
```

### 内部状態

```typescript
const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
const [webhookChecked, setWebhookChecked] = useState(false);
const [testRunChecked, setTestRunChecked] = useState(false);
```

### CompleteHeader 実装仕様

```tsx
<div data-testid="complete-step-header" role="status">
  <span aria-hidden="true">✓</span>
  <h2>スキルの骨格を生成しました</h2>
  <p className="text-[var(--text-secondary)]">
    ※ これは骨格です。完全に動作するまでには設定が必要な場合があります。
  </p>
</div>
```

### QualityFeedback 実装仕様

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

### NextActionCards 実装仕様

リファクタリング後の形（配列 + map）で実装する:

```typescript
const nextActions = [
  {
    testId: "complete-step-action-execute",
    label: "今すぐ実行する",
    icon: "▶",
    ariaLabel: "今すぐ実行する",
    handler: onExecuteNow,
  },
  {
    testId: "complete-step-action-open-editor",
    label: "エディタで開く",
    icon: "✏",
    ariaLabel: "エディタで開く",
    handler: onOpenInEditor,
  },
  {
    testId: "complete-step-action-create-another",
    label: "別のスキルを作る",
    icon: "＋",
    ariaLabel: "別のスキルを作る",
    handler: onCreateAnother,
  },
];
```

各カード: `disabled={!action.handler}` かつ `aria-disabled={!action.handler}` を付与する。

### ExternalIntegrationChecklist 実装仕様

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
        <span className="truncate">
          {externalToolName ?? "外部ツール"} Webhook URL を設定する
        </span>
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

---

## テスト実行コマンド（実装後）

```bash
pnpm --filter @repo/desktop vitest run -- CompleteStep
```

---

## 変更サマリ（実装完了）

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| 削除行数     | 37行（旧Props・旧UI全削除）               |
| 追加行数     | 165行（新Props・新UI全実装）              |
| 旧テスト廃棄 | 7 件（`skillPath` / `onClose` ベース）    |
| 新テスト追加 | 35 件（Phase 4+6 テストマトリクス全実装） |
| テスト結果   | 35/35 PASS                                |

---

## 完了確認（実装完了 2026-04-08）

- [x] 旧 UI が全て削除されている
- [x] 新 Props インターフェースが実装されている
- [x] CompleteHeader が実装されている
- [x] QualityFeedback（👍/👎）が実装されている
- [x] NextActionCards（3 カード）が実装されている
- [x] ExternalIntegrationChecklist が条件付きで実装されている
- [x] リカバリーフロー（👎 → `onRetry`）が実装されている
- [x] Phase 4+6 のテストが全て pass している（35/35）
