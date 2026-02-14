# UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止修正

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| GitHub Issue | #815                              |
| 種別         | バグ修正 (fix)                    |
| 優先度       | 高                                |
| ステータス   | 実行中                            |
| 作成日       | 2026-02-14                        |
| 前提タスク   | なし                              |
| 関連Pitfall  | P5（リスナー二重登録）            |

## 概要

`app.on("activate")` イベント（macOS でドックアイコンクリック時）で `registerAllIpcHandlers()` が再実行され、`ipcMain.handle()` が同一チャンネルに2回目のハンドラ登録を試みて例外が発生する問題を修正する。

## Phase 一覧

| Phase | ファイル                         | 状態   | 説明                  |
| ----- | -------------------------------- | ------ | --------------------- |
| 1     | phase-1-requirements.md          | 未実行 | 要件定義              |
| 2     | phase-2-design.md                | 未実行 | 設計                  |
| 3     | phase-3-design-review.md         | 未実行 | 設計レビューゲート    |
| 4     | phase-4-test-creation.md         | 未実行 | テスト作成（TDD Red） |
| 5     | phase-5-implementation.md        | 未実行 | 実装（TDD Green）     |
| 6     | phase-6-test-expansion.md        | 未実行 | テスト拡充            |
| 7     | phase-7-coverage-verification.md | 未実行 | カバレッジ確認        |
| 8     | phase-8-refactoring.md           | 未実行 | リファクタリング      |
| 9     | phase-9-quality-assurance.md     | 未実行 | 品質保証              |
| 10    | phase-10-final-review.md         | 未実行 | 最終レビューゲート    |
| 11    | phase-11-manual-testing.md       | 未実行 | 手動テスト検証        |
| 12    | phase-12-documentation.md        | 未実行 | ドキュメント更新      |
| 13    | phase-13-pr-creation.md          | 未実行 | PR作成                |

## 修正対象ファイル

| ファイル                             | 修正内容                                               |
| ------------------------------------ | ------------------------------------------------------ |
| `apps/desktop/src/main/index.ts`     | `activate` イベントでの IPC ハンドラ再登録ロジック修正 |
| `apps/desktop/src/main/ipc/index.ts` | `unregisterAllIpcHandlers()` 関数の追加                |

## 受入基準

1. `app.on("activate")` でウィンドウ再作成時に IPC ハンドラが正常に登録される
2. 既存ハンドラが登録済みの場合、二重登録例外が発生しない
3. macOS ドックアイコンクリックでアプリが正常に復帰する
4. ウィンドウが存在する場合は不要な再登録が発生しない

## 参照情報

| 種別             | パス                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| エラー発生箇所   | `apps/desktop/src/main/index.ts:277`                                          |
| IPC 登録関数     | `apps/desktop/src/main/ipc/index.ts:63-70`                                    |
| ファイルハンドラ | `apps/desktop/src/main/ipc/fileHandlers.ts`                                   |
| 関連Pitfall      | `.claude/rules/06-known-pitfalls.md` P5（リスナー二重登録）                   |
| 元タスク仕様書   | `docs/30-workflows/completed-tasks/task-ut-fix-ipc-handler-double-reg-001.md` |
