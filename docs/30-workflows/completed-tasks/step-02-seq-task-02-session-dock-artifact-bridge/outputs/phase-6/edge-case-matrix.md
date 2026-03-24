# Edge Case Matrix - Session Dock Artifact Bridge

## 境界値一覧

| カテゴリ   | 境界値          | テスト値                | 期待動作                        |
| ---------- | --------------- | ----------------------- | ------------------------------- |
| 保持件数   | 0 件            | sessions = []           | dock open → ready state         |
| 保持件数   | 1 件            | sessions = [session]    | dock open → restore             |
| 保持件数   | 10 件 (上限)    | sessions.length === 10  | restore 正常                    |
| 保持件数   | 11 件 (超過)    | sessions.length === 11  | 最古を削除 → 10 件に            |
| 保持期間   | 0 ms (直後)     | session.createdAt = now | cleanup 対象外                  |
| 保持期間   | 23:59:59        | 24h - 1s                | cleanup 対象外                  |
| 保持期間   | 24:00:00 (境界) | 24h ちょうど            | cleanup 対象                    |
| transcript | 0 entries       | entries = []            | 「ログはありません」表示        |
| transcript | 1 entry         | entries.length === 1    | 正常表示                        |
| transcript | 1000+ entries   | 大量 entries            | 仮想スクロール or 折りたたみ    |
| artifact   | 0 件            | artifacts = []          | 「成果物はありません」表示      |
| artifact   | 1 件            | artifacts.length === 1  | Artifact Summary 表示           |
| artifact   | 100+ 件         | 大量 artifacts          | スクロール可能リスト            |
| share text | 空文字          | ""                      | share ボタン disabled           |
| share text | 1 文字          | "a"                     | share 可能                      |
| share text | 10000 文字      | 長文                    | truncation or 全文送信          |
| session ID | null            | sessionId = null        | session 未開始状態              |
| session ID | UUID v4         | 正常な ID               | 正常動作                        |
| exit code  | 0               | 正常終了                | → done state                    |
| exit code  | 1               | エラー終了              | → aborted state                 |
| exit code  | -1 (SIGTERM)    | 強制終了                | → aborted state                 |
| exit code  | null            | 不明                    | → aborted state (unknown error) |
