# Phase 3 成果物: MINOR 追跡表

- タスクID: TASK-LOGS-ARCHIVE-POLICY-001
- 作成日: 2026-04-19
- 用途: 本タスクで採用しなかった軽微改善案・将来圧縮案・運用監視項目を追跡する

## 1. 将来圧縮案（simpler alternative B の追跡）

| 項目                       | 内容                                                             | 検討時期       |
| -------------------------- | ---------------------------------------------------------------- | -------------- |
| 13 Phase → 5 Phase 圧縮    | docs-only タスクで Phase 4-10 を 1 Phase に集約する雛形改善案    | 次回雛形見直し |
| Phase 11 条件分岐の整理    | NON_VISUAL タスクで Phase 11 を「UI 変更確認 Phase」に名称再設計 | 雛形 v2        |
| Phase 12 成果物 6 件の整理 | docs-only 用と実装 task 用で canonical 成果物セットを分岐定義    | 雛形 v2        |

採用しない理由: 本タスクは TASK-CONFLICT-PREVENT-001 の直後にあるため、
雛形改変は mirror sync 機構の連動検証を巻き込む恐れがある。MINOR として追跡のみ。

## 2. 運用監視項目（Phase 12 以降の継続観察）

| ID   | 監視項目                                              | 監視頻度 | 担当        |
| ---- | ----------------------------------------------------- | -------- | ----------- |
| M-01 | 閾値 300 行 / 30 KB の妥当性（6 か月ごと見直し）      | 6 か月   | skills 管理 |
| M-02 | legacy（feb/march）表記の残件数                       | 四半期   | skills 管理 |
| M-03 | mirror sync の失敗件数（references/ 配下）            | 月次     | infra       |
| M-04 | topic-map / quick-reference / resource-map の参照整合 | 月次     | docs 管理   |
| M-05 | 月初第 1 営業日判定ルールの実運用遵守率               | 四半期   | skills 管理 |

## 3. 軽微な改善候補（本タスクでは対応しない）

| ID   | 改善案                                       | 備考                                                 |
| ---- | -------------------------------------------- | ---------------------------------------------------- |
| m-01 | `logs-archive-index.md` の自動生成スクリプト | 別タスクで automation 担当に委譲                     |
| m-02 | 閾値検知の CI 組み込み                       | 自動化実装は本タスク scope 外（明示済み）            |
| m-03 | legacy feb/march からの遡及リネーム          | 遡及適用は本タスク scope 外（明示済み）              |
| m-04 | `YYYY-MM-<topic>.md` 形式の正式化            | aiworkflow-requirements 配下のトピック拡張は既存運用 |

## 4. 引き継ぎ先

- M-01〜M-05: Phase 12 implementation-guide.md の「運用監視」セクションに転記
- m-01〜m-04: 将来タスク候補として unassigned-task-detection.md（Phase 12）に記載候補
