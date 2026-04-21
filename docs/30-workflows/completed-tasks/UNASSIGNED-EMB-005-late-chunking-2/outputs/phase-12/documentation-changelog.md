# Documentation Changelog

## 2026-04-19

### 新規

- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md`
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/outputs/phase-10/final-review-result.md`
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/outputs/phase-11/UNASSIGNED-EMB-005-manual-test-report.md`
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/outputs/phase-12/system-spec-update-summary.md`
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/outputs/phase-12/skill-feedback-report.md`
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/outputs/phase-12/phase12-task-spec-compliance-check.md`

### 更新

- `packages/shared/src/services/chunking/chunking-service.ts`
  - セグメント重なりベースのプーリングへ改善
  - 文字位置から token 範囲への変換を追加
- `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`
  - 必須設定を明示
  - multi-chunk / multi-segment 回帰ケースを追加
