# Phase 5: 実装

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 5                      |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 作成日   | 2026-03-22             |

## 目的

Phase 4 で作成したテストを Green にする実装を行う。improve() の LLM 呼び出し実装、改善提案パーサー、SkillFileWriter 連携を実装する。

## 実行タスク

1. `packages/shared/src/types/skillCreator.ts` の型定義拡充
   - `RuntimeSkillCreatorImproveSuggestion` 型追加（section, before, after, reason）
   - `RuntimeSkillCreatorImproveResult` 型更新
2. `RuntimeSkillCreatorFacade.improve()` の LLM 呼び出し実装
   - improve-prompt.md の読み込み（fs.readFileSync または import）
   - SkillFileManager で対象 SKILL.md を読み込む
   - AnthropicAdapter（または LLM クライアント）を呼び出す
   - system プロンプト = improve-prompt.md 内容
   - user プロンプト = `{feedback}\n\n現在のSKILL.md:\n{skillContent}`
3. 改善提案 JSON パーサー実装
   - LLM レスポンスから JSON 部分を抽出
   - JSON Schema に従ってバリデーション
   - 不正 JSON 時のエラーハンドリング（Result<T, E> パターン）
4. SkillFileWriter 連携（承認後の適用フロー）
   - `applyImprovement(skillName, suggestion)` メソッド実装
   - before/after テキストによる文字列置換
   - 適用前バックアップの実装
5. IPC レスポンス形式の確認（P60 対策: `{ success: boolean, data?, error? }` wrapper）

## 参照資料

- Phase 4 テストファイル（Red 状態のテスト）
- Phase 2 設計書（JSON Schema、プロンプト設計）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `packages/shared/src/types/skillCreator.ts`
- `.claude/rules/02-code-quality.md`（Result<T,E> パターン、any 型禁止）
- `.claude/rules/06-known-pitfalls.md`（P19: 型キャスト、P60: IPC レスポンス形式）

## 成果物

- 更新済み `RuntimeSkillCreatorFacade.ts`（improve() 実装）
- 更新済み `packages/shared/src/types/skillCreator.ts`
- 改善提案 JSON パーサーモジュール

## 完了条件

- [ ] `RuntimeSkillCreatorImproveSuggestion` 型を定義した
- [ ] improve() が LLM を呼び出し改善提案を返す実装を完了した
- [ ] improve-prompt.md を system プロンプトとして使用している
- [ ] SkillFileManager で SKILL.md を読み込んでいる
- [ ] 改善提案 JSON パーサーを実装した
- [ ] 不正 JSON 時は Result.err を返す実装を完了した
- [ ] SkillFileWriter 連携（applyImprovement）を実装した
- [ ] Phase 4 のテストが全て Green になった
- [ ] `any` 型を使用していない

## 次のPhase

Phase 6: テスト拡充
