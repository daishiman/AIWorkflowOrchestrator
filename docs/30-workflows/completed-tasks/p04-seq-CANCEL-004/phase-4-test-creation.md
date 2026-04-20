# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 4                                  |
| タスクID   | TASK-SW-CANCEL-004                 |
| 機能名     | skill-creator-cancel-renderer-hook |
| 前提Phase  | Phase 3                            |
| 後続Phase  | Phase 5                            |
| 作成日     | 2026-04-20                         |
| ステータス | completed                          |

## 目的

既存 `useCancelGeneration.test.ts` を主証跡として AC との対応を固定し、必要なら同ファイルへの最小追加を計画する。

## 実行タスク

1. `useCancelGeneration.test.ts` の既存ケースを棚卸しする
2. `abort`、`stage=cancelled`、IPC 呼び出し、undefined guard、IPC failure swallow の観点を照合する
3. 追加が必要なら新規ファイルではなく同ファイルへの targeted 追加方針を記録する

## 参照資料

| 資料       | パス                                                                    | 用途     |
| ---------- | ----------------------------------------------------------------------- | -------- |
| 既存テスト | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts` | 主証跡   |
| 対象実装   | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                | 契約確認 |
| Phase 2    | `phase-2-design.md`                                                     | 期待契約 |

## 統合テスト連携

| 判定項目                    | 基準     | 結果      |
| --------------------------- | -------- | --------- |
| AC と既存テストの対応表作成 | 完了     | completed |
| 不足ケースの有無判定        | 判定済み | completed |

## 成果物

| 成果物           | パス                                                                    | 説明             |
| ---------------- | ----------------------------------------------------------------------- | ---------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md`                                        | AC ↔ test 対応表 |
| 対象テスト       | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts` | 必要時のみ追記   |

## 完了条件

- [ ] 既存テストとの対応表を作成した
- [ ] 不足ケースの有無を判定した
- [ ] 追加が必要な場合の最小方針を定義した
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装確認
