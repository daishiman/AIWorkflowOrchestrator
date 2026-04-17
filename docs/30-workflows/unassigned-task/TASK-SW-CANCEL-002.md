# TASK-SW-CANCEL-002: skill-creator-cancel-preload-api

## メタ情報

| 項目     | 値                                                                               |
| -------- | -------------------------------------------------------------------------------- |
| タスクID | TASK-SW-CANCEL-002                                                               |
| タスク名 | skill-creator-cancel-preload-api                                                 |
| 検出元   | TASK-SW-CANCEL-001 Phase 12 未タスク検出                                         |
| 優先度   | HIGH                                                                             |
| 影響     | Renderer から cancel invoke ができない（Preload 層に cancelGeneration が未定義） |
| 検出日   | 2026-04-15                                                                       |

## 概要

Preload 層の `SkillCreatorAPI` インターフェースおよび実装に `cancelGeneration` が未定義のため、Renderer プロセスから `skill-creator:cancel` IPC チャンネルへの invoke が不可能な状態。TASK-SW-CANCEL-001 で IPC チャンネル定数は追加済みだが、Preload 層への接続が欠落している。

## 依存関係

| 種別       | タスクID           | 状態     |
| ---------- | ------------------ | -------- |
| 依存タスク | TASK-SW-CANCEL-001 | 完了済み |
| 後続タスク | TASK-SW-CANCEL-003 | 未着手   |

## 詳細仕様書

`docs/30-workflows/skill-create-flow-gaps/p02-seq-CANCEL-002/index.md`

## 対象ファイル

| ファイルパス                                    | 変更内容                                        |
| ----------------------------------------------- | ----------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts` | cancelGeneration インターフェース定義・実装追加 |
| `apps/desktop/src/preload/channels.ts`          | ALLOWED_INVOKE_CHANNELS への登録                |

## 完了条件

- [ ] `SkillCreatorAPI` インターフェースに `cancelGeneration: () => Promise<IpcResult<void>>` が定義されている
- [ ] 実装が `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を呼び出している
- [ ] `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が含まれている
- [ ] `pnpm typecheck` が PASS する

## 関連

- 依存タスク: TASK-SW-CANCEL-001
- 後続タスク: TASK-SW-CANCEL-003
- 対象ファイル: `apps/desktop/src/preload/skill-creator-api.ts`, `apps/desktop/src/preload/channels.ts`
