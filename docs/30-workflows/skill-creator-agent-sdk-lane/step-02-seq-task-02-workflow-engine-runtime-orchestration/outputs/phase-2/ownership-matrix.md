# Ownership Matrix

## State Owner

| 項目                                 | owner  | mutation authority                                           | external visibility                                  |
| ------------------------------------ | ------ | ------------------------------------------------------------ | ---------------------------------------------------- |
| `currentPhase`                       | engine | engine の phase transition API                               | facade 経由で renderer へ要約表示                    |
| `awaitingUserInput`                  | engine | engine が input request を生成し、Task04 bridge が回答を戻す | renderer は request を表示する                       |
| `verifyResult`                       | engine | verify runner または verify adapter が engine へ書き戻す     | facade 経由で renderer へ公開する                    |
| phase artifacts                      | engine | engine が phase 完了時に append する                         | facade が summary を返す                             |
| `resumeTokenEnvelope`                | engine | engine が serialize し Task08 へ渡す                         | facade が public response に埋め込む場合だけ公開する |
| `routeDecision` snapshot             | facade | `RuntimePolicyResolver` を用いた facade                      | engine へ input として渡す                           |
| `terminal_handoff` guidance / bundle | facade | facade                                                       | renderer へ public union response で返す             |

## 責務境界ガード

| コンポーネント    | 持つもの                                                                                    | 持たないもの                                             |
| ----------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| facade            | route decision、public union response、handoff bundle                                       | workflow state、phase artifacts の正本                   |
| engine            | `currentPhase`、`awaitingUserInput`、`verifyResult`、phase artifacts、`resumeTokenEnvelope` | auth 判定、public IPC 露出                               |
| `ManifestLoader`  | manifest の read / validate / normalize / cache                                             | phase 遷移、route decision、permission/session authority |
| renderer / bridge | user input、review decision、表示状態                                                       | workflow state の source of truth                        |

## Phase Transition

| from      | to        | guard                                         | owner                                               |
| --------- | --------- | --------------------------------------------- | --------------------------------------------------- |
| `plan`    | `review`  | plan result が構造化されている                | engine                                              |
| `review`  | `execute` | user approval がある                          | engine                                              |
| `review`  | `handoff` | route snapshot が `terminal_handoff`          | facade が bundle を返し、engine は state を保存する |
| `execute` | `verify`  | execution result が受理される                 | engine                                              |
| `verify`  | `improve` | verify status が fail                         | engine                                              |
| `verify`  | `review`  | verify status が pass かつ user review が必要 | engine                                              |

## Public Boundary

| surface                                   | owner           | notes                                                |
| ----------------------------------------- | --------------- | ---------------------------------------------------- |
| `planSkill()`                             | facade          | route decision と plan response の public entrypoint |
| `executePlan()`                           | facade + engine | facade が route を決め、engine が state を進める     |
| `improveSkillWithFeedback()`              | facade          | improve response と handoff guidance を返す          |
| `SkillCreatorWorkflowEngine` internal API | engine          | renderer に直接公開しない                            |
