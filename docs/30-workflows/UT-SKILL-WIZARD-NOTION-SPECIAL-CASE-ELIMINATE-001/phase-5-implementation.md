# Phase 5: 実装

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 5                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | Phase 4                                           |
| 後続Phase  | Phase 6                                           |
| 作成日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 目的

`createQuestionAnswer()` 内の `notion` ハードコード特別ケースを削除し、
`SEMANTIC_LABEL_MAP` に `freeText` 情報を含むエントリを追加する。
`resolveSemanticLabel()` は既存契約を維持し、`resolveLabelEntry()` を新設して
`createQuestionAnswer()` だけが freeText を消費する形にする（TDD の Red → Green 移行）。

## 実行タスク

- 既存テスト回帰確認（実装前 baseline 確認）
- `QuestionSemanticLabelMap` 型を `SemanticLabelEntry` を使った構造へ拡張
- `SEMANTIC_LABEL_MAP` の `q5.notion` エントリをオブジェクト形式へ変更
- `resolveLabelEntry()` の追加実装と `resolveSemanticLabel()` の互換 wrapper 化
- `createQuestionAnswer()` 内の notion 特別ケース削除
- Green 確認: shared / desktop のテストが全 PASS することを確認
- 型チェック・lint 確認

## 参照資料

| 資料名               | パス                                                                                        | 用途               |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| Phase 4 テスト仕様書 | `outputs/phase-4/`                                                                          | テストケース参照   |
| 型定義ファイル       | `packages/shared/src/types/skill-wizard-label-map.ts`                                       | 型拡張先ファイル   |
| 実装ファイル         | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`               | 特別ケース削除対象 |
| テストファイル       | `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts`                        | テストケース参照   |
| 依存タスク仕様書     | `docs/30-workflows/ut-skill-wizard-w0-category-label-mapping-001/phase-5-implementation.md` | フォーマット参照   |

## 実行手順

### 0. 既存テスト回帰確認（baseline 確認）【必須】

```bash
# 変更前の既存テストを実行して baseline 確認
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts
# 期待: 既存テストのみが PASS すること（新規テストは FAIL）
```

### 1. 実装方針: Option 3 - helper 追加で既存契約を維持

`QuestionSemanticLabelMap` の値型を `string | { label: string; freeText?: string }` へ拡張する。
これにより `freeText` 情報をマップに統合でき、`createQuestionAnswer()` の特別ケースを削除できる。
`resolveSemanticLabel()` は `string | undefined` のまま残し、既存呼び出し元を壊さない。

### 2. 型定義変更（`packages/shared/src/types/skill-wizard-label-map.ts`）

```typescript
/**
 * SEMANTIC_LABEL_MAP の各エントリの値型。
 * - string: ラベルのみ（既存互換）
 * - { label: string; freeText?: string }: ラベル + freeText を持つエントリ
 */
export type SemanticLabelEntry = string | { label: string; freeText?: string };

/**
 * 質問IDと semantic default 値の UI ラベルへのマッピング型。
 * questionId → (rawValue → SemanticLabelEntry) の2段階構造。
 * rawValue は toLowerCase() 正規化後の文字列をキーに使用する。
 */
export type QuestionSemanticLabelMap = Record<
  string,
  Record<string, SemanticLabelEntry>
>;
```

### 3. SEMANTIC_LABEL_MAP の notion エントリ変更（同ファイル）

```typescript
export const SEMANTIC_LABEL_MAP: QuestionSemanticLabelMap = {
  q1: { 自分だけ: "自分のみ" },
  q2: {},
  q3: { scheduled: "定期実行" },
  q4: {},
  /**
   * Q5: 外部ツール連携 — lowercase semantic 値を UI 表示ラベルへ正規化
   * notion → { label: "その他", freeText: "Notion" } に変更（特別ケース解消）
   */
  q5: {
    slack: "Slack",
    github: "GitHub",
    notion: { label: "その他", freeText: "Notion" },
  },
  q6: { 週次: "週に1回" },
};
```

### 4. `resolveSemanticLabel()` 互換 wrapper / `resolveLabelEntry()` 追加（同ファイル）

**推奨方針**: 既存の `resolveSemanticLabel()` の後方互換を維持しつつ、
`resolveLabelEntry()` を新規追加し `createQuestionAnswer()` 側で呼び出す。

```typescript
/**
 * semantic default の rawValue を label + freeText の統一表現へ解決する純粋関数。
 * freeText 情報を含むオブジェクト型エントリにも対応する。
 *
 * @param value - 変換対象の raw 値（toLowerCase() 済みを推奨）
 * @param questionId - 質問ID（q1〜q6）
 * @param labelMap - 変換テーブル（省略時は SEMANTIC_LABEL_MAP を使用）
 * @returns SemanticLabelResult（label + freeText?）、または undefined
 *
 * @example
 * resolveLabelEntry("notion", "q5") // => { label: "その他", freeText: "Notion" }
 * resolveLabelEntry("slack", "q5")  // => "Slack"
 * resolveLabelEntry(undefined, "q5") // => undefined
 */
export type SemanticLabelResult = { label: string; freeText?: string };

export function resolveLabelEntry(
  value: string | undefined,
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): SemanticLabelResult | undefined {
  if (value === undefined) return undefined;
  const questionMap = labelMap[questionId];
  if (!questionMap) return { label: value };
  const entry = questionMap[value];
  if (entry === undefined) return { label: value };
  return typeof entry === "string" ? { label: entry } : entry;
}

export function resolveSemanticLabel(
  value: string | undefined,
  questionId: string,
  labelMap: QuestionSemanticLabelMap = SEMANTIC_LABEL_MAP,
): string | undefined {
  return resolveLabelEntry(value, questionId, labelMap)?.label;
}
```

### 5. `createQuestionAnswer()` 内の notion 特別ケース削除（`ConversationRoundStep.tsx`）

**削除対象コード（L164〜L166）**:

```typescript
// 削除: notion は "その他" へマップし、freeText に "Notion" を保持する特別ケース。
// resolveSemanticLabel 単体では freeText の設定ができないため先行チェックする。
if (normalizedKey === "notion" && options.includes("その他")) {
  return { selectedOptions: ["その他"], freeText: "Notion" };
}
```

**変更後の実装（`resolveLabelEntry()` を使用）**:

```typescript
import { resolveLabelEntry } from "../../../../../../../packages/shared/src/types/skill-wizard-label-map";

// ... （関数内）

const entry = resolveLabelEntry(normalizedKey, questionId);
const displayLabel = entry?.label ?? normalizedKey;
const freeTextValue = entry?.freeText ?? "";

if (options.includes(displayLabel)) {
  return { selectedOptions: [displayLabel], freeText: freeTextValue };
}

return { selectedOptions: [], freeText: freeTextValue || displayLabel };
```

### 6. Green 確認コマンド

```bash
# shared / desktop の targeted test 実行
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# 型チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint
```

### 7. 既存テスト回帰確認（実装後）

```bash
# shared / desktop の全体テスト実行
pnpm --filter @repo/shared test
pnpm --filter @repo/desktop test
```

## 統合テスト連携【必須】

| 判定項目                                    | 基準    | 結果      |
| ------------------------------------------- | ------- | --------- |
| notion 特別ケース削除後のテスト全 PASS      | PASS    | completed |
| 既存テスト回帰なし（slack/github 正常動作） | 全PASS  | completed |
| 型チェック（shared）                        | PASS    | completed |
| 型チェック（desktop）                       | PASS    | completed |
| lint                                        | 0 error | completed |

## 多角的チェック観点

| 観点     | 確認内容                                                                                 |
| -------- | ---------------------------------------------------------------------------------------- |
| 矛盾     | `SEMANTIC_LABEL_MAP` の notion エントリと `createQuestionAnswer()` の動作が一致するか    |
| 漏れ     | `resolveSemanticLabel()` と `resolveLabelEntry()` の後方互換が維持されているか           |
| 整合性   | 型定義変更が `QuestionSemanticLabelMap` を参照する全ファイルに反映されているか           |
| 依存関係 | 依存タスク `UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001` との差分が整合しているか |

## 成果物

| 成果物           | パス                                                                          | 説明                      |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------- |
| 型定義変更       | `packages/shared/src/types/skill-wizard-label-map.ts`                         | SemanticLabelEntry 型拡張 |
| 実装コード変更   | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | notion 特別ケース削除     |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`                                   | 変更内容の要約            |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`                                            | 変更対象ファイル一覧      |

## 完了条件

- [ ] baseline 確認（既存テスト全 PASS）実施済み
- [ ] `SemanticLabelEntry` 型が定義済み
- [ ] `QuestionSemanticLabelMap` 型が拡張済み
- [ ] `SEMANTIC_LABEL_MAP` の `q5.notion` がオブジェクト形式に変更済み
- [ ] `resolveLabelEntry()` 関数が実装済み
- [ ] `createQuestionAnswer()` 内の notion 特別ケースが削除済み
- [ ] テスト全 PASS（Green 確認）
- [ ] 既存テストへの悪影響なし（slack/github 正常動作確認）
- [ ] 型チェック（`pnpm typecheck`）が PASS（shared + desktop）
- [ ] lint がエラーなし
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. baseline 確認（既存テスト全 PASS 確認）
2. `SemanticLabelEntry` 型定義
3. `QuestionSemanticLabelMap` 型拡張
4. `SEMANTIC_LABEL_MAP` の notion エントリ変更
5. `resolveLabelEntry()` 実装
6. `createQuestionAnswer()` 特別ケース削除
7. Green 確認（テスト PASS）
8. 型チェック・lint 確認
9. 既存テスト回帰確認

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
