# PR情報

## 基本情報

- PR番号: #1158
- PR URL: https://github.com/daishiman/AIWorkflowOrchestrator/pull/1158
- ベースブランチ: `main`
- 作業ブランチ: `task-20260311-skill-lifecycle-task-specs`
- PRタイトル: `feat: スキルライフサイクル一次導線と仕様同期を追加`

## 本文とコメント

- PR本文ソース: `outputs/phase-13/pr-body-draft.md`
- Phase 12 実装ガイド全文コメント: https://github.com/daishiman/AIWorkflowOrchestrator/pull/1158#issuecomment-4038065108
- 実装ガイド反映元: `outputs/phase-12/implementation-guide.md`

## スクリーンショット反映

- raw URL 固定 commit: `1f2d8fd639aa2998a53040bcaab97e6f59f1dc26`
- 反映対象: `TC-11-01` から `TC-11-06` の 6 枚
- 画像配置先: `outputs/phase-11/screenshots/*.png`

## 検証記録

- push 時 pre-push hook: lint / shared build / typecheck / tests PASS
- ユーザー申告の追加実行: `pnpm typecheck`, `pnpm lint`, `pnpm --filter @repo/shared build`, `pnpm --filter @repo/desktop build`, `pnpm test --testTimeout=900000`
- `gh api repos/daishiman/AIWorkflowOrchestrator/issues/1158/comments --paginate` で implementation-guide コメントの存在を確認済み
