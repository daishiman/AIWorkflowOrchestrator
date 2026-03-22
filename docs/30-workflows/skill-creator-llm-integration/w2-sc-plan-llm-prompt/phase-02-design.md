# Phase 2: 設計

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 2                          |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

plan() が LLM を呼び出すための詳細設計を行う。プロンプト構造（system プロンプト = agent 仕様書3ファイル連結、user プロンプト = 自然言語入力）、レスポンス JSON スキーマ、AnthropicAdapter の DI 設計を確定する。

## 実行タスク

1. **プロンプト構造設計**
   - system プロンプト: discover-problem.md + design-workflow.md + plan-structure.md を区切り文字付きで連結する方式を設計する
   - user プロンプト: 自然言語入力テキストをそのまま渡す形式を定義する
   - プロンプトビルダー関数のシグネチャを設計する（`buildPlanSystemPrompt(agents: string[]): string`）
2. **レスポンス JSON スキーマ設計**
   - LLM に返させる JSON 構造を定義する

   ```json
   {
     "skillName": "string",
     "description": "string",
     "agents": [{ "name": "string", "role": "string" }],
     "scripts": [{ "name": "string", "purpose": "string" }],
     "triggers": ["string"],
     "anchors": ["string"]
   }
   ```

   - スキーマをシステムプロンプトに含める方式を設計する

3. **AnthropicAdapter DI 設計**
   - RuntimeSkillCreatorFacade のコンストラクタに AnthropicAdapter を DI する設計を定義する
   - 既存の DI コンテナ（または手動 DI）との統合方法を設計する
4. **エラーハンドリング設計**
   - LLM レスポンスが JSON でない場合の処理フロー
   - ResourceLoader.loadAgent() が失敗した場合の graceful degradation フロー
   - terminal_handoff 経路が影響を受けないことを設計で保証する
5. 設計ドキュメントを作成する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/03-phase-01-requirements.md`（前 Phase 成果物）
- `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `packages/shared/src/types/skillCreator.ts`

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/03-phase-02-design-output.md`（設計書）
  - プロンプト構造図
  - レスポンス JSON スキーマ（完全版）
  - AnthropicAdapter DI 設計（クラス図）
  - エラーハンドリングフロー図

## 完了条件

- [ ] system プロンプトの連結方式（区切り文字・順序）を確定した
- [ ] user プロンプトのフォーマットを確定した
- [ ] レスポンス JSON スキーマの全フィールドを定義した
- [ ] AnthropicAdapter の DI 方式（コンストラクタ注入）を確定した
- [ ] LLM レスポンスパースエラー時のフォールバック動作を設計した
- [ ] ResourceLoader 失敗時の graceful degradation を設計した
- [ ] terminal_handoff 経路への影響がゼロであることを設計書に明記した

## 次のPhase

Phase 3: 設計レビュー
