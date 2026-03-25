# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 1                                  |
| 機能名   | permission-store-sender-validation |
| タスクID | UT-06-002-UT-1                     |
| Issue    | #1527                              |
| 作成日   | 2026-03-24                         |

## 目的

`permission-store-handlers.ts` の全4つの IPC ハンドラに `validateIpcSender` を適用し、任意の BrowserWindow からの不正リクエストを拒否するセキュリティ改善を行う。

## P50チェック: 既実装状態の調査【必須】

| チェック項目                               | 結果   | 備考                                                    |
| ------------------------------------------ | ------ | ------------------------------------------------------- |
| 対象ファイルに sender 検証が既に存在するか | 未実装 | 全4ハンドラで event 引数未使用                          |
| `validateIpcSender` の import があるか     | なし   | import 文に含まれていない                               |
| 呼び出し元で mainWindow が渡されているか   | なし   | `registerPermissionStoreHandlers(permissionStore)` のみ |

**結論**: sender 検証は未実装。新規実装として Phase 4-5 を実行する。

## 背景

### 現状の問題

現在の `registerPermissionStoreHandlers` は `IPermissionStore` のみを引数に取り、`mainWindow` を受け取っていない。全4ハンドラで `event` 引数を無視（`_event` または省略）しており、sender 検証が一切行われていない。

他の IPC ハンドラファイル（`skillHandlers.ts`, `agentHandlers.ts`, `chatEditHandlers.ts` 等）では既に `validateIpcSender` による sender 検証が標準化されている。

### 対象ハンドラ一覧

| #   | チャンネル名                 | 現状の event 使用      |
| --- | ---------------------------- | ---------------------- |
| 1   | `permission:getAllowedTools` | event 引数なし（省略） |
| 2   | `permission:revokeTool`      | `_event`（未使用）     |
| 3   | `permission:clearAll`        | event 引数なし（省略） |
| 4   | `permission:clear-session`   | `_event`（未使用）     |

## スコープ

### 含む

- `registerPermissionStoreHandlers` の関数シグネチャ変更（`mainWindow: BrowserWindow` パラメータ追加）
- 全4ハンドラへの `withValidation` ラッパー適用（内部で `validateIpcSender` を呼び出す）
- `withValidation` のインポート追加
- 既存テストの修正（モック mainWindow の追加、sender 検証テストの追加）
- 呼び出し元の `registerPermissionStoreHandlers` 呼び出し箇所の引数修正

### 含まない

- `validateIpcSender` 自体の実装変更
- `IPermissionStore` インターフェースの変更
- Preload 層の変更
- 新規 IPC チャンネルの追加

## 受け入れ基準

### 機能要件

- [ ] AC-1: 全4ハンドラの先頭で `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` が呼ばれること
- [ ] AC-2: `validateIpcSender` が `valid: false` を返した場合、`withValidation` がエラー応答を `return` すること（`throw` ではない）
- [ ] AC-3: `registerPermissionStoreHandlers` が `mainWindow: BrowserWindow` を第1引数で受け取ること（P34: DI パターン準拠）
- [ ] AC-4: 呼び出し元で `mainWindow` が正しく渡されること

### 非機能要件

- [ ] AC-5: 既存テストが全て PASS すること（sender 検証のモック追加後）
- [ ] AC-6: 不正 sender からの呼び出しが拒否されるテストが追加されていること
- [ ] AC-7: TypeScript 型チェックが PASS すること
- [ ] AC-8: ESLint エラーがないこと

## 参照資料

| 資料名                 | パス                                                                              | 説明                                           |
| ---------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| 対象ファイル           | `apps/desktop/src/main/ipc/permission-store-handlers.ts`                          | 修正対象の IPC ハンドラ                        |
| テストファイル         | `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts`           | 修正対象のテスト                               |
| validateIpcSender 実装 | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`                  | sender 検証ユーティリティ                      |
| IPC セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | セキュリティ正本仕様                           |
| P34: DI パターン       | `.claude/rules/06-known-pitfalls.md#P34`                                          | 遅延初期化 DI パターン                         |
| P41: v8 カバレッジ     | `.claude/rules/06-known-pitfalls.md#P41`                                          | getAllowedWindows コールバックのカバレッジ対策 |

## インベントリ

### 修正対象ファイル

| ファイル                            | 変更内容                                       | 行数見積 |
| ----------------------------------- | ---------------------------------------------- | -------- |
| `permission-store-handlers.ts`      | シグネチャ変更 + 各ハンドラに sender 検証追加  | +20行    |
| `permission-store-handlers.test.ts` | モック mainWindow 追加 + sender 検証テスト追加 | +60行    |

### 呼び出し元の修正

`registerPermissionStoreHandlers` の呼び出し箇所を `grep` で特定し、`mainWindow` 引数を追加する必要がある。

## 実行タスク

- Task 1-1: 対象ハンドラの特定と現状分析
- Task 1-2: 受け入れ基準（AC）の定義
- Task 1-3: スコープの明確化
- Task 1-4: 参照資料の特定とインベントリ作成

## 実行手順

### ステップ1: 対象ハンドラの特定

`grep -rn "ipcMain.handle" apps/desktop/src/main/ipc/permission-store-handlers.ts` で全ハンドラを列挙し、event 引数の使用状況を確認する。

### ステップ2: 受け入れ基準の定義

セキュリティ要件（04-electron-security.md の「全ハンドラで送信元ウィンドウを検証」）に基づき、測定可能な AC を定義する。

### ステップ3: スコープの明確化

変更範囲を最小限に限定し、validateIpcSender 自体の変更や Preload 層の変更を除外する。

### ステップ4: インベントリ作成

修正対象ファイルと行数見積を記録する。

## 統合テスト連携

- 既存の permission-store-handlers テストスイートが全 PASS すること
- sender 検証の正常系・異常系テストが追加されること

## 多角的チェック観点

- **セキュリティ**: validateIpcSender の3段検証（BrowserWindow 取得 → DevTools 検出 → ホワイトリスト確認）が全ハンドラに適用されること
- **DI パターン**: P34 準拠の Constructor Injection（mainWindow はアプリ起動時に利用可能）
- **後方互換性**: 関数シグネチャ変更により呼び出し元の修正が必要（破壊的変更だが内部 API のため許容）

## 成果物

| 成果物     | パス                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| 要件定義書 | `docs/30-workflows/permission-store-sender-validation/phase-1-requirements.md` |

## 完了条件

- [x] 対象ハンドラ4つの特定完了
- [x] 受け入れ基準（AC-1 ~ AC-8）の定義完了
- [x] スコープの明確化完了
- [x] 参照資料の特定完了
- [x] インベントリの作成完了

## 次のPhase

Phase 2: 設計 — アーキテクチャ・インターフェース設計

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクが完了している
- [ ] 完了条件の全項目がチェック済み
- [ ] 成果物が全て生成されている

## サブタスク管理

本Phaseのサブタスク:

- なし（単一タスクとして実行）
