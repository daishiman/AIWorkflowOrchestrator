# スキルフィードバックレポート

**タスクID**: TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001  
**完了日**: 2026-04-06

---

## ワークフロー改善点

改善提案なし。

本タスクは小規模な改善タスクとして仕様書通りに実行された。Phase 1〜3 の設計が完了しており、Phase 4〜12 の実行に際して重大なブロッカーは発生しなかった。

---

## 技術的教訓

### L-001: `vi.spyOn(facade, 'execute')` vs `executeMock`

- **教訓**: `skillExecutor.execute` をモック (`executeMock`) しても、`execute()` メソッド内で `SkillExecuteResult` に変換されるため、`errorResponse.error.message` が undefined になる
- **対策**: structured error パスのテストでは `vi.spyOn(facade, 'execute')` で `execute()` を直接モックし、`RuntimeSkillCreatorExecuteErrorResponse` を返すようにする
- **適用範囲**: executeAsync のエラーパスをテストする際の標準パターン

### L-002: `onWorkflowStateSnapshot` の複数呼び出し

- **教訓**: `workflowEngine.onPhaseChanged` と structured error パスの両方から `onWorkflowStateSnapshot` が呼ばれるため、`toHaveBeenCalledTimes(1)` は脆弱
- **対策**: `toHaveBeenCalledWith(...)` で特定引数の呼び出しを検証する方が robust
- **適用範囲**: onWorkflowStateSnapshot のコールバック検証テスト全般

### L-003: `snapshot ?? null` パターン

- **教訓**: `getWorkflowState()` は `SkillCreatorWorkflowUiSnapshot | undefined` を返す。型安全に `null` に変換するには `?? null` を使う
- **対策**: `|| null` ではなく `?? null` を使うことで falsy な値を誤変換しない

### L-004: IPC の第3引数は preload で明示的に通す

- **教訓**: Main 側で `webContents.send(channel, snapshot, errorMessage)` としても、preload の `safeOn` が 1 引数固定だと errorMessage は Renderer に届かない
- **対策**: multi-arg event は preload bridge を variadic 化し、Renderer 側 callback でも optional errorMessage を受け取る
- **適用範囲**: snapshot 以外のメタ情報を同一 IPC イベントで流したい場合の標準パターン

---

## スキル改善提案

改善提案なし。

`task-specification-creator` / `skill-creator` の Phase 4 テンプレートは適切に機能しており、改善点は特定されなかった。

---

## 新規 Pitfall 候補

### Pitfall候補: executeAsync のテストで executeMock を使う場合の注意

- **内容**: `skillExecutor.execute` をモックしても、`execute()` 内でレスポンスが変換されるため、structured error パスの `error.message` が undefined になることがある
- **対策**: structured error パスのテストは `vi.spyOn(facade, 'execute')` を使うこと
- **影響**: Phase 4 のテスト設計時に考慮が必要

### Pitfall候補: package-local lint script の不在

- **内容**: `apps/desktop/package.json` には `lint` script がないため、`pnpm --filter @repo/desktop lint` は実行できない
- **対策**: workspace ルートの `pnpm lint` を使うか、対象ファイルを `eslint` で直接実行する
- **影響**: 手動テスト手順を package 前提で書くと、再現コマンドが失われる

### Pitfall候補: vitest のファイル指定は直接実行が安定

- **内容**: `pnpm --filter @repo/desktop test -- --testPathPattern "..."` は、期待より広い範囲のテストを走らせることがあった
- **対策**: `pnpm --filter @repo/desktop exec vitest run <file>` のように、対象ファイルを明示する
- **影響**: focused な回帰確認の再現性が上がる

### Pitfall候補: preload の `safeOn` は tuple 化しないと多引数を落とす

- **内容**: callback 型を `(...rest: unknown[])` にしても、TypeScript の型整合性と実行時の意図は一致しないことがある
- **対策**: multi-arg event は `safeOn<T, R extends unknown[]>()` のように tuple で受け渡しの形を固定する
- **影響**: errorMessage のような補助情報が silent drop されるのを防げる
