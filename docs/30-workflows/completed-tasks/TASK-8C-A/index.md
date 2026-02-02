# TASK-8C-A: IPC統合テスト

## メタ情報

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| タスクID | TASK-8C-A                                              |
| タスク名 | IPC統合テスト                                          |
| Tier     | 1（MVP）                                               |
| Phase    | 8（テスト）                                            |
| 優先度   | high                                                   |
| 複雑度   | medium                                                 |
| 依存元   | TASK-4-1（IPCチャネル定義）, TASK-4-2（IPCハンドラー） |
| 並行可能 | TASK-8C-B, TASK-8C-C                                   |
| ブロック | なし                                                   |
| 作成日   | 2026-02-01                                             |

## 概要

スキルインポート機能のIPC通信に関する統合テストを実装する。Renderer Process から Main Process への IPC 通信パスを検証し、`registerSkillHandlers` が登録する全チャネル（`skill:list-available`, `skill:list-imported`, `skill:import`, `skill:remove`, `skill:get-detail`, `skill:execute`, `skill:abort`, `skill:get-status`）と権限関連チャネルの統合動作を確認する。

基本12テストケース（TASK-8C-A オリジナル）に加え、IMP-002 で追加された設定管理・権限管理・キャッシュ機能の10テストケース（計22ケース）を実装する。

## 現行コードベースとの対応

### チャネルマッピング（仕様書 → 実コード）

| 仕様書チャネル名          | 実コードチャネル名        | ハンドラー                   |
| ------------------------- | ------------------------- | ---------------------------- |
| skill:list                | skill:list-available      | registerSkillHandlers        |
| skill:getImported         | skill:list-imported       | registerSkillHandlers        |
| skill:import              | skill:import              | registerSkillHandlers        |
| skill:remove              | skill:remove              | registerSkillHandlers        |
| skill:execute             | skill:execute             | registerSkillHandlers        |
| skill:abort               | skill:abort               | registerSkillHandlers        |
| skill:respondToPermission | skill:permission:response | permissionResponseHandler    |
| skill:rescan              | skill:list-available      | （rescan は scanAll 再実行） |
| ─                         | skill:get-detail          | registerSkillHandlers        |
| ─                         | skill:get-status          | registerSkillHandlers        |

### アーキテクチャ差異

| 項目               | 仕様書（TASK-8C-A 元定義）                        | 実コード                                     |
| ------------------ | ------------------------------------------------- | -------------------------------------------- |
| ハンドラー登録関数 | `setupSkillIpcHandlers(scanner, store, executor)` | `registerSkillHandlers(mainWindow, service)` |
| 依存注入パターン   | 個別オブジェクト（scanner, store, executor）      | SkillService ファサード                      |
| セキュリティ       | なし                                              | `validateIpcSender()` 必須                   |
| 戻り値パターン     | 直接値                                            | `OperationResult<T>` パターン                |
| チャネル定義       | ハードコード                                      | `channels.ts` ホワイトリスト                 |

## Phase構成

| Phase | 名称                 | ステータス | 仕様書                     |
| ----- | -------------------- | ---------- | -------------------------- |
| 1     | 要件定義             | 未実施     | phase-01-requirements.md   |
| 2     | 設計                 | 未実施     | phase-02-design.md         |
| 3     | 設計レビューゲート   | 未実施     | phase-03-design-review.md  |
| 4     | テスト作成           | 未実施     | phase-04-tests.md          |
| 5     | 実装                 | 未実施     | phase-05-implementation.md |
| 6     | テスト拡充           | 未実施     | phase-06-test-expansion.md |
| 7     | テストカバレッジ確認 | 未実施     | phase-07-coverage.md       |
| 8     | リファクタリング     | 未実施     | phase-08-refactoring.md    |
| 9     | 品質保証             | 未実施     | phase-09-quality.md        |
| 10    | 最終レビューゲート   | 未実施     | phase-10-final-review.md   |
| 11    | 手動テスト検証       | 未実施     | phase-11-manual-test.md    |
| 12    | ドキュメント更新     | 未実施     | phase-12-documentation.md  |
| 13    | PR作成               | 未実施     | phase-13-pr-creation.md    |

## 成果物概要

### コード成果物

| 種別       | パス                                                               |
| ---------- | ------------------------------------------------------------------ |
| 統合テスト | `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts` |

### ドキュメント成果物

| 種別                 | パス                                          |
| -------------------- | --------------------------------------------- |
| 要件定義書           | `outputs/phase-01/requirements-definition.md` |
| 受け入れ基準         | `outputs/phase-01/acceptance-criteria.md`     |
| 設計書               | `outputs/phase-02/integration-test-design.md` |
| 設計レビュー結果     | `outputs/phase-03/design-review-result.md`    |
| テスト仕様書         | `outputs/phase-04/test-specification.md`      |
| 実装サマリー         | `outputs/phase-05/implementation-summary.md`  |
| カバレッジレポート   | `outputs/phase-07/coverage-report.md`         |
| リファクタリングログ | `outputs/phase-08/refactoring-log.md`         |
| 品質レポート         | `outputs/phase-09/quality-report.md`          |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新記録 | `outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  |
| PR情報               | `outputs/phase-13/pr-info.md`                 |

## 依存関係

```
TASK-4-1 (IPCチャネル定義) ──完了→┐
                                   ├→ TASK-8C-A (本タスク: IPC統合テスト)
TASK-4-2 (IPCハンドラー)   ──完了→┘     ├→ skillIpc.integration.test.ts
                                         ├→ 22テストケース実装
                                         └→ IPC通信パス完全検証

並行実行タスク:
  TASK-8C-B (並行)
  TASK-8C-C (並行)
```

## テストケース一覧

### 基本テストケース（12件）

| #   | チャネル                  | テストケース                     |
| --- | ------------------------- | -------------------------------- |
| 1   | skill:list-available      | スキル一覧取得成功               |
| 2   | skill:list-available      | スキャンエラー処理               |
| 3   | skill:list-imported       | インポート済みスキル取得成功     |
| 4   | skill:import              | スキルインポート成功             |
| 5   | skill:import              | 既存スキルインポートエラー       |
| 6   | skill:import              | 存在しないスキルインポートエラー |
| 7   | skill:remove              | スキル削除成功                   |
| 8   | skill:remove              | 未インポートスキル削除エラー     |
| 9   | skill:execute             | 実行開始・実行ID返却             |
| 10  | skill:abort               | 実行中止                         |
| 11  | skill:permission:response | 権限応答転送                     |
| 12  | skill:list-available      | 再スキャン（scanAll再実行）      |

### IMP-002 追加テストケース（10件）

| #   | チャネル                 | テストケース               |
| --- | ------------------------ | -------------------------- |
| 13  | skill:settings:get       | 設定取得成功               |
| 14  | skill:settings:get       | 存在しないスキル設定エラー |
| 15  | skill:settings:update    | 設定更新成功               |
| 16  | skill:settings:update    | バリデーションエラー       |
| 17  | skill:permissions:get    | 権限取得成功               |
| 18  | skill:permissions:grant  | 権限付与成功               |
| 19  | skill:permissions:revoke | 権限取消成功               |
| 20  | skill:cache:get          | キャッシュ取得成功         |
| 21  | skill:cache:set          | キャッシュ設定成功         |
| 22  | skill:cache:invalidate   | キャッシュ無効化成功       |
