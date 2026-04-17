# skill-create-flow-gaps

## 概要

`skill-create-flow-gaps` で特定した変更差分を、30種の思考法で分解し、実装レーンを `STREAM` / `CANCEL` / `STRUCT` / `TODO` の4グループ9タスクに整理した親 index。

- 目的: 依存関係、並列可否、ファイル衝突ドメインを一目で判断できるようにする
- 現在の状態: 仕様書作成済み / 一部実装完了（CANCEL-001〜004, STRUCT-002, TODO-001）/ PR作成禁止
- 更新日: 2026-04-16
- 分析詳細: 30種の思考法そのものの展開は設計ドキュメント側に集約する

## 設計根拠

- [phase-1-analysis.md](../00-task-spec-design-docs/phase-1-analysis.md)
- [phase-2-solution.md](../00-task-spec-design-docs/phase-2-solution.md)
- [phase-3-review.md](../00-task-spec-design-docs/phase-3-review.md)

## 実行レーン

| レーン | 目的                                        | タスクID   | ステータス                   | 仕様書                                                                                            |
| ------ | ------------------------------------------- | ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| STREAM | 進捗通知の送信経路を接続する                | STREAM-001 | ⏳ in-progress（別ブランチ） | [p01-par-STREAM-001](./p01-par-STREAM-001/index.md)                                               |
| STREAM | 進捗通知を IPC 送信へ配線する               | STREAM-002 | ⏸ pending（STREAM-001待ち）  | [p02-par-STREAM-002](./p02-par-STREAM-002/index.md)                                               |
| CANCEL | キャンセル IPC チャンネルを追加する         | CANCEL-001 | ✅ completed                 | [completed-tasks/p01-seq-CANCEL-001](../../completed-tasks/p01-seq-CANCEL-001/index.md) ※移動済み |
| CANCEL | preload / shared の cancel API を成立させる | CANCEL-002 | ✅ completed（移動済み）     | [completed-tasks/p02-seq-CANCEL-002](../../completed-tasks/p02-seq-CANCEL-002/index.md) ※移動済み |
| CANCEL | main process 側の cancel 実体を接続する     | CANCEL-003 | ✅ completed（移動済み）     | [completed-tasks/p03-seq-CANCEL-003](../../completed-tasks/p03-seq-CANCEL-003/index.md) ※移動済み |
| CANCEL | renderer hook から cancel を送信する        | CANCEL-004 | ✅ completed（移動済み）     | [completed-tasks/p04-seq-CANCEL-004](../../completed-tasks/p04-seq-CANCEL-004/index.md) ※移動済み |
| STRUCT | `runCreateWorkflow()` の構造出力を正す      | STRUCT-001 | ⏳ pending                   | [p01-par-STRUCT-001](./p01-par-STRUCT-001/index.md)                                               |
| STRUCT | `structurePlan` を SKILL.md 生成へ接続する  | STRUCT-002 | ✅ completed（PR #2209）     | [p02-par-STRUCT-002](./p02-par-STRUCT-002/index.md)                                               |
| TODO   | 残置 TODO の cleanup を行う                 | TODO-001   | ✅ completed（PR #2199）     | [p05-opt-TODO-001](./p05-opt-TODO-001/index.md)                                                   |

## カノニカルな位置づけ

- `STREAM-001` / `STREAM-002`: 進捗通知チェーンの欠線補完
- `CANCEL-001` / `CANCEL-002` / `CANCEL-003` / `CANCEL-004`: cancel を shared → preload → main → renderer で縦断接続
- `STRUCT-001` / `STRUCT-002`: create workflow の構造化データを正して生成系へ反映
- `TODO-001`: 実装本流から独立した低優先 cleanup

## ファイル衝突ドメイン

| 衝突ドメイン           | 主対象ファイル                                                                                                                 | 関連タスク                                     | 実行ルール                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | -------------------------------- |
| SkillCreatorService    | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                                                                  | STREAM-001, CANCEL-003, STRUCT-001, STRUCT-002 | 同一ファイル共有のため直列       |
| skillCreatorHandlers   | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                                                            | STREAM-002, CANCEL-003                         | 同一ファイル共有のため直列       |
| IPC / shared / preload | `packages/shared/src/ipc/channels.ts`, `apps/desktop/src/preload/channels.ts`, `apps/desktop/src/preload/skill-creator-api.ts` | CANCEL-001, CANCEL-002                         | `CANCEL-001 → CANCEL-002` を直列 |
| renderer hook          | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                                                                       | CANCEL-004                                     | 独立。前段完了後に着手           |
| TODO cleanup           | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                                  | TODO-001                                       | 独立。任意タイミングで並列可     |

## 実行順

原則:

- 同一ファイルを共有するタスクは直列
- 独立ファイルのタスクは並列

推奨オーケストレーション:

```text
Wave 1 並列（完了済み含む）
  STREAM-001  [⏳ in-progress: feat/skill-creator-progress-callback-stream-001]
  CANCEL-001  [✅ completed]
  STRUCT-001  [⏳ pending]
  TODO-001    [✅ completed: PR #2199]

Wave 2 条件付き並列（一部完了）
  STREAM-002  [⏸ pending: STREAM-001待ち]
  CANCEL-002  [✅ completed: current worktree]
  STRUCT-002  [✅ completed: PR #2209]

Wave 3 直列
  CANCEL-003   [✅ completed: current worktree]

Wave 4 直列
  CANCEL-004   [✅ completed: current worktree]
```

## 依存グラフ

```text
STREAM-001 -> STREAM-002
CANCEL-001 -> CANCEL-002 -> CANCEL-003 -> CANCEL-004
STRUCT-001 -> STRUCT-002
TODO-001   -> 独立
```

## 実行者メモ

- `STREAM` と `STRUCT` はともに `SkillCreatorService.ts` に到達するため、別レーンでも同時編集しない
- `CANCEL-003` は `SkillCreatorService.ts` と `skillCreatorHandlers.ts` の両方に触るため、衝突ハブとして扱う
- 30種の思考法による分析根拠、差分理由、エレガント化判断は設計ドキュメントを正本とし、この親 index では再掲しない
- コミット、push、PR作成はスコープ外
