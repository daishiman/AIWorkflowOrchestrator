# TASK-SW-STRUCT-001 Phase 11: 手動テストチェックリスト

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | TASK-SW-STRUCT-001 |
| Phase      | 11                 |
| 作成日     | 2026-04-16         |
| ステータス | 完了               |

## 手動テストシナリオ

| シナリオID | 確認内容                                                    | 手順概要                                                 | 判定 |
| ---------- | ----------------------------------------------------------- | -------------------------------------------------------- | ---- |
| MT-01      | `structurePlan.purpose` が `options.description` と一致する | `(service as any).runCreateWorkflow(options)` を直接呼ぶ | PASS |
| MT-02      | `structurePlan.agents` がエージェント名リストである         | 同上                                                     | PASS |
| MT-03      | `createSkill()` が内部エラー時でもスキル生成を継続する      | `runCreateWorkflow` が `null` を返すケースを確認         | PASS |

## 実行時メモ

- UI/UX 変更はないため、スクリーンショットは不要
- `runCreateWorkflow` の fallback は内部エラー保護としてのみ残る
- `TASK-SW-STRUCT-002` では `structurePlan` を SKILL.md 生成へ接続する前提を確認する

## 完了確認

- [x] MT-01〜MT-03 のシナリオを定義した
- [x] `create` モードの内部動作確認に絞った
- [x] UI/UX 検証が不要であることを明記した
