# Phase 1: 要件定義書

## タスクID: UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001

## インベントリ確認結果（Step 0 / Task 1）

### resolveSemanticLabel の現状

**確認結果**: `resolveSemanticLabel()` 関数は `ConversationRoundStep.tsx` に**存在しない**。
変換ロジックは `createQuestionAnswer()` 内にインライン条件式として実装されている。

### 現行の変換テーブル（createQuestionAnswer 内インライン）

| questionId | rawValue                   | displayLabel                     | 実装箇所                                                            |
| ---------- | -------------------------- | -------------------------------- | ------------------------------------------------------------------- |
| q3         | `"scheduled"`              | `"定期実行"`                     | `if (defaultValue === "scheduled" && options.includes("定期実行"))` |
| q5         | `"slack"` (toLowerCase後)  | `"Slack"`                        | `if (normalizedTool === "slack" && options.includes("Slack"))`      |
| q5         | `"github"` (toLowerCase後) | `"GitHub"`                       | `if (normalizedTool === "github" && options.includes("GitHub"))`    |
| q5         | `"notion"` (toLowerCase後) | `"その他"` + freeText `"Notion"` | `if (normalizedTool === "notion" && options.includes("その他"))`    |

### 仕様書記載の silent mismatch（新規追加対象）

| questionId | rawValue     | displayLabel | 備考                                                                  |
| ---------- | ------------ | ------------ | --------------------------------------------------------------------- |
| q1         | `"自分だけ"` | `"自分のみ"` | inferSmartDefaults が返す可能性がある表記揺れ。現在はハンドリングなし |

### applySmartDefaults のシグネチャ（現行）

```typescript
function applySmartDefaults(
  answers: ConversationAnswers,
  smartDefaults: SmartDefaultResult,
): ConversationAnswers;
```

- 現行は未エクスポート（テスト用にエクスポートが必要）
- `SmartDefaultResult.who → q1`, `timing → q3`, `tool → q5`, `format → q6` にマッピング

### 既存テスト件数（ベースライン）

ファイル: `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`

既存テスト件数: **36件** (既存の describe ブロックより集計)

- 進捗バー表示: 2件
- スマートデフォルト: 2件
- ページング: 2件
- Q3スケジュールUI展開: 6件
- 自由入力: 1件
- Q5必須バリデーション: 2件
- 適用サマリーカード: 5件
- 複数選択トグル動作: 6件
- Q3定期実行複数選択特殊処理: 5件
- フェイルパス: 2件
- 回帰ガード: 3件
- アクセシビリティ: 3件
- onBack: 1件

`applySmartDefaults` / `resolveSemanticLabel` を直接テストするケース: **0件**

## 命名規則確認（Task 2）

`packages/shared/src/types/` ディレクトリの既存ファイル命名規則:

- `skill-chain.ts`, `skill-analytics.ts`, `skill-debug.ts`, `skill-schedule.ts` → **kebab-case**
- `skillCreator.ts`, `skillCreatorExternalApi.ts` → **camelCase** (混在)

**判定**: `skill-wizard-label-map.ts` は kebab-case で命名する（多数派規則に従う）

## 受け入れ基準（確定版）

| ID   | 基準                                                                                       | 検証方法                                                             |
| ---- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| AC-1 | `QuestionSemanticLabelMap` 型が `@repo/shared/types/skillWizard` からインポートできる      | TypeScript コンパイル通過                                            |
| AC-2 | `resolveSemanticLabel()` が `ConversationRoundStep.tsx` 内にハードコードテーブルを持たない | `grep -n "slack.*Slack\|scheduled.*定期実行"` で0件                  |
| AC-3 | `applySmartDefaults()` のテストが10件以上存在し全件 PASS                                   | `pnpm --filter @repo/desktop exec vitest run ... --reporter=verbose` |
| AC-4 | 正準形対応表が `outputs/phase-3/design-decisions.md` に文書化されている                    | ファイル存在確認 + 内容確認                                          |
| AC-5 | 既存のウィザード動作が変わらない（回帰テスト）                                             | vitest 全件 PASS（既存36件以上）                                     |

## 仕様間矛盾事項（記録）

Phase 4 TC-01 では `questionId: "q5"` に `"自分だけ" → "自分のみ"` とあるが、
Phase 12 SEMANTIC_LABEL_MAP では `q1: { "自分だけ": "自分のみ" }` となっている。

**判断**: Phase 12 仕様の方が論理的に正しい（q1 = 利用者 質問）。
TC-01 の questionId は q1 として実装する。
