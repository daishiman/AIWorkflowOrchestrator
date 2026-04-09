# Phase 4: テスト作成 - スキルウィザード複数選択対応

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 4                                 |
| 機能名   | skill-wizard-multi-select-options |
| 作成日   | 2026-04-08                        |
| 前提条件 | Phase 3 MINOR 承認済み            |

---

## 既存テストの `selectedOption` 参照洗い出し（M-02 対応）

Phase 3 MINOR 指摘 M-02 の対処として、既存テストファイルの `selectedOption` 参照箇所をすべてリストアップした。

### 修正必須ファイル一覧

| ファイルパス                                                                                 | 参照箇所数 | 修正内容概要                                                                |
| -------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 6 箇所     | `defaultAnswers` の `selectedOption: null` → `selectedOptions: []`          |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx`      | 7 箇所     | `selectedOption: null / "値"` → `selectedOptions: [] / ["値"]`              |
| `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`                            | 9 箇所     | `selectedOption: "値"` → `selectedOptions: ["値"]` + 型アサーション修正     |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（本体）                   | 7 箇所     | `DEFAULT_ANSWERS` + `resolveExternalIntegration` 内の参照（Phase 5 で修正） |

### 各ファイルの修正対象詳細

#### ConversationRoundStep.test.tsx（行番号は修正前）

- 行 27-33: `defaultAnswers` オブジェクト内の `selectedOption: null` × 6 → `selectedOptions: []` × 6
- 行 265-268: Q3 の `scheduleConfig` 確認テスト: `defaultAnswers` の型整合確認（`selectedOptions: []` に変更済みのため追加修正なし）

#### ApplySummaryCard.test.tsx（行番号は修正前）

- 行 17-24: `defaultAnswers` オブジェクト内の `selectedOption: null` × 6 → `selectedOptions: []` × 6
- 行 94-99: `answeredAll` オブジェクト内の `selectedOption: "値"` × 6 → `selectedOptions: ["値"]` × 6
- 行 170: `q5: { selectedOption: "Slack", freeText: "" }` → `q5: { selectedOptions: ["Slack"], freeText: "" }`

#### skillCreator-wizard.test.ts（行番号は修正前）

- 行 79: `selectedOption: "定期実行"` → `selectedOptions: ["定期実行"]`
- 行 89-93: 型アサーション `selectedOption が string | null 型である` → `selectedOptions が string[] 型である` に変更
- 行 99-111: `ConversationAnswers` 構築例の `selectedOption: "値"` × 6 → `selectedOptions: ["値"]` × 6

---

## IPC レスポンス形式の確認

このタスクは Renderer 内インメモリ state の UI 変更のみを扱う。

- `QuestionAnswer` / `ConversationAnswers` は IPC 経由で Main プロセスへ送信されない（Phase 2 設計で確認済み）
- `SkillCreatorUserInputSubmission` 等の IPC 型は変更対象外
- したがって、**IPC レスポンス形式のテスト確認は本タスクでは不要**

---

## Private method テスト方針

`ConversationRoundStep.tsx` 内の以下の関数は module レベルの private 関数（export なし）であるため、
直接テストできない。public コールバック経由でテストする。

| Private 関数             | テスト方法                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `createEmptyAnswers()`   | コンポーネントレンダリング後の初期 `onAnswersChange` コールで `selectedOptions: []` を検証 |
| `isQuestionAnswered()`   | 「今すぐ生成する」ボタンのクリック可否 / `aria-disabled` 状態を通じて検証                  |
| `createQuestionAnswer()` | `smartDefaults` prop に値を渡し `aria-pressed="true"` のボタンを確認して検証               |
| `handleOptionSelect()`   | `fireEvent.click(button)` → `onAnswersChange` の呼び出し引数を検証                         |
| `handleCronChange()`     | `fireEvent.change(cronInput)` → `onAnswersChange` の呼び出し引数を検証                     |
| `handleTimezoneChange()` | `fireEvent.change(timezoneSelect)` → `onAnswersChange` の呼び出し引数を検証                |

---

## テスト対象ファイルパス（vitest 実行）

```bash
# ユニットテスト（ConversationRoundStep）
pnpm vitest run apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# ユニットテスト（ApplySummaryCard）
pnpm vitest run apps/desktop/src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx

# 型テスト（skillCreator-wizard）
pnpm vitest run packages/shared/src/types/__tests__/skillCreator-wizard.test.ts

# 統合テスト（SkillCreateWizard）
pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# まとめて実行
pnpm vitest run --reporter=verbose apps/desktop/src/renderer/components/skill/wizard/__tests__/ packages/shared/src/types/__tests__/skillCreator-wizard.test.ts
```

---

## 既存ユーティリティ重複検出

以下は既存テストで確認済みのため、新規 TC でも同一パターンを再利用すること。

| パターン                                     | 既存ファイル                   | 再利用方針                                      |
| -------------------------------------------- | ------------------------------ | ----------------------------------------------- |
| `fireEvent.click(button)`                    | ConversationRoundStep.test.tsx | 同一パターンでボタンのトグル動作を検証          |
| `aria-pressed` アサーション                  | ConversationRoundStep.test.tsx | `toHaveAttribute("aria-pressed", "true/false")` |
| `mockOnAnswersChange.mock.calls.at(-1)?.[0]` | ConversationRoundStep.test.tsx | 最終コールの引数取得パターンとして再利用        |
| `within(card).getByText(...)`                | ApplySummaryCard.test.tsx      | カード内テキスト検索パターンとして再利用        |
| `defaultAnswers` フィクスチャ                | 両テストファイル               | `selectedOptions: []` に統一後に再利用          |

---

## テストマトリクス

### TC-U（ユニットテスト）

#### ConversationRoundStep.tsx 向け

| TC ID   | 対応 AC | テスト概要                                                                                  | テスト方法                                                                            |
| ------- | ------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| TC-U-01 | AC-03   | 初期状態: 全問 `selectedOptions` が空配列である                                             | render 後の `onAnswersChange` 初回コール引数を検証（`selectedOptions: []` × 6）       |
| TC-U-02 | AC-01   | Q1 ボタンをクリックすると `selectedOptions` に追加される                                    | `fireEvent.click` → `onAnswersChange` の最終コール引数で `q1.selectedOptions` を検証  |
| TC-U-03 | AC-02   | Q1 で選択済みボタンを再クリックすると `selectedOptions` から除去される                      | 同じボタンを 2 回 `fireEvent.click` → 最終コール引数で空配列になることを確認          |
| TC-U-04 | AC-01   | Q1 で複数ボタンを同時選択できる（2 つ以上の選択肢が `selectedOptions` に残る）              | 2 つのボタンを順に `fireEvent.click` → `q1.selectedOptions.length === 2` を確認       |
| TC-U-05 | AC-09   | 選択されたボタンの `aria-pressed` が `"true"` になる                                        | `fireEvent.click` 後に `toHaveAttribute("aria-pressed", "true")`                      |
| TC-U-06 | AC-09   | 未選択ボタンの `aria-pressed` が `"false"` である                                           | 初期状態で `toHaveAttribute("aria-pressed", "false")`                                 |
| TC-U-07 | AC-09   | あるボタンを選択したとき、他のボタンの `aria-pressed` は変化しない                          | Q1 の 1 ボタン選択後、他の 3 ボタンが `"false"` のままであることを確認                |
| TC-U-08 | AC-04   | Q3 で「定期実行」を選択すると ScheduleConfigInput が展開される                              | `fireEvent.click(定期実行ボタン)` → `screen.getByLabelText(/cron/)` が存在する        |
| TC-U-09 | AC-05   | Q3 から「定期実行」を解除すると ScheduleConfigInput が閉じる                                | 「定期実行」クリック → 再クリック（トグル解除）→ `queryByLabelText(/cron/)` が null   |
| TC-U-10 | AC-06   | Q3 で「定期実行」と「手動実行」を同時選択しても ScheduleConfigInput が展開される            | 「定期実行」クリック → 「手動実行」クリック → cron input が存在することを確認         |
| TC-U-11 | AC-06   | Q3 で「手動実行」が選択中に「定期実行」を選択すると ScheduleConfigInput が展開される        | 「手動実行」クリック → 「定期実行」クリック → cron input が存在することを確認         |
| TC-U-12 | AC-05   | Q3 で「定期実行」+「手動実行」選択後に「定期実行」を解除すると ScheduleConfigInput が閉じる | 両方選択 → 「定期実行」トグル解除 → cron input が消えることを確認                     |
| TC-U-13 | AC-07   | `smartDefaults` の有効値がボタン選択に反映される（`aria-pressed="true"`）                   | `smartDefaults.who = "チームメンバー"` で render → 該当ボタンが `aria-pressed="true"` |
| TC-U-14 | AC-08   | `smartDefaults` 値が選択肢にない場合、`freeText` に設定されボタン未選択                     | `smartDefaults.who = "特定部門"` で render → ボタン未選択 + `freeText` 確認           |
| TC-U-15 | AC-07   | `smartDefaults.timing = "定期実行"` のとき ScheduleConfigInput が初期展開される             | `smartDefaults` に `timing: "定期実行"` を渡して render → cron input が存在する       |

#### handleCronChange / handleTimezoneChange 向け

| TC ID   | 対応 AC | テスト概要                                                        | テスト方法                                                                                                            |
| ------- | ------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| TC-U-16 | M-03    | cron 入力中に `selectedOptions` に「定期実行」が含まれる          | 「定期実行」選択 → cron 入力変更 → `onAnswersChange` 最終コールで `q3.selectedOptions.includes("定期実行")` を確認    |
| TC-U-17 | M-03    | タイムゾーン変更時に `selectedOptions` に「定期実行」が維持される | 「定期実行」選択 → タイムゾーン変更 → `onAnswersChange` 最終コールで `q3.selectedOptions.includes("定期実行")` を確認 |

### TC-U（ユニットテスト）- ApplySummaryCard.tsx 向け

| TC ID   | 対応 AC | テスト概要                                                                                 | テスト方法                                                                           |
| ------- | ------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| TC-U-20 | AC-10   | 全問未回答（`selectedOptions: []`）でスマートデフォルトあり → リスト表示される             | `defaultAnswers`（`selectedOptions: []`）+ smartDefaults で render → リスト表示確認  |
| TC-U-21 | AC-10   | Q1 に複数選択（`selectedOptions: ["自分のみ", "チームメンバー"]`）のとき未回答判定されない | `q1.selectedOptions: ["自分のみ", "チームメンバー"]` → Q1 の未回答デフォルトが非表示 |
| TC-U-22 | AC-10   | `q5.selectedOptions: ["Slack"]` のとき `isQ5Unanswered === false` で警告が消える           | `external-integration` カテゴリ + `q5.selectedOptions: ["Slack"]` → 警告非表示       |

### TC-U（ユニットテスト）- skillCreator-wizard.test.ts 向け

| TC ID   | 対応 AC | テスト概要                                                                                    | テスト方法                                                                       |
| ------- | ------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| TC-U-30 | AC-11   | `QuestionAnswer.selectedOptions` が `string[]` 型である                                       | `expectTypeOf<QuestionAnswer["selectedOptions"]>().toEqualTypeOf<string[]>()`    |
| TC-U-31 | AC-11   | `QuestionAnswer` に `selectedOption` フィールドが存在しない                                   | `expectTypeOf<QuestionAnswer>().not.toHaveProperty("selectedOption")` 相当の検証 |
| TC-U-32 | AC-11   | `ConversationAnswers` が `selectedOptions: string[]` を持つ `QuestionAnswer` × 6 で構築できる | オブジェクトリテラルで構築し型アサーション                                       |

### TC-I（統合テスト）

| TC ID   | 対応 AC | テスト概要                                                                     | テスト方法                                                                                   |
| ------- | ------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| TC-I-01 | AC-13   | `resolveExternalIntegration` が `selectedOptions[0]` を参照する                | `q5.selectedOptions: ["Slack"]` で `resolveExternalIntegration` の戻り値を検証               |
| TC-I-02 | AC-13   | `selectedOptions: ["Slack", "GitHub"]` のとき先頭値「Slack」が参照される       | 複数選択状態で `resolveExternalIntegration` → `externalToolName === "Slack"` を確認          |
| TC-I-03 | AC-13   | `selectedOptions: []` のとき `externalIntegration.has === false` になる        | 空配列での `resolveExternalIntegration` → `hasExternalIntegration === false` を確認          |
| TC-I-04 | AC-01   | SkillCreateWizard の `DEFAULT_ANSWERS` が `selectedOptions: []` で初期化される | SkillCreateWizard render 後、Step 1 の `onAnswersChange` で `selectedOptions: []` × 6 を確認 |

---

## テストシナリオ（Q3 特殊ケース詳細）

### Q3「定期実行」複数選択シナリオ

以下のシナリオは TC-U-08〜TC-U-12 を補足する。

```
シナリオA: 単純な定期実行選択
  1. 初期: selectedOptions: []
  2. 「定期実行」クリック → selectedOptions: ["定期実行"]
  3. ScheduleConfigInput 展開を確認

シナリオB: 定期実行 + 手動実行の同時選択
  1. 初期: selectedOptions: []
  2. 「定期実行」クリック → selectedOptions: ["定期実行"]
  3. 「手動実行」クリック → selectedOptions: ["定期実行", "手動実行"]
  4. ScheduleConfigInput が展開中のままであることを確認（includes("定期実行") === true）

シナリオC: 「定期実行」のトグル解除
  1. シナリオBの状態: selectedOptions: ["定期実行", "手動実行"]
  2. 「定期実行」を再クリック → selectedOptions: ["手動実行"]
  3. ScheduleConfigInput が閉じることを確認（includes("定期実行") === false）
  4. scheduleConfig が undefined になることを onAnswersChange で確認

シナリオD: 「手動実行」が先の場合の定期実行追加
  1. 「手動実行」クリック → selectedOptions: ["手動実行"]
  2. ScheduleConfigInput が閉じたままであることを確認
  3. 「定期実行」クリック → selectedOptions: ["手動実行", "定期実行"]
  4. ScheduleConfigInput が展開されることを確認
```

---

## テスト実装上の注意事項

1. **`fireEvent` のみ使用**: happy-dom 環境のため `userEvent` は使用禁止（P39 準拠）
2. **`beforeEach` でモックリセット**: `vi.clearAllMocks()` を必ず実行（P9 準拠）
3. **`defaultAnswers` フィクスチャの更新**: `selectedOption: null` → `selectedOptions: []` に変更してから全テストで共有
4. **`aria-pressed` は文字列**: `toHaveAttribute("aria-pressed", "true")` と `"false"` の文字列で比較
5. **`onAnswersChange` の最終コール取得**: `mockOnAnswersChange.mock.calls.at(-1)?.[0]` パターンを使用
6. **scheduleConfig の確認**: `q3.scheduleConfig` の `undefined`/存在確認には `toBeUndefined()` / `toBeDefined()` を使用
