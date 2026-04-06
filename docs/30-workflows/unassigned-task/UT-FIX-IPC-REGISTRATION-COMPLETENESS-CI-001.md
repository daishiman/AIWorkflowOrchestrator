# UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001

## 概要

`ipcMain.handle()` の重複登録・未登録欠損を CI で自動検出するスナップショットテストを追加する。

## 背景

- TASK-FIX-IPC-SKILL-NAME-001（2026-04-06）で `registerRuntimeSkillCreatorHandlers()` に同一チャネルの 2 重登録バグを修正した。
- 修正前は 14 個のハンドラが未登録になっていたが、コードレビューのみに依存して検出されなかった。
- 全 `ipcMain.handle()` 登録数をスナップショットテストで CI に組み込むことで、同種の回帰を自動検出できる。

## 実行タスク

1. 全 IPC ハンドラ登録関数（`registerRuntimeSkillCreatorHandlers`・`registerAiHandlers` 等）を呼び出し、登録されたチャネル名の一覧をスナップショットとして保存するテストを作成する。
2. テストは各ハンドラ登録関数の呼び出し後に `ipcMain` に登録されたチャネル数・名称を検証する。
3. 既存 CI パイプラインに新規テストが組み込まれることを確認する。

## 完了条件

- `ipcMain.handle()` 登録チャネルのスナップショットテストが CI で実行される。
- 重複登録・欠損が発生した場合に CI が失敗する。
- 全テスト PASS。

## 由来

TASK-FIX-IPC-SKILL-NAME-001 Phase 12 / task-4-untasked-report.md UT-02（2026-04-06）
優先度: Medium
