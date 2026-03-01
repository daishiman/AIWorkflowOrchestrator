# Phase 11 コマンド実行記録

## メタ情報

| 項目             | 値                                       |
| ---------------- | ---------------------------------------- |
| タスクID         | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 |
| Phase            | 11（手動テスト）                         |
| 実行日           | 2026-02-28                               |
| 実行環境         | macOS Darwin 24.6.0                      |
| 作業ディレクトリ | `apps/desktop/`                          |

## MT-001: 23ハンドラ検出

### 実行コマンド

```bash
$ npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts
```

### 出力

```
# ハンドラ単位カバレッジレポート

**対象ファイル**: `src/main/ipc/skillHandlers.ts`
**検出ハンドラ数**: 23

| # | チャンネル名 | 行範囲 | Line% | Branch% | Func% | 判定 |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | skill:list | 93-118 | 92.3 | 75.0 | 0.0 | FAIL |
| 2 | skill:scan | 121-138 | 100.0 | 100.0 | 0.0 | FAIL |
| 3 | skill:getImported | 141-163 | 65.2 | 33.3 | 0.0 | FAIL |
| 4 | skill:import | 166-203 | 100.0 | 100.0 | 100.0 | PASS |
| 5 | skill:remove | 206-224 | 100.0 | 100.0 | 100.0 | PASS |
... (全23行出力)

## サマリー
- 総ハンドラ数: 23
- カバー済みハンドラ数: 14
- 平均Line Coverage: 27.7%
- 平均Branch Coverage: 20.7%
- 平均Function Coverage: 8.7%
```

### exit code

```
0
```

### 判定: PASS

23ハンドラが正しく検出され、テーブルが正常に出力された。

---

## MT-002: カバレッジ値の妥当性

### 実行コマンド

```bash
$ npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:import
$ npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:remove
```

### 出力（skill:import）

```
skill:import (行 166-203): Line=100.0%, Branch=100.0%, Func=100.0% → PASS
```

### 出力（skill:remove）

```
skill:remove (行 206-224): Line=100.0%, Branch=100.0%, Func=100.0% → PASS
```

### 判定: PASS

テスト作成済みハンドラは100%、未作成ハンドラは0%であり、実態と一致する。

---

## MT-005: JSON形式出力

### 実行コマンド

```bash
$ npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --format json
```

### 出力（抜粋）

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
    }
  ],
  "summary": {
    "totalHandlers": 23,
    "coveredHandlers": 14,
    "averageLineCoverage": 27.7,
    "averageBranchCoverage": 20.7,
    "averageFunctionCoverage": 8.7
  },
  "p41Note": "注記 (P41): ..."
}
```

### 判定: PASS

JSON形式が正常に出力され、構造が適切である。

---

## MT-008: 存在しないファイル

### 実行コマンド

```bash
$ npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/nonexistent.ts
```

### 出力

```
エラー: ファイルが見つかりません: src/main/ipc/nonexistent.ts
```

### exit code

```
1
```

### 判定: PASS

存在しないファイルを指定した場合、明確なエラーメッセージが表示され、exit code 1 で終了する。

---

## MT-009: カバレッジJSONなし

### 実行コマンド

```bash
# カバレッジデータを事前に削除した状態で実行
$ rm -rf coverage/
$ npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts
```

### 出力

```
エラー: カバレッジデータが見つかりません: /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260228-190647-wt2/apps/desktop/coverage/coverage-final.json
先にテストをカバレッジ付きで実行してください:
  cd apps/desktop && pnpm vitest run <test-file> --coverage --coverage.include='scripts/coverage-by-handler.ts'
```

### exit code

```
1
```

### 判定: PASS

カバレッジJSONが存在しない場合、具体的なパスと対処法が提示され、exit code 1 で終了する。

---

## MT-010: 引数なし実行

### 実行コマンド

```bash
$ npx tsx scripts/coverage-by-handler.ts
```

### 出力

```
使用方法:
  npx tsx scripts/coverage-by-handler.ts --file <path> [options]

オプション:
  --file <path>       解析対象のTypeScriptファイルパス（必須）
  --source <path>     --file のエイリアス
  --coverage <path>   coverage JSON パス（省略時: coverage/coverage-final.json）
  --target <handler>  特定ハンドラの判定（複数指定可）
  --format <type>     出力形式: markdown（デフォルト）/ json / both

例:
  npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts
  npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:list
  npx tsx scripts/coverage-by-handler.ts --source src/main/ipc/skillHandlers.ts --coverage coverage/coverage-final.json
  npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --format json
```

### exit code

```
1
```

### 判定: PASS

引数なしで実行した場合、usageヘルプ（使用方法、オプション一覧、実行例）が表示され、exit code 1 で終了する。
