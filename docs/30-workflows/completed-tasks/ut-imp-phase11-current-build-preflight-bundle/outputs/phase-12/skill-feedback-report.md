# Phase 12 skill feedback

## aiworkflow-requirements

| 判定     | 内容                                                                                                                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 適用済み | related task が `unassigned-task` から current workflow へ昇格した時の参照先正規化を、`workflow-light-theme-contrast-regression-guard.md` / `task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md` へ同期した |
| 適用済み | `build / harness / baseUrl / native` を 1 bundle へ束ねる preflight pattern を親 guard spec の verification command と related row に反映した                                                                                    |

## task-specification-creator

| 判定         | 内容                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 適用済み     | failure simulation が同じ build artifact を共有する場合は `parallel` ではなく `serial` で扱うルールを `references/phase-11-12-guide.md` と `references/spec-update-workflow.md` に追加した |
| 適用済み     | Playwright browser cache 欠落は UI regress でなく environment preflight として扱い、`pnpm --filter @repo/desktop exec playwright install chromium` を先に案内するルールを追加した          |
| 適用済み     | current workflow 起因の新規未タスクが `0 件` でも、関連 active open backlog を `--target-file` + 10見出しで再監査するルールを `references/unassigned-task-guidelines.md` に追加した        |
| 継続改善候補 | docs-heavy / evidence-heavy workflow で same-day upstream screenshot を current workflow へ mirror する手順は既存 guide にあるが、review board 実例をさらに具体化する余地がある            |

## skill-creator

| 判定         | 内容                                                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 適用済み     | `references/patterns.md` に「Playwright browser cache 欠落は UI regress と誤分類せず、browser install preflight として復旧する」パターンを追加した                                                      |
| 適用済み     | `assets/phase12-system-spec-retrospective-template.md` / `assets/phase12-spec-sync-subagent-template.md` に、shared build artifact を壊す failure simulation を serial で記録する完了チェックを追加した |
| 適用済み     | `references/patterns.md` / template 2種に、`0 件報告` 時でも related active open backlog の `10見出し + target-file audit` を要求するルールを追加した                                                   |
| 適用済み     | `references/resource-map.md` と `SKILL.md` を更新し、current build screenshot 系 task が入口から template capability を辿れるようにした                                                                 |
| 継続改善候補 | docs-heavy task で `related active backlog` の抽出元（workflow / task-workflow / domain spec）の優先順位を template 内でもう一段具体化できる                                                            |
