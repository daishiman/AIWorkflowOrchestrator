# Phase 10 手動テスト入力

## preflight

1. `pnpm --filter @repo/desktop build`
2. `pnpm --filter @repo/desktop run screenshot:task-059b`
3. `phase11-capture-metadata.json` の `sourceKind=current-build-static-server` を確認

## 手動テスト対象

- TC-11-01: Source view
- TC-11-02: Markdown preview
- TC-11-03: HTML preview
- TC-11-04: QuickSearch open
- TC-11-05: QuickSearch select
- TC-11-06: QuickSearch close
- TC-11-07: read error
- TC-11-08: mobile overlay
- TC-11-09: UX terminology
- TC-11-10: modal visual spec
- TC-11-11: screenshot alignment
