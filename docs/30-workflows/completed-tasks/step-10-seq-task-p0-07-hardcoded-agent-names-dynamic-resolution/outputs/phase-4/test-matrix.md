# test-matrix.md — Phase 4 成果物

## AgentNameResolver テストマトリクス

### AC-1: ハードコード参照がゼロ

| #   | テスト名                                      | 期待結果                                   |
| --- | --------------------------------------------- | ------------------------------------------ |
| 1   | PLAN_PROMPT_CONSTANTS に AGENT_NAMES がない   | コンパイルエラーなし、grep で定数参照 0 件 |
| 2   | IMPROVE_PROMPT_CONSTANTS に AGENT_NAME がない | 同上                                       |

### AC-2: ManifestLoader.extractAgentConfig

| #   | テスト名                                     | 期待結果                     |
| --- | -------------------------------------------- | ---------------------------- |
| 3   | agent kind リソースが 3 件の manifest → 3 ID | `{ names: ["a", "b", "c"] }` |
| 4   | agent kind リソースが 1 件の manifest → 1 ID | `{ names: ["x"] }`           |

### AC-3: フォールバック

| #   | テスト名                                              | 期待結果                                     |
| --- | ----------------------------------------------------- | -------------------------------------------- |
| 5   | manifest に agent リソース 0 件 → デフォルト名返却    | `{ names: DEFAULT_PLAN_AGENT_NAMES }` と等価 |
| 6   | resolveFromRequests にエージェントのみの配列 → 全 ID  | `{ names: ["discover-problem", ...] }`       |
| 7   | resolveFromRequests に reference 混在 → agent ID のみ | kind==="agent" のみフィルタ                  |
| 8   | resolveFromRequests に空配列 → 空の names             | `{ names: [] }`                              |

### AC-4: 異なる agent 構成

| #   | テスト名                                            | 期待結果                              |
| --- | --------------------------------------------------- | ------------------------------------- |
| 9   | agent ID が ["custom-a", "custom-b"] のマニフェスト | `{ names: ["custom-a", "custom-b"] }` |
| 10  | agent ID が全て重複なく正しく解決される             | 順序維持、重複なし                    |

### AC-5: 後方互換（既存テスト pass）

| #   | テスト名                                                      | 期待結果     |
| --- | ------------------------------------------------------------- | ------------ |
| 11  | plan() legacy path: loadAgent("discover-problem") が呼ばれる  | 3 回呼び出し |
| 12  | improve() legacy path: loadAgent("improve-prompt") が呼ばれる | 1 回呼び出し |

### AC-6: テスト網羅性

| #   | テスト名                                        | 期待結果 |
| --- | ----------------------------------------------- | -------- |
| 13  | resolveFromManifest — agent あり                | pass     |
| 14  | resolveFromManifest — agent なし/フォールバック | pass     |
| 15  | resolveFromRequests — 通常                      | pass     |
| 16  | resolveFromRequests — 空                        | pass     |
| 17  | ManifestLoader.extractAgentConfig               | pass     |

## 完了宣言

全 AC に対するテストケースが定義された（17 ケース）。
