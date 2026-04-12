# Phase 6: 拡張テストケース一覧

## 追加件数

Phase 4 + Phase 5: 13 件 → Phase 6 追加: 19 件 → **合計 72 件**

## 追加テスト分類

### 英語入力・略称のフォールバック動作（6件）

| テスト名                              | 入力          | questionId | 期待値        | 備考       |
| ------------------------------------- | ------------- | ---------- | ------------- | ---------- |
| 英語入力 "myself only" フォールバック | "myself only" | q1         | "myself only" | length: 11 |
| 英語入力 "just me" フォールバック     | "just me"     | q1         | "just me"     | length: 7  |
| 英語入力 "daily" フォールバック       | "daily"       | q3         | "daily"       | length: 5  |
| 英語入力 "weekly" フォールバック      | "weekly"      | q6         | "weekly"      | length: 6  |
| 表記揺れ "自分だけ" → "自分のみ"      | "自分だけ"    | q1         | "自分のみ"    | length: 4  |
| 正準形入力 "自分のみ" 同値            | "自分のみ"    | q1         | "自分のみ"    | length: 4  |

### 異常系・境界値入力のハンドリング（5件）

| テスト名          | 入力        | 期待値      | 備考      |
| ----------------- | ----------- | ----------- | --------- |
| 数値文字列        | "123"       | "123"       | length: 3 |
| 特殊文字          | "@#$%"      | "@#$%"      | length: 4 |
| 全角スペース      | "　"        | "　"        | length: 1 |
| 全角半角混在      | "自分only"  | "自分only"  | length: 6 |
| 英数字+日本語混在 | "Daily毎日" | "Daily毎日" | length: 7 |

### applySmartDefaults 回帰テスト（8件）

| テスト名                                        | 入力               | 期待値                                                       |
| ----------------------------------------------- | ------------------ | ------------------------------------------------------------ |
| q6 format='週次' → freeText='週に1回'           | format: "週次"     | q6.freeText === "週に1回"                                    |
| who=null → q1 空選択                            | who: null          | q1.selectedOptions.length === 0                              |
| q5 tool='github' → 'GitHub'                     | tool: "github"     | q5.selectedOptions contains "GitHub"                         |
| 全フィールド一括変換                            | 全フィールド指定   | q1,q3,q5,q6 全変換確認                                       |
| q6 format='Markdown' → q6='Markdown'            | format: "Markdown" | q6.selectedOptions contains "Markdown"                       |
| q6 format='JSON' → q6='JSON'                    | format: "JSON"     | q6.selectedOptions contains "JSON"                           |
| q5 tool='Jira' → freeText='Jira'                | tool: "Jira"       | q5.freeText === "Jira"                                       |
| q5 tool='notion' → 'その他' + freeText='Notion' | tool: "notion"     | q5.selectedOptions contains "その他" / freeText === "Notion" |

## 完了条件確認

- [x] 追加後の総テスト件数が19件以上（追加19件）
- [x] 各テストに `// length: N` コメント付与（英語入力テスト）
- [x] 全72件 PASS
