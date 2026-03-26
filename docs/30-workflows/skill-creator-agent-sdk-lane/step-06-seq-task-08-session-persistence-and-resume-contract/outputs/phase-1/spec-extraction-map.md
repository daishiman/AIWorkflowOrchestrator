# Spec Extraction Map

## 概要

Task08 で固定する契約を、system spec source、current code anchor、fixed owner、delegated gap の 4 軸で整理する。

## 抽出表

| 論点                            | system spec source                                                 | current code anchor                                             | fixed owner     | delegated gap                  |
| ------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- | --------------- | ------------------------------ |
| workflow state ownership        | `architecture-overview-core.md`, `api-ipc-system-core.md`          | `SkillCreatorWorkflowEngine.ts`                                 | Task02 + Task08 | UI resume entry は後続 UI task |
| save target definition          | `requirements-draft.md`, `arch-electron-services-details-part2.md` | `SkillCreatorWorkflowEngine.ts`, `RuntimeSkillCreatorFacade.ts` | Task08          | save trigger timing の実装詳細 |
| generic session reuse           | `task-workflow-completed.md`, existing session service contract    | `SessionPersistenceService.ts`, `SessionStorage.ts`             | Task08          | schema migration tooling       |
| route compatibility             | `Task07 index`, `arch-electron-services-details-part2.md`          | `SkillCreatorWorkflowEngine.ts` route snapshot                  | Task07 + Task08 | resumed warning UI             |
| source provenance compatibility | lessons learned, `api-ipc-system-core.md`                          | `ResourceLoader.getBasePath()`, `resumeTokenEnvelope`           | Task02 + Task08 | custom root trust scoring      |
| concurrency / stale write       | no exact current canonical doc。Task08 で新規設計する              | session store revision 不在                                     | Task08          | multi-window UX                |
| Agent SDK session 分離          | `interfaces-agent-sdk.md`, preload current channels                | `preload/index.ts`, `preload/channels.ts`                       | Task08          | unified session dashboard      |

## Task08 で閉じる判断

- `resumeTokenEnvelope` を persisted checkpoint と同一視しない。
- `PersistedSession` は generic summary / LRU として維持する。
- route / provenance / manifest drift は explicit evaluator で判定する。
- `agent:resumeSession` は別系統の session なので reuse しない。
