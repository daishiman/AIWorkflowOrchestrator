# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- `TASK-LOGS-ARCHIVE-POLICY-001`: LOGS.md アーカイブポリシーを文書化し、`aiworkflow-requirements` の `references/logs-archive-policy.md`、`topic-map.md`、`quick-reference.md`、`resource-map.md` に反映。月次 archive の canonical 配置先を `references/` に統一し、NON_VISUAL Phase 11/12 証跡も workflow 側で再同期。

### Fixed

- `electron.vite.config.ts` の preload セクションで `@repo/shared/src/ipc/channels` が `externalizeDepsPlugin` によって外部化され `window.electronAPI` が `undefined` になる問題を修正。
  `externalizeDepsPlugin({ exclude: ["@repo/shared"] })` と `resolve.alias` の組み合わせにより、`packages/shared/src/ipc/channels.ts` の内容が preload バンドルにインライン化されるようになった（TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001）。

- `better-sqlite3` の Electron ABI 不一致（Node.js ABI 127 vs Electron ABI 140）による起動時の `ERR_DLOPEN_FAILED` を修正。
  `apps/desktop/package.json` に `"postinstall": "pnpm rebuild:native"` を追加し、`pnpm install` 後に自動で native addon を Electron ABI 向けに再コンパイルするようにした。

### Added

- Slide output directory settings feature for presentation-slide-generator skill
  - Configure slide output directory from settings UI
  - OS standard directory selection dialog
  - Auto-create directory option
  - Settings persistence (survives app restart)
  - Secure IPC communication with sender validation
  - Path traversal attack prevention
  - Comprehensive test coverage (156 tests, 94.30% line coverage)
- `GraphSearchStrategy`: Knowledge Graph-based search strategy for HybridRAG system
  - Local search (entity-based): Find entities similar to the query
  - Global search (community summary-based): High-level topic summaries
  - Relationship search (path-based): Find connections between concepts
  - Full integration with HybridRAGSearcher
  - Configurable options: entityThreshold, traversalDepth, relationTypes
  - Comprehensive test coverage (69 tests, 94.54% line coverage)
