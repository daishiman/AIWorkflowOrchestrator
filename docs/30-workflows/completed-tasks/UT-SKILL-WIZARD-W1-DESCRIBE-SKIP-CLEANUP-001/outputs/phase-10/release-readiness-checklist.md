# 出荷準備チェックリスト

## タスクID: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001

- [x] AC-1: `skill-lifecycle-request-input` 参照削除確認（grep 0件）
- [x] AC-2: `describe.skip` 内含む全参照削除確認（grep 0件）
- [x] AC-3: 現行 UI 反映確認（コードレビュー）
- [x] AC-4: 本タスク起因の test:run 失敗 0件確認
- [x] AC-5: `typecheck` PASS 確認
- [x] Phase 1〜9 の全成果物が揃っている
- [x] ブロッカーが 0件

## 備考

- Pre-existing テスト失敗（TASK-RT-05 x2、U-20 x1）は本タスクとは無関係
- worktree 環境の esbuild バイナリバージョン不一致は pre-existing の環境問題

---

_作成日: 2026-04-11_
