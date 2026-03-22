# AI Runtime Execution Responsibility Realignment 仕様書パック

## 概要

本パックは、旧 `ai-runtime-authmode-unification` 監査で見えた実装漏れを、`auth mode` ではなく **execution responsibility** を主語に再分解した spec-only workflow である。

後続実装が迷わず着手できるよう、`capability`、`policy authority`、`mainline UI`、`manual terminal lane`、`governance` を別々の task と親ドキュメントに固定する。

旧パックが示した中心命題は引き継ぐ。
本質は `subscription / api-key` toggle の見た目整理ではなく、**「どの surface で誰が AI を実行するのか」を Main authority で再配線すること**である。

## 追加成果物

| 成果物         | パス                     | 用途                                                                    |
| -------------- | ------------------------ | ----------------------------------------------------------------------- |
| 親パック index | `index.md`               | task 依存順、lane 分離、system spec 参照先を固定する                    |
| UI/UX 正本     | `ui-ux-realization.md`   | mainline / review harness / legacy lane の状態・CTA・導線契約を固定する |
| UI/UX 図解     | `ui-ux-diagrams.md`      | capability 解決、surface 構成、state flow、handoff flow を図で固定する  |
| 設計監査結果   | `design-audit-matrix.md` | 問題設定、矛盾、依存順、drift リスク、エレガンス判定を固定する          |

## 目的

- `auth mode` ではなく `execution responsibility` を source of truth にする
- `integrated runtime` と `manual terminal lane` の境界を UI と policy の両方で揃える
- mainline UI を review harness や legacy lane より先に回復する
- transcript provenance、guidance action wiring、canonical governance を個別責務として閉じる
- `.claude/skills/aiworkflow-requirements/` の canonical と task spec pack の語彙を一致させる

## Execution Model 方針

| 項目                | 方針                                                           | 理由                                          |
| ------------------- | -------------------------------------------------------------- | --------------------------------------------- |
| Contract foundation | capability / 状態語彙 / CTA 契約は Task01 で固定する           | 下流 task の drift を防ぐため                 |
| Policy authority    | Main / shared policy が capability / health / handoff を決める | renderer local 判定を禁止するため             |
| Mainline UI         | Settings / shell / main chat / workspace を先に整える          | 実ユーザー影響が最も大きいため                |
| Terminal lane       | Claude Code terminal は user-operated lane として扱う          | auto-send / hidden injection を防ぐため       |
| Review harness      | ChatPanel は mainline 復旧後に整列させる                       | 補助 panel を先に主役化しないため             |
| Legacy lane         | Slide / Modifier は mainline と切り離して後段整理する          | direct SDK cleanup を mainline と混ぜないため |
| Governance lane     | bridge / backlog / lessons / status 定義は最後に一括で閉じる   | spec_created のまま drift しないため          |

## Lane 分離

| lane                | 主担当 task                    | 意味                                                                    |
| ------------------- | ------------------------------ | ----------------------------------------------------------------------- |
| Foundation lane     | Task01, Task02                 | capability 契約と中央 policy を固定する                                 |
| Mainline lane       | Task03, Task04, Task05, Task06 | 実ユーザーが日常的に触る shell / chat / workspace / transcript を整える |
| Review harness lane | Task07                         | ChatPanel を補助 panel として mainline 契約へ整列させる                 |
| Legacy lane         | Task08                         | slide / modifier の manual fallback と direct SDK cleanup を扱う        |
| Governance lane     | Task09                         | canonical bridge、status 定義、same-wave sync を閉じる                  |

## UI/UX Realization 方針

- UI/UX は各 task に散らさず、親パック正本として `ui-ux-realization.md` を持つ
- 図解は `ui-ux-diagrams.md` に集約し、各 task の Phase 2 参照元にする
- mainline surface は `Settings / App Shell / Main Chat / Workspace / Terminal / Transcript` を優先する
- review harness と legacy lane は mainline 契約を壊さない範囲で後段に扱う
- screenshot 契約は「何を見せるか」だけを親で固定し、具体 capture は各 task Phase 11 に委譲する

## 多角的設計監査の主結論

- 問題設定の主語は `auth mode` ではなく `execution responsibility` で正しい
- `Task01 -> Task02 -> Mainline -> Bridge -> Harness/Legacy -> Governance` の順序は妥当
- `terminal-only`、`guidance-only`、`handoff` は分離して扱うべきである
- 最も危険なのは実装そのものより、**語彙 drift / canonical drift / status drift** である

詳細は [design-audit-matrix.md](./design-audit-matrix.md) を参照する。

## リスク境界

- consumer subscription / OAuth token をアプリ内 AI 実行 lane に流用しない
- terminal lane で auto-send / hidden prompt injection / silent retry をしない
- `blocked` / `unavailable` 時に no-op CTA を見せない
- transcript は自動で chat 化せず、ユーザー明示操作でのみ共有する
- legacy cleanup を mainline recovery より先に進めない
- governance task を「後でやる optional task」にしない

## Surface 台帳

| surface / concern                | 現状                                             | 目標                                                | 方針            | 主担当 |
| -------------------------------- | ------------------------------------------------ | --------------------------------------------------- | --------------- | ------ |
| Contract foundation              | `auth mode` 語彙が残る                           | capability / state / CTA を正規化する               | foundation only | Task01 |
| Runtime policy                   | surface-local 判定が散在                         | central policy / health / handoff DTO に集約する    | main authority  | Task02 |
| Settings / App Shell             | capability card / health row / launcher が未充足 | access matrix mainline を成立させる                 | mainline        | Task03 |
| Main Chat / Workspace guidance   | blocked CTA が no-op 化しやすい                  | reason -> action を一貫 wiring する                 | mainline        | Task04 |
| Terminal handoff / docs consumer | launcher と guidance-only consumer が分断        | shared handoff card と manual boundary を成立させる | mainline        | Task05 |
| Transcript -> Chat bridge        | provenance と 3 操作が未接続                     | copy-based share と provenance 表示を固定する       | mainline        | Task06 |
| ChatPanel                        | placeholder / no-op が残る                       | review harness として整列させる                     | review harness  | Task07 |
| Slide / Modifier                 | direct SDK / fallback drift が残る               | manual fallback lane と cleanup 順を固定する        | legacy          | Task08 |
| Canonical / ledger               | bridge / status / lessons が散在                 | governance lane で same-wave sync を閉じる          | governance      | Task09 |

## タスク一覧

Task01 だけは `tasks/` 配下に置かず、親パック全体の上流契約として standalone に管理する。理由は、Task02-09 の leaf task ではなく、全 task が参照する foundation 契約だからである。

| 順序 | タスクID                                                  | ディレクトリ                                                           | 責務                                                                          | 実行順序      |
| ---- | --------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------- |
| 1    | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 | `../step-01-seq-task-01-execution-responsibility-contract-foundation`  | capability、状態語彙、CTA 契約、禁止事項を固定する                            | step-01 / seq |
| 2    | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001                | `../completed-tasks/step-02-seq-task-02-runtime-policy-centralization` | RuntimePolicy / HealthPolicy / HandoffGuidance の中央 authority を設計する    | step-02 / seq |
| 3    | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001        | `tasks/step-03-par-task-03-settings-shell-access-matrix-mainline`      | Settings / AppLayout / public shell に access matrix を実装可能な形で定義する | step-03 / par |
| 4    | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001        | `../step-03-par-task-04-chat-workspace-guidance-action-wiring`         | Main Chat / Workspace の blocked guidance を action へ接続する                | step-03 / par |
| 5    | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001         | `tasks/step-03-par-task-05-terminal-handoff-surface-realization`       | persistent launcher、handoff card、docs consumer を共通化する                 | step-03 / par |
| 6    | TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001        | `tasks/step-04-seq-task-06-transcript-to-chat-provenance-linkage`      | transcript share の 3 操作と provenance 契約を固定する                        | step-04 / seq |
| 7    | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001           | `tasks/step-05-par-task-07-chatpanel-review-harness-alignment`         | ChatPanel を review harness として整列させる                                  | step-05 / par |
| 8    | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001     | `tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment`   | slide / modifier の legacy lane を manual fallback 契約へ合わせる             | step-05 / par |
| 9    | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001           | `tasks/step-06-seq-task-09-canonical-bridge-ledger-governance`         | canonical bridge、status 定義、backlog / lessons sync を閉じる                | step-06 / seq |

## タスク通称

| 通称   | 実タスクID                                                  | 意味                         |
| ------ | ----------------------------------------------------------- | ---------------------------- |
| Task01 | `TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001` | Contract Foundation          |
| Task02 | `TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001`                | Central Policy               |
| Task03 | `TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001`        | Settings / Shell Mainline    |
| Task04 | `TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001`        | Chat / Workspace Guidance    |
| Task05 | `TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001`         | Terminal Handoff Surface     |
| Task06 | `TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001`        | Transcript Provenance        |
| Task07 | `TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001`           | ChatPanel Review Harness     |
| Task08 | `TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001`     | Slide / Modifier Legacy Lane |
| Task09 | `TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001`           | Governance Closure           |

## エレガンス判定

今回の再分解で重要なのは、「1つの大きな AI runtime task」に戻さず、**契約 / policy / mainline / bridge / harness / legacy / governance** を別 task にした点である。

| 観点         | 判定基準                                                | 今回の結論                                      |
| ------------ | ------------------------------------------------------- | ----------------------------------------------- |
| 抽象の正しさ | 実行責任と認証種別を混同していないか                    | `execution responsibility` を主語にしており妥当 |
| 責務分離     | foundation と UI と governance が混ざっていないか       | 9 task へ分離しており良好                       |
| UX 整合      | mainline と review harness を同一優先度で扱っていないか | mainline 優先を明示しており妥当                 |
| 運用整合     | spec_created のまま drift しないか                      | Task09 を設けた点が有効                         |

## 依存グラフ

```text
Task01 -> Task02 -> (Task03, Task04, Task05) -> Task06 -> (Task07, Task08) -> Task09
```

| タスク | 直接依存                       | 依存理由                                                                     |
| ------ | ------------------------------ | ---------------------------------------------------------------------------- |
| Task01 | なし                           | capability / state / CTA 契約を先に固定するため                              |
| Task02 | Task01                         | contract を shared policy へ落とすため                                       |
| Task03 | Task02                         | Settings / shell が policy authority を消費するため                          |
| Task04 | Task02                         | Chat / Workspace が blocked reason と action を policy から受けるため        |
| Task05 | Task02                         | terminal handoff consumer が共通 DTO を使うため                              |
| Task06 | Task04, Task05                 | transcript share は guidance wiring と terminal surface の両方に依存するため |
| Task07 | Task03, Task04, Task05, Task06 | harness は mainline 契約を後追いで再現するため                               |
| Task08 | Task02, Task05                 | legacy lane も central policy と manual boundary を参照するため              |
| Task09 | Task01-08                      | bridge / ledger / lessons は全 task の出口を扱うため                         |

## Phase 1-3 ゲート

- Step 02 以降に進む前に Task01 Phase 1-3 を PASS にする
- Task03 / Task04 / Task05 は Task02 Phase 3 完了後に並列着手できる
- Task06 は transcript provenance のため Task04 / Task05 の Phase 2 を前提にする
- Task07 / Task08 は mainline 契約が見えた後に着手する
- Task09 は「最後にやる」ではなく、全 task の出口条件を閉じる必須 gate として扱う

## 並列化方針

- 直列で確定するもの
  - Task01 Phase 1-3
  - Task02 Phase 1-3
  - Task06 Phase 1-3
  - Task09 Phase 1-3
- 並列で進めてよいもの
  - Task03 / Task04 / Task05 の Phase 1-3
  - Task07 / Task08 の Phase 1-3（依存解消後）
  - 各 task の Phase 8-12 文書準備

## 関心ごとの分離

| 関心ごと                         | 主担当 | 主な判断対象                                                                     |
| -------------------------------- | ------ | -------------------------------------------------------------------------------- |
| capability / state / CTA 契約    | Task01 | integratedRuntime / terminalSurface / both / none、ready / blocked / unavailable |
| policy authority                 | Task02 | RuntimePolicy / HealthPolicy / HandoffGuidance / legacy health route             |
| settings / shell mainline        | Task03 | access cards、health row、public shell、terminal launcher                        |
| chat / workspace action wiring   | Task04 | blocked reason、settings 遷移、copy action、launcher action                      |
| terminal surface / docs consumer | Task05 | launcher、handoff card、manual boundary、guidance-only consumer                  |
| transcript provenance            | Task06 | manual 3操作、provenance chip、auditability                                      |
| review harness                   | Task07 | ChatPanel role、mainline 差分、placeholder 排除                                  |
| legacy slide lane                | Task08 | direct SDK cleanup、manual fallback、follow-up rule                              |
| governance                       | Task09 | canonical table、status 定義、task-workflow / lessons / backlog same-wave        |

## システム仕様参照

| 参照資料                | パス                                                                                                            | 用途                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| canonical workflow      | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | execution responsibility 再配線の canonical             |
| 親 UI/UX 正本           | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md`                        | mainline / handoff / CTA 契約の workflow 正本           |
| 親 UI/UX 図解           | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md`                           | surface / state flow / handoff flow の図解              |
| 設計監査                | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md`                      | 問題設定、依存順、drift リスクの監査結果                |
| Navigation 正本         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                         | `ViewType` / `renderView()` / `settings` 公開シェル例外 |
| Settings 正本           | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                           | settings 関連 child companion の入口                    |
| Settings core           | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md`                                      | Settings shell / AuthGuard bypass / timeout fallback    |
| State management core   | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                               | Renderer selector 境界と既存 capability 語彙            |
| Interfaces auth core    | `.claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md`                                     | `AuthModeStatus` など transport DTO の正本              |
| API / IPC core          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | Main-Renderer IPC envelope / handler 契約               |
| Task workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                            | current wave の status / same-wave sync                 |
| Backlog                 | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                    | follow-up formalization 先                              |
| Completed               | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                                  | completed 化の出口条件                                  |
| Lessons learned         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                          | 再発防止と drift 管理                                   |
| Lessons learned current | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                  | current wave の同期漏れ対策                             |
| ViewType lessons        | `.claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md`                     | `ViewType` / `renderView()` drift 防止                  |
| Auth / timeout lessons  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | settings bypass / auth timeout 再発防止                 |

## 旧パックとの関係

- 旧 `ai-runtime-authmode-unification` は問題設定と audit の参照元として残す
- 新パックは「残課題を execution responsibility 観点で再タスク化する spec-only workflow」である
- Step-01 bridge と canonical drift の閉鎖は Task09 で扱う
- 旧パック名は履歴互換として残るが、新パックの主語は `execution responsibility realignment` に固定する

## 完了定義

| 状態                   | 意味                                                                        |
| ---------------------- | --------------------------------------------------------------------------- |
| `spec_created`         | task spec 一式が揃い、依存順と AC が定義された状態                          |
| `implementation_ready` | Phase 1-3 gate が閉じ、future implementer が Phase 4+ に進める状態          |
| `completed`            | 実装、証跡、Phase 12 same-wave sync、follow-up formalization まで閉じた状態 |

## 注意事項

- 実装・コミット・PR は本パックの対象外である
- UI/UX root docs は親パック正本として扱い、個別 task は Phase 2 から参照する
- `.claude/skills/aiworkflow-requirements/` が system spec canonical であり、ここは workflow pack 側の parent docs である
