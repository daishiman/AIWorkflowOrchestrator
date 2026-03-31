# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Electron ビルドインフラを修正
  - root `postinstall` で `scripts/setup-native-modules.sh` を実行し、Electron コンテキストで `better-sqlite3` を検証する方式に統一
  - `apps/desktop` に `rebuild:electron` を追加し、workspace shared 配下の `better-sqlite3` を明示的に再構築可能にした
  - `electron-builder` の `afterPack` で配布物向けネイティブモジュール再構築を追加
  - `@repo/shared` の CJS 出力と preload bundle 側の取り込みを揃え、`@repo/shared` の runtime require 残留を解消

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
