# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 8                          |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

Phase 5 で実装したプロダクションコードのコード品質を改善する。プロンプト構築ロジックの関数抽出・マジックストリング排除・型安全性向上を行い、テストが全て Green を維持することを確認する。

## 実行タスク

1. **プロンプト構築ロジックの関数抽出**
   - plan() 内にインライン記述されたプロンプト構築ロジックを `buildPlanSystemPrompt()` として独立関数に抽出する
   - レスポンスパースロジックを `parsePlanResponse()` として独立関数に抽出する
   - 各関数を単独でテスト可能な pure function として設計する
2. **マジックストリング排除**
   - agent ファイルパス・JSON スキーマフィールド名・プロンプト区切り文字を定数化する
   - `PLAN_PROMPT_CONSTANTS` オブジェクトまたは定数ファイルに集約する
3. **型安全性向上**
   - パースしたオブジェクトを `unknown` 型で受け取り、型ガード関数（`isValidPlanResult`）で検証する
   - P49 対策: `in` 演算子で実行時プロパティ存在確認を行う
4. **不要な `as` キャスト除去**
   - P19 対策: `as any` や `as string` を `Array.isArray()` / `typeof` チェックに置き換える
5. リファクタリング後に全テストが Green であることを確認する

## 参照資料

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（実装済み）
- `.claude/rules/02-code-quality.md`（TypeScript 型安全ルール）
- `.claude/rules/06-known-pitfalls.md`（P19, P49 対策）

## 成果物

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（リファクタリング済み）
- `apps/desktop/src/main/services/runtime/planPromptConstants.ts`（定数ファイル、必要に応じて）

## 完了条件

- [ ] プロンプト構築ロジックが独立関数として抽出されている
- [ ] マジックストリングが定数に置き換えられている
- [ ] 型ガード関数（`isValidPlanResult`）が `in` 演算子ベースで実装されている
- [ ] `as any` / `as string` 等の unsafe キャストが除去されている
- [ ] リファクタリング後も全テストが Green を維持している

## 次のPhase

Phase 9: 品質検証
