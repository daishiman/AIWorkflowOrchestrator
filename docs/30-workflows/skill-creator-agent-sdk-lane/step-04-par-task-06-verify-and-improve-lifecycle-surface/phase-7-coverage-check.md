# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 7                                    |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

verify / improve / apply / re-verify の閉ループが抜けなくカバーされているか確認する。

## 実行タスク

- phase flow coverage を確認する
- lane coverage を確認する
- provenance coverage を確認する

## 参照資料

| 資料名                 | パス                                        | 説明             |
| ---------------------- | ------------------------------------------- | ---------------- |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md`            | 基本観点         |
| Phase 5 implementation | `phase-5-implementation.md`                 | 実装対象         |
| Phase 6 summary        | `outputs/phase-6/test-expansion-summary.md` | edge case 追加分 |

## 実行手順

### ステップ1: flow coverage を確認する

- execute -> verify
- verify -> improve
- improve -> apply
- apply -> re-verify

### ステップ2: lane / provenance coverage を確認する

- integrated_api
- terminal_handoff
- provenance あり
- provenance 欠落

## 統合テスト連携

- Phase 5 実装ケースと Phase 6 edge case を突き合わせて未カバー領域を抽出する
- Phase 9 QA の入力として coverage summary を渡す

## 成果物

| 成果物             | パス                                  | 説明                |
| ------------------ | ------------------------------------- | ------------------- |
| カバレッジ確認仕様 | `phase-7-coverage-check.md`           | coverage 観点       |
| coverage summary   | `outputs/phase-7/coverage-summary.md` | coverage 結果の要約 |

## 完了条件

- [ ] 閉ループ観点が網羅されている
- [ ] integrated_api と terminal_handoff の両方を確認している
- [ ] **本Phase内の全タスクを100%実行完了**
