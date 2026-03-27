# Phase UI Mapping

Task04 は `skillCreate` surface の中で phase summary を見せる。新しい global route は増やさない。

## Phase to UI Block

| phase     | primary block               | secondary block                  | out of scope                            |
| --------- | --------------------------- | -------------------------------- | --------------------------------------- |
| `plan`    | request capture summary     | provenance summary               | Task05 の mainline 再編                 |
| `review`  | question host / answer form | plan summary                     | create entry 統合                       |
| `execute` | phase badge + progress note | provenance summary               | execute detail telemetry                |
| `verify`  | verify summary              | re-entry CTA                     | verify detail layout                    |
| `improve` | improve in-progress note    | previous verify summary          | improve detail layout                   |
| `handoff` | `TerminalHandoffCard`       | provenance / next action summary | approval / disclosure copy finalization |

## Renderer Surface Responsibility

| surface               | role                                           | rationale                         |
| --------------------- | ---------------------------------------------- | --------------------------------- |
| `SkillLifecyclePanel` | phase host / handoff host / provenance summary | 現行 mainline に最も近い          |
| `SkillCreateWizard`   | question form detail の再利用候補              | Task05 で primary entry を決める  |
| store slice           | snapshot cache                                 | cross-component read を可能にする |
| local component state | answer draft                                   | renderer owner 化を防ぐ           |

## Provenance Block

| item                          | source                     | renderer behavior                        |
| ----------------------------- | -------------------------- | ---------------------------------------- |
| source root                   | Task03 provenance          | summary 表示のみ                         |
| structure mismatch warning    | Task03 degrade note        | warning badge 表示                       |
| `resumeTokenEnvelope` summary | Task02 engine snapshot     | info block 表示のみ                      |
| route / handoff status        | Task02 / Task07 downstream | Task04 では slot と visual host だけ定義 |
