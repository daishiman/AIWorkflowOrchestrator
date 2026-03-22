# 未タスク検出レポート

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| タスクID | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR |
| 検出日   | 2026-03-22                           |
| 検出件数 | 2件                                  |

## 検出された未タスク

### UT-WORKSPACE-CHAT-STREAM-ERROR-TRANSITION-001

- 概要: `StreamingErrorDisplay` の表示/非表示に 200-300ms の軽量トランジションを追加する
- 検出元: Phase 1 NFR-1、Phase 10 最終レビュー、Phase 11 screenshot review
- 影響: Apple HIG 準拠の motion 完成度が未達のまま残る
- 対応方針: `prefers-reduced-motion` を考慮した banner transition を別 task として formalize する
- 指示書: `docs/30-workflows/unassigned-task/task-ut-workspace-chat-stream-error-transition-001.md`

### UT-WORKSPACE-CHAT-STREAM-ERROR-CONTRAST-001

- 概要: `StreamingErrorDisplay` の text / background / action color の WCAG 2.1 AA 判定を数値で固定する
- 検出元: Phase 1 NFR-2、Phase 11 dark/light screenshot review、Phase 12 エレガント検証
- 影響: a11y の妥当性が目視依存になり、将来の色変更で regression を見逃しやすい
- 対応方針: contrast report と必要な色調整を別 task として formalize する
- 指示書: `docs/30-workflows/unassigned-task/task-ut-workspace-chat-stream-error-contrast-001.md`

## 3ステップ完了状況

| ステップ           | 状態 | 内容                                                                |
| ------------------ | ---- | ------------------------------------------------------------------- |
| 指示書作成         | 完了 | 2件とも `docs/30-workflows/unassigned-task/` に formalize 済み      |
| backlog 登録       | 完了 | `task-workflow-backlog.md` に 2 件を追加                            |
| 関連仕様リンク追加 | 完了 | completed records / artifact inventory / system-spec summary に反映 |
