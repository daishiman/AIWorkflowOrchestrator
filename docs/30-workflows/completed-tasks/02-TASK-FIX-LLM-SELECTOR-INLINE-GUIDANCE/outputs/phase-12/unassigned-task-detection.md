# 未タスク検出レポート

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE |
| 検出日   | 2026-03-21                            |
| 検出件数 | 2件                                   |

## 検出された未タスク

### UT-FIX-LLM-SETTINGS-DIRECT-SCROLL-001

- 概要: Settings root へは遷移できるが、LLM セクションまでの direct scroll / focus 誘導は未実装
- 検出元: Phase 2 設計書のスコープ外注記、Phase 11 screenshot review、Phase 12 artifact inventory 再監査
- 影響: 初回導線の最後の 1 ステップだけが手動操作に残り、ガイダンス価値が部分的になる
- 対応方針: 独立 task spec を作成し、SettingsView 側の section anchor と遷移 API を整理する
- 指示書: `docs/30-workflows/unassigned-task/task-ut-llm-settings-direct-scroll-001.md`

### UT-FIX-LLM-BANNER-DISMISS-001

- 概要: ChatView の guidance banner を一時的に閉じる dismiss UX が未実装
- 検出元: Phase 12 実装ガイドの拡張ポイント整理、30観点レビューの UX 負荷評価
- 影響: モデル未選択が長く続くケースで、繰り返し表示を煩わしく感じる可能性がある
- 対応方針: dismiss state の寿命と再表示条件を設計したうえで独立 task として実装する
- 指示書: `docs/30-workflows/unassigned-task/task-ut-llm-guidance-banner-dismiss-001.md`

## 3ステップ完了状況

| ステップ           | 状態 | 内容                                                                             |
| ------------------ | ---- | -------------------------------------------------------------------------------- |
| 指示書作成         | 完了 | 2件とも root `unassigned-task/` に作成                                           |
| backlog 登録       | 完了 | `task-workflow-backlog.md` に追加                                                |
| 関連仕様リンク追加 | 完了 | parent workflow / artifact inventory / lessons / current workflow outputs に反映 |
