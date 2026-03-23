# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 8                             |
| タスクID | UT-EXECUTION-ENV-TERMINAL-001 |
| 機能名   | execution-env-terminal        |
| 作成日   | 2026-03-23                    |

## 目的

動作を変えずにコード品質を改善する。TDD の Refactor フェーズ。

## 実行タスク

### Task 1: llmConfigProvider.ts のコード品質確認

確認観点:

- `LLMConfigNotSelectedError` と `assertNoSilentFallback` の配置が適切か
- エクスポート一覧が整理されているか
- JSDoc コメントが十分か

### Task 2: ExecutionEnvironment/index.tsx のコード品質確認

確認観点:

- terminal case の分岐が明確か
- `PLACEHOLDER_CONFIG` の terminal 設定が不要になった部分がないか（待機中表示で利用するため維持）
- import 文の整理

### Task 3: テストコードの重複排除

確認観点:

- テストヘルパー（共通の guidance mock 等）の抽出が必要か
- describe ブロックの構造が適切か

## 統合テスト連携

- リファクタリング後に全テストが引き続き PASS すること
- `cd apps/desktop && pnpm vitest run`

## 成果物

| 成果物                   | パス                                                                             | 説明                     |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------------ |
| リファクタリングレポート | `docs/30-workflows/execution-env-terminal/outputs/phase-8/refactoring-report.md` | リファクタリング内容記録 |

## 完了条件

- [ ] コードスメルが検出・対処されている
- [ ] リファクタリング後の全テストが PASS
- [ ] 動作の変更がない（テスト結果に変化なし）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 9: 品質保証
