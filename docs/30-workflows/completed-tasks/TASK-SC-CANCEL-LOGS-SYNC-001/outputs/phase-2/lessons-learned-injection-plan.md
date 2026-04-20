---
phase: 2
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
artifact: lessons-learned-injection-plan
created_date: 2026-04-20
status: completed
---

# Phase 2 成果物: lessons-learned 注入計画

## 注入先

`.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`

## 注入形式

既存ファイルの h3 命名規則 `### L-<TASK-ID>-<NNN>: <summary>` に準拠し、
各知見を独立した h3 エントリとして追加する。

## 注入する 3 知見

### 知見 1: L-SC-CANCEL-NON-VISUAL-001

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| タイトル   | NON_VISUAL タスクの代替証跡確立                                                                         |
| 症状       | docs-sync wave は UI 画面がなく従来の screenshot 証跡が取得不能                                         |
| 原因       | Phase 11 手動テストが screenshot 前提に設計されていた                                                   |
| 解決策     | grep 出力スナップショットを TC-01〜TC-05 と 1:1 対応で取得し、`outputs/phase-11/grep-snapshots/` に配置 |
| 設計原則   | **NON_VISUAL タスクは代替証跡を明示的に定義**。text-based diff / grep / lint 出力が画像の役割を担う     |
| 適用条件   | タスク種別が docs-sync / config-sync / knowledge-base-sync など、UI 変更を伴わないすべての wave         |
| 関連タスク | TASK-SC-CANCEL-LOGS-SYNC-001（自身）、TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001（親）                      |

### 知見 2: L-SC-CANCEL-SCOPE-BOUNDARY-001

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| タイトル   | scope 境界の設計原則（branch 内 vs repo-wide）                                                          |
| 症状       | 親タスク Phase 12 close-out が他スキル/spec ファイルへ波及しないまま残っていた                          |
| 原因       | 親タスク scope を「branch 内ドキュメント」に限定したため、repo-wide sync は別タスクに分離する必要がある |
| 解決策     | 子タスク（本タスク）を別発行し、repo-wide sync wave として独立させ、親タスクは Phase 13 PR に専念       |
| 設計原則   | **親/子タスクの責務分離を scope で明示**。「branch 内」と「repo-wide」のどちらかを Phase 1 で固定       |
| 適用条件   | 親タスク close-out が複数スキルや canonical spec に波及するとき                                         |
| 関連タスク | 同上                                                                                                    |

### 知見 3: L-SC-CANCEL-REPO-WIDE-SYNC-001

| 項目       | 内容                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| タイトル   | repo-wide sync wave 手法                                                                                                                  |
| 症状       | 親タスク完了が複数スキル/ファイルに反映漏れ（Issue #2313 報告の 6 項目中 5 項目）                                                         |
| 原因       | 親タスクが branch 内に閉じた close-out のみを実行したため、mirror / canonical への波及が欠落                                              |
| 解決策     | repo-wide sync wave を別タスクとして発行し、Lane A/B/C 並列実行で 5 ファイル群を一括同期。Phase 11 で grep スナップショットにより証跡取得 |
| 設計原則   | **close-out の波及は Lane 分けした並列 wave で実施**。Lane A（LOGS）/ Lane B（canonical + lessons）/ Lane C（親 index.md）で責務分離      |
| 適用条件   | 親タスクの close-out が 5 ファイル以上に波及するとき                                                                                      |
| 関連タスク | 同上、Issue #2313                                                                                                                         |

## 注入位置ルール

| ルール    | 内容                                                                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 位置      | 既存末尾エントリの直後に新規エントリ 3 件を連続追加                                                                                                  |
| 順序      | L-SC-CANCEL-NON-VISUAL-001 → L-SC-CANCEL-SCOPE-BOUNDARY-001 → L-SC-CANCEL-REPO-WIDE-SYNC-001                                                         |
| h2 見出し | 既存の `## TASK-*** 教訓（date）` パターンがあれば、新規 h2 `## TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 教訓（2026-04-20）` を追加し、その下に 3 × h3 |
| 日付      | 親タスクの完了日として `2026-04-20`                                                                                                                  |

## 注入前チェック

- [ ] 既存エントリで同等の知見が既に記録されていないか（重複排除）
- [ ] h3 命名規則 `### L-<TASK-ID>-<NNN>:` が既存と一致するか
- [ ] 表の列構成（症状 / 原因 / 解決策 / 設計原則 / 適用条件 / 関連タスク）が既存と一致するか

## 参照資料

- [sync-design.md](sync-design.md)
- [target-file-map.md](target-file-map.md)
- [../../phase-2-design.md](../../phase-2-design.md)
