# 手動テストチェックリスト

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 11                    |
| タスク | UT-IPC-HANDLER-CI-001 |

## Task 1: ローカルテスト実行

- [x] `pnpm --filter @repo/desktop test` の実行（`npx vitest run` で代替）
- [x] `registerRuntimeSkillCreatorHandlers` のスナップショットテストが実行される
- [x] 全テストが PASS する
- [x] スナップショットファイルが `__snapshots__/` 配下に存在する

## Task 2: 重複チャンネル追加テスト

- [x] 重複チャンネル追加後にテストが失敗する
- [x] エラーメッセージに件数・差分が含まれる
- [x] 元に戻した後にテストが全パスする

## Task 3: CI 確認

- [x] CI 自動実行の設計確認済み（既存ワークフローで対応）

## Task 4: 視覚証跡

- [x] `NON_VISUAL` 判定を `ui-sanity-visual-review.md` に記録
