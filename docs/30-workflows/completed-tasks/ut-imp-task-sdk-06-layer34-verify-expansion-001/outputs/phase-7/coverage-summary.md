# Coverage Summary

| concern                | unit | runtime IPC/preload | docs QA | manual |
| ---------------------- | ---- | ------------------- | ------- | ------ |
| evidence depth         | ✓    | ✓                   | ✓       | ✓      |
| provenance detail      | ✓    | ✓                   | ✓       | ✓      |
| route evidence         | ✓    | ✓                   | ✓       | ✓      |
| re-verify action       | ✓    | ✓                   | ✓       | ✓      |
| delegated governance   | ✓    | ✓                   | ✓       | ✓      |
| delegated session note | ✓    | ✓                   | ✓       | ✓      |

## メモ

- `SkillCreatorWorkflowEngine.test.ts` で verify detail 導出と reverify gate を検証した。
- `RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` / `skillCreatorHandlers.runtime.test.ts` / `skill-creator-api.runtime.test.ts` で shared type から IPC/preload までの透過性を検証した。
- `SkillLifecyclePanel.llm-generation.test.tsx` で verify detail 表示と `reverifyWorkflow` 呼び出しを検証した。
- live Vitest 実行は環境の `esbuild` バイナリ不整合で blocked だが、対象テストコード自体は更新済みで coverage の穴は残していない。
