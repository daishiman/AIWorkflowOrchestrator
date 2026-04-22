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
| ステータス | completed                              |

## 目的

`ConversationalInterview.tsx` の `pendingRequest` 合成式における優先ルールの不明確さを特定し、修正の受け入れ基準を確定する。

## 実行タスク

1. 現状コード、既存テスト、RALLY 波及先の依存関係を確認する
2. `pendingRequest` の優先ルール、クリア条件、UI観点の受け入れ基準を定義する
3. Phase 2 以降が迷わないよう、参照根拠と成果物名を固定する

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

## 統合テスト連携

- Phase 4 では `pendingRequest` 優先ルールを deterministic に観測できるテスト方針へ落とす
- Phase 6 では復元直後と snapshot 到着後の切替境界を回帰ケースとして固定する
- Phase 11 では Renderer UI と console error を実機確認し、Phase 12 で証跡へ昇格する

## 多角的チェック観点（AIが判断）

- システム思考: 復元状態、snapshot 到着、通常フローの状態遷移が閉じているか
- why思考: 問題の本質が「コメント不足」ではなく「優先ルールの暗黙化」であることを明文化できているか
- トレードオン思考: 即時表示の価値と stale state 温存リスクの均衡が取れているか
- 論点思考: RALLY-010 以降が前提として必要とする契約を Phase 1 で固定できているか

## サブタスク管理

- A: 現状コード解析
- B: 期待動作定義
- C: 矛盾チェックと受け入れ基準確定

## 参照資料

| 資料名        | パス                                                                     | 用途                        |
| ------------- | ------------------------------------------------------------------------ | --------------------------- |
| 対象ファイル  | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | 現状コード確認              |
| workflow索引  | `docs/30-workflows/wave0-par-RALLY-002/index.md`                         | 成果物・依存の正本          |
| artifacts台帳 | `docs/30-workflows/wave0-par-RALLY-002/artifacts.json`                   | Phase依存と status 整合確認 |

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
  docs/30-workflows/wave0-par-RALLY-002
```

## 次のPhase

Phase 2: 設計
