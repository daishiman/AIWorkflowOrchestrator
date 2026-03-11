# Phase 13: PR作成

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 13                                  |
| 機能名 | task-058e-ui-08-notification-center |
| 作成日 | 2026-03-11                          |
| 前提   | Phase 12                            |

## 目的

058e の実装差分、証跡、system spec 同期内容を PR 単位へ整理する。今回の依頼では実行しないが、将来の実行手順を固定する。

## 実行タスク

- PR要約作成: 058e の P50 補完点を 3 段で要約する。
- 証跡整理: test、coverage、manual screenshot、spec sync を列挙する。
- リスク整理: delete 追加と gesture 差分の残リスクを列挙する。

## 参照資料

| 参照資料               | パス                                            | 説明             |
| ---------------------- | ----------------------------------------------- | ---------------- |
| Phase 2 設計           | `outputs/phase-2/state-ipc-design.md`           | 設計根拠         |
| Phase 5 実装           | `outputs/phase-5/implementation-summary.md`     | 実装要約         |
| Phase 6 拡充           | `outputs/phase-6/integration-test.md`           | integration 結果 |
| Phase 7 coverage       | `outputs/phase-7/coverage-report.md`            | coverage 結果    |
| Phase 8 境界           | `outputs/phase-8/boundary-checklist.md`         | 境界確認         |
| Phase 9 品質           | `outputs/phase-9/quality-report.md`             | 品質結果         |
| Phase 10 結果          | `outputs/phase-10/final-review-result.md`       | 判定結果         |
| Phase 11 結果          | `outputs/phase-11/manual-test-result.md`        | 視覚証跡         |
| Phase 12 サマリー      | `outputs/phase-12/spec-update-summary.md`       | 仕様同期         |
| 未解決項目             | `outputs/phase-10/open-items.md`                | Phase 10 成果物  |
| 手動テスト計画         | `outputs/phase-11/manual-test-plan.md`          | Phase 11 成果物  |
| スクリーンショット一覧 | `outputs/phase-11/screenshot-matrix.md`         | Phase 11 成果物  |
| 実装ガイド             | `outputs/phase-12/implementation-guide.md`      | Phase 12 成果物  |
| ドキュメント更新履歴   | `outputs/phase-12/documentation-changelog.md`   | Phase 12 成果物  |
| 未タスク検出           | `outputs/phase-12/unassigned-task-detection.md` | Phase 12 成果物  |
| スキルフィードバック   | `outputs/phase-12/skill-feedback-report.md`     | Phase 12 成果物  |
| screenshot計画         | `outputs/phase-11/screenshot-plan.json`         | Phase 11 成果物  |
| screenshot網羅率       | `outputs/phase-11/screenshot-coverage.md`       | Phase 11 成果物  |
| 発見事項一覧           | `outputs/phase-11/discovered-issues.md`         | Phase 11 成果物  |

## 実行手順

### ステップ1: PR 本文構成

| セクション | 内容                             |
| ---------- | -------------------------------- |
| Summary    | P50 補完の要点                   |
| Validation | test、coverage、manual           |
| Spec Sync  | aiworkflow-requirements 更新内容 |
| Risk       | 残リスクと follow-up             |

### ステップ2: 本依頼での扱い

| 項目       | 扱い       |
| ---------- | ---------- |
| commit     | 実施しない |
| PR 作成    | 実施しない |
| 仕様書作成 | 実施対象   |

## 成果物

| 成果物 | パス                          | 説明      |
| ------ | ----------------------------- | --------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR 下書き |

## 完了条件

- [ ] PR 本文の構成を定義している
- [ ] 検証証跡の列挙方針を定義している
- [ ] 本依頼では commit / PR を実施しない前提を明記している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. PR 本文構成整理
2. 証跡整理
3. リスク整理
4. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-13/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 13 と整合している

## 次のPhase

完了
