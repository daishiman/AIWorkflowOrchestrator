# [#1424] [UT-CLEANUP-AI-CHECK-CONNECTION-001] AI_CHECK_CONNECTION ハンドラー削除

## タスク概要

Step 03-09 の全 surface 移行完了後に `AI_CHECK_CONNECTION` ハンドラーを `aiHandlers.ts` から削除する。

## メタ情報

- **タスクID**: UT-CLEANUP-AI-CHECK-CONNECTION-001
- **優先度**: 低
- **分類**: cleanup
- **依存**: Step 03-09 全 surface の `llm:check-health` 移行完了
- **関連**: TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001（Phase 3 M-3）

## 廃止トリガー

`grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/renderer/` の結果が 0 件

## 仕様書

`docs/30-workflows/unassigned-task/UT-CLEANUP-AI-CHECK-CONNECTION-001.md`
