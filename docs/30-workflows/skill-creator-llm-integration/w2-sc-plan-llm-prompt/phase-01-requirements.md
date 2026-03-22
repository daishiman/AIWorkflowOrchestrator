# Phase 1: 要件定義

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 1                          |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

RuntimeSkillCreatorFacade.plan() の現行スタブ実装を調査し、ResourceLoader.loadAgent() の使い方を把握したうえで、3つの agent 仕様書（discover-problem.md / design-workflow.md / plan-structure.md）の内容を確認し、LLM プロンプト要件を定義する。

## 実行タスク

1. `RuntimeSkillCreatorFacade.ts` を読み込み、plan() の現行スタブ実装を把握する
2. ResourceLoader クラスの実装を調査し、loadAgent() メソッドのインターフェース・戻り値型・エラー仕様を確認する
3. 以下の agent 仕様書を読み込み、プロンプトへの組み込み方を検討する
   - `.claude/skills/skill-creator/agents/discover-problem.md`
   - `.claude/skills/skill-creator/agents/design-workflow.md`
   - `.claude/skills/skill-creator/agents/plan-structure.md`
4. 上記3ファイルの合計トークン数を概算し、Claude のコンテキスト制限内に収まるか確認する
5. plan() が受け取る入力（自然言語テキスト）と返すべき出力（RuntimeSkillCreatorPlanResult 型）を明確化する
6. terminal_handoff 経路（integrated_api 以外のフォールバック）の現行動作を確認し、変更しないことを要件に含める
7. 要件定義ドキュメントを `phase-01-requirements.md` として作成する

## 参照資料

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/resource/ResourceLoader.ts`（または相当ファイル）
- `packages/shared/src/types/skillCreator.ts`
- `.claude/skills/skill-creator/agents/discover-problem.md`
- `.claude/skills/skill-creator/agents/design-workflow.md`
- `.claude/skills/skill-creator/agents/plan-structure.md`
- `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/phase-01-requirements-output.md`（要件定義書）

## 完了条件

- [ ] plan() スタブ実装の現行動作（戻り値・条件分岐）を文書化した
- [ ] ResourceLoader.loadAgent() のシグネチャと戻り値型を確認した
- [ ] 3つの agent 仕様書の内容と合計トークン数（概算）を記録した
- [ ] terminal_handoff 経路を保護する要件を明記した
- [ ] LLM への入出力仕様（入力: 自然言語文字列、出力: JSON スキーマ）を定義した
- [ ] 受入基準 AC-1（自然言語 → 構造計画）および AC-4（TerminalHandoff 非破壊）との対応を明記した

## 次のPhase

Phase 2: 設計
