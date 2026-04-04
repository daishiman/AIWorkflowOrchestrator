# TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## 1. メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| タスクID | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 |
| 種別     | follow-up / feature                             |
| 優先度   | Medium                                          |
| 親タスク | TASK-RT-01                                      |
| 作成日   | 2026-03-29                                      |
| 状態     | open                                            |

## 2. 背景

TASK-RT-01 で `plan()` メソッドに LLMAdapter ステータスチェック（`_llmAdapterStatus` が `"failed"` / `"initializing"` の場合に早期エラーリターン）を実装したが、`execute()` と `improve()` メソッドには同等のガードが未実装。

`execute()` や `improve()` も LLM を使用するため、adapter 未設定・初期化失敗時に同様のエラーが発生しうる。現状では `execute()` / `improve()` の adapter 未設定エラーは `plan()` とは異なる経路でエラーが伝播し、ユーザーへの actionable なメッセージが提供されない。

### 苦戦箇所（TASK-RT-01 より引継ぎ）

- TASK-RT-01 の設計段階では `plan()` のみをスコープとし、`execute()` / `improve()` のガードは意図的に後回しにした。
- `execute()` / `improve()` は `plan()` より呼び出しフローが複雑（ストリーミング、ステップ管理等）なため、エラーレスポンスの型と返却タイミングの設計が `plan()` とは異なる可能性がある。
- `RuntimeSkillCreatorPlanErrorResponse` 型は `plan()` 専用設計のため、`execute()` / `improve()` 用に型定義の拡張または共通化が必要になる場合がある。

## 3. 実施スコープ

- `RuntimeSkillCreatorFacade.execute()` の先頭に `_llmAdapterStatus` チェックを追加する
- `RuntimeSkillCreatorFacade.improve()` の先頭に `_llmAdapterStatus` チェックを追加する
- エラーコードは `plan()` と同様に `LLM_ADAPTER_FAILED` / `LLM_ADAPTER_INITIALIZING` を使用する
- エラーレスポンス型を `execute()` / `improve()` の返却型に合わせて調整する

### スコープ外

- `execute()` / `improve()` のストリーミング途中でのアダプター状態変化への対応
- 新規エラーコードの追加（既存の `LLM_ADAPTER_FAILED` / `LLM_ADAPTER_INITIALIZING` を流用）

## 4. 成果物

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — `execute()` / `improve()` にアダプターステータスチェック追加
- `packages/shared/src/types/skillCreator.ts` — `execute()` / `improve()` のエラーレスポンス型拡張（必要な場合）
- テスト: `RuntimeSkillCreatorFacade.adapter-status.test.ts` に `execute` / `improve` アダプター未設定シナリオ追加

## 5. 完了条件

- `execute()` / `improve()` が `_llmAdapterStatus === "failed"` の場合に `LLM_ADAPTER_FAILED` エラーを返す
- `execute()` / `improve()` が `_llmAdapterStatus === "initializing"` の場合に `LLM_ADAPTER_INITIALIZING` エラーを返す
- actionable メッセージが `plan()` と同等の品質で提供される
- 既存の `execute()` / `improve()` テストがリグレッションなし
