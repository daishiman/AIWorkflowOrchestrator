# [#1914] "[UT-FIX-EP-01-STALE-EVENT-E2E-VERIFICATION] SkillLifecyclePanel stale イベント対策の E2E レベル検証"

## メタ情報

```yaml
task_id: UT-FIX-EP-01-STALE-EVENT-E2E-VERIFICATION
task_name: SkillLifecyclePanel stale イベント対策の E2E レベル検証
category: テスト拡充
target_feature: -
priority: 低
scale: 小規模
status: 未着手
source_phase: -
created_date: 2026-04-04
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-FIX-EP-01-STALE-EVENT-E2E-VERIFICATION.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未着手 |

---

## 概要

fire-and-forget パターンにおいて、`isDestroyed()` 分岐や stale イベント（古い planId のイベントが遅延到着するケース）に関する E2E レベルの検証が未実装。`isDestroyed()` チェックはコード上で実装済みだが、実際のウィンドウ破棄シナリオでの直接テストは存在しない。

## 影響範囲

- `apps/desktop/src/main/ipc/creatorHandlers.ts` — `emitWorkflowStateChanged` の `isDestroyed()` チェック
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — `activeWorkflowId` による stale イベントフィルタリング

## 対応方針

1. 以下のシナリオを E2E テストで検証:
   - `executeAsync` 実行中にウィンドウを閉じた場合、`isDestroyed()` で安全にスキップされること
   - planId-A の実行中に planId-B の実行を開始した場合、planId-A の完了イベントが無視されること
   - ウィンドウ再オープン後に古いイベントが到着しても crash しないこと
2. Playwright E2E 環境が前提（UT-FIX-EP-01-E2E-PLAYWRIGHT-FIRE-AND-FORGET と合わせて対応推奨）

## 苦戦箇所（TASK-FIX-EP-01 からの知見）

- **stale イベントの発生タイミング**: fire-and-forget パターンでは IPC レスポンスと完了イベントが分離しているため、ユーザーが画面遷移やキャンセル操作を行った後に完了イベントが到着する可能性がある。`activeWorkflowId` による planId マッチングで対策しているが、E2E レベルでの確認は将来テスト拡充で対応が望ましい
- **依存**: UT-FIX-EP-01-E2E-PLAYWRIGHT-FIRE-AND-FORGET（E2E 基盤整備）

## 参照

- TASK-FIX-EP-01 Phase 3 テスト網羅性レビュー: MINOR 指摘
- `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/outputs/phase-12/unassigned-task-detection.md`: U-4
