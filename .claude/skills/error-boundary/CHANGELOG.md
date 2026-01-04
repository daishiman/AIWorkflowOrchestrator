# Changelog

All notable changes to the error-boundary skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-31

### Added

- Created agents/ directory with Task specifications
  - `agents/error-boundary-implementation.md` - Error Boundary component implementation task
  - `agents/fallback-ui-design.md` - Fallback UI design task
  - `agents/error-monitoring-setup.md` - Error monitoring setup task
- Created EVALS.json for metrics tracking
- Created LOGS.md for usage history tracking
- Created CHANGELOG.md for version tracking
- Added Level3 and Level4 references to リソース/スクリプト参照 section

### Changed

- **BREAKING**: Updated SKILL.md to follow 18-skills.md specification
- **BREAKING**: Updated YAML frontmatter with improved Trigger section
- Updated Task仕様ナビ to reference agents/ task specifications
- Updated validate-skill.mjs to match new structure (references/ instead of resources/)
- Updated EVALS.json structure to match new specification

### Improved

- Enhanced description field with English trigger keywords for better discovery
- Added Task使用のタイミング guidance in Task仕様ナビ section
- Improved Progressive Disclosure by separating concerns into agents/

## [1.0.0] - 2025-12-24

### Added

- Initial skill creation
- Basic Error Boundary implementation patterns
- Fallback UI templates
- Error reporting mechanisms
- Recovery strategies documentation
- Level1-4 learning path files
