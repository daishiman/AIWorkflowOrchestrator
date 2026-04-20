# Phase 2: 要件分析

## 現状の問題

`runCreateWorkflow()` の `features: []` はハードコードされており、LLM生成による意味のある機能一覧が生成されない。

## 変更要件

1. `generateFeaturesWithLlm` メソッド: `ResourceLoader.loadAgent("plan-structure")` でプロンプトを取得し、`executeScript("generate_features.js", ...)` でLLM呼び出しを行う
2. フォールバック: スクリプト失敗時は `[]` を返し、警告ログを出力する
3. `parseFeaturesResponse`: stdout のJSON配列を解析する。配列外テキストも許容する（regex でマッチ）

## 依存関係

- `ScriptExecutor.execute()`: `{ success, stdout, stderr, exitCode }` を返す
- `ResourceLoader.loadAgent()`: Markdownファイルの文字列を返す
- `generate_features.js`: Node.js ESMスクリプト、`--description`・`--agent` 引数を受け取る
