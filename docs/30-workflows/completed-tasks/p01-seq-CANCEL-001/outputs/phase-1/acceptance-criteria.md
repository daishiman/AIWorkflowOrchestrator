# 受け入れ基準 - TASK-SW-CANCEL-001

## メタ情報

| 項目     | 内容                                  |
| -------- | ------------------------------------- |
| タスクID | TASK-SW-CANCEL-001                    |
| 機能名   | skill-creator-cancel-channel-constant |
| 作成日   | 2026-04-15                            |
| Phase    | 1                                     |

## 受け入れ基準

| ID   | 受け入れ基準                                                                                           | 判定     |
| ---- | ------------------------------------------------------------------------------------------------------ | -------- |
| AC-1 | `SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_CANCEL` が `"skill-creator:cancel"` として定義されている | PASS予定 |
| AC-2 | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` として型安全に参照できる                                           | PASS予定 |
| AC-3 | `pnpm typecheck` が PASS する（型エラーなし）                                                          | PASS予定 |

## 補足

- AC-2 は `IPC_CHANNELS` が `...SKILL_CREATOR_RUNTIME_CHANNELS` でスプレッドしているため、AC-1 が満たされれば自動的に満たされる
- AC-3 は AC-1 完了後に `pnpm --filter @repo/shared typecheck` で確認する
