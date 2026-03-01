# Phase 11 スクリプト出力スナップショット

## メタ情報

| 項目         | 値                                                                            |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001                                      |
| Phase        | 11（手動テスト）                                                              |
| 取得日       | 2026-02-28                                                                    |
| 実行コマンド | `npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts` |

## Markdown形式出力（デフォルト）

```markdown
# ハンドラ単位カバレッジレポート

**対象ファイル**: `src/main/ipc/skillHandlers.ts`
**検出ハンドラ数**: 23

| #   | チャンネル名            | 行範囲    | Line% | Branch% | Func% | 判定 |
| --- | ----------------------- | --------- | ----: | ------: | ----: | ---- |
| 1   | skill:list              | 93-118    |  92.3 |    75.0 |   0.0 | FAIL |
| 2   | skill:scan              | 121-138   | 100.0 |   100.0 |   0.0 | FAIL |
| 3   | skill:getImported       | 141-163   |  65.2 |    33.3 |   0.0 | FAIL |
| 4   | skill:import            | 166-203   | 100.0 |   100.0 | 100.0 | PASS |
| 5   | skill:remove            | 206-224   | 100.0 |   100.0 | 100.0 | PASS |
| 6   | skill:get-detail        | 227-258   |  78.1 |    50.0 |   0.0 | FAIL |
| 7   | skill:validate          | 261-289   |  82.8 |    66.7 |   0.0 | FAIL |
| 8   | skill:execute           | 292-345   |  45.3 |    25.0 |   0.0 | FAIL |
| 9   | skill:stop              | 348-371   |  41.7 |    33.3 |   0.0 | FAIL |
| 10  | skill:get-status        | 374-395   |  36.4 |    25.0 |   0.0 | FAIL |
| 11  | skill:get-logs          | 398-423   |  30.8 |    16.7 |   0.0 | FAIL |
| 12  | skill:config:get        | 426-448   |  26.1 |    16.7 |   0.0 | FAIL |
| 13  | skill:config:set        | 451-481   |  22.6 |    12.5 |   0.0 | FAIL |
| 14  | skill:config:reset      | 484-506   |  17.4 |     8.3 |   0.0 | FAIL |
| 15  | skill:analytics:get     | 509-539   |   0.0 |     0.0 |   0.0 | FAIL |
| 16  | skill:analytics:summary | 542-568   |   0.0 |     0.0 |   0.0 | FAIL |
| 17  | skill:schedule:list     | 571-596   |   0.0 |     0.0 |   0.0 | FAIL |
| 18  | skill:schedule:create   | 599-635   |   0.0 |     0.0 |   0.0 | FAIL |
| 19  | skill:schedule:update   | 638-674   |   0.0 |     0.0 |   0.0 | FAIL |
| 20  | skill:schedule:delete   | 677-699   |   0.0 |     0.0 |   0.0 | FAIL |
| 21  | skill:docs:list         | 702-727   |   0.0 |     0.0 |   0.0 | FAIL |
| 22  | skill:docs:get          | 730-755   |   0.0 |     0.0 |   0.0 | FAIL |
| 23  | skill:docs:templates    | 1045-1063 |   0.0 |     0.0 |   0.0 | FAIL |

## サマリー

- 総ハンドラ数: 23
- カバー済みハンドラ数: 14
- 平均Line Coverage: 27.7%
- 平均Branch Coverage: 20.7%
- 平均Function Coverage: 8.7%

> **注記 (P41)**: v8カバレッジプロバイダはインラインarrow function（例: `getAllowedWindows: () => [mainWindow]`）を独立した関数としてカウントします。validateIpcSenderのオプションオブジェクト内のコールバックがテスト中に実行されない場合、Function Coverageが実態より低く表示されます。Func% 0%のハンドラでLine%が高い場合はこの影響の可能性があります。詳細は06-known-pitfalls.md#P41を参照してください。
```

## JSON形式出力（--format json）

```json
{
  "filePath": "src/main/ipc/skillHandlers.ts",
  "handlers": [
    {
      "handler": {
        "channelName": "skill:list",
        "startLine": 93,
        "endLine": 118,
        "registrationFunction": "registerSkillHandlers"
      },
      "lineCoverage": 92.3,
      "branchCoverage": 75.0,
      "functionCoverage": 0.0
    },
    {
      "handler": {
        "channelName": "skill:import",
        "startLine": 166,
        "endLine": 203,
        "registrationFunction": "registerSkillHandlers"
      },
      "lineCoverage": 100.0,
      "branchCoverage": 100.0,
      "functionCoverage": 100.0
    }
  ],
  "summary": {
    "totalHandlers": 23,
    "coveredHandlers": 14,
    "averageLineCoverage": 27.7,
    "averageBranchCoverage": 20.7,
    "averageFunctionCoverage": 8.7
  },
  "p41Note": "注記 (P41): v8カバレッジプロバイダはインラインarrow function..."
}
```

## 特定ハンドラ指定出力（--target skill:import）

```
## skill:import の判定結果

- 判定: PASS
- ルール: Rule-1 (推奨達成)
- 理由: Line: 100.0%, Branch: 100.0%, Function: 100.0%

| 指標 | 値 | 最低基準 | 推奨基準 |
| --- | ---: | ---: | ---: |
| Line | 100.0% | 80% | 90% |
| Branch | 100.0% | 60% | 70% |
| Function | 100.0% | 80% | 90% |
```

## 出力の特徴

1. **Markdownテーブル**: 数値列は右寄せ（`---:`）で整列されており、可読性が高い
2. **判定列**: 各ハンドラにPASS/FAILが付与されており、一目でカバレッジ状況を把握可能
3. **サマリー**: 全体の統計情報（総ハンドラ数、カバー済み数、平均値）を集約
4. **P41注記**: Function Coverageが実態より低く表示される既知の制約について注記を表示
5. **JSON形式**: `--format json` で機械可読な形式を出力可能。CI/CD連携に適した構造
