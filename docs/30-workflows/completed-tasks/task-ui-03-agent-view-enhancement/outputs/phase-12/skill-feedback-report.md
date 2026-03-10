# Phase 12: スキルフィードバックレポート

## ワークフロー改善点

| 項目           | 内容                                                                                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint 実行経路  | workflow 仕様が `pnpm --filter @repo/desktop lint` 前提でも、package script 不在ケースを fallback 手順として明文化したい                                    |
| Phase 11 撮影  | UI タスクは dedicated harness route を早めに許可した方が、main shell 初期化ノイズを避けやすい                                                               |
| validator 連携 | `manual-test-result.md` の TC と screenshot の紐付けは、早い段階でテンプレートに固定した方が再撮影コストが下がる                                            |
| script path    | task-specification-creator の canonical script path を `.agents/skills/task-specification-creator/scripts/` としてテンプレート/ガイド/workflow で統一したい |

## 技術的教訓

| 項目              | 内容                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| dedicated harness | `scenario` / `theme` クエリで状態固定すると、複数 UI state の撮影が安定する                                 |
| selector 粒度     | P31 対策とは別に、P24 派生の型アサーションは adapter helper で閉じると UI 実装を崩さずに解消しやすい        |
| UI review scope   | Apple レビューで見つかる light theme 視認性の揺れは、コンポーネント固有か token 基盤かを先に切り分けるべき  |
| 未タスク継承      | open 未タスクには親タスク由来の苦戦箇所を `3.6 実装課題と解決策` として転記しておくと、次回の切り分けが速い |

## スキル改善提案

| 対象                         | 提案                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `task-specification-creator` | Phase 9/10 に「lint script 不在時の代替 ESLint 実行」を標準 fallback として追記したい                                                                                           |
| `task-specification-creator` | `commands.md` / `phase-11-12-guide.md` / `phase-templates.md` の script path を `.agents/...` へ統一し、`validate-phase-output.js` の位置引数契約を help 出力と一緒に固定したい |
| `task-specification-creator` | 未タスクテンプレートに `3.6 実装課題と解決策（親タスクからの教訓）` と `audit --diff-from HEAD --target-file` を標準ゲートとして強調したい                                      |
| `skill-creator`              | `.claude` / `.agents` 両系統で Phase 12 template の task-spec script path を canonical `.agents/...` に揃えるガードを追加したい                                                 |
| `aiworkflow-requirements`    | UI feature spec の workflow パス drift と token scope 未タスク化漏れを検知しやすいチェック項目を追加したい                                                                      |

## 新規 Pitfall 候補

| 候補                                                                | 判定 | 理由                                                                    |
| ------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------- |
| UI トークン起因の light/dark 視認性差分を task 固有不具合と誤認する | 候補 | まず token scope と task scope を切り分ける手順があると再監査が安定する |
