# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 7                                                        |
| 名称       | テストカバレッジ確認                                     |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 |
| 作成日     | 2026-03-04                                               |
| 依存       | Phase 5, Phase 6                                         |
| ステータス | Draft                                                    |

## 目的

コマンド公開運用の主要シナリオを網羅し、Phase 8 以降へ進む判定を数値基準で固定する。

## 実行タスク

- カバレッジ計測: TC-01〜TC-12 の実施率を算出する。
- 欠落分析: 未達シナリオの原因を分類する。
- 進行判定: Phase 8 へ進む条件を確認する。

## 参照資料

| 資料               | パス                                                                                        | 用途           |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 5            | `phase-5-implementation.md`                                                                 | 実装前提       |
| Phase 6            | `phase-6-test-expansion.md`                                                                 | 拡充ケース参照 |
| Phase 5成果物      | `outputs/phase-5/implementation-summary.md`                                                 | 変更内容確認   |
| Phase 6成果物      | `outputs/phase-6/regression-matrix.md`                                                      | ケース一覧     |
| coverage validator | `.claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js` | 判定コマンド   |
| aiworkflow品質     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 受入基準       |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md`                                                  | Phase 6 成果物 |
| 監査分離ログ       | `outputs/phase-6/audit-split-log.md`                                                        | Phase 6 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                   | 内容             |
| -------- | ---------------------------------------------------------------------- | ---------------- |
| task台帳 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 判定値の記録先   |
| 教訓     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 欠落原因の記録先 |

## 実行手順

### Step 1: カバレッジ集計

- 対象ケース: TC-01〜TC-12
- 集計項目:
  - 実行件数
  - PASS 件数
  - FAIL 件数
  - 未実行件数

### Step 2: 判定基準適用

| 指標               | 合格基準 |
| ------------------ | -------- |
| ケース実行率       | 100%     |
| PASS率             | 100%     |
| coverage validator | PASS     |

### Step 3: 欠落分析

- scripts 登録漏れ
- 文書同期漏れ
- screenshot 実行環境不整合
- 監査ログ欠落

## 統合テスト連携

| 連携対象 | 連携内容                               |
| -------- | -------------------------------------- |
| Phase 8  | 欠落原因をリファクタ対象へ変換         |
| Phase 9  | 品質保証レポートへカバレッジ結果を転記 |

## 成果物

| 成果物             | パス                                 | 説明     |
| ------------------ | ------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 指標集計 |
| 欠落分析表         | `outputs/phase-7/gap-analysis.md`    | 原因分類 |

## 完了条件

- [ ] TC-01〜TC-12 の実行率が記録されている
- [ ] coverage validator 判定が記録されている
- [ ] 未達項目の原因分類が記録されている
- [ ] Phase 8 への入力項目が整理されている
- [ ] 合否判定が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 8 で欠落原因を解消する設計改善を実施する。

## 多角的チェック観点

| 観点           | 適用内容                                                | 参照仕様                                                                                    |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| セキュリティ   | 実行コマンドの公開範囲が限定されているか                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| UI/UX証跡      | Phase 11 の証跡取得コマンドが一意か                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             |
| アーキテクチャ | スクリプト実体と公開コマンドの責務が分離されているか    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| 品質           | verify/validate/coverage/audit の検証順序が維持されるか | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |

## サブタスク管理

| サブタスク         | 状態    |
| ------------------ | ------- |
| 参照資料確認       | pending |
| 実行タスク実施     | pending |
| 統合テスト連携確認 | pending |
| 成果物定義確認     | pending |
| 完了条件確認       | pending |

## タスク100%実行確認【必須】

- [ ] 本Phaseの実行タスクをすべて実行した
- [ ] 本Phaseの成果物定義と参照資料を照合した
- [ ] 本Phaseの完了条件を全て満たした
- [ ] 次Phaseへ渡す入力を明記した
