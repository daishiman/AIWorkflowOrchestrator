# Phase 12 成果物: Skill Feedback Report

## 対象スキル

- `task-specification-creator`（ワークフロー定義・バリデーションスキル）
- `aiworkflow-requirements`（システム仕様書スキル）

## 改善点

### `validate-phase-output.js` の `## 統合テスト連携` 必須チェック

**現状**: Phase 1 には `## 統合テスト連携` セクションが存在したが Phase 2-11 には存在せず、バリデーターが 10 errors を報告した。

**提案**: スキル作成テンプレート（`assets/spec-template.md` 等）に `## 統合テスト連携` セクションを追加することで、新規ワークフロー作成時から欠落を防げる。

**優先度**: 中（次回ワークフロー作成時に発生を防ぐが、既存ファイルへの影響なし）

### stale path の grep パターン二重確認

**現状**: SDK-04 のタスク仕様では `skill-creator-agent-sdk-lane.*step-03` のみが grep パターンとして明記されていたが、実際の stale path は `step-04-par-task-04` 形式で `step-03` パターンにマッチしなかった。

**提案**: タスク仕様の grep パターン定義に、置換対象の before/after 両方を明記するルールを追加する。

**優先度**: 高（次回の path drift 対応タスクで同じ見落としが発生しうる）

## 改善点なし（no-op 根拠あり）

- `task-specification-creator` のスキル構造: ✅ 0 errors（26 warnings は SKILL.md からの未リンクで既知の pre-existing）
- `aiworkflow-requirements` の SKILL.md サイズ超過: 本スキルのコンテンツ量の問題であり、スキル設計上の改善余地はあるが、本タスクのスコープ外

## next action

1. `task-specification-creator` スキルのテンプレートに `## 統合テスト連携` を追加（別タスクとして formalize）
2. SDK 系タスク仕様の grep パターン定義フォーマットを改善（別タスクとして formalize）
