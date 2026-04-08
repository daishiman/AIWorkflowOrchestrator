# Phase 1: 要件定義 - スキルウィザード複数選択対応

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 1                                 |
| 機能名 | skill-wizard-multi-select-options |
| 作成日 | 2026-04-08                        |

## 目的

スキル作成ウィザードの ConversationRoundStep（Q1〜Q6）選択ボタンを、現行の単一選択（radio的挙動）
から複数選択（checkbox的トグル挙動）に変更する要件を明文化し、受け入れ基準を定義する。

## P50チェック: 既実装状態の調査

### 調査対象ファイル

```
packages/shared/src/types/skillCreator.ts         # QuestionAnswer / SmartDefaultResult 型
apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx
apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

### 調査結果サマリ（2026-04-08 時点）

| 観点                                          | 現状                                                          |
| --------------------------------------------- | ------------------------------------------------------------- |
| `QuestionAnswer.selectedOption`               | `string \| null`（1値のみ保持）                               |
| `handleOptionSelect`                          | `selectedOption: option` で直接上書き（前の選択が消える）     |
| `isQuestionAnswered()`                        | `answer.selectedOption !== null` で判定                       |
| Q3特殊処理                                    | `selected === "定期実行"` で scheduleConfig を展開            |
| `aria-pressed`                                | `selected === opt`（boolean）                                 |
| `ApplySummaryCard` の `getUnansweredDefaults` | `answer.selectedOption === null` で未回答判定                 |
| `ApplySummaryCard` の表示                     | `defaultValue: string` を直接テキスト表示（配列非対応）       |
| `SmartDefaultResult` フィールド               | `string \| null` × 6種（who/input/timing/output/tool/format） |
| `DEFAULT_ANSWERS` in SkillCreateWizard        | `selectedOption: null` で初期化                               |
| `resolveExternalIntegration`                  | `q5Answer.selectedOption?.trim()` で単一値を参照              |

### 既存テスト状況

- `ConversationRoundStep` の unit test は `selectedOption` プロパティを直接アサートしている可能性あり
- 変更時に既存テストの修正が必要（Phase 4 で対応）

---

## 機能要件 (FR)

### FR-01: 複数選択UI（ボタントグル）

各設問（Q1〜Q6）の選択ボタンは、クリックのたびに「選択状態のトグル」として動作する。

- 未選択ボタンをクリック → そのオプションを `selectedOptions` に追加
- 選択済みボタンをクリック → そのオプションを `selectedOptions` から除去
- 複数のオプションを同時に `selectedOptions` に保持できる
- 選択数の上限は設けない（全6オプション同時選択も許容）

### FR-02: 選択状態の視覚表示

- 選択中のボタン: アクティブスタイル（`bg-[var(--status-primary)] text-[var(--text-inverse)]`）
- 未選択ボタン: 通常スタイル
- `aria-pressed` 属性: 選択中は `true`、非選択は `false`（WCAG 2.1 AA準拠）
- 「選択済み」バッジ: `selectedOptions.length > 0` のときに表示

### FR-03: Q3 定期実行の特殊処理（複数選択対応）

「定期実行」ScheduleConfigInput の展開条件を複数選択に対応させる。

- 展開条件: `selectedOptions.includes("定期実行") === true`
- 折りたたみ条件: `selectedOptions.includes("定期実行") === false`（他の選択肢が残っていても収納）
- `scheduleConfig` の保持・クリアロジックは現行と同一

### FR-04: 回答済み判定の更新

`isQuestionAnswered()` の判定条件を複数選択対応に変更する。

- 変更前: `answer.selectedOption !== null || answer.freeText.trim().length > 0 || answer.scheduleConfig !== undefined`
- 変更後: `answer.selectedOptions.length > 0 || answer.freeText.trim().length > 0 || answer.scheduleConfig !== undefined`

### FR-05: ApplySummaryCard の複数値表示

未回答判定と表示ロジックを複数選択対応にする。

- 未回答判定: `answer.selectedOptions.length === 0 && answer.freeText.trim() === ""`
- 選択値の表示: 複数の場合は `"、"` 区切りで結合（例: `"自分のみ、チームメンバー"`）
- SmartDefault表示: 現行通り（SmartDefaultResult は `string | null` のまま）

### FR-06: SmartDefaults の複数選択変換

`applySmartDefaults()` 内で SmartDefaultResult の単一値（`string`）を配列変換して適用する。

- `createQuestionAnswer()` の戻り値型を `{ selectedOptions: string[], freeText: string }` に変更
- `defaultValue` が選択肢に含まれる場合: `selectedOptions: [defaultValue]`
- `defaultValue` が選択肢に含まれない場合: `selectedOptions: [], freeText: defaultValue`

### FR-07: SkillCreateWizard の統合更新

- `DEFAULT_ANSWERS` の初期値: `selectedOption: null` → `selectedOptions: []`
- `resolveExternalIntegration`: `q5Answer.selectedOption` → `q5Answer.selectedOptions[0] ?? null`（先頭値参照）または複数値対応ロジックに変更

---

## 非機能要件 (NFR)

### NFR-01: アクセシビリティ

- `aria-pressed` は各ボタンに個別に付与し、`true` / `false` のboolean値を設定する
- スクリーンリーダーで「選択済み」/「未選択」が識別できること

### NFR-02: 型安全性

- `QuestionAnswer.selectedOption: string | null` を削除し、`selectedOptions: string[]` に完全移行
- `string | null` から `string[]` への移行により、null チェックが不要になること
- TypeScript strict mode でコンパイルエラーが発生しないこと

### NFR-03: 後方互換性

- `SmartDefaultResult` の型（`string | null` × 6）は変更しない
- `QuestionAnswer` の `freeText: string` と `scheduleConfig?: SkillWizardScheduleConfig` は変更しない
- `ConversationAnswers` のキー構造（q1〜q6）は変更しない

### NFR-04: パフォーマンス

- トグル操作時に不要な全再描画が発生しないこと（`useState` の局所更新で対応）
- 既存の `useEffect` による親 state 同期の仕組みは変更しない

### NFR-05: テスト互換

- 既存テストで `selectedOption` を参照している箇所はすべて `selectedOptions` に更新する
- 既存の振る舞いテスト（ボタンクリック→状態変化）は複数選択対応に書き直す

---

## スコープ境界

### IN スコープ

- `QuestionAnswer` の型変更（`selectedOption: string | null` → `selectedOptions: string[]`）
- `ConversationRoundStep.tsx` のトグル選択ロジック・UI変更
- `ApplySummaryCard.tsx` の複数値表示対応
- `SkillCreateWizard.tsx` の `DEFAULT_ANSWERS` 初期値・`resolveExternalIntegration` 更新
- 関連ユニットテストの修正・追加

### OUT スコープ（変更しない）

- `SmartDefaultResult` の型（`string | null` のまま維持）
- LLMプロンプト・バックエンド推論ロジック（`inferSmartDefaults` の戻り値形式は変更なし）
- Step 0（SkillInfoStep）・Step 2（GenerateStep）・Step 3（CompleteStep）の変更
- `InterviewUserAnswer` / `SkillCreatorUserInputSubmission` 等の IPC 型（別コンテキスト）
- E2Eテスト・Playwright の変更（Phase 11 で確認のみ）

---

## 受け入れ基準

| ID    | 条件                                                                               | 確認方法              |
| ----- | ---------------------------------------------------------------------------------- | --------------------- |
| AC-01 | Q1〜Q6 で複数のボタンを同時に選択できる                                            | ユニットテスト / 手動 |
| AC-02 | 選択済みボタンを再クリックすると選択が解除される                                   | ユニットテスト        |
| AC-03 | `selectedOptions` が空の状態から開始する                                           | 初期値テスト          |
| AC-04 | Q3で「定期実行」を選択すると ScheduleConfigInput が展開される                      | ユニットテスト        |
| AC-05 | Q3から「定期実行」の選択を解除すると ScheduleConfigInput が閉じる                  | ユニットテスト        |
| AC-06 | Q3で「定期実行」と他の選択肢を同時選択した場合も ScheduleConfigInput が展開される  | ユニットテスト        |
| AC-07 | SmartDefaults 適用時、推論値が選択肢に含まれれば `selectedOptions: [value]` になる | ユニットテスト        |
| AC-08 | SmartDefaults 適用時、推論値が選択肢に含まれなければ `freeText` に入る             | ユニットテスト        |
| AC-09 | `aria-pressed` が選択状態に応じて `true`/`false` を返す                            | DOM アサーション      |
| AC-10 | ApplySummaryCard で複数選択された値が `"、"` 区切りで表示される                    | ユニットテスト        |
| AC-11 | TypeScript コンパイルエラーが0件                                                   | `pnpm typecheck`      |
| AC-12 | ESLint エラーが0件                                                                 | `pnpm lint`           |
| AC-13 | `resolveExternalIntegration` が `selectedOptions[0]` を正しく参照する              | ユニットテスト        |

---

## 制約・前提

- 本タスクは Phase 3（設計レビュー）PASS 後に Phase 4（実装）へ進む
- コミット・PRはユーザー承認（Phase 13）まで実行しない
- `SmartDefaultResult` を変更すると LLM プロンプトの変更が連鎖するため、本タスクでは変更しない（設計決定）
