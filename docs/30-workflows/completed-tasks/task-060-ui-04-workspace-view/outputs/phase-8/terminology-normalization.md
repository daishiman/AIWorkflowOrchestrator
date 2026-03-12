# Phase 8 Terminology Normalization

## 正本用語

| 用語                 | 正本           | 補足                                     |
| -------------------- | -------------- | ---------------------------------------- |
| parent task          | 親参照仕様     | 実装責務を持たない                       |
| child workflow       | child workflow | 実装と実証跡の保持先                     |
| canonical path       | canonical path | completed-tasks 側を指す                 |
| spec only status     | `spec_created` | 実装コードなしの完了状態                 |
| evidence inheritance | evidence 継承  | 親が child screenshot を継承確認すること |

## 禁止した曖昧化

- 「親が child の状態を管理する」
- 「parent UI 実装」
- 「current path でも completed path でもよい」
