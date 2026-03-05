# Phase 5 変更境界定義

## 許可変更

- `apps/desktop/src/main/ipc/skillHandlers.share.ts`
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.share.test.ts`
- `apps/desktop/src/preload/__tests__/skill-api.contract.test.ts`
- `apps/desktop/scripts/capture-task-043a-phase11-screenshots.mjs`
- `docs/30-workflows/task-043a-ipc-contract-and-security-alignment/outputs/phase-*`

## 禁止変更

- `skill:import` の公開引数シグネチャ変更
- 新規 IPC チャネル追加
- Phase13（コミット・PR）

## 関心分離

- SubAgent-A: 契約
- SubAgent-B: セキュリティ
- SubAgent-C: エラー
- SubAgent-D: テスト/品質
- SubAgent-E: 手動検証/文書同期
