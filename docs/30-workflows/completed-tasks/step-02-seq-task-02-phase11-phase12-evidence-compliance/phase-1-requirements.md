# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 1                                                          |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |

## 目的

`TASK-SDK-02` の Phase 11 / 12 docs drift を要件として固定し、是正範囲と完了判定を明文化する。

## 実行タスク

- source inventory を取り、親 workflow と issue の差分を整理する
- Phase 11 / 12 の不足要件を FR / NFR / AC に落とす
- scope / non-scope を切り分ける
- validator と human review の責務境界を定義する

## 参照資料

| 資料名            | パス                                                                                                                | 説明                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| issue 原票        | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-02-phase11-phase12-evidence-compliance-001.md` | 是正要求                |
| 親 workflow index | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`                              | 対象全体                |
| 親 Phase 11       | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-11-manual-test.md`               | 既存 manual test 仕様   |
| 親 Phase 12       | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-12-documentation.md`             | 既存 documentation 仕様 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                                            | 内容                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Runtime public IPC 契約 | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | Task02 親機能の正本        |
| アーキテクチャ概要      | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`                               | facade / engine owner 分離 |
| サービス詳細            | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                     | Task02 current fact        |
| 教訓                    | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | drift 再発防止             |

## 実行手順

### ステップ0: P50チェック

親 workflow の現物を確認する。

```bash
sed -n '1,240p' docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-11-manual-test.md
sed -n '1,260p' docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-12-documentation.md
find docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-11 -maxdepth 2 -type f | sort
find docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-12 -maxdepth 1 -type f | sort
```

### ステップ1: 機能要件

- FR-1: Phase 11 仕様書は visual / non-visual 判定を先に要求する
- FR-2: Phase 11 仕様書は `## テストケース` と `## 画面カバレッジマトリクス` を要求する
- FR-3: Phase 11 仕様書は `TC-ID -> evidence path -> 結果` の紐付けを要求する
- FR-4: Phase 12 仕様書は 6 成果物の役割差分を明示する
- FR-5: `implementation-guide.md` は Part 1 / Part 2 必須要件を明示する
- FR-6: `phase12-task-spec-compliance-check.md` は Task 12-1〜12-5 の内容完了を確認する
- FR-7: validator PASS と guide 準拠レビューを別チェックとして扱う

### ステップ1.5: 一次結論を固定する

- 真の論点: 「validator PASS」と「human-authored evidence 完了」の混同を解消する
- 依存境界: runtime 実装変更は親 workflow の責務、今回は docs contract のみを扱う
- 価値とコスト: 実装に触れずに完了判定の信頼性を最大化する
- 改善優先順位: Phase 12 completion contract → Phase 11 evidence contract → validator / review 分離

### ステップ2: 非機能要件

| ID    | 要件                                             | 検証方法                  |
| ----- | ------------------------------------------------ | ------------------------- |
| NFR-1 | placeholder 依存を current workflow に残さない   | manual review + validator |
| NFR-2 | path 名称と成果物名称を 1:1 に揃える             | `verify-all-specs.js`     |
| NFR-3 | same-wave 更新不要の場合も理由を Phase 12 に残す | compliance check          |
| NFR-4 | completed 移動不可条件を明示する                 | Phase 10 / 13             |
| NFR-5 | docs-only task でも再検証ログを要求する          | Phase 9 / 10 / 12         |

### ステップ3: 受入基準の固定

AC-1〜AC-8 は [`index.md`](./index.md) の表を正本とし、Phase 7 で coverage として再確認する。

### ステップ4: スコープ境界

**スコープ内**

- Phase 11 / 12 仕様書の再設計
- evidence 運用、validator 運用、compliance 運用の明文化
- current workflow 上の docs 成果物更新計画

**スコープ外**

- `RuntimeSkillCreatorFacade` / `SkillCreatorWorkflowEngine` 実装変更
- aiworkflow-requirements の spec 本文変更
- PR 作成

## 因果ループ

| 種類           | ループ                                                                                             | 含意                               |
| -------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 強化ループ     | placeholder で close する → docs 信頼性が下がる → 再監査が粗くなる → さらに placeholder に依存する | placeholder 禁止を完了条件へ入れる |
| バランスループ | Task 12-1〜12-5 を内容完了で確認する → 不足が露出する → close 条件が厳密化される                   | compliance check を最後に回す      |

## 4条件評価

| 条件   | Phase 1 の判断                                                        |
| ------ | --------------------------------------------------------------------- |
| 価値性 | Phase 11 / 12 close-out の誤判定防止に直結するため高い                |
| 実現性 | docs-only 修正に閉じれば 1 workflow 内で実施可能                      |
| 整合性 | FR / NFR / AC を親 workflow と corrective workflow に分離して維持する |
| 運用性 | validator と manual review の二重ゲートで再発防止できる               |

## 戦略仮説

- 仮説H1: Phase 12 の Task 12-2 Step 1-A/1-B/1-C と Step 2 判定を明示すれば、same-wave drift は大幅に減る
- 仮説H2: Phase 11 を visual / non-visual gate で先に分岐させれば、placeholder evidence の再発を抑えられる

## 統合テスト連携

| 観点               | 方法                                              | 期待結果                               |
| ------------------ | ------------------------------------------------- | -------------------------------------- |
| spec validator     | `validate-phase-output.js`                        | Phase 構造が PASS                      |
| workflow validator | `verify-all-specs.js --json`                      | ambiguity / missing ref が 0           |
| phase11 validator  | `validate-phase11-screenshot-coverage.js --json`  | coverage 不足が 0 または例外根拠が明示 |
| phase12 validator  | `validate-phase12-implementation-guide.js --json` | guide 骨格が PASS                      |

## 成果物

| 成果物           | パス                                  | 説明                 |
| ---------------- | ------------------------------------- | -------------------- |
| requirements     | `outputs/phase-1/requirements.md`     | FR / NFR / AC 固定   |
| source inventory | `outputs/phase-1/source-inventory.md` | 元資料と不足点の一覧 |

## 完了条件

- [ ] issue 原票と親 workflow を棚卸し済み
- [ ] FR-1〜FR-7 を定義済み
- [ ] NFR-1〜NFR-5 を定義済み
- [ ] AC-1〜AC-8 を固定済み
- [ ] スコープ内 / 外を明記済み
- [ ] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 2: 設計（[phase-2-design.md](./phase-2-design.md)）
