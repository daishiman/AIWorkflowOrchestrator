# 手動テストチェックリスト

## NON_VISUAL code task 用チェックリスト

### 事前確認

- [x] `outputs/phase-10/final-review-result.md` が存在する
- [x] `final-review-result.md` の blocker が 0 件

### code/spec walkthrough

- [x] `SkillCreatorService.ts` の `cleanupCancelledSkillDir` が `catch` ブロックで呼ばれていることを確認
- [x] `skillDirExistedBefore` が try ブロック前に取得されていることを確認
- [x] `finally` ブロックに cleanup コードがないことを確認（AbortController リセットのみ）
- [x] `createdByThisRun` フラグが使用されていないことを確認
- [x] spec 各ファイルの記述が実コード実態と一致することを確認

### regression evidence

- [x] `pnpm --filter @repo/desktop test -- SkillCreatorService` を実行
- [x] SC-CANCEL-001 PASS 確認
- [x] SC-CANCEL-002 PASS 確認
- [x] 全体 exit code 0 確認

### artifact parity

- [x] `artifacts.json` の artifact 名が canonical 一覧と一致
- [x] `outputs/artifacts.json` が `artifacts.json` と parity
- [x] Phase 1-12 の全 canonical artifact が `outputs/phase-*/` に作成済み

### Phase 11 完了確認

- [x] `manual-test-result.md` が一次ソースとして定義されている
- [x] `manual-test-checklist.md` が作成されている（本ファイル）
- [x] `discovered-issues.md` が作成されている
- [x] NON_VISUAL 代替証跡方針が明記されている
