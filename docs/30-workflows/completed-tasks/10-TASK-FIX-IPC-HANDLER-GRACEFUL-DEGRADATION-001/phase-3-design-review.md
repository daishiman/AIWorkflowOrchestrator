# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| Phase    | 3                                             |
| タスクID | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| 機能名   | ipc-handler-graceful-degradation              |
| 作成日   | 2026-03-07                                    |

## 目的

Phase 1（要件定義）と Phase 2（設計）の妥当性を検証し、実装前に設計の問題を検出・修正する。

## 実行タスク

- 要件カバレッジ検証: 全FR/NFRが設計でカバーされているかをマトリクスで確認する
- 設計整合性検証: 型定義、ヘルパー関数、ログ設計の整合性を検証する
- 既知の落とし穴照合: P5（二重登録）、P44（インターフェース不整合）との整合性を確認する

## 参照資料

| 資料名       | パス                                         | 説明           |
| ------------ | -------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 設計書       | `outputs/phase-2/design-document.md`         | Phase 2 成果物 |
| 落とし穴集   | `.claude/rules/06-known-pitfalls.md`         | P5, P44 参照   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物 |
| 型定義設計   | `outputs/phase-2/type-definitions.md`        | Phase 2 成果物 |
| シーケンス図 | `outputs/phase-2/sequence-diagram.md`        | Phase 2 成果物 |

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: 要件-設計トレーサビリティマトリクス

| 要件ID | 要件概要                                | 設計対応箇所                       | カバー状態 |
| ------ | --------------------------------------- | ---------------------------------- | ---------- |
| FR-01  | 個別失敗が後続を阻害しない              | `safeRegister` ヘルパー関数        | -          |
| FR-02  | 失敗ハンドラ名とエラー詳細をログ出力    | `console.error` ログ出力設計       | -          |
| FR-03  | 失敗ハンドラ一覧を戻り値で返却          | `IpcHandlerRegistrationResult` 型  | -          |
| FR-04  | `unregisterAllIpcHandlers` の安全な動作 | 変更不要の確認                     | -          |
| NFR-01 | 実行時間の増加が10%以内                 | try-catch オーバーヘッドは無視可能 | -          |
| NFR-02 | ログに内部情報を含めない                | `error.message` のみ使用           | -          |
| NFR-03 | エラーカテゴリ 4000-4999                | `errorCode: 4001`                  | -          |

### ステップ2: 設計レビューチェックリスト

| チェック項目                                                                       | 判定 |
| ---------------------------------------------------------------------------------- | ---- |
| `safeRegister` の try-catch が全ての例外型（Error, string, unknown）を捕捉するか   | -    |
| サービス初期化とハンドラ登録が同一 try-catch で囲まれているか（依存チェーン）      | -    |
| `IpcHandlerRegistrationResult` 型が呼び出し元で利用可能か                          | -    |
| `unregisterAllIpcHandlers` が未登録チャンネルで安全に動作するか（既存確認済み）    | -    |
| 戻り値の型追加が既存の呼び出し元に後方互換であるか（戻り値未使用のまま動作するか） | -    |
| P5（リスナー二重登録）のガードが維持されるか                                       | -    |
| `themeWatcherUnsubscribe` の管理が `safeRegister` で壊れないか                     | -    |

### ステップ3: レビューゲート判定

| 判定              | 対応                  |
| ----------------- | --------------------- |
| PASS              | Phase 4 へ進む        |
| MINOR             | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | Phase 1 へ戻る        |
| MAJOR（設計問題） | Phase 2 へ戻る        |

## 統合テスト連携

- 設計レビューで統合ポイント（Main Process 起動シーケンスとの整合性）を検証する
- `registerAllIpcHandlers` の戻り値追加が既存呼び出し元に後方互換であることを確認する

## 成果物

| 成果物           | パス                                     | 説明               |
| ---------------- | ---------------------------------------- | ------------------ |
| レビュー結果     | `outputs/phase-3/design-review.md`       | レビュー判定と指摘 |
| トレーサビリティ | `outputs/phase-3/traceability-matrix.md` | 要件-設計の対応表  |

## 完了条件

- [ ] 全FR/NFRが設計でカバーされている（トレーサビリティマトリクス完成）
- [ ] 設計レビューチェックリストの全項目が判定済み
- [ ] P5（二重登録）、P44（インターフェース不整合）との整合性が確認されている
- [ ] レビューゲート判定が PASS または MINOR（対応済み）
- [ ] 戻り値型変更の既存コードへの影響が評価されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 4: テスト作成
