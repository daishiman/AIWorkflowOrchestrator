# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 3                                             |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | Phase 2                                       |
| 後続Phase  | Phase 4（PASS時）                             |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## 目的

Phase 2 の設計内容を多角的にレビューし、Phase 4（テスト作成）への進行可否を判定する。

## 実行タスク

- 設計一貫性チェック: 型・定数・関数のシグネチャが矛盾なく整合しているか
- AC整合チェック: 設計がAC-1〜AC-3を全て満たしているか
- 命名規則チェック: 既存コードの命名パターンと一致しているか（`[FB-SDK-07-4]`）
- リスクチェック: 型網羅性・エクスポート・ハイフン含むキー記法に問題がないか
- MINOR追跡テーブル: 指摘事項があれば記録

## 参照資料

| 資料名          | パス                                         | 用途             |
| --------------- | -------------------------------------------- | ---------------- |
| Phase 1 成果物  | `outputs/phase-1/requirements-definition.md` | 要件・AC参照     |
| Phase 2 成果物  | `outputs/phase-2/design.md`                  | 設計書参照       |
| skillCreator.ts | `packages/shared/src/types/skillCreator.ts`  | 既存命名規則確認 |

## 実行手順

### 1. 設計一貫性チェック

| チェック項目                                                        | 判定基準                                                                       | 結果    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------- |
| `SKILL_CATEGORY_LABELS` の型が `Record<SkillCategory, string>`      | TypeScript で型エラーなし                                                      | pending |
| 5件全ての `SkillCategory` 値がキーとして存在する                    | `automation`, `external-integration`, `data-analysis`, `code-support`, `other` | pending |
| `getSkillCategoryLabel()` が `SKILL_CATEGORY_LABELS` を参照している | 関数実装で定数を使用                                                           | pending |
| `as const` アサーションが適切に付与されている                       | コンパイルエラーなし                                                           | pending |

### 2. AC整合チェック

| AC ID | 設計対応                                                                       | 充足判定 |
| ----- | ------------------------------------------------------------------------------ | -------- |
| AC-1  | 5件全値を `SKILL_CATEGORY_LABELS` に列挙                                       | pending  |
| AC-2  | `export const SKILL_CATEGORY_LABELS` + `export function getSkillCategoryLabel` | pending  |
| AC-3  | `Record<SkillCategory, string>` 型で型網羅性を保証                             | pending  |

### 3. 命名規則チェック（`[FB-SDK-07-4]` 対応）

```bash
# 既存の定数命名パターン確認（UPPER_SNAKE_CASE）
grep -n "^export const [A-Z]" packages/shared/src/types/skillCreator.ts

# 既存の関数命名パターン確認（camelCase）
grep -n "^export function [a-z]" packages/shared/src/types/skillCreator.ts
```

| 確認項目                                      | 期待パターン     | 結果    |
| --------------------------------------------- | ---------------- | ------- |
| 定数名 `SKILL_CATEGORY_LABELS`                | UPPER_SNAKE_CASE | pending |
| 関数名 `getSkillCategoryLabel`                | camelCase        | pending |
| ハイフン含む値の記法 `"external-integration"` | quoted key記法   | pending |

### 4. リスクチェック

| リスク                                             | 評価                                                     | 対応           |
| -------------------------------------------------- | -------------------------------------------------------- | -------------- |
| `SkillCategory` が変更された場合の追従             | `Record<SkillCategory, string>` 型でTypeScriptが検出する | 設計で吸収済み |
| root barrel (`@repo/shared/index.ts`) の変更リスク | 本タスクは subpath export に閉じる（`[Feedback W0-01]`） | 影響なし       |
| 既存テストファイルへの影響                         | 追加のみ・既存テストは不変                               | 影響なし       |
| `as const` と `Record<T,U>` の型互換               | `as const` + `Record` の組み合わせは TypeScript で有効   | 問題なし       |

### 5. レビュー判定

**総合判定**: PASS / MINOR / MAJOR（実行時に記録）

| 判定  | 戻り先  | 判定基準                               |
| ----- | ------- | -------------------------------------- |
| PASS  | Phase 4 | 全チェック項目でリスクなし             |
| MINOR | Phase 4 | 小さな指摘事項（実装時に並行解消可能） |
| MAJOR | Phase 2 | 設計の根本的な問題（再設計が必要）     |

### 6. MINOR追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ---------------- | -------- | ------------- | ------------- | ---- |
| （実行時に記録） | -        | -             | -             | -    |

## 統合テスト連携【必須】

| 判定項目   | 基準    | 結果    |
| ---------- | ------- | ------- |
| 型チェック | PASS    | pending |
| lint       | 0 error | pending |

## 成果物

| 成果物           | パス                               | 説明                           |
| ---------------- | ---------------------------------- | ------------------------------ |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | PASS/MINOR/MAJOR判定・指摘事項 |

## 完了条件

- [ ] 設計一貫性チェック（4項目）が完了
- [ ] AC-1〜AC-3の設計対応が確認済み
- [ ] 命名規則チェックが完了
- [ ] リスクチェックが完了
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR判定の指摘事項があれば追跡テーブルに記録
- [ ] Phase 4 開始条件（PASS or MINOR）が充足されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 設計一貫性チェック
2. AC整合チェック
3. 命名規則チェック
4. リスクチェック
5. 総合判定記録
6. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 4: テスト作成（PASS または MINOR の場合）
Phase 2: 設計（MAJOR の場合）
