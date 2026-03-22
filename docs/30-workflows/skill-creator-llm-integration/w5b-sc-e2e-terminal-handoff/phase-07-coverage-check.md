# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| Phase    | 7                               |
| タスクID | TASK-SC-08-E2E-TERMINAL-HANDOFF |
| 作成日   | 2026-03-22                      |

## 目的

E2Eテストによる統合カバレッジを確認し、全フロー（シナリオA〜E）が網羅されていることを検証する。カバレッジ基準（Line 80% / Branch 60% / Function 80%）を確認する。

## 実行タスク

1. **E2Eテストによる統合カバレッジ計測**
   - コマンド: `cd apps/desktop && pnpm vitest run --coverage src/test/e2e/`（P40対策）
   - カバレッジレポートの対象: `skill-creator` 関連の Main プロセスハンドラ

2. **シナリオカバレッジの確認**
   - シナリオA: 正常フロー（plan + execute）のカバレッジ
   - シナリオB: TerminalHandoff 経路のカバレッジ
   - シナリオC: LLMエラーパスのカバレッジ
   - シナリオD: improve 機能のカバレッジ
   - シナリオE: 後方互換パス（`skill:create`）のカバレッジ

3. **カバレッジ基準の確認**
   - Line Coverage: 80%以上
   - Branch Coverage: 60%以上（エラーパスのカバレッジに注意）
   - Function Coverage: 80%以上（v8プロバイダのインライン関数に注意: P41）

4. **ゲート判定**
   - 全指標が基準値以上: Phase 8 へ
   - いずれかが未達: Phase 6 に戻り追加テストを作成する

## 参照資料

- Phase 6 テスト拡充結果
- `.claude/rules/02-code-quality.md` (カバレッジ基準)
- `.claude/rules/06-known-pitfalls.md` (P40, P41)

## 成果物

- カバレッジレポート（統合テスト）
- シナリオ別カバレッジサマリー

## 完了条件

- [ ] カバレッジ計測が対象パッケージのディレクトリから実行されている（P40対策）
- [ ] シナリオA〜E の全経路がカバーされていることが確認されている
- [ ] Line Coverage が 80% 以上である
- [ ] Branch Coverage が 60% 以上である
- [ ] Function Coverage が 80% 以上である（P41: インライン関数のカウント確認）
- [ ] ゲート判定が記録されている

## 次のPhase

Phase 8: リファクタリング（カバレッジ基準達成の場合）
