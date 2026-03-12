# Drift Guard 契約

## 対象 drift

| drift class  | 検出対象                                           | fail 条件                                                     | warning 条件                                  | 記録先                            |
| ------------ | -------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------- | --------------------------------- |
| path drift   | task-060 / task-000 / system spec / capture script | required path 不在、forbidden path 残存、リンク先ファイル不在 | 参照説明はあるが補助注記が不足                | guard JSON、Phase 6/9 レポート    |
| status drift | completed-task pointer docs / task-090             | `未着手` または `pending` が残存                              | status 文字列が workflow 実体と完全一致しない | guard JSON、Phase 6 failure-cases |
| mirror drift | `.claude` vs `.agents`                             | `diff -qr` が 1 件以上                                        | なし                                          | command transcript、Phase 9/12    |

## CLI 契約

```json
{
  "ok": true,
  "summary": {
    "pathDrift": 0,
    "statusDrift": 0,
    "mirrorDrift": 0
  },
  "findings": [
    {
      "type": "path-drift",
      "file": "docs/...",
      "expected": "docs/30-workflows/completed-tasks/...",
      "actual": "./task-058b-ui-04a-workspace-layout-filebrowser.md"
    }
  ]
}
```

## 判定規則

1. `ok=true` は `pathDrift=0` かつ `statusDrift=0` かつ `mirrorDrift=0` のときだけ返す。
2. parent pointer と master index は「実在パスを指す」ことを優先し、表示文言差は fail にしない。
3. status drift は厳密な英単語統一を要求しない。`pending` と `未着手` の残存だけを fail とする。
4. mirror drift は `diff -qr .claude/skills .agents/skills` を直接実行し、差分行数で判定する。

## 実行順

1. path drift check
2. status drift check
3. mirror drift check
4. JSON / text report 出力

## フェーズ接続

- Phase 4: red case は drift class ごとに 1 系統ずつ作る
- Phase 5: known stale path を修正した後に guard を green 化する
- Phase 6: false positive / false negative を棚卸しする
- Phase 12: 同じコマンドを documentation changelog と compliance check に記録する
