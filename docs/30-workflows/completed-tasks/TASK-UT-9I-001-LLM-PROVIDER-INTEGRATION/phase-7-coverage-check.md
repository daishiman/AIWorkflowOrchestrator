# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 7                                           |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | Phase 6 完了（テスト拡充）                  |
| 後続Phase  | Phase 8                                     |
| 作成日     | 2026-04-17                                  |
| ステータス | pending                                     |

## 目的

新規実装コードのテストカバレッジを可視化し、未到達パスを特定する。

## 実行タスク

1. カバレッジレポートを生成する
2. 新規実装コードのカバレッジを確認する（目標: 80%以上）
3. 未到達パスを分析する
4. AC-1〜AC-7 へのトレーサビリティを確認する

## カバレッジ実行コマンド

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/llm/__tests__/LLMClient.test.ts \
  src/main/ipc/__tests__/skillHandlers.docs.test.ts \
  --coverage \
  --reporter=verbose

# カバレッジ対象ファイル
# - apps/desktop/src/main/services/llm/LLMClient.ts
# - apps/desktop/src/main/services/llm/providers/AnthropicProvider.ts
# - apps/desktop/src/main/ipc/index.ts（LLMClient関連箇所）
# - apps/desktop/src/main/ipc/skillHandlers.ts（normalizeDocError関連箇所）
```

## カバレッジ目標

| ファイル                       | 目標 line coverage |
| ------------------------------ | ------------------ |
| `LLMClient.ts`                 | 85%以上            |
| `AnthropicProvider.ts`         | 80%以上            |
| `skillHandlers.ts`（修正箇所） | 80%以上            |

## AC へのトレーサビリティ確認

| AC   | 対応テスト          | カバレッジ確認 |
| ---- | ------------------- | -------------- |
| AC-1 | TC-01, TC-08        | [ ]            |
| AC-2 | TC-02, TC-09        | [ ]            |
| AC-3 | TC-03               | [ ]            |
| AC-4 | TC-04, TC-12, TC-13 | [ ]            |
| AC-5 | TC-05, TC-14        | [ ]            |
| AC-6 | TC-06, TC-16, TC-17 | [ ]            |
| AC-7 | TC-11               | [ ]            |

## 統合テスト連携

- 全 SubAgent が担当テストケースのカバレッジを確認する
- SubAgent-D がトレーサビリティ網羅率を集計する

## 成果物

- `outputs/phase-7/coverage-report.md`: カバレッジレポート（各ファイルの line/branch/function coverage）
- `outputs/phase-7/traceability-matrix.md`: AC-1〜AC-7 のトレーサビリティ行列

## 完了条件

- [ ] 新規実装コードのカバレッジが目標値（80%）以上
- [ ] AC-1〜AC-7 が全てテストでカバーされている
- [ ] カバレッジレポートが出力されている

## タスク100%実行確認【必須】

- [ ] カバレッジレポート生成完了
- [ ] 新規コードカバレッジ 80%以上 確認完了
- [ ] AC トレーサビリティ確認完了
- [ ] カバレッジレポート・トレーサビリティ行列出力完了

## 次Phase

Phase 8（リファクタリング）へ進む。
