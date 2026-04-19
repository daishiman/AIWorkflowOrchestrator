# Phase 3: 設計

## クラス設計

### `generateFeaturesWithLlm(description, signal?): Promise<string[]>`

1. `this.resourceLoader.loadAgent("plan-structure", { signal })` でプロンプトを読み込む
2. `this.executeScript("generate_features.js", ["--description", description, "--agent", agentContent], signal)` を実行
3. `result.success` が false なら例外スロー
4. `this.parseFeaturesResponse(result.stdout)` でパース
5. 例外時は `this.logger.warn(...)` を呼び、`[]` を返す

### `parseFeaturesResponse(response): string[]`

1. `response.match(/\[[\s\S]*?\]/)` でJSON配列を抽出
2. マッチなし → Error をスロー
3. `JSON.parse(match[0])` でパース
4. 配列でない or 空配列 → Error をスロー
5. `string` 型かつ非空の要素のみをフィルタして返す

## `generate_features.js` 設計

- `--description` 必須引数
- Claude CLIが利用可能な場合は呼び出す
- script 失敗時は service 側で `[]` にフォールバック
- stdout に JSON配列を出力
