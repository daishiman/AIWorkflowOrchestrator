# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 8                                         |
| Phase名    | リファクタリング                          |
| タスクID   | UT-SKILL-WIZARD-W1-COMPLETE-STEP-001      |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | Phase 7: カバレッジ確認                   |
| 次Phase    | Phase 9: QA                               |
| ステータス | pending                                   |
| 作成日     | 2026-04-07                                |

## 目的

実装済みの CompleteStep.tsx をコードの可読性・保守性・パフォーマンスの観点でリファクタリングし、品質を向上させる。

## 実行タスク

### Task 1: コード重複の除去

ネクストアクションカードの実装にコード重複がある場合、共通コンポーネントまたはヘルパーに抽出する。

```typescript
// リファクタリング前（重複あり）
<button data-testid="complete-step-action-execute" disabled={!onExecuteNow} onClick={() => onExecuteNow?.()} ...>
<button data-testid="complete-step-action-open-editor" disabled={!onOpenInEditor} onClick={() => onOpenInEditor?.()} ...>
<button data-testid="complete-step-action-create-another" disabled={!onCreateAnother} onClick={() => onCreateAnother?.()} ...>

// リファクタリング後（配列 + map）
const nextActions = [
  { testId: "complete-step-action-execute", label: "今すぐ実行する", icon: "▶", handler: onExecuteNow },
  { testId: "complete-step-action-open-editor", label: "エディタで開く", icon: "✏", handler: onOpenInEditor },
  { testId: "complete-step-action-create-another", label: "別のスキルを作る", icon: "＋", handler: onCreateAnother },
];
```

### Task 2: スタイル定数の抽出

インラインスタイルやクラス名が長い場合、定数として抽出する。

```typescript
const styles = {
  card: "rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  feedbackButton:
    "rounded-lg px-4 py-2 text-sm font-medium border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50",
  header: "text-xl font-semibold text-[var(--text-primary)]",
  subText: "text-sm text-[var(--text-secondary)] mt-1",
};
```

### Task 3: useCallback による最適化

フィードバックハンドラを `useCallback` でメモ化する。

```typescript
const handleSatisfied = useCallback(() => {
  if (feedbackSubmitted) return;
  setFeedbackSubmitted(true);
  onQualityFeedback(true);
}, [feedbackSubmitted, onQualityFeedback]);

const handleUnsatisfied = useCallback(() => {
  if (feedbackSubmitted) return;
  setFeedbackSubmitted(true);
  onQualityFeedback(false);
  onRetry?.();
}, [feedbackSubmitted, onQualityFeedback, onRetry]);
```

### Task 4: 表示メッセージの固定化

```typescript
const headerMessage = "スキルの骨格を生成しました";
```

`generatedSkill` は CompleteStep の表示文言を変えず、親側のコンテキストとしてのみ扱う。

### Task 5: リファクタリング後のテスト実行

```bash
# リファクタリング後に全テストがpassすることを確認
pnpm --filter @repo/desktop vitest run -- CompleteStep
```

### Task 6: 型チェック

```bash
pnpm --filter @repo/desktop tsc --noEmit
```

## 参照資料

| 資料名         | パス                                                                                | 説明                 |
| -------------- | ----------------------------------------------------------------------------------- | -------------------- |
| 実装ファイル   | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                | リファクタリング対象 |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` | 動作検証用           |

## 成果物

| 成果物               | パス                                                                 | 説明                   |
| -------------------- | -------------------------------------------------------------------- | ---------------------- |
| リファクタリング済み | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | 改善後ファイル         |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                                 | 変更内容・改善点の記録 |

## 完了条件

- [ ] コード重複が除去されている
- [ ] スタイル定数が抽出されている
- [ ] useCallbackによる最適化が適用されている
- [ ] 型安全性が向上している
- [ ] リファクタリング後も全テストがpassしている
- [ ] 型チェックが通過している
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 9: QA](./phase-9-qa.md)
