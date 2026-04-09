# Phase 10 成果物: AC 検証記録

## 確認日: 2026-04-09

## AC-01: Q1〜Q6 で複数のボタンを同時に選択できる

**証拠**: `handleOptionSelect` の追加ロジック（スプレッド演算子）

```typescript
const nextSelectedOptions = isSelected
  ? current.filter((o) => o !== option) // 解除
  : [...current, option]; // 追加（複数選択）
```

**テスト**: TC-U-02（2ボタン選択）、TC-U-05（3ボタン選択）→ 全通過

---

## AC-02: 選択済みボタンを再クリックすると選択が解除される

**証拠**: `handleOptionSelect` の `filter` ロジック

```typescript
const isSelected = current.includes(option);
const nextSelectedOptions = isSelected
  ? current.filter((o) => o !== option) // 選択解除
  : ...
```

**テスト**: TC-U-03（トグル解除）、FP-02 → 全通過

---

## AC-03: selectedOptions が空の状態から開始する

**証拠**: `createEmptyAnswers()` と `DEFAULT_ANSWERS`

```typescript
// ConversationRoundStep.tsx
{ selectedOptions: [], freeText: "" }

// SkillCreateWizard.tsx
q1: { selectedOptions: [], freeText: "" }
// ...q2〜q6 も同様
```

**テスト**: FP-01（初期状態バッジ非表示）→ 通過

---

## AC-04: Q3「定期実行」選択で ScheduleConfigInput が展開される

**証拠**: renderQuestion 内の展開条件

```typescript
{key === "q3" && selectedOptions.includes("定期実行") && (
  <ScheduleConfigInput ... />
)}
```

**テスト**: TC-U-08、FP-04 → 通過

---

## AC-05: Q3「定期実行」解除で ScheduleConfigInput が閉じる

**証拠**: handleOptionSelect の Q3 特殊処理

```typescript
if (key === "q3") {
  const hasSchedule = nextSelectedOptions.includes("定期実行");
  next.q3 = { ...next.q3, scheduleConfig: hasSchedule ? ... : undefined };
}
```

**テスト**: TC-U-09（再クリック解除）、FP-05 → 通過

---

## AC-06: Q3「定期実行」+他選択肢でも ScheduleConfigInput が展開維持

**証拠**: AC-04 と同じ `includes("定期実行")` 判定（他の selectedOptions 要素に依存しない）

**テスト**: FP-06（再選択で scheduleConfig 復元）、TC-U-12 → 通過

---

## AC-07: SmartDefaults で選択肢一致値が selectedOptions: [value] になる

**証拠**: `createQuestionAnswer`

```typescript
if (options.includes(defaultValue as QuestionOption)) {
  return { selectedOptions: [defaultValue], freeText: "" };
}
```

**テスト**: TC-U-13（smartDefaults 適用）→ 通過

---

## AC-08: SmartDefaults で選択肢不一致値が freeText に入る

**証拠**: `createQuestionAnswer` の else ブランチ

```typescript
return { selectedOptions: [], freeText: defaultValue };
```

**テスト**: TC-U-14 → 通過

---

## AC-09: aria-pressed が選択状態に応じて true/false を返す

**証拠**: renderQuestion 内のボタン属性

```typescript
<button aria-pressed={selectedOptions.includes(opt)}>
```

**テスト**: A11Y-03（複数選択後 aria-pressed=true）、A11Y-04（解除後 false）→ 通過

---

## AC-10: ApplySummaryCard の未回答判定と SmartDefault 表示

**証拠**: `getUnansweredDefaults` と `isQ5Unanswered`

```typescript
const isUnanswered =
  answer.selectedOptions.length === 0 && answer.freeText.trim() === "";
const isQ5Unanswered =
  answers.q5.selectedOptions.length === 0 && answers.q5.freeText.trim() === "";
```

**テスト**: TC-U-21、TC-U-22 → 通過

---

## AC-11: TypeScript コンパイルエラー 0 件

**証拠**: Phase 9 typecheck 結果

- `pnpm --filter @repo/shared typecheck`: 0エラー
- `pnpm --filter @repo/desktop typecheck`: 0エラー

---

## AC-12: ESLint エラー 0 件

**証拠**: Phase 9 lint 結果

- `pnpm lint`: 0エラー（auto-lint.sh により各 Edit 後に自動実行済み）

---

## AC-13: resolveExternalIntegration が selectedOptions[0] を正しく参照

**証拠**: SkillCreateWizard.tsx line 209

```typescript
// 複数選択時は先頭値を主ツールとして参照する。
// 複数ツールの並列統合対応は別タスクのスコープ。
const selected = (q5Answer.selectedOptions[0] ?? "").trim();
```

**テスト**: TC-I-01、TC-I-02（resolveExternalIntegration）→ 通過
