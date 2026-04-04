# TASK-RT-05-TEST-RERUN 実装ガイド

## Part 1: やさしい説明（中学生レベル）

### なぜこの作業が必要だったの？

想像してみてください。引っ越しをして新しい家に住み始めたとき、電気がつかなかったとします。家電製品（テレビ、冷蔵庫、電子レンジ）は全部ちゃんと持ってきたのに、コンセントに差しても動かない。原因は、電力会社の配線トラブルでした。

これと同じことがソフトウェア開発で起きました：

- **家電製品** = テストプログラム（ちゃんと書いてあるコード）
- **電気がつかない** = esbuild という道具の不具合で、テストを動かすプログラム (Vitest) が起動できない
- **電力会社が修理してくれた** = UT-RT-06 という別の作業で道具の不具合が直った

電気が復旧したので、改めて全部の家電を動かして「ちゃんと動くね！」と確認する作業が、このタスクです。

### 何をしたの？

1. **電気の確認**: テスト実行環境が正常に動くか確認した
2. **家電を全部テスト**: Engine テスト（39個）と Renderer テスト（35個）を動かして全部動くことを確認した
3. **記録の更新**: 「まだ確認できていません」と書いてあった記録を「確認完了！」に書き換えた

## Part 2: 技術者レベル

### 背景

TASK-RT-05（multi_select-user-input-kind）の実装は Phase 5 で完了済みだったが、esbuild の darwin-arm64/darwin-x64 platform mismatch により Vitest が起動できず、Phase 9（品質保証）と Phase 10（最終レビュー）が環境ブロックで未完了のまま残っていた。

UT-RT-06 で esbuild 環境修正が施されたため、TASK-RT-05-TEST-RERUN としてクリーンな環境で再実行を実施した。

### esbuild platform mismatch の発生原因と解消

- **原因**: pnpm worktree 環境で darwin-arm64 用の esbuild バイナリがインストールされた状態で darwin-x64 の Node.js から実行しようとした際に platform mismatch が発生
- **解消**: UT-RT-06 で修正後、`pnpm install` によりクリーンな状態で依存関係を再インストール。`pnpm --filter @repo/shared build` で shared パッケージをビルドし、モジュール解決を完了
- **追加注意**: renderer テストは `apps/desktop` を cwd にして実行する。repo root から `apps/desktop/...` を直接指定すると `setupFiles` 解決がずれ、`toBeDisabled` / `toBeChecked` の false negative が出る

### テスト実行結果

| テスト    | コマンド                                                                                                                                         | 結果                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| Engine    | `cd apps/desktop && pnpm exec vitest run src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts --reporter=verbose`              | 39 PASS / 0 FAIL             |
| Renderer  | `cd apps/desktop && pnpm exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx --reporter=verbose` | 35 PASS / 0 FAIL             |
| typecheck | `pnpm typecheck`                                                                                                                                 | PASS (0 errors)              |
| lint      | `pnpm lint`                                                                                                                                      | PASS (0 errors, 10 warnings) |

### 型定義と契約

```ts
export type SkillCreatorUserInputKind =
  | "single_select"
  | "multi_select"
  | "free_text"
  | "secret"
  | "confirm";

export interface SkillCreatorUserInputSubmission {
  planId: string;
  requestId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  selectedValues?: string[];
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}
```

`multi_select` は `selectedOptionIds` を必須にし、engine 側で option id の存在チェックを行う。UI 側では `ConversationalInterview` が state を保持し、`SkillLifecyclePanel` は host と IPC 呼び出しの境界を担当する。

### API / CLI シグネチャ

```ts
submitUserInput?: (
  submission: SkillCreatorUserInputSubmission,
) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;
```

```bash
cd apps/desktop && pnpm exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx --reporter=verbose
cd apps/desktop && pnpm exec vitest run src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts --reporter=verbose
pnpm typecheck
pnpm lint
```

### 使用例

```ts
await window.electronAPI.skillCreator.submitUserInput({
  planId: "plan-001",
  requestId: "req-multi-2",
  selectedOptionIds: ["feat-a", "feat-b"],
});
```

### エラーハンドリングとエッジケース

- `selectedOptionIds` が空配列または `undefined` の場合、engine は `selectedOptionIds is required` を throw する
- `selectedOptionIds` に未定義 option id が混入した場合、engine は `selectedOptionIds is invalid` を throw する
- `request.kind` 切替時は `ConversationalInterview` が入力 state を reset し、前の multi_select 選択を持ち越さない
- repo root 実行で renderer テストが誤失敗した場合は、まず `apps/desktop` 起点へ切り替えて再実行し、false negative を除外してから close-out 判定する

### 設定可能なパラメータと定数

| 項目                | 値 / 例                | 用途                               |
| ------------------- | ---------------------- | ---------------------------------- |
| `planId`            | `plan-001`             | workflow 実体の識別子              |
| `requestId`         | `req-multi-2`          | awaitingUserInput と回答の対応付け |
| `selectedOptionIds` | `["feat-a", "feat-b"]` | multi_select 回答 payload          |
| `requestedAt`       | ISO8601 文字列         | UI snapshot の監査時刻             |
| `kind`              | `multi_select`         | 入力 UI と validation 分岐         |

### 更新したドキュメント

| ファイル                                                                                                                        | 変更内容                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-9/quality-report.md`       | 「環境ブロック」→「PASS」、`apps/desktop` 起点の 39/35 PASS を追記                 |
| `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-10/final-review-result.md` | AC-4「要再確認」→「PASS」、Validation「環境ブロック」→「PASS」、総合判定「PASS」   |
| `docs/30-workflows/task-rt-05-test-rerun-ac4/outputs/phase-9/test-results.md`                                                   | repo root 実行の false negative を除外し、正本コマンドを `apps/desktop` 起点へ修正 |
| `docs/30-workflows/task-rt-05-test-rerun-ac4/outputs/phase-12/system-spec-update-summary.md`                                    | `SKILL.md` は review/no-op 記録へ是正                                              |

### AC 充足状況

| AC   | 結果 | 根拠                                                                           |
| ---- | ---- | ------------------------------------------------------------------------------ |
| AC-1 | PASS | Engine 39 件 PASS (閾値: 4 件以上)                                             |
| AC-2 | PASS | Renderer 35 件 PASS (閾値: 5 件以上)                                           |
| AC-3 | PASS | 既存 4 kind 非破壊確認 (Engine 全件 PASS + Renderer single_select テスト PASS) |
| AC-4 | PASS | quality-report.md を「PASS」状態に更新完了                                     |
| AC-5 | PASS | final-review-result.md の AC-4 を「PASS」に更新完了                            |
