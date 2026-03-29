# Phase 11: 発見された問題一覧

## タスク情報

- **タスクID**: TASK-UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001
- **実施日**: 2026-03-29

## 問題サマリ

| 重要度  | 件数 |
| ------- | ---- |
| BLOCKER | 0    |
| MAJOR   | 0    |
| MINOR   | 1    |

## BLOCKER 問題

なし

## MAJOR 問題

なし

## MINOR 問題

### MINOR-001: governance-bundle.test.ts の相対パスによる動的インポート

- **対象ファイル**: `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`
- **概要**: `@repo/shared/src/ipc/channels` の代わりに `../../../../../../../packages/shared/src/ipc/channels` という相対パスで動的インポートしている
- **原因**: vite バンドラーの解決制限により、テストファイル内で `@repo/shared` エイリアスが値インポートとして解決できない
- **影響**: 機能への影響なし。既知のワークアラウンドとして動作している
- **対処状況**: 現時点では問題なし。フォローアップタスクとして記録

## 推奨フォローアップ

- vite エイリアス設定の調査: テストファイルにおける `@repo/shared` の値インポートを vite alias 設定で解決できるか検討するフォローアップタスクを起票することを推奨
