# Phase 2 同期ルール設計書

- タスクID: UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
- 作成日: 2026-02-25
- 担当SubAgent: SubAgent-A

## 3点同期ルール（正規順序）

1. `task-workflow.md` を更新する
2. `aiworkflow-requirements/SKILL.md` を更新する
3. `task-specification-creator/SKILL.md` を更新する
4. `aiworkflow-requirements/LOGS.md` を更新する
5. `task-specification-creator/LOGS.md` を更新する

## 検証ルール

- 参照整合: `verify-unassigned-links.js` が `ALL_LINKS_EXIST`
- 索引整合: `generate-index.js` 実行後に索引更新が成功
- SKILL整合: 2スキルとも `Skill is valid!`

## baseline/current 判定ルール

- baseline: 着手前から存在する違反（スコープ外記録）
- current: 今回変更で発生した違反（修正必須）

## フォールバックルール

- 監査スクリプト失敗時は `detect-unassigned-tasks --scan <変更範囲>` で current 判定を補助
- スクリプト非存在時は対象ファイルを手動突合し、同じ判定フォーマットで記録

## 更新トリガー

- 未タスク作成時
- 未タスク完了移管時
- Phase 12 Task 2 Step 1-A 完了時
