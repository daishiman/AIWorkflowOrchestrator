# Documentation Changelog

タスク ID: `TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001`
完了日: 2026-04-20
分類: `NON_VISUAL`

## この wave で更新したもの

### コード

- `packages/shared/src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts` 新規
- `packages/shared/src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts` 新規
- `packages/shared/src/services/embedding/late-chunking/index.ts` コメント追加・export 維持
- `packages/shared/src/services/chunking/chunking-service.ts` adapter 委譲化
- `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts` SEP-08 / SEP-09 追加

### タスク仕様・成果物

- `index.md` status を `completed` へ更新
- `phase-11-manual-test.md` を `ChunkingLateChunkingAdapter` と実コマンドへ同期
- `outputs/phase-11/manual-test-checklist.md` 新規
- `outputs/phase-11/evidence-collection.md` 新規
- `outputs/phase-11/discovered-issues.md` 新規
- `outputs/phase-11/manual-test-result.md` 新規
- `outputs/phase-12/implementation-guide.md` を 2 部構成 + NON_VISUAL 証跡参照へ更新
- `outputs/phase-12/system-spec-update-summary.md` を current fact へ更新
- `outputs/phase-12/skill-feedback-report.md` を current fact へ更新
- `outputs/phase-12/unassigned-task-detection.md` を current fact へ更新
- `outputs/phase-12/phase12-task-spec-compliance-check.md` を current fact へ更新
- `artifacts.json` / `outputs/artifacts.json` 新規

### 関連ドキュメント

- `docs/00-requirements/05-architecture.md` に Late Chunking 責務分離を追記
- `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md` の残課題から責務分離を削除
- `docs/30-workflows/unassigned-task/TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001.md` status を `実施済み` へ更新

### システム仕様正本

- `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` 再生成
- `.agents/skills/aiworkflow-requirements/*` mirror 同期

## 変更方針

- summary だけを直すのではなく、参照元仕様・成果物名・完了ステータスを揃えた
- NON_VISUAL 判定を維持しつつ、Phase 11 の canonical artifacts を補完した
