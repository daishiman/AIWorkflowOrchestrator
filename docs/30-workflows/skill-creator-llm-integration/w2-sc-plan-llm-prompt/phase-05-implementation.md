# Phase 5: 実装

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 5                          |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

Phase 2 設計・Phase 4 テストに基づき、RuntimeSkillCreatorFacade.plan() のスタブを置き換え、ResourceLoader で agent 仕様書を注入し、AnthropicAdapter 経由で LLM を呼び出してスキル構造計画を生成するプロダクションコードを実装する。

## 実行タスク

1. **AnthropicAdapter DI 注入（コンストラクタ改修）**
   - `RuntimeSkillCreatorFacade` のコンストラクタに `AnthropicAdapter` を追加する
   - 既存の DI ファクトリ・コンテナの配線を更新する
   - P61 対策: 引数型はインターフェース（`ILLMAdapter` 等）を使用する
2. **ResourceLoader 統合**
   - plan() 内で ResourceLoader.loadAgent() を使用して以下3ファイルを読み込む
     - `discover-problem.md`
     - `design-workflow.md`
     - `plan-structure.md`
   - 読み込み失敗時は graceful degradation（エラーを上位に伝播し、フォールバックなし）
3. **プロンプトビルダー実装**
   - `buildPlanSystemPrompt(agents: string[]): string` 関数を実装する
   - JSON スキーマをシステムプロンプトの末尾に付加する
   - マジックストリングは定数化する（P8 対策）
4. **LLM 呼び出しと レスポンスパーサー実装**
   - AnthropicAdapter.complete() を呼び出す
   - レスポンステキストから JSON を抽出・パースする
   - `RuntimeSkillCreatorPlanResult` 型にマッピングする
   - パース失敗時は `Result.err()` を返す
5. **terminal_handoff 経路の保護**
   - integrated_api モードでない場合は LLM 呼び出しをスキップし、従来の terminal_handoff を返す
6. **`packages/shared/src/types/skillCreator.ts` の型拡充**
   - `RuntimeSkillCreatorPlanResult` に agents / scripts / triggers / anchors フィールドを追加する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/03-phase-02-design.md`
- `docs/30-workflows/skill-creator-llm-integration/03-phase-04-test-creation.md`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`
- `packages/shared/src/types/skillCreator.ts`
- `.claude/skills/skill-creator/agents/discover-problem.md`（参照のみ）
- `.claude/skills/skill-creator/agents/design-workflow.md`（参照のみ）
- `.claude/skills/skill-creator/agents/plan-structure.md`（参照のみ）

## 成果物

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（改修）
- `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`（DI 受け入れ側の調整、必要な場合のみ）
- `packages/shared/src/types/skillCreator.ts`（RuntimeSkillCreatorPlanResult 拡充）

## 完了条件

- [ ] AnthropicAdapter が DI で注入される（コンストラクタ引数はインターフェース型）
- [ ] ResourceLoader.loadAgent() で3つの agent 仕様書を読み込んでいる
- [ ] buildPlanSystemPrompt() が JSON スキーマを含む system プロンプトを生成する
- [ ] AnthropicAdapter.complete() が呼び出され、レスポンスがパースされる
- [ ] terminal_handoff 経路が変更されていない
- [ ] RuntimeSkillCreatorPlanResult 型に必須フィールドが追加されている
- [ ] Phase 4 で作成した全テストが Green になっている

## 次のPhase

Phase 6: テスト拡充
