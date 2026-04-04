# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 8                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |
| 更新日 | 2026-04-04                       |

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

## execute guard 実装後のリファクタリング観点（2026-04-04 追記）

Phase 5 T-01（`_executeInternal()` の `!this.llmAdapter` ガード）実装後に以下を確認・整理する。

### M-01: DEGRADED_REASON_MESSAGES の一元化（Phase 8 で定数化）

- **現状**: `DEGRADED_REASON_MESSAGES` は `RuntimeSkillCreatorFacade.ts` のモジュールスコープに定義されており、**エクスポートされていない**
- **方針**: 後続タスク（`UT-RT-02-01-reason-code-i18n-standardization.md`）で i18n 化する予定のため、**本タスクでは文言変更不要**。Phase 8 では `packages/shared/src/types/skillCreator.ts` またはファサード専用の定数ファイルに移動し、plan / improve / execute の全ガードから参照できるようにすることを目標とする
- **対象**: `plan()` ガード（:814）、`improve()` ガード（:1275）、`_executeInternal()` ガード（T-01 追加予定）の3箇所が同一マップを参照すること
- **制約**: i18n 化（文言・キー変更）は後続タスクの責務であり、本タスクでは構造の一元化のみ行う

### M-02: buildDegradedError の execute 対応

- **現状**: `buildDegradedError()` ヘルパー（:1706）は plan / improve 向けに設計されている
- **方針**: execute の `SkillExecuteResult` 形式にも対応した `buildDegradedExecuteResult(reason, planResult, sourceProvenance)` を追加するか、既存ヘルパーを汎化する

## 実行手順

### 推奨整理

- `DEGRADED_REASON_MESSAGES` を 1 箇所に置く（M-01 参照）
- `buildRuntimeUnavailableError(reason)` を用意する
- `buildDegradedExecuteResult()` を追加するか `buildDegradedError()` を汎化する（M-02 参照）
- `isRuntimePlanErrorResponse` / `isRuntimeImproveErrorResponse` の命名粒度を揃える

## 統合テスト連携

- Phase 9 で refactor 後も型・lint・テストが崩れていないことを確認する

## 成果物

| 成果物         | パス                                    | 説明       |
| -------------- | --------------------------------------- | ---------- |
| リファクタ記録 | `outputs/phase-8/refactoring-record.md` | 共通化内容 |

## 完了条件

- [x] reason code と message の重複が減っている
- [x] helper 抽出で契約が読みやすくなっている
- [x] renderer fallback 文言が 1 箇所に寄っている
- [x] **DEGRADED_REASON_MESSAGES の変更なし（i18n は後続タスク `UT-RT-02-01-reason-code-i18n-standardization.md` の責務）**
- [x] **本Phase内の全タスクを100%実行完了**
