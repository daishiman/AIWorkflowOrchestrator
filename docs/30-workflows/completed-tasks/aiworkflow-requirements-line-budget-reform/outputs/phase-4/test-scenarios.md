# Phase 4 Output: Test Scenarios

## 対象 family と判定観点

| family                         | 対象                                                                                                                                                                                                                                                     | 重点観点                                                  | PASS 条件                                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| F1 ledger / archive            | `LOGS.md`、`lessons-learned.md`、`task-workflow.md`                                                                                                                                                                                                      | archive 分離、active summary、backlink                    | parent が 500 行以下、archive child が 500 行以下、parent → archive / active / backlog へ 1 段で到達できる |
| F2 pattern / rulebook          | `architecture-implementation-patterns.md`、`patterns.md`、`quality-requirements.md`、`testing-component-patterns.md`、`development-guidelines.md`、`error-handling.md`                                                                                   | core/detail/history 分離、rulebook 責務分離               | parent が overview/index 化され、詳細が child に退避され、重複説明が parent に残り過ぎていない             |
| F3 architecture / core         | `arch-state-management.md`、`arch-ui-components.md`、`arch-electron-services.md`、`architecture-auth-security.md`、`architecture-overview.md`、`directory-structure.md`                                                                                  | layer / surface / support 分離                            | overview が親に残り、surface / support / history が child に分割される                                     |
| F4 interfaces / api / security | `interfaces-agent-sdk-skill.md`、`interfaces-agent-sdk-executor.md`、`interfaces-agent-sdk-history.md`、`interfaces-auth.md`、`interfaces-chat-history.md`、`api-ipc-agent.md`、`api-ipc-system.md`、`security-electron-ipc.md`、`security-skill-ipc.md` | contract family 分離、history companion、IPC surface 分割 | parent / child / history の責務が明確で、channel / type / history が混線しない                             |
| F5 ui / ux                     | `ui-ux-feature-components.md`、`ui-ux-design-principles.md`、`ui-ux-atoms-patterns.md`、`ui-ux-components.md`、`ui-ux-agent-execution.md`、`ui-ux-search-panel.md`、`ui-ux-settings.md`                                                                  | surface 別分離、history 別退避                            | Workspace / Skill / foundation / history の導線が parent から 1 段で到達できる                             |
| F6 support / platform          | `deployment.md`、`database-implementation.md`、`technology-devops.md`                                                                                                                                                                                    | target / lifecycle 分離                                   | parent が overview 役に縮み、target / operation / testing が child へ退避される                            |
| G0 generated index             | `indexes/topic-map.md`                                                                                                                                                                                                                                   | generated artifact measurement                            | `generate-index.js` 実行後に `wc -l` を測り、500 行以下または blocked dependency として formalize する     |

## dependency edge scenario

| ID     | シナリオ                                                  | 期待結果                                                       |
| ------ | --------------------------------------------------------- | -------------------------------------------------------------- |
| DEP-01 | `SKILL.md` → `indexes/quick-reference.md` → family parent | 入口三層で parent へ到達できる                                 |
| DEP-02 | family parent → child (`core` / `details` / `advanced`)   | 親から詳細 child へ 1 段で到達できる                           |
| DEP-03 | family parent → `*-history.md` / archive                  | 親から履歴退避先へ 1 段で到達できる                            |
| DEP-04 | archive / history → parent                                | child / archive から親に戻れる                                 |
| DEP-05 | `.claude` → `.agents` mirror                              | 同名構造と内容差分が 0 になる                                  |
| DEP-06 | generated index → parent file                             | `generate-index.js` 後も parent file 名が topic-map から見える |

## 実装 wave ごとのテスト観点

| wave   | lane   | family     | 実装直後に確認すること                                                              |
| ------ | ------ | ---------- | ----------------------------------------------------------------------------------- |
| Wave 1 | Lane A | F1         | archive index、backlog / active companion、LOGS archive が生成されている            |
| Wave 1 | Lane B | F3         | overview parent と surface child が閉じている                                       |
| Wave 1 | Lane C | F4         | contract parent と channel / history child が閉じている                             |
| Wave 1 | Lane V | validation | `validate-structure.js`、manual `wc -l`、`diff -qr`、`generate-index.js` を実行する |
| Wave 2 | Lane A | F2         | rulebook parent が slim 化され、history / examples が child に退避されている        |
| Wave 2 | Lane B | F6         | support parent と target child が閉じている                                         |
| Wave 2 | Lane C | F5         | Workspace / Skill / foundation / history 導線が閉じている                           |
| Final  | Lane V | all + G0   | manual docs 34 件の over-limit 0、G0 status、orphan shard なしを確定する            |

## 失敗時の戻り先

| 症状                                                  | 戻り先  |
| ----------------------------------------------------- | ------- |
| parent が 500 行超のまま                              | Phase 5 |
| child だけ作られて parent 導線がない                  | Phase 5 |
| `quick-reference.md` / `resource-map.md` から辿れない | Phase 8 |
| `.claude` / `.agents` に差分が残る                    | Phase 5 |
| `topic-map.md` が 500 行超かつ formalize 不足         | Phase 9 |
