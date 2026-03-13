# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| Phase名    | テストカバレッジ確認                   |
| タスクID   | TASK-SKILL-LIFECYCLE-04                |
| 前提Phase  | Phase 5（実装）, Phase 6（テスト拡充） |
| 後続Phase  | Phase 8（リファクタリング）            |
| ステータス | completed                              |
| 作成日     | 2026-03-12                             |
| 機能名     | skill-lifecycle-evaluation-gate        |

## 目的

gate engine、slice、UI、cross-task integration の未検証箇所を洗い出し、Refactor 前に coverage gap を解消する。

## 実行タスク

- unit coverage 監査: gate engine、score aggregation、delta 計算の未検証分岐を抽出する
- store coverage 監査: `skillEvaluationSlice` の state 遷移未検証分岐を抽出する
- UI coverage 監査: warning / recommended / revise 表示の DOM 条件未検証を抽出する
- integration coverage 監査: Task03 / Task05 handoff の未検証遷移を抽出する
- remediation plan 作成: Phase 8 前に埋める gap を優先順位付きで整理する

## 参照資料

| 参照資料                      | パス                                       | 説明                        |
| ----------------------------- | ------------------------------------------ | --------------------------- |
| Phase 5 実装                  | `phase-5-implementation.md`                | 対象実装                    |
| Phase 6 テスト拡充            | `phase-6-test-expansion.md`                | 追加テスト対象              |
| Phase 4 integration test plan | `outputs/phase-4/integration-test-plan.md` | integration coverage の基準 |
| Phase 6 regression plan       | `outputs/phase-6/regression-plan.md`       | gap 洗い出しの基準          |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                            |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------- |
| quality-requirements     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | coverage target と test pyramid |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | lifecycle UI の代表証跡         |
| api-ipc-agent            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`            | IPC 契約の抜け確認              |

## 実行手順

### ステップ1: unit / store coverage を集計する

gate engine と slice の分岐を一覧化し、未検証分岐を抽出する。

### ステップ2: UI coverage を確認する

warning / recommended / revise / hard block の DOM 条件を確認し、抜けを抽出する。

### ステップ3: integration coverage を確認する

Task03 create / execute / improve と Task05 use / re-evaluate の遷移を照合する。

### ステップ4: remediation plan を作る

Phase 8 で処理する gap を high / medium / low に分類する。

## 統合テスト連携

| 観点        | 確認する内容                                          |
| ----------- | ----------------------------------------------------- |
| unit        | 分岐単位の未検証箇所                                  |
| integration | create / execute / improve / use / re-evaluate の抜け |
| UI          | phase 11 で撮るべき状態の漏れ                         |
| docs        | phase 12 で同期すべき gap の有無                      |

## 成果物

| 成果物            | パス                                       | 内容                   |
| ----------------- | ------------------------------------------ | ---------------------- |
| coverage target   | `outputs/phase-7/coverage-targets.md`      | 対象モジュールと目標値 |
| coverage gap 分析 | `outputs/phase-7/coverage-gap-analysis.md` | 未検証箇所と優先度     |

## 完了条件

- [x] gate engine の未検証分岐が列挙されている
- [x] slice と selector の未検証分岐が列挙されている
- [x] Task03 / Task05 integration gap が列挙されている
- [x] Phase 8 向け remediation 優先度が付いている
- [x] coverage target と gap 分析が出力されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 8: リファクタリング](./phase-8-refactoring.md) に進む
