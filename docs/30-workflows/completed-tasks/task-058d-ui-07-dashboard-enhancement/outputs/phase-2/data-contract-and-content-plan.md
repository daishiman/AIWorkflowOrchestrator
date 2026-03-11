# Phase 2 成果物: データ契約・サジェスチョン設計

## 入力 state

| データ           | 取得元                                         | 用途               |
| ---------------- | ---------------------------------------------- | ------------------ |
| `dashboardStats` | `useAppStore((state) => state.dashboardStats)` | サジェスチョン分岐 |
| `activityFeed`   | `useAppStore((state) => state.activityFeed)`   | タイムライン       |
| `isLoading`      | `useAppStore((state) => state.isLoading)`      | loading 表示       |
| `displayName`    | `useDisplayName()`                             | 挨拶文             |

## サジェスチョン導出

| 条件                         | 優先 CTA                                    |
| ---------------------------- | ------------------------------------------- |
| `activityFeed.length === 0`  | `skillCenter`, `workspace`, `agent`         |
| `dashboardStats.pending > 0` | `agent`, `historySearch`, `workspace`       |
| 通常                         | `workspace`, `skillCenter`, `historySearch` |

## 文言ルール

- 画面タイトルは「ホーム」
- サジェスチョン見出しは「おすすめの次のステップ」
- `dashboard` という語は画面内表示から排除する

## 非採用案

- `BookOpen` 相当の「使い方を見る」CTA: 既存 view がないため不採用
- 新規 store 追加: 既存データで十分なため不採用
