# Spec Extraction Map

## 概要

Task03 で固定する契約を、system spec source、current code anchor、fixed owner、delegated gap の 4 軸で整理する。

## 抽出表

| 論点                         | system spec source                                                                                     | current code anchor                                      | fixed owner     | delegated gap                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | --------------- | --------------------------------------------- |
| multi-root source discovery  | `requirements-draft.md`, `interfaces-agent-sdk-skill-reference.md`                                     | `constants.ts`, `ipc/index.ts`                           | Task03          | disclosure / trust rule は Task07             |
| foundation snapshot reuse    | Task01 `ManifestLoader` 契約, `interfaces-agent-sdk-skill-reference.md`                                | `ManifestLoader.ts`, `skillCreator.ts`                   | Task01 + Task03 | engine input snapshot への保持は Task02       |
| phase resource planning      | `WorkflowManifestPhase.resourceIds`, `requirements-draft.md`, `skill-creator-llm-integration/index.md` | `RuntimeSkillCreatorFacade.ts`, `planPromptConstants.ts` | Task03          | UI 表示は Task04 / Task05                     |
| provenance snapshot          | Task01 foundation + Task02 owner boundary                                                              | `RuntimeSkillCreatorFacade.ts`, shared types             | Task03 + Task02 | resume compatibility は Task08                |
| lane-neutral degrade trigger | `root-workflow-pack/index.md`                                                                          | `RuntimeSkillCreatorFacade.ts`                           | Task03          | lane choice / approval / disclosure は Task07 |
| cache / structure drift      | Task01 cache boundary, `interfaces-agent-sdk-skill-reference.md`                                       | `ResourceLoader.ts`, `ManifestLoader.ts`                 | Task03          | invalidation semantics は Task08              |

## Task03 で閉じる判断

- source root は単一固定 path にしない。
- resource resolution は foundation snapshot を土台に、descriptor / candidate root / structure signature で extension を作る。
- `ResourceLoader` は source authority にせず、reader / adapter に留める。
- degrade signal は返すが、route choice そのものは Task07 に渡す。
