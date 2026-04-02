# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 1                                                 |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## 目的

`getTerminalLog()` / `getCopyCommand()` の IPC 配線は完了済みだが、
Main 側 callback が `[]` / `null` を返す placeholder のまま（`ipc/index.ts:920-929`）である。
本 Phase では実装スコープ・受入条件・依存関係を確定する。

## タスク分類

- タスク種別: implementation task（コード修正あり）
- UI task: No（Renderer 側の変更なし、IPC 接続のみ）
- docs-only: No

## 真の論点と 4 条件の初期評価

**真の論点:**
IPC 配線は完了しているが、`ClaudeCliManager` のインスタンスが `claude-cli/ipc-handler.ts`
のモジュールスコープに閉じており、`ipc/index.ts` から参照できないため placeholder のまま。
インスタンス共有の設計が決まっていないことが根本原因。

**4 条件の初期評価:**

| 条件         | 初期評価      | 補足                                            |
| ------------ | ------------- | ----------------------------------------------- |
| 矛盾なし     | PASS          | 既存 IPC チャンネル設計と矛盾しない             |
| 漏れなし     | FAIL          | SESSION_NOT_FOUND エラー契約が未定義            |
| 整合性あり   | 条件付き PASS | sanitizeForApiKeys は実装済みだが適用経路が未完 |
| 依存関係整合 | FAIL          | ClaudeCliManager インスタンスの露出手段が未設計 |

## 現在の実装状態（調査結果）

| ファイル                              | 状態             | 備考                                                                 |
| ------------------------------------- | ---------------- | -------------------------------------------------------------------- |
| `main/ipc/advancedConsoleHandlers.ts` | 実装済み         | `sanitizeForApiKeys` + P42 バリデーション + handler 登録             |
| `main/ipc/index.ts:920-929`           | **placeholder**  | `getTerminalLog: async () => []`, `getCopyCommand: async () => null` |
| `main/claude-cli/SessionManager.ts`   | 実装済み         | `getSession(id)` → `Session \| undefined`、`output: string[]` 保持   |
| `main/claude-cli/ClaudeCliManager.ts` | 実装済み         | `getSession(request)` → `ClaudeCliResult<SessionDetail>`             |
| `main/claude-cli/ipc-handler.ts`      | 実装済みだが閉鎖 | `manager` がモジュールスコープ変数、外部から参照不可                 |

## 機能要件 (FR)

| ID   | 要件                                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1 | `getTerminalLog(sessionId)` は `SessionManager.getSession(sessionId).output` を返す                                                       |
| FR-2 | `getCopyCommand(sessionId)` はセッションの実起動形式（`node` + `scriptPath` + `args`）を再現するコマンド文字列を返す                      |
| FR-3 | セッション未存在時は callback 内で `SESSION_NOT_FOUND` を生成し、外向き IPC 応答は `TERMINAL_LOG_ERROR` / `COPY_COMMAND_ERROR` に変換する |
| FR-4 | 全レスポンスに `sanitizeForApiKeys()` を適用する（既存実装済み、エラー経路にも適用）                                                      |
| FR-5 | `ClaudeCliManager` インスタンスを `claude-cli/ipc-handler.ts` から取得できるエクスポートを追加する                                        |

## 非機能要件 (NFR)

| ID    | 要件                                                                                 |
| ----- | ------------------------------------------------------------------------------------ |
| NFR-1 | 型安全性: `any` 型禁止、`SESSION_NOT_FOUND` エラーコードは定数化                     |
| NFR-2 | セキュリティ: DENY-6 準拠（API キーの sanitize は全返却値に適用）                    |
| NFR-3 | 既存テスト（`advancedConsoleIpc.test.ts` の ADV-12〜ADV-15）が引き続き PASS すること |

## 受入条件 (AC)

| ID   | 条件                                                                                                 | 検証方法                           |
| ---- | ---------------------------------------------------------------------------------------------------- | ---------------------------------- |
| AC-1 | `sessionId` から実際のターミナルログ（`output` 配列）を取得できる                                    | 統合テスト                         |
| AC-2 | `getCopyCommand` が `node <scriptPath> ...args` 形式の再実行可能なコマンド文字列を返す               | 統合テスト                         |
| AC-3 | `sanitizeForApiKeys()` を通した値のみ返す                                                            | 単体テスト（ADV-13 相当）          |
| AC-4 | セッション未存在時に内部では `SESSION_NOT_FOUND` を用い、外向きには handler のエラーコードで応答する | 統合テスト                         |
| AC-5 | 既存 ADV-12〜ADV-15 テストが全 PASS                                                                  | `pnpm --filter @repo/desktop test` |

## スコープ定義

**含む:**

- `claude-cli/ipc-handler.ts` への `getClaudeCliManager()` エクスポート追加
- `ipc/index.ts` の placeholder callback を実実装（`ClaudeCliManager` 呼び出し）に差し替え
- `SESSION_NOT_FOUND` エラーコード定数の定義と handler error code への変換
- 統合テストの追加（`advancedConsoleIpc.test.ts` または新規ファイル）

**含まない:**

- `advancedConsoleHandlers.ts` のロジック変更（sanitize・バリデーションは変更しない）
- Renderer 側 hook の変更（`useAdvancedConsole.ts` と関連 hook）
- `IPC_CHANNELS` 定数の追加（既存チャンネルのみ使用）
- `getCopyCommand` のフォーマット以外の新機能

## 依存関係

```
ipc/index.ts
  └─ claude-cli/ipc-handler.ts (getClaudeCliManager() を新規エクスポート)
       └─ ClaudeCliManager
            └─ SessionManager.getSession(sessionId)
                 └─ Session.output: string[]
                    Session.scriptPath: string
                    Session.args: string[]
```

## 参照資料

| 参照資料                                    | パス                                                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| unassigned タスク仕様書                     | `docs/30-workflows/completed-tasks/unassigned-task/UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001.md` |
| AdvancedConsole IPC ハンドラ                | `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts`                                                   |
| IPC 登録エントリポイント (placeholder 箇所) | `apps/desktop/src/main/ipc/index.ts:920-929`                                                             |
| SessionManager                              | `apps/desktop/src/main/claude-cli/SessionManager.ts`                                                     |
| ClaudeCliManager                            | `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`                                                   |
| Claude CLI IPC ハンドラ                     | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                                                        |

## 完了条件チェックリスト

- [ ] 既存ファイルの実装状態を全て調査・記録した
- [ ] FR-1 〜 FR-5 の機能要件が定義されている
- [ ] AC-1 〜 AC-5 の受入条件が検証可能な形で定義されている
- [ ] スコープ（含む/含まない）が明確に定義されている
- [ ] `outputs/phase-1/requirements.md` に成果物が出力されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 実行タスク

- 本 Phase の責務を 1 つに絞って完了条件まで整理する。
- 依存する Phase 2 以降の設計・実装へ引き渡す前提を固定する。

## 参照資料

- `docs/30-workflows/completed-tasks/UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001/index.md`
- `docs/30-workflows/completed-tasks/unassigned-task/UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001.md`
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/claude-cli/ipc-handler.ts`
- `apps/desktop/src/main/claude-cli/SessionManager.ts`

## 成果物/実行手順

- `outputs/phase-1/requirements.md`
- `phase-2-design.md` へ FR / AC / dependency を引き渡す。
- `artifacts.json` と `outputs/artifacts.json` を同一内容に保つ。

## 統合テスト連携

- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`
- `apps/desktop/src/main/ipc/__tests__/index.integration.test.ts`
