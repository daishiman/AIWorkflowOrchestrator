# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 1                                |
| タスクID   | TASK-RALLY-003                   |
| 機能名     | undo-server-rollback-api         |
| タスク名   | UndoサーバーsideRollback API追加 |
| 前提Phase  | -                                |
| 後続Phase  | Phase 2                          |
| 作成日     | 2026-04-21                       |
| ステータス | pending                          |

## 目的

現在の Undo 実装がサーバー状態を巻き戻さない問題を分析し、IPC 4層整合を含む実装の受け入れ基準を確定する。

**重要**: 本タスクは RALLY-005 完了後に着手する。RALLY-005 未完了状態で実装すると rollback 後の snapshot 返却仕様が定まらず、設計が不安定になる。

## SubAgentチーム編成

| SubAgent   | 関心ごと                 | 主担当                                                   | 並列/直列             |
| ---------- | ------------------------ | -------------------------------------------------------- | --------------------- |
| SubAgent-A | IPC設計                  | チャンネル定数・ホワイトリスト・ハンドラの現状確認       | 並列（B・C と同時）   |
| SubAgent-B | Facade設計               | RuntimeSkillCreatorFacade の rollback 関連コード現状確認 | 並列（A・C と同時）   |
| SubAgent-C | Renderer側設計           | ConversationalInterview.tsx の handleUndo 現状確認       | 並列（A・B と同時）   |
| SubAgent-D | 統合・IPC4層整合チェック | A・B・C の結果統合と IPC 4層整合計画確定                 | 直列（A・B・C完了後） |

## P50チェック（実施必須）

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
git log --oneline -20 -- apps/desktop/src/main/ipc/creatorHandlers.ts
git log --oneline -20 -- apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# 既存の rollback / undo 関連コードが存在しないか確認（SubAgent-B担当）
grep -rn "rollback\|undoUserInput\|undo-user-input" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# 既存のUNDO関連IPCチャンネルが存在しないか確認（SubAgent-A担当）
grep -rn "SKILL_CREATOR_UNDO\|undo-user-input" \
  packages/shared/src/ipc/channels.ts

# 既存の handleUndo 実装を確認（SubAgent-C担当）
grep -n "handleUndo\|canUndo" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# 既存の IPC チャンネル一覧を確認（追加チャンネルとの衝突確認）
grep -n "SKILL_CREATOR_" packages/shared/src/ipc/channels.ts
```

### 現状（2026-04-21 時点の確認結果）

- `ConversationalInterview.tsx` の `handleUndo`（L250〜）はローカル `interview.undo()` のみ呼び出し、IPC を呼んでいない
- `RuntimeSkillCreatorFacade.ts` に rollback メソッドは存在しない
- `creatorHandlers.ts` に `undo-user-input` ハンドラは存在しない
- `packages/shared/src/ipc/channels.ts` に UNDO 関連チャンネルは存在しない

## 受け入れ基準

- AC-1: `skill-creator:undo-user-input` IPC チャンネルが 4 層（定数・ホワイトリスト・ハンドラ・Preload API）すべてに追加されている
- AC-2: `RuntimeSkillCreatorFacade.rollbackLastInput(planId)` が呼ばれると、サーバー側の `awaitingUserInput` が前の質問状態に巻き戻される
- AC-3: `handleUndo` が IPC 経由で `undoUserInput` を呼び出し、サーバー状態と UI 状態が同期して巻き戻される
- AC-4: rollback 後の最新 `workflowSnapshot` が invoke 戻り値として返却され、UI に反映される
- AC-5: `pnpm typecheck` がエラーなしで通過する
- AC-6: `pnpm lint` がエラーなしで通過する

## 前提条件確認

```bash
# RALLY-005が完了しているか確認（本タスク着手前に必須）
cat docs/30-workflows/skill-create-flow-gaps/p05-seq-RALLY-005/artifacts.json | grep '"status"'
```

## 参照資料

| 資料名          | パス                                                                   | 用途                 |
| --------------- | ---------------------------------------------------------------------- | -------------------- |
| 設計分析書      | `docs/30-workflows/00-task-spec-design-docs/rally-phase-1-analysis.md` | 懸念点7の詳細        |
| 解決策設計書    | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` | RALLY-003の設計方針  |
| レビュー設計書  | `docs/30-workflows/00-task-spec-design-docs/rally-phase-3-review.md`   | リスク2の詳細        |
| RALLY-005成果物 | `docs/30-workflows/skill-create-flow-gaps/p05-seq-RALLY-005/`          | invoke正規ソース方針 |

## 成果物

| 成果物          | パス                                         | 説明                      |
| --------------- | -------------------------------------------- | ------------------------- |
| 要件定義書      | `outputs/phase-1/requirements-definition.md` | 問題の特定と実装方針      |
| 受け入れ基準    | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-6の詳細          |
| P50チェック結果 | `outputs/phase-1/p50-check-result.md`        | grep実行結果と現状分析    |
| IPC4層整合計画  | `outputs/phase-1/ipc-4layer-plan.md`         | 4層それぞれの追加内容計画 |

## 完了条件

- [ ] RALLY-005 完了を確認した（着手前必須）
- [ ] P50チェックコマンドを実行し、現状を確認した
- [ ] IPC 4層整合計画を確定した
- [ ] 受け入れ基準 AC-1〜AC-6 を確定した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] SubAgent-A（IPC設計）完了
- [ ] SubAgent-B（Facade設計）完了
- [ ] SubAgent-C（Renderer側設計）完了
- [ ] SubAgent-D（統合・IPC4層整合チェック）完了
- [ ] RALLY-005完了確認済み
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p03-seq-RALLY-003
```

## 次のPhase

Phase 2: 設計
