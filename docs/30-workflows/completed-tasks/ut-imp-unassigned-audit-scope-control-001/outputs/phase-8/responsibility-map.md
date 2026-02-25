# Phase 8 責務分割図

## 関数責務

| 関数                 | 責務                                    |
| -------------------- | --------------------------------------- |
| `parseArgs`          | CLI入力解析・基本バリデーション         |
| `resolveScope`       | target/diff から current 対象集合を生成 |
| `classifyViolations` | current/baseline への分類               |
| `main`               | 監査実行、要約生成、exit code 決定      |

## 期待効果

- 今後 `scope` 条件追加時に `resolveScope` だけを拡張可能。
