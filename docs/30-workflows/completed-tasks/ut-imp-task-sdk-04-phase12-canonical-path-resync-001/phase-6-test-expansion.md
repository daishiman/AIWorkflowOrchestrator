# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 6                                                    |
| 機能名 | ut-imp-task-sdk-04-phase12-canonical-path-resync-001 |
| 作成日 | 2026-03-27                                           |

## 目的

Phase 5 で更新した close-out 証跡に対し、見落としや再発しやすい drift 観点を追加する。

## 実行タスク

- old path 別表記の検出観点を追加する
- completed judgement の回帰観点を追加する
- follow-up 導線の参照切れ観点を追加する
- verification note の誤説明観点を追加する

## 参照資料

| 資料名         | パス                             | 説明             |
| -------------- | -------------------------------- | ---------------- |
| Phase 5 実装   | `phase-5-implementation.md`      | 実更新手順       |
| Phase 4 テスト | `phase-4-test-creation.md`       | baseline 観点    |
| test matrix    | `outputs/phase-4/test-matrix.md` | baseline command |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                              | 内容                                       |
| ---------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 12 lessons | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | wording drift、path drift、inventory drift |

## 実行手順

1. old path の省略表記、相対表記、legacy family 表記を列挙する
2. `spec_created` 維持根拠の言い換え drift を列挙する
3. `UT-SC-02-006` と `TASK-SDK-04-U1..U3` の参照切れ観点を追加する
4. verification note の current code 説明と close-out 説明が一致するか確認する

## 成果物

| 成果物   | パス                        | 説明                 |
| -------- | --------------------------- | -------------------- |
| 拡張観点 | `phase-6-test-expansion.md` | drift 再発観点の追補 |

## 統合テスト連携

- Phase 7 は Phase 6 の拡張観点が coverage に入っているか確認する。
- Phase 9 は Phase 6 の drift 観点を validator と grep の補助根拠に使う。

## 完了条件

- [ ] old path の別表記観点が追加されている
- [ ] judgement drift の回帰観点が追加されている
- [ ] follow-up 導線の参照切れ観点が追加されている
- [ ] verification note の誤説明観点が追加されている
- [ ] **本Phase内の全タスクを100%実行完了**
