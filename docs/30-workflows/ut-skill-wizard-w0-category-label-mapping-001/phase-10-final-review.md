# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 10                                            |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | Phase 9                                       |
| 後続Phase  | Phase 11（PASS）                              |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## 目的

Phase 1〜9 の全成果物を統合的にレビューし、受け入れ基準（AC-1〜AC-3）の充足を最終確認する。
MINOR 指摘は未タスク化、MAJOR は戻りフェーズを確定する。

## 実行タスク

- 受け入れ基準最終チェック: AC-1〜AC-3の全充足確認
- Phase横断レビュー: Phase 1〜9の成果物一貫性確認
- MINOR判定記録: 指摘事項の未タスク化判断
- Phase 11 進行判定: PASS/MINOR/MAJOR 判定

## 参照資料

| 資料名           | パス                                         | 用途               |
| ---------------- | -------------------------------------------- | ------------------ |
| Phase 1 要件定義 | `outputs/phase-1/requirements-definition.md` | AC確認             |
| Phase 3 レビュー | `outputs/phase-3/gate-decision.md`           | MINOR追跡確認      |
| Phase 9 品質保証 | `outputs/phase-9/quality-report.md`          | 品質ゲート結果確認 |
| 実装ファイル     | `packages/shared/src/types/skillCreator.ts`  | 最終コード確認     |

## 実行手順

### 1. 受け入れ基準最終チェック

| AC ID | 受け入れ基準                                                                   | 確認方法                                                         | 判定    |
| ----- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------- |
| AC-1  | 全5件の `SkillCategory` 値に対応する日本語ラベルが定義されている               | `SKILL_CATEGORY_LABELS` の5件全値確認                            | pending |
| AC-2  | `SKILL_CATEGORY_LABELS` と `getSkillCategoryLabel()` がエクスポートされている  | `grep -n "export.*SKILL_CATEGORY_LABELS\|getSkillCategoryLabel"` | pending |
| AC-3  | `Record<SkillCategory, string>` 型により新カテゴリ追加時に型チェックで検出可能 | `pnpm typecheck` PASS                                            | pending |

### 2. Phase横断成果物一貫性チェック

| Phase | 主な成果物                   | 一貫性確認項目                                        | 判定    |
| ----- | ---------------------------- | ----------------------------------------------------- | ------- |
| 1     | requirements-definition.md   | AC-1〜AC-3が仕様に反映されているか                    | pending |
| 2     | design.md                    | 実装コードが設計と一致しているか                      | pending |
| 3     | gate-decision.md             | MINOR指摘が追跡・解消されているか                     | pending |
| 4     | テストコード（TC-01〜TC-09） | テスト名と仕様番号が対応しているか                    | pending |
| 5     | skillCreator.ts（実装）      | SKILL_CATEGORY_LABELS + getSkillCategoryLabel実装済み | pending |
| 6     | テストコード（TC-10〜TC-13） | エッジケーステストが追加されているか                  | pending |
| 7     | coverage-report.md           | カバレッジ目標達成                                    | pending |
| 8     | refactoring-log.md           | 変更なし or Before/After記録済み                      | pending |
| 9     | quality-report.md            | 品質ゲート全項目PASS                                  | pending |

### 3. 最終判定

| 判定  | 条件                                                   | 戻り先                                |
| ----- | ------------------------------------------------------ | ------------------------------------- |
| PASS  | AC-1〜AC-3全充足 + Phase横断チェック全PASS             | Phase 11                              |
| MINOR | 軽微な改善点あり（機能に影響なし・Phase 12で解消可能） | Phase 11（MINOR未タスク化を同時実施） |
| MAJOR | AC充足不足 or 設計上の重大問題                         | 問題のPhaseに戻る                     |

### 4. MINOR指摘の未タスク化ルール

MINOR判定の指摘事項は以下の3ステップで未タスク化する:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に未タスク参照リンクを追加

## 統合テスト連携【必須】

| 判定項目          | 基準   | 結果    |
| ----------------- | ------ | ------- |
| AC-1〜AC-3 全充足 | PASS   | pending |
| Phase横断一貫性   | 全PASS | pending |

## 成果物

| 成果物           | パス                                      | 説明                                       |
| ---------------- | ----------------------------------------- | ------------------------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR判定・AC充足確認・指摘事項 |

## 完了条件

- [ ] AC-1〜AC-3が全て充足されていること
- [ ] Phase横断成果物の一貫性チェック完了
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR指摘があれば未タスク化3ステップを実施済み
- [ ] 最終レビュー結果（`outputs/phase-10/final-review-result.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 受け入れ基準最終チェック（AC-1〜AC-3）
2. Phase横断成果物一貫性チェック
3. 総合判定（PASS/MINOR/MAJOR）の記録
4. MINOR指摘の未タスク化（該当する場合）
5. 最終レビュー結果の作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 11: 手動テスト（PASS または MINOR の場合）
対象Phaseへ戻る（MAJOR の場合）
