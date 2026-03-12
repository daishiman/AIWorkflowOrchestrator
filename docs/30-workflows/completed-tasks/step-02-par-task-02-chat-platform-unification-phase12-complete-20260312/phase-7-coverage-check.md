# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 7                                                        |
| Phase名    | カバレッジ確認                                           |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 前提Phase  | [phase-6-test-expansion.md](./phase-6-test-expansion.md) |
| 後続Phase  | [phase-8-refactoring.md](./phase-8-refactoring.md)       |
| ステータス | completed                                                |
| 作成日     | 2026-03-12                                               |

## 目的

Task02 の共通ロジックと mode adapter の両方が十分に検証されているか確認する。

## 実行タスク

- session coverage: 確認する
- streaming coverage: 確認する
- history / revive coverage: 確認する
- mode adapter coverage: 確認する
- Task03 handoff contract: coverage を確認する

## 参照資料

| 参照資料           | パス                                                                         | 内容           |
| ------------------ | ---------------------------------------------------------------------------- | -------------- |
| implementation log | `outputs/phase-5/implementation-log.md`                                      | 実装差分       |
| test expansion     | `outputs/phase-6/test-expansion-result.md`                                   | 追加テスト結果 |
| boundary cases     | `outputs/phase-6/boundary-cases.md`                                          | 境界ケース一覧 |
| mode regression    | `outputs/phase-6/mode-regression-matrix.md`                                  | mode 切替観点  |
| coverage standards | `.claude/skills/task-specification-creator/references/coverage-standards.md` | 基準           |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容            |
| ----------------------- | ------------------------------------------------------------------------------ | --------------- |
| arch-state-management   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | state ownership |
| interfaces-llm          | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`          | LLM 契約        |
| interfaces-chat-history | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | history 契約    |

## 統合テスト連携

| 観点           | 連携内容                                                    |
| -------------- | ----------------------------------------------------------- |
| common logic   | 共通基盤に coverage の穴がないことを品質判定へ渡す          |
| mode adapter   | adapter 側だけ未検証にならないことを refactoring 前提へ渡す |
| Task03 handoff | handoff contract の検証抜けを Phase 9 の品質観点へ渡す      |

## 成果物

| 成果物            | パス                                 | 説明          |
| ----------------- | ------------------------------------ | ------------- |
| coverage report   | `outputs/phase-7/coverage-report.md` | coverage 集計 |
| coverage gap list | `outputs/phase-7/coverage-gaps.md`   | 未検証観点    |

## 完了条件

- [x] 共通ロジック偏重や adapter 未検証がない
- [x] Task03 handoff contract の coverage が確認されている
- [x] coverage gap が次 Phase へ渡せる粒度で記録されている
- [x] 重大な未検証領域が整理されている
