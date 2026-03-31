# 実装サマリー

## メタ情報

| 項目   | 値                                          |
| ------ | ------------------------------------------- |
| Phase  | 5                                           |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop       |
| 作成日 | 2026-03-31                                  |
| 現在地 | spec_created                                |
| 判定   | canonical draft 実装あり / close-out 未完了 |

## current fact

この branch では 3 層評価の canonical draft 実装が `.claude/skills/task-specification-creator/` に追加されている。一方で、mirror 同期、system spec sync、Phase 11 実測 evidence は未完了のため、workflow 全体は `spec_created` のまま維持する。

## 実装済みの要素

| 要素                       | 実体                                                                       |
| -------------------------- | -------------------------------------------------------------------------- |
| Layer 1 / Layer 2 実行骨格 | `evaluate-ui-ux-playwright-e2e.ts` + `evaluate-ui-ux-playwright.config.ts` |
| Layer 3 CLI                | `evaluate-ui-ux.js`                                                        |
| prompt 外部化              | `agents/evaluate-ui-ux.md` + `evaluate-ui-ux-prompt-loader.js`             |
| レポート生成               | `evaluate-ui-ux-report-formatter.js`                                       |
| HIGH 問題の task 化        | `evaluate-ui-ux-unassigned-task.js`                                        |
| 単体テスト                 | `scripts/__tests__/evaluate-ui-ux*.test.ts`                                |

## 今回の補正

| 対象                     | Before                                         | After                                      | 理由                             |
| ------------------------ | ---------------------------------------------- | ------------------------------------------ | -------------------------------- |
| `evaluate-ui-ux.js`      | `--task-id` を受けても評価コンテキストに未反映 | CLI 引数を `evaluateUIWithClaude()` に渡す | タスク単位の評価文脈ドリフト防止 |
| `evaluate-ui-ux.js`      | screenshot 0 件でも評価処理へ進む              | 0 件時に明示エラー                         | false green 防止                 |
| `evaluate-ui-ux.test.ts` | 上記 2 点の回帰テストなし                      | taskContext 受け渡しと 0 件エラーを追加    | 仕様逸脱の再発防止               |

## 未完了の要素

| 対象                      | 状態   | 次アクション                                  |
| ------------------------- | ------ | --------------------------------------------- |
| `.agents` mirror          | 未同期 | canonical 差分を same-wave 反映               |
| aiworkflow-requirements   | 未同期 | task ledger / lessons / logs / indexes を更新 |
| representative screenshot | 未取得 | Phase 11 実行時に actual capture へ置換       |
| Phase 11/12 判定          | 未確定 | 実測 evidence 後に再判定                      |
