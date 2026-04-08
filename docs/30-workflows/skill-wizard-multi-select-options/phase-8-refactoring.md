# Phase 8: リファクタリング - スキルウィザード複数選択対応

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 8                                 |
| 機能名 | skill-wizard-multi-select-options |
| 作成日 | 2026-04-08                        |
| 前提   | Phase 7（カバレッジ確認）完了     |

## 目的

Phase 5（実装）・Phase 6（テスト拡充）・Phase 7（カバレッジ確認）を通じて蓄積された
技術的負債・コメント漏れ・MINOR 指摘未解消項目を整理し、コードを保守可能な状態に整える。
実装の振る舞いは変更しない。

---

## 1. 重複・ナビゲーションドリフト確認

### 1-1. `selectedOption` 残存チェック

Phase 5 実装後に以下のキーワードが残存していないことを確認する。

| チェック対象                      | 確認コマンド                                                                                        | 期待結果   |
| --------------------------------- | --------------------------------------------------------------------------------------------------- | ---------- |
| `selectedOption` の参照（型以外） | `grep -r "selectedOption" packages/shared/src apps/desktop/src --include="*.ts" --include="*.tsx"`  | ヒットなし |
| `selectedOption:` の代入          | `grep -r "selectedOption:" packages/shared/src apps/desktop/src --include="*.ts" --include="*.tsx"` | ヒットなし |
| テストファイルの旧プロパティ参照  | `grep -r "selectedOption" apps/desktop/src/**/__tests__ --include="*.ts" --include="*.tsx"`         | ヒットなし |

**ドリフトが検出された場合の対処**: 該当箇所を `selectedOptions` に修正し、再度 `pnpm typecheck` を実行する。

### 1-2. ナビゲーションドリフト（変更波及漏れ）確認

Phase 2 Topology 表（T-01〜T-05）に記載された全ファイルが変更済みであることを確認する。

| ファイル                                                                      | 変更内容                                              | 確認方法                                       |
| ----------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                   | `selectedOptions: string[]` への型変更完了            | `git diff HEAD` で `selectedOption` 行が消失   |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | トグルロジック・表示・Q3特殊処理すべて更新済み        | Phase 6 テストが全 PASS                        |
| `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      | 未回答判定・表示の変更済み                            | Phase 6 テストが全 PASS                        |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | `DEFAULT_ANSWERS` / `resolveExternalIntegration` 更新 | Phase 6 テストが全 PASS                        |
| テストファイル群                                                              | `selectedOption` 参照を `selectedOptions` に全更新    | `grep "selectedOption" __tests__` でヒットなし |

---

## 2. MINOR 指摘事項（M-01〜M-03）の解消確認

Phase 3 設計レビューで指摘された MINOR 事項が Phase 5 実装時に対処済みかを検証する。

### M-01: `resolveExternalIntegration` への先頭値参照コメント

**指摘内容**: `q5Answer.selectedOptions[0]` の先頭値優先を意図が分かるようにコメントで明記すること。

**解消確認**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` の
`resolveExternalIntegration` 関数内に以下の形式のコメントが存在することを確認する。

```typescript
// 複数選択時は先頭値を主ツールとして参照する。
// 複数ツールの並列統合対応は別タスクのスコープ。
const selected = (q5Answer.selectedOptions[0] ?? "").trim();
```

**未対処の場合**: 上記コメントを追加する。振る舞いの変更なし。

### M-02: 既存テストの `selectedOption` 参照洗い出し

**指摘内容**: Phase 4 でテストファイルを全件確認し、`selectedOption` → `selectedOptions` の
移行箇所リストを `phase-4-test-creation.md` に記載すること。

**解消確認**: 以下の2点を確認する。

1. `phase-4-test-creation.md` に移行箇所リストが存在する
2. 実際のテストファイルに `selectedOption`（配列でない旧プロパティ）が残存していない

```bash
# 確認コマンド
grep -r "selectedOption[^s]" \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ \
  apps/desktop/src/renderer/components/skill/__tests__/ \
  packages/shared/src/ \
  --include="*.ts" --include="*.tsx"
```

期待結果: ヒットなし（`selectedOptions` のみが存在する状態）

**未対処の場合**: `phase-4-test-creation.md` に洗い出しリストを追記し、
残存箇所を `selectedOptions` に修正する。

### M-03: `handleCronChange` / `handleTimezoneChange` のフォールバック設計コメント

**指摘内容**: cron 入力中に `selectedOptions` から「定期実行」が抜けた場合の
自動追加フォールバックロジックをコメントで明記すること。

**解消確認**: `ConversationRoundStep.tsx` の `handleCronChange` 内に以下の形式のコメントが
存在することを確認する。

```typescript
// cron 編集中に「定期実行」が selectedOptions から外れることがあるため、
// 含まれていない場合は自動追加してフォールバックする。
selectedOptions: prev.q3.selectedOptions.includes("定期実行")
  ? prev.q3.selectedOptions
  : [...prev.q3.selectedOptions, "定期実行"],
```

`handleTimezoneChange` にも同様のコメントが存在することを確認する。

**未対処の場合**: コメントを追加する。振る舞いの変更なし。

---

## 3. リファクタリング対象の明示

### 3-1. 不要な型変換の除去

Phase 5 実装中に一時的に導入された型変換（`as string[]` キャスト等）が不要になっていないかを確認する。

| 確認箇所                                                   | 見直し観点                                             |
| ---------------------------------------------------------- | ------------------------------------------------------ |
| `ConversationRoundStep.tsx` の `selectedOptions` 参照箇所  | `as string[]` 等の不要なキャストが残っていないか       |
| `createQuestionAnswer()` の戻り値                          | `selectedOptions` の型が `string[]` で推論されているか |
| `getUnansweredDefaults()` の `answer.selectedOptions` 参照 | 不要な `.slice()` / スプレッド展開が残っていないか     |

確認コマンド:

```bash
grep -n "as string\[\]" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx \
  apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

期待結果: ヒットなし（型推論で解決できているはず）

### 3-2. コメント整理

以下のコメントが「変更前の挙動」を記述したまま残存していないかを確認する。

| 対象パターン                                                   | 対処                                 |
| -------------------------------------------------------------- | ------------------------------------ | ----------------------------------- |
| `// 単一選択` `// string                                       | null` 等の旧設計を前提にしたコメント | 削除または `// 複数選択` に書き換え |
| `// TODO: 複数選択対応` 等の Phase 5 以降に完了したはずの TODO | 削除（実装済みのため）               |
| `// selectedOption → selectedOptions` 等の移行途中コメント     | 削除（移行完了後は不要）             |

### 3-3. `createQuestionAnswer()` の `string → [string]` 変換コメント（M-01 補足）

Phase 2 設計書では以下のコメントを実装時に追加することが意図されていた。
Phase 5 実装後に存在するかを確認し、未追加の場合は追記する。

```typescript
function createQuestionAnswer(
  defaultValue: string | null,
  options: readonly QuestionOption[],
): QuestionAnswer {
  if (!defaultValue) {
    return { selectedOptions: [], freeText: "" };
  }
  if (options.includes(defaultValue as QuestionOption)) {
    // SmartDefaultResult（string | null）を selectedOptions（string[]）に変換する。
    // LLMは1値を返す設計のため、1要素配列として格納する。
    return { selectedOptions: [defaultValue], freeText: "" };
  }
  return { selectedOptions: [], freeText: defaultValue };
}
```

---

## 4. リファクタリング作業の進め方

### 作業順序

リファクタリングは振る舞いを変えないため、以下の順序で行う。

```
1. M-01〜M-03 の未解消チェック（コメント追加のみ）
   ↓
2. `selectedOption` 残存確認・除去
   ↓
3. 不要キャスト・コメント整理
   ↓
4. `pnpm typecheck` で型エラーがないことを確認
   ↓
5. `pnpm lint` でLintエラーがないことを確認
   ↓
6. `pnpm test` でテストが全件 PASS することを確認
```

### 振る舞いを変えてよい例外

リファクタリングフェーズで唯一許容される振る舞い変更:

- **なし**。本 Phase ではコード構造・コメントの整理のみを行う。
- 振る舞い変更が必要と判明した場合は Phase 5（実装）に差し戻す。

---

## 5. 完了条件

| 条件                                                                     | 確認方法                                          |
| ------------------------------------------------------------------------ | ------------------------------------------------- |
| `selectedOption`（旧プロパティ）が対象ファイルから完全に除去されている   | `grep` ヒットなし                                 |
| M-01 のコメントが `resolveExternalIntegration` に存在する                | コードレビュー                                    |
| M-02 の洗い出しリストが `phase-4-test-creation.md` に存在する            | ファイル確認                                      |
| M-03 のコメントが `handleCronChange` / `handleTimezoneChange` に存在する | コードレビュー                                    |
| 不要な型キャスト（`as string[]`）が除去されている                        | `grep` ヒットなし                                 |
| `pnpm typecheck` がエラー0件                                             | コマンド実行結果                                  |
| `pnpm lint` がエラー0件                                                  | コマンド実行結果                                  |
| `pnpm test` が全件 PASS                                                  | テスト実行結果                                    |
| 振る舞いの変更がない（テスト内容が変わっていない）                       | `git diff` でテストロジックに差分がないことを確認 |

---

## 参照ドキュメント

| ドキュメント          | パス                                                           |
| --------------------- | -------------------------------------------------------------- |
| 要件定義              | [phase-1-requirements.md](./phase-1-requirements.md)           |
| 設計                  | [phase-2-design.md](./phase-2-design.md)                       |
| 設計レビュー（MINOR） | [phase-3-design-review.md](./phase-3-design-review.md)         |
| 次フェーズ            | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
