# Phase 7 未到達分析

## 未到達観測

- `authKeyHandlers.ts` の未到達分岐（主に異常系・バリデーション境界）が一部残存。
- `index.ts` は設定上カバレッジ除外（`**/index.ts`）で計測不能。

## 根因

1. 例外分岐の組み合わせが多く、現行テストでは全パスを網羅していない。
2. プロジェクト全体ルールで `index.ts` 系が coverage 集計対象外。

## 補完策

- 補完策-01: `authKeyHandlers.test.ts` に境界ケース（最大長超過 + 非文字列 + request null）の追加を検討。
- 補完策-02: `index.ts` の網羅はカバレッジ値ではなく統合テスト（registration lifecycle）で品質担保を継続。
- 補完策-03: 必要であれば別ジョブで `coverage.exclude` を一時上書きして `index.ts` の参考値を取得。
