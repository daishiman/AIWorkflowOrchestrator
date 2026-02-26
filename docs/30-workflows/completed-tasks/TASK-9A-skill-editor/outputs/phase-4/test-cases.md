# Phase 4 テストケース

| 区分       | ケース                     | 期待値                                    |
| ---------- | -------------------------- | ----------------------------------------- |
| Utility    | getLanguage 拡張子判定     | 言語IDが正しい                            |
| Utility    | buildFileTree カテゴリ分類 | root/agents/references/other が構築される |
| Editor     | 初期表示                   | `SKILL.md` を自動読込                     |
| Editor     | ファイル選択               | `readFile` 引数が正しい                   |
| Editor     | 保存                       | `writeFile` 呼び出し成功                  |
| Editor     | 未保存警告                 | ダイアログが表示される                    |
| Editor     | readonly                   | 保存/作成/削除が無効                      |
| Editor     | バックアップ復元           | `restoreBackup` 呼び出し成功              |
| A11y       | tree キー操作              | ArrowDown で次ノードにフォーカス          |
| CodeEditor | Tab挿入                    | 2スペース挿入される                       |

## 実測結果

- 新規UIテスト: 15/15 PASS
- 関連回帰: 164/164 PASS
