# Failure Lifecycle Contract

## State Contract

| ケース              | currentPhase | awaitingUserInput     | verifyResult     | artifacts                                     |
| ------------------- | ------------ | --------------------- | ---------------- | --------------------------------------------- |
| executor reject     | `review`     | `verification_review` | `fail / review`  | `execute_result` と `verify_result` を append |
| `success:false`     | `review`     | `verification_review` | `fail / review`  | `execute_result` と `verify_result` を append |
| verify fail review  | `review`     | `verification_review` | `fail / review`  | `verify_result` を append                     |
| verify fail improve | `improve`    | `null`                | `fail / improve` | `verify_result` を append                     |

## Transition Guard

| from      | to                   |
| --------- | -------------------- |
| `plan`    | `review`             |
| `review`  | `execute`, `handoff` |
| `execute` | `verify`, `review`   |
| `verify`  | `improve`, `review`  |
| `improve` | `review`             |
| `handoff` | なし                 |
