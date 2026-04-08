# Phase 2: 設計 - スキルウィザード複数選択対応

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 2                                 |
| 機能名 | skill-wizard-multi-select-options |
| 作成日 | 2026-04-08                        |

## 設計方針

### SmartDefaultResult の設計決定（重要）

**判定結果: `SmartDefaultResult` の型は変更しない（`string | null` × 6 を維持）**

| 選択肢                                                            | 変更コスト                                      | 利点               | 欠点                         |
| ----------------------------------------------------------------- | ----------------------------------------------- | ------------------ | ---------------------------- |
| A: `SmartDefaultResult` を `string[] \| null` に変更              | 高（LLMプロンプト変更・バックエンド変更が連鎖） | UI側の変換不要     | 推論ロジック全体の変更が必要 |
| B: `applySmartDefaults()` で `string → [string]` 変換（**採用**） | 低（UI層のみ）                                  | バックエンド無変更 | 変換ロジックが1箇所増える    |

**採用理由**: LLMは文脈から1つのコンテキスト値を推論するのが自然であり、複数値を返す設計にするとプロンプトエンジニアリングの変更が必要になる。UI変換（`string → [string]`）は1行で完結し、リスクが最小。

---

## Topology表（変更コンポーネント一覧）

| No.  | ファイル                                                                      | 変更種別         | 変更内容の概要                                                                |
| ---- | ----------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------- |
| T-01 | `packages/shared/src/types/skillCreator.ts`                                   | 型変更           | `QuestionAnswer.selectedOption: string \| null` → `selectedOptions: string[]` |
| T-02 | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 動作変更         | トグル選択ロジック・判定・表示・Q3特殊処理                                    |
| T-03 | `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      | 表示変更         | 未回答判定・複数値の結合表示                                                  |
| T-04 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 初期値・参照変更 | `DEFAULT_ANSWERS` / `resolveExternalIntegration`                              |
| T-05 | （テストファイル群）                                                          | テスト修正       | `selectedOption` 参照を `selectedOptions` に更新                              |

**変更なし（明示的に OUT スコープ）**:

| ファイル                                      | 理由                                    |
| --------------------------------------------- | --------------------------------------- |
| `SmartDefaultResult` 型定義                   | LLMプロンプト連鎖を避けるため           |
| `inferSmartDefaults()`                        | SmartDefaultResult の形式を変えないため |
| Step 0 / Step 2 / Step 3 コンポーネント       | `QuestionAnswer` を参照しない           |
| IPC型（`SkillCreatorUserInputSubmission` 等） | 別コンテキストのため                    |

---

## 型定義変更仕様（T-01）

### 変更前

```typescript
// packages/shared/src/types/skillCreator.ts（現行）
export interface QuestionAnswer {
  /** 4択の選択値。未選択時は null。 */
  selectedOption: string | null;
  /** 自由入力テキスト。 */
  freeText: string;
  /** Q3 の定期実行設定。 */
  scheduleConfig?: SkillWizardScheduleConfig;
}
```

### 変更後

```typescript
// packages/shared/src/types/skillCreator.ts（変更後）
export interface QuestionAnswer {
  /** 選択値のリスト。複数選択可。未選択時は空配列。 */
  selectedOptions: string[];
  /** 自由入力テキスト。 */
  freeText: string;
  /** Q3 の定期実行設定。 */
  scheduleConfig?: SkillWizardScheduleConfig;
}
```

### 変更のポイント

- `selectedOption: string | null` を廃止し `selectedOptions: string[]` に完全置換
- null チェックが不要になり、`selectedOptions.length === 0` で未選択を表現
- 既存の `freeText` と `scheduleConfig` は変更なし

---

## ConversationRoundStep 変更仕様（T-02）

### 1. `createEmptyAnswers()` の変更

```typescript
// 変更前
function createEmptyAnswers(): ConversationAnswers {
  return {
    q1: { selectedOption: null, freeText: "" },
    q2: { selectedOption: null, freeText: "" },
    q3: { selectedOption: null, freeText: "", scheduleConfig: undefined },
    q4: { selectedOption: null, freeText: "" },
    q5: { selectedOption: null, freeText: "" },
    q6: { selectedOption: null, freeText: "" },
  };
}

// 変更後
function createEmptyAnswers(): ConversationAnswers {
  return {
    q1: { selectedOptions: [], freeText: "" },
    q2: { selectedOptions: [], freeText: "" },
    q3: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
    q4: { selectedOptions: [], freeText: "" },
    q5: { selectedOptions: [], freeText: "" },
    q6: { selectedOptions: [], freeText: "" },
  };
}
```

### 2. `isQuestionAnswered()` の変更

```typescript
// 変更前
function isQuestionAnswered(answer: QuestionAnswer): boolean {
  return (
    answer.selectedOption !== null ||
    answer.freeText.trim().length > 0 ||
    answer.scheduleConfig !== undefined
  );
}

// 変更後
function isQuestionAnswered(answer: QuestionAnswer): boolean {
  return (
    answer.selectedOptions.length > 0 ||
    answer.freeText.trim().length > 0 ||
    answer.scheduleConfig !== undefined
  );
}
```

### 3. `createQuestionAnswer()` の変更（SmartDefaults変換）

```typescript
// 変更前
function createQuestionAnswer(
  defaultValue: string | null,
  options: readonly QuestionOption[],
): QuestionAnswer {
  if (!defaultValue) {
    return { selectedOption: null, freeText: "" };
  }
  if (options.includes(defaultValue as QuestionOption)) {
    return { selectedOption: defaultValue, freeText: "" };
  }
  return { selectedOption: null, freeText: defaultValue };
}

// 変更後
function createQuestionAnswer(
  defaultValue: string | null,
  options: readonly QuestionOption[],
): QuestionAnswer {
  if (!defaultValue) {
    return { selectedOptions: [], freeText: "" };
  }
  if (options.includes(defaultValue as QuestionOption)) {
    return { selectedOptions: [defaultValue], freeText: "" }; // string → [string] 変換
  }
  return { selectedOptions: [], freeText: defaultValue };
}
```

**ここが SmartDefaultResult（`string | null`）→ `selectedOptions: string[]` の変換ポイント。**
`defaultValue` が有効な選択肢であれば `[defaultValue]` の1要素配列として設定する。

### 4. `handleOptionSelect()` のトグル変更

```typescript
// 変更前（単一選択・上書き）
const handleOptionSelect = (key: QuestionKey, option: string) => {
  setInternalAnswers((prev) => {
    const next: ConversationAnswers = {
      ...prev,
      [key]: { ...prev[key], selectedOption: option },
    };
    if (key === "q3") {
      next.q3 = {
        ...next.q3,
        scheduleConfig:
          option === "定期実行"
            ? (next.q3.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG)
            : undefined,
      };
      setScheduleTouched(false);
    }
    return next;
  });
};

// 変更後（トグル方式）
const handleOptionSelect = (key: QuestionKey, option: string) => {
  setInternalAnswers((prev) => {
    const current = prev[key].selectedOptions;
    const isSelected = current.includes(option);
    const nextSelectedOptions = isSelected
      ? current.filter((o) => o !== option) // 解除
      : [...current, option]; // 追加

    const next: ConversationAnswers = {
      ...prev,
      [key]: { ...prev[key], selectedOptions: nextSelectedOptions },
    };

    if (key === "q3") {
      const hasSchedule = nextSelectedOptions.includes("定期実行");
      next.q3 = {
        ...next.q3,
        scheduleConfig: hasSchedule
          ? (next.q3.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG)
          : undefined,
      };
      if (!hasSchedule) setScheduleTouched(false);
    }

    return next;
  });
};
```

### 5. `handleCronChange()` / `handleTimezoneChange()` の変更

`selectedOption` 参照を `selectedOptions` に変更（フォールバック値の修正のみ）。

```typescript
// handleCronChange 内の変更前
selectedOption: prev.q3.selectedOption ?? "定期実行",

// 変更後（配列に「定期実行」が含まれていなければ追加）
selectedOptions: prev.q3.selectedOptions.includes("定期実行")
  ? prev.q3.selectedOptions
  : [...prev.q3.selectedOptions, "定期実行"],
```

### 6. `renderQuestion()` のレンダリング変更

```typescript
// 変更前（局所変数）
const selected = answer.selectedOption;

// 変更後
const selectedOptions = answer.selectedOptions;

// 「選択済み」バッジの条件変更
// 変更前: {selected && ( <span>選択済み</span> )}
// 変更後: {selectedOptions.length > 0 && ( <span>選択済み</span> )}

// ボタンの aria-pressed・スタイル変更
// 変更前: aria-pressed={selected === opt}
// 変更後: aria-pressed={selectedOptions.includes(opt)}

// ボタンのクラス変更
// 変更前: selected === opt ? "bg-[var(--status-primary)] ..." : "border-..."
// 変更後: selectedOptions.includes(opt) ? "bg-[var(--status-primary)] ..." : "border-..."

// Q3 スケジュール展開条件
// 変更前: {key === "q3" && selected === "定期実行" && ( ... )}
// 変更後: {key === "q3" && selectedOptions.includes("定期実行") && ( ... )}

// Q3 scheduleError の判定
// 変更前: key === "q3" && selected === "定期実行" && scheduleTouched
// 変更後: key === "q3" && selectedOptions.includes("定期実行") && scheduleTouched
```

---

## ApplySummaryCard 変更仕様（T-03）

### 1. `getUnansweredDefaults()` の変更

```typescript
// 変更前
function getUnansweredDefaults(
  answers: ConversationAnswers,
  smartDefaults: SmartDefaultResult,
): Array<{ key: QuestionKey; label: string; defaultValue: string }> {
  return QUESTION_KEYS.flatMap((key) => {
    const answer = answers[key];
    const isUnanswered =
      answer.selectedOption === null && answer.freeText.trim() === ""; // 変更箇所
    if (!isUnanswered) return [];
    const defaultValue = smartDefaults[DEFAULT_KEY_BY_QUESTION[key]];
    if (!defaultValue) return [];
    return [{ key, label: QUESTION_LABELS[key], defaultValue }];
  });
}

// 変更後
function getUnansweredDefaults(
  answers: ConversationAnswers,
  smartDefaults: SmartDefaultResult,
): Array<{ key: QuestionKey; label: string; defaultValue: string }> {
  return QUESTION_KEYS.flatMap((key) => {
    const answer = answers[key];
    const isUnanswered =
      answer.selectedOptions.length === 0 && answer.freeText.trim() === ""; // 変更箇所
    if (!isUnanswered) return [];
    const defaultValue = smartDefaults[DEFAULT_KEY_BY_QUESTION[key]];
    if (!defaultValue) return [];
    return [{ key, label: QUESTION_LABELS[key], defaultValue }];
  });
}
```

### 2. `isQ5Unanswered` の変更

```typescript
// 変更前
const isQ5Unanswered =
  answers.q5.selectedOption === null && answers.q5.freeText.trim() === "";

// 変更後
const isQ5Unanswered =
  answers.q5.selectedOptions.length === 0 && answers.q5.freeText.trim() === "";
```

### 3. 選択値の複数表示

ApplySummaryCard では「ユーザーが選択した値」を表示するユースケースはなく、
**未回答問のスマートデフォルト値**（`SmartDefaultResult` の `string` 値）を表示するだけのため、
表示ロジックは変更不要。

ただし、回答済み問の選択値を別途表示するUI要素を追加する場合は `selectedOptions.join("、")` で結合する。
本タスクでは追加しない（OUT スコープ）。

---

## SkillCreateWizard 変更仕様（T-04）

### 1. `DEFAULT_ANSWERS` の変更

```typescript
// 変更前
const DEFAULT_ANSWERS: ConversationAnswers = {
  q1: { selectedOption: null, freeText: "" },
  q2: { selectedOption: null, freeText: "" },
  q3: { selectedOption: null, freeText: "", scheduleConfig: undefined },
  q4: { selectedOption: null, freeText: "" },
  q5: { selectedOption: null, freeText: "" },
  q6: { selectedOption: null, freeText: "" },
};

// 変更後
const DEFAULT_ANSWERS: ConversationAnswers = {
  q1: { selectedOptions: [], freeText: "" },
  q2: { selectedOptions: [], freeText: "" },
  q3: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
  q4: { selectedOptions: [], freeText: "" },
  q5: { selectedOptions: [], freeText: "" },
  q6: { selectedOptions: [], freeText: "" },
};
```

### 2. `resolveExternalIntegration()` の変更

Q5 の選択値が複数になりうるため、先頭値を優先参照する方針を採用する。
（外部ツール統合は1種類のツールを対象とするのが自然なため、先頭値優先は合理的）

```typescript
// 変更前
function resolveExternalIntegration(
  q5Answer: ConversationAnswers["q5"],
  smartDefaultTool: string | null | undefined,
): ExternalIntegrationState {
  const selected = q5Answer.selectedOption?.trim() ?? "";
  // ...
}

// 変更後
function resolveExternalIntegration(
  q5Answer: ConversationAnswers["q5"],
  smartDefaultTool: string | null | undefined,
): ExternalIntegrationState {
  // 先頭選択値を優先参照（複数選択時は最初に選んだものを主ツールとする）
  const selected = (q5Answer.selectedOptions[0] ?? "").trim();
  // 以降のロジックは変更なし
  // ...
}
```

**設計根拠**: `resolveExternalIntegration` は「外部連携があるか/何のツールか」を1値で判断する関数であり、
複数選択の全値を扱うとロジックの複雑度が上がる。Q5の選択肢（なし/Slack/GitHub/その他）の性質上、
先頭値参照で実用上の問題はない。

---

## Q3 定期実行特殊処理の複数選択対応 設計詳細

### 状態遷移表

| 操作                                   | `selectedOptions` の変化                  | `scheduleConfig` の変化               | ScheduleConfigInput |
| -------------------------------------- | ----------------------------------------- | ------------------------------------- | ------------------- |
| 「定期実行」クリック（未選択→選択）    | `[] → ["定期実行"]`                       | `undefined → DEFAULT_SCHEDULE_CONFIG` | 展開                |
| 「手動実行」クリック（定期実行選択中） | `["定期実行"] → ["定期実行", "手動実行"]` | 変化なし                              | 展開維持            |
| 「定期実行」クリック（選択→解除）      | `["定期実行", "手動実行"] → ["手動実行"]` | `DEFAULT_SCHEDULE_CONFIG → undefined` | 閉じる              |
| 「定期実行」クリック（解除→再選択）    | `["手動実行"] → ["手動実行", "定期実行"]` | `undefined → DEFAULT_SCHEDULE_CONFIG` | 展開                |

**展開の判定式**: `selectedOptions.includes("定期実行")`（配列内に存在するかどうか）

---

## 下位互換性の考慮

### 永続化データとの互換性

現在 `QuestionAnswer` はセッション永続化対象外（`SkillCreatorPersistedWorkflowCheckpoint` に含まれない）。
ウィザード内のインメモリ state としてのみ使用されるため、既存の永続化データとの互換性問題は発生しない。

### IPC 通信への影響

`ConversationAnswers` / `QuestionAnswer` は Renderer 内部の state 型であり、IPC で Main プロセスに送信されない。
`SkillCreatorUserInputSubmission`（IPC型）は `selectedOptionIds?: string[]` を既に持っており、影響なし。

### `createSkill()` 呼び出しへの影響

```typescript
// SkillCreateWizard.tsx の handleGenerate 内
const path = await createSkill(formData.purpose, SKILL_GENERATION_OPTIONS);
```

`answers` は `createSkill()` に渡していないため、型変更の影響なし。
（将来的に answers を createSkill に渡す場合は別タスクで対応）

---

## アクセシビリティ設計

### `aria-pressed` の正しい使い方

```html
<!-- 変更前（単一選択） -->
<button aria-pressed="{selected" ="" ="" ="opt}">...</button>
<!-- aria-pressed が false のボタンが複数あるが意味は正しい -->

<!-- 変更後（複数選択トグル） -->
<button aria-pressed="{selectedOptions.includes(opt)}">...</button>
<!-- 各ボタンが独立した押下状態を持ち、WCAG 2.1 SC 4.1.2 に準拠 -->
```

`aria-pressed` を使ったトグルボタン群は `role="group"` で囲むことが推奨されるが、
現行の `<section>` 構造で十分識別可能なため、追加の `role` 属性は設定しない。

---

## データフロー図

```
ユーザークリック
  │
  ▼
handleOptionSelect(key, option)
  │
  ├─ current = prev[key].selectedOptions
  ├─ isSelected = current.includes(option)
  ├─ nextSelectedOptions = isSelected
  │    ? current.filter(o => o !== option)   ← 解除
  │    : [...current, option]                ← 追加
  │
  ▼
setInternalAnswers(next)
  │
  ▼
useEffect → onAnswersChange(internalAnswers)   ← 親 state (SkillCreateWizard) に同期
  │
  ▼
ConversationAnswers.q1〜q6.selectedOptions[]   ← 最終的な複数選択状態
```

```
SmartDefaultResult（string | null × 6）
  │
  ▼ applySmartDefaults() 内 createQuestionAnswer()
  │  defaultValue が選択肢に含まれる → selectedOptions: [defaultValue]
  │  defaultValue が選択肢に含まれない → selectedOptions: [], freeText: defaultValue
  │  defaultValue が null → selectedOptions: [], freeText: ""
  ▼
QuestionAnswer.selectedOptions: string[]
```
