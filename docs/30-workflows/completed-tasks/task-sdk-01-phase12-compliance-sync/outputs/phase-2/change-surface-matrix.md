# Change Surface Matrix

| group           | files                                                                     | reason                                           |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| workflow body   | `index.md`, `phase-12-documentation.md`                                   | 4点同期と本文整合                                |
| artifacts       | `artifacts.json`, `outputs/artifacts.json`                                | root / outputs parity                            |
| phase12 outputs | `outputs/phase-12/*.md`                                                   | 監査証跡密度の是正                               |
| shared contract | `packages/shared/src/types/skillCreator.ts`                               | `LoadedWorkflowManifest` に content hash を追加  |
| runtime loader  | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                | resource/phase 参照整合と cache 判定の hardening |
| runtime tests   | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.test.ts` | phaseIds / content hash / cache 再読込の検証     |
| ledger          | `task-workflow-completed.md`, `task-workflow-backlog.md`                  | follow-up と canonical path                      |
| lessons / index | lessons, `topic-map.md`, `keywords.json`                                  | same-wave sync                                   |
