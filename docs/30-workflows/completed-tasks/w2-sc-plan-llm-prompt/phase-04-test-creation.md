# Phase 4: テスト作成

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 4                          |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

Phase 2 設計に基づき、plan() の LLM 呼び出しテスト・JSON スキーマ準拠レスポンステスト・terminal_handoff 経路の非破壊テストを TDD（テストファースト）で作成する。

## 実行タスク

1. **テストファイル配置確認**
   - 既存テストファイルのインポートパスを参照し（P63 対策）、同パターンで新規テストを配置する
   - `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` に作成する
2. **LLM モックテスト作成**
   - AnthropicAdapter をモック化し、plan() が LLM を正しく呼び出すことをテストする
   - system プロンプトに agent 仕様書3ファイルが含まれることをアサートする
   - user プロンプトに入力テキストが含まれることをアサートする
3. **JSON スキーマ準拠テスト**
   - LLM が有効な JSON を返した場合、RuntimeSkillCreatorPlanResult にパースされることをテストする
   - 必須フィールド（skillName, description, agents, scripts, triggers, anchors）が全て含まれることを確認する
4. **terminal_handoff 経路の非破壊テスト**
   - integrated_api モードが false の場合、terminal_handoff が従来どおり返ることをテストする
   - LLM 呼び出しが行われないことを AnthropicAdapter モックで確認する
5. **エラー系テスト（Phase 6 で拡充予定のスケルトン）**
   - LLM がフォーマット不正レスポンスを返した場合のエラーケースをスケルトンとして作成する

## 参照資料

- `phase-02-design.md`
- `phase-03-design-review.md`
- `apps/desktop/src/main/services/runtime/__tests__/`（既存テストのインポートパス参照）

## 成果物

- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`

## 完了条件

- [ ] 既存テストのインポートパスを参照してから新規テストを作成した（P63 対策）
- [ ] AnthropicAdapter モックが正しく設定されている
- [ ] plan() の LLM 呼び出し検証テストが記述されている（Red 状態で可）
- [ ] JSON スキーマ準拠テストが記述されている
- [ ] terminal_handoff 経路の非破壊テストが記述されている
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` でテストが実行できる（Red 状態で可）

## 次のPhase

Phase 5: 実装
