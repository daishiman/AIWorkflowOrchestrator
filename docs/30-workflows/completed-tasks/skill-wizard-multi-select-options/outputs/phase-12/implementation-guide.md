# Phase 12 成果物: 実装ガイド

## Task 12-1: skill-wizard-multi-select-options 実装ガイド

---

## Part 1: 中学生向け説明

### スキルウィザードの複数選択対応とは何か？

たとえば、スマートフォンのアンケートアプリを思い浮かべてください。今まで「好きな食べ物は何ですか？」という質問に対して、1つしか選べなかったとします。でも実際には「ラーメンもカレーも好き！」という人がたくさんいますよね？

今回の変更は、スキル作成ウィザードの質問（Q1〜Q6）に対する回答を「1つしか選べない」から「複数選べる」に変更する作業です。

### 例え話：チェックボックスとラジオボタン

- **変更前（ラジオボタン）**：「好きな食べ物は1つだけ選んでください」→ ラーメン◎ / カレー○ / 寿司○
- **変更後（チェックボックス）**：「好きな食べ物を全部選んでください」→ ラーメン✓ / カレー✓ / 寿司○

ボタンを押すたびに「選ばれる↔選ばれない」がトグル（切り替え）される仕組みです。

### 何が変わったか（プログラムの言葉で）

- **変更前**: `selectedOption: "ラーメン"` → 1つの文字列で保存
- **変更後**: `selectedOptions: ["ラーメン", "カレー"]` → リスト（配列）で保存

選んでいないときは、変更前は「`null`（何もない）」、変更後は「`[]`（空っぽのリスト）」で表します。

### 専門用語の説明

| 用語                 | 説明                                                             |
| -------------------- | ---------------------------------------------------------------- |
| **配列（array）**    | 複数の値を順番に並べたリスト。`["A", "B", "C"]` のような形       |
| **トグル（toggle）** | ボタンを押すたびにオン/オフが切り替わる操作                      |
| **null**             | 「値がない」を表す特別な記号                                     |
| **型定義**           | プログラムが扱うデータの「形」を決めるルール                     |
| **SmartDefault**     | AIが「たぶんこれが良いですよ」と推測して初期値を入れてくれる機能 |
| **aria-pressed**     | 「このボタンは今押されているよ」とスクリーンリーダーに伝える印   |

---

## Part 2: 技術者向け説明

### 変更概要

`QuestionAnswer.selectedOption: string | null` を廃止し `selectedOptions: string[]` に完全置換した。
`SmartDefaultResult`（`string | null` × 6）は変更せず、UI 層の `createQuestionAnswer()` で `string → [string]` 変換を吸収する。

### 変更ファイル一覧

| ファイル                                    | 変更種別         | 主な変更点                                                                                    |
| ------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts` | 型変更           | `selectedOption: string \| null` → `selectedOptions: string[]`                                |
| `ConversationRoundStep.tsx`                 | 動作変更         | `handleOptionSelect` トグル化・`isQuestionAnswered`・`createQuestionAnswer`・`renderQuestion` |
| `ApplySummaryCard.tsx`                      | 判定変更         | `selectedOption === null` → `selectedOptions.length === 0`                                    |
| `SkillCreateWizard.tsx`                     | 初期値・参照変更 | `DEFAULT_ANSWERS` / `resolveExternalIntegration`                                              |

### 型変更（T-01）の詳細

```typescript
// 変更前
export interface QuestionAnswer {
  selectedOption: string | null; // 廃止
  freeText: string;
  scheduleConfig?: SkillWizardScheduleConfig;
}

// 変更後
export interface QuestionAnswer {
  /** 選択値のリスト。複数選択可。未選択時は空配列。 */
  selectedOptions: string[]; // 追加（空配列 = 未選択）
  freeText: string;
  scheduleConfig?: SkillWizardScheduleConfig;
}
```

### SmartDefaultResult 変換ポイント（`createQuestionAnswer`）

```typescript
function createQuestionAnswer(
  defaultValue: string | null,
  options: readonly QuestionOption[],
): QuestionAnswer {
  if (!defaultValue) return { selectedOptions: [], freeText: "" };
  if (options.includes(defaultValue as QuestionOption)) {
    return { selectedOptions: [defaultValue], freeText: "" }; // string → [string]
  }
  return { selectedOptions: [], freeText: defaultValue };
}
```

### トグルロジック（`handleOptionSelect`）

```typescript
const current = prev[key].selectedOptions;
const isSelected = current.includes(option);
const nextSelectedOptions = isSelected
  ? current.filter((o) => o !== option) // 選択解除（イミュータブル）
  : [...current, option]; // 選択追加（イミュータブル）
```

### Q3 定期実行の複数選択対応（状態遷移）

| 操作                              | selectedOptions の変化                    | scheduleConfig の変化                 | ScheduleConfigInput |
| --------------------------------- | ----------------------------------------- | ------------------------------------- | ------------------- |
| 「定期実行」クリック（未→選択）   | `[] → ["定期実行"]`                       | `undefined → DEFAULT_SCHEDULE_CONFIG` | 展開                |
| 「手動実行」も追加                | `["定期実行"] → ["定期実行", "手動実行"]` | 変化なし                              | 展開維持            |
| 「定期実行」クリック（選択→解除） | `["定期実行", "手動実行"] → ["手動実行"]` | `DEFAULT_SCHEDULE_CONFIG → undefined` | 閉じる              |

**展開判定式**: `selectedOptions.includes("定期実行")`

### `resolveExternalIntegration` の先頭値参照方針

```typescript
// 複数選択時は先頭値を主ツールとして参照する。
// 複数ツールの並列統合対応は別タスクのスコープ。
const selected = (q5Answer.selectedOptions[0] ?? "").trim();
```

### Q5 外部ツールの SmartDefault 正規化

`smartDefaultReasoningService` は tool を semantic 値の `slack` / `github` / `notion` で返す。
Q5 の UI では、これを次のように変換して初期選択へ反映する。

| 推論値   | UI への反映                                     |
| -------- | ----------------------------------------------- |
| `slack`  | `Slack` を選択済みにする                        |
| `github` | `GitHub` を選択済みにする                       |
| `notion` | `その他` を選択し、自由入力に `Notion` を入れる |

この正規化により、Step 1 の初期表示と Step 2 の生成結果が一致する。

### handleCronChange / handleTimezoneChange フォールバック

```typescript
// SmartDefaults が scheduleConfig を設定した場合など、
// selectedOptions に「定期実行」が含まれていないフォールバックとして自動追加する
selectedOptions: prev.q3.selectedOptions.includes("定期実行")
  ? prev.q3.selectedOptions
  : [...prev.q3.selectedOptions, "定期実行"],
```

### アクセシビリティ（WCAG 2.1 AA）

```html
<!-- 各ボタンが独立した押下状態を持つ（トグルボタン群） -->
<button aria-pressed="{selectedOptions.includes(opt)}">...</button>
```

### エッジケース

| ケース                                                    | 対処                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `handleCronChange` 呼び出し時に「定期実行」が未選択の場合 | 自動追加フォールバックで防護                                              |
| `selectedOptions[0]` アクセス時に配列が空の場合           | `?? ""` 演算子でフォールバック                                            |
| 永続化データとの互換性                                    | `QuestionAnswer` はインメモリ state のみ。IPC・永続化スキーマへの影響なし |

### 設定可能なパラメータ / 定数一覧

| 項目                      | 内容                                         |
| ------------------------- | -------------------------------------------- |
| `DEFAULT_SCHEDULE_CONFIG` | Q3 の定期実行を初回展開する既定値            |
| `selectedOptions: []`     | 未選択時の初期値                             |
| `aria-pressed`            | ボタンの選択状態を表す `true` / `false` 属性 |

---

## Part 3: 画面証跡

### Phase 11 スクリーンショット参照

この Phase 12 実装ガイドは、Phase 11 で取得した画面証跡と対応づけて確認できるようにしている。

| ファイル                                                  | 内容                                            |
| --------------------------------------------------------- | ----------------------------------------------- |
| `../phase-11/screenshots/smart-defaults-applied.png`      | Step 1 初期表示で SmartDefault が反映済みの状態 |
| `../phase-11/screenshots/q1-single-select.png`            | Q1 単一選択状態                                 |
| `../phase-11/screenshots/q1-multi-select.png`             | Q1 複数選択状態                                 |
| `../phase-11/screenshots/q1-all-deselected.png`           | Q1 全解除状態                                   |
| `../phase-11/screenshots/q3-schedule-expanded.png`        | Q3「定期実行」展開状態                          |
| `../phase-11/screenshots/q3-schedule-plus-manual.png`     | Q3「定期実行」+「手動実行」状態                 |
| `../phase-11/screenshots/q3-schedule-collapsed.png`       | Q3「定期実行」解除後の収納状態                  |
| `../phase-11/screenshots/apply-summary-card-defaults.png` | ApplySummaryCard 表示状態                       |
| `../phase-11/screenshots/keyboard-focus-button.png`       | キーボードフォーカス状態                        |
| `../phase-11/devtools-audit.md`                           | console / page error の確認結果                 |
| `../phase-11/screenshot-manifest.json`                    | 画面証跡の一覧と保存先メタデータ                |

### 参照意図

- 画面状態の説明を、後続のレビューや PR メッセージ作成でそのまま再利用できるようにする
- UI 変更があった際に、設計文書と視覚的証跡の対応関係をすぐ追跡できるようにする
- `outputs/phase-11/` の証跡が欠落した場合に、どの状態を再撮影すべきか判定しやすくする
