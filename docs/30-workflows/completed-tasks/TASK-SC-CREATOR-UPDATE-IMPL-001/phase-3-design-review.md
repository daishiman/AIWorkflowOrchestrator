# Phase 3: 設計レビュー

## メタ情報

| 項目                | 内容                            |
| ------------------- | ------------------------------- |
| Phase               | 3                               |
| タスクID            | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| 機能名              | SkillCreatorService update mode |
| taskType            | NON_VISUAL                      |
| implementation_mode | new                             |
| 前提Phase           | Phase 2                         |
| 後続Phase           | Phase 4                         |
| 作成日              | 2026-04-21                      |
| ステータス          | pending                         |

## 目的

Phase 2 設計が `runCreateWorkflow()` パターン、NON_VISUAL close-out、system spec sync 判断へ矛盾なく接続できるかをレビューし、Phase 4 へ進めるかを決定する。

## 実行タスク

### タスク1: 設計レビュー観点の評価

| 観点   | チェック内容                                    | 判定    |
| ------ | ----------------------------------------------- | ------- |
| 一貫性 | `runCreateWorkflow()` と処理責務が整合するか    | pending |
| 実現性 | `SkillService.updateSkill()` 境界で実装できるか | pending |
| 運用性 | Phase 11 / 12 まで閉じるか                      | pending |
| 検証性 | validation matrix で AC を確認できるか          | pending |

### タスク2: simpler alternative の再評価

- `runCreateWorkflow()` 共通化案
- update mode 専用メソッド案
- `SkillService` 側へ責務を寄せる案

### タスク3: gate 判定と戻り先の定義

| 判定     | 条件             | 戻り先                            |
| -------- | ---------------- | --------------------------------- |
| PASS     | 主要リスクなし   | Phase 4                           |
| MINOR    | 軽微な記述不足   | Phase 4 進行、Phase 5/9/12 で解消 |
| MAJOR    | 設計矛盾あり     | Phase 2                           |
| CRITICAL | 要件前提が崩れる | Phase 1                           |

### タスク4: Phase 13 blocked 条件の確認

- commit / PR 作成は user 指示があるまで禁止
- local check の結果を持たない状態で PR 情報を確定しない

## 参照資料

| 資料              | パス                                           | 用途              |
| ----------------- | ---------------------------------------------- | ----------------- |
| architecture 設計 | `outputs/phase-2/architecture-design.md`       | 主レビュー対象    |
| validation matrix | `outputs/phase-2/validation-matrix.md`         | 検証可能性確認    |
| sync 判断書       | `outputs/phase-2/system-spec-sync-decision.md` | Phase 12 接続確認 |

### システム仕様（aiworkflow-requirements）

| 参照資料                    | パス                                                                                | 内容                   |
| --------------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| skill creator current facts | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md` | 設計と契約の照合       |
| task workflow completed     | `.agents/skills/aiworkflow-requirements/references/task-workflow-completed.md`      | close-out パターン参照 |

## 実行手順

1. Phase 2 成果物を観点別にレビューする
2. simpler alternative を再比較し、採用案を確定する
3. PASS / MINOR / MAJOR / CRITICAL を判定する
4. MINOR があれば追跡表へ落とし、Phase 13 blocked 条件を明記する

## 統合テスト連携

| 判定項目            | 基準                             | 結果    |
| ------------------- | -------------------------------- | ------- |
| 設計→テスト接続     | validation matrix で AC を追える | pending |
| 設計→close-out 接続 | Phase 11/12 へ論理接続する       | pending |
| gate 判定           | 戻り先が曖昧でない               | pending |

## 多角的チェック観点（AIが判断）

- 批判的思考: 主要リスクを見逃していないか
- 垂直思考: Phase 4 へ進む条件が一本化されているか
- 因果関係分析: 設計欠陥が後続 Phase にどう波及するか見えているか
- 戦略的思考: MINOR をどこで解消するのが最小コストか
- 論点思考: 真の争点が3つ以内に収まっているか

## サブタスク管理

| サブタスク | 責務               | 状態    |
| ---------- | ------------------ | ------- |
| ST-7       | review-result 作成 | pending |
| ST-8       | gate-decision 作成 | pending |
| ST-9       | MINOR 追跡表作成   | pending |

## 成果物

| 成果物       | パス                               | 説明                                 |
| ------------ | ---------------------------------- | ------------------------------------ |
| レビュー結果 | `outputs/phase-3/review-result.md` | 観点別のレビューコメント             |
| gate 判定    | `outputs/phase-3/gate-decision.md` | PASS / MINOR / MAJOR / CRITICAL 判定 |

## 完了条件

- [ ] 観点別レビューが記録されている
- [ ] simpler alternative の採否が記録されている
- [ ] PASS / MINOR / MAJOR / CRITICAL と戻り先が定義されている
- [ ] Phase 13 blocked 条件が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] Phase 4 開始条件が明文化されている

## 次Phase

PASS または MINOR の場合は Phase 4: テスト作成。MAJOR は Phase 2、CRITICAL は Phase 1 へ戻す。
