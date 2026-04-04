# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 11                                     |
| 機能名     | fix-step3-seq-execute-plan-nonblocking |
| タスクID   | TASK-FIX-EP-01                         |
| 作成日     | 2026-04-04                             |
| タスク分類 | NON_VISUAL                             |
| タスク種別 | NON_VISUAL（UI 変更なし）              |

---

## NON_VISUAL タスク記録

本タスクは `skill-creator:execute-plan` の IPC パターン変更のみで、Renderer の見た目変更はない。
そのため、画面スクリーンショットは不要であり、手動操作の確認項目は自動テスト結果で代替する。

## 実施方式

本タスクは IPC パターン変更のみで表示変更がないため、手動操作の代替として自動テスト結果を確認した。

## チェック項目

- [x] TC-T2-01: `execute-plan` invoke が 100ms 以内に `{ accepted: true, planId }` を返す
- [x] TC-T2-02: バックグラウンドで `executeAsync` が呼ばれる
- [x] TC-T2-02b: `onWorkflowStateSnapshot` が `workflow-state-changed` に relay される
- [x] TC-T2-02c: `mainWindow.isDestroyed()` の場合は snapshot を送らない
- [x] TC-T2-03: `executeAsync` がエラーを throw しても invoke は正常に返る
- [x] TC-T2-03b: `executeAsync` の reject が fire-and-forget 側でログ化される
- [x] TC-T2-04: 複数の `planId` が並列で invoke されてもそれぞれ受け付けられる
- [x] TC-T2-05: 1回目の `executeAsync` がエラーになった後、2回目の invoke が正常に動作する
- [x] TC-T2-06: `planId` が req から正しく抽出されて `executeAsync` に渡される
- [x] TC-T2-07: 10 件の並列 invoke が全て 100ms 以内に `{ accepted: true }` を返す
- [x] 補助-01: レスポンスに `{ accepted: true, planId }` が含まれる
- [x] 補助-02: `planId` の前後空白が trim される

## 備考

- `outputs/phase-11/automated-test-evidence.md` の 12/12 PASS を代替証跡として採用した
- `outputs/phase-11/alternative-verification.md` のカバレッジ表と整合する
- `workflow-state-changed` の通知経路は `SkillLifecyclePanel` 側の既存テストで回帰確認した
- 画面変更がないためスクリーンショットは不要
