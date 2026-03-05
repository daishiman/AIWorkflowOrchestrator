# Phase 7 改善バックログ（Phase 8引き継ぎ）

| ID         | 優先度 | 対応内容                                                      |
| ---------- | ------ | ------------------------------------------------------------- |
| COV-REF-01 | 中     | CardGridのArrowUp/default分岐テスト追加                       |
| COV-REF-02 | 中     | matchMedia `addListener` フォールバック分岐テスト追加         |
| COV-REF-03 | 低     | SearchFilterListのrenderCard/listフォールバック境界ケース追加 |
| COV-REF-04 | 低     | MasterDetailLayoutのSSRガード分岐テスト追加                   |

## 期待効果

- Branch coverage 85%超への底上げ。
- 分岐仕様を明確化し、リファクタ時の回帰耐性を強化。
