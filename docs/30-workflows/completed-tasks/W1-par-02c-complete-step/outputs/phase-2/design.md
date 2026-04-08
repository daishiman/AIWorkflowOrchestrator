# Phase 2 成果物: 設計書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 作成日     | 2026-04-08                                |
| ステータス | completed                                 |

---

## Task 1: コンポーネント構造設計

```
CompleteStep (root)
├── CompleteHeader          # 完了ヘッダー（✓ アイコン + タイトル）
├── QualityFeedback         # 品質フィードバック（👍/👎）
├── NextActionCards         # ネクストアクション 3 カード
│   ├── ExecuteCard         # ▶ 今すぐ実行する
│   ├── EditorCard          # ✏ エディタで開く
│   └── CreateAnotherCard   # ＋ 別のスキルを作る
└── ExternalIntegrationChecklist  # 動作確認チェック（条件付き表示）
```

**サブコンポーネント分割方針:** 各ブロックは論理的に独立しており、テスト・スナップショットの単位として境界を明確にする。ただし実装上は単一ファイル（`CompleteStep.tsx`）内のローカル関数コンポーネントとする（外部ファイル分割不要）。

---

## Task 2: Props インターフェース設計

```typescript
interface CompleteStepProps {
  /** 親由来の生成結果コンテキスト。表示文言には使わず、親のオーケストレーション用に保持 */
  generatedSkill: GeneratedSkill | null;
  /** 外部ツール連携がある場合 true → ExternalIntegrationChecklist を表示 */
  hasExternalIntegration: boolean;
  /** 外部ツール名（例: "Slack"）。undefined の場合は "外部ツール" を表示 */
  externalToolName?: string;
  /** 「今すぐ実行する」カードのハンドラ。undefined の場合カードを disabled */
  onExecuteNow?: () => void;
  /** 「エディタで開く」カードのハンドラ。undefined の場合カードを disabled */
  onOpenInEditor?: () => void;
  /** 「別のスキルを作る」カードのハンドラ。undefined の場合カードを disabled */
  onCreateAnother?: () => void;
  /** 👍/👎 フィードバックハンドラ（必須）。satisfied=true で 👍、false で 👎 */
  onQualityFeedback: (satisfied: boolean) => void;
  /** リカバリーフロー用。👎 クリック時に呼び出して Step 0 に戻る */
  onRetry?: () => void;
}
```

**破壊的変更:** 旧 Props（`skillPath`, `onClose`）は完全削除。`SkillCreateWizard.tsx` 側の呼び出し箇所更新が必要（W2-seq-03a スコープ）。

---

## Task 3: 状態設計

```typescript
// フィードバック送信済みフラグ（二重送信防止）
const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

// 外部連携チェックリスト状態（hasExternalIntegration=true 時のみ使用）
const [webhookChecked, setWebhookChecked] = useState(false);
const [testRunChecked, setTestRunChecked] = useState(false);
```

**状態設計の根拠:**

- `feedbackSubmitted` は二重送信ガードのために必要。フィードバック後は両ボタンを `disabled` にする
- チェックリスト状態はローカル UI 状態として管理。親への通知は不要（表示専用）
- `generatedSkill` の内部状態化は不要。表示に使わないため親コンテキストとして保持のみ

---

## Task 4: レイアウト設計

```
┌─────────────────────────────────────────────────┐
│  ✓ スキルの骨格を生成しました                    │  ← CompleteHeader
│  ※ これは骨格です。完全に動作するまでには       │
│    設定が必要な場合があります。                  │
├─────────────────────────────────────────────────┤
│  この骨格は期待通りでしたか？                   │  ← QualityFeedback
│  [👍 はい]  [👎 イメージと違う → やり直す]      │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  ← NextActionCards
│  │ ▶ 今すぐ │  │✏ エディタ│  │＋ 別のス│      │
│  │  実行する│  │  で開く  │  │  キルを  │      │
│  └──────────┘  └──────────┘  └──────────┘      │
├─────────────────────────────────────────────────┤  ← 条件付き表示
│  動作確認チェック（hasExternalIntegration=true 時）│
│  ☐ {{externalToolName ?? "外部ツール"}} Webhook URL を設定する │
│  ☐ テスト実行で動作確認する                     │
└─────────────────────────────────────────────────┘
```

**Tailwind クラス方針:**

- カード: `rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`
- フィードバックボタン: `rounded-lg px-4 py-2 text-sm font-medium border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50`
- チェックリストテキスト: `truncate` クラスで長い外部ツール名の折り返しを防止

---

## Task 5: data-testid 設計

| 要素                    | data-testid                           |
| ----------------------- | ------------------------------------- |
| ルートコンテナ          | `complete-step`                       |
| 完了ヘッダー            | `complete-step-header`                |
| 👍 フィードバックボタン | `complete-step-feedback-satisfied`    |
| 👎 フィードバックボタン | `complete-step-feedback-unsatisfied`  |
| 今すぐ実行カード        | `complete-step-action-execute`        |
| エディタで開くカード    | `complete-step-action-open-editor`    |
| 別のスキルを作るカード  | `complete-step-action-create-another` |
| 外部連携チェックリスト  | `complete-step-external-checklist`    |
| Webhook 設定チェック    | `complete-step-check-webhook`         |
| テスト実行チェック      | `complete-step-check-test-run`        |

---

## Task 6: リカバリーフロー設計

```
👎 クリック
  ↓
feedbackSubmitted = false の場合のみ実行
  ↓
setFeedbackSubmitted(true)   ← 二重送信防止
  ↓
onQualityFeedback(false)     ← 親への通知
  ↓
onRetry?.()                  ← Step 0 復帰トリガー（SkillCreateWizard 側で処理）
```

**責務境界:**
| 責務 | 担当 |
| ---------------------------------- | ------------ |
| 👎 クリック時に `onRetry()` を呼び出す | CompleteStep |
| Step 0 へのナビゲーション | W2-seq-03a |
| 前回 formData のプリフィル状態管理 | W2-seq-03a |
| 生成結果コンテキストの再表示・復元 | W2-seq-03a |

---

## 完了確認

- [x] コンポーネント構造が定義されている
- [x] Props インターフェースが確定している
- [x] 内部状態が設計されている
- [x] レイアウトが定義されている
- [x] data-testid 一覧が定義されている
- [x] リカバリーフローのシーケンスが定義されている
- [x] 本 Phase 内の全タスクを 100% 実行完了
