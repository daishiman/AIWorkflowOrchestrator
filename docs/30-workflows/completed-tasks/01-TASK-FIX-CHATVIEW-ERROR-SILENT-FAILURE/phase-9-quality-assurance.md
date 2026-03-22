# Phase 9: 品質検証

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 9                                       |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-8-refactoring.md`                |

## 目的

Lint・TypeScript型チェック・全テストを実行し、コードが品質基準を満たしていることを確認する。全ての検証をパスした後に Phase 10 へ進む。

## 実行タスク

- Task 1: Lint / typecheck / test を実行して Task 01 実装の品質を確認する。
- Task 2: 変更ファイルが Task 01 の責務境界内に収まっているか確認する。
- Task 3: Task 2〜4 の先行実装ファイルは回帰確認に留める。

### Task 1: ESLint 実行

```bash
pnpm --filter @repo/desktop lint
```

エラーが出た場合は修正する。`--no-verify` は使用禁止。

### Task 2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

型エラーが出た場合は修正する。`@ts-ignore` / `@ts-expect-error` の使用は理由コメント必須。

### Task 3: 全テスト実行

```bash
pnpm --filter @repo/desktop test
```

全テストが PASS することを確認する。失敗したテストは `.skip` を使わずに修正する。

### Task 4: 変更ファイルの確認

```bash
git diff --stat
```

変更されたファイルが以下の3ファイル（+テストファイル）であることを確認する:

| ファイル                                                     | 変更内容                             |
| ------------------------------------------------------------ | ------------------------------------ |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`        | chatError state + clearChatError追加 |
| `apps/desktop/src/renderer/store/index.ts`                   | useChatError / useClearChatError追加 |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`         | エラーバナーUI追加                   |
| `apps/desktop/src/renderer/store/slices/chatSlice.test.ts`   | テスト追加                           |
| `apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx` | テスト追加                           |

意図しないファイルが変更されている場合は調査する。

## 参照資料

| 資料名                   | パス                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| Phase 5 実装             | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-5-implementation.md` |
| Phase 8 リファクタリング | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-8-refactoring.md`    |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                                                      |
| Git ツーリングルール     | `.claude/rules/07-git-and-tooling.md`                                                                   |

## 実行手順

### Step 1: Lint 実行

```bash
pnpm --filter @repo/desktop lint
```

### Step 2: 型チェック実行

```bash
pnpm --filter @repo/desktop typecheck
```

### Step 3: テスト全実行

```bash
pnpm --filter @repo/desktop test
```

### Step 4: 変更ファイル確認

`git diff --stat` で変更ファイルが意図通りであることを確認する。

## 統合テスト連携

- `pnpm --filter @repo/desktop test` のほか、`chatSlice.test.ts` と `ChatView.test.tsx` の個別実行結果を品質証跡として残す。
- `WorkspaceView.test.tsx` や `WorkspaceChatPanel.runtime.test.tsx` のような Task 2〜4 由来の既存テストが落ちた場合は、Task 01 の変更が責務境界を越えていないかを優先確認する。

## 成果物

| 成果物                       | パス                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Phase 9 仕様書（本ファイル） | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-9-quality-assurance.md` |

## 完了条件

- [ ] `pnpm lint` がエラーなしで完了した
- [ ] `pnpm typecheck` がエラーなしで完了した
- [ ] `pnpm test` の全テストが PASS した
- [ ] `git diff --stat` で意図したファイルのみ変更されていることを確認した
- [ ] `any` 型の使用がないことを確認した
- [ ] `@ts-ignore` / `@ts-expect-error` を使用した場合は理由コメントが付いていることを確認した

## 次Phase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
