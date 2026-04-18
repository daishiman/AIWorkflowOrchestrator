# TASK-CONFLICT-PREVENT-001: Phase 7 ギャップリスト

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| タスクID   | TASK-CONFLICT-PREVENT-001 |
| Phase      | 7                         |
| 作成日     | 2026-04-18                |
| ステータス | completed                 |

## ギャップ一覧

### GAP-01: mirror full sync (.agents を .claude に追従)

| 項目             | 内容                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 区分             | G2 (mirror tree)                                                                                                                    |
| 深刻度           | follow-up                                                                                                                           |
| 理由             | LOGS.md / keywords.json / resource-map.md / topic-map.md / task-workflow-completed.md / skill-creator/SKILL.md に差分が残存している |
| 本 wave での扱い | parity diff を記録し mirror-parity-summary.md に残す。full sync は次 wave の follow-up タスクとする                                 |
| 影響             | .agents/skills が古い状態のまま参照されると canonical 設計と食い違う可能性がある                                                    |

### GAP-02: consumer audit (EVALS 以外)

| 項目             | 内容                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 区分             | G4 (volatile metadata)                                                                                                                     |
| 深刻度           | follow-up                                                                                                                                  |
| 理由             | EVALS.json の consumer audit は本 wave で実施したが、他ファイル (keywords.json / resource-map.md) の consumer 調査は部分的にとどまっている |
| 本 wave での扱い | EVALS のみ確認済みとして Phase 9 quality-report に記録。残 consumer は follow-up タスクで完全版を実施する                                  |
| 影響             | consumer 不明のまま merge policy を断定すると、consumer 側で意図しない動作が起きる可能性がある                                             |

### GAP-03: LOGS archive policy 詳細

| 項目             | 内容                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 区分             | G3 (append-only log)                                                                                                             |
| 深刻度           | Info                                                                                                                             |
| 理由             | union merge policy の設計は完了しているが、archive rotation タイミング・サイズ上限・archive 先パスの詳細ルールが定義されていない |
| 本 wave での扱い | 基本 policy (union) は Phase 2 設計で確定済み。詳細は unassigned-task-detection.md に記録して follow-up とする                   |
| 影響             | archive しない場合は LOGS.md が肥大化するが、競合防止本体には影響なし                                                            |

## ギャップサマリー

| GAP ID | 区分           | 深刻度    | 本 wave          | next wave      |
| ------ | -------------- | --------- | ---------------- | -------------- |
| GAP-01 | mirror tree    | follow-up | diff 記録のみ    | full sync 実施 |
| GAP-02 | consumer audit | follow-up | EVALS のみ確認   | 全対象の audit |
| GAP-03 | LOGS archive   | Info      | 基本 policy 確定 | 詳細ルール定義 |

## 接続先

- traceability-report.md: 要件起点での gap 対応付け
- Phase 9 mirror-parity-summary.md: GAP-01 の差分一覧
- Phase 12 unassigned-task-detection.md: follow-up タスク登録
