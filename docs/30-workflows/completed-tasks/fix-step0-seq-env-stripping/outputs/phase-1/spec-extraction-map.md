# Phase 1 成果物: 仕様抽出マップ

## P50 チェック結果

| 確認項目                              | 状態   | 詳細                                                                          |
| ------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| `SkillExecutor.ts:861` 問題箇所の特定 | 確認済 | `env: { ANTHROPIC_API_KEY: apiKey }` が存在し、`process.env` スプレッドがない |
| `AgentExecutor.ts` との比較           | 確認済 | `AgentExecutor.ts` では `env` オプション未指定のため正常動作                  |
| 修正スコープが 1 行であることの確認   | 確認済 | L861 の 1 行修正で解消可能                                                    |
| セキュリティリスク（IPC 境界）の評価  | 確認済 | Main プロセス内で完結。Renderer への漏洩なし                                  |

## 変更インベントリ

| #   | ファイルパス                                                                | 行番号     | 変更前                               | 変更後                                               |
| --- | --------------------------------------------------------------------------- | ---------- | ------------------------------------ | ---------------------------------------------------- |
| 1   | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                     | L861       | `env: { ANTHROPIC_API_KEY: apiKey }` | `env: { ...process.env, ANTHROPIC_API_KEY: apiKey }` |
| 2   | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts` | 既存テスト | PATH / precedence の検証なし         | 既存 auth suite にアサーション追加                   |

## AC トレーサビリティマップ

| AC   | 確認方法       | 対応 FR      | 実装箇所                                                                         |
| ---- | -------------- | ------------ | -------------------------------------------------------------------------------- |
| AC-1 | ユニットテスト | FR-01        | `SkillExecutor.auth.test.ts` の `PATH` アサーション                              |
| AC-2 | ユニットテスト | FR-02        | `SkillExecutor.auth.test.ts` の `ANTHROPIC_API_KEY` アサーション                 |
| AC-3 | ユニットテスト | FR-03, FR-04 | `SkillExecutor.auth.test.ts` の上書き優先アサーション / SDK `spawn()` の正常動作 |
| AC-4 | CI（Phase 9）  | NFR-04       | 全テスト PASS                                                                    |
| AC-5 | コードレビュー | NFR-01       | Main プロセスのみ `process.env` を参照                                           |
