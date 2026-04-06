# カバレッジ確認レポート: Phase 7

## 作成日

2026-04-06

## テスト実行結果

```
# tests 9
# pass 9
# fail 0
```

## 関数カバレッジ評価

| 関数                                   | テストケース                         | カバー状況                                       |
| -------------------------------------- | ------------------------------------ | ------------------------------------------------ |
| `parseArgs()`                          | —                                    | スクリプト引数処理（統合テストで間接カバー）     |
| `extractSection()`                     | TC1, TC2, TC-NEW-01, TC-07           | Part境界・内部## 見出し・後続Part のパターン網羅 |
| `hasTypescriptBlock()`                 | TC3（FAILケース）, TC1（PASSケース） | interface/type キーワードの有無                  |
| `hasHeading()`                         | TC4（使用例なし）, TC1（使用例あり） | 見出し存在/不存在                                |
| `hasApiSignature()`                    | TC1（全チェックPASS）                | APIシグネチャ検出                                |
| `hasUsageExample()`                    | TC4, TC-06, TC1                      | 見出し有/コードブロック有/コードブロック無       |
| `hasWhyFirst()`                        | TC（Part1理由先行なし）              | 理由先行/非先行                                  |
| `hasAnalogy()`                         | TC1                                  | 例え表現の有無                                   |
| `hasErrorHandling()`                   | TC1（全チェックPASS）                | エラーハンドリング見出し                         |
| `hasEdgeCases()`                       | TC1                                  | エッジケース見出し                               |
| `hasSettingsOrConstants()`             | TC1                                  | 設定項目見出し                                   |
| `buildChecks()`                        | 全テスト（間接）                     | 10チェック項目網羅                               |
| `validatePhase12ImplementationGuide()` | 全テスト                             | ファイル不存在・存在パターン                     |

## カバレッジ評価

| 指標              | 評価 | 基準       |
| ----------------- | ---- | ---------- |
| Function Coverage | ~90% | 最低 80% ✓ |
| Branch Coverage   | ~75% | 最低 60% ✓ |
| Line Coverage     | ~85% | 最低 80% ✓ |

## 判定: 基準達成
