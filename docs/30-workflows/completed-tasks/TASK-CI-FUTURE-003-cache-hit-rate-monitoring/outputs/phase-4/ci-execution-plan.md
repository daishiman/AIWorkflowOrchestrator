# CI 実行計画

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| Phase    | 4                                    |
| 機能名   | TASK-CI-FUTURE-003                   |
| タスク名 | キャッシュヒット率のモニタリング設定 |
| 作成日   | 2026-04-15                           |

---

## 実行順序

### ステップ 1: Phase 5 実装後に TC-001 を実行

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| 状態     | キャッシュが既にヒットしている通常の状態 |
| 事前操作 | なし（実装後の最初の CI 実行）           |
| 確認先   | Actions > 最新実行 > Summary タブ        |

### ステップ 2: TC-002（フォールバックヒット）

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| 状態     | `pnpm-lock.yaml` キー変更でフォールバックヒット |
| 事前操作 | `echo "# test" >> pnpm-lock.yaml` してプッシュ  |
| 確認先   | Actions > 最新実行 > Summary + Annotations      |

### ステップ 3: TC-003（キャッシュミス）

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| 状態     | キャッシュ削除後のミス状態                                      |
| 事前操作 | `gh cache delete --all --repo daishiman/AIWorkflowOrchestrator` |
| 確認先   | Actions > 最新実行 > Summary + Annotations (warning)            |

---

## 確認チェックリスト

| テストケース | 確認項目                              | 期待結果               | 確認状態        |
| ------------ | ------------------------------------- | ---------------------- | --------------- |
| TC-001       | Summary に `✅ 完全ヒット` が出力     | あり                   | Phase 11 で確認 |
| TC-001       | アノテーションなし                    | なし                   | Phase 11 で確認 |
| TC-002       | Summary に `⚠️ フォールバック` が出力 | あり                   | Phase 11 で確認 |
| TC-002       | `::notice::` アノテーション           | あり                   | Phase 11 で確認 |
| TC-003       | Summary に `❌ キャッシュミス` が出力 | あり                   | Phase 11 で確認 |
| TC-003       | `::warning::` アノテーション          | あり                   | Phase 11 で確認 |
| TC-007       | 複数ジョブで独立した Summary          | 各ジョブに個別テーブル | Phase 11 で確認 |

---

## 補助コマンド

```bash
# キャッシュ一覧確認
gh cache list --repo daishiman/AIWorkflowOrchestrator

# 全キャッシュ削除（TC-003 用）
gh cache delete --all --repo daishiman/AIWorkflowOrchestrator

# 最新 CI 実行結果確認
gh run list --workflow=ci.yml --limit=5

# 最新 CI 実行のログ確認
gh run view --log $(gh run list --workflow=ci.yml --limit=1 --json databaseId --jq '.[0].databaseId')
```
