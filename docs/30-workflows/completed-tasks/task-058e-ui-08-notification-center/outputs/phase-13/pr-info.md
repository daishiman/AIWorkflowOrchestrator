# PR情報

- タイトル: `feat(notification): NotificationCenter再整備と仕様同期`
- ベース: `main`
- ヘッド: `task/task-058e-ui-08-notification-center-specs`
- 状態: `draft-pre-create`
- 実装ガイド: `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/phase-12/implementation-guide.md`
- スクリーンショット: `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/phase-11/screenshots/`

## 概要案

- NotificationCenter を `お知らせ` UX に再整備し、Portal / relative time / 個別削除 IPC / focus trap / responsive overlay を追加した。
- Phase 11 を screenshot 7件で再検証し、Apple UI/UX engineer 観点のレビューを完了した。
- system spec と skill docs を `.claude` 正本 / `.agents` mirror の両方で同期し、`main` 取り込み競合も解消した。

## テスト方針

ユーザー実行済みコマンドを Phase 13 の根拠として採用する。

- `pnpm typecheck`
- `pnpm lint`
- `pnpm --filter @repo/shared build`
- `pnpm --filter @repo/desktop build`
- `pnpm test --testTimeout=900000`

追加テストは未実施。
