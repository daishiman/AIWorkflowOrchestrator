# Phase 8 リファクタリング計画

## 目的

list branch がさらに肥大化した場合に、仕様を崩さず安全に抽出する。

## 抽出候補

| 候補              | 条件                                           | いまの判定   |
| ----------------- | ---------------------------------------------- | ------------ |
| toolbar           | search / status / create を 70 行超で持つ      | 将来抽出候補 |
| imported section  | card list + empty + count が独立責務           | 将来抽出候補 |
| available section | row list + CTA + empty が独立責務              | 将来抽出候補 |
| status region     | success / error / delete error が 3 種を超える | 将来抽出候補 |

## rollback 単位

1. view helpers のみ抽出
2. section component 抽出
3. test fixture helper 抽出

## 今回の判断

- まだ 1 ファイル内の可読性を維持できるため大規模分割は見送り
- 代わりに helper 関数で nullish / query / resource count を分離
