# Phase 5: 実装 - スキルウィザード複数選択対応

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 5                                 |
| 機能名   | skill-wizard-multi-select-options |
| 作成日   | 2026-04-08                        |
| 前提条件 | Phase 4 テスト作成完了            |

---

## 実装計画テーブル

| No.  | ファイルパス                                                                                 | 操作種別 | 変更概要                                                              | 優先度 |
| ---- | -------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- | ------ |
| F-01 | `packages/shared/src/types/skillCreator.ts`                                                  | 修正     | `QuestionAnswer.selectedOption` → `selectedOptions: string[]` に変更  | 最高   |
| F-02 | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`                            | 修正     | 型テストを `selectedOptions: string[]` に更新                         | 高     |
| F-03 | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | 修正     | トグル選択ロジック・判定・表示・Q3特殊処理・SmartDefaults変換を修正   | 高     |
| F-04 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 修正     | `selectedOption: null` → `selectedOptions: []` に既存テストを修正     | 高     |
| F-05 | `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`                     | 修正     | 未回答判定・`isQ5Unanswered` を `selectedOptions.length` ベースに変更 | 中     |
| F-06 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx`      | 修正     | `selectedOption` 参照を `selectedOptions` に更新                      | 中     |
| F-07 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                           | 修正     | `DEFAULT_ANSWERS` + `resolveExternalIntegration` を変更               | 高     |

**新規作成ファイルなし。** すべて既存ファイルの修正のみ。

---

## F-01: `skillCreator.ts` の変更内容詳細

### 変更対象箇所

ファイル: `packages/shared/src/types/skillCreator.ts`（行 968-975 付近）

### 変更前

```typescript
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

- `selectedOption: string | null` を完全削除し `selectedOptions: string[]` に置換
- JSDoc コメントも更新する
- `ConversationAnswers` インタフェース（行 981-994）は変更不要（キー構造は維持）

---

## F-02: `skillCreator-wizard.test.ts` の変更内容詳細

ファイル: `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`

### 変更箇所一覧

| 行番号（修正前） | 変更内容                                                                                |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 78-87            | `QuestionAnswer` 構築例: `selectedOption: "定期実行"` → `selectedOptions: ["定期実行"]` |
| 89-93            | 型アサーション: `selectedOption が string                                               | null 型`→`selectedOptions が string[] 型` に変更 |
| 99-111           | `ConversationAnswers` 構築例: 全問の `selectedOption: "値"` → `selectedOptions: ["値"]` |

### 変更後の型アサーション例

```typescript
describe("QuestionAnswer", () => {
  it("Q3 用の scheduleConfig を含められる", () => {
    const answer: QuestionAnswer = {
      selectedOptions: ["定期実行"],
      freeText: "",
      scheduleConfig: {
        cronExpression: "0 9 * * 1-5",
        timezone: "Asia/Tokyo",
      },
    };
    expectTypeOf(answer).toMatchTypeOf<QuestionAnswer>();
  });

  it("selectedOptions が string[] 型である", () => {
    expectTypeOf<QuestionAnswer["selectedOptions"]>().toEqualTypeOf<string[]>();
  });
});
```

---

## F-03: `ConversationRoundStep.tsx` の変更内容詳細

ファイル: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

### 変更箇所 1: `createEmptyAnswers()`

```typescript
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

### 変更箇所 2: `isQuestionAnswered()`

```typescript
// 変更後
function isQuestionAnswered(answer: QuestionAnswer): boolean {
  return (
    answer.selectedOptions.length > 0 ||
    answer.freeText.trim().length > 0 ||
    answer.scheduleConfig !== undefined
  );
}
```

### 変更箇所 3: `createQuestionAnswer()`（SmartDefaults → selectedOptions 変換）

```typescript
// 変更後
function createQuestionAnswer(
  defaultValue: string | null,
  options: readonly QuestionOption[],
): QuestionAnswer {
  if (!defaultValue) {
    return { selectedOptions: [], freeText: "" };
  }
  if (options.includes(defaultValue as QuestionOption)) {
    // SmartDefaultResult の string → selectedOptions: string[] 変換ポイント
    return { selectedOptions: [defaultValue], freeText: "" };
  }
  return { selectedOptions: [], freeText: defaultValue };
}
```

### 変更箇所 4: `handleOptionSelect()`（トグル方式に変更）

```typescript
// 変更後
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

### 変更箇所 5: `handleCronChange()` のフォールバック設計（M-03 対応）

```typescript
// 変更後（コメントで「定期実行」自動追加ロジックを明示）
const handleCronChange = (value: string) => {
  setInternalAnswers((prev) => ({
    ...prev,
    q3: {
      ...prev.q3,
      // cron 入力中は「定期実行」が selectedOptions に含まれていることを保証する。
      // handleOptionSelect 経由で通常は含まれているが、万が一含まれていない場合は自動追加する。
      selectedOptions: prev.q3.selectedOptions.includes("定期実行")
        ? prev.q3.selectedOptions
        : [...prev.q3.selectedOptions, "定期実行"],
      scheduleConfig: {
        ...(prev.q3.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG),
        cronExpression: value,
      },
    },
  }));
  setScheduleTouched(true);
};
```

### 変更箇所 6: `handleTimezoneChange()` のフォールバック設計（M-03 対応）

```typescript
// 変更後（同様のフォールバックコメントを追加）
const handleTimezoneChange = (value: string) => {
  setInternalAnswers((prev) => ({
    ...prev,
    q3: {
      ...prev.q3,
      // タイムゾーン変更時も「定期実行」の selectedOptions 維持を保証する。
      selectedOptions: prev.q3.selectedOptions.includes("定期実行")
        ? prev.q3.selectedOptions
        : [...prev.q3.selectedOptions, "定期実行"],
      scheduleConfig: {
        ...(prev.q3.scheduleConfig ?? DEFAULT_SCHEDULE_CONFIG),
        timezone: value,
      },
    },
  }));
};
```

### 変更箇所 7: `renderQuestion()` 内のレンダリング

```typescript
// ローカル変数の変更
// 変更前: const selected = answer.selectedOption;
// 変更後:
const selectedOptions = answer.selectedOptions;

// 「選択済み」バッジ条件
// 変更前: {selected && ( <span>選択済み</span> )}
// 変更後: {selectedOptions.length > 0 && ( <span>選択済み</span> )}

// ボタンの aria-pressed
// 変更前: aria-pressed={selected === opt}
// 変更後: aria-pressed={selectedOptions.includes(opt)}

// ボタンの className（アクティブ判定）
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

## F-04: `ConversationRoundStep.test.tsx` の変更内容詳細

ファイル: `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`

### 変更箇所 1: `defaultAnswers` フィクスチャ（行 26-33）

```typescript
// 変更後
const defaultAnswers: ConversationAnswers = {
  q1: { selectedOptions: [], freeText: "" },
  q2: { selectedOptions: [], freeText: "" },
  q3: { selectedOptions: [], freeText: "" },
  q4: { selectedOptions: [], freeText: "" },
  q5: { selectedOptions: [], freeText: "" },
  q6: { selectedOptions: [], freeText: "" },
};
```

### 変更箇所 2: Q3 スケジュール解除テスト（行 249-269）

「定期実行から他の選択肢へ切り替えると scheduleConfig がクリアされる」テストを複数選択トグル方式に書き直す。

変更前の挙動（単一選択・上書き）では「手動実行」クリックで「定期実行」が上書きされていた。
変更後はトグル方式のため、**「定期実行」クリック → 再クリック（解除）** でテストする。

```typescript
// 変更後のテストケース
it("「定期実行」を解除すると scheduleConfig がクリアされる（トグル方式）", () => {
  render(/* ... */);
  fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
  fireEvent.change(screen.getByLabelText(/cron式/), {
    target: { value: "0 9 * * 1-5" },
  });
  // 「定期実行」を再クリックして解除
  fireEvent.click(screen.getByRole("button", { name: "定期実行" }));

  const latestAnswers = (mockOnAnswersChange.mock.calls.at(-1)?.[0] ??
    defaultAnswers) as ConversationAnswers;
  expect(latestAnswers.q3.scheduleConfig).toBeUndefined();
});
```

### 追加テストケース（Phase 4 TC-U-03〜TC-U-17 の実装）

Phase 4 テストマトリクスの TC-U-03〜TC-U-17 を `ConversationRoundStep.test.tsx` に追加する。
特に以下のブロックを新設する。

```typescript
// 追加ブロック例
describe("複数選択トグル動作", () => {
  // TC-U-02: ボタンクリックで selectedOptions に追加
  // TC-U-03: 選択済みボタン再クリックで除去
  // TC-U-04: 複数ボタン同時選択
  // TC-U-05〜TC-U-07: aria-pressed の動作
});

describe("Q3 定期実行複数選択特殊処理", () => {
  // TC-U-08〜TC-U-12: シナリオA〜D
  // TC-U-16〜TC-U-17: handleCronChange / handleTimezoneChange フォールバック
});
```

---

## F-05: `ApplySummaryCard.tsx` の変更内容詳細

ファイル: `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`

### 変更箇所 1: `getUnansweredDefaults()` 内の未回答判定

```typescript
// 変更前
const isUnanswered =
  answer.selectedOption === null && answer.freeText.trim() === "";

// 変更後
const isUnanswered =
  answer.selectedOptions.length === 0 && answer.freeText.trim() === "";
```

### 変更箇所 2: `isQ5Unanswered` の判定

```typescript
// 変更前
const isQ5Unanswered =
  answers.q5.selectedOption === null && answers.q5.freeText.trim() === "";

// 変更後
const isQ5Unanswered =
  answers.q5.selectedOptions.length === 0 && answers.q5.freeText.trim() === "";
```

### 変更なし箇所（明示的に OUT スコープ）

- SmartDefault の表示ロジック（`defaultValue: string` の表示）は変更不要
- SmartDefaultResult は `string | null` のままのため、表示処理は影響なし
- 回答済み問の `selectedOptions.join("、")` 表示は本タスクのスコープ外（将来タスク）

---

## F-06: `ApplySummaryCard.test.tsx` の変更内容詳細

ファイル: `apps/desktop/src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx`

### 変更箇所 1: `defaultAnswers` フィクスチャ（行 17-24）

```typescript
// 変更後
const defaultAnswers: ConversationAnswers = {
  q1: { selectedOptions: [], freeText: "" },
  q2: { selectedOptions: [], freeText: "" },
  q3: { selectedOptions: [], freeText: "" },
  q4: { selectedOptions: [], freeText: "" },
  q5: { selectedOptions: [], freeText: "" },
  q6: { selectedOptions: [], freeText: "" },
};
```

### 変更箇所 2: `answeredAll` フィクスチャ（行 94-99）

```typescript
// 変更後
const answeredAll: ConversationAnswers = {
  q1: { selectedOptions: ["自分のみ"], freeText: "" },
  q2: { selectedOptions: ["テキスト"], freeText: "" },
  q3: { selectedOptions: ["手動実行"], freeText: "" },
  q4: { selectedOptions: ["チャット返信"], freeText: "" },
  q5: { selectedOptions: ["なし"], freeText: "" },
  q6: { selectedOptions: ["Markdown"], freeText: "" },
};
```

### 変更箇所 3: Q5 回答済みのテスト（行 169-171）

```typescript
// 変更後
const answeredQ5: ConversationAnswers = {
  ...defaultAnswers,
  q5: { selectedOptions: ["Slack"], freeText: "" },
};
```

---

## F-07: `SkillCreateWizard.tsx` の変更内容詳細

ファイル: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

### 変更箇所 1: `DEFAULT_ANSWERS` 定数（行 66-73）

```typescript
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

### 変更箇所 2: `resolveExternalIntegration()` 関数（行 203-242）

M-01 MINOR 対応: 先頭値参照に注釈コメントを追加する。

```typescript
// 変更後
function resolveExternalIntegration(
  q5Answer: ConversationAnswers["q5"],
  smartDefaultTool: string | null | undefined,
): ExternalIntegrationState {
  // 複数選択時は先頭値を主ツールとして参照する。
  // 複数ツールの並列統合対応は別タスクのスコープ。
  const selected = (q5Answer.selectedOptions[0] ?? "").trim();
  const freeText = q5Answer.freeText.trim();

  // 以降のロジックは変更なし（selected の参照元が変わるだけ）
  if (selected === "なし") {
    return { hasExternalIntegration: false, externalToolName: null };
  }
  // ... 以下は現行コードを維持
}
```

---

## Q3 特殊処理の実装方針（定期実行の選択検知）

### 判定式の変更

| 変更前                    | 変更後                                     |
| ------------------------- | ------------------------------------------ |
| `selected === "定期実行"` | `selectedOptions.includes("定期実行")`     |
| `option === "定期実行"`   | `nextSelectedOptions.includes("定期実行")` |

### scheduleConfig の制御フロー

```
handleOptionSelect(key="q3", option)
  └─ nextSelectedOptions = toggle(current, option)
  └─ hasSchedule = nextSelectedOptions.includes("定期実行")
      ├─ hasSchedule === true
      │    └─ scheduleConfig = current ?? DEFAULT_SCHEDULE_CONFIG  ← 既存値を維持
      └─ hasSchedule === false
           └─ scheduleConfig = undefined                           ← クリア
           └─ setScheduleTouched(false)                           ← バリデーション状態リセット
```

### handleCronChange / handleTimezoneChange のフォールバック（M-03 対応）

cron 入力・タイムゾーン変更のハンドラ内で、`selectedOptions` に「定期実行」が含まれていない場合に自動追加する。

**通常フロー**: ユーザーが「定期実行」ボタンをクリック → `handleOptionSelect` 経由で `selectedOptions` に追加 → ScheduleConfigInput 展開 → cron/timezone を入力。この順序では `selectedOptions` に「定期実行」が必ず含まれている。

**フォールバックが必要なケース**: `smartDefaults.timing = "定期実行"` で初期選択済み状態から直接 cron 入力が変更される場合。`createQuestionAnswer()` で `selectedOptions: ["定期実行"]` に初期化されているため通常は問題ないが、念のため保護する。

---

## フォールバック設計（selectedOptions が空の場合の挙動）

| 場面                                  | `selectedOptions` が空の場合の挙動                                             |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `isQuestionAnswered()` の判定         | `false` を返す（`freeText` も空なら未回答扱い）                                |
| `getUnansweredDefaults()` の判定      | 未回答扱いとし、SmartDefault 値があればリストに追加                            |
| `isQ5Unanswered` の判定               | `true`（category=external-integration のとき警告表示）                         |
| `resolveExternalIntegration()` の参照 | `selectedOptions[0] ?? ""` → 空文字列 → スマートデフォルト参照へフォールバック |
| Q3 の ScheduleConfigInput 展開判定    | `selectedOptions.includes("定期実行") === false` → 非展開                      |
| ボタンの `aria-pressed`               | `selectedOptions.includes(opt) === false` → 全ボタン `"false"`                 |
| 「選択済み」バッジ表示                | `selectedOptions.length === 0` → 非表示                                        |

---

## 実装順序（推奨）

1. **F-01** (`skillCreator.ts`) を最初に変更する。型エラーが他ファイルに波及するため、型変更を先行させる。
2. **F-07** (`SkillCreateWizard.tsx`) の `DEFAULT_ANSWERS` を修正する（型エラー解消）。
3. **F-03** (`ConversationRoundStep.tsx`) のロジック全体を修正する。
4. **F-05** (`ApplySummaryCard.tsx`) の判定ロジックを修正する。
5. **F-02, F-04, F-06** のテストファイルを修正する（テストが Red → Green になることを確認）。

---

## 既存テスト回帰確認コマンド

```bash
# 1. 型チェック（F-01 変更後に必ず実行）
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# 2. 変更対象テストの個別実行
pnpm vitest run packages/shared/src/types/__tests__/skillCreator-wizard.test.ts
pnpm vitest run apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
pnpm vitest run apps/desktop/src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx
pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx

# 3. wizard ディレクトリ全テスト
pnpm vitest run apps/desktop/src/renderer/components/skill/wizard/__tests__/

# 4. Lint チェック
pnpm --filter @repo/desktop lint
pnpm --filter @repo/shared lint

# 5. 全テスト（最終確認）
pnpm vitest run --reporter=verbose
```

---

## MINOR 指摘事項の対処確認

| 指摘 ID | 内容                                                                   | 対処ファイル                       | 対処内容                                                                                                     |
| ------- | ---------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| M-01    | `resolveExternalIntegration` に先頭値参照の注釈を追加                  | F-07 (`SkillCreateWizard.tsx`)     | コメント「複数選択時は先頭値を主ツールとして参照する。複数ツールの並列統合対応は別タスクのスコープ。」を追加 |
| M-02    | 既存テストの `selectedOption` 参照の洗い出し                           | Phase 4 で完了                     | Phase 4 に修正必須ファイル一覧と詳細を記載                                                                   |
| M-03    | `handleCronChange` / `handleTimezoneChange` のフォールバック設計を明記 | F-03 (`ConversationRoundStep.tsx`) | コメントで「定期実行」自動追加ロジックを明示                                                                 |
