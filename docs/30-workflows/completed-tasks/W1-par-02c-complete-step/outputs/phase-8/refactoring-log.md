# Phase 8 成果物: リファクタリング仕様

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 8                                         |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 作成日     | 2026-04-08                                |
| ステータス | pending（Phase 7 完了後に実行）           |

---

## リファクタリング項目一覧

### Item 1: NextActionCards のコード重複除去

**Before（重複あり）:**

```tsx
<button data-testid="complete-step-action-execute" disabled={!onExecuteNow} onClick={() => onExecuteNow?.()} ...>
<button data-testid="complete-step-action-open-editor" disabled={!onOpenInEditor} onClick={() => onOpenInEditor?.()} ...>
<button data-testid="complete-step-action-create-another" disabled={!onCreateAnother} onClick={() => onCreateAnother?.()} ...>
```

**After（配列 + map）:**

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

**効果:** JSX 重複排除、カード追加時の変更箇所が 1 箇所に集約される。

---

### Item 2: スタイル定数の抽出

```typescript
const styles = {
  card: "rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  feedbackButton:
    "rounded-lg px-4 py-2 text-sm font-medium border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50",
  header: "text-xl font-semibold text-[var(--text-primary)]",
  subText: "text-sm text-[var(--text-secondary)] mt-1",
} as const;
```

**効果:** Tailwind クラス文字列の重複排除、デザイントークン変更時の修正箇所が 1 箇所に集約される。

---

### Item 3: `useCallback` による最適化

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

**効果:** 親コンポーネントの再レンダリング時にハンドラ参照が安定し、不要な子コンポーネント再レンダリングを防止する。

---

### Item 4: 表示メッセージの定数化

```typescript
const HEADER_MESSAGE = "スキルの骨格を生成しました" as const;
const HEADER_SUB_MESSAGE =
  "※ これは骨格です。完全に動作するまでには設定が必要な場合があります。" as const;
```

**効果:** `generatedSkill` が表示文言を変えない設計を定数で明示する。誤って `generatedSkill.name` 等を表示文言に使うリスクを排除。

---

## リファクタリング後の検証コマンド

```bash
# テスト全件 pass 確認
pnpm --filter @repo/desktop vitest run -- CompleteStep

# 型チェック
pnpm --filter @repo/desktop tsc --noEmit

# Lint
pnpm --filter @repo/desktop eslint apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx
```

---

## 変更記録（実装後に記入）

| Item | 変更前行数 | 変更後行数 | 備考                   |
| ---- | ---------- | ---------- | ---------------------- |
| 1    | -          | -          | NextActionCards map 化 |
| 2    | -          | -          | styles 定数抽出        |
| 3    | -          | -          | useCallback 適用       |
| 4    | -          | -          | メッセージ定数化       |

---

## 完了確認（Phase 7 完了後に更新）

- [ ] コード重複が除去されている
- [ ] スタイル定数が抽出されている
- [ ] `useCallback` による最適化が適用されている
- [ ] 型安全性が向上している
- [ ] リファクタリング後も全テストが pass している
- [ ] 型チェックが通過している
- [ ] 本 Phase 内の全タスクを 100% 実行完了
