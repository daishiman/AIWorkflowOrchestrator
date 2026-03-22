# Phase 2: 設計

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| Phase    | 2                               |
| タスクID | TASK-SC-08-E2E-TERMINAL-HANDOFF |
| 作成日   | 2026-03-22                      |

## 目的

E2Eテストインフラの詳細設計を行う。LLMモック・IPC統合テスト構成・TerminalHandoff検証フロー・パフォーマンス計測方法を設計する。P60（IPC テスト応答形式不一致）を防ぐため、IPC レスポンス形式を設計段階で明確に定義する。

## 実行タスク

1. **テストインフラ設計**
   - LLMモックサーバーの設計（MSW または Vitest の `vi.mock` を使用）
   - IPC統合テスト構成（Main Process のモック化方針）
   - テストヘルパーの設計（シナリオ実行関数 / アサーションヘルパー）
   - テスト実行コマンド（P40対策: `cd apps/desktop && pnpm vitest run`）

2. **TerminalHandoff 検証フロー設計**
   - `skill-creator:execute` レスポンスの `terminalHandoff` フィールド検証方法
   - `suggestedCommand` の文字列形式の検証方法（空文字列でないこと / CLI実行可能な形式であること）
   - TerminalHandoff が返却された場合のUI動作（コマンドのコピーボタン表示等）の検証

3. **IPC レスポンス形式の明示定義**（P60対策）
   - `skill-creator:plan` の成功レスポンス: `{ success: true, data: { steps: string[], estimatedTime: number } }`
   - `skill-creator:plan` のエラーレスポンス: `{ success: false, error: { code: string, message: string } }`
   - `skill-creator:execute` の成功レスポンス: `{ success: true, data: { skillPath: string, terminalHandoff?: { suggestedCommand: string } } }`
   - `skill-creator:execute` のエラーレスポンス: `{ success: false, error: { code: string, message: string } }`

4. **パフォーマンス計測方法設計**
   - `performance.now()` を使ったタイム計測
   - plan: 開始〜`{ success: true }` 受信まで 30,000ms 以内
   - execute: 開始〜`{ success: true }` 受信まで 120,000ms 以内
   - Vitest のタイムアウト設定（`{ timeout: 150000 }`）

5. **後方互換テスト設計**
   - 既存 `skill:create` チャンネルが依然として動作することを確認するテスト
   - 新旧チャンネルが共存できることを確認するテスト

## 参照資料

- Phase 1 要件定義書: `phase-01-requirements.md`
- `.claude/rules/06-known-pitfalls.md` (P40, P60)
- `apps/desktop/src/preload/skill-creator-api.ts`
- 既存のIPC統合テストパターン

## 成果物

- テストインフラ設計書（LLMモック / IPC構成）
- IPC レスポンス形式定義表（P60対策）
- パフォーマンス計測設計
- テストファイル構成図

## 完了条件

- [ ] LLMモックサーバーの構成が設計されている
- [ ] IPC 統合テストの構成が設計されている
- [ ] TerminalHandoff 検証フローが設計されている
- [ ] IPC レスポンス形式が明示的に定義されている（P60対策）
- [ ] パフォーマンス計測方法（plan 30秒 / execute 120秒）が設計されている
- [ ] 後方互換テストの設計が完了している

## 次のPhase

Phase 3: 設計レビュー
