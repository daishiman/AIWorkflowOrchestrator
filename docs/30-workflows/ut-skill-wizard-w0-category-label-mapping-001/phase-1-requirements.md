# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | -                                             |
| 後続Phase  | Phase 2                                       |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## 目的

`SkillCategory` 型の現状を確認し、日本語ラベルマッピング実装の要件と受け入れ基準を固定する。

## 背景

W0-seq-01 で `SkillCategory` 型が `packages/shared/src/types/skillCreator.ts` に定義されたが、
UI表示用の日本語ラベルが未実装のため、ドロップダウン等に英語識別子がそのまま表示されている。
本タスクはそのマッピング定数・関数を同ファイルに追加する小規模タスクである。

## 実行タスク

- P50チェック: 対象ファイルの現状確認・既実装コードのinventory調査
- SkillCategory型確認: 実際の型定義値の列挙と確認
- 受け入れ基準定義: AC-1〜AC-3を検証可能な形で固定
- タスク分類宣言: docs-only task か UI task か（本タスクは **実装タスク + 非UIタスク**）

## 参照資料

| 資料名              | パス                                                                     | 用途                           |
| ------------------- | ------------------------------------------------------------------------ | ------------------------------ |
| SkillCategory型定義 | `packages/shared/src/types/skillCreator.ts`                              | 現行の型定義確認（L948〜L953） |
| 既存テストファイル  | `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`        | テスト追加先の現状確認         |
| GitHub Issue        | [#2001](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2001) | 要件原本                       |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# 対象ファイルの最近のコミット履歴確認
git log --oneline -10 -- packages/shared/src/types/skillCreator.ts

# SKILL_CATEGORY_LABELS が既に実装されていないか確認
grep -n "SKILL_CATEGORY_LABELS\|getSkillCategoryLabel" packages/shared/src/types/skillCreator.ts

# SkillCategory型定義の現状確認
grep -n -A 10 "^export type SkillCategory" packages/shared/src/types/skillCreator.ts
```

### 1. SkillCategory型の確認

現行コード（L948〜L953）での型定義:

```typescript
export type SkillCategory =
  | "automation"
  | "external-integration"
  | "data-analysis"
  | "code-support"
  | "other";
```

### 2. 命名規則の確認

```bash
# 既存の定数命名規則（UPPER_SNAKE_CASE）確認
grep -n "^export const [A-Z_]*" packages/shared/src/types/skillCreator.ts | head -10

# 既存の関数命名規則（camelCase）確認
grep -n "^export function\|^export const.*=.*(" packages/shared/src/types/skillCreator.ts | head -10
```

### 3. 受け入れ基準の固定

| ID   | 受け入れ基準                                                                                       | 検証方法                                                         |
| ---- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| AC-1 | 全5件の `SkillCategory` 値に対応する日本語ラベルが定義されている                                   | テストケース: 各値のラベル取得が期待値と一致すること             |
| AC-2 | `SKILL_CATEGORY_LABELS` と `getSkillCategoryLabel()` がエクスポートされている                      | `grep -n "export.*SKILL_CATEGORY_LABELS\|getSkillCategoryLabel"` |
| AC-3 | `Record<SkillCategory, string>` 型注釈により、新カテゴリ追加時に未定義ラベルをTypeScriptが検出する | `pnpm typecheck` が通ること（型網羅性チェック）                  |

### 4. マッピング定義（仕様）

| SkillCategory          | 日本語ラベル   | 備考 |
| ---------------------- | -------------- | ---- |
| `automation`           | 自動化         |      |
| `external-integration` | 外部連携       |      |
| `data-analysis`        | データ分析     |      |
| `code-support`         | コードサポート |      |
| `other`                | その他         |      |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果    |
| ---------------------- | ---- | ------- |
| ユニットテストLine     | 80%+ | pending |
| ユニットテストBranch   | 60%+ | pending |
| ユニットテストFunction | 80%+ | pending |

## 成果物

| 成果物       | パス                                         | 説明                         |
| ------------ | -------------------------------------------- | ---------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・AC一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧             |

## 完了条件

- [ ] P50チェック実施済み（`SKILL_CATEGORY_LABELS`/`getSkillCategoryLabel` の既実装がないことを確認）
- [ ] 現行 `SkillCategory` 型定義（5値）を確認済み
- [ ] 命名規則（定数: UPPER_SNAKE_CASE、関数: camelCase）を確認済み
- [ ] AC-1〜AC-3が検証可能な形で定義されている
- [ ] タスク分類（**実装タスク / 非UIタスク / NON_VISUAL**）を宣言済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50チェック（重複実装なし確認）
2. SkillCategory型定義の確認
3. 命名規則の確認
4. 受け入れ基準（AC-1〜AC-3）の固定
5. 成果物の出力
6. 完了条件の判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
