# Phase 1: 要件定義レポート

## メタ情報

| 項目       | 値                                                        |
| ---------- | --------------------------------------------------------- |
| タスクID   | UT-06-003                                                 |
| 機能名     | safety-gate-implementation                                |
| Phase      | 1                                                         |
| 作成日     | 2026-03-16                                                |
| 依存タスク | UT-06-001 (TOOL_RISK_CONFIG), UT-06-002 (PermissionStore) |

## 1. 機能概要

SafetyGatePort インターフェースの具象実装クラス `DefaultSafetyGate` を作成する。スキル公開前に5種類の安全性チェック（critical ツール検出、high ツール検出、恒久許可未付与、低リスクツール確認、保護パスアクセス）を実行し、総合グレード（SAFE / SAFE_WITH_WARNINGS / UNSAFE）を返却する。

IPC チャンネル `skill:evaluate-safety` を通じて Renderer プロセスから呼び出し可能にする。

## 2. スコープ

### 新規作成ファイル（4ファイル）

| #   | ファイルパス                                                     | 責務                                   |
| --- | ---------------------------------------------------------------- | -------------------------------------- |
| 1   | `apps/desktop/src/main/permissions/default-safety-gate.ts`       | DefaultSafetyGate 具象実装             |
| 2   | `apps/desktop/src/main/permissions/default-safety-gate.test.ts`  | DefaultSafetyGate テスト               |
| 3   | `apps/desktop/src/main/ipc/safetyGateHandlers.ts`                | IPC ハンドラ（命名は既存パターン準拠） |
| 4   | `apps/desktop/src/main/ipc/__tests__/safetyGateHandlers.test.ts` | IPC ハンドラテスト                     |

### 修正ファイル（2ファイル）

| #   | ファイルパス                           | 変更内容                                                    |
| --- | -------------------------------------- | ----------------------------------------------------------- |
| 1   | `apps/desktop/src/preload/channels.ts` | `SKILL_EVALUATE_SAFETY` チャンネル追加 + ホワイトリスト登録 |
| 2   | `apps/desktop/src/main/ipc/index.ts`   | `registerSafetyGateHandlers` 呼び出し追加                   |

### 型定義ファイル（前提：UT-06-001 で作成済み）

| ファイルパス                                    | 提供する型                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `packages/shared/src/types/safety-gate.ts`      | SafetyGatePort, SafetyGateResult, SafetyCheckDetail, SafetyGrade, SafetyCheckId |
| `packages/shared/src/constants/security.ts`     | ToolRiskLevel, ToolRiskConfig, TOOL_RISK_CONFIG                                 |
| `packages/shared/src/types/permission-store.ts` | IPermissionStore                                                                |

> **注意**: `packages/shared/src/types/safety-gate.ts` がまだ配置されていない場合、Phase 5 の Step 0 で配置する。

## 3. 仕様書とコードベースの差分（重要）

Phase 2 以降の設計で反映すべき、仕様書の前提とコードベース実態の差分を記録する。

| #   | 仕様書の前提                                        | 実態                                                           | 対応方針                                                                |
| --- | --------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| D-1 | IPC ハンドラは `ipc/handlers/safety-gate.ts`        | 既存ハンドラはフラット構造 `ipc/*.ts`（40ファイル以上）        | `ipc/safetyGateHandlers.ts` に配置（命名規則: camelCase + Handlers.ts） |
| D-2 | `validateIpcSender(event)` ユーティリティ使用       | 存在しない。`event.sender !== mainWindow.webContents` パターン | 既存パターンに合わせて直接比較                                          |
| D-3 | `isToolAllowed(toolName, skillName)` 2引数          | `IPermissionStore.isToolAllowed(toolName)` 1引数               | 1引数で呼び出す。skillName は evaluate() のコンテキストで管理           |
| D-4 | `apps/desktop/src/main/permissions/` ディレクトリ   | 存在しない                                                     | 新規作成（SafetyGate は既存 permission 層とは異なるドメイン）           |
| D-5 | テストファイルは `ipc/handlers/safety-gate.test.ts` | 既存テストは `ipc/__tests__/*.test.ts`                         | `ipc/__tests__/safetyGateHandlers.test.ts` に配置                       |

## 4. 依存関係

### 上流依存（本タスクが前提とするもの）

| 依存先              | 提供物                          | ステータス                                                 |
| ------------------- | ------------------------------- | ---------------------------------------------------------- |
| UT-06-001           | TOOL_RISK_CONFIG, ToolRiskLevel | `packages/shared/src/constants/security.ts` に定義済み     |
| UT-06-002           | IPermissionStore                | `packages/shared/src/types/permission-store.ts` に定義済み |
| step-05-par-task-06 | SafetyGatePort 契約定義         | outputs に定義済み、`packages/shared/` への配置が必要      |

### 下流依存（本タスクの成果物を使用するもの）

| 依存先                  | 使用する成果物                     |
| ----------------------- | ---------------------------------- |
| TASK-SKILL-LIFECYCLE-08 | DefaultSafetyGate + IPC チャンネル |

## 5. 制約条件

| #   | 制約                                              | 根拠                 |
| --- | ------------------------------------------------- | -------------------- |
| C-1 | SafetyGatePort インターフェースは凍結（変更不可） | UT-06-001 で確定済み |
| C-2 | TOOL_RISK_CONFIG は凍結                           | UT-06-001 で確定済み |
| C-3 | IPC チャンネル名は `IPC_CHANNELS` 定数で参照      | P27 準拠             |
| C-4 | IPC 引数は P42 準拠3段バリデーション              | P42 準拠             |
| C-5 | `any` 型の使用禁止                                | 02-code-quality.md   |
| C-6 | non-null assertion (`!`) 禁止                     | P48 準拠             |
| C-7 | 保護パスマッチングに正規表現を使用しない          | P55 準拠             |
| C-8 | テスト間で状態リークしない                        | P9 準拠              |

## 6. 非機能要件

| 項目                | 基準     |
| ------------------- | -------- |
| Line Coverage       | 80% 以上 |
| Branch Coverage     | 60% 以上 |
| Function Coverage   | 80% 以上 |
| ESLint エラー       | 0件      |
| TypeScript 型エラー | 0件      |
