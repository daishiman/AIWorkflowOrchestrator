# Phase 2 成果物: 設計書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| タスクID   | UT-SKILL-WIZARD-W1-COMPLETE-STEP-001      |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 作成日     | 2026-04-08                                |
| ステータス | completed                                 |

## コンポーネント構造

```
CompleteStep (root)  [data-testid="complete-step"]
├── CompleteHeader          # 完了ヘッダー（✓アイコン + タイトル）[role="status"]
├── QualityFeedback         # 品質フィードバック（👍/👎）
├── NextActionCards         # ネクストアクション3カード（grid layout）
│   ├── ExecuteCard         # ▶ 今すぐ実行する [data-testid="complete-step-action-execute"]
│   ├── EditorCard          # ✏ エディタで開く  [data-testid="complete-step-action-open-editor"]
│   └── CreateAnotherCard   # ＋ 別のスキルを作る [data-testid="complete-step-action-create-another"]
└── ExternalIntegrationChecklist  # 動作確認チェック（hasExternalIntegration=trueのみ）
```

## Props インターフェース

```typescript
export interface CompleteStepProps {
  generatedSkill: GeneratedSkill | null; // 親由来の生成結果コンテキスト（表示文言には使用しない）
  hasExternalIntegration: boolean;
  externalToolName?: string;
  onExecuteNow?: () => void;
  onOpenInEditor?: () => void;
  onCreateAnother?: () => void;
  onQualityFeedback: (satisfied: boolean) => void;
  onRetry?: () => void; // リカバリーフロー用: Step 0 への復帰トリガーのみ
}
```

## 内部状態

```typescript
const [feedbackSubmitted, setFeedbackSubmitted] = useState(false); // 二重送信防止
const [webhookChecked, setWebhookChecked] = useState(false); // Webhookチェック状態
const [testRunChecked, setTestRunChecked] = useState(false); // テスト実行チェック状態
```

## レイアウト設計

```
┌─────────────────────────────────────────────┐
│  ✓ スキルの骨格を生成しました               │  ← CompleteHeader [role="status"]
│  ※完全動作ではなく骨格です                  │
├─────────────────────────────────────────────┤
│  この骨格は期待通りでしたか？               │  ← QualityFeedback
│  [👍 はい]  [👎 イメージと違う → やり直す] │
├─────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  ← NextActionCards (grid-cols-3)
│  │ ▶ 今すぐ│  │✏ エディタ│  │＋ 別の │   │
│  │  実行する│  │  で開く  │  │スキルを │   │
│  └─────────┘  └─────────┘  └─────────┘   │
├─────────────────────────────────────────────┤
│  ☐ {{externalToolName ?? "外部ツール"}}     │  ← ExternalIntegrationChecklist
│    Webhook URL を設定する                    │  （hasExternalIntegration=trueのみ）
│  ☐ テスト実行で動作確認する                │
└─────────────────────────────────────────────┘
```

## data-testid 設計

| 要素                   | data-testid                           |
| ---------------------- | ------------------------------------- |
| ルートコンテナ         | `complete-step`                       |
| 完了ヘッダー           | `complete-step-header`                |
| 👍フィードバックボタン | `complete-step-feedback-satisfied`    |
| 👎フィードバックボタン | `complete-step-feedback-unsatisfied`  |
| 今すぐ実行カード       | `complete-step-action-execute`        |
| エディタで開くカード   | `complete-step-action-open-editor`    |
| 別のスキルを作るカード | `complete-step-action-create-another` |
| 外部連携チェックリスト | `complete-step-external-checklist`    |
| Webhook設定チェック    | `complete-step-check-webhook`         |
| テスト実行チェック     | `complete-step-check-test-run`        |

## リカバリーフロー設計

```
👎クリック
  ↓
onQualityFeedback(false) 呼び出し
  ↓
setFeedbackSubmitted(true)（二重送信防止）
  ↓
onRetry?.()（SkillCreateWizard側でStep 0に戻る）
```

> Step 0 の前回入力プリフィルは W2-seq-03a の責務とする。

## nextActions 配列設計（リファクタリング後）

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
] as const;
```

## 完了確認

- [x] コンポーネント構造が定義されている
- [x] Propsインターフェースが確定している
- [x] 内部状態が設計されている
- [x] レイアウトが定義されている
- [x] data-testid一覧が定義されている
- [x] リカバリーフローのシーケンスが定義されている
- [x] 本Phase内の全タスクを100%実行完了
