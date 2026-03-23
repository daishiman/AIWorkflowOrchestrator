# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 11                            |
| タスクID | UT-EXECUTION-ENV-TERMINAL-001 |
| 機能名   | execution-env-terminal        |
| 作成日   | 2026-03-23                    |

## 目的

自動テストでカバーできない UI/UX の視覚検証とエンドツーエンドシナリオの確認を行う。

## 実行タスク

### Task 1: ExecutionEnvironment terminal 表示の手動検証

> CLI 環境のため、テスト結果による間接的検証を実施（P53 対策）

| ID  | シナリオ                             | 検証方法                         | 期待結果                   |
| --- | ------------------------------------ | -------------------------------- | -------------------------- |
| M-1 | terminal 環境 + handoffGuidance あり | テスト T-8, T-11 の PASS を確認  | TerminalHandoffCard が表示 |
| M-2 | terminal 環境 + handoffGuidance なし | テスト T-9, T-10 の PASS を確認  | 待機中 Placeholder が表示  |
| M-3 | html 環境（回帰確認）                | テスト T-12, T-16 の PASS を確認 | 既存動作に変更なし         |

### Task 2: assertNoSilentFallback 動作の手動検証

| ID  | シナリオ                            | 検証方法                       | 期待結果                        |
| --- | ----------------------------------- | ------------------------------ | ------------------------------- |
| M-4 | Provider/Model 未選択時のガード動作 | テスト T-1, T-7 の PASS を確認 | LLMConfigNotSelectedError throw |
| M-5 | Provider/Model 選択後のガード動作   | テスト T-2, T-6 の PASS を確認 | 設定が正常に返却                |

### Task 3: DEFAULT_CONFIG fallback の不在確認

```bash
# DEFAULT_CONFIG が活性コード（コメント外）に存在しないことを確認
grep -rn "DEFAULT_CONFIG" apps/desktop/src/main/ipc/llmConfigProvider.ts | grep -v "^.*//.*DEFAULT_CONFIG"
```

期待結果: マッチなし（コメント行のみ）

## 手動テスト環境

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| 環境         | CLI（Electron アプリ起動不要）     |
| テストツール | Vitest（テスト結果による間接検証） |
| P53 対策     | スクリーンショット取得は不要       |

## 成果物

| 成果物             | パス                                                                              | 説明           |
| ------------------ | --------------------------------------------------------------------------------- | -------------- |
| 手動テストレポート | `docs/30-workflows/execution-env-terminal/outputs/phase-11/manual-test-report.md` | 手動テスト結果 |

## 完了条件

- [ ] M-1〜M-5 の手動検証が完了
- [ ] DEFAULT_CONFIG fallback の不在が確認されている
- [ ] 既存機能への回帰がないことが確認されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 12: ドキュメント更新
