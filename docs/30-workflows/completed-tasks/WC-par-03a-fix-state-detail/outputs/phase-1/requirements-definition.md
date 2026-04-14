# 要件定義書 — TASK-SW-FIX-STATE-DETAIL-001

## 1. 問題の固定

### 問題12: internalAnswers 状態残留

**発生箇所**: `ConversationRoundStep.tsx`

**事実**: `useEffect` の依存配列が `[internalAnswers, onAnswersChange]` のみであり、`answers` prop の変化を監視していない。
コンポーネントの `useState` 初期化関数は初回マウント時に1度しか実行されないため、
親から `answers` に空値が渡された場合でも `internalAnswers` は前回値を保持したまま残留する。

**影響**: リトライ時（`resetGeneratedState` → `setAnswers(DEFAULT_ANSWERS)`）にStep 1が再マウントされずに
`answers` prop が更新されるケースで前回の回答が表示され続ける。

---

### 問題13: templateモードのリカバリーパス欠如

**発生箇所**: `GenerateStep.tsx`

**事実**: `showCancelButton = isActive && !(onCancelPlan && showPlanControls)` の条件により、
`stage === "error"` の場合は `isActive = false` となりキャンセルボタンが非表示になる。
templateモード（`isTemplateMode=true`）でエラーが発生した場合、Step 0 に戻るUIが存在しない。

**影響**: templateモードのエラー後にユーザーがウィザードを先へも後へも進められなくなる。

---

### 問題18: resolveExternalIntegration 再計算なし

**発生箇所**: `SkillCreateWizard.tsx`

**事実**: `resolveExternalIntegration` は `handleStep0Next` と `handleGenerate` の中でしか呼ばれない。
Step 1 で q5 を変更した後、`handleGenerate` が呼ばれるまで `hasExternalIntegration` と
`externalToolName` は古い値のまま残留する。
`handleGenerate` の try ブロック内でのみ state を更新しているため、生成失敗時も古い値が残る。

**影響**: Step 3（CompleteStep）に表示される外部連携情報が q5 の最新値と一致しない可能性がある。

---

### 問題19: generationLockRef キャンセル競合状態

**発生箇所**: `SkillCreateWizard.tsx`

**事実**: `handleGenerate` の finally 節が以下の条件付きリセットになっている:

```typescript
} finally {
  if (requestId === generationRequestIdRef.current) {
    setIsGenerating(false);
    generationLockRef.current = false;
  }
}
```

キャンセル時に `invalidateGenerationRequests()` でカウンターが加算され
`requestId !== generationRequestIdRef.current` となった場合、
finally 節が `generationLockRef.current = false` を実行しない。
`resetGeneratedState` は `generationLockRef.current = false` を実行するが、
非同期処理の完了タイミングによっては finally 節がこれを上書きできないケースが潜在的に存在する。

**影響**: キャンセル後に `generationLockRef.current = true` のまま残留し、
次の生成操作が `if (generationLockRef.current ...) return;` でガードされて実行不能になる。

---

## 2. 受入条件（AC-1〜AC-5）

| ID   | 条件                                                                              | 検証方法       |
| ---- | --------------------------------------------------------------------------------- | -------------- |
| AC-1 | リトライ時に `ConversationRoundStep` の `internalAnswers` が空値にリセットされる  | ユニットテスト |
| AC-2 | templateモードのエラー時にキャンセルボタンが表示され、Step 0 に戻れる             | ユニットテスト |
| AC-3 | q5 変更後に `hasExternalIntegration` と `externalToolName` が最新値で再計算される | ユニットテスト |
| AC-4 | `generationLockRef` がキャンセル後に正しく `false` に戻り、次の生成操作が可能     | ユニットテスト |
| AC-5 | 既存の正常フロー（リトライなし・キャンセルなし）に回帰影響がない                  | 回帰テスト     |

---

## 3. スコープ境界

### 含む

- `ConversationRoundStep.tsx` — useEffect 依存配列修正 + internalAnswers リセット
- `GenerateStep.tsx` — templateモードエラー時のキャンセルボタン追加
- `SkillCreateWizard.tsx` — resolveExternalIntegration 再計算 + generationLockRef finally 節修正
- 上記3ファイルに対応するユニットテスト

### 含まない

- Step 0〜Step 1 以外のウィザードフロー変更
- Main Process 実装修正
- IPC 契約変更
- PR 作成（コミット・プッシュ含む）
