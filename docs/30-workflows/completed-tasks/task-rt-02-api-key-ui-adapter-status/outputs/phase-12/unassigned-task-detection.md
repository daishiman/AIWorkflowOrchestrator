# 未タスク検出レポート

## サマリー

- 検出件数: 2
- 判定日: 2026-03-29
- 対象: `task-rt-02-api-key-ui-adapter-status`

## 未タスク一覧

### 1. Phase 11 evidence 取得

- ID: `UT-RT-02-PHASE11-EVIDENCE-001`
- 内容: `ready / failed / retry` の実画面スクリーンショットと手動結果の実測値が未取得
- 影響: UI task の完了証跡にならず、Phase 12 実装ガイドの screenshot 参照も暫定のまま
- 対応方針: 実機で API key を用意し、`outputs/phase-11/screenshots/` と手動結果 2 ファイルを確定させる

### 2. same-wave sync 完了

- ID: `UT-RT-02-SPEC-SYNC-001`
- 内容: workflow outputs は更新したが、system spec / `LOGS.md` / `topic-map.md` への close-out 同期は未実施
- 影響: task workflow と正本仕様の間で完了状態がずれる
- 対応方針: Phase 12 Step 1-A〜1-C を canonical spec まで反映する
