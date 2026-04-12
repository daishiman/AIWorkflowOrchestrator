# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 1                                                     |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応 |
| 前提Phase  | -                                                     |
| 後続Phase  | Phase 2                                               |
| 作成日     | 2026-04-11                                            |
| ステータス | pending                                               |
| タスク分類 | リファクタリング（NON_VISUAL / docs-only ではない）   |

---

## 目的

`ConversationRoundStep.tsx` 内の `resolveSemanticLabel()` 変換テーブルが
ハードコードされており、将来の入力元拡張時に管理が困難になる問題を解消する。
`@repo/shared` に `QuestionSemanticLabelMap` 型と正準マッピング定数を配置し、
変換ロジックを外部から参照可能な設計（設定駆動型）へ移行する。

---

## Step 0: P50チェック（必須）

Phase 1 開始前に、対象ファイルの実装状態を確認して重複作業を防止する。

```bash
# 現在の実装確認
git log --oneline -5

# 対象ファイルの存在確認
grep -rn "resolveSemanticLabel" apps/desktop/src/
grep -rn "applySmartDefaults" apps/desktop/src/
grep -rn "QuestionSemanticLabelMap" packages/shared/src/

# 既存型定義の確認
grep -rn "skill-wizard-label-map" packages/shared/src/
```

**確認事項:**

- `resolveSemanticLabel` が `ConversationRoundStep.tsx` にハードコードで存在することを確認
- `QuestionSemanticLabelMap` が `packages/shared` に存在しないことを確認（未作成）
- 前タスク（UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001）の成果物を棚卸し

---

## 背景

| 問題                                   | 影響                                              |
| -------------------------------------- | ------------------------------------------------- |
| 変換テーブルが UI コンポーネントに存在 | 将来の入力元拡張時に変換ロジックが分散する        |
| q5/q6 の正規化ルールが暗黙的           | 「自分だけ」→「自分のみ」のような silent mismatch |
| 単一ファイル内にビジネスルールが混在   | テストが網羅しにくい構造                          |

---

## 実行タスク

### Task 1: 既存コードのインベントリ確認

```bash
# ConversationRoundStep.tsx の現在の実装を確認
grep -n "resolveSemanticLabel\|applySmartDefaults\|inferSmartDefaults" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# 既存テストファイルの確認
find apps/desktop/src -name "*.test.*" | xargs grep -l "applySmartDefaults\|ConversationRoundStep" 2>/dev/null

# @repo/shared の現在のエクスポート確認
grep -n "export" packages/shared/index.ts | head -30
```

**記録すべき情報:**

- `resolveSemanticLabel()` の現在の変換テーブル（q1〜q6）の全エントリ
- `applySmartDefaults()` の現在のシグネチャと返り値型
- 既存テスト件数と対象 describe/it 文字列

### Task 2: 命名規則の確認

```bash
# 既存の shared 型ファイルの命名規則確認
ls packages/shared/src/types/
# camelCase / kebab-case のどちらが主流かを確認
```

**記録:** `skill-wizard-label-map.ts` が命名規則と整合しているか確認し記録する。

### Task 3: aiworkflow-requirements 仕様抽出

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js \
  --keywords "skill-wizard,ConversationRoundStep,shared,type,refactoring"
```

**参照すべきカテゴリ:**

- UI/UX仕様: shared データフロー境界
- アーキテクチャ: packages/shared への型配置ルール
- 品質要件: リファクタリング時の回帰テスト基準

### Task 4: 受け入れ基準の確定

下記の受け入れ基準を検証可能な形で固定する。

---

## 受け入れ基準

| ID   | 基準                                                                               | 検証コマンド                                                                                                                                          |
| ---- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `QuestionSemanticLabelMap` 型が `@repo/shared` からインポートできる                | TypeScript コンパイル通過                                                                                                                             |
| AC-2 | `resolveSemanticLabel()` が `ConversationRoundStep.tsx` 内にハードコードを持たない | `grep -n "案\|だけ\|のみ" ConversationRoundStep.tsx` で変換テーブルが消えている                                                                       |
| AC-3 | `applySmartDefaults()` テストが10件以上存在し全件 PASS                             | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx --reporter=verbose` でPASS |
| AC-4 | 正準形対応表が `outputs/phase-3/design-decisions.md` に文書化されている            | ファイル存在確認 + 内容確認                                                                                                                           |
| AC-5 | 既存のウィザード動作が変わらない（回帰テスト）                                     | vitest 全件 PASS（追加前後で同一結果）                                                                                                                |

---

## 参照資料

### 実装・コード

| 資料名                     | パス                                                                           | 用途                            |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------------------- |
| ConversationRoundStep      | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`  | 変換テーブル現状確認            |
| shared types ディレクトリ  | `packages/shared/src/types/`                                                   | 型配置先の現状確認              |
| shared index (barrel)      | `packages/shared/index.ts`                                                     | エクスポート追加先確認          |
| 既存スキルウィザードテスト | `apps/desktop/src/renderer/components/skill/wizard/__tests__/`（存在する場合） | 既存テスト件数の棚卸し          |
| inferSmartDefaults         | `packages/shared/src/` 内の該当ファイル                                        | semantic default 返り値の型確認 |

### システム仕様（aiworkflow-requirements）

| 資料名                | パス                                                                         | 用途                     |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| UI/UX 仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-wizard.md`    | ウィザード状態遷移仕様   |
| shared パッケージ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-packages.md` | shared 型配置ルール      |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | リファクタリング品質基準 |
| リソースマップ        | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`             | 抽出漏れ防止             |

---

## 実行手順

1. **Step 0** を実行してインベントリを確認する
2. `ConversationRoundStep.tsx` の `resolveSemanticLabel()` の全変換エントリを書き出す
3. aiworkflow-requirements から shared 型配置ルールを抽出する
4. 受け入れ基準（AC-1〜AC-5）を検証可能な形で固定する
5. `outputs/phase-1/` に成果物を保存する

---

## 統合テスト連携

- `applySmartDefaults()` の入出力仕様を Phase 4 のテストマトリクスに引き継ぐ
- q1〜q6 の変換エントリを Phase 2 の型設計に引き継ぐ
- 既存テスト件数を Phase 6 の拡充目標のベースラインとして記録する

---

## 多角的チェック観点（AIが判断）

| 思考法       | 確認内容                                                 |
| ------------ | -------------------------------------------------------- |
| システム思考 | shared への移動が他コンポーネントに影響しないか          |
| 逆説思考     | shared に置いて却って管理が分散しないか                  |
| 水平思考     | option registry 以外に設定駆動化の手段があるか           |
| トレードオン | shared 配置の利便性 vs ビルド依存増加のコスト            |
| 素人思考     | 変換テーブルが shared にあることが分かりにくくならないか |

---

## 成果物

| 成果物名                           | パス                                                         | 必須 |
| ---------------------------------- | ------------------------------------------------------------ | ---- |
| 要件定義書                         | `outputs/phase-1/requirements-definition.md`                 | ✅   |
| 受け入れ基準                       | `outputs/phase-1/acceptance-criteria.md`                     | ✅   |
| 仕様抽出結果                       | `outputs/phase-1/aiworkflow-requirements-extraction.md`      | ✅   |
| 差分カバレッジ（インベントリ棚卸） | `outputs/phase-1/branch-diff-coverage.md`                    | ✅   |
| トレーサビリティ行列               | `outputs/phase-1/implementation-spec-traceability-matrix.md` | ✅   |

---

## 完了条件

- [ ] `resolveSemanticLabel()` の全変換エントリ（q1〜q6）が文書化されている
- [ ] 既存テスト件数（ベースライン）が記録されている
- [ ] AC-1〜AC-5 が検証可能な形で定義されている
- [ ] shared 型配置ルールが aiworkflow-requirements から抽出されている
- [ ] 命名規則（kebab-case / camelCase）が確認されている

## タスク100%実行確認【必須】

- [ ] Task 1: 既存コードのインベントリ確認 ✅
- [ ] Task 2: 命名規則の確認 ✅
- [ ] Task 3: aiworkflow-requirements 仕様抽出 ✅
- [ ] Task 4: 受け入れ基準の確定 ✅
- [ ] 全成果物が `outputs/phase-1/` に保存されていること ✅

---

## 次Phase

完了後 → **Phase 2: 設計**（`phase-2-design.md`）へ進む。
Phase 1〜3 が完了するまで Phase 4 には着手しない。
