# ドキュメント更新履歴 - TASK-LLM-MOD-03

## TASK-LLM-MOD-03: GoogleAdapter system_instruction 対応（2026-03-24）

### 変更ファイル（プロダクションコード）

- `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`
- `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts`
- `apps/desktop/src/main/adapters/llm/__tests__/streaming.test.ts`

### 変更内容

- `baseUrl` デフォルト値を `v1beta` に変更
- `formatContents` から systemPrompt 挿入ロジックを削除
- `buildRequestBody` private メソッドを追加
- `sendChat` / `streamChat` を `buildRequestBody` に委譲
- GoogleAdapter.test.ts: MSW モック URL を v1beta に更新、新規テスト 5 件追加（計 19 テスト）
- streaming.test.ts: MSW モック URL 3 箇所を v1beta に修正

### ドキュメント更新（全 Step 完了後に記録: P4 対策）

| Step     | 内容                            | 結果                                                         |
| -------- | ------------------------------- | ------------------------------------------------------------ |
| Step 1-A | LOGS.md 2 ファイル更新          | 完了（aiworkflow-requirements + task-specification-creator） |
| Step 1-A | SKILL.md 2 ファイル変更履歴更新 | 完了（v9.02.16 + v10.09.18）                                 |
| Step 1-B | 実装ステータステーブル更新      | N/A（internal リファクタリング）                             |
| Step 1-C | 関連タスクテーブル更新          | 完了（backlog に 2 件登録）                                  |
| Step 1-D | topic-map.md 再生成             | 完了（2455 キーワード）                                      |
| Step 2   | システム仕様更新                | N/A（インターフェース変更なし）                              |
| Step 3   | IPC 契約検証                    | N/A（IPC 変更なし）                                          |

### Phase 12 成果物

| 成果物                                        | 状態 |
| --------------------------------------------- | ---- |
| Task 12-1: 実装ガイド（Part 1 + Part 2）      | 完了 |
| Task 12-2: システム仕様書更新サマリー         | 完了 |
| Task 12-3: ドキュメント更新履歴（本ファイル） | 完了 |
| Task 12-4: 未タスク検出レポート（2 件）       | 完了 |
| Task 12-5: スキルフィードバックレポート       | 完了 |
