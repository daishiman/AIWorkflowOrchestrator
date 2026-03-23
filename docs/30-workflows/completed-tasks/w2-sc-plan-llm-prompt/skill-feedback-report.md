# スキルフィードバックレポート

## TASK-SC-03-PLAN-LLM-PROMPT

## 1. ワークフロー改善点

### 1.1 LLM プロンプト設計パターンの標準化

本タスクで確立した「agent 仕様書を system prompt に注入し、JSON スキーマで出力形式を制約する」パターンは、今後の LLM 統合タスク（execute, improve）でも再利用可能。task-specification-creator に「LLM プロンプト設計チェックリスト」を追加することを推奨。

### 1.2 Phase 4-5 の TDD サイクル改善

Phase 4（テスト作成）で作成したテストが Phase 5（実装）で追加された入力バリデーション（空文字列チェック）をカバーしていなかった。設計書のエラーフロー図にバリデーションが明記されている場合、Phase 4 でそのテストも作成すべき。

### 1.3 Graceful Degradation テストの重要性

llmAdapter/resourceLoader 未注入時のフォールバック動作テストが、DI パターンの健全性検証として有効だった。今後の DI 追加時にもこのパターンを適用すべき。

## 2. 技術的教訓

### 2.1 型ガード関数の設計

`isValidPlanResponse()` で `in` 演算子 + `typeof` チェックを組み合わせた型ガードは、P49 対策として効果的。LLM レスポンスのような外部入力の検証に標準パターンとして採用すべき。

### 2.2 定数ファイルの分離

`planPromptConstants.ts` にプロンプト定数を分離したことで、テストでの参照とプロンプト変更の影響範囲の局所化が実現できた。

## 3. 改善提案（未タスク候補）

- LLM プロンプト設計チェックリストの task-specification-creator への追加
- execute/improve メソッドへの同パターン適用時の設計ガイドライン
