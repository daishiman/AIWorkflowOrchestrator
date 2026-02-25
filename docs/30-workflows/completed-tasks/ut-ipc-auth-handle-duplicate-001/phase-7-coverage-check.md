# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 7                                |
| タスクID   | UT-IPC-AUTH-HANDLE-DUPLICATE-001 |
| 機能名     | ut-ipc-auth-handle-duplicate-001 |
| 前提Phase  | Phase 6                          |
| 後続Phase  | Phase 8                          |
| ステータス | 未実施                           |
| 作成日     | 2026-02-25                       |

## 目的

対象コードと対象シナリオの網羅率を確認し、未検証領域を特定する。

## 実行タスク

- SubAgent-B: カバレッジ計測を実行し、未網羅箇所を抽出する。
- SubAgent-C: 実装差分に対する網羅率を算出する。
- Lead: Phase 8での補完対象を確定する。

## 参照資料

| 参照資料                  | パス                                                                        | 内容           |
| ------------------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 5                   | `phase-5-implementation.md`                                                 | 実装対象       |
| Phase 6                   | `phase-6-test-expansion.md`                                                 | 拡張テスト     |
| 品質要件                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準 |
| delta-report.md           | `outputs/phase-6/delta-report.md`                                           | Phase 6 成果物 |
| failure-cases.md          | `outputs/phase-6/failure-cases.md`                                          | Phase 6 成果物 |
| spec-planned-artifacts.md | `outputs/phase-6/spec-planned-artifacts.md`                                 | Phase 6 成果物 |
| test-expansion-result.md  | `outputs/phase-6/test-expansion-result.md`                                  | Phase 6 成果物 |

## 実行手順

1. カバレッジ計測コマンドを実行する。
2. 未網羅の分岐とケースを一覧化する。
3. Phase 8向けに補完優先度を設定する。

## 統合テスト連携

| 観点         | 判定条件                   |
| ------------ | -------------------------- |
| IPC契約分岐  | 主要分岐の未網羅が0件      |
| 認証異常系   | 重要な失敗パスが検証済み   |
| 登録再発検出 | 重複式再発ケースが網羅済み |

## 成果物

| 成果物             | パス                                 | 説明       |
| ------------------ | ------------------------------------ | ---------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 網羅率結果 |
| 未網羅一覧         | `outputs/phase-7/uncovered-items.md` | 補完対象   |

## 完了条件

- [ ] カバレッジ計測が完了している
- [ ] 未網羅項目が一覧化されている
- [ ] 補完優先度が設定されている
- [ ] 統合テスト連携観点の網羅判定が記録済み
- [ ] 本Phase内の全タスクを100%実行完了
