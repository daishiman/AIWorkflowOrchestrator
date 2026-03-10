# Phase 12 Task 5: スキルフィードバックレポート

## メタ情報

| 項目     | 内容                            |
| -------- | ------------------------------- |
| タスクID | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase    | 12                              |
| 作成日   | 2026-03-10                      |

---

## 良かった点

| 観点         | 内容                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| スコープ分離 | Preload timeout 実装、UI 影響確認、system spec 同期を分離して扱えた                                      |
| 画面検証     | 明示 screenshot 要求に対し、dedicated harness + `screenshot-plan.json` + coverage validator で完了できた |
| 再監査       | stale status と planned wording を後追いではなく同ターンで解消できた                                     |

## 改善が必要な点

| 項目                      | 改善提案                                                                 |
| ------------------------- | ------------------------------------------------------------------------ |
| Phase 12 出力テンプレート | `PR マージ時に実施予定` を残さないチェックを明示ルール化する             |
| implementation guide      | timeout タスクでは cleanup 採用 / 不採用の判断を必須記載項目にする       |
| Phase 11 文書名           | `manual-test-result.md` を正本として先に示し、複数形とのドリフトを防ぐ   |
| 非UIタスクの画面検証      | 「明示 screenshot 要求時は影響 UI を代表撮影する」条件をガイドへ固定する |

## 今回反映したい運用知見

1. timeout タスクは `発火` だけでなく `cleanup` まで acceptance に含める。
2. screenshot で見つかった別責務の課題は未タスク化して主タスク完了と分離する。
3. workflow outputs と system spec 正本は同一ターンで更新し、planned wording を残さない。

## 参考コマンド

| 用途                | コマンド                                                                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workflow 検証       | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001`                     |
| screenshot coverage | `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001` |
| preload 回帰        | `cd apps/desktop && pnpm vitest run src/preload`                                                                                                                              |
