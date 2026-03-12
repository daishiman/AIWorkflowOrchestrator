# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 6                                                        |
| Phase名    | テスト拡充                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 前提Phase  | [phase-5-implementation.md](./phase-5-implementation.md) |
| 後続Phase  | [phase-7-coverage-check.md](./phase-7-coverage-check.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-12                                               |

## 目的

ストリーミング中断、履歴再開、文脈差し替え、mode 切替の境界ケースを検証する。

## 実行タスク

- abort / retry: 境界テストを追加する
- revive / handoff: 境界テストを追加する
- mode 切替: state reset / keep の境界テストを追加する
- workspace 文脈: 複数ファイル境界テストを追加する
- archive/current 差分: 必要な回帰テストを抽出する

## 参照資料

| 参照資料           | パス                                          | 内容             |
| ------------------ | --------------------------------------------- | ---------------- |
| implementation log | `outputs/phase-5/implementation-log.md`       | 実装差分         |
| session log        | `outputs/phase-5/session-implementation.md`   | revive / handoff |
| streaming log      | `outputs/phase-5/streaming-implementation.md` | abort / retry    |
| mode adapter log   | `outputs/phase-5/mode-adapter-log.md`         | mode 境界        |
| test cases         | `outputs/phase-4/test-cases.md`               | 追加テストの基礎 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容               |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------ |
| llm-streaming           | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`           | stream 境界        |
| interfaces-chat-history | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | history 契約       |
| arch-state-management   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | state ownership    |
| lessons learned         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | prior attempt 教訓 |

## 統合テスト連携

| 観点            | 連携内容                                                 |
| --------------- | -------------------------------------------------------- |
| boundary tests  | abort / revive / handoff を統合ケースへ広げる            |
| mode regression | 3 モード切替時の reset / keep 判定を固定する             |
| archive diff    | prior attempt と current HEAD の差分を回帰観点へ変換する |

## 成果物

| 成果物             | パス                                        | 説明                     |
| ------------------ | ------------------------------------------- | ------------------------ |
| テスト拡充結果     | `outputs/phase-6/test-expansion-result.md`  | 追加観点一覧             |
| 境界ケース一覧     | `outputs/phase-6/boundary-cases.md`         | abort / revive / handoff |
| mode regression 表 | `outputs/phase-6/mode-regression-matrix.md` | mode 切替観点            |

## 完了条件

- [x] abort / retry / revive / handoff の境界ケースが列挙されている
- [x] mode reset / keep の観点が列挙されている
- [x] archive/current 差分から回帰観点が抽出されている
- [x] Task03 handoff の失敗系観点が含まれている
