# skill-create-flow-gaps

## 概要

`skill-create-flow-gaps` で特定した変更差分を、30種の思考法で分解し、実装レーンを `STREAM` / `CANCEL` / `STRUCT` / `TODO` の4グループ9タスクに整理した親 index。

- 目的: 依存関係、並列可否、ファイル衝突ドメインを一目で判断できるようにする
- 現在の状態: 一部完了済み workflow を含む / PR作成禁止
- 分析詳細: 30種の思考法そのものの展開は設計ドキュメント側に集約する

## 設計根拠

- [phase-1-analysis.md](../00-task-spec-design-docs/phase-1-analysis.md)
- [phase-2-solution.md](../00-task-spec-design-docs/phase-2-solution.md)
- [phase-3-review.md](../00-task-spec-design-docs/phase-3-review.md)

## 実行レーン

| レーン | 目的                                        | タスクID          | 仕様書                                                               |
| ------ | ------------------------------------------- | ----------------- | -------------------------------------------------------------------- |
| STREAM | 進捗通知の送信経路を接続する                | STREAM-001 ✅完了 | [p01-par-STREAM-001](../completed-tasks/p01-par-STREAM-001/index.md) |
| STREAM | 進捗通知を IPC 送信へ配線する               | STREAM-002        | [p02-par-STREAM-002](./p02-par-STREAM-002/index.md)                  |
| CANCEL | キャンセル IPC チャンネルを追加する         | CANCEL-001 ✅完了 | [p01-seq-CANCEL-001](../completed-tasks/p01-seq-CANCEL-001/index.md) |
| CANCEL | preload / shared の cancel API を成立させる | CANCEL-002 ✅完了 | [p02-seq-CANCEL-002](../completed-tasks/p02-seq-CANCEL-002/index.md) |
| CANCEL | main process 側の cancel 実体を接続する     | CANCEL-003 ✅完了 | [p03-seq-CANCEL-003](../p03-seq-CANCEL-003/index.md)                 |
| CANCEL | renderer hook から cancel を送信する        | CANCEL-004        | [p04-seq-CANCEL-004](./p04-seq-CANCEL-004/index.md)                  |
| STRUCT | `runCreateWorkflow()` の構造出力を正す      | STRUCT-001 ✅完了 | [p01-par-STRUCT-001](../completed-tasks/p01-par-STRUCT-001/index.md) |
| STRUCT | `structurePlan` を SKILL.md 生成へ接続する  | STRUCT-002 ✅完了 | [p02-par-STRUCT-002](../completed-tasks/p02-par-STRUCT-002/index.md) |
| TODO   | 残置 TODO の cleanup を行う                 | TODO-001 ✅完了   | [p05-opt-TODO-001](../p05-opt-TODO-001/index.md)                     |

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
Wave 1 並列
  STREAM-001
  CANCEL-001
  STRUCT-001
  TODO-001

Wave 2 条件付き並列
  STREAM-002   <- STREAM-001 完了後
  CANCEL-002   <- CANCEL-001 完了後
  STRUCT-002   <- STRUCT-001 完了後

Wave 3 直列
  CANCEL-003   <- CANCEL-002 完了後

Wave 4 直列
  CANCEL-004   <- CANCEL-003 完了後
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

---

## RALLYグループ（ラリー機能ギャップ修正）

30種の思考法による多角的分析（2026-04-21実施）で特定したラリー機能の設計ギャップを修正するタスク群。

- 分析詳細: [rally-phase-1-analysis.md](../00-task-spec-design-docs/rally-phase-1-analysis.md)
- 解決策設計: [rally-phase-2-solution.md](../00-task-spec-design-docs/rally-phase-2-solution.md)
- 整合性レビュー: [rally-phase-3-review.md](../00-task-spec-design-docs/rally-phase-3-review.md)

### 根本原因

IPC invoke戻り値（pull）とIPC pushイベントのどちらが`workflowSnapshot`の正規更新権限を持つかを設計で決定しないまま両方を正規ルートとして実装したため、ラリーループの冪等性が保証されない。

### RALLYタスク一覧

| Wave       | 形態              | 目的                                       | タスクID  | 仕様書                                                 |
| ---------- | ----------------- | ------------------------------------------ | --------- | ------------------------------------------------------ |
| **Wave 0** | **par（並列可）** | SkillLifecyclePanel dead code削除          | RALLY-001 | [wave0-par-RALLY-001](./wave0-par-RALLY-001/index.md)  |
| **Wave 0** | **par（並列可）** | restoredPendingRequest合成ルール明確化     | RALLY-002 | [wave0-par-RALLY-002](../wave0-par-RALLY-002/index.md) |
| **Wave 0** | **par（並列可）** | selectedOptionIds/selectedValues重複整理   | RALLY-004 | [wave0-par-RALLY-004](./wave0-par-RALLY-004/index.md)  |
| Wave 1     | seq（直列）       | workflowSnapshot更新権限設計確立           | RALLY-005 | [wave1-seq-RALLY-005](./wave1-seq-RALLY-005/index.md)  |
| Wave 2     | seq（直列）       | L675-708 useEffect依存配列修正             | RALLY-006 | [wave2-seq-RALLY-006](./wave2-seq-RALLY-006/index.md)  |
| Wave 2     | **par（並列可）** | addAssistantMessage依存配列修正            | RALLY-007 | [wave2-par-RALLY-007](./wave2-par-RALLY-007/index.md)  |
| Wave 2     | **par（並列可）** | getSkillCreatorApi()型ガード強化           | RALLY-009 | [wave2-par-RALLY-009](./wave2-par-RALLY-009/index.md)  |
| Wave 3     | seq（直列）       | processWorkflowOutcome fire-and-forget修正 | RALLY-008 | [wave3-seq-RALLY-008](./wave3-seq-RALLY-008/index.md)  |
| Wave 3     | seq（直列）       | UndoサーバーsideRollback API追加           | RALLY-003 | [wave3-seq-RALLY-003](./wave3-seq-RALLY-003/index.md)  |
| Wave 3     | seq（直列）       | ラリー完了状態UI表示追加                   | RALLY-010 | [wave3-seq-RALLY-010](./wave3-seq-RALLY-010/index.md)  |
| Wave 4     | seq（直列）       | 送信中競合防止UI強化                       | RALLY-011 | [wave4-seq-RALLY-011](./wave4-seq-RALLY-011/index.md)  |
| Wave 4     | seq（直列）       | エラー回復導線追加                         | RALLY-012 | [wave4-seq-RALLY-012](./wave4-seq-RALLY-012/index.md)  |
| Wave 4     | seq（直列）       | Undo可能範囲の視覚的表現追加               | RALLY-013 | [wave4-seq-RALLY-013](./wave4-seq-RALLY-013/index.md)  |

### RALLYファイル衝突ドメイン

| 衝突ドメイン            | 主対象ファイル                                                           | 関連タスク                                            | 実行ルール                  |
| ----------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- | --------------------------- |
| SkillLifecyclePanel     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`     | RALLY-001, RALLY-005, RALLY-006, RALLY-008            | 直列（001→005→006→008）     |
| ConversationalInterview | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | RALLY-002, RALLY-010, RALLY-011, RALLY-012, RALLY-013 | 直列（002→010→011→012→013） |
| useInterviewState       | `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`  | RALLY-007                                             | 独立                        |
| skillCreator型定義      | `packages/shared/src/types/skillCreator.ts`                              | RALLY-004, RALLY-009                                  | 直列（004→009）             |
| RuntimeFacade/Handlers  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`    | RALLY-003, RALLY-005                                  | RALLY-005→RALLY-003直列     |

### RALLY実行Wave

```text
Wave 0 並列（前提クリア）
  RALLY-001  ← SkillLifecyclePanel dead code削除
  RALLY-002  ← ConversationalInterview pendingRequest合成修正
  RALLY-004  ← 型定義重複フィールド整理

Wave 1 直列（コア設計確立）
  RALLY-005  ← RALLY-001完了後・IPC権限設計確立

Wave 2 並列（副作用フック修正）
  RALLY-006  ← RALLY-005完了後
  RALLY-007  ← 独立・並列可
  RALLY-009  ← 独立・並列可

Wave 3 直列（依存ありUX拡張）
  RALLY-008  ← RALLY-006完了後
  RALLY-003  ← RALLY-005完了後
  RALLY-010  ← RALLY-002完了後

Wave 4 直列（最終UX完成）
  RALLY-011  ← RALLY-010完了後
  RALLY-012  ← RALLY-011完了後
  RALLY-013  ← RALLY-003+RALLY-012完了後
```

### RALLY依存グラフ

```text
RALLY-001 → RALLY-005 → RALLY-006 → RALLY-008
                      → RALLY-003 → RALLY-013
RALLY-002 → RALLY-010 → RALLY-011 → RALLY-012 → RALLY-013
RALLY-004 → RALLY-009（型定義ドメイン）
RALLY-007（独立）
```
