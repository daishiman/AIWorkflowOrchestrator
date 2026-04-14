# 設計書 — TASK-SW-FIX-STATE-DETAIL-001

## 1. 問題12設計 — internalAnswers リセット

### 対象ファイル

`apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

### 修正方針

`answers` prop が変化したとき（リトライ時に空値が渡されたとき）に `internalAnswers` をリセットする
新しい `useEffect` を追加する。

### 設計詳細

```typescript
// 追加するuseEffect（既存のuseEffectの後に配置）
useEffect(() => {
  // answers が空値（リトライによるリセット）に変化した場合に internalAnswers をリセット
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

### 設計判断

- **全問空値チェック**: `allEmpty` 判定により、通常フロー（onAnswersChange → setAnswers による親更新）では
  非空の answers が返るためリセットは発火しない。リトライ時のみ `DEFAULT_ANSWERS`（全空）が渡されるため発火する。
- **依存配列の最小化**: `answers` のみを依存配列に追加。`smartDefaults` は含めない（q5 変更検知は問題18で別途対応）。
- **無限ループ対策**: `allEmpty` チェックにより、`createEmptyAnswers()` 呼び出し後に
  `onAnswersChange(empty)` → `setAnswers(empty)` → 再発火してもループしない
  （再発火時も `allEmpty=true` だが、`setInternalAnswers(createEmptyAnswers())` は
  同一構造のため React が bail-out するか、コンポーネントが unmount 済みである）。

### 既存ロジックとの競合確認

- 既存 `useEffect([internalAnswers, onAnswersChange])`: 変更なし
- `useState` 初期化関数: 変更なし（マウント時の初期化は維持）

---

## 2. 問題13設計 — templateモードキャンセルボタン

### 対象ファイル

`apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`

### 修正方針

`GenerateStepProps` に `isTemplateMode?: boolean` を追加し、
`isTemplateMode && error` の条件でキャンセルボタンを表示する。

### 設計詳細

**Props 追加:**

```typescript
export interface GenerateStepProps {
  // ... 既存props ...
  isTemplateMode?: boolean; // 追加
}
```

**エラー表示ブロックの後にキャンセルボタン追加:**

```typescript
{/* Template mode cancel button (問題13修正) */}
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

### 設計判断

- **配置位置**: エラーカード表示（`renderErrorCard`）の直後
- **条件**: `isTemplateMode && error && onCancel` — templateモード・エラー・コールバック存在の3条件
- **通常モードへの非影響**: `isTemplateMode` はデフォルト `false`（undefined）なので既存ケースに変化なし
- **ボタン名**: 既存 Cancel ボタンと同じ「キャンセル」テキストを使用

### 呼び出し元（SkillCreateWizard）での利用

`SkillCreateWizard` が `GenerateStep` に `isTemplateMode` を渡す。
現行の `onCancel={handleCancelGeneration}` が Step 0 に戻るため、
新しいプロップの追加のみで動作する。

---

## 3. 問題18設計 — resolveExternalIntegration 再計算

### 対象ファイル

`apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

### 修正方針

`answers.q5` の変化を検知する `useEffect` を追加し、`resolveExternalIntegration` を再計算する。

### 設計詳細

```typescript
// 追加するuseEffect（問題18修正: q5変更時の再計算）
useEffect(() => {
  const defaults = smartDefaults ?? inferSmartDefaults(formData);
  const integration = resolveExternalIntegration(answers.q5, defaults.tool);
  setHasExternalIntegration(integration.hasExternalIntegration);
  setExternalToolName(integration.externalToolName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [answers.q5]);
```

### 設計判断

- **依存配列**: `answers.q5` のみ。`handleOptionSelect` 等でq5以外の質問が変わる場合、
  spread パターン (`{ ...prev, [key]: ... }`) により q5 の参照は変わらないため、
  q5以外の変更では発火しない（TC-07 対応）。
- **useEffect vs イベントハンドラー**: useEffect を選択。
  `onAnswersChange` は全問の更新をまとめて受け取るため、q5変化の検知はuseEffectが適切。
- **初期計算との整合**: `handleStep0Next` での計算と同じロジックを再利用。

---

## 4. 問題19設計 — generationLockRef キャンセル競合修正

### 対象ファイル

`apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

### 修正方針

finally 節で `generationLockRef.current = false` を **無条件に** 実行するよう変更する。
`setIsGenerating(false)` のみ `requestId` チェックで保護する。

### 設計詳細

**変更前:**

```typescript
} finally {
  if (requestId === generationRequestIdRef.current) {
    setIsGenerating(false);
    generationLockRef.current = false;
  }
}
```

**変更後:**

```typescript
} finally {
  generationLockRef.current = false; // 常にロックを解放（問題19修正）
  if (requestId === generationRequestIdRef.current) {
    setIsGenerating(false);
  }
}
```

### 設計判断

- **3経路での保証**:
  - 正常完了: `requestId === current` → `setIsGenerating(false)` + lock解放 ✓
  - エラー: 同上 ✓
  - キャンセル: `requestId !== current` → lock解放のみ（`setIsGenerating(false)` は `resetGeneratedState` が担当） ✓
- **resetGeneratedState との関係**: `resetGeneratedState` も `generationLockRef.current = false` を実行するが冗長ではなく、
  非同期処理完了後に確実にリセットするための二重保証として機能する。
- **setIsGenerating の保護**: 新規生成開始後に古いリクエストの finally が `setIsGenerating(false)` を
  上書きしないよう `requestId` チェックを維持する。
