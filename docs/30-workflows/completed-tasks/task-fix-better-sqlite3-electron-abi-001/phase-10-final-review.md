# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 10                                       |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 目的

全 Phase の成果物を横断的にレビューし、PR 作成に進める readiness を判断する。

## コードレビューチェックリスト

### 変更内容の確認

- [ ] 変更ファイルが `apps/desktop/package.json` の1ファイルのみであること
- [ ] 変更内容が `"postinstall": "pnpm rebuild:native"` の1行追加のみであること
- [ ] `rebuild:native` の直後に `postinstall` が配置されていること（関連スクリプトのグループ化）
- [ ] JSON の構文が正しく（カンマ区切り等）、`node -e "require('./apps/desktop/package.json')"` が成功すること

### 問題の解決確認

- [ ] AC-1: Electron 起動時に `NODE_MODULE_VERSION mismatch` / `ERR_DLOPEN_FAILED` が出ないこと（Phase 11 で確認）
- [ ] AC-2: DB 初期化が成功し、`conversation:list` が応答すること（Phase 11 で確認）
- [ ] AC-3: クリーン環境で `pnpm install` 後に手動 rebuild を要求しないこと（Phase 6/11 で確認）
- [ ] AC-4: 恒久手段（`postinstall` と `rebuild:native`）が git 管理されていること（Phase 5/9 で確認）

### 副作用・回帰リスクの確認

- [ ] `pnpm --filter @repo/desktop test:run` が全テストケース通過していること（Phase 9 で確認）
- [ ] `pnpm --filter @repo/desktop build` がビルド成功していること（Phase 9 で確認）
- [ ] 既存の `pnpm install` ワークフローが破壊されていないこと
- [ ] `postinstall` は冪等であり、副作用がないことが確認されていること（Phase 3 レビュー済み）

### ドキュメントの確認

- [ ] Phase 12 のドキュメント（CHANGELOG・再発防止策）が作成されていること
- [ ] Phase 12 の必須5成果物（implementation-guide / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report）が揃っていること

## リリース可否判断

### 判断基準

| 基準               | 状態                 | 詳細                                  |
| ------------------ | -------------------- | ------------------------------------- |
| 全 AC 達成         | 確認待ち（Phase 11） | AC-1/2 は Electron 手動起動で確認必要 |
| 品質チェック全通過 | 確認待ち（Phase 9）  | lint/typecheck/test/build             |
| 変更量最小         | PASS                 | 1ファイル1行の追加のみ                |
| 回帰リスク LOW     | PASS                 | Phase 3 レビュー済み                  |
| ドキュメント整備   | 確認待ち（Phase 12） | CHANGELOG・再発防止策                 |

### リリース判断: 保留

Phase 11（手動テスト）と Phase 12（ドキュメント）の完了後に最終判断する。

Phase 11 で Electron 起動ログ/IPC の観点（`NODE_MODULE_VERSION mismatch` 不在、`[DB] Conversation database initialized` 出力、`conversation:list` 応答）が全て確認されれば、**PR 作成に進めてよい** と判断する。

## 変更サマリー

| 項目               | 内容                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| 変更ファイル数     | 1                                                                          |
| 変更行数           | 1行追加                                                                    |
| 影響範囲           | `@repo/desktop` パッケージの `pnpm install` 時の動作                       |
| バックアウト難易度 | 極めて低い（1行削除で元に戻る）                                            |
| テスト追加         | `apps/desktop/src/__tests__/native/better-sqlite3-abi.test.ts`（新規作成） |

## 完了条件

- [ ] コードレビューチェックリストの全項目が確認されている
- [ ] AC-1〜AC-4 の達成状況が記録されている
- [ ] リリース可否判断が記録されている（Phase 11/12 完了後に更新）
- [ ] 変更サマリー（ファイル数・行数・影響範囲）が記録されている
