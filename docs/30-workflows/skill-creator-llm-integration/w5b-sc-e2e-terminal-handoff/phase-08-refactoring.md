# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| Phase    | 8                               |
| タスクID | TASK-SC-08-E2E-TERMINAL-HANDOFF |
| 作成日   | 2026-03-22                      |

## 目的

E2Eテストコードの品質を向上させ、テストヘルパーを共通化する。重複コードを排除し、テストの可読性と保守性を高める。

## 実行タスク

1. **テストヘルパーの共通化**
   - シナリオA〜Eで共通するセットアップ処理をヘルパー関数に抽出する
   - `beforeEach` / `afterEach` のセットアップをヘルパーに移動する
   - LLMモックのファクトリ関数（`createSuccessMock()` / `createErrorMock()` / `createTerminalHandoffMock()`）を整理する

2. **アサーションヘルパーの整理**
   - `assertIpcSuccess(result)`: 成功レスポンスの検証ヘルパー
   - `assertIpcError(result, expectedCode)`: エラーレスポンスの検証ヘルパー
   - `assertTerminalHandoff(result)`: TerminalHandoff の検証ヘルパー
   - `assertPerformance(startTime, limitMs)`: パフォーマンス基準の検証ヘルパー

3. **テストの重複排除**
   - 類似したアサーションを共通化する
   - テストデータ（フィクスチャ）を定数として抽出する
   - `describe` / `it` のネスト構造を整理する

4. **型安全性の強化**
   - テストヘルパーの引数・戻り値の型を明確に定義する
   - `any` 型を排除する
   - `unknown` 型での受け取りと実行時検証パターンを採用する（P48・P52対策）

5. **リファクタリング後の動作確認**
   - 全テストが引き続き PASS であることを確認する
   - `pnpm typecheck` が通過することを確認する

## 参照資料

- Phase 5 実装ファイル
- `.claude/rules/02-code-quality.md`
- `.claude/rules/06-known-pitfalls.md` (P48, P52)

## 成果物

- リファクタリング済みのテストヘルパーファイル
- 整理されたテストファイル

## 完了条件

- [ ] テストヘルパーがシナリオ間で共通化されている
- [ ] アサーションヘルパー（4種）が実装されている
- [ ] テストの重複コードが排除されている
- [ ] `any` 型が排除されている
- [ ] リファクタリング後も全テストが PASS している
- [ ] `pnpm typecheck` が通過している

## 次のPhase

Phase 9: 品質検証
