# Skill Feedback Report — TASK-RT-01

## 1. task-specification-creator への改善提案

**問題**: Phase 2 設計で想定した型構造（`RuntimeSkillCreatorPlanResponse` を interface として `success` フィールドを追加する案）と、実際のコード（union type として3つの型を `|` で結合）が乖離していた。

**影響**: Phase 5 実装時に設計書の型定義をそのまま適用できず、既存の union type パターンに合わせた再設計が必要になった。

**提案**: spec 作成時に現行コードの型構造（interface vs union type、discriminated union パターンの有無）をより正確に反映すべき。Phase 2 設計書に「現行型パターン」セクションを設け、既存コードからの型抜粋を必須とする。

## 2. aiworkflow-requirements への改善提案

**問題**: `RuntimeSkillCreatorFacade` の DI パターンについて、constructor injection（`deps.llmAdapter`）と setter injection（`setLLMAdapter()`）の2パターンが混在している事実が architecture-overview-core.md に未記載だった。

**影響**: Phase 5 実装時に constructor 内での status 初期化ロジックを追加する必要があったが、DI パターンの全容が仕様書に記録されていなかったため、実装時に現行コードの調査が追加で必要になった。

**提案**: Facade の constructor DI と setter injection の2パターンが存在する事実を `architecture-overview-core.md` の Facade 責務セクションに記録すべき。特に `llmAdapter` のように非同期で注入されるケースの DI パターンを明記する。
