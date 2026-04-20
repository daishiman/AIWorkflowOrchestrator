# リファクタリング決定ログ

## リファクタリング判断テーブル

| 対象                | Before（旧）             | After（正）                       | 理由                             |
| ------------------- | ------------------------ | --------------------------------- | -------------------------------- |
| cleanup 実行位置    | `finally` ブロック       | `catch` ブロック                  | 実コード実態に合わせる           |
| 保護フラグ          | `createdByThisRun`       | `skillDirExistedBefore`           | 実コードのフィールド名に合わせる |
| task 分類           | docs-only 混在           | NON_VISUAL code task              | Phase 11/12 規約に合わせる       |
| 成果物名            | `report` / `result` 混在 | canonical 名へ統一                | phase 間参照切れ防止             |
| Phase 11 の証跡     | スクリーンショット前提   | 代替証跡（manual-test-result.md） | NON_VISUAL code task の規約      |
| Phase 12 の視覚証跡 | 未定義                   | `## 視覚証跡` セクションで明示    | NON_VISUAL 方針を明文化          |

## 削除した冗長記述

| 削除対象                                                | 削除理由                     |
| ------------------------------------------------------- | ---------------------------- |
| `finally + createdByThisRun` への移行提案               | 実装不要。既存実装が正しい   |
| `createdByThisRun` フラグの設計説明                     | 使用していない               |
| スクリーンショット必須の記述                            | NON_VISUAL task に該当しない |
| 旧 artifact 名（`*-report.md` と `*-result.md` の混在） | canonical 名に統一           |

## 追加した明示事項

| 追加項目                                     | 追加理由                             |
| -------------------------------------------- | ------------------------------------ |
| `cleanupCancelledSkillDir` の署名と動作説明  | 実コードとの整合性                   |
| `skillDirExistedBefore` の事前確認タイミング | try ブロック前に確認することの重要性 |
| NON_VISUAL close-out 方針                    | Phase 11/12 を正しく完了させるため   |
| artifacts.json parity 要件                   | AC-5 を明文化するため                |

## リファクタリング後の品質改善

| 指標                    | Before             | After                         |
| ----------------------- | ------------------ | ----------------------------- |
| spec と実コードの整合性 | FAIL（前提が違う） | PASS（catch 前提）            |
| artifact 名の一貫性     | FAIL（混在）       | PASS（canonical 統一）        |
| Phase 11/12 の明確さ    | FAIL（未定義）     | PASS（NON_VISUAL 方針が明確） |
| 4条件評価               | 全 FAIL            | 全 PASS                       |
