# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 1                                                 |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 |
| 機能名     | notion-freetext-special-case-eliminate            |
| 前提Phase  | -                                                 |
| 後続Phase  | Phase 2                                           |
| 作成日     | 2026-04-15                                        |
| ステータス | completed                                         |

## 目的

`ConversationRoundStep.tsx` に残置された `notion` 専用ハードコード特別ケースの現状を確認し、
解消要件と受け入れ基準を固定する。

## 実行タスク

- P50チェック: 対象ファイルの現状確認・既実装コードの inventory 調査
- 特別ケース問題点の整理: ハードコードが残存する技術的原因の明示
- 受け入れ基準定義: AC-1〜AC-4を検証可能な形で固定
- タスク分類宣言: 本タスクは **リファクタリングタスク / 非UIタスク / NON_VISUAL**（内部ロジック中心）

## 参照資料

| 資料名                       | パス                                                                          | 用途                               |
| ---------------------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| ConversationRoundStep.tsx    | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 特別ケース箇所の確認               |
| skill-wizard-label-map.ts    | `packages/shared/src/types/skill-wizard-label-map.ts`                         | 現行型定義・SEMANTIC_LABEL_MAP確認 |
| GitHub Issue #2089           | [#2089](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2089)      | 要件原本・設計オプション参照       |
| aiworkflow-requirements refs | `.claude/skills/aiworkflow-requirements/references/`                          | プロジェクト共通仕様参照           |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# ConversationRoundStep.tsx の最近のコミット履歴確認
git log --oneline -10 -- apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# notion 特別ケースが現在も存在するか確認
grep -n "notion\|freeText.*Notion" apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# skill-wizard-label-map.ts の最近のコミット履歴確認
git log --oneline -10 -- packages/shared/src/types/skill-wizard-label-map.ts

# QuestionSemanticLabelMap 型の現状確認
grep -n -A 5 "QuestionSemanticLabelMap" packages/shared/src/types/skill-wizard-label-map.ts

# resolveSemanticLabel の現状確認
grep -n -A 15 "^export function resolveSemanticLabel" packages/shared/src/types/skill-wizard-label-map.ts

# 既存テストファイルの確認
ls packages/shared/src/types/__tests__/ | grep label
```

### 1. 現在の特別ケースの問題点整理

現行の `ConversationRoundStep.tsx`（L162〜L165）の特別ケース:

```typescript
// notion は "その他" へマップし、freeText に "Notion" を保持する特別ケース。
// resolveSemanticLabel 単体では freeText の設定ができないため先行チェックする。
if (normalizedKey === "notion" && options.includes("その他")) {
  return { selectedOptions: ["その他"], freeText: "Notion" };
}
```

**問題点**:

| 問題               | 詳細                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| ロジック分散       | 変換ロジックが `packages/shared` と `apps/desktop` の2箇所に存在し、一元管理できていない            |
| 型制約による回避策 | `QuestionSemanticLabelMap` が `Record<string, Record<string, string>>` のため `freeText` を持てない |
| 拡張性の欠如       | 将来同様の `freeText` 付き変換が必要な場合、同様の特別ケースを都度追加する必要がある                |
| テスト困難         | `ConversationRoundStep.tsx` に埋め込まれた変換ロジックは shared 層のユニットテストでカバーできない  |

### 2. 現行型定義の確認

`packages/shared/src/types/skill-wizard-label-map.ts` の現状:

```typescript
export type QuestionSemanticLabelMap = Record<string, Record<string, string>>;

export const SEMANTIC_LABEL_MAP: QuestionSemanticLabelMap = {
  q1: { 自分だけ: "自分のみ" },
  q2: {},
  q3: { scheduled: "定期実行" },
  q4: {},
  q5: { slack: "Slack", github: "GitHub", notion: "その他" },
  q6: { 週次: "週に1回" },
};
```

**制約**: `Record<string, string>` の値型は `string` のみのため、`freeText` メタデータを追加できない。

### 3. 受け入れ基準の固定

| ID   | 受け入れ基準                                                        | 検証方法                                                                                        |
| ---- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| AC-1 | `notion` 変換が `SEMANTIC_LABEL_MAP` 経由で動作すること             | テスト: `resolveLabelEntry("notion", "q5")` が `{ label: "その他", freeText: "Notion" }` を返す |
| AC-2 | `createQuestionAnswer()` 内の notion 特別ケースが削除されること     | `grep -n "notion" ConversationRoundStep.tsx` で特別ケースコードが存在しない                     |
| AC-3 | 既存の `resolveSemanticLabel()` テストが全て通過すること            | `pnpm --filter @repo/shared exec vitest run` が PASS                                            |
| AC-4 | TypeScript 型チェック（`pnpm typecheck`）がエラーなしで通過すること | `pnpm typecheck` が 0 error                                                                     |

### 4. タスク分類の宣言

| 分類項目   | 値                                         |
| ---------- | ------------------------------------------ |
| タスク種別 | リファクタリングタスク                     |
| UIタスク   | 非UIタスク（UIの見た目変更なし）           |
| 可視性     | NON_VISUAL（動作は同一、内部構造のみ変更） |
| テスト種別 | ユニットテスト（shared 層）                |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果      |
| ---------------------- | ---- | --------- |
| ユニットテストLine     | 80%+ | completed |
| ユニットテストBranch   | 60%+ | completed |
| ユニットテストFunction | 80%+ | completed |

## 多角的チェック観点

| 観点           | チェック内容                                                                |
| -------------- | --------------------------------------------------------------------------- |
| 後方互換性     | `resolveSemanticLabel()` の既存契約が維持され、既存呼び出し元に影響しないか |
| 依存タスク整合 | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 の成果物との整合         |
| テスト網羅性   | 既存テスト + notion 新テストの共存確認                                      |
| 型安全性       | 拡張後の型定義が TypeScript の型推論を妨げないか                            |

## 成果物

| 成果物       | パス                                         | 説明                         |
| ------------ | -------------------------------------------- | ---------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・AC一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧             |

## 完了条件

- [ ] P50チェック実施済み（notion 特別ケースが ConversationRoundStep.tsx L162〜L165 に存在することを確認）
- [ ] 現行 `QuestionSemanticLabelMap` 型定義（`Record<string, Record<string, string>>`）を確認済み
- [ ] 特別ケースの問題点（4点）を整理済み
- [ ] AC-1〜AC-4 が検証可能な形で定義されている
- [ ] タスク分類（リファクタリング / 非UIタスク / NON_VISUAL）を宣言済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50チェック（特別ケース存在確認・型定義確認）
2. 特別ケース問題点の整理
3. 現行型定義の確認
4. 受け入れ基準（AC-1〜AC-4）の固定
5. タスク分類の宣言
6. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 2: 設計
