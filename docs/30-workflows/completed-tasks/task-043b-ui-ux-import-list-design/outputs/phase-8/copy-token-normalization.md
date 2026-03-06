# Phase 8 文言正規化ルール

| token              | 値                             | 用途                     |
| ------------------ | ------------------------------ | ------------------------ |
| `headingImported`  | `インポート済み`               | section heading          |
| `headingAvailable` | `利用可能なスキル`             | section heading          |
| `ctaAdd`           | `追加する`                     | row CTA / dialog confirm |
| `ctaAdding`        | `追加中...`                    | progress                 |
| `msgSuccess`       | `{{skillName}} を追加しました` | status                   |
| `msgRetry`         | `もう一度試してみてください。` | alert suffix             |
| `msgNoDescription` | `説明はありません`             | fallback                 |

## 運用

- 同一意味で `インポート` と `追加` を混在させない
- list view では `追加` を優先
- error suffix は panel / dialog で共通化
