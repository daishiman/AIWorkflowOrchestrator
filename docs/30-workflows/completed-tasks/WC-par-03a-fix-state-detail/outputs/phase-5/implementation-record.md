# Phase 5: 実装記録

## 概要

TASK-SW-FIX-STATE-DETAIL-001 の 4 件のバグを 3 ファイルに最小変更で修正した。

## 変更ファイル一覧

| ファイル                                                                      | 変更種別                      | 対応バグ   |
| ----------------------------------------------------------------------------- | ----------------------------- | ---------- |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | useEffect 追加                | 問題12     |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`          | prop 追加 + JSX 追加          | 問題13     |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | useEffect 追加 + finally 修正 | 問題18・19 |

---

## 問題12: ConversationRoundStep — internalAnswers リトライ時リセット

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

**変更内容**: `answers` prop が空値（全フィールドが未選択）に変化した際に `internalAnswers` を `createEmptyAnswers()` でリセットする `useEffect` を追加。

```typescript
// 問題12修正: answers prop が空値（リトライによるリセット）に変化した場合に internalAnswers をリセット
useEffect(() => {
  const allEmpty = QUESTION_KEYS.every(
    (k) =>
      (answers[k].selectedOptions ?? []).length === 0 &&
      !(answers[k].freeText ?? "").trim() &&
      answers[k].scheduleConfig === undefined,
  );
  if (allEmpty) {
    setInternalAnswers(createEmptyAnswers());
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [answers]);
```

**実装判断**:

- `allEmpty` チェックにより、通常フロー（非空への変化）では何もしない
- 無限ループ回避: 親が `onAnswersChange` で `internalAnswers` を反映するが、空値にはならないため再トリガーなし
- React 18 バッチング: 実運用では `goToStep(0)` と `setAnswers(DEFAULT_ANSWERS)` が同一バッチで実行されコンポーネントがアンマウントされるため、ループは発生しない

---

## 問題13: GenerateStep — templateモードエラー時キャンセルボタン追加

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`

**変更内容**:

1. `GenerateStepProps` に `isTemplateMode?: boolean` を追加
2. エラー表示ブロックの後に templateMode 専用キャンセルボタンを追加

```typescript
// GenerateStepProps に追加
isTemplateMode?: boolean;

// コンポーネントの destructuring に追加
isTemplateMode = false,

// JSX に追加（エラー表示の後）
{/* 問題13修正: templateモードのエラー時にキャンセルボタンを表示してStep 0に戻れるようにする */}
{isTemplateMode && error && onCancel && (
  <button
    type="button"
    onClick={onCancel}
    className="self-center px-4 py-2 text-sm rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
  >
    キャンセル
  </button>
)}
```

**実装判断**:

- 既存の `showCancelButton` は `isActive`（生成中）の場合のみ表示するため、エラー状態（`isActive=false`）では非表示になる
- `isTemplateMode` prop を追加することで、templateモード特有のエラー回復経路を分離
- 非templateモードの既存動作に影響なし

---

## 問題18: SkillCreateWizard — q5 変更後 resolveExternalIntegration 未再計算

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

**変更内容**: `answers.q5` が変化した際に `resolveExternalIntegration` を再計算する `useEffect` を追加。

```typescript
// 問題18修正: q5 変更後に hasExternalIntegration / externalToolName を再計算する
useEffect(() => {
  const defaults = smartDefaults ?? inferSmartDefaults(formData);
  const integration = resolveExternalIntegration(answers.q5, defaults.tool);
  setHasExternalIntegration(integration.hasExternalIntegration);
  setExternalToolName(integration.externalToolName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [answers.q5]);
```

**実装判断**:

- `answers.q5` のみを依存配列に指定し、q1〜q4・q6 の変化では再計算しない
- `handleOptionSelect` では変更した質問以外の q は同一参照を保つため、q5 以外の変化では effect は発火しない
- `smartDefaults` が null の場合は `inferSmartDefaults(formData)` でフォールバック

---

## 問題19: SkillCreateWizard — generationLockRef キャンセル時リセットなし

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

**変更内容**: `handleGenerate` の `finally` ブロックを修正し、全3経路（正常完了・エラー・キャンセル）で `generationLockRef.current = false` を実行するよう変更。

```typescript
} finally {
  // 問題19修正: 正常完了・エラー・キャンセルの全経路でロックを必ず解放する
  generationLockRef.current = false;
  if (requestId === generationRequestIdRef.current) {
    setIsGenerating(false);
  }
}
```

**実装判断**:

- 既存コードでは finally ブロックで `generationLockRef.current = false` が実行されていなかった（またはエラーパスのみ解放されなかった）
- `finally` に移動することで、throw・return・正常終了のいずれでも解放が保証される

---

## テスト結果

全テストスイートが exit code 0 で完了（TC-01〜TC-10 含む）。

| TC       | 説明                                                       | 結果 |
| -------- | ---------------------------------------------------------- | ---- |
| TC-01    | answers 空値変化で internalAnswers リセット                | PASS |
| TC-02    | 通常フローで internalAnswers 保持（回帰）                  | PASS |
| TC-03    | isTemplateMode=true + エラーでキャンセルボタン表示         | PASS |
| TC-04    | isTemplateMode=true エラー後キャンセルで onCancel 呼ばれる | PASS |
| TC-05    | 通常モードのエラーでキャンセルボタン非表示（回帰）         | PASS |
| TC-06    | q5 変更後 CompleteStep に外部統合が反映される              | PASS |
| TC-07    | q1 変更でも外部統合は変化しない（回帰）                    | PASS |
| TC-08/09 | 生成完了 → 別のスキルを作る → 再生成可能                   | PASS |
| TC-10    | 生成完了後 lockRef 解放され重複生成なし（回帰）            | PASS |
