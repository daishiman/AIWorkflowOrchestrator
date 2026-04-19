# Implementation Guide

## Part 1: 中学生向けの説明

このタスクは、「受付で受ける仕事の一覧表」が途中で変わってもすぐ気づけるようにする作業です。  
お店の受付に、受けられる依頼が 6 個あるとします。もし 1 個増えたり、同じ依頼を 2 回書いてしまったりしても、見張る仕組みがなければ後で混乱します。  
今回の `registration snapshot` テストは、その一覧表を毎回見比べて「増えた」「減った」「重なった」をすぐ見つけるための確認表です。

なぜ必要か:

- IPC 登録は renderer と main の約束そのものだから
- 一覧が変わっても、全体テストだけではどこで壊れたか見つけにくいから
- `register*Handlers()` ごとに fail-fast にした方が修正が速いから

何をしたか:

- `registerLLMHandlers()` 用の snapshot テストを追加した
- 期待チャンネル数を `6` に確定した
- snapshot ファイルを追加し、一覧表の正本を固定した
- Phase 1/2 の棚卸し文書に `registerChatExportHandlers()` を追加し、母集団漏れを補正した

## Part 2: 技術者向け詳細

### 対象母集団

- 正本: `apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers()` から直接呼ばれる registration unit
- 本レビューで `registerChatExportHandlers()` の欠落を補正し、direct unit 数を 48 に修正した

### 契約

| 契約        | 内容                                            |
| ----------- | ----------------------------------------------- |
| `REG-SNAP`  | ソート済みチャンネル一覧が snapshot と一致する  |
| `REG-DEDUP` | `Set(handles).size === handles.length` を満たす |
| `REG-COUNT` | 実装で登録されるチャンネル総数と一致する        |

### 今回の LLM 実装

```ts
expect([...handles].sort()).toMatchSnapshot();
expect(new Set(handles).size).toBe(handles.length);
expect(handles).toHaveLength(6);
```

### LLM の登録チャンネル

- `llm:get-providers`
- `llm:set-selected-config`
- `llm:check-health`
- `llm:send-chat`
- `llm:stream-chat`
- `llm:stream-cancel`

### 命名規則

- テスト: `*Handlers.registrationSnapshot.test.ts`
- snapshot: `__snapshots__/*.snap`

### 使用コマンド

```bash
ESBUILD_BINARY_PATH=/absolute/path/to/node_modules/.pnpm/@esbuild+darwin-arm64@0.21.5/node_modules/@esbuild/darwin-arm64/bin/esbuild \
pnpm --dir apps/desktop exec vitest run src/main/ipc/__tests__/llmHandlers.registrationSnapshot.test.ts --reporter=verbose
```

### エラーハンドリング / エッジケース

- デフォルト環境では `esbuild` host/binary mismatch が出るため、現時点では `ESBUILD_BINARY_PATH` 固定が必要
- mixed/on-only handler は今回未追加。将来追加時は `ipcMain.on` 捕捉戦略を別途明記する
- Wave 1 未完了のため、Phase 10 判定は `MAJOR`

### 設定可能パラメータ / 定数

- 期待チャンネル数: `6`
- snapshot 対象: ソート済み `handles`
- 実行コマンド: `ESBUILD_BINARY_PATH=... pnpm --dir apps/desktop exec vitest run ...`

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要
代替証跡: `outputs/phase-10/final-review-result.md` と
`outputs/phase-11/manual-test-result.md`
