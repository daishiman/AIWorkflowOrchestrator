# TASK-7D 未タスク検出レポート

- **日付**: 2026-01-30
- **タスク**: TASK-7D ChatPanel統合

---

## 検出ソース

| ソース                     | 確認結果                                            |
| -------------------------- | --------------------------------------------------- |
| タスク定義書「スコープ外」 | ChatPanel 自体の新規デザイン → 未タスク候補         |
| Phase 3 設計レビュー MINOR | SkillSelector onImportRequest 未実装 → 未タスク候補 |
| Phase 10 最終レビュー      | 指摘なし                                            |
| Phase 11 手動テスト        | スコープ外発見なし                                  |
| コードコメント TODO/FIXME  | なし                                                |

---

## 検出結果: 2件

### 未タスク候補 1: SkillSelector onImportRequest prop 追加

| 項目             | 内容                                                                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **重要度**       | Minor                                                                                                                                                                                                             |
| **根拠**         | Phase 3 MINOR 判定。SkillSelector に `onImportRequest` prop がないため、未インポートスキルクリック時に ChatPanel の `handleImportRequest` が自動トリガーされない。現状は ref 経由で親コンポーネントから呼出可能。 |
| **推奨**         | TASK-8 系列で対応検討                                                                                                                                                                                             |
| **ブロック影響** | なし（ref 経由で機能は実現済み）                                                                                                                                                                                  |
| **タスク仕様書** | [`docs/30-workflows/unassigned-task/task-imp-skillselector-onimportrequest-improvements.md`](../../../../unassigned-task/task-imp-skillselector-onimportrequest-improvements.md)                                  |

### 未タスク候補 2: ChatPanel 新規デザイン適用

| 項目             | 内容                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **重要度**       | Minor                                                                                                                                                          |
| **根拠**         | タスク定義書のスコープ外に明記。現在は placeholder slot（`model-selector-slot`、`message-list-slot`、`chat-input-slot`）で既存機能を保持。                     |
| **推奨**         | デザインタスクとして別途作成                                                                                                                                   |
| **ブロック影響** | なし（placeholder で既存機能維持）                                                                                                                             |
| **タスク仕様書** | [`docs/30-workflows/unassigned-task/task-imp-chatpanel-new-design-improvements.md`](../../../../unassigned-task/task-imp-chatpanel-new-design-improvements.md) |

---

## 結論

2件の未タスク候補を検出した。いずれも Minor 重要度であり、TASK-7D のブロッキング要因ではない。

- **未タスク候補 1**（SkillSelector onImportRequest）は TASK-8 系列での対応を推奨する。現時点では ref 経由で同等機能が実現されている。
- **未タスク候補 2**（ChatPanel 新規デザイン）はデザインタスクとして別途作成を推奨する。placeholder slot により既存機能は維持されている。

いずれの候補も、TASK-7D の完了判定に影響を与えるものではない。
