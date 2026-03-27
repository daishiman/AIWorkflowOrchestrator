# Layer34 Contract Matrix

| concern                    | current owner                               | Layer 3 / 4 で追加する field / section                                                      | consumer                     | delegated / non-goal             |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------- |
| evidence depth             | `SkillCreatorWorkflowEngine`                | `checks[]`, `severity`, `evidenceCount`, `evidenceSummary`                                  | facade, renderer             | verify owner の変更              |
| provenance detail          | `SkillCreatorWorkflowEngine` + Task03 input | `manifestPath`, `resourceDescriptorHash`, `manifestCacheKey`, `resolvedSkillCreatorRoot`    | renderer header / detail     | source discovery ロジック追加    |
| route evidence             | `SkillCreatorWorkflowEngine`                | `route.type`, `route.summary`, `route.permissionMode`, `route.launcher`, `reverifyEligible` | facade, renderer action slot | route priority の再定義          |
| re-verify action           | facade + renderer action                    | `reverifyEligible`, `disabledReason`                                                        | renderer                     | persistence / resume action 追加 |
| governance note            | Task07                                      | `delegatedGovernanceNote` の参照表示のみ                                                    | renderer side note           | approval / disclosure 実装       |
| session compatibility note | Task08                                      | `delegatedSessionNote` の参照表示のみ                                                       | renderer side note           | checkpoint / invalidation 実装   |

## レイヤー別対応

| layer    | 追加責務                                         | 完了条件                                       |
| -------- | ------------------------------------------------ | ---------------------------------------------- |
| shared   | Layer 3 / Layer 4 verify detail DTO を正本化する | field set が一意に定義されている               |
| main IPC | DTO を wrapper / validation 付きで渡せる         | request / response shape が明記されている      |
| preload  | renderer へ透過公開する                          | method と channel が 1:1                       |
| facade   | engine owner を崩さず bridge を形成する          | mapping と disabled condition が明記されている |
| renderer | section / action / delegated note を描画する     | owner を持たず section host に徹する           |
