# Phase 6: テスト拡充 - 成果物

## 追加テストケース

| テストスイート | テスト名                     | 内容                                                 |
| -------------- | ---------------------------- | ---------------------------------------------------- |
| エッジケース   | 空文字 -> null               | 空文字入力の処理                                     |
| エッジケース   | 空白のみ -> null             | 空白文字のみの入力                                   |
| エッジケース   | prefix完全一致               | "gpt-" のみでもopenaiに解決                          |
| エッジケース   | 大文字小文字                 | case-sensitiveで不一致はnull                         |
| OpenRouter形式 | provider/model -> openrouter | 4パターン                                            |
| OpenRouter形式 | スラッシュ優先               | OpenRouterのspecialMatcherが先に評価                 |
| 競合検証       | prefix誤マッチ防止           | 各プロバイダーの prefix が他のモデルIDにマッチしない |
| 競合検証       | prefix包含関係なし           | prefix間で包含関係がない                             |

## テスト結果

- Tests: 18 passed (18)
- 回帰: provider.test.ts 全 PASS
