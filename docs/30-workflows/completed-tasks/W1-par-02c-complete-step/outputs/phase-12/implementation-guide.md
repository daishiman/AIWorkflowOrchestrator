# Phase 12 成果物: 実装ガイド

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 作成日     | 2026-04-08                                |
| ステータス | completed                                 |

---

## Part 1: 中学生レベルの概念説明

### なぜ必要か

料理が完成したとき、「できあがり！」と言うだけでなく、「おいしかった？」と聞いたり、「次はこのレシピどうする？保存する？他の人に教える？」と提案したりしますよね。それが今回の改修の目的です。

以前の「スキル完了画面」は、「スキルが作られたよ」という一言と「閉じる」ボタンだけでした。ユーザーはその後どうすればいいか分からず、せっかく作ったスキルを活かせないことがありました。

### 何をするか

CompleteStep（完了画面）を「スキル作成の起点画面」として作り直します。具体的には次の 4 つを追加します:

1. **完了ヘッダー** — 「✓ スキルの骨格を生成しました」と明示する
2. **品質フィードバック** — 「期待通りでしたか？」と 👍/👎 ボタンで聞く
3. **ネクストアクション 3 カード** — 「今すぐ実行」「エディタで開く」「別のスキルを作る」の 3 択を提示する
4. **リカバリーフロー** — 「イメージと違う」場合に最初の入力画面に戻れる仕組み

### 日常の例え

たとえば、レストランで料理が出てきたとき、ウェイターが「お味はいかがでしたか？」と聞いてくれると、「おいしかった！」や「ちょっと違ったな」と伝えられますよね。それと同じで、スキルが生成された直後に「期待通りでしたか？」と聞くことで、ユーザーの満足度を把握できます。

もし「イメージと違う」なら、最初の入力画面（Step 0）に戻って、少し修正してもう一度試せる「リカバリーフロー」も用意しています。

### 今回作ったもの

| 項目                 | 内容                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| 改修ファイル         | `CompleteStep.tsx` / `SkillCreateWizard.tsx`                                           |
| 削除したもの         | 「スキルが作成されました」テキスト・「閉じる」ボタン・スキルパス表示                   |
| 追加したもの         | 完了ヘッダー・フィードバック・3 カード・外部連携チェックリスト                         |
| 他のファイルへの影響 | `SkillCreateWizard.tsx` が CompleteStep の新 Props を接続し、Step 0 復帰の親責務を維持 |

---

## Part 2: 技術詳細

### 型定義

```typescript
// CompleteStepProps — 完全な Props 定義
interface CompleteStepProps {
  generatedSkill: GeneratedSkill | null; // W0-seq-01 由来の型
  hasExternalIntegration: boolean;
  externalToolName?: string;
  onExecuteNow?: () => void;
  onOpenInEditor?: () => void;
  onCreateAnother?: () => void;
  onQualityFeedback: (satisfied: boolean) => void; // 必須
  onRetry?: () => void;
}

// 内部状態
// feedbackSubmitted: boolean — 二重送信防止フラグ
// webhookChecked: boolean   — Webhook チェック状態
// testRunChecked: boolean   — テスト実行チェック状態
```

### APIシグネチャ

```typescript
export const CompleteStep: React.FC<CompleteStepProps>;
export type { CompleteStepProps };
```

### 使用例

```tsx
// 基本使用例（外部連携なし）
<CompleteStep
  generatedSkill={generatedSkill}
  hasExternalIntegration={false}
  onQualityFeedback={(satisfied) => console.log(satisfied)}
  onExecuteNow={() => handleExecute()}
  onOpenInEditor={() => openEditor(generatedSkill?.path)}
  onCreateAnother={() => resetWizard()}
  onRetry={() => setCurrentStep(0)}
/>

// 外部連携あり
<CompleteStep
  generatedSkill={generatedSkill}
  hasExternalIntegration={true}
  externalToolName="Slack"
  onQualityFeedback={handleFeedback}
  onRetry={() => setCurrentStep(0)}
/>
```

### エラーハンドリング

| ケース                           | 挙動                                                                 |
| -------------------------------- | -------------------------------------------------------------------- |
| `generatedSkill === null`        | CompleteStep は正常に描画する（表示文言は固定のため影響なし）        |
| `onExecuteNow === undefined`     | カードを `disabled` 状態で表示（クリック不可）                       |
| `onRetry === undefined`          | 👎 クリック時に `onRetry?.()` のオプショナルチェーンで安全にスキップ |
| `externalToolName === undefined` | 「外部ツール」をデフォルト表示                                       |

### エッジケース

| ケース                              | 対応方法                                        |
| ----------------------------------- | ----------------------------------------------- |
| フィードバックの二重送信            | `feedbackSubmitted` フラグで 1 回のみ受け付ける |
| 非常に長い `externalToolName`       | `truncate` CSS クラスで折り返しを防止           |
| 全オプショナル Props が `undefined` | 各所でオプショナルチェーン (`?.`) を使用        |

### 設定項目と定数一覧

```typescript
const HEADER_MESSAGE = "スキルの骨格を生成しました" as const;
const HEADER_SUB_MESSAGE =
  "※ これは骨格です。完全に動作するまでには設定が必要な場合があります。" as const;

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

**`generatedSkill` を表示しない理由:**
`generatedSkill` は親（`SkillCreateWizard`）のオーケストレーション用コンテキストとして保持するのみ。CompleteStep はあくまで「完了通知 + 次のアクション誘導」に特化し、生成結果の詳細表示は別の責務とする。これにより CompleteStep の関心を最小化し、W2-seq-03a との境界を明確に保てる。

### テスト構成

| カテゴリ               | 件数   | Phase |
| ---------------------- | ------ | ----- |
| 基本レンダリング       | 5      | 4     |
| ネクストアクション     | 7      | 4     |
| 品質フィードバック     | 4      | 4     |
| 外部連携チェックリスト | 4      | 4     |
| エッジケース           | 5      | 6     |
| 統合シナリオ           | 3      | 6     |
| アクセシビリティ       | 4      | 6     |
| スナップショット       | 2      | 6     |
| カバレッジ補完         | 3      | 7     |
| **合計**               | **37** |       |

### Phase 11 スクリーンショット証跡

- 証跡ルート: `outputs/phase-11/screenshots/`
- スクリーンショット計画: `outputs/phase-11/screenshot-plan.json`
- キャプチャメタデータ: `outputs/phase-11/phase11-capture-metadata.json`
- 手動テスト結果: `outputs/phase-11/manual-test-result.md`

主要参照:

- `outputs/phase-11/screenshots/TC-05-step3-complete-dark.png`（CompleteStep 新UI）
- `outputs/phase-11/screenshots/TC-07-step3-complete-light.png`（ライトテーマ）
- `outputs/phase-11/screenshots/TC-08-step3-complete-mobile-dark.png`（モバイル表示）
- `outputs/phase-11/screenshots/TC-09-step3-complete-external-checklist-light.png`（外部連携チェックリスト）
