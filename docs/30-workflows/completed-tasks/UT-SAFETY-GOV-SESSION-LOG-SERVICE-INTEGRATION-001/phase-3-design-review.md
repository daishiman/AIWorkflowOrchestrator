# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 3                                                 |
| 機能名   | Advanced Console 実セッションログ接続             |
| タスクID | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| 作成日   | 2026-04-02                                        |

## レビュー結果サマリ

| 観点                   | 判定     | 備考                                                                                      |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------- |
| 既存テストへの影響     | PASS     | ADV-12〜ADV-15 は deps をモックするため影響なし                                           |
| セキュリティ（DENY-6） | PASS     | sanitizeForApiKeys は advancedConsoleHandlers.ts が適用済み                               |
| 型安全性               | PASS     | `ClaudeCliManager \| null` を明示、null チェック必須                                      |
| エラー契約             | PASS     | SESSION_NOT_FOUND が throw → 既存 catch で TERMINAL_LOG_ERROR / COPY_COMMAND_ERROR に変換 |
| 循環依存リスク         | 低リスク | `ipc/index.ts` → `claude-cli/ipc-handler.ts` の一方向参照のみ                             |
| 変更範囲の最小性       | PASS     | handler ロジック無変更、index.ts + ipc-handler.ts の 2 ファイルのみ                       |

## 懸念点と対応

### 懸念 1: `getClaudeCliManager()` が `null` を返す場合の挙動

`registerClaudeCliHandlers` が `registerAllIpcHandlers` より先に呼ばれることは
`ipc/index.ts` の構造上保証されている（989〜995 行で Claude CLI ハンドラを登録後、
再登録はしない）。ただし、テスト環境では `manager` が null のまま呼ばれる可能性がある。

**対応**: `mgr === null` の場合に `[]` / `null` を返す（現 placeholder 相当の挙動）として
後退的な graceful fallback を維持する。テスト環境で安全に動作する。

### 懸念 2: `ClaudeCliResult<SessionDetail>` の型確認

`ClaudeCliManager.getSession()` が返す `SessionDetail` に `scriptPath`・`args` が含まれるか確認が必要。
`SessionManager.Session` インターフェースには `scriptPath: string`, `args: string[]` が定義済み。
`SessionDetail` が `Session` の公開型であることを Phase 5 実装前に確認する。

**対応**: Phase 4 のテスト作成時に型アサーションで検証する。

### 懸念 3: `getCopyCommand` のエスケープ処理

`["node", scriptPath, ...args].join(" ")` はシェル引用符なしのシンプルな結合であり、
スペースを含むパスや引数で誤動作する可能性がある。

**対応**: 本タスクのスコープでは シンプルな実装のみとし、将来タスクで拡張できるようにする（TODO コメントを付与）。

## Phase 2 設計の承認

Phase 2 の設計（`getClaudeCliManager()` ゲッター追加 + `ipc/index.ts` callback 差し替え）を
承認する。Phase 4 のテスト作成に進む。

## 完了条件チェックリスト

- [ ] 設計の懸念点を全て洗い出した
- [ ] 各懸念点の対応方針を定めた
- [ ] Phase 2 設計が承認されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 目的

Phase 2 の設計が、型・エラー契約・依存関係の観点で破綻していないかを確認する。

## 実行タスク

- null fallback の安全性を確認する。
- `ClaudeCliResult<SessionDetail>` の型境界を確認する。
- `getCopyCommand` の連結形式を確認する。

## 参照資料

- `phase-2-design.md`
- `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts`
- `apps/desktop/src/main/claude-cli/ipc-handler.ts`
- `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`

## 成果物/実行手順

- レビュー結果を Phase 4 の test plan へ引き渡す。
- `artifacts.json` と `outputs/artifacts.json` を同一内容に保つ。

## 統合テスト連携

- `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`
- `apps/desktop/src/main/claude-cli/__tests__/ipc-handler.test.ts`
