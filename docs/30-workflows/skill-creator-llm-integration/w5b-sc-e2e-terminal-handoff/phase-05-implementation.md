# Phase 5: 実装

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| Phase    | 5                               |
| タスクID | TASK-SC-08-E2E-TERMINAL-HANDOFF |
| 作成日   | 2026-03-22                      |

## 目的

E2Eテストインフラを構築し、LLMモックサーバーをセットアップする。Phase 4 で作成したテストを全て PASS させる。

## 実行タスク

1. **テストインフラ構築**
   - LLMモックの実装（`vi.mock` または MSW を使用）
   - IPC 統合テスト用のセットアップファイル作成
   - テストヘルパー関数の実装
     - `createSkillCreatorMock()`: LLMモックの初期化
     - `invokeSkillCreatorPlan(args)`: plan IPC 呼び出しのラッパー
     - `invokeSkillCreatorExecute(args)`: execute IPC 呼び出しのラッパー
     - `assertTerminalHandoff(result)`: TerminalHandoff 検証アサーション

2. **LLMモックサーバーの設定**
   - シナリオA/B/D用: 正常なレスポンスを返すモック
   - シナリオC用: `LLM_ERROR` エラーを返すモック
   - シナリオB用: `terminalHandoff.suggestedCommand` を含むレスポンスを返すモック
   - `vi.fn()` でモックの呼び出し履歴を検証可能にする

3. **テスト実行の検証**
   - `cd apps/desktop && pnpm vitest run src/test/e2e/` でテスト実行（P40対策）
   - 全5シナリオが PASS することを確認する
   - タイムアウト設定が正しく機能することを確認する

4. **前提タスク（04/05/06）との統合確認**
   - タスク04（ファイル永続化）の実装がスキルファイルを正しく保存していること
   - タスク05（improve LLM）の実装がシナリオDで使用されること
   - タスク06（UI-Runtime接続）の実装がシナリオA〜Eで使用されること

5. **後方互換テスト実行**
   - 既存の `skill:create` チャンネルのテストが引き続き PASS すること

## 参照資料

- Phase 4 テストファイル
- Phase 2 設計書: `phase-02-design.md`
- `.claude/rules/06-known-pitfalls.md` (P40, P60)

## 成果物

- `apps/desktop/src/test/helpers/skill-creator-test-helpers.ts`（実装）
- テスト実行結果（全5シナリオ PASS の証跡）

## 完了条件

- [ ] LLMモックが3パターン（正常・エラー・TerminalHandoff）実装されている
- [ ] テストヘルパー関数が実装されている
- [ ] シナリオA〜E の全テストが PASS している
- [ ] 既存 `skill:create` の後方互換テストが PASS している
- [ ] `pnpm typecheck` が通過している

## 次のPhase

Phase 6: テスト拡充
