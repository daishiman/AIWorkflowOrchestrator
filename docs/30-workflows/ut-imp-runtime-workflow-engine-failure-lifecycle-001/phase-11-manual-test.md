# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 11                                                   |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

実装前の文書ウォークスルーでも追える手動確認手順を定義し、失敗系の読み落としを減らす。

## 実行タスク

- reject / `success:false` / verify 要再確認 の walkthrough 手順を定義する
- ownership 文書と実装変更予定箇所の追跡手順を定義する
- discovered issue 記録先を定義する

## 参照資料

| 資料名           | パス                                        | 説明       |
| ---------------- | ------------------------------------------- | ---------- |
| Phase 4          | `phase-4-test-creation.md`                  | ケース一覧 |
| manual checklist | `outputs/phase-11/manual-test-checklist.md` | 目視手順   |

## 成果物

| 成果物            | パス                                        | 説明             |
| ----------------- | ------------------------------------------- | ---------------- |
| manual checklist  | `outputs/phase-11/manual-test-checklist.md` | 手順書           |
| manual result     | `outputs/phase-11/manual-test-result.md`    | 記録フォーマット |
| discovered issues | `outputs/phase-11/discovered-issues.md`     | 発見事項管理     |

## 統合テスト連携

- docs-only task として、Phase 2 の `outputs/phase-2/failure-transition-matrix.md`、Phase 5 の実装対象、Phase 6 の edge case、Phase 7 の concern、Phase 8 の helper 境界、Phase 9 の監査観点、Phase 10 の最終判定を順に読み下せることを確認する。
- walkthrough では表示面ではなく、`currentPhase` / `awaitingUserInput` / `verifyResult` / artifact history の owner と consumer rule を目視で追跡する。
- 実装時の引き継ぎに必要な blocker / note / info は `outputs/phase-11/discovered-issues.md` へ分類して残す。

## 完了条件

- [ ] 3 経路の walkthrough が定義されている
- [ ] 文書同期確認の手順が含まれている
- [ ] discovered issue の記録先が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
