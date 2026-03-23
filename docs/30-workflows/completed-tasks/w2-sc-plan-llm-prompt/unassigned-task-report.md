# 未タスク検出レポート

## TASK-SC-03-PLAN-LLM-PROMPT

## 検出件数: 7件

### UT-SC-03-001: IResourceLoader インターフェース定義と DI パターン統一

- **検出元**: Phase 3 設計レビュー MINOR #1
- **概要**: ResourceLoader は直接クラス型で DI されている。IResourceLoader インターフェースを定義して P61 対策を完全にする
- **優先度**: 低
- **影響範囲**: RuntimeSkillCreatorFacade の DI 型定義

### UT-SC-03-002: plan() 実行時の動的 apiKey 設定メカニズム

- **検出元**: Phase 3 設計レビュー MINOR #2
- **概要**: LLMAdapterFactory.getAdapter() は DI 時点の apiKey で初期化されるが、plan() 実行時の decision.apiKey と異なる可能性がある。動的 apiKey 設定の仕組みが必要
- **優先度**: 低
- **影響範囲**: LLMAdapterFactory, AnthropicAdapter

### UT-SC-03-003: ipc/index.ts DI 配線の実装

- **検出元**: Phase 5 実装
- **概要**: RuntimeSkillCreatorFacade への llmAdapter/resourceLoader の DI 配線が ipc/index.ts でまだ未実装（本タスクはFacade内部の実装のみ）。次の統合タスクで配線する
- **優先度**: 中
- **影響範囲**: apps/desktop/src/main/ipc/index.ts

### UT-SC-03-004: plan() 出力型の SkillBlueprint 互換移行

- **検出元**: index.md 正本との整合性検証
- **概要**: index.md（正本）では plan() の出力型は `SkillBlueprint`（category + customizations + files + reasoning フィールド含む）と定義されているが、現在の実装は `RuntimeSkillCreatorPlanResult`（flat な agents/scripts リスト）のみ。後続タスク w3a（SkillFileWriter）が SkillBlueprint を入力に期待するため、型不整合が発生する。段階的移行として、現在の flat 構造を SkillBlueprint の subset（`category: "standard"` 固定）として返すアダプタレイヤーを検討する
- **優先度**: 高
- **影響範囲**: RuntimeSkillCreatorFacade.ts, packages/shared/src/types/skillCreator.ts, w3a タスク全体

### UT-SC-03-005: plan() エラーハンドリングの Result<T,E> パターン移行

- **検出元**: エレガント検証（30種思考法分析）
- **概要**: plan() が throw パターンを使用。02-code-quality.md の Result<T,E> ルールとの乖離
- **優先度**: 中
- **影響範囲**: RuntimeSkillCreatorFacade.ts, creatorHandlers.ts

### UT-SC-03-006: buildPlanSystemPrompt / parsePlanResponse 単体テスト追加

- **検出元**: エレガント検証（2軸思考 #8）
- **概要**: ヘルパー関数の直接単体テストが欠如。リファクタリング安全性のリスク
- **優先度**: 低
- **影響範囲**: RuntimeSkillCreatorFacade.plan.test.ts

### UT-SC-03-007: improve() P42 準拠バリデーション追加

- **検出元**: エレガント検証（類推思考 #16）
- **概要**: improve() にバリデーションがなく、同Facade内で方針不統一
- **優先度**: 低
- **影響範囲**: RuntimeSkillCreatorFacade.ts
