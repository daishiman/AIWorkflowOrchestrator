# Schema Fixture Plan

## fixture 種別

- minimal: 2 phase / 2 resource / 2 entry / 2 exit の最小 fixture
- standard: current sample と同一
- downstream-ready: `phases`, `resources`, `hooks` を downstream に渡せる構造

## 実ファイル

- `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json`
- `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/resources/manifest-overview.md`
- `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/resources/cache-target.md`
- `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/resources/cache-target-v2.md`
