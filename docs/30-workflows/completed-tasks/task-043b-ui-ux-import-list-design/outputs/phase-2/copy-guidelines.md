# Phase 2 文言ガイド

## 固定文言

| 種別                 | 文言                                     |
| -------------------- | ---------------------------------------- |
| imported heading     | `インポート済み`                         |
| available heading    | `利用可能なスキル`                       |
| CTA                  | `追加する`                               |
| progress             | `追加中...`                              |
| success              | `{{skillName}} を追加しました`           |
| error suffix         | `もう一度試してみてください。`           |
| imported empty       | `まだ追加済みのスキルはありません。`     |
| available empty      | `追加できるスキルはありません。`         |
| no-result            | `検索条件に一致するスキルはありません。` |
| description fallback | `説明はありません`                       |

## 文言ルール

- skill 名は英字原文を維持する
- 操作語は `インポート` より `追加` を優先し、list view の認知負荷を下げる
- error は原因 + 再試行誘導の 2 要素で構成する
