# Implementation Guide

## Part 1: 中学生向けの説明

このタスクは、「受付で受ける仕事の一覧表」がこっそり変わっていないかを見張る仕組みを広げる作業です。

学校の係ごとに「この人はこの仕事を受ける」と表を作っていたとして、仕事が1個増えたり、同じ仕事が2回入ったりすると混乱します。今回の snapshot test は、その表を毎回見比べて「増えた」「減った」「重なった」をすぐ見つける見張り番です。

なぜ必要か:

- IPC 登録は renderer と main の約束そのものだから
- 一覧の変化を handler 単位で fail-fast にした方が壊れた場所を早く特定できるから
- main IPC 全体の守りを、特定の1関数だけでなく広い範囲へ広げる必要があったから

今回やったこと:

- Wave 1 の direct handler 7件に registration snapshot を導入
- Wave 2 の direct handler 16件に registration snapshot を導入
- 既存の `registerRuntimeSkillCreatorHandlers` 用 snapshot は auxiliary として維持
- Wave 3 の 25件は、後で安全に進めるための調査メモを残した

## Part 2: 技術者向け詳細

### 対象母集団

- direct 正本: `apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers()` から直接呼ばれる registration unit 48件
- auxiliary: `registerRuntimeSkillCreatorHandlers` 用の既存 snapshot 1件
- 2026-04-20 時点の実ファイル数: 24
- 2026-04-20 時点の実テスト数: 121

### 契約

| 契約        | 内容                                     |
| ----------- | ---------------------------------------- |
| `REG-SNAP`  | 登録チャンネル一覧が snapshot と一致する |
| `REG-DEDUP` | 重複登録がない                           |
| `REG-COUNT` | 登録数が期待値と一致する                 |

### 実装範囲

| 区分          | 件数 | 状態             |
| ------------- | ---: | ---------------- |
| Wave 1 direct |    7 | 完了             |
| Wave 2 direct |   16 | 完了             |
| Wave 3 direct |   25 | 未着手、計画のみ |
| auxiliary     |    1 | 維持             |

### 実行方法

この環境では 24 files 一括実行が `SIGKILL` したため、正本手順は wave split + single-fork。

```bash
ESBUILD_BINARY_PATH=<repo>/node_modules/.pnpm/esbuild@0.21.5/node_modules/@esbuild/darwin-arm64/bin/esbuild \
VITEST_MAX_FORKS=1 \
VITEST_FILE_PARALLELISM=false \
pnpm --dir apps/desktop exec vitest run <wave files> --reporter=dot
```

### 実測結果

| wave   | files | tests | 判定 | Vitest duration | tests time |
| ------ | ----: | ----: | ---- | --------------- | ---------- |
| Wave 1 |     8 |    41 | PASS | 197.79s         | 17.40s     |
| Wave 2 |    16 |    80 | PASS | 112.26s         | 8.91s      |

### 例外扱い

| 対象                                           | 扱い                                              |
| ---------------------------------------------- | ------------------------------------------------- |
| `setupThemeWatcher`                            | watcher のため snapshot 分母から除外              |
| auth/profile/avatar/conversation fallback      | fallback handler のため direct 分母から除外       |
| `creatorHandlers.registrationSnapshot.test.ts` | nested runtime registration を守る auxiliary 証跡 |

### Wave 3 の残件

- 難所と優先順位は `outputs/phase-6/wave3-prereq-check.md`
- coverage 上の位置づけは `outputs/phase-7/coverage-report.md`

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要
代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`
