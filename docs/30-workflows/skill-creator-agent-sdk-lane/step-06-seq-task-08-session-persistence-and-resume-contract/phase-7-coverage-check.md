# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 7                                       |
| 機能名 | session-persistence-and-resume-contract |
| 作成日 | 2026-03-26                              |

## 目的

save target、checkpoint 種別、invalidation reason、conflict reason の網羅性を確認する。

## 実行タスク

- save target coverage を確認する
- compatibility reason coverage を確認する
- checkpoint type coverage を確認する
- public/internal boundary coverage を確認する

## 参照資料

| 資料名                 | パス                                     | 説明               |
| ---------------------- | ---------------------------------------- | ------------------ |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md`         | coverage 基準      |
| Phase 5 実装           | `phase-5-implementation.md`              | 実装対象の責務境界 |
| Phase 6 test expansion | `phase-6-test-expansion.md`              | edge case 補完     |
| checkpoint topology    | `outputs/phase-2/checkpoint-topology.md` | checkpoint 種別    |

## 実行手順

### ステップ1: save target coverage を数える

- `phase-5-implementation.md` の shared contract / repository / restore entrypoint を coverage 軸へ写像する。
- `currentPhase`
- `awaitingUserInput`
- `verifyResult`
- `phaseArtifacts`
- `resumeTokenEnvelope`
- `routeSnapshot`
- `sourceProvenance`
- `revision` / `lease`

### ステップ2: invalidation coverage を数える

- version mismatch
- route mismatch
- manifest / hash mismatch
- stale lease / revision conflict
- root relocation warning

## 統合テスト連携

- Phase 9 の QA に coverage 結果を引き渡し、未カバー reason が残っていないか確認する。
- Phase 10 の最終レビューで save target と invalidation reason の 2 軸が説明可能か判定する。

## 成果物

| 成果物         | パス                        | 説明              |
| -------------- | --------------------------- | ----------------- |
| coverage check | `phase-7-coverage-check.md` | coverage 観点本文 |

## 完了条件

- [ ] save target 群が coverage 対象にある
- [ ] warning / reject / conflict reason が coverage 対象にある
- [ ] checkpoint 種別が coverage 対象にある
- [ ] **本Phase内の全タスクを100%実行完了**
