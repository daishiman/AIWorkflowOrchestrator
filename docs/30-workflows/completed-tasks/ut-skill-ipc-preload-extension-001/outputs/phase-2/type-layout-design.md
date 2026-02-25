# Phase 2 型配置設計書

## 目的

`packages/shared` と `apps/desktop/src/preload/types.ts` の責務を分離し、P32対策を固定する。

## 配置方針（Task 2-3）

| 位置                                    | 責務                                |
| --------------------------------------- | ----------------------------------- |
| `packages/shared/src/types/skill/*.ts`  | ドメイン型・IPC共有型の正本         |
| `apps/desktop/src/preload/types.ts`     | Preload固有補助型（UI/IPCラッパー） |
| `apps/desktop/src/preload/skill-api.ts` | APIシグネチャ宣言と呼び出し境界     |

## 推奨ファイル分割

- `chain.ts`: `SkillChainDefinition`, `SkillChainStep`
- `fork.ts`: `ForkOptions`, `ForkResult`
- `share.ts`: `ImportSource`, `ShareTarget`, `ImportResult`
- `schedule.ts`: `ScheduledSkill`, `ScheduleConfig`
- `debug.ts`: `DebugSession`, `DebugCommand`, `DebugEvent`
- `docs.ts`: `DocGenerationRequest`, `GeneratedDoc`
- `analytics.ts`: `AnalyticsEvent`, `AnalyticsSummary`
- `index.ts`: barrel export

## P32同期ルール

1. チャネル追加時に shared型追加有無を判定する。
2. `skill-api.ts` の引数/戻り値型を shared型へ寄せる。
3. `preload/types.ts` の重複型を禁止し、必要なら型エイリアスのみ許可。

## SubAgentレビュー

- SubAgent-C主担当: 型配置案を策定。
- SubAgent-B: Preload境界での型露出をレビュー。
- SubAgent-D: P32観点で承認。

## 完了状態

- Phase 2 Task 2-3: Completed
