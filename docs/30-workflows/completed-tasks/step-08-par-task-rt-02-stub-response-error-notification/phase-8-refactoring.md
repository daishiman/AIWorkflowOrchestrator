# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 8                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

error code / message / type guard の重複を集約し、後続 RT タスクで再利用可能にする。

## 実行タスク

- reason code メッセージを定数化する
- plan / improve の error builder を共通化する
- renderer の fallback 文言を共通化する

## 参照資料

| 資料名             | パス                        | 説明                   |
| ------------------ | --------------------------- | ---------------------- |
| Phase 1 要件       | `phase-1-requirements.md`   | 非対象範囲と受入基準   |
| Phase 2 設計       | `phase-2-design.md`         | 共通化してよい責務境界 |
| Phase 5 実装       | `phase-5-implementation.md` | リファクタ対象         |
| Phase 7 カバレッジ | `phase-7-coverage-check.md` | 補完すべき重複箇所     |

## 実行手順

### 推奨整理

- `DEGRADED_REASON_MESSAGES` を 1 箇所に置く
- `buildRuntimeUnavailableError(reason)` を用意する
- `isRuntimePlanErrorResponse` / `isRuntimeImproveErrorResponse` の命名粒度を揃える

## 統合テスト連携

- Phase 9 で refactor 後も型・lint・テストが崩れていないことを確認する

## 成果物

| 成果物         | パス                                    | 説明       |
| -------------- | --------------------------------------- | ---------- |
| リファクタ記録 | `outputs/phase-8/refactoring-record.md` | 共通化内容 |

## 完了条件

- [ ] reason code と message の重複が減っている
- [ ] helper 抽出で契約が読みやすくなっている
- [ ] renderer fallback 文言が 1 箇所に寄っている
- [ ] **本Phase内の全タスクを100%実行完了**
