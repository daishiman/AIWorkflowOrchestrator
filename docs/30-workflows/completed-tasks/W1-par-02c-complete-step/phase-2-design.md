# Phase 2: 設計

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| Phase名    | 設計                                      |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | Phase 1: 要件定義                         |
| 次Phase    | Phase 3: 設計レビュー                     |
| ステータス | pending                                   |
| 作成日     | 2026-04-07                                |

## 目的

Phase 1 の要件定義をもとに、CompleteStep.tsx の詳細設計（コンポーネント構造・Props・状態・レイアウト）を確定する。

## 実行タスク

### Task 1: コンポーネント構造設計

CompleteStep を以下のサブコンポーネントに分割する:

```
CompleteStep (root)
├── CompleteHeader          # 完了ヘッダー（✓アイコン + タイトル）
├── QualityFeedback         # 品質フィードバック（👍/👎）
├── NextActionCards         # ネクストアクション3カード
│   ├── ExecuteCard         # ▶ 今すぐ実行する
│   ├── EditorCard          # ✏ エディタで開く
│   └── CreateAnotherCard   # ＋ 別のスキルを作る
└── ExternalIntegrationChecklist  # 動作確認チェック（条件付き表示）
```

### Task 2: Props インターフェース設計

```typescript
interface CompleteStepProps {
  generatedSkill: GeneratedSkill | null; // 親由来の生成結果コンテキスト
  hasExternalIntegration: boolean;
  externalToolName?: string;
  onExecuteNow?: () => void;
  onOpenInEditor?: () => void;
  onCreateAnother?: () => void;
  onQualityFeedback: (satisfied: boolean) => void;
  onRetry?: () => void; // リカバリーフロー用
}
```

### Task 3: 状態設計

CompleteStep 内部で管理する state:

```typescript
// フィードバック送信済みフラグ（二重送信防止）
const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

// 外部連携チェックリスト状態（条件付き表示時のみ使用）
const [webhookChecked, setWebhookChecked] = useState(false);
const [testRunChecked, setTestRunChecked] = useState(false);
```

### Task 4: レイアウト設計

```
┌─────────────────────────────────────────────┐
│  ✓ スキルの骨格を生成しました               │  ← CompleteHeader
│  ※完全動作ではなく骨格です                  │
├─────────────────────────────────────────────┤
│  この骨格は期待通りでしたか？               │  ← QualityFeedback
│  [👍 はい]  [👎 イメージと違う → やり直す] │
├─────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  ← NextActionCards
│  │ ▶ 今すぐ│  │✏ エディタ│  │＋ 別の │   │
│  │  実行する│  │  で開く  │  │スキルを │   │
│  └─────────┘  └─────────┘  └─────────┘   │
├─────────────────────────────────────────────┤
│  ☐ {{externalToolName ?? "外部ツール"}} Webhook URLを設定する │  ← ExternalIntegrationChecklist
│  ☐ テスト実行で動作確認する                │  （hasExternalIntegration=trueのみ）
└─────────────────────────────────────────────┘
```

### Task 5: data-testid 設計

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

### Task 6: リカバリーフロー設計

```
👎クリック
  ↓
onQualityFeedback(false) 呼び出し
  ↓
onRetry() 呼び出し（SkillCreateWizard側でStep 0に戻る）
```

> Step 0 の前回入力プリフィルは W2-seq-03a の責務とする。
> CompleteStep は「やり直し」を通知するだけに留め、状態復元は親が担う。

## 参照資料

| 資料名          | パス                                                  | 説明       |
| --------------- | ----------------------------------------------------- | ---------- |
| 要件定義書      | `outputs/phase-1/requirements.md`                     | 直前成果物 |
| W0-seq-01型定義 | `docs/30-workflows/W0-seq-01-types-skill-info-form/`  | 依存型定義 |
| レーンindex     | `docs/30-workflows/W1-par-02c-complete-step/index.md` | 設計根拠   |

## 成果物

| 成果物 | パス                        | 説明                                            |
| ------ | --------------------------- | ----------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | コンポーネント構造・Props・状態・レイアウト設計 |

## 完了条件

- [ ] コンポーネント構造が定義されている
- [ ] Propsインターフェースが確定している
- [ ] 内部状態が設計されている
- [ ] レイアウトが定義されている
- [ ] data-testid一覧が定義されている
- [ ] リカバリーフローのシーケンスが定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
