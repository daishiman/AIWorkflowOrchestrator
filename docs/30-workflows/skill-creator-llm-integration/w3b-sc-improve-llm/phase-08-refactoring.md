# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 8                      |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 作成日   | 2026-03-22             |

## 目的

plan() と improve() に共通の AnthropicAdapter 呼び出しパターンを抽出し、コードの重複を排除する。コード品質を改善しつつ、テストが Green のまま保つ。

## 実行タスク

1. plan() と improve() の LLM 呼び出しコードを比較し、共通パターンを特定する
2. 共通ヘルパー関数の抽出
   - `callLLMWithSystemPrompt(systemPrompt, userPrompt, options?)` などの共通メソッドを抽出
   - または `AnthropicAdapter` クラスへの責務集約
3. 改善提案 JSON パーサーの独立モジュール化
   - `parseImproveSuggestions(rawText: string): Result<ImproveSuggestion[], Error>` として切り出し
4. エラーコード定数の整理
   - `SKILL_CREATOR_ERROR_CODES` などの定数オブジェクトへ集約
5. 不要なコメントと未使用 import の除去
6. リファクタリング後に全テストが Green であることを確認

## 参照資料

- Phase 5 実装コード
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `.claude/rules/02-code-quality.md`（SRP、DRY 原則）
- `.claude/rules/01-architecture.md`（設計原則）

## 成果物

- リファクタリング済み `RuntimeSkillCreatorFacade.ts`
- 共通ヘルパー関数（または AnthropicAdapter 拡張）
- 独立した `parseImproveSuggestions` モジュール（必要に応じて）

## 完了条件

- [ ] plan() と improve() の共通 LLM 呼び出しパターンを抽出した
- [ ] 改善提案 JSON パーサーを独立させた（または適切に配置した）
- [ ] エラーコードを定数として整理した
- [ ] 未使用 import を除去した
- [ ] リファクタリング後に全テストが Green のままであることを確認した
- [ ] `any` 型が導入されていないことを確認した

## 次のPhase

Phase 9: 品質検証
