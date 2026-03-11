# テストケース一覧

| TC-ID        | 種別           | 対象                | 期待結果                                   |
| ------------ | -------------- | ------------------- | ------------------------------------------ |
| TC-04-01     | route/nav      | Skill Center        | 一次導線ガイドが表示される                 |
| TC-04-02     | route/nav      | Agent               | 実行入口が nav から一意に分かる            |
| TC-04-03     | contract       | legacy alias        | skill-center -> skillCenter へ正規化される |
| TC-04-04     | responsibility | Skill Center        | 実行本体を持たず入口説明に集中する         |
| TC-04-05     | responsibility | Settings            | 公開シェル例外として維持される             |
| TC-04-06     | advanced       | Skill Create Wizard | 主要導線の代替ではなく補助導線として残る   |
| TC-04-07     | downstream     | Task02-05           | 入出力 / 禁止事項が参照できる              |
| TC-11-01..06 | manual         | representative UI   | 各 screenshot が取得される                 |
