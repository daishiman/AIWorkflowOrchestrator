# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `GraphSearchStrategy`: Knowledge Graph-based search strategy for HybridRAG system
  - Local search (entity-based): Find entities similar to the query
  - Global search (community summary-based): High-level topic summaries
  - Relationship search (path-based): Find connections between concepts
  - Full integration with HybridRAGSearcher
  - Configurable options: entityThreshold, traversalDepth, relationTypes
  - Comprehensive test coverage (69 tests, 94.54% line coverage)
