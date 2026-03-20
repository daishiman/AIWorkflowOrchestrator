# Phase 7: カバレッジ確認

## メタ情報

| 項目          | 内容                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| Phase番号     | 7                                                                                                                  |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                                                                |
| 作成日        | 2026-03-20                                                                                                         |
| 担当          | -                                                                                                                  |
| ステータス    | 未着手                                                                                                             |
| 前Phase成果物 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-6-test-expansion.md` |

## 目的

プロジェクトのカバレッジ基準（Line: 80%以上、Branch: 60%以上、Function: 80%以上）を満たしているか確認する。基準未達の場合はPhase 6へ戻りテストを追加する。

## 実行タスク

### タスク1: カバレッジ計測

```bash
# apps/desktopディレクトリから実行（P40対策）
cd apps/desktop

# 対象ファイルのカバレッジ計測
pnpm vitest run --coverage \
  src/renderer/store/__tests__/ \
  src/renderer/store/slices/__tests__/

# カバレッジサマリーを確認
# カバレッジレポートは coverage/ ディレクトリに出力される
```

### タスク2: カバレッジ基準の確認

以下の基準に対して各ファイルのカバレッジを確認する。

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**確認対象ファイル**:

| ファイル                                             | 確認内容                                               |
| ---------------------------------------------------- | ------------------------------------------------------ |
| `apps/desktop/src/renderer/store/index.ts`           | partialize関数・migrate関数のカバレッジ                |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts` | validateAndSyncPersistedConfig・起動時同期のカバレッジ |

### タスク3: カバレッジ結果の記録

| ファイル       | Line | Branch | Function | 基準達成 |
| -------------- | ---- | ------ | -------- | -------- |
| store/index.ts | -    | -      | -        | -        |
| llmSlice.ts    | -    | -      | -        | -        |

（Phase 7 実行時に記入）

### タスク4: 判定

| 判定                   | 条件                                   | アクション     |
| ---------------------- | -------------------------------------- | -------------- |
| PASS（Phase 8 へ進む） | すべての対象ファイルが最低基準を満たす | Phase 8 へ     |
| FAIL（Phase 6 へ戻る） | いずれかのファイルが最低基準を下回る   | Phase 6 へ戻る |

## 参照資料

### コード品質ルール

| 資料名         | パス                               |
| -------------- | ---------------------------------- |
| カバレッジ基準 | `.claude/rules/02-code-quality.md` |

### 前Phase成果物

| 資料名             | パス                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Phase 6 テスト拡充 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-6-test-expansion.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                 | 対策                                               |
| ---------- | ------------------------------------ | -------------------------------------------------- |
| P40        | テスト実行ディレクトリ依存           | `apps/desktop` から実行する                        |
| P41        | v8カバレッジのインライン関数カウント | partializeのインライン関数（arrow function）を確認 |

## 実行手順

1. **タスク1の実施**: カバレッジを計測する
2. **タスク2の実施**: 基準値と比較する
3. **タスク3の実施**: 結果を記録する
4. **タスク4の判定**: PASS/FAILを決定する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                               | 説明               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------ |
| Phase 7 仕様書（本ファイル） | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-7-coverage-check.md` | カバレッジ確認結果 |

## 完了条件

- [ ] カバレッジ計測コマンドを実行した
- [ ] store/index.ts と llmSlice.ts のカバレッジを確認した
- [ ] タスク3の結果テーブルに数値を記入した
- [ ] PASS/FAILの判定を行った
- [ ] FAIL の場合、Phase 6 へ戻り追加テストを実施した

## 次Phase

- PASS: Phase 8: リファクタリング（`phase-8-refactoring.md`）
- FAIL: Phase 6: テスト拡充（`phase-6-test-expansion.md`）へ戻る
