# Claude Agent SDK統合 - テスト仕様書

## 1. 概要

本ドキュメントでは、Claude Agent SDK統合機能のテスト設計を定義する。
TDD（テスト駆動開発）アプローチに基づき、実装前にテストを作成する（Red Phase）。

---

## 2. テスト対象コンポーネント

| コンポーネント     | 責務                                    | テストファイル                 |
| ------------------ | --------------------------------------- | ------------------------------ |
| HooksFactory       | SDK Hooksオブジェクトの生成             | `HooksFactory.test.ts`         |
| PermissionResolver | Permission応答のPromise管理             | `HooksFactory.test.ts`（内包） |
| AgentExecutor      | 単一実行の制御、SDK統合、ストリーミング | `AgentExecutor.test.ts`        |
| ExecutionManager   | 複数実行の管理、ライフサイクル管理      | `ExecutionManager.test.ts`     |
| agentHandlers      | IPC通信ハンドラー                       | `agentHandlers.test.ts`        |

---

## 3. テスト方針

### 3.1 テスト種別

| 種別       | 目的                         | カバレッジ目標     |
| ---------- | ---------------------------- | ------------------ |
| 単体テスト | 個別コンポーネントの動作検証 | 80%以上            |
| 統合テスト | コンポーネント間連携の検証   | 100%エンドポイント |

### 3.2 モック戦略

| 依存関係                          | モック方法         | 理由               |
| --------------------------------- | ------------------ | ------------------ |
| @anthropic-ai/claude-agent-sdk    | vi.mock            | 外部SDKの分離      |
| electron (ipcMain, BrowserWindow) | vi.mock            | Electron依存の分離 |
| AbortController                   | 実オブジェクト使用 | 標準APIのため      |

### 3.3 TDD原則

1. **Red**: すべてのテストが失敗状態で開始
2. **Green**: 最小限の実装でテストを通過
3. **Refactor**: コードの品質向上

---

## 4. テストカテゴリ

### 4.1 HooksFactory テスト

**目的**: SDK Hooksの生成と各Hook機能の検証

| テストケース                  | 検証内容                          |
| ----------------------------- | --------------------------------- |
| Hooks生成                     | 全必須Hooksが存在すること         |
| PreToolUse - 危険コマンド検出 | rm -rf, sudo, chmod 777のブロック |
| PreToolUse - 安全コマンド許可 | ls, catなどの許可                 |
| PostToolUse - IPC送信         | agent:statusチャネルへの送信      |
| PermissionRequest - 応答待機  | Promise経由での応答取得           |
| PermissionRequest - Abort処理 | AbortSignalによるキャンセル       |

### 4.2 AgentExecutor テスト

**目的**: SDK統合とストリーミング処理の検証

| テストケース         | 検証内容                        |
| -------------------- | ------------------------------- |
| SDK query()呼び出し  | 正しいオプションでのAPI呼び出し |
| ストリーミング処理   | メッセージのIPC転送             |
| 完了ステータス送信   | completedステータスの通知       |
| キャンセル処理       | cancelledステータスの通知       |
| エラーハンドリング   | errorステータスの通知           |
| Permission Rules適用 | カスタムルールの反映            |

### 4.3 ExecutionManager テスト

**目的**: 複数実行の管理とライフサイクル制御

| テストケース         | 検証内容                |
| -------------------- | ----------------------- |
| 実行開始とID返却     | executionIdの生成・返却 |
| ID自動生成           | 未指定時のUUID生成      |
| アクティブ実行の追跡 | 複数実行の並行管理      |
| 特定実行の停止       | 指定IDの実行キャンセル  |
| 存在しない実行の停止 | false返却               |
| 全実行の停止         | すべての実行キャンセル  |
| Permission解決       | 応答のルーティング      |

### 4.4 agentHandlers テスト

**目的**: IPCハンドラーの登録と実行検証

| テストケース                | 検証内容                 |
| --------------------------- | ------------------------ |
| agent:start                 | 実行開始処理の呼び出し   |
| agent:stop                  | 実行停止処理の呼び出し   |
| agent:stop-all              | 全実行停止処理の呼び出し |
| agent:get-active-executions | アクティブ実行一覧の取得 |
| agent:permission:res        | Permission応答の処理     |

---

## 5. カバレッジ目標

### 5.1 単体テスト

| メトリクス     | 最小値 | 推奨値 |
| -------------- | ------ | ------ |
| 行カバレッジ   | 80%    | 90%    |
| 分岐カバレッジ | 60%    | 70%    |
| 関数カバレッジ | 80%    | 90%    |

### 5.2 統合テスト

| メトリクス        | 目標値 |
| ----------------- | ------ |
| APIエンドポイント | 100%   |
| モジュール間IF    | 100%   |
| 正常シナリオ      | 100%   |
| エラーシナリオ    | 80%    |

---

## 6. テストファイル配置

```
apps/desktop/src/main/
├── services/agent/__tests__/
│   ├── HooksFactory.test.ts        # Hooks + PermissionResolver
│   ├── AgentExecutor.test.ts       # SDK統合
│   └── ExecutionManager.test.ts    # 複数実行管理
└── ipc/__tests__/
    └── agentHandlers.test.ts       # IPCハンドラー
```

---

作成日: 2026-01-12
Phase: 4
ステータス: 完了
