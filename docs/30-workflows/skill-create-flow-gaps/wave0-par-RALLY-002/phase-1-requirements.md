# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| タスク名   | restoredPendingRequest合成ルール明確化 |
| 前提Phase  | -                                      |
| 後続Phase  | Phase 2                                |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |

## 目的

`ConversationalInterview.tsx` の `pendingRequest` 合成式における優先ルールの不明確さを特定し、修正の受け入れ基準を確定する。

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                                           | 並列/直列          |
| ---------- | ------------------ | ---------------------------------------------------------------- | ------------------ |
| SubAgent-A | 現状コード解析     | pendingRequest合成式・restoredPendingRequestの現在の使われ方確認 | 並列（B と同時）   |
| SubAgent-B | 期待動作定義       | セッション復元フローでの正しい動作・クリア条件の整理             | 並列（A と同時）   |
| SubAgent-C | 統合・矛盾チェック | A・B の結果統合と変更方針の最終確認                              | 直列（A・B完了後） |

## P50チェック（実施必須）

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# restoredPendingRequest の現在の使われ方を確認（SubAgent-A担当）
grep -n "restoredPendingRequest\|pendingRequest\|awaitingUserInput" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# restoredPendingRequest がセットされる箇所を確認（SubAgent-A担当）
grep -n "setRestoredPendingRequest" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# workflowSnapshot の更新箇所を確認（SubAgent-B担当）
grep -n "setWorkflowSnapshot\|workflowSnapshot" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx
```

### 現状（2026-04-21 時点の確認結果）

- `ConversationalInterview.tsx` の L34〜45 付近に以下が存在する:

  ```typescript
  const [restoredPendingRequest, setRestoredPendingRequest] = ...;

  const pendingRequest =
    restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null;
  ```

- 合成式の優先ルールを説明するコメントは存在しない
- `workflowSnapshot?.awaitingUserInput` が更新されたときに `restoredPendingRequest` がクリアされるロジックが不明確

## 受け入れ基準

- AC-1: `pendingRequest` 合成式の直上に、`restoredPendingRequest` を優先する理由と適用条件を説明するコメントが追加されている
- AC-2: `workflowSnapshot?.awaitingUserInput` が非 null になったとき、`restoredPendingRequest` がクリア（null 化）されるロジックが存在する
- AC-3: コードを読んだ開発者が「どの状態のとき restoredPendingRequest が使われ、いつ workflowSnapshot 側に切り替わるか」を理解できる
- AC-4: `pnpm typecheck` がエラーなしで通過する
- AC-5: `pnpm lint` がエラーなしで通過する（exhaustive-deps 警告含む）

## 実行手順

1. SubAgent-A: `grep` で `pendingRequest` / `restoredPendingRequest` / `awaitingUserInput` の現状コードを確認する
2. SubAgent-B: セッション復元フローのドキュメントや設計書から期待動作を確認する
3. SubAgent-C: A・B の結果を統合し、変更方針（コメント追加 + useEffect追加）を確定する

## 参照資料

| 資料名       | パス                                                                     | 用途                |
| ------------ | ------------------------------------------------------------------------ | ------------------- |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | 現状コード確認      |
| 設計分析書   | `docs/30-workflows/00-task-spec-design-docs/rally-phase-1-analysis.md`   | 懸念点2の詳細       |
| 解決策設計書 | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md`   | RALLY-002の設計方針 |

## 成果物

| 成果物          | パス                                         | 説明                           |
| --------------- | -------------------------------------------- | ------------------------------ |
| 要件定義書      | `outputs/phase-1/requirements-definition.md` | 問題の特定と修正方針           |
| 受け入れ基準    | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5の詳細               |
| P50チェック結果 | `outputs/phase-1/p50-check-result.md`        | grep実行結果と合成式の現状分析 |

## 完了条件

- [ ] P50チェックコマンドを実行し、現状の合成式を確認した
- [ ] セッション復元フローにおける期待動作を確認した
- [ ] 受け入れ基準 AC-1〜AC-5 を確定した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] SubAgent-A（現状コード解析）完了
- [ ] SubAgent-B（期待動作定義）完了
- [ ] SubAgent-C（統合・矛盾チェック）完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p02-seq-RALLY-002
```

## 次のPhase

Phase 2: 設計
