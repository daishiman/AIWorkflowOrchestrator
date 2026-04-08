# CompleteStep 完了画面再設計 実装ガイド

タスクID: UT-SKILL-WIZARD-W1-COMPLETE-STEP-001
作成日: 2026-04-08

---

## Part 1

### なぜ必要か

スキルが生成された後、ユーザーは「次に何をすればいいか」を判断する必要があります。
以前の完了画面は「閉じる」ボタン 1 つだけで、ユーザーが次の行動を自分で考えなければなりませんでした。
また、生成結果が期待と違った場合でも、やり直す手段がなく、不満を抱えたまま終了するしかありませんでした。
これを改善するために、完了画面を「次の行動の起点画面」として再設計しました。

### 何をするか

`CompleteStep` コンポーネントに以下を追加しました。

1. **完了ヘッダー**: 「✓ スキルの骨格を生成しました」（骨格=完全動作ではない旨を明示）
2. **品質フィードバック**: 「この骨格は期待通りでしたか？」 👍/👎 ボタン
3. **ネクストアクション 3 カード**: 今すぐ実行・エディタで開く・別のスキルを作る
4. **リカバリーフロー**: 👎 クリックで Step 0 に戻れる（やり直しフロー）
5. **外部連携チェックリスト**: Slack 等の外部連携がある場合のみ表示

### 日常の例え

たとえば、料理が完成したときのことを考えてみてください。
料理人が「できました！」と言うだけでなく、「おいしかったですか？」と聞いたり、「次はこのレシピを保存しますか？他の人に教えますか？」と提案してくれると、食べた人はすぐ次の行動に移れます。
もし「ちょっとイメージと違う」なら、「では最初からやり直しましょうか？」と提案してくれると安心ですよね。
CompleteStep の再設計は、まさにこの「料理人の気配り」を UI に組み込んだものです。

### 今回作ったもの

| 成果物              | パス                                                                                | 説明                             |
| ------------------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| CompleteStep 実装   | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                | 起点画面化した完了コンポーネント |
| CompleteStep テスト | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` | 36 件の自動テスト                |
| スナップショット    | `__tests__/__snapshots__/CompleteStep.test.tsx.snap`                                | UI スナップショット              |
| Phase 11 UI証跡     | `docs/30-workflows/W1-par-02c-complete-step-2/outputs/phase-11/screenshots/`        | TC-01〜TC-09 を同期              |

### Phase 11 の視覚証跡

Phase 11 の実画面検証では、以下の証跡を `outputs/phase-11/` に保存しています。

- `screenshots/TC-05-step3-complete-dark.png`（標準完了状態）
- `screenshots/TC-07-step3-complete-light.png`（ライトテーマ）
- `screenshots/TC-08-step3-complete-mobile-dark.png`（モバイル幅）
- `screenshots/TC-09-step3-complete-external-checklist-light.png`（外部連携チェックリスト）
- `screenshot-plan.json`（撮影計画）
- `phase11-capture-metadata.json`（撮影メタデータ）

---

## Part 2

### 型定義

```typescript
export interface GeneratedSkill {
  path?: string;
  name?: string;
}

export interface CompleteStepProps {
  /** 親から受け取る生成結果コンテキスト。CompleteStep は表示文言を変えない */
  generatedSkill: GeneratedSkill | null;
  hasExternalIntegration: boolean;
  externalToolName?: string;
  onExecuteNow?: () => void;
  onOpenInEditor?: () => void;
  onCreateAnother?: () => void;
  /** フィードバック受信（必須）。satisfied=true:👍, false:👎 */
  onQualityFeedback: (satisfied: boolean) => void;
  /** リカバリーフロー用: Step 0 への復帰トリガー。プリフィルは W2-seq-03a が担当 */
  onRetry?: () => void;
}
```

### APIシグネチャ

```typescript
// CompleteStep のエントリーポイント
export const CompleteStep: React.FC<CompleteStepProps>;

// 内部ハンドラ（useCallback でメモ化）
const handleSatisfied: () => void; // 👍クリック → onQualityFeedback(true)
const handleUnsatisfied: () => void; // 👎クリック → onQualityFeedback(false) + onRetry?.()
```

### 使用例

```tsx
<CompleteStep
  generatedSkill={generatedSkill}
  hasExternalIntegration={skill.hasSlackIntegration}
  externalToolName="Slack"
  onQualityFeedback={(satisfied) => {
    trackEvent("skill_quality_feedback", { satisfied });
  }}
  onRetry={() => setCurrentStep(0)}
  onExecuteNow={() => executeSkill(generatedSkill)}
  onOpenInEditor={() => openInEditor(generatedSkill?.path)}
  onCreateAnother={() => {
    resetWizard();
    setCurrentStep(0);
  }}
/>
```

### エラーハンドリング

| ケース                           | 動作                                           |
| -------------------------------- | ---------------------------------------------- |
| `generatedSkill === null`        | 表示文言は変わらない（HEADER_MESSAGE 固定）    |
| `onExecuteNow === undefined`     | カードが `disabled` + `aria-disabled="true"`   |
| `onOpenInEditor === undefined`   | カードが `disabled` + `aria-disabled="true"`   |
| `onCreateAnother === undefined`  | カードが `disabled` + `aria-disabled="true"`   |
| `onRetry === undefined`          | 👎クリック時にエラーなし（optional chaining）  |
| `externalToolName === undefined` | 「外部ツール」がフォールバック表示             |
| フィードバック二重クリック       | `feedbackSubmitted` フラグで防止（disabled化） |

### エッジケース

| ケース                                       | 対応                                                     |
| -------------------------------------------- | -------------------------------------------------------- |
| `generatedSkill=null` での初期表示           | Props に `generatedSkill` を渡さなくてもクラッシュしない |
| 非常に長い `externalToolName`                | `truncate` クラスで折り返し防止                          |
| 全 optional Props が undefined               | クラッシュなし・カードが disabled 状態                   |
| リカバリーフロー後に再度 CompleteStep に戻る | `feedbackSubmitted` はマウント時 false（state リセット） |

### 設定項目と定数一覧

| 定数名                  | 値                                                                       | 説明                         |
| ----------------------- | ------------------------------------------------------------------------ | ---------------------------- |
| `HEADER_MESSAGE`        | `"スキルの骨格を生成しました"`                                           | 完了ヘッダーテキスト（固定） |
| `HEADER_SUB_MESSAGE`    | `"※ これは骨格です。完全に動作するまでには設定が必要な場合があります。"` | サブテキスト（固定）         |
| `styles.card`           | Tailwind クラス文字列                                                    | カードスタイル（定数化）     |
| `styles.feedbackButton` | Tailwind クラス文字列                                                    | フィードバックボタンスタイル |
| `nextActions`           | 3 要素の `as const` 配列                                                 | カード定義（map で描画）     |

### テスト構成

| カテゴリ           | 件数   | 主要テスト内容                                |
| ------------------ | ------ | --------------------------------------------- |
| 基本レンダリング   | 6      | ヘッダー・ボタン・カード・null generatedSkill |
| 品質フィードバック | 5      | 👍/👎 コールバック・二重送信防止              |
| ネクストアクション | 7      | 各カードクリック・disabled 状態               |
| 外部連携チェック   | 4      | 条件付き表示・チェックボックストグル          |
| エッジケース       | 5      | null/undefined Props・長文ツール名            |
| 統合シナリオ       | 3      | リカバリーフロー・チェック完了・順序操作      |
| アクセシビリティ   | 4      | role/aria-label/aria-disabled/aria-checked    |
| スナップショット   | 2      | 標準・外部連携あり                            |
| **合計**           | **36** |                                               |

テスト実行コマンド:

```bash
pnpm vitest run src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx
```

カバレッジ: Statements 100% / Branches 85.71% / Functions 100% / Lines 100%
