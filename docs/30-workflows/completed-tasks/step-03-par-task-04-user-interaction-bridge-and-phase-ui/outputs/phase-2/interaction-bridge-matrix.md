# Interaction Bridge Matrix

## Public Contract

| 種別   | name                                   | payload / return                                                                    | owner            | note                             |
| ------ | -------------------------------------- | ----------------------------------------------------------------------------------- | ---------------- | -------------------------------- |
| invoke | `skill-creator:get-workflow-state`     | input: `{ planId }` / return: `SkillCreatorWorkflowUiSnapshot`                      | Main             | point-in-time snapshot           |
| invoke | `skill-creator:submit-user-input`      | input: `SkillCreatorUserInputSubmission` / return: `SkillCreatorWorkflowUiSnapshot` | Main             | stale `requestId` を reject する |
| event  | `skill-creator:workflow-state-changed` | payload: `SkillCreatorWorkflowUiSnapshot`                                           | Main -> Renderer | progress event と分離する        |

## Shared Types

| type                              | fields                                                                                                                         | purpose                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `SkillCreatorWorkflowUiSnapshot`  | `planId`, `currentPhase`, `awaitingUserInput?`, `verifyResult?`, `sourceProvenance?`, `resumeTokenEnvelope?`, `handoffBundle?` | renderer へ渡す canonical snapshot |
| `SkillCreatorUserInputRequest`    | `requestId`, `reason`, `title`, `prompt`, `kind`, `options?`, `placeholder?`, `allowSkip?`, `requestedAt`                      | 表示と入力制御の基底               |
| `SkillCreatorUserInputOption`     | `id`, `label`, `description?`                                                                                                  | `single_select` option             |
| `SkillCreatorUserInputSubmission` | `planId`, `requestId`, `selectedOptionId?`, `textValue?`, `secretValue?`, `confirmed?`                                         | user answer submit                 |

## Question Kind Mapping

| kind            | renderer input         | validation                  | storage note                    |
| --------------- | ---------------------- | --------------------------- | ------------------------------- |
| `single_select` | radio / list selection | option id 必須              | selected option id のみ送る     |
| `free_text`     | textarea / input       | empty 可否は request で決定 | local draft で保持              |
| `secret`        | password field         | empty 不可が基本            | log / snapshot に平文保存しない |
| `confirm`       | yes/no action          | boolean 必須                | simple confirmation 用          |

## Ownership Boundary

| concern             | owner                             | non-owner responsibility                      |
| ------------------- | --------------------------------- | --------------------------------------------- |
| `currentPhase`      | `SkillCreatorWorkflowEngine`      | renderer は badge 表示のみ                    |
| `awaitingUserInput` | `SkillCreatorWorkflowEngine`      | renderer は question host と submit           |
| `verifyResult`      | `SkillCreatorWorkflowEngine`      | Task04 は summary 表示、detail は Task06      |
| `sourceProvenance`  | Task03 upstream + engine snapshot | renderer は summary 表示のみ                  |
| answer draft        | component local state             | store / engine は canonical response のみ保持 |
