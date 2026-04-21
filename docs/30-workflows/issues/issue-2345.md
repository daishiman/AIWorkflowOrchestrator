# [#2345] "[TASK-IPC-SNAPSHOT-WAVE3-001] TASK"

## メタ情報

```yaml
task_id: TASK-IPC-SNAPSHOT-WAVE3-001
task_name: TASK
category: -
target_feature: -
priority: LOW
scale: -
status: 未実施
source_phase: -
created_date: 2026-04-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/TASK-IPC-SNAPSHOT-WAVE3-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | LOW    |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 の Wave1（7件）・Wave2（16件）完了後の残課題。
Wave3 対象となる 25 件の direct handler についてスナップショット登録テストを導入し、
IPC handler の登録チャンネル一覧を CI で回帰保護する。

## 背景

TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 では Wave1 + Wave2 の計 23 ファイル（合計 121 テスト PASS）が完了した。
Wave3 の 25 件は技術的に実装可能だが、以下の理由で後続計画とした:

1. **環境安定化優先**: Wave1 + Wave2 実施時に `SIGKILL` 問題が発生したため、sequential + single-fork アプローチが定着するまでは一括拡張を避けた
2. **AC-006 スコープ内**: Wave3 は本タスクの受入条件 AC-006「将来の Wave3 計画化」の対象として正式に後続化が記録されている
3. **価値対コストのトレードオフ**: Wave1 + Wave2 で主要な high-risk チャンネルはカバー済みのため、Wave3 の優先度は LOW

## 推定作業内容

- [ ] Wave3 対象の 25 件 direct handler ファイルを `apps/desktop/src/main/ipc/` から特定する
- [ ] 既存の Wave1/Wave2 スナップショットテストパターン（`vi.hoisted` + `vi.mock("electron")` + `mockImplementation`）を踏襲してテストを作成する
- [ ] 各 handler ファイルに対応する `__tests__/__snapshots__/*.registrationSnapshot.test.ts.snap` を生成する
- [ ] `VITEST_MAX_FORKS=1` + `VITEST_FILE_PARALLELISM=false` の環境変数設定で SIGKILL を回避する
- [ ] CI でのスナップショット整合性確認を既存の Wave1/Wave2 と同様に設定する
- [ ] handler inventory（48 direct + 1 auxiliary の内訳）が Wave3 完了後も正確であることを確認する

## 完了条件

- [ ] Wave3 対象 25 件の direct handler すべてにスナップショットテストが存在する
- [ ] 全テストが `vitest run` で PASS する（環境変数設定込み）
- [ ] 新規スナップショットファイルが `__tests__/__snapshots__/` に生成されている
- [ ] TypeScript 型チェック PASS
- [ ] CI でのスナップショット回帰テストが正常動作する

## 苦戦箇所（TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 より）

### Vitest 環境でのメモリリソース制限（SIGKILL 問題）

- **困難だった理由**: 24 ファイル一括実行時に `SIGKILL` が発生。Electron main プロセス向けのテストでは esbuild バイナリパス指定が必須であり、複数 worker フォークが同時にバイナリを要求するとリソース競合が起きる
- **採った解決策**: `VITEST_MAX_FORKS=1 VITEST_FILE_PARALLELISM=false` の環境変数設定 + sequential 実行への切り替えで安定化
- **将来への知見**: Wave3 でも同様の設定が必要。テストファイル数が多い場合は Wave 分割（例: Wave3-A / Wave3-B）で実行コストを分散させると安全。esbuild バイナリパスは worktree 直後の `pnpm install` で解決できる

### vi.hoisted タイミングと ipcMain モックの安定化

- **困難だった理由**: `vi.spyOn(ipcMain, "handle")` を直接使うと vitest の hoisting タイミング問題でキャプチャが不安定になる
- **採った解決策**: `vi.hoisted(() => ({ mockIpcMainHandle: vi.fn() }))` + `vi.mock("electron", ...)` + `mockImplementation((ch) => { handles.push(ch) })` パターンを採用（FB-IPC-SNAP-001）
- **将来への知見**: Wave3 でも同パターンを踏襲する。`vi.spyOn` を `ipcMain` に直接適用する前提はずらすこと

## 関連

- 親タスク: TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
- 関連タスク: TASK-IPC-HANDLER-INVENTORY-AUTO-SYNC-001（handler 件数ドリフト防止）
- 関連タスク: TASK-IPC-VITEST-SIGKILL-MITIGATION-001（環境安定化）
- 関連ファイル:
  - `apps/desktop/src/main/ipc/` （Wave3 対象 handler ファイル群）
  - `apps/desktop/src/main/ipc/__tests__/__snapshots__/` （スナップショット格納先）
  - `apps/desktop/src/main/ipc/__tests__/` （テストファイル格納先）
