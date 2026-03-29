# Phase 4: 検証ケース設計

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 4                          |
| 機能名 | task-llm-mod-04-audit-sync |
| 作成日 | 2026-03-29                 |

## 目的

新規テスト作成ではなく、既存テストを監査証跡として読むためのケース ID を定義する。

## 実行タスク

- EV-01〜EV-06 の定義
- grep で辿れる証跡位置の固定
- historical pass record と current code の対応付け

## 検証ケース

| ID    | 観点                         | 対象                                             |
| ----- | ---------------------------- | ------------------------------------------------ |
| EV-01 | OpenAI 新モデルの存在        | `llm.test.ts` の `o3` / `o4-mini`                |
| EV-02 | Anthropic health check model | `AnthropicAdapter.test.ts` の `claude-haiku-4-5` |
| EV-03 | Google request body          | `GoogleAdapter.test.ts` の `system_instruction`  |
| EV-04 | Main handler 正本参照        | `llm.ts` の shared import                        |
| EV-05 | system spec 完了記録         | `aiworkflow-requirements/LOGS.md`                |
| EV-06 | skill close-out 記録         | `task-specification-creator/LOGS.md`             |

## 参照資料

| 資料          | パス                                                                    | 説明     |
| ------------- | ----------------------------------------------------------------------- | -------- |
| Phase 1       | `phase-1-requirements.md`                                               | 要件     |
| Phase 2       | `phase-2-design.md`                                                     | 設計     |
| Phase 3       | `phase-3-design-review.md`                                              | レビュー |
| handler test  | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                  | EV-01    |
| adapter tests | `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` | EV-02    |
| adapter tests | `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts`    | EV-03    |

## 統合テスト連携

新規テストケースは作成せず、既存ケースを監査対象へマッピングする。

## 成果物

| 成果物         | パス                       | 説明         |
| -------------- | -------------------------- | ------------ |
| 検証ケース設計 | `phase-4-test-creation.md` | EV-01〜EV-06 |

## 完了条件

- [x] EV-01〜EV-06 を定義した
- [x] 各ケースの実ファイルを固定した
- [x] 新規テスト追加が不要と明記した
- [x] **本Phase内の全タスクを100%実行完了**
